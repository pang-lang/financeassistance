"""
Simple script to test if the backend API is accessible
Run this while your backend server is running to verify connectivity
"""
import requests
import sys

API_URL = "http://localhost:8000"

def test_connection():
    print("Testing backend connection...")
    print(f"API URL: {API_URL}\n")
    
    # Test 1: Health check
    try:
        response = requests.get(f"{API_URL}/health", timeout=5)
        print(f"✅ Health check: {response.status_code} - {response.json()}")
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to {API_URL}")
        print("   Make sure the backend server is running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # Test 2: Root endpoint
    try:
        response = requests.get(f"{API_URL}/", timeout=5)
        print(f"✅ Root endpoint: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Subscriptions endpoint
    try:
        response = requests.get(f"{API_URL}/subscriptions", timeout=5)
        print(f"✅ Subscriptions endpoint: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Found {len(data)} subscriptions")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 4: CORS test (from frontend origin)
    try:
        headers = {
            "Origin": "http://localhost:4028",
            "Access-Control-Request-Method": "GET"
        }
        response = requests.options(f"{API_URL}/subscriptions", headers=headers, timeout=5)
        print(f"✅ CORS preflight: {response.status_code}")
        print(f"   CORS headers: {dict(response.headers)}")
    except Exception as e:
        print(f"⚠️  CORS test warning: {e}")
    
    print("\n✅ Connection test complete!")
    return True

if __name__ == "__main__":
    test_connection()

