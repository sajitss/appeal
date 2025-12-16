from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from patients.models import Caregiver, Child
from clinical.models import Encounter

User = get_user_model()

class CaregiverLoginView(APIView):
    """
    Simplified login for Caregivers using Phone Number + Child ID.
    In a real app, this would use OTP. For prototype, direct match is used.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = request.data.get('phone_number')
        child_id = request.data.get('unique_child_id')

        if not phone or not child_id:
            return Response({'error': 'Please provide both phone number and Child ID'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Find the Child
        try:
            child = Child.objects.get(unique_child_id=child_id)
        except Child.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        # 2. Verify Caregiver Phone
        # Currently Child has a 'caregiver' FK.
        if not child.caregiver or child.caregiver.phone_number != phone:
             return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        # 3. Authenticate/Session
        # For this prototype, we will return the Child/Caregiver details directly
        # effectively "logging in" without a User object if we want to skip creating Django Users for every parent.
        # OR we can return a temporary session token. 
        # Let's return the simplified Caregiver Object ID to store in Frontend.
        
        return Response({
            'message': 'Login successful',
            'caregiver_id': child.caregiver.id,
            'caregiver_name': f"{child.caregiver.first_name} {child.caregiver.last_name}",
            'primary_child_id': child.id 
        })

class CaregiverDashboardView(APIView):
    """
    Returns list of children for a specific caregiver.
    """
    permission_classes = [permissions.AllowAny] # We rely on caregiver_id passed in query/body for prototype simplicity

    def get(self, request):
        caregiver_id = request.query_params.get('caregiver_id')
        if not caregiver_id:
            return Response({'error': 'Caregiver ID required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            caregiver = Caregiver.objects.get(id=caregiver_id)
        except Caregiver.DoesNotExist:
             return Response({'error': 'Caregiver not found'}, status=status.HTTP_404_NOT_FOUND)

        children = caregiver.children.all()
        data = []
        for child in children:
            # Calculate simple status
            # Calculate age for logic
            import datetime
            today = datetime.date.today()
            age_days = (today - child.date_of_birth).days
            age_months = int(age_days / 30)

            # Check for overdue milestones
            # Overdue = expected_age <= current_age, and NOT completed
            overdue_count = child.milestones.filter(
                is_completed=False,
                template__expected_age_months__lte=age_months
            ).count()

            if child.is_at_risk:
                status = 'red'
                status_text = 'Doctor review ongoing'
            elif overdue_count > 0:
                 status = 'amber'
                 status_text = 'Screening pending'
            else:
                 status = 'green'
                 status_text = 'None pending'
            
            # Calculate age logic
            # < 24 months -> X months
            # >= 24 months -> Y years
            if age_months < 24:
                age_str = f"{age_months} months"
            else:
                years = age_months // 12
                remainder_months = age_months % 12
                if remainder_months > 0:
                    age_str = f"{years} yrs {remainder_months} mo"
                else:
                    age_str = f"{years} years"

            data.append({
                'id': child.id,
                'name': child.first_name,
                'age': age_str, 
                'status': status,
                'status_indicator': status_text,
                'avatar_url': '' # Placeholder
            })

        return Response({'children': data, 'greeting': f"Hello, {caregiver.first_name}"})

class ChildTimelineView(APIView):
    """
    Returns timeline data for a specific child.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, child_id):
        try:
            child = Child.objects.get(id=child_id)
        except Child.DoesNotExist:
            return Response({'error': 'Child not found'}, status=status.HTTP_404_NOT_FOUND)

        # Get encounters
        encounters = child.encounters.all().order_by('-encounter_date')
        timeline = []
        
        import datetime # Move import up

        # 1. Add "Registered" event
        timeline.append({
            'type': 'milestone',
            'title': 'Joined APPEAL',
            'date': child.enrollment_date,
            'icon': '👋',
            'description': 'Registration complete'
        })

        # 2. Add Encounters
        for enc in encounters:
            title = "Check-up"
            icon = "👩‍⚕️"
            if enc.encounter_type == 'HOME_VISIT':
                title = "Home Visit"
            
            # Check for screening results to add detail
            results_count = enc.screenings.count()
            desc = f"{results_count} checks performed"

            timeline.append({
                'type': 'encounter',
                'title': title,
                'date': enc.encounter_date,
                'icon': icon,
                'description': desc
            })

        # 3. Add Completed Milestones to Timeline
        # Include COMPLETED, SUBMITTED, and AI_REVIEWED
        # Basically anything with Status != PENDING (or where evidence exists)
        # Using status field now.
        timeline_milestones = child.milestones.exclude(status='PENDING')
        
        for cm in timeline_milestones:
            evidence_url = None
            if cm.evidence:
                evidence_url = request.build_absolute_uri(cm.evidence.url)

            # Determine visual state based on status
            if cm.status == 'COMPLETED':
                title = f"Achieved: {cm.template.title}"
                icon = '🏆'
                desc = f"Milestone completed at {cm.template.expected_age_months} months"
            elif cm.status == 'REJECTED':
                title = f"Needs Retry: {cm.template.title}"
                icon = '⚠️'
                desc = "Video quality issues. Please try again."
            else: # SUBMITTED or AI_REVIEWED
                title = f"In Review: {cm.template.title}"
                icon = '⏳'
                state = 'AI Analyzing...' if cm.status == 'SUBMITTED' else 'Dr. Reviewing...'
                desc = f"Status: {state}"

            timeline.append({
                'type': 'milestone_won',
                'title': title,
                'date': cm.completion_date if cm.completion_date else datetime.date.today(), # Use today for pending reviews
                'icon': icon,
                'description': desc,
                'evidence_url': evidence_url,
                'status': cm.status
            })
            
        # Sort by date descending
        # Ensure dates are comparable (datetime vs date)
        # Helper to convert date to datetime
        import datetime
        def normalize_date(d):
             if isinstance(d, datetime.datetime):
                 return d.date()
             return d

        timeline.sort(key=lambda x: normalize_date(x['date']), reverse=True)

        # 3. Get Gamified Milestones
        # Logic: 
        # - Won: is_completed = True
        # - Active: is_completed = False, but age >= expected_age
        # - Locked: age < expected_age
        
        # Calculate child age in months (approx)
        import datetime
        today = datetime.date.today()
        age_days = (today - child.date_of_birth).days
        age_months = int(age_days / 30)

        milestones_data = []
        child_milestones = child.milestones.select_related('template').order_by('template__expected_age_months')
        
        for cm in child_milestones:
            t = cm.template
            state = 'LOCKED'
            
            # State Logic
            if cm.status == 'COMPLETED':
                state = 'WON'
            elif cm.status in ['SUBMITTED', 'AI_REVIEWED']:
                state = 'REVIEW'
            elif cm.status == 'REJECTED':
                state = 'ACTIVE' # Retry
            elif age_months >= t.expected_age_months:
                state = 'ACTIVE'
            
            milestones_data.append({
                'id': cm.id,
                'title': t.title,
                'description': t.description,
                'state': state,
                'expected_age': f"{t.expected_age_months} months"
            })


        # 4. Determine Pending Actions based on Active Milestones
        # Find ALL 'ACTIVE' milestones
        active_milestones = [m for m in milestones_data if m['state'] == 'ACTIVE']
        
        pending_actions = []
        
        if active_milestones:
            for active in active_milestones:
                pending_actions.append({
                    'type': 'video',
                    'title': f"Verify '{active['title']}'",
                    'description': f"Is {child.first_name} {active['description'].lower()}? Record a video for AI analysis.",
                    'action_label': 'Start Recording',
                    'milestone_id': active['id']
                })
        else:
            # Fallback if no active milestones
            pending_actions.append({
                'type': 'generic',
                'title': 'All Caught Up!',
                'description': f"{child.first_name} is doing great. No pending actions.",
                'action_label': 'View History'
            })

        return Response({
            'child': {
                'id': child.id,
                'name': child.first_name,
                'age': f"{age_months} months" if age_months < 24 else f"{age_months // 12} yrs {age_months % 12} mo",
                'birth_date': child.date_of_birth,
                'status': 'green' if not child.is_at_risk else 'red'
            },
            'timeline': timeline,
            'milestones': milestones_data,
            'pending_actions': pending_actions
        })
