#!/usr/bin/env python3
"""
Convenience script to run classifier integration tests with real Gemini API calls.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file (same as backend config)
env_file = ".env"
dotenv_path = os.path.join(os.getcwd(), env_file)
load_dotenv(dotenv_path)

def check_environment():
    """Check if the test environment is properly configured."""
    print("🔍 Checking test environment...")

    # Check if .env file exists
    env_file = Path(".env")
    if not env_file.exists():
        print("❌ No .env file found in backend directory")
        print("   Please create a .env file with your GEMINI_API_KEY")
        return False

    # Check API key
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ GEMINI_API_KEY environment variable not set")
        print("   Please add GEMINI_API_KEY=your_key to your .env file")
        return False

    if not api_key.startswith("AIzaSy"):
        print("⚠️  GEMINI_API_KEY doesn't look like a proper Gemini API key")
        print("   Gemini API keys typically start with 'AIzaSy'")

    print("✅ Environment looks good!")
    print(f"📍 API Key: {api_key[:20]}...")
    return True

def run_tests(test_filter=None, verbose=True):
    """Run the classifier tests."""
    import subprocess

    # Use the same python executable as this script (ensures venv is used)
    cmd = [sys.executable, "-m", "pytest", "tests/test_classifier.py"]

    if test_filter:
        cmd.extend(["-k", test_filter])

    if verbose:
        cmd.extend(["-v", "--tb=short"])

    print(f"🚀 Running: {' '.join(cmd)}")
    print("=" * 60)

    try:
        result = subprocess.run(cmd, cwd=os.getcwd())
        return result.returncode == 0
    except KeyboardInterrupt:
        print("\n🛑 Tests interrupted by user")
        return False

def main():
    print("🤖 AgriVote Classifier Integration Tests")
    print("=" * 50)

    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)

    # Check environment
    if not check_environment():
        sys.exit(1)

    # Parse arguments
    if len(sys.argv) > 1:
        if sys.argv[1] in ["-h", "--help"]:
            print("""
Usage: python run_tests.py [test_filter] [options]

Arguments:
  test_filter    Filter tests by keyword (e.g., 'crop', 'pest', 'soil')
  -q, --quiet    Run quietly (less verbose output)
  -h, --help     Show this help message

Examples:
  python run_tests.py               # Run all tests
  python run_tests.py crop          # Run only crop-related tests
  python run_tests.py soil -q       # Run soil tests quietly

⚠️  WARNING: These tests make real Gemini API calls!
   This will consume your API quota and may incur charges.
""")
            sys.exit(0)

        test_filter = sys.argv[1]
        verbose = "--quiet" not in sys.argv and "-q" not in sys.argv
    else:
        test_filter = None
        verbose = True

    # Confirm with user
    print("\n⚠️  IMPORTANT WARNING ⚠️")
    print("These tests will make real calls to Google's Gemini API!")
    print("This may consume your API quota and incur billing charges.")

    if test_filter:
        print(f"Running tests with filter: '{test_filter}'")

    try:
        confirm = input("\nDo you want to proceed? (y/N): ").strip().lower()
        if confirm not in ["y", "yes"]:
            print("🛑 Test run cancelled by user")
            sys.exit(0)
    except KeyboardInterrupt:
        print("\n🛑 Test run cancelled by user")
        sys.exit(0)

    # Run tests
    print("\n⏳ Starting integration tests...")
    success = run_tests(test_filter, verbose)

    if success:
        print("\n✅ All tests completed successfully!")
    else:
        print("\n❌ Some tests failed. Check the output above for details.")
        sys.exit(1)

if __name__ == "__main__":
    main()
