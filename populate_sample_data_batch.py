from google.cloud import bigquery
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import hashlib
import random
import pandas as pd

# Load environment variables
load_dotenv()

# Get project ID
project_id = os.getenv('GOOGLE_CLOUD_PROJECT_ID')
client = bigquery.Client(project=project_id)

def hash_personal_data(data):
    """Anonymize personal information using SHA256"""
    return hashlib.sha256(data.encode()).hexdigest()[:16]

def generate_citizen_requests():
    """Generate 50 sample citizen requests"""
    
    complaint_types = [
        "Water Supply", "Road Repair", "Healthcare", "Electricity", 
        "Garbage Collection", "Street Lights", "Drainage", "Public Transport"
    ]
    
    cities = ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Solapur", "Kolhapur"]
    
    departments = {
        "Water Supply": "Water Department",
        "Road Repair": "PWD",
        "Healthcare": "Health Department",
        "Electricity": "MSEDCL",
        "Garbage Collection": "Sanitation Department",
        "Street Lights": "Municipal Corporation",
        "Drainage": "PWD",
        "Public Transport": "Transport Department"
    }
    
    severities = ["Critical", "High", "Medium", "Low"]
    statuses = ["Open", "In Progress", "Resolved"]
    
    descriptions = {
        "Water Supply": [
            "No water supply for 5 days affecting 500 families in our ward. This is a critical situation requiring immediate attention.",
            "Severe water contamination reported in our area. Multiple citizens have fallen sick and need urgent intervention.",
            "Major pipeline burst causing complete water shortage in entire ward. Emergency repair needed immediately."
        ],
        "Road Repair": [
            "Multiple dangerous potholes on main road causing daily accidents. Several vehicles damaged and citizens injured.",
            "Road completely damaged after recent monsoon. Urgent repair needed as situation is worsening daily.",
            "Bridge showing major structural cracks. Serious safety concern for thousands of daily commuters."
        ],
        "Healthcare": [
            "Critical medicine shortage in government hospital affecting patient treatment. Lives at risk.",
            "Ambulance service frequently delayed. Emergency response time is very poor affecting critical patients.",
            "Hospital equipment not functioning. Patient care severely compromised and needs immediate attention."
        ],
        "Electricity": [
            "Frequent power cuts lasting 8-10 hours daily. Businesses and daily life completely disrupted.",
            "Transformer failure affecting more than 1000 households. No electricity for past 3 days.",
            "Multiple electricity poles damaged and leaning dangerously. Major safety hazard in residential area."
        ],
        "Garbage Collection": [
            "Garbage not collected for past 10 days. Creating major health hazard and unbearable situation.",
            "Overflowing garbage bins attracting rats and stray animals. Diseases spreading in the area.",
            "No proper garbage disposal system in our area. Residents forced to dump waste on roadsides."
        ],
        "Street Lights": [
            "All street lights in our area not working for 3 weeks. Major safety concern for residents.",
            "Poor visibility at night causing accidents and increasing crime. Women feel unsafe after dark.",
            "Street lights damaged in storm and need immediate replacement for public safety."
        ],
        "Drainage": [
            "Completely blocked drainage system causing severe water logging during rains.",
            "Sewage overflow on main road creating unbearable situation. Health hazard for all residents.",
            "Entire drainage system has collapsed. Urgent reconstruction needed before monsoon season."
        ],
        "Public Transport": [
            "Severely insufficient bus services causing extreme overcrowding. Citizens facing daily hardship.",
            "Bus schedule completely irregular. Long waiting times and unpredictable service.",
            "No bus connectivity to remote areas. Residents forced to walk long distances daily."
        ]
    }
    
    citizen_names = [
        "Rajesh Patil", "Sneha Kulkarni", "Amit Deshmukh", "Priya Joshi", 
        "Vijay Sharma", "Meera Patel", "Suresh Kumar", "Anita Reddy",
        "Rakesh Gupta", "Deepa Shah", "Anil Rao", "Kavita Singh",
        "Manish Agarwal", "Pooja Verma", "Sanjay Mishra", "Ritu Malhotra",
        "Kiran Naik", "Madhuri Desai", "Prakash Jadhav", "Sunita Wagh",
        "Ramesh Pawar", "Anjali Bhosale", "Ganesh Shinde", "Sarika Kadam"
    ]
    
    data = []
    
    print("   Generating 50 citizen requests...")
    
    for i in range(1, 51):
        complaint_type = random.choice(complaint_types)
        city = random.choice(cities)
        name = random.choice(citizen_names)
        severity = random.choice(severities)
        status = random.choice(statuses)
        
        desc = random.choice(descriptions[complaint_type])
        
        date_sub = datetime.now() - timedelta(days=random.randint(1, 30))
        resolved = None
        if status == "Resolved":
            resolved = datetime.now() - timedelta(days=random.randint(1, 7))
        
        row = {
            "request_id": f"R{str(i).zfill(3)}",
            "citizen_name_hash": hash_personal_data(name),
            "phone_hash": hash_personal_data(f"98765432{str(i).zfill(2)}"),
            "email": f"citizen{i}@example.com",
            "complaint_type": complaint_type,
            "description": desc,
            "city": city,
            "ward": f"Ward {random.randint(1, 25)}",
            "district": city,
            "severity": severity,
            "status": status,
            "affected_count": random.randint(50, 1200),
            "department": departments.get(complaint_type, "General Department"),
            "date_submitted": date_sub,
            "priority_score": round(random.uniform(4.0, 10.0), 2) if random.random() > 0.3 else None,
            "resolved_date": resolved
        }
        
        data.append(row)
    
    print(f"   ✓ Generated {len(data)} requests")
    return pd.DataFrame(data)

def generate_infrastructure_data():
    """Generate 30 infrastructure records"""
    
    asset_types = [
        "Water Pipeline", "Road Network", "Hospital", "School Building", 
        "Power Substation", "Sewage Treatment Plant", "Bridge", "Community Center",
        "Government Office", "Public Library", "Bus Depot", "Water Tank"
    ]
    
    cities = ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Kolhapur", "Solapur"]
    conditions = ["Excellent", "Good", "Fair", "Poor", "Critical"]
    
    locations = [
        "Shivaji Nagar", "Andheri West", "Civil Lines", "Kothrud", "Vashi", 
        "MG Road", "Station Road", "Market Area", "Gandhi Chowk", "Ring Road",
        "Tilak Road", "Nehru Nagar", "Ambedkar Square"
    ]
    
    data = []
    
    print("   Generating 30 infrastructure records...")
    
    for i in range(1, 31):
        asset_type = random.choice(asset_types)
        city = random.choice(cities)
        condition = random.choice(conditions)
        
        risk_mapping = {
            "Excellent": (1.0, 2.5), 
            "Good": (2.5, 4.5), 
            "Fair": (4.5, 6.5), 
            "Poor": (6.5, 8.5), 
            "Critical": (8.5, 10.0)
        }
        risk_range = risk_mapping[condition]
        risk_score = round(random.uniform(risk_range[0], risk_range[1]), 1)
        
        capacity = random.randint(100, 5000) if asset_type in ["Hospital", "School Building", "Community Center", "Bus Depot"] else None
        current_usage = int(capacity * random.uniform(0.60, 0.95)) if capacity else None
        
        row = {
            "asset_id": f"INF{str(i).zfill(3)}",
            "asset_type": asset_type,
            "location": f"{random.choice(locations)}, {city}",
            "city": city,
            "district": city,
            "condition": condition,
            "risk_score": risk_score,
            "capacity": capacity,
            "current_usage": current_usage,
            "last_maintenance": (datetime.now() - timedelta(days=random.randint(30, 400))).date(),
            "next_maintenance_due": (datetime.now() + timedelta(days=random.randint(30, 180))).date()
        }
        
        data.append(row)
    
    print(f"   ✓ Generated {len(data)} infrastructure records")
    return pd.DataFrame(data)

def generate_health_surveillance_data():
    """Generate 40 health surveillance records"""
    
    diseases = [
        "Dengue", "Malaria", "Seasonal Flu", "Waterborne Diseases", 
        "COVID-19", "Typhoid", "Tuberculosis", "Food Poisoning",
        "Viral Fever", "Gastroenteritis", "Hepatitis", "Chickenpox"
    ]
    
    cities = ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Solapur", "Kolhapur"]
    trends = ["Increasing", "Decreasing", "Stable"]
    
    data = []
    
    print("   Generating 40 health surveillance records...")
    
    for i in range(1, 41):
        disease = random.choice(diseases)
        city = random.choice(cities)
        trend = random.choice(trends)
        
        if trend == "Increasing":
            alert_level = random.choice(["Yellow", "Orange", "Red"])
        elif trend == "Decreasing":
            alert_level = random.choice(["Green", "Yellow"])
        else:
            alert_level = random.choice(["Green", "Yellow"])
        
        cases = random.randint(5, 150) if alert_level in ["Green", "Yellow"] else random.randint(100, 300)
        
        actions = {
            "Green": "Routine monitoring and surveillance ongoing",
            "Yellow": "Enhanced surveillance measures activated",
            "Orange": "Active intervention and control measures in place",
            "Red": "Emergency response protocol activated. Intensive intervention."
        }
        
        row = {
            "record_id": f"H{str(i).zfill(3)}",
            "district": city,
            "city": city,
            "disease_type": disease,
            "cases_reported": cases,
            "date_reported": (datetime.now() - timedelta(days=random.randint(1, 20))).date(),
            "trend": trend,
            "alert_level": alert_level,
            "action_taken": actions[alert_level]
        }
        
        data.append(row)
    
    print(f"   ✓ Generated {len(data)} health records")
    return pd.DataFrame(data)

def insert_data_batch():
    """Insert data using batch load (free tier compatible)"""
    
    print("\n" + "="*70)
    print("  🚀 MAHARASHTRA GOVERNANCE AI - DATA POPULATION (BATCH MODE)")
    print("="*70 + "\n")
    
    print(f"📍 Project: {project_id}")
    print(f"📍 Dataset: governance_data")
    print(f"📍 Method: Batch Load (Free Tier Compatible)\n")
    
    # Generate data
    print("🔄 STEP 1: Generating sample data...\n")
    requests_df = generate_citizen_requests()
    infrastructure_df = generate_infrastructure_data()
    health_df = generate_health_surveillance_data()
    
    print(f"\n✅ All data generated successfully!\n")
    
    # Insert data using load_table_from_dataframe
    print("🔄 STEP 2: Inserting data into BigQuery (Batch Mode)...\n")
    
    # Citizen requests
    print("📝 Uploading citizen requests...")
    try:
        table_id = f"{project_id}.governance_data.citizen_requests"
        job = client.load_table_from_dataframe(requests_df, table_id)
        job.result()  # Wait for completion
        print(f"   ✅ Successfully uploaded {len(requests_df)} records\n")
    except Exception as e:
        print(f"   ❌ Error: {e}\n")
    
    # Infrastructure
    print("🏗️ Uploading infrastructure assets...")
    try:
        table_id = f"{project_id}.governance_data.infrastructure_assets"
        job = client.load_table_from_dataframe(infrastructure_df, table_id)
        job.result()
        print(f"   ✅ Successfully uploaded {len(infrastructure_df)} records\n")
    except Exception as e:
        print(f"   ❌ Error: {e}\n")
    
    # Health surveillance
    print("🏥 Uploading health surveillance records...")
    try:
        table_id = f"{project_id}.governance_data.health_surveillance"
        job = client.load_table_from_dataframe(health_df, table_id)
        job.result()
        print(f"   ✅ Successfully uploaded {len(health_df)} records\n")
    except Exception as e:
        print(f"   ❌ Error: {e}\n")
    
    # Summary
    print("="*70)
    print("  ✅ DATA UPLOAD COMPLETE!")
    print("="*70 + "\n")
    
    print("📊 Summary:")
    print(f"   • Citizen Requests:        50 records")
    print(f"   • Infrastructure Assets:   30 records")
    print(f"   • Health Surveillance:     40 records")
    print(f"   • Total:                  120 records\n")
    
    print("🔍 Verify your data:")
    print(f"   BigQuery Console: https://console.cloud.google.com/bigquery?project={project_id}\n")
    
    print("📝 Sample query to run in BigQuery:")
    print("   SELECT * FROM `governance_data.citizen_requests` LIMIT 10;\n")

if __name__ == "__main__":
    insert_data_batch()