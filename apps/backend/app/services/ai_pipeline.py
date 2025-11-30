"""
AI Pipeline Service for processing farmer questions.
Handles the background pipeline: embedding -> classification -> duplicate check -> cleanup -> expert allocation.
Uses OpenAI for embeddings and MongoDB Atlas Vector Search for duplicate detection.
"""

from app.utils.db import questions_collection, users_collection
from app.utils.vector import cosine_similarity
from bson import ObjectId
from datetime import datetime
from app.ai import classifier, duplicate_detector, cleanup
import asyncio
from typing import List
from openai import OpenAI
import os


async def allocate_experts_domain_vector(question_domain: str, question_embedding: List[float]) -> List[str]:
    """Allocate top 5 experts based on domain match and vector similarity with question embedding."""
    try:
        # Find all experts in the matching domain
        experts_cursor = users_collection.find({"role": "expert", "domain": question_domain})
        experts = await experts_cursor.to_list(length=None)

        if not experts:
            print(f"No experts found for domain: {question_domain}")
            return []

        # Calculate similarity scores
        expert_similarities = []
        for expert in experts:
            if "specialisation_embedding" in expert and expert["specialisation_embedding"]:
                similarity = cosine_similarity(question_embedding, expert["specialisation_embedding"])
                expert_similarities.append({
                    "_id": str(expert["_id"]),
                    "name": expert.get("name", "Unknown"),
                    "specialisation": expert.get("specialisation", ""),
                    "similarity": similarity,
                    "score": expert.get("score", 0),
                    "accuracy": expert.get("accuracy", 0)
                })

        # Sort by similarity descending and pick top 5
        expert_similarities.sort(key=lambda x: x["similarity"], reverse=True)
        top_experts = expert_similarities[:5]

        # Log allocation details
        print(f"Allocated {len(top_experts)} experts for domain '{question_domain}':")
        for i, expert in enumerate(top_experts, 1):
            print(f"  {i}. {expert['name']} - {expert['specialisation']} (similarity: {expert['similarity']:.4f})")

        return [expert["_id"] for expert in top_experts]

    except Exception as e:
        print(f"Error allocating experts: {e}")
        return []


async def generate_embedding(text: str) -> List[float]:
    """Generate text embedding using OpenAI for duplicate detection."""
    try:
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        result = client.embeddings.create(
            input=text,
            model="text-embedding-3-small"
        )
        return result.data[0].embedding
    except Exception as e:
        print(f"Error generating embedding: {e}")
        # Return empty list to indicate failure
        return []


async def process_question_pipeline(question_id: str):
    """
    Background pipeline: embedding -> classification -> duplicate check -> cleanup -> expert allocation
    Update the question document as we progress.
    """
    qobj = await questions_collection.find_one({"_id": ObjectId(question_id)})
    if not qobj:
        return

    # Mark processing
    await questions_collection.update_one(
        {"_id": ObjectId(question_id)},
        {"$set": {"status": "processing", "ai_pipeline.status": "running"}}
    )

    text = qobj.get("original_text", "")

    # 1) Generate embedding
    try:
        embedding = await generate_embedding(text)
        if embedding:  # Only update if we got a valid embedding
            await questions_collection.update_one(
                {"_id": ObjectId(question_id)},
                {"$set": {
                    "embedding": embedding,
                    "ai_metadata": {
                        "embedding_generated": True,
                        "embedding_model": "text-embedding-3-small",
                        "generated_at": datetime.utcnow()
                    }
                }}
            )
            print(embedding)
    except Exception as e:
        print(f"Embedding generation failed for question {question_id}: {e}")
        # Continue without embedding

    # 2) Classification
    try:
        domain = await classifier.classify_question_domain(text)
        await questions_collection.update_one(
            {"_id": ObjectId(question_id)},
            {"$set": {"domain": domain}}
        )
    except Exception as e:
        print(f"Classification failed for question {question_id}: {e}")
        domain = "other"
        await questions_collection.update_one(
            {"_id": ObjectId(question_id)},
            {"$set": {"domain": domain}}
        )

    # 3) Duplicate detection (now uses vector search if embedding available)
    try:
        # Pass both text and embedding to duplicate detector
        dup = await duplicate_detector.find_semantic_duplicate(question_id, domain, embedding)

        if dup:
            await questions_collection.update_one(
                {"_id": ObjectId(question_id)},
                {"$set": {
                    "status": "duplicate",
                    "is_duplicate_of": dup,
                    "ai_pipeline.status": "done",
                    "ai_metadata.duplicate_found": True
                }}
            )
            return
    except Exception as e:
        print(f"Duplicate detection failed for question {question_id}: {e}")
        # Continue with pipeline even if duplicate check fails

    # 4) Cleanup
    try:
        cleaned = await cleanup.clean_question_text(text)
        await questions_collection.update_one(
            {"_id": ObjectId(question_id)},
            {"$set": {"cleaned_text": cleaned}}
        )
    except Exception as e:
        print(f"Text cleanup failed for question {question_id}: {e}")
        # Continue with original text

    # 5) Expert allocation based on domain match and vector similarity
    try:
        # Get the latest question object with domain and embedding
        current_qobj = await questions_collection.find_one({"_id": ObjectId(question_id)})
        question_domain = current_qobj.get("domain", "other")
        question_embedding = current_qobj.get("embedding", [])

        # Allocate experts based on domain and vector similarity
        if question_embedding and question_domain != "other":
            assigned_experts = await allocate_experts_domain_vector(question_domain, question_embedding)
        else:
            # Fallback: allocate from general pool if no embedding or domain is 'other'
            print(f"Falling back to general expert allocation for question {question_id}")
            cursor = users_collection.find({"role": "expert"}).limit(5)
            assigned_experts = []
            async for e in cursor:
                assigned_experts.append(str(e["_id"]))

        if assigned_experts:
            await questions_collection.update_one(
                {"_id": ObjectId(question_id)},
                {"$set": {
                    "assigned_experts": assigned_experts,
                    "status": "assigned",
                    "expert_allocation_details": {
                        "method": "domain_vector_similarity" if question_embedding else "fallback_random",
                        "domain": question_domain,
                        "num_experts": len(assigned_experts)
                    }
                }}
            )
        else:
            await questions_collection.update_one(
                {"_id": ObjectId(question_id)},
                {"$set": {"status": "assigned"}}
            )
    except Exception as e:
        print(f"Expert allocation failed for question {question_id}: {e}")
        await questions_collection.update_one(
            {"_id": ObjectId(question_id)},
            {"$set": {"status": "processed"}}  # Fallback status
        )

    # Mark pipeline complete
    await questions_collection.update_one(
        {"_id": ObjectId(question_id)},
        {"$set": {"ai_pipeline.status": "done"}}
    )


async def process_domain_classification(question_id: str, question_text: str):
    """Process domain classification for a question."""
    try:
        domain = await classify_question_domain(question_text)
        await questions_collection.update_one(
            {"_id": ObjectId(question_id)},
            {"$set": {"domain": domain}}
        )
        return domain
    except Exception as e:
        print(f"Domain classification failed for question {question_id}: {e}")
        return "other"
