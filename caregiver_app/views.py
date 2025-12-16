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
            # Logic: Red if 'is_at_risk', Amber if no encounter in 30 days, else Green
            status = 'green'
            status_text = 'All checks up to date'
            
            if child.is_at_risk:
                status = 'red'
                status_text = 'Doctor review ongoing'
            elif not child.encounters.exists():
                 status = 'amber'
                 status_text = 'Screening pending'
            
            # Calculate age (rough)
            # ... simple string for now
            age_str = "1 year" 

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

        # Sort by date descending
        timeline.sort(key=lambda x: x['date'], reverse=True)

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
            if cm.is_completed:
                state = 'WON'
            elif age_months >= t.expected_age_months:
                state = 'ACTIVE'
            
            milestones_data.append({
                'id': t.id,
                'title': t.title,
                'description': t.description,
                'state': state,
                'expected_age': f"{t.expected_age_months} months"
            })


        # 4. Determine Next Action based on Active Milestones
        # Find the first 'ACTIVE' milestone
        active_milestone = next((m for m in milestones_data if m['state'] == 'ACTIVE'), None)
        
        next_action_data = None
        if active_milestone:
            next_action_data = {
                'type': 'video',
                'title': f"Verify '{active_milestone['title']}'",
                'description': f"Is {child.first_name} {active_milestone['description'].lower()}? Record a video for AI analysis.",
                'action_label': 'Start Recording',
                'milestone_id': active_milestone['id']
            }
        else:
            # Fallback if no active milestones (e.g. all future locked or all past won)
            # Could check for next locked one, or generic
            next_action_data = {
                'type': 'generic',
                'title': 'All Caught Up!',
                'description': f"{child.first_name} is doing great. No pending actions.",
                'action_label': 'View History'
            }

        return Response({
            'child': {
                'id': child.id,
                'name': child.first_name,
                'age': f"{age_months} months",
                'status': 'green' if not child.is_at_risk else 'red'
            },
            'timeline': timeline,
            'milestones': milestones_data,
            'next_action': next_action_data
        })
