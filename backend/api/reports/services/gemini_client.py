import os
import base64
import json
import google.generativeai as genai
from dotenv import load_dotenv
from utils.logger import reports_logger, log_function_call

load_dotenv() # Loading the enviroment variables

# Gemini Configuration
GEMINI_CONFIG = {
    'MODEL': os.getenv("GENAI_MODEL", "gemini-2.0-flash-exp"),
    'MAX_TOKENS': 2500,
    'TEMPERATURE': 0.3,
    'TIMEOUT': 90,
}

genai.configure(
    api_key=os.getenv("GENAI_API_KEY"),
)
model = genai.GenerativeModel(
    GEMINI_CONFIG['MODEL'],
    generation_config=genai.types.GenerationConfig(
        max_output_tokens=GEMINI_CONFIG['MAX_TOKENS'],
        temperature=GEMINI_CONFIG['TEMPERATURE'],
        top_p=0.8,
        top_k=40,
    )
)

@log_function_call(reports_logger)
def analyze_animal_injury(base64_image: str) -> dict:
    """
    Comprehensive veterinary analysis of animal injury using Gemini AI.
    Returns structured analysis matching frontend expectations.
    """
    try:
        # Comprehensive veterinary analysis prompt
        prompt = """You are a veterinary expert analyzing an image of a stray/rescue animal. Examine this image very carefully and provide a comprehensive analysis in JSON format.

ANALYSIS INSTRUCTIONS:
- Look closely at the animal's physical condition, posture, environment
- Assess visible injuries, wounds, bleeding, abnormalities
- Evaluate age indicators: size, facial features, coat condition, eyes
- Determine behavior from body language and expression
- Assess urgency based on visible health condition
- Provide specific, actionable care recommendations

Respond with this EXACT JSON structure (fill every field with detailed observations):

{
  "title": "Descriptive title based on what you see (e.g., 'Injured Adult Street Dog with Leg Wound', 'Malnourished Kitten with Eye Infection')",
  "description": "Detailed 2-3 sentence description of the animal's condition and situation visible in the image",
  "species": "Use exact terms: 'Canine' for dogs, 'Feline' for cats, 'Avian' for birds, or specific animal type",
  "breed": "Best guess of breed/mix based on visible features (e.g., 'German Shepherd Mix', 'Domestic Shorthair', 'Unknown Mixed Breed')",
  "age": "Detailed age estimate with reasoning (e.g., 'Adult (2-4 years) - based on facial maturity and body size', 'Puppy (3-6 months) - small size and juvenile features')",
  "gender": "Male/Female/Unknown - only if anatomical features clearly visible",
  "weight": "Specific estimate based on body condition (e.g., '15-20 kg (appears underweight)', '5-8 kg (normal body condition)', or 'Unknown if not visible')",
  "severity": "Choose based on visible condition: 'Critical' (life-threatening, severe bleeding, unconscious), 'High' (significant injuries, obvious distress), 'Moderate' (visible injuries, some concern), 'Low' (minor issues, stable)",
  "injurySummary": "Detailed description of ALL visible injuries, wounds, abnormalities. Include location, size, type. If none visible, state 'No obvious external injuries visible in this image'",
  "symptoms": ["List ALL visible symptoms as separate items", "Be specific: 'Bleeding from left hind leg', 'Severe limping on right front paw', 'Matted fur with visible dirt', 'Eyes appear discharge', 'Visible ribs indicating malnutrition'"],
  "urgency": "Medical priority: 'Critical' (immediate emergency care), 'High' (care within 2-4 hours), 'Moderate' (care within 24 hours), 'Low' (routine care)",
  "behavior": "Describe behavior from visible cues: 'Calm and alert', 'Scared and defensive', 'Lethargic and weak', 'Aggressive posture', 'Friendly and approachable', etc.",
  "context": "Situation assessment: 'Street Stray', 'Abandoned Pet', 'Lost Pet', 'Wild Animal', 'Injured Rescue', 'Sick Stray'",
  "careTips": ["Provide 3-4 specific care recommendations based on visible condition", "Examples: 'Keep wound clean and dry', 'Provide fresh water immediately', 'Handle very gently due to visible injuries', 'Keep animal warm and calm'"],
  "actions": ["Provide 3-4 immediate action steps", "Examples: 'Contact emergency veterinary services', 'Secure safe transport to vet clinic', 'Apply gentle pressure to bleeding areas', 'Document all injuries with additional photos'"],
  "aiConfidence": "Assessment confidence: 'High' (clear image, obvious indicators), 'Medium' (some details unclear), 'Low' (poor image quality, many details obscured)",
  "urgencyScore": "Rate urgency 1-10 (1-2=Low priority, 3-4=Moderate, 5-7=High, 8-10=Emergency). Provide single integer.",
  "behaviorScore": "Rate behavior safety 1-10 (1-3=Dangerous/Aggressive, 4-6=Unpredictable, 7-8=Calm but wary, 9-10=Very safe/friendly). Provide single integer.",
  "ageScore": "Rate age assessment confidence 1-10 (1-3=Very uncertain, 4-6=Moderate confidence, 7-8=Good confidence, 9-10=Very certain). Provide single integer.",
  "confidenceScore": "Rate overall analysis confidence 1-10 (1-3=Low confidence, 4-6=Medium, 7-8=High, 9-10=Very high). Provide single integer.",
  "environmentFactors": "Describe visible environment conditions that may affect the animal's health",
}

CRITICAL REQUIREMENTS:
- Analyze the image thoroughly before responding
- Never leave fields empty - always provide detailed observations
- Base all assessments on actual visible evidence
- Be specific and actionable in recommendations
- Provide integer scores (1-10) for all rating fields
- If truly uncertain about something, explain why in the field
- Respond with ONLY the JSON object, no additional text or markdown"""

        # Generate content with image
        response = model.generate_content([
            prompt,
            {
                "mime_type": "image/jpeg",
                "data": base64.b64decode(base64_image)
            }
        ])
        
        if not response.text:
            raise Exception("No response from Gemini API")
        
        # Clean and parse JSON response
        raw_text = response.text.strip()
        reports_logger.info("Raw Gemini response received")
        
        # Remove markdown formatting
        clean_text = raw_text.replace('```json\n', '').replace('```', '').strip()
        
        # Extract JSON object
        json_start = clean_text.find('{')
        json_end = clean_text.rfind('}')
        
        if json_start != -1 and json_end != -1:
            clean_text = clean_text[json_start:json_end + 1]
        
        try:
            parsed_data = json.loads(clean_text)
        except json.JSONDecodeError as e:
            reports_logger.error(f"JSON parsing failed: {e}")
            # Try to fix common JSON issues
            fixed_text = clean_text.replace(',\n}', '\n}').replace(',\n]', '\n]')
            try:
                parsed_data = json.loads(fixed_text)
            except:
                raise Exception("Unable to parse AI response as valid JSON")
        
        # Validate required fields
        required_fields = ['title', 'description', 'species', 'severity', 'urgency']
        missing = [field for field in required_fields if not parsed_data.get(field)]
        
        if missing:
            raise Exception(f"Missing required fields in AI response: {missing}")
        
        # Ensure arrays are properly formatted
        array_fields = ['symptoms', 'careTips', 'actions']
        for field in array_fields:
            if field in parsed_data and isinstance(parsed_data[field], str):
                parsed_data[field] = [parsed_data[field]]
            elif field not in parsed_data:
                parsed_data[field] = []
        
        # Ensure scores are integers
        score_fields = ['severityScore', 'urgencyScore', 'behaviorScore', 'ageScore', 'confidenceScore']
        for field in score_fields:
            if field in parsed_data:
                try:
                    parsed_data[field] = int(parsed_data[field])
                except:
                    parsed_data[field] = 5  # Default score
        
        # Add metadata
        parsed_data['timestamp'] = str(int(__import__('time').time()))
        parsed_data['model'] = GEMINI_CONFIG['MODEL']
        
        reports_logger.info("AI analysis completed successfully with comprehensive data")
        return {"success": True, "result": parsed_data}
        
    except Exception as e:
        reports_logger.error(f"AI analysis failed: {str(e)}")
        return {"success": False, "error": str(e)}