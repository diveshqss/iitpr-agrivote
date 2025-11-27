# Classifier Integration Tests

This directory contains integration tests for the Gemini-based question classifier that actually call the real Gemini API.

## ⚠️ Important Notes

- **Real API Calls**: These tests make actual calls to Google's Gemini API and will consume your quota/billing
- **Rate Limiting**: Tests include 0.5-second delays between calls to be respectful to the API
- **API Key Required**: You must have `GEMINI_API_KEY` set in your `.env` file

## Setup

1. Install test dependencies:
```bash
cd apps/backend
pip install -r requirements.txt
```

2. Ensure your `.env` file contains:
```bash
GEMINI_API_KEY=your_api_key_here
```

## Running Tests

### Run all classifier tests:
```bash
cd apps/backend
pytest tests/test_classifier.py -v
```

### Run specific test:
```bash
cd apps/backend
pytest tests/test_classifier.py::TestClassifierIntegration::test_domain_classification -v
```

### Run with coverage (optional):
```bash
pip install pytest-cov
pytest tests/test_classifier.py --cov=app.ai.classifier --cov-report=term-missing
```

## Test Coverage

The tests cover:

### 🔄 Domain Classification Tests (28 parametrized tests)
- **Crop**: Paddy, wheat, tomato, cotton, sugarcane questions
- **Soil**: Plowing, pH, fertility, soil types
- **Pest**: Insects, aphids, stem borer, locust control
- **Fertilizer**: Timing, NPK ratios, urea application, organic vs chemical
- **Irrigation**: Sprinklers, watering schedules, drip systems, waterlogging
- **Weather**: Rain forecasts, drought, frost protection, sowing conditions
- **Other**: Subsidies, government schemes, loans, marketing

### 🧪 Special Case Tests
- Empty questions
- Non-agricultural questions
- Mixed language (English/Hindi)
- Multiple questions in one input
- Error handling with long inputs

### 🔧 Utility Tests
- API key validation
- Domain list consistency

## Expected Behavior

- Each test makes real Gemini API calls with agricultural questions
- Results should match expected domains (with some AI flexibility allowed)
- Non-agricultural questions should classify as "other"
- Error conditions should gracefully fall back to "other"

## Rate Limiting & Costs

- **~32 API calls** total per full test run
- **~0.5 seconds** delay between calls
- **~20-25 seconds** total runtime
- Monitor your Gemini API usage dashboard during testing

## Troubleshooting

### API Key Issues:
```bash
# Check if environment variable is set
echo $GEMINI_API_KEY

# Test key format (should start with 'AIzaSy')
echo $GEMINI_API_KEY | head -c 10
```

### Import Errors:
```bash
# Ensure you're in the backend directory
cd apps/backend

# Activate virtual environment if using one
source venv/bin/activate  # or venv\Scripts\activate on Windows
```

### Slow Tests:
- Tests are intentionally slowed down with rate limiting
- For faster feedback during development, you can reduce the `asyncio.sleep()` delay

## Development Notes

These are **integration tests** that test the complete flow with real APIs. For development with faster feedback, consider:

1. **Unit tests** with mocked responses for the function logic
2. **Local classifier** with keyword-based rules during development
3. **Selective test runs** for specific domains during debugging

## Running Single Domain Tests

To test only crop-related questions:
```bash
pytest tests/test_classifier.py::TestClassifierIntegration::test_domain_classification -k "crop" -v
```

To test only pest questions:
```bash
pytest tests/test_classifier.py::TestClassifierIntegration::test_domain_classification -k "pest" -v
