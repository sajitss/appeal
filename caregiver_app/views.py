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
    authentication_classes = [] # Bypass Session/CSRF checks for login

    def post(self, request):
        try:
            print(f"DEBUG: Login Attempt. Data: {request.data}") # Debug Log

            raw_phone = request.data.get('phone_number', '')
            # Sanitize Phone: Keep only digits
            phone = ''.join(filter(str.isdigit, str(raw_phone)))
            
            password = request.data.get('password', '').strip()

            print(f"DEBUG: Sanitized Phone: '{phone}', Password: '{password}'")

            if not phone or not password:
                 return Response({'error': 'Please provide mobile number and password'}, status=status.HTTP_400_BAD_REQUEST)

            # 1. Hardcoded Password Check (Case Insensitive)
            if password.lower() != 'appeal':
                 print("DEBUG: Password mismatch")
                 return Response({'error': 'Invalid password'}, status=status.HTTP_401_UNAUTHORIZED)
            
            print("DEBUG: Password OK. Checking DB...")

            # 2. Find or Create Caregiver
            caregiver, created = Caregiver.objects.get_or_create(
                phone_number=phone,
                defaults={
                    'first_name': 'Parent', 
                    'last_name': '',
                    'relationship': 'GUARDIAN'
                }
            )

            # 3. Find Primary Child (if any)
            # Just pick the first one for now
            child = caregiver.children.first()
            primary_child_id = child.id if child else None
            
            return Response({
                'message': 'Login successful',
                'caregiver_id': caregiver.id,
                'caregiver_name': f"{caregiver.first_name} {caregiver.last_name}",
                'primary_child_id': primary_child_id 
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': f"Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CaregiverDashboardView(APIView):
    """
    Returns list of children for a specific caregiver's FAMILY.
    """
    permission_classes = [permissions.AllowAny] 

    def get(self, request):
        caregiver_id = request.query_params.get('caregiver_id')
        if not caregiver_id:
            return Response({'error': 'Caregiver ID required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            caregiver = Caregiver.objects.get(id=caregiver_id)
        except Caregiver.DoesNotExist:
             return Response({'error': 'Caregiver not found'}, status=status.HTTP_404_NOT_FOUND)

        # Helper for static strings (manual translation)
        from django.utils.translation import get_language
        lang = get_language()
        is_hindi = lang and lang.startswith('hi')
        is_kannada = lang and lang.startswith('kn')

        strings = {
            'months': "ತಿಂಗಳುಗಳು" if is_kannada else ("महीने" if is_hindi else "months"),
            'years': "ವರ್ಷಗಳು" if is_kannada else ("साल" if is_hindi else "years"),
            'yrs': "ವರ್ಷ" if is_kannada else ("साल" if is_hindi else "yrs"),
            'mo': "ತಿಂಗಳು" if is_kannada else ("महीने" if is_hindi else "mo"),
            'tasks_pending': "ಕಾರ್ಯಗಳು ಬಾಕಿ ಇವೆ" if is_kannada else ("कार्य लंबित" if is_hindi else "tasks pending"),
            'in_review': "ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ" if is_kannada else ("समीक्षा में" if is_hindi else "In Review"),
            'none_pending': "ಯಾವುದೂ ಬಾಕಿ ಇಲ್ಲ" if is_kannada else ("कोई लंबित नहीं" if is_hindi else "None pending"),
            'doctor_review': "ವೈದ್ಯರ ಪರಿಶೀಲನೆ ನಡೆಯುತ್ತಿದೆ" if is_kannada else ("डॉक्टर समीक्षा जारी" if is_hindi else "Doctor review ongoing"),
            'hello': "ನಮಸ್ಕಾರ" if is_kannada else ("नमस्ते" if is_hindi else "Hello"),
        }

        # FETCH CHILDREN FROM FAMILY
        if caregiver.family:
            children = Child.objects.filter(family=caregiver.family)
        else:
             # Fallback for legacy/unmigrated data
            children = caregiver.children.all()

        data = []
        for child in children:
            # Calculate simple status
            # Calculate age for logic
            import datetime
            today = datetime.date.today()
            age_days = (today - child.date_of_birth).days
            age_months = int(age_days / 30)

            # Check for active/pending milestones (Match TimelineView logic with +1 buffer)
            cutoff_age = age_months + 1
            
            # 1. Actionable (User needs to do something)
            # Status is PENDING or REJECTED, and age is within range
            actionable_count = child.milestones.filter(
                status__in=['PENDING', 'REJECTED'],
                template__expected_age_months__lte=cutoff_age
            ).count()

            # 2. In Review (System needs to do something)
            review_count = child.milestones.filter(
                status__in=['SUBMITTED', 'AI_REVIEWED']
            ).count()

            if child.is_at_risk:
                status = 'red'
                status_text = strings['doctor_review']
            elif actionable_count > 0:
                 status = 'amber'
                 status_text = f'{actionable_count} {strings["tasks_pending"]}'
            elif review_count > 0:
                 status = 'blue' 
                 status_text = strings['in_review']
            else:
                 status = 'green'
                 status_text = strings['none_pending']
            
            # Calculate age logic
            # < 24 months -> X months
            # >= 24 months -> Y years
            if age_months < 24:
                age_str = f"{age_months} {strings['months']}"
            else:
                years = age_months // 12
                remainder_months = age_months % 12
                if remainder_months > 0:
                    age_str = f"{years} {strings['yrs']} {remainder_months} {strings['mo']}"
                else:
                    age_str = f"{years} {strings['years']}"

            data.append({
                'id': child.id,
                'name': child.first_name,
                'age': age_str, 
                'status': status,
                'status_indicator': status_text,
                'avatar_url': '' # Placeholder
            })

        return Response({'children': data, 'greeting': f"{strings['hello']}, {caregiver.first_name}"})

class AddFamilyMemberView(APIView):
    """
    Adds a new member to the caregiver's family.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        inviter_id = request.data.get('caregiver_id')
        new_phone = request.data.get('phone_number')
        new_name = request.data.get('first_name', 'Family Member')
        relationship = request.data.get('relationship', 'GUARDIAN')

        if not inviter_id or not new_phone:
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            inviter = Caregiver.objects.get(id=inviter_id)
        except Caregiver.DoesNotExist:
            return Response({'error': 'Inviter not found'}, status=status.HTTP_404_NOT_FOUND)

        if not inviter.family:
            # Should not happen if migration ran, but handle just in case
            from patients.models import Family
            inviter.family = Family.objects.create(name=f"{inviter.first_name}'s Family")
            inviter.save()

        # Check if user already exists
        member, created = Caregiver.objects.get_or_create(
            phone_number=new_phone,
            defaults={
                'first_name': new_name,
                'last_name': '',
                'relationship': relationship,
                'family': inviter.family
            }
        )

        if not created:
            # Retrieve existing user and link to family
            # Note: This simply moves them to this family. In a real app, might need confirmation.
            member.family = inviter.family
            member.save()

        return Response({
            'message': 'Member added successfully',
            'member_id': member.id,
            'family_id': inviter.family.id
        })

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

        # Helper for static strings (since we can't compile .mo files easily in this env)
        from django.utils.translation import get_language
        lang = get_language()
        
        is_hindi = lang and lang.startswith('hi')
        is_kannada = lang and lang.startswith('kn')
        
        strings = {
            'joined': "APPEAL ಸೇರಿದರು" if is_kannada else ("APPEAL में शामिल हुए" if is_hindi else "Joined APPEAL"),
            'reg_complete': "ನೋಂದಣಿ ಪೂರ್ಣಗೊಂಡಿದೆ" if is_kannada else ("सत्यापन पूर्ण" if is_hindi else "Registration complete"),
            'checkup': "ತಪಾಸಣೆ" if is_kannada else ("जांच" if is_hindi else "Check-up"),
            'home_visit': "ಮನೆ ಭೇಟಿ" if is_kannada else ("गृह भेंट" if is_hindi else "Home Visit"),
            'checks_performed': "ತಪಾಸಣೆ ಮಾಡಲಾಗಿದೆ" if is_kannada else ("जांच की गई" if is_hindi else "checks performed"),
            'achieved': "ಸಾಧಿಸಲಾಗಿದೆ: " if is_kannada else ("प्राप्त किया: " if is_hindi else "Achieved: "),
            'milestone_comp': "ಮೈಲಿಗಲ್ಲು ಪೂರ್ಣಗೊಂಡಿದೆ" if is_kannada else ("महीने में मील का पत्थर पूरा हुआ" if is_hindi else "Milestone completed at"),
            'months': "ತಿಂಗಳುಗಳು" if is_kannada else ("महीने" if is_hindi else "months"),
            'needs_retry': "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ: " if is_kannada else ("पुनः प्रयास करें: " if is_hindi else "Needs Retry: "),
            'retry_desc': "ವೀಡಿಯೊ ಗುಣಮಟ್ಟದ ಸಮಸ್ಯೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ." if is_kannada else ("वीडियो की गुणवत्ता में समस्या। कृपया पुन: प्रयास करें।" if is_hindi else "Video quality issues. Please try again."),
            'in_review': "ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ: " if is_kannada else ("समीक्षा में: " if is_hindi else "In Review: "),
            'ai_analyzing': "AI ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ..." if is_kannada else ("एआई विश्लेषण कर रहा है..." if is_hindi else "AI Analyzing..."),
            'dr_reviewing': "ವೈದ್ಯರು ಪರಿಶೀಲಿಸುತ್ತಿದ್ದಾರೆ..." if is_kannada else ("डॉक्टर समीक्षा कर रहे हैं..." if is_hindi else "Dr. Reviewing..."),
            'verify': "ಪರಿಶೀಲಿಸಿ" if is_kannada else ("सत्यापित करें" if is_hindi else "Verify"),
            'is_child': "ಏನು" if is_kannada else ("क्या" if is_hindi else "Check if"),
            'action_desc': "ಹಾಗೆ ವರ್ತಿಸುತ್ತಿದೆಯೇ? AI ವಿಶ್ಲೇಷಣೆಗಾಗಿ ವೀಡಿಯೊ ರೆಕಾರ್ಡ್ ಮಾಡಿ." if is_kannada else ("जैसा व्यवहार कर रहा है? एआई विश्लेषण के लिए एक वीडियो रिकॉर्ड करें।" if is_hindi else ". Record a video for AI analysis."),
            'caught_up': "ಎಲ್ಲವೂ ಮುಗಿದಿದೆ!" if is_kannada else ("सब ठीक है!" if is_hindi else "All Caught Up!"),
            'doing_great': "ಅತ್ಯುತ್ತಮವಾಗಿದೆ. ಯಾವುದೇ ಬಾಕಿ ಇಲ್ಲ." if is_kannada else ("बहुत अच्छा कर रहा है। कोई लंबित कार्य नहीं।" if is_hindi else "is doing great. No pending actions."),
            'view_history': "ಇತಿಹಾಸ ವೀಕ್ಷಿಸಿ" if is_kannada else ("इतिहास देखें" if is_hindi else "View History"),
            'start_recording': "ರೆಕಾರ್ಡಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ" if is_kannada else ("रिकॉर्डिंग शुरू करें" if is_hindi else "Start Recording"),
        }

        # 1. Add "Registered" event
        timeline.append({
            'type': 'milestone',
            'title': strings['joined'],
            'date': child.enrollment_date,
            'icon': '👋',
            'description': strings['reg_complete']
        })

        # 2. Add Encounters
        for enc in encounters:
            title = strings['checkup']
            icon = "👩‍⚕️"
            if enc.encounter_type == 'HOME_VISIT':
                title = strings['home_visit']
            
            # Check for screening results to add detail
            results_count = enc.screenings.count()
            desc = f"{results_count} {strings['checks_performed']}"

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
                title = f"{strings['achieved']}{cm.template.title}"
                icon = '🏆'
                desc = f"{strings['milestone_comp']} {cm.template.expected_age_months} {strings['months']}" if (is_hindi or is_kannada) else f"Milestone completed at {cm.template.expected_age_months} months"
            elif cm.status == 'REJECTED':
                title = f"{strings['needs_retry']}{cm.template.title}"
                icon = '⚠️'
                desc = strings['retry_desc']
            else: # SUBMITTED or AI_REVIEWED
                title = f"{strings['in_review']}{cm.template.title}"
                icon = '⏳'
                state = strings['ai_analyzing'] if cm.status == 'SUBMITTED' else strings['dr_reviewing']
                desc = f"Status: {state}"

            timeline.append({
                'id': cm.id,
                'type': 'milestone_won',
                'title': title,
                'date': cm.completion_date if cm.completion_date else datetime.date.today(), # Use today for pending reviews
                'icon': icon,
                'description': desc,
                'evidence_url': evidence_url,
                'status': cm.status
            })
            
        # Sort by date descending
        # ... (Sorting logic remains same) ...
        # Helper to convert date to datetime
        import datetime
        def normalize_date(d):
             if isinstance(d, datetime.datetime):
                 return d.date()
             return d

        timeline.sort(key=lambda x: normalize_date(x['date']), reverse=True)

        # 3. Get Gamified Milestones
        # ... (Logic remains same) ...
        
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
                'expected_age': f"{t.expected_age_months} {strings['months']}"
            })


        # 4. Determine Pending Actions based on Active Milestones
        # Find ALL 'ACTIVE' milestones
        active_milestones = [m for m in milestones_data if m['state'] == 'ACTIVE']
        
        pending_actions = []
        
        if active_milestones:
            for active in active_milestones:
                # Construct description carefully
                desc_text = f"{strings['is_child']} {child.first_name} {active['description'].lower() if not (is_hindi or is_kannada) else active['description']} {strings['action_desc']}"
                
                pending_actions.append({
                    'type': 'video',
                    'title': f"{strings['verify']} '{active['title']}'",
                    'description': desc_text,
                    'action_label': strings['start_recording'],
                    'milestone_id': active['id']
                })
        else:
            # Fallback if no active milestones
            pending_actions.append({
                'type': 'generic',
                'title': strings['caught_up'],
                'description': f"{child.first_name} {strings['doing_great']}",
                'action_label': strings['view_history']
            })

        return Response({
            'child': {
                'id': child.id,
                'name': child.first_name,
                'age': f"{age_months} {strings['months']}" if age_months < 24 else f"{age_months // 12} yrs {age_months % 12} mo",
                'birth_date': child.date_of_birth,
                'status': 'green' if not child.is_at_risk else 'red'
            },
            'timeline': timeline,
            'milestones': milestones_data,
            'pending_actions': pending_actions
        })
