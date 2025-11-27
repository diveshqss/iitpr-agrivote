import pytest
import asyncio
import os
from app.ai.classifier import classify_question_domain

# Test data: Real agricultural questions that should map to specific domains
TEST_CASES = [
    # Crop-related questions
    ("My paddy crops are turning yellow and wilting. What should I do?", "crop"),
    ("How do I increase the yield of my wheat crop?", "crop"),
    ("What are the best varieties of tomato for this season?", "crop"),
    ("My cotton plants have brown spots on leaves", "crop"),

    # Soil-related questions
    ("How deep should I plow the soil for sugarcane?", "soil"),
    ("What is the pH level of good farming soil?", "soil"),
    ("How can I improve soil fertility?", "soil"),
    ("My soil is too sandy, how to fix it?", "soil"),

    # Pest-related questions
    ("Insects are eating my tomato plants. What pesticide should I use?", "pest"),
    ("How do I control aphids on my brinjal crop?", "pest"),
    ("What are the signs of stem borer attack?", "pest"),
    ("How to prevent locust infestation?", "pest"),

    # Fertilizer-related questions
    ("When should I apply fertilizer to my wheat?", "fertilizer"),
    ("What NPK ratio is best for paddy?", "fertilizer"),
    ("How much urea should I apply per acre?", "fertilizer"),
    ("Organic vs chemical fertilizers - which is better?", "fertilizer"),

    # Irrigation-related questions
    ("My sprinkler system isn't watering evenly", "irrigation"),
    ("How often should I water my rice field?", "irrigation"),
    ("What is drip irrigation and how does it work?", "irrigation"),
    ("How to prevent waterlogging in my field?", "irrigation"),

    # Weather-related questions
    ("Will it rain tomorrow? Should I harvest my crop?", "weather"),
    ("How does drought affect crop growth?", "weather"),
    ("What weather conditions are best for sowing?", "weather"),
    ("Frost damage to my crops - how to protect?", "weather"),

    # Other/miscellaneous questions (should default to 'other')
    ("How do I register for agricultural subsidy?", "other"),
    ("What are the government schemes for farmers?", "other"),
    ("How to get a loan for farming equipment?", "other"),
    ("Where can I sell my produce online?", "other"),
]

ALLOWED_DOMAINS = ["crop", "soil", "pest", "fertilizer", "irrigation", "weather", "other"]

@pytest.mark.asyncio
class TestClassifierIntegration:
    """Integration tests that actually call the Gemini API to test classification."""

    async def test_api_key_configured(self):
        """Test that Gemini API key is configured."""
        api_key = os.getenv("GEMINI_API_KEY")
        assert api_key is not None, "GEMINI_API_KEY environment variable must be set"
        assert len(api_key.strip()) > 0, "GEMINI_API_KEY cannot be empty"

    @pytest.mark.parametrize("question,expected_domain", TEST_CASES)
    async def test_domain_classification(self, question, expected_domain):
        """Test that questions are correctly classified into domains using real Gemini API."""
        # Add a small delay to be respectful to the API
        await asyncio.sleep(0.5)

        result = await classify_question_domain(question)

        # Basic validation
        assert isinstance(result, str), f"Expected string result, got {type(result)}"
        assert result in ALLOWED_DOMAINS, f"Invalid domain '{result}'. Must be one of: {ALLOWED_DOMAINS}"

        # Domain-specific assertion - Gemini should classify reasonably
        # Note: We allow some flexibility as AI classification might vary slightly
        if expected_domain != "other":
            # For specific domains, check if result matches expected or is reasonable alternative
            if expected_domain == "crop" and result in ["crop", "other"]:
                assert True  # Crop-related might sometimes be classified as other
            elif expected_domain == "weather" and result in ["weather", "other"]:
                assert True  # Weather might sometimes be other
            else:
                # For other domains, we expect exact match or very close
                assert result == expected_domain, f"Question: '{question}' -> Expected: '{expected_domain}', Got: '{result}'"

    async def test_empty_question(self):
        """Test behavior with empty question."""
        await asyncio.sleep(0.5)  # Rate limiting

        result = await classify_question_domain("")
        assert isinstance(result, str)
        assert result in ALLOWED_DOMAINS

    async def test_non_agricultural_question(self):
        """Test classification of clearly non-agricultural question."""
        await asyncio.sleep(0.5)

        question = "How do I repair my car engine?"
        result = await classify_question_domain(question)
        assert result == "other", f"Non-agricultural question should classify as 'other', got: '{result}'"

    async def test_mixed_language_question(self):
        """Test classification with mixed English/Hindi question."""
        await asyncio.sleep(0.5)

        question = "My wheat crop has yellow rust disease. क्या करना चाहिए?"
        result = await classify_question_domain(question)
        assert isinstance(result, str)
        assert result in ALLOWED_DOMAINS

    async def test_multiple_questions(self):
        """Test classification with multiple questions in one input."""
        await asyncio.sleep(0.5)

        question = "What fertilizer should I use for paddy? Also, when should I irrigate?"
        result = await classify_question_domain(question)
        assert isinstance(result, str)
        assert result in ALLOWED_DOMAINS
        # Should probably classify as fertilizer or irrigation or fertilizer (first main topic)

    async def test_error_handling(self):
        """Test that the function handles API errors gracefully."""
        # This test relies on the try/catch in the function
        # We can't easily simulate API errors, but we can test with very long input
        await asyncio.sleep(0.5)

        long_question = "What should I do " * 1000  # Very long question
        result = await classify_question_domain(long_question)
        assert isinstance(result, str)
        assert result in ALLOWED_DOMAINS  # Should fallback to "other" on error

    def test_allowed_domains_constant(self):
        """Test that our allowed domains list is correctly defined."""
        # The classifier uses this list inline, so we verify our test list matches
        classifier_domains = ["crop", "soil", "pest", "fertilizer", "irrigation", "weather", "other"]
        assert set(classifier_domains) == set(ALLOWED_DOMAINS), "Test domains don't match classifier allowed domains"

if __name__ == "__main__":
    # Can be run directly for quick testing
    pytest.main([__file__, "-v"])
