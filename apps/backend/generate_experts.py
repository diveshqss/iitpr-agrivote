#!/usr/bin/env python3
"""
Script to generate 50 sample Agriculture experts and store them in MongoDB users_collection.
Uses OpenAI embeddings for specialization text.
"""

import asyncio
from uuid import uuid4
import random
from app.utils.db import users_collection
from app.services.ai_pipeline import generate_embedding
import os

# Agriculture domains and possible specializations
EXPERT_SPECIALIZATIONS = {
    "crop": [
        "Wheat cultivation and disease management",
        "Rice farming techniques and pest control",
        "Maize hybrid varieties and irrigation",
        "Cotton farming and bollworm management",
        "Sugarcane cultivation and sugar yield optimization",
        "Soybean farming and soil fertility",
        "Chickpea cultivation and drought resistance",
        "Groundnut farming and aflatoxin control"
    ],
    "soil": [
        "Soil fertility analysis and nutrient management",
        "Organic matter enrichment techniques",
        "Soil pH correction and liming",
        "Soil erosion control methods",
        "Vertisol management in black cotton soils",
        "Laterite soil reclamation",
        "Saline soil amelioration",
        "Soil carbon sequestration practices"
    ],
    "pest": [
        "Integrated pest management in vegetables",
        "Bollworm control in cotton crops",
        "Stem borer management in maize",
        "Aphid control strategies",
        "Whitefly management in tomato",
        "Locust swarm control",
        "Rodent pest management",
        "Stored grain pest control"
    ],
    "fertilizer": [
        "Organic fertilizer formulation",
        "NPK ratio optimization for different crops",
        "Micronutrient deficiency correction",
        "Bio-fertilizer application",
        "Slow-release fertilizer technology",
        "Fertigation techniques",
        "Compost production methods",
        "Precision fertilizer application"
    ],
    "irrigation": [
        "Drip irrigation system design",
        "Sprinkler irrigation efficiency",
        "Groundwater resource management",
        "Rainwater harvesting techniques",
        "Micro-irrigation for horticulture",
        "Flood irrigation optimization",
        "ET-based irrigation scheduling",
        "Solar pump irrigation systems"
    ],
    "weather": [
        "Monsoon rainfall prediction",
        "Drought monitoring and early warning",
        "Frost protection strategies",
        "Weather-based crop advisories",
        "Climate change adaptation",
        "Hailstorm damage assessment",
        "Heat wave crop management",
        "Cyclone preparedness planning"
    ]
}

FIRST_NAMES = [
    "Rajesh", "Suresh", "Mahesh", "Vijay", "Anil", "Sunil", "Prakash", "Ramesh",
    "Mohan", "Ganesh", "Deepak", "Sanjay", "Vinod", "Ashok", "Santosh", "Dinesh",
    "Ravi", "Kiran", "Amit", "Rajendra", "Bhushan", "Vishal", "Rohit", "Arun",
    "Venkatesh", "Krishna", "Balram", "Shyam", "Gopal", "Laxman", "Ramu", "Babu"
]

LAST_NAMES = [
    "Sharma", "Verma", "Singh", "Patel", "Reddy", "Kumar", "Rao", "Naik",
    "Chowdhury", "Das", "Chatterjee", "Mondal", "Islam", "Hossain", "Rahman",
    "Ahmed", "Mukherjee", "Banerjee", "Sarkar", "Bose", "Ghosh", "Palit",
    "Majumdar", "Roy", "Sen", "Dasgupta", "Mitra", "Chakraborty", "Guha"
]

def generate_indian_phone():
    """Generate a realistic Indian mobile number"""
    operators = ['9', '8', '7']
    return f"+91{random.choice(operators)}{random.randint(100000000, 999999999)}"

def generate_email(name):
    """Generate email from name"""
    first, last = name.split()
    domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"]
    return f"{first.lower()}{random.randint(10,99)}@{random.choice(domains)}"

def generate_expert_data():
    """Generate 50 expert data entries"""
    experts = []

    for i in range(50):
        # Generate name
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        name = f"{first_name} {last_name}"

        # Select domain and specialization
        domain = random.choice(list(EXPERT_SPECIALIZATIONS.keys()))
        specialization = random.choice(EXPERT_SPECIALIZATIONS[domain])

        expert_data = {
            "userId": str(uuid4()),
            "name": name,
            "role": "expert",
            "email": generate_email(name),
            "phone_number": generate_indian_phone(),
            "domain": domain,
            "specialisation": specialization,
            "specialisation_embedding": None,  # Will be generated separately
            "score": 4.5,
            "accuracy": 85
        }

        experts.append(expert_data)

    return experts

async def generate_and_store_experts():
    """Generate experts, create embeddings, and store in MongoDB"""

    print("🌱 Generating 50 sample agriculture experts...")

    # Generate basic expert data
    experts = generate_expert_data()

    # Process each expert and generate embeddings
    processed_experts = []
    for i, expert in enumerate(experts, 1):
        print(f"Processing expert {i}/50: {expert['name']} - {expert['specialisation'][:50]}...")

        try:
            # Generate embedding for specialization
            embedding = await generate_embedding(expert['specialisation'])
            if embedding:
                expert['specialisation_embedding'] = embedding
            else:
                print(f"Warning: Failed to generate embedding for {expert['name']}")
                continue

            processed_experts.append(expert)

        except Exception as e:
            print(f"Error generating embedding for expert {expert['name']}: {e}")
            continue

    # Store all experts in MongoDB
    print(f"Storing {len(processed_experts)} experts in users_collection...")

    if processed_experts:
        try:
            result = await users_collection.insert_many(processed_experts)
            print(f"✅ Successfully inserted {len(result.inserted_ids)} experts into users_collection")
            print(f"Inserted document IDs: {result.inserted_ids[:5]}...")  # Show first 5 IDs

            # Verify the count
            total_experts = await users_collection.count_documents({"role": "expert"})
            print(f"Total experts in collection: {total_experts}")

            # Show distribution by domain
            domain_counts = {}
            for expert in processed_experts:
                domain = expert['domain']
                domain_counts[domain] = domain_counts.get(domain, 0) + 1

            print("Domain distribution:")
            for domain, count in domain_counts.items():
                print(f"  {domain}: {count}")

        except Exception as e:
            print(f"❌ Error inserting experts into MongoDB: {e}")
    else:
        print("❌ No experts were processed successfully")

if __name__ == "__main__":
    asyncio.run(generate_and_store_experts())
