import os
import sys
import django

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'appeal_backend.settings')
django.setup()

from clinical.models import MilestoneTemplate

translations = {
    "New Born": {
        "title": "नवजात",
        "description": "बच्चा रोशनी और आवाज़ पर प्रतिक्रिया करता है।",
        "desc_en": "Baby reacts to light and sound.",
        "kn": { "title": "ನವಜಾತ ಶಿಶು", "desc": "ಮಗು ಬೆಳಕು ಮತ್ತು ಶಬ್ದಕ್ಕೆ ಪ್ರತಿಕ್ರಿಯಿಸುತ್ತದೆ." }
    },
    "Social Smile": {
        "title": "सामाजिक मुस्कान",
        "description": "बच्चा देखकर मुस्कुराता है।",
        "desc_en": "Baby smiles when looking at people.",
        "kn": { "title": "ಸಾಮಾಜಿಕ ನಗು", "desc": "ಜನರನ್ನು ನೋಡಿದಾಗ ಮಗು ನಗುತ್ತದೆ." }
    },
    "Babbling": {
        "title": "बड़बड़ाना",
        "description": "बच्चा 'बा-बा', 'दा-दा' जैसी आवाज़ें निकालता है।",
        "desc_en": "Baby makes sounds like 'ba-ba', 'da-da'.",
        "kn": { "title": "ಬಡಬಡಿಸುವುದು", "desc": "ಮಗು 'ಬಾ-ಬಾ', 'ದಾ-ದಾ' ಎಂದು ಶಬ್ದ ಮಾಡುತ್ತದೆ." }
    },
    "Sitting With Support": {
        "title": "सहारे के साथ बैठना",
        "description": "बच्चा सहारे के साथ बैठ सकता है।",
        "desc_en": "Baby can sit with support.",
        "kn": { "title": "ಬೆಂಬಲದೊಂದಿಗೆ ಕುಳಿತುಕೊಳ್ಳುವುದು", "desc": "ಮಗು ಬೆಂಬಲದೊಂದಿಗೆ ಕುಳಿತುಕೊಳ್ಳಬಹುದು." }
    },
     "Sitting Independent": {
        "title": "बिना सहारे बैठना",
        "description": "बच्चा बिना किसी सहारे के बैठ सकता है।",
        "desc_en": "Baby can sit without support.",
        "kn": { "title": "ಸ್ವತಂತ್ರವಾಗಿ ಕುಳಿತುಕೊಳ್ಳುವುದು", "desc": "ಮಗು ಯಾವುದೇ ಬೆಂಬಲವಿಲ್ಲದೆ ಕುಳಿತುಕೊಳ್ಳಬಹುದು." }
    },
    "Crawling": {
        "title": "घुटनों के बल चलना",
        "description": "बच्चा घुटनों के बल चलता है।",
        "desc_en": "Baby crawls on hands and knees.",
        "kn": { "title": "ತೆವಳುವುದು", "desc": "ಮಗು ಕೈ ಮತ್ತು ಮೊಣಕಾಲುಗಳ ಮೇಲೆ ತೆವಳುತ್ತದೆ." }
    },
    "Standing With Support": {
        "title": "सहारे के साथ खड़े होना",
        "description": "बच्चा फर्नीचर पकड़कर खड़ा हो सकता है।",
        "desc_en": "Baby can stand holding onto furniture.",
        "kn": { "title": "ಬೆಂಬಲದೊಂದಿಗೆ ನಿಲ್ಲುವುದು", "desc": "ಪೀಠೋಪಕರಣಗಳನ್ನು ಹಿಡಿದುಕೊಂಡು ಮಗು ನಿಲ್ಲಬಹುದು." }
    },
    "Walking": {
        "title": "चलना",
        "description": "बच्चा स्वतंत्र रूप से चलता है।",
        "desc_en": "Baby walks independently.",
        "kn": { "title": "ನಡೆಯುವುದು", "desc": "ಮಗು ಸ್ವತಂತ್ರವಾಗಿ ನಡೆಯುತ್ತದೆ." }
    },
}

def run():
    print("Starting translation population...")
    count = 0
    restore_map = {
        0: "New Born",
        2: "Social Smile",
        4: "Babbling",
        6: "Sitting Independent", # or Sitting With Support
        9: "Standing With Support",
        12: "Walking"
    }
    
    # Prune duplicates? No, just update.
    for m in MilestoneTemplate.objects.all():
        original_title = m.title
        
        # Restore if empty
        if not original_title or original_title == '':
            if m.expected_age_months in restore_map:
                restored = restore_map[m.expected_age_months]
                print(f"Restoring empty title for {m.expected_age_months}m -> {restored}")
                m.title = restored
                m.title_en = restored
                original_title = restored
            else:
                # Fallback
                m.title = f"Milestone {m.expected_age_months}m"
                m.title_en = m.title
                original_title = m.title

        # Now translate
        key = None
        for k in translations:
            if k.lower() in original_title.lower():
                key = k
                break
        
        if key:
            data = translations[key]
            m.title_hi = data['title']
            m.description_hi = data['description']
            m.title_en = original_title # Ensure active lang is populated
            
            # FORCE update description_en to ensure it is English
            m.description_en = data.get('desc_en', m.description) 

            # Update Kannada
            if 'kn' in data:
                 m.title_kn = data['kn']['title']
                 m.description_kn = data['kn']['desc']
                
            m.save()
            print(f"Updated: {m.title} -> Hi: {m.title_hi} | Kn: {m.title_kn}")
            count += 1
        else:
             print(f"Skipping translation for: {original_title} (No match found)")
             m.title_hi = original_title
             m.save()

    print(f"Finished. Updated {count} milestones.")

if __name__ == "__main__":
    run()
