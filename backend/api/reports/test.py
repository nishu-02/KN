"""
Django + Appwrite API Tester - FIXED VERSION
One-click testing for your entire API flow!
"""

import requests
import json
import time
from pathlib import Path

class AppwriteAPITester:
    def __init__(self):
        # Configuration
        self.appwrite_endpoint = "https://cloud.appwrite.io/v1"
        self.project_id = ""
        self.django_base_url = "http://127.0.0.1:8000"
        
        # Test credentials
        self.test_email = "test2@gmail.com"
        self.test_password = "02640264"
        
        # Will be set after login
        self.session_id = None
        self.jwt_token = None
        self.user_id = "685415b70009b7fdc2fc"  # Your test user ID
        self.successful_headers = None  # Store working auth headers
        
        # Test data
        self.test_location = {"latitude": "28.6139", "longitude": "77.2090"}
        self.ngo_data = {
            "name": "Helping Paws",
            "description": "We rescue injured street animals.",
            "location": "Delhi",
            "category": "Animal Rescue",
            "contact_email": "contact@helpingpaws.org",
            "contact_phone": "1234567890"
        }
        
        print("🚀 Django + Appwrite API Tester Initialized!")
        print(f"📧 Test Email: {self.test_email}")
        print(f"🏗️  Project ID: {self.project_id}")
        print("-" * 50)

    def login_to_appwrite(self):
        """Step 1: Login to Appwrite and get session"""
        print("🔐 Step 1: Logging into Appwrite...")
        
        url = f"{self.appwrite_endpoint}/account/sessions/email"
        headers = {
            "Content-Type": "application/json",
            "X-Appwrite-Project": self.project_id
        }
        payload = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            
            if response.status_code == 201:
                session_data = response.json()
                self.session_id = session_data.get('$id')
                print(f"✅ Login successful! Session ID: {self.session_id[:20]}...")
                return True
            else:
                print(f"❌ Login failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Login error: {str(e)}")
            return False

    def get_jwt_token(self):
        """Step 2: Get JWT token for API calls"""
        print("🎫 Step 2: Getting JWT token...")

        url = f"{self.appwrite_endpoint}/account/jwt"
        headers = {
            "Content-Type": "application/json",
            "X-Appwrite-Project": self.project_id
        }

        try:
            # 🔥 Use a session to retain cookies (just like curl -b cookies.txt)
            session = requests.Session()

            # Login again within this session
            login_response = session.post(
                f"{self.appwrite_endpoint}/account/sessions/email",
                headers=headers,
                json={"email": self.test_email, "password": self.test_password}
            )

            if login_response.status_code != 201:
                print(f"❌ Re-login failed during JWT step")
                print(f"Response: {login_response.text}")
                return False

            # ✅ Now request the JWT using same session (with cookies)
            jwt_response = session.post(url, headers=headers)

            if jwt_response.status_code == 201:
                jwt_data = jwt_response.json()
                self.jwt_token = jwt_data.get('jwt')
                print(f"✅ JWT token acquired! Token: {self.jwt_token[:30]}...")
                return True
            else:
                print(f"❌ JWT token failed: {jwt_response.status_code}")
                print(f"JWT Error: {jwt_response.text}")
                return False

        except Exception as e:
            print(f"❌ JWT error: {str(e)}")
            return False

    def get_auth_headers(self):
        """Get authentication headers - try JWT first, then session"""
        if self.jwt_token:
            return {"Authorization": f"Bearer {self.jwt_token}"}
        elif self.session_id:
            # Return session cookie
            return {}, {f"a_session_{self.project_id}": self.session_id}
        else:
            return {}

    def test_upload_report(self):
        """Test: Upload an injury report"""
        print("📤 Testing: Upload Injury Report...")

        url = f"{self.django_base_url}/reports/upload/"

        # Get auth headers and cookies
        if self.jwt_token:
            headers = {"Authorization": f"Bearer {self.jwt_token}"}
            cookies = None
            print("🔑 Using JWT authentication")
        elif self.session_id:
            headers = {}
            cookies = {f"a_session_{self.project_id}": self.session_id}
            print("🍪 Using session cookie authentication")
        else:
            print("❌ No authentication method available!")
            return None

        try:
            with open('injured_dog.jpg', 'rb') as image_file:
                files = {
                    'user_id': (None, self.user_id),
                    'location': (None, json.dumps(self.test_location)),
                    'image': ('injured_dog.jpg', image_file, 'image/jpeg')
                }

                response = requests.post(url, headers=headers, files=files, cookies=cookies)

            if response.status_code in [200, 201]:
                print(f"✅ Upload successful: {response.status_code}")
                result = response.json()
                print(f"📄 Response: {json.dumps(result, indent=2)}")
                return result.get('id') or result.get('report_id')
            else:
                print(f"❌ Upload failed: {response.status_code}")
                print(f"Response: {response.text}")
                return None

        except Exception as e:
            print(f"❌ Upload error: {str(e)}")
            return None


    def test_get_nearby_reports(self):
        """Test: Get nearby reports"""
        print("🗺️  Testing: Get Nearby Reports...")
        
        url = f"{self.django_base_url}/reports/nearby/"
        params = {
            'lat': self.test_location['latitude'],
            'lon': self.test_location['longitude']
        }
        
        # Get auth headers and cookies
        if self.jwt_token:
            headers = {"Authorization": f"Bearer {self.jwt_token}"}
            cookies = None
        elif self.session_id:
            headers = {}
            cookies = {f"a_session_{self.project_id}": self.session_id}
        else:
            headers = {}
            cookies = None
        
        try:
            response = requests.get(url, headers=headers, params=params, cookies=cookies)
            
            if response.status_code == 200:
                print(f"✅ Nearby reports retrieved successfully!")
                reports = response.json()
                print(f"📄 Found {len(reports) if isinstance(reports, list) else 'unknown'} reports")
                return reports
            else:
                print(f"❌ Get nearby failed: {response.status_code}")
                print(f"Response: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Get nearby error: {str(e)}")
            return None

    def test_register_ngo(self):
        """Test: Register as NGO"""
        print("🏥 Testing: Register as NGO...")
        
        url = f"{self.django_base_url}/ngo/register/"
        
        # Get auth headers and cookies
        if self.jwt_token:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.jwt_token}"
            }
            cookies = None
        elif self.session_id:
            headers = {"Content-Type": "application/json"}
            cookies = {f"a_session_{self.project_id}": self.session_id}
        else:
            headers = {"Content-Type": "application/json"}
            cookies = None
        
        try:
            response = requests.post(url, headers=headers, json=self.ngo_data, cookies=cookies)
            
            if response.status_code in [200, 201]:
                print(f"✅ NGO registration successful: {response.status_code}")
                result = response.json()
                print(f"📄 NGO Data: {json.dumps(result, indent=2)}")
                return True
            else:
                print(f"❌ NGO registration failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ NGO registration error: {str(e)}")
            return False

    def test_get_ngo_reports(self):
        """Test: Get NGO assigned reports"""
        print("📋 Testing: Get NGO Assigned Reports...")
        
        url = f"{self.django_base_url}/reports/ngo/"
        
        # Get auth headers and cookies
        if self.jwt_token:
            headers = {"Authorization": f"Bearer {self.jwt_token}"}
            cookies = None
        elif self.session_id:
            headers = {}
            cookies = {f"a_session_{self.project_id}": self.session_id}
        else:
            headers = {}
            cookies = None
        
        try:
            response = requests.get(url, headers=headers, cookies=cookies)
            
            if response.status_code == 200:
                print(f"✅ NGO reports retrieved successfully!")
                reports = response.json()
                print(f"📄 Response: {json.dumps(reports, indent=2)}")
                return reports
            else:
                print(f"❌ Get NGO reports failed: {response.status_code}")
                print(f"Response: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Get NGO reports error: {str(e)}")
            return None

    def test_accept_report(self, report_id="5d027a18-d859-4558-b48c-e64d314fc34d"):
        """Test: Accept a report"""
        print(f"✋ Testing: Accept Report {report_id}...")
        
        url = f"{self.django_base_url}/ngo/reports/{report_id}/accept/"
        payload = {
            "lat": "28.644800",
            "lon": "77.216721"
        }
        
        # Get auth headers and cookies
        if self.jwt_token:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.jwt_token}"
            }
            cookies = None
        elif self.session_id:
            headers = {"Content-Type": "application/json"}
            cookies = {f"a_session_{self.project_id}": self.session_id}
        else:
            headers = {"Content-Type": "application/json"}
            cookies = None
        
        try:
            response = requests.post(url, headers=headers, json=payload, cookies=cookies)
            
            if response.status_code in [200, 201]:
                print(f"✅ Report acceptance successful: {response.status_code}")
                result = response.json()
                print(f"📄 Response: {json.dumps(result, indent=2)}")
                return True
            else:
                print(f"❌ Accept report failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Accept report error: {str(e)}")
            return False

    def test_resolve_report(self, report_id="5d027a18-d859-4558-b48c-e64d314fc34d"):
        """Test: Resolve a report"""
        print(f"✅ Testing: Resolve Report {report_id}...")
        
        url = f"{self.django_base_url}/reports/resolve-report/{report_id}/"
        payload = {
            "status": "resolved"
        }
        
        # Get auth headers and cookies
        if self.jwt_token:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.jwt_token}"
            }
            cookies = None
        elif self.session_id:
            headers = {"Content-Type": "application/json"}
            cookies = {f"a_session_{self.project_id}": self.session_id}
        else:
            headers = {"Content-Type": "application/json"}
            cookies = None
        
        try:
            response = requests.patch(url, headers=headers, json=payload, cookies=cookies)
            
            if response.status_code == 200:
                print(f"✅ Report resolution successful!")
                result = response.json()
                print(f"📄 Response: {json.dumps(result, indent=2)}")
                return True
            else:
                print(f"❌ Resolve report failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Resolve report error: {str(e)}")
            return False

    def logout_from_appwrite(self):
        """Cleanup: Logout from Appwrite"""
        print("🚪 Logging out from Appwrite...")
        
        url = f"{self.appwrite_endpoint}/account/sessions/current"
        headers = {
            "X-Appwrite-Project": self.project_id,
            "Cookie": f"a_session_{self.project_id}={self.session_id}"
        }
        
        try:
            response = requests.delete(url, headers=headers)
            
            if response.status_code == 204:
                print("✅ Logout successful!")
                return True
            else:
                print(f"❌ Logout failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Logout error: {str(e)}")
            return False

    def test_register_user_appwrite(self):
        """Test: Register a user with Appwrite"""
        print("👤 Testing: Register User (Appwrite)...")
        url = f"{self.appwrite_endpoint}/account"
        headers = {
            "Content-Type": "application/json",
            "X-Appwrite-Project": self.project_id
        }
        payload = {
            "userId": "unique()",
            "email": self.test_email,
            "password": self.test_password,
            "name": "Test User"
        }
        try:
            response = requests.post(url, headers=headers, json=payload)
            if response.status_code == 201:
                print(f"✅ User registration successful: {response.status_code}")
                print(f"📄 Response: {response.json()}")
                return True
            else:
                print(f"❌ User registration failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
        except Exception as e:
            print(f"❌ User registration error: {str(e)}")
            return False

    def test_save_push_token(self):
        """Test: Save Expo push token"""
        print("🔔 Testing: Save Expo Push Token...")
        url = f"{self.django_base_url}/reports/save-push-token/"
        headers = {"Content-Type": "application/json"}
        if self.jwt_token:
            headers["Authorization"] = f"Bearer {self.jwt_token}"
        payload = {
            "user_id": self.user_id,
            "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
        }
        try:
            response = requests.post(url, headers=headers, json=payload)
            if response.status_code == 200:
                print(f"✅ Push token saved!")
                print(f"📄 Response: {response.json()}")
                return True
            else:
                print(f"❌ Push token save failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Push token error: {str(e)}")
            return False

    def run_all_tests(self):
        """🎯 THE MAGIC BUTTON - Run all tests in sequence!"""
        print("=" * 60)
        print("🎯 STARTING COMPLETE API TEST SUITE")
        print("=" * 60)
        start_time = time.time()
        # Step 0: Register user (Appwrite)
        self.test_register_user_appwrite()
        # Step 1: Authentication
        if not self.login_to_appwrite():
            print("💥 Authentication failed. Stopping tests.")
            return
        # Step 2: Try to get JWT token (optional, will fallback to session)
        jwt_success = self.get_jwt_token()
        if not jwt_success:
            print("⚠️  JWT not available, will use session-based auth")
        print("\n" + "=" * 30)
        print("🧪 RUNNING DJANGO API TESTS")
        print("=" * 30)
        # Step 3: Register as NGO first
        self.test_register_ngo()
        print()
        # Step 4: Upload a report
        uploaded_report_id = self.test_upload_report()
        print()
        # # Step 5: Get nearby reports
        # self.test_get_nearby_reports()
        # print()
        # # Step 6: Get NGO reports
        # self.test_get_ngo_reports()
        # print()
        # # Step 7: Accept a report (use uploaded ID if available)
        # test_report_id = uploaded_report_id or "5d027a18-d859-4558-b48c-e64d314fc34d"
        # self.test_accept_report(test_report_id)
        # print()
        # # Step 8: Resolve the report
        # self.test_resolve_report(test_report_id)
        # print()
        # # Step 9: Save Expo push token
        self.test_save_push_token()
        # Cleanup
        self.logout_from_appwrite()
        end_time = time.time()
        print("\n" + "=" * 60)
        print(f"🎉 TEST SUITE COMPLETED in {end_time - start_time:.2f} seconds!")
        print("=" * 60)
        if self.jwt_token:
            print(f"🎫 Your JWT Token: {self.jwt_token}")
        else:
            print(f"🍪 Using Session ID: {self.session_id}")
        print("💡 Use this for manual testing!")
        print("=" * 60)


def main():
    """Main function - Your one-click magic!"""
    print("🐍 Django + Appwrite API Tester - FIXED VERSION")
    print("Run this script to test your entire API flow!\n")
    
    tester = AppwriteAPITester()
    
    try:
        tester.run_all_tests()
    except KeyboardInterrupt:
        print("\n🛑 Tests interrupted by user.")
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        print("Check your Django server and Appwrite configuration!")


if __name__ == "__main__":
    main()