"""
Populate Supabase with sample data for Maharashtra Governance Platform
"""

import os
from datetime import datetime, timedelta
import random
import hashlib
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv('VITE_SUPABASE_URL') or os.getenv('SUPABASE_URL')
supabase_key = os.getenv('VITE_SUPABASE_ANON_KEY') or os.getenv('SUPABASE_ANON_KEY')

if not supabase_url or not supabase_key:
    print("Error: Supabase credentials not found in .env")
    exit(1)

supabase: Client = create_client(supabase_url, supabase_key)

def hash_personal_data(data):
    """Anonymize personal information"""
    return hashlib.sha256(data.encode()).hexdigest()[:16]

def populate_citizen_requests():
    """Generate and insert 50 citizen requests"""
    print("Populating citizen requests...")

    complaint_types = ["Water Supply", "Road Repair", "Healthcare", "Electricity",
                      "Garbage Collection", "Street Lights", "Drainage", "Public Transport"]
    cities = ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Solapur", "Kolhapur"]
    severities = ["Critical", "High", "Medium", "Low"]
    statuses = ["Open", "In Progress", "Resolved"]

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

    descriptions = {
        "Water Supply": ["No water supply for 5 days affecting 500 families", "Water contamination reported", "Pipeline burst needs repair"],
        "Road Repair": ["Dangerous potholes causing accidents", "Road damaged after monsoon", "Bridge showing cracks"],
        "Healthcare": ["Medicine shortage in hospital", "Ambulance service delayed", "Equipment not functioning"],
        "Electricity": ["Frequent power cuts", "Transformer failure", "Electricity poles damaged"],
        "Garbage Collection": ["Garbage not collected for 10 days", "Overflowing bins", "No disposal system"],
        "Street Lights": ["Street lights not working", "Poor visibility causing accidents", "Lights damaged in storm"],
        "Drainage": ["Blocked drainage system", "Sewage overflow", "System collapsed"],
        "Public Transport": ["Insufficient bus services", "Irregular schedule", "No connectivity"]
    }

    requests = []
    for i in range(1, 51):
        complaint_type = random.choice(complaint_types)
        city = random.choice(cities)
        severity = random.choice(severities)
        status = random.choice(statuses)

        date_sub = (datetime.now() - timedelta(days=random.randint(1, 35))).isoformat()
        resolved = (datetime.now() - timedelta(days=random.randint(1, 7))).isoformat() if status == "Resolved" else None

        requests.append({
            "request_id": f"R{str(i).zfill(3)}",
            "citizen_name_hash": hash_personal_data(f"Citizen{i}"),
            "phone_hash": hash_personal_data(f"98765432{str(i).zfill(2)}"),
            "email": f"citizen{i}@example.com",
            "complaint_type": complaint_type,
            "description": random.choice(descriptions[complaint_type]),
            "city": city,
            "ward": f"Ward {random.randint(1, 25)}",
            "district": city,
            "severity": severity,
            "status": status,
            "affected_count": random.randint(50, 1200),
            "department": departments[complaint_type],
            "date_submitted": date_sub,
            "priority_score": round(random.uniform(4.0, 10.0), 2),
            "resolved_date": resolved
        })

    result = supabase.table('citizen_requests').insert(requests).execute()
    print(f"Inserted {len(requests)} citizen requests")

def populate_infrastructure():
    """Generate and insert 30 infrastructure records"""
    print("Populating infrastructure assets...")

    asset_types = ["Water Pipeline", "Road Network", "Hospital", "School Building",
                  "Power Substation", "Sewage Treatment Plant", "Bridge", "Community Center"]
    cities = ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Kolhapur", "Solapur"]
    conditions = ["Excellent", "Good", "Fair", "Poor", "Critical"]

    assets = []
    for i in range(1, 31):
        asset_type = random.choice(asset_types)
        city = random.choice(cities)
        condition = random.choice(conditions)

        risk_ranges = {"Excellent": (1, 2.5), "Good": (2.5, 4.5), "Fair": (4.5, 6.5),
                      "Poor": (6.5, 8.5), "Critical": (8.5, 10)}
        risk_score = round(random.uniform(*risk_ranges[condition]), 1)

        capacity = random.randint(100, 5000) if asset_type in ["Hospital", "School Building"] else None

        assets.append({
            "asset_id": f"INF{str(i).zfill(3)}",
            "asset_type": asset_type,
            "location": f"{city} Area {random.randint(1, 10)}",
            "city": city,
            "district": city,
            "condition": condition,
            "risk_score": risk_score,
            "capacity": capacity,
            "current_usage": int(capacity * random.uniform(0.6, 0.95)) if capacity else None,
            "last_maintenance": (datetime.now() - timedelta(days=random.randint(30, 400))).date().isoformat(),
            "next_maintenance_due": (datetime.now() + timedelta(days=random.randint(30, 180))).date().isoformat()
        })

    result = supabase.table('infrastructure_assets').insert(assets).execute()
    print(f"Inserted {len(assets)} infrastructure assets")

def populate_health_surveillance():
    """Generate and insert 40 health records"""
    print("Populating health surveillance...")

    diseases = ["Dengue", "Malaria", "Seasonal Flu", "Waterborne Diseases",
               "COVID-19", "Typhoid", "Tuberculosis", "Food Poisoning"]
    cities = ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Solapur", "Kolhapur"]
    trends = ["Increasing", "Decreasing", "Stable"]

    records = []
    for i in range(1, 41):
        disease = random.choice(diseases)
        city = random.choice(cities)
        trend = random.choice(trends)

        alert_level = random.choice(["Yellow", "Orange", "Red"] if trend == "Increasing"
                                    else ["Green", "Yellow"])
        cases = random.randint(100, 300) if alert_level in ["Orange", "Red"] else random.randint(5, 150)

        records.append({
            "record_id": f"H{str(i).zfill(3)}",
            "district": city,
            "city": city,
            "disease_type": disease,
            "cases_reported": cases,
            "date_reported": (datetime.now() - timedelta(days=random.randint(1, 20))).date().isoformat(),
            "trend": trend,
            "alert_level": alert_level,
            "action_taken": "Enhanced surveillance activated" if alert_level != "Green" else "Routine monitoring"
        })

    result = supabase.table('health_surveillance').insert(records).execute()
    print(f"Inserted {len(records)} health surveillance records")

if __name__ == "__main__":
    print("\n" + "="*70)
    print("  Maharashtra Governance AI - Populating Supabase Database")
    print("="*70 + "\n")

    try:
        populate_citizen_requests()
        populate_infrastructure()
        populate_health_surveillance()

        print("\n" + "="*70)
        print("  Data population complete!")
        print("="*70 + "\n")
    except Exception as e:
        print(f"Error: {e}")
