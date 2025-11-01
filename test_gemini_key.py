import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Get API key
api_key = os.getenv('GEMINI_API_KEY')

if not api_key:
    print("❌ ERROR: GEMINI_API_KEY not found in .env file!")
    print("Please add: GEMINI_API_KEY=your-key-here to .env file")
else:
    print(f"✅ API Key found: {api_key[:20]}...")
    
    try:
        # Configure and test
        genai.configure(api_key=api_key)
        
        print("\n🔍 Testing available models:")
        count = 0
        for model in genai.list_models():
            if 'generateContent' in model.supported_generation_methods:
                print(f"  ✅ {model.name}")
                count += 1
        
        if count > 0:
            print(f"\n🎉 SUCCESS! You have access to {count} Gemini models!")
        else:
            print("\n❌ No models found. Check your API key.")
            
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        print("Your API key might be invalid.")