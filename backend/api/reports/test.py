"""
Django + Appwrite API Tester - FIXED VERSION WITH COMPLETE LOGGING
One-click testing for your entire API flow!
All console output will be saved to 'apitest_output.log'
"""

import requests
import json
import time
import random
import string
from pathlib import Path
import sys
import builtins
from datetime import datetime

class AppwriteAPITester:
    def __init__(self):
        # Setup logging first - before any print statements
        self.setup_logging()
        
        # Configuration
        self.appwrite_endpoint = "https://cloud.appwrite.io/v1"
        self.project_id = ""
        self.django_base_url = "http://192.168.0.104:8000"
        
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
        print(f"📝 Logging to: {self.log_filename}")
        print("-" * 50)

    def setup_logging(self):
        """Setup dual logging to console and file"""
        # Create log filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.log_filename = f"apitest_output_{timestamp}.log"
        
        # Open log file
        self.log_file = open(self.log_filename, "w", encoding="utf-8")
        
        # Write header to log file
        self.log_file.write(f"API Test Log - Started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        self.log_file.write("=" * 60 + "\n\n")
        self.log_file.flush()
        
        # Store original print function
        self._orig_print = builtins.print
        
        # Create custom print function that logs to both console and file
        def dual_print(*args, **kwargs):
            # Print to console (original behavior)
            self._orig_print(*args, **kwargs)
            
            # Print to file
            try:
                # Handle the file parameter if present
                if 'file' in kwargs and kwargs['file'] != sys.stdout:
                    # If file is specified and it's not stdout, don't log to our file
                    return
                
                # Create a copy of kwargs for file logging
                file_kwargs = dict(kwargs)
                file_kwargs['file'] = self.log_file
                file_kwargs['flush'] = True  # Always flush to file
                
                # Print to log file
                self._orig_print(*args, **file_kwargs)
            except Exception as e:
                # If logging fails, at least print the error to console
                self._orig_print(f"[LOGGING ERROR]: {e}")
        
        # Replace the global print function
        builtins.print = dual_print

    def log_section(self, title):
        """Log a section separator"""
        separator = "=" * 50
        print(f"\n{separator}")
        print(f"📋 {title}")
        print(separator)

    def log_step(self, step_num, description):
        """Log a step with numbering"""
        print(f"\n🔸 Step {step_num}: {description}")

    def login_to_appwrite(self):
        """Step 1: Login to Appwrite and get session"""
        self.log_step(1, "Logging into Appwrite")
        
        url = f"{self.appwrite_endpoint}/account/sessions/email"
        headers = {
            "Content-Type": "application/json",
            "X-Appwrite-Project": self.project_id
        }
        payload = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        print(f"🌐 Request URL: {url}")
        print(f"📋 Payload: {json.dumps(payload, indent=2)}")
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            
            print(f"📊 Response Status: {response.status_code}")
            print(f"📄 Response Headers: {dict(response.headers)}")
            
            if response.status_code == 201:
                session_data = response.json()
                self.session_id = session_data.get('$id')
                print(f"✅ Login successful! Session ID: {self.session_id[:20]}...")
                print(f"📄 Full Response: {json.dumps(session_data, indent=2)}")
                return True
            else:
                print(f"❌ Login failed: {response.status_code}")
                print(f"📄 Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Login error: {str(e)}")
            print(f"🔍 Exception type: {type(e).__name__}")
            return False

    def get_jwt_token(self):
        """Step 2: Get JWT token for API calls"""
        self.log_step(2, "Getting JWT token")

        url = f"{self.appwrite_endpoint}/account/jwt"
        headers = {
            "Content-Type": "application/json",
            "X-Appwrite-Project": self.project_id
        }

        print(f"🌐 Request URL: {url}")

        try:
            # 🔥 Use a session to retain cookies (just like curl -b cookies.txt)
            session = requests.Session()

            # Login again within this session
            print("🔄 Re-authenticating for JWT...")
            login_response = session.post(
                f"{self.appwrite_endpoint}/account/sessions/email",
                headers=headers,
                json={"email": self.test_email, "password": self.test_password}
            )

            print(f"📊 Login Response Status: {login_response.status_code}")

            if login_response.status_code != 201:
                print(f"❌ Re-login failed during JWT step")
                print(f"📄 Response: {login_response.text}")
                return False

            # ✅ Now request the JWT using same session (with cookies)
            jwt_response = session.post(url, headers=headers)
            
            print(f"📊 JWT Response Status: {jwt_response.status_code}")

            if jwt_response.status_code == 201:
                jwt_data = jwt_response.json()
                self.jwt_token = jwt_data.get('jwt')
                print(f"✅ JWT token acquired! Token: {self.jwt_token[:30]}...")
                print(f"📄 JWT Response: {json.dumps(jwt_data, indent=2)}")
                return True
            else:
                print(f"❌ JWT token failed: {jwt_response.status_code}")
                print(f"📄 JWT Error: {jwt_response.text}")
                return False

        except Exception as e:
            print(f"❌ JWT error: {str(e)}")
            print(f"🔍 Exception type: {type(e).__name__}")
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
        self.log_section("Testing: Upload Injury Report")

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

        print(f"🌐 Request URL: {url}")
        print(f"📋 Headers: {headers}")
        print(f"🍪 Cookies: {cookies}")

        try:
            # Check if image file exists
            image_path = 'injured_dog.jpg'
            if not Path(image_path).exists():
                print(f"⚠️  Image file not found: {image_path}")
                print("📝 Creating a dummy file for testing...")
                with open(image_path, 'w') as f:
                    f.write("dummy image content")

            with open(image_path, 'rb') as image_file:
                files = {
                    'user_id': (None, self.user_id),
                    'location': (None, json.dumps(self.test_location)),
                    'image': (image_path, image_file, 'image/jpeg')
                }

                print(f"📋 Files data: user_id={self.user_id}, location={self.test_location}")
                response = requests.post(url, headers=headers, files=files, cookies=cookies)

            print(f"📊 Response Status: {response.status_code}")
            print(f"📄 Response Headers: {dict(response.headers)}")

            if response.status_code in [200, 201]:
                print(f"✅ Upload successful: {response.status_code}")
                result = response.json()
                print(f"📄 Response: {json.dumps(result, indent=2)}")
                return result.get('id') or result.get('report_id')
            else:
                print(f"❌ Upload failed: {response.status_code}")
                print(f"📄 Response: {response.text}")
                return None

        except Exception as e:
            print(f"❌ Upload error: {str(e)}")
            print(f"🔍 Exception type: {type(e).__name__}")
            return None

    def test_get_nearby_reports(self):
        """Test: Get nearby reports"""
        self.log_section("Testing: Get Nearby Reports")
        
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
        
        print(f"🌐 Request URL: {url}")
        print(f"📋 Parameters: {params}")
        print(f"📋 Headers: {headers}")
        print(f"🍪 Cookies: {cookies}")
        
        try:
            response = requests.get(url, headers=headers, params=params, cookies=cookies)
            
            print(f"📊 Response Status: {response.status_code}")
            print(f"📄 Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                print(f"✅ Nearby reports retrieved successfully!")
                reports = response.json()
                print(f"📄 Found {len(reports) if isinstance(reports, list) else 'unknown'} reports")
                print(f"📄 Response: {json.dumps(reports, indent=2)}")
                return reports
            else:
                print(f"❌ Get nearby failed: {response.status_code}")
                print(f"📄 Response: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Get nearby error: {str(e)}")
            print(f"🔍 Exception type: {type(e).__name__}")
            return None

    def generate_unique_email(self, prefix="testngo"):
        """Generate a unique email for each test run"""
        rand_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        email = f"{prefix}_{rand_str}@gmail.com"
        print(f"📧 Generated unique email: {email}")
        return email

    def test_register_user_appwrite_with_retry(self, max_retries=3):
        """Register a user with Appwrite, retrying with a new email if user already exists."""
        for attempt in range(max_retries):
            print(f"👤 Attempt {attempt+1} to register user in Appwrite...")
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
                elif response.status_code == 409:
                    print(f"⚠️  User already exists, generating new email...")
                    self.test_email = self.generate_unique_email()
                    payload["email"] = self.test_email
                else:
                    print(f"❌ User registration failed: {response.status_code}")
                    print(f"Response: {response.text}")
                    return False
            except Exception as e:
                print(f"❌ User registration error: {str(e)}")
                return False
        print(f"❌ Failed to register user after {max_retries} attempts.")
        return False

    def test_register_ngo(self):
        """Test: Register as NGO with a new user each time"""
        self.log_section("Testing: Register as NGO with new user")

        # Generate unique email for user and NGO
        unique_email = self.generate_unique_email()
        self.test_email = unique_email
        self.user_id = None  # Reset user_id for new registration

        # ✅ Prepare full NGO payload with required fields
        self.ngo_data = {
            "name": "Helping Paws",
            "description": "We rescue injured street animals.",
            "location": "Delhi",
            "email": unique_email,  # <-- This must match your model
            "contact_email": unique_email,  # Optional/display use
            "phone": "1234567890",
            "latitude": 28.6139,
            "longitude": 77.2090,
            "category": "animal",  # <-- Must match model choices (not label!)
            "website": "https://helpingpaws.org"
        }

        print(f"📋 NGO Data: {json.dumps(self.ngo_data, indent=2)}")

        # Step 1: Register user in Appwrite
        if not self.test_register_user_appwrite_with_retry():
            print("❌ Failed to register new user for NGO registration.")
            return False

        # Step 2: Login
        if not self.login_to_appwrite():
            print("❌ Failed to login new user for NGO registration.")
            return False

        # Step 3: Get JWT
        if not self.get_jwt_token():
            print("❌ Failed to get JWT for new user.")
            return False

        # Step 4: Make the POST request to Django
        url = f"{self.django_base_url}/ngo/register/"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.jwt_token}"
        }

        print(f"🌐 Request URL: {url}")
        print(f"📋 Headers: {headers}")

        try:
            response = requests.post(url, headers=headers, json=self.ngo_data)

            print(f"📊 Response Status: {response.status_code}")
            print(f"📄 Response Headers: {dict(response.headers)}")

            if response.status_code in [200, 201]:
                print(f"✅ NGO registration successful: {response.status_code}")
                result = response.json()
                print(f"📄 NGO Data: {json.dumps(result, indent=2)}")
                return True
            else:
                print(f"❌ NGO registration failed: {response.status_code}")
                print(f"📄 Response: {response.text}")
                return False

        except Exception as e:
            print(f"❌ NGO registration error: {str(e)}")
            print(f"🔍 Exception type: {type(e).__name__}")
            return False

    def test_get_ngo_reports(self):
        """Test: Get NGO assigned reports"""
        self.log_section("Testing: Get NGO Assigned Reports")
        
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
        
        print(f"🌐 Request URL: {url}")
        print(f"📋 Headers: {headers}")
        print(f"🍪 Cookies: {cookies}")
        
        try:
            response = requests.get(url, headers=headers, cookies=cookies)
            
            print(f"📊 Response Status: {response.status_code}")
            print(f"📄 Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                print(f"✅ NGO reports retrieved successfully!")
                reports = response.json()
                print(f"📄 Response: {json.dumps(reports, indent=2)}")
                return reports
            else:
                print(f"❌ Get NGO reports failed: {response.status_code}")
                print(f"📄 Response: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Get NGO reports error: {str(e)}")
            print(f"🔍 Exception type: {type(e).__name__}")
            return None

    def test_accept_report(self, report_id="5d027a18-d859-4558-b48c-e64d314fc34d"):
        """Test: Accept a report"""
        self.log_section(f"Testing: Accept Report {report_id}")
        
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
        
        print(f"🌐 Request URL: {url}")
        print(f"📋 Headers: {headers}")
        print(f"📋 Payload: {json.dumps(payload, indent=2)}")
        print(f"🍪 Cookies: {cookies}")
        
        try:
            response = requests.post(url, headers=headers, json=payload, cookies=cookies)
            
            print(f"📊 Response Status: {response.status_code}")
            print(f"📄 Response Headers: {dict(response.headers)}")
            
            if response.status_code in [200, 201]:
                print(f"✅ Report acceptance successful: {response.status_code}")
                result = response.json()
                print(f"📄 Response: {json.dumps(result, indent=2)}")
                return True
            else:
                print(f"❌ Accept report failed: {response.status_code}")
                print(f"📄 Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Accept report error: {str(e)}")
            print(f"🔍 Exception type: {type(e).__name__}")
            return False

    def test_resolve_report(self, report_id="5d027a18-d859-4558-b48c-e64d314fc34d"):
        """Test: Resolve a report"""
        self.log_section(f"Testing: Resolve Report {report_id}")
        
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
        
        print(f"🌐 Request URL: {url}")
        print(f"📋 Headers: {headers}")
        print(f"📋 Payload: {json.dumps(payload, indent=2)}")
        print(f"🍪 Cookies: {cookies}")
        
        try:
            response = requests.patch(url, headers=headers, json=payload, cookies=cookies)
            
            print(f"📊 Response Status: {response.status_code}")
            print(f"📄 Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                print(f"✅ Report resolution successful!")
                result = response.json()
                print(f"📄 Response: {json.dumps(result, indent=2)}")
                return True
            else:
                print(f"❌ Resolve report failed: {response.status_code}")
                print(f"📄 Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Resolve report error: {str(e)}")
            print(f"🔍 Exception type: {type(e).__name__}")
            return False

    def logout_from_appwrite(self):
        """Cleanup: Logout from Appwrite"""
        self.log_section("Logging out from Appwrite")
        
        url = f"{self.appwrite_endpoint}/account/sessions/current"
        headers = {
            "X-Appwrite-Project": self.project_id,
            "Cookie": f"a_session_{self.project_id}={self.session_id}"
        }
        
        print(f"🌐 Request URL: {url}")
        print(f"📋 Headers: {headers}")
        
        try:
            response = requests.delete(url, headers=headers)
            
            print(f"📊 Response Status: {response.status_code}")
            
            if response.status_code == 204:
                print("✅ Logout successful!")
                return True
            else:
                print(f"❌ Logout failed: {response.status_code}")
                print(f"📄 Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Logout error: {str(e)}")
            print(f"🔍 Exception type: {type(e).__name__}")
            return False

    def test_register_user_appwrite(self):
        """Test: Register a user with Appwrite"""
        self.log_section("Testing: Register User (Appwrite)")
        
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
        
        print(f"🌐 Request URL: {url}")
        print(f"📋 Headers: {headers}")
        print(f"📋 Payload: {json.dumps(payload, indent=2)}")
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            
            print(f"📊 Response Status: {response.status_code}")
            print(f"📄 Response Headers: {dict(response.headers)}")
            
            if response.status_code == 201:
                print(f"✅ User registration successful: {response.status_code}")
                result = response.json()
                print(f"📄 Response: {json.dumps(result, indent=2)}")
                return True
            else:
                print(f"❌ User registration failed: {response.status_code}")
                print(f"📄 Response: {response.text}")
                return False
        except Exception as e:
            print(f"❌ User registration error: {str(e)}")
            print(f"🔍 Exception type: {type(e).__name__}")
            return False

    def test_save_push_token(self):
        """Test: Save Expo push token"""
        self.log_section("Testing: Save Expo Push Token")
        
        url = f"{self.django_base_url}/reports/save-push-token/"
        headers = {"Content-Type": "application/json"}
        if self.jwt_token:
            headers["Authorization"] = f"Bearer {self.jwt_token}"
        payload = {
            "user_id": self.user_id,
            "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
        }
        
        print(f"🌐 Request URL: {url}")
        print(f"📋 Headers: {headers}")
        print(f"📋 Payload: {json.dumps(payload, indent=2)}")
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            
            print(f"📊 Response Status: {response.status_code}")
            print(f"📄 Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                print(f"✅ Push token saved!")
                result = response.json()
                print(f"📄 Response: {json.dumps(result, indent=2)}")
                return True
            else:
                print(f"❌ Push token save failed: {response.status_code}")
                print(f"📄 Response: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Push token error: {str(e)}")
            print(f"🔍 Exception type: {type(e).__name__}")
            return False

    def test_register_ngo_and_report_same_location(self):
        """Register a test NGO and upload a report at the same coordinates, then check assignment."""
        self.log_section("TEST: Register NGO and Report at Same Location")
        
        # Step 1: Register a new NGO at fixed coordinates
        self.test_location = {"latitude": 28.6139, "longitude": 77.2090}
        ngo_email = self.generate_unique_email("testngosame")
        self.test_email = ngo_email
        self.user_id = None
        self.ngo_data = {
            "name": "Test NGO Same Location",
            "description": "Test NGO for assignment check.",
            "location": "Delhi",
            "email": ngo_email,
            "contact_email": ngo_email,
            "phone": "9999999999",
            "latitude": 28.6139,
            "longitude": 77.2090,
            "category": "animal",
            "website": "https://testngosame.org"
        }
        
        print(f"📍 Test location: {self.test_location}")
        print(f"📋 NGO data: {json.dumps(self.ngo_data, indent=2)}")
        
        if not self.test_register_user_appwrite():
            print("❌ Failed to register new user for NGO registration.")
            return False
        if not self.login_to_appwrite():
            print("❌ Failed to login new user for NGO registration.")
            return False
        if not self.get_jwt_token():
            print("❌ Failed to get JWT for new user.")
            return False
            
        url = f"{self.django_base_url}/ngo/register/"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.jwt_token}"
        }
        
        print(f"🌐 NGO Registration URL: {url}")
        print(f"📋 Headers: {headers}")
        
        response = requests.post(url, headers=headers, json=self.ngo_data)
        
        print(f"📊 NGO Registration Status: {response.status_code}")
        
        if response.status_code not in [200, 201]:
            print(f"❌ NGO registration failed: {response.status_code}")
            print(f"📄 Response: {response.text}")
            return False
            
        print(f"✅ Test NGO registered at {self.test_location}")
        
        # Step 2: Upload a report at the same coordinates
        print("\n🔸 Uploading report at same location...")
        uploaded_report_id = self.test_upload_report()
        
        # Step 3: Fetch the report and check ngo_assigned
        print("\n🔸 Checking if report is assigned to the NGO...")
        url = f"{self.django_base_url}/reports/nearby/?lat={self.test_location['latitude']}&lon={self.test_location['longitude']}"
        
        print(f"🌐 Nearby reports URL: {url}")
        
        response = requests.get(url, headers={"Authorization": f"Bearer {self.jwt_token}"})
        
        print(f"📊 Nearby reports status: {response.status_code}")
        
        if response.status_code == 200:
            reports = response.json()
            print(f"📄 Reports response: {json.dumps(reports, indent=2)}")
            
            if isinstance(reports, list) and reports:
                assigned = any(r.get("ngo_assigned") for r in reports)
                print(f"Assignment check: {'✅ At least one report assigned to an NGO' if assigned else '❌ No report assigned to an NGO'}")
            else:
                print("❌ No reports found at this location.")
        else:
            print(f"❌ Failed to fetch reports: {response.status_code}")
            print(f"📄 Response: {response.text}")

    def close_logging(self):
        """Close the log file and restore original print"""
        if hasattr(self, 'log_file') and self.log_file:
            # Write footer to log file
            self.log_file.write(f"\n\n" + "=" * 60)
            self.log_file.write(f"\nAPI Test Log - Ended at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            self.log_file.close()
            
            # Restore original print function
            if hasattr(self, '_orig_print'):
                builtins.print = self._orig_print
            
            print(f"📝 Log saved to: {self.log_filename}")

    def run_all_tests(self):
        """Run all API tests in sequence"""
        self.log_section("🚀 STARTING COMPLETE API TEST SUITE")
        
        test_results = {
            "login": False,
            "jwt": False,
            "upload_report": False,
            "nearby_reports": False,
            "register_ngo": False,
            "ngo_reports": False,
            "accept_report": False,
            "resolve_report": False,
            "push_token": False,
            "location_assignment": False
        }
        
        try:
            # Basic Authentication Tests
            print("\n🔐 === AUTHENTICATION TESTS ===")
            test_results["login"] = self.login_to_appwrite()
            if test_results["login"]:
                test_results["jwt"] = self.get_jwt_token()
            
            # Report Management Tests
            print("\n📋 === REPORT MANAGEMENT TESTS ===")
            if test_results["jwt"]:
                report_id = self.test_upload_report()
                test_results["upload_report"] = report_id is not None
                
                test_results["nearby_reports"] = self.test_get_nearby_reports() is not None
                test_results["push_token"] = self.test_save_push_token()
                
                # Use uploaded report ID or fallback to hardcoded one
                test_report_id = report_id if report_id else "5d027a18-d859-4558-b48c-e64d314fc34d"
                test_results["resolve_report"] = self.test_resolve_report(test_report_id)
            
            # NGO Management Tests
            print("\n🏢 === NGO MANAGEMENT TESTS ===")
            test_results["register_ngo"] = self.test_register_ngo()
            if test_results["register_ngo"]:
                test_results["ngo_reports"] = self.test_get_ngo_reports() is not None
                test_results["accept_report"] = self.test_accept_report()
            
            # Advanced Integration Test
            print("\n🎯 === INTEGRATION TESTS ===")
            try:
                self.test_register_ngo_and_report_same_location()
                test_results["location_assignment"] = True
            except Exception as e:
                print(f"❌ Location assignment test failed: {str(e)}")
                test_results["location_assignment"] = False
            
            # Cleanup
            print("\n🧹 === CLEANUP ===")
            self.logout_from_appwrite()
            
        except Exception as e:
            print(f"❌ Critical error during test execution: {str(e)}")
            print(f"🔍 Exception type: {type(e).__name__}")
        
        finally:
            # Print final results
            self.print_test_summary(test_results)
            self.close_logging()

    def print_test_summary(self, results):
        """Print a summary of all test results"""
        self.log_section("📊 TEST RESULTS SUMMARY")
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        success_rate = (passed / total) * 100
        
        print(f"✅ Tests Passed: {passed}/{total} ({success_rate:.1f}%)")
        print(f"❌ Tests Failed: {total - passed}/{total}")
        print("\n📋 Detailed Results:")
        
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            formatted_name = test_name.replace("_", " ").title()
            print(f"  {status} | {formatted_name}")
        
        print(f"\n{'🎉 ALL TESTS PASSED!' if passed == total else '⚠️  SOME TESTS FAILED'}")
        
        if passed < total:
            print("\n💡 Troubleshooting Tips:")
            if not results["login"]:
                print("  - Check your Appwrite credentials and project ID")
            if not results["jwt"]:
                print("  - Verify session management and cookie handling")
            if not results["upload_report"] or not results["nearby_reports"]:
                print("  - Check Django server is running and accessible")
            if not results["register_ngo"]:
                print("  - Verify NGO registration endpoint and required fields")

    def run_quick_test(self):
        """Run a quick subset of critical tests"""
        self.log_section("⚡ QUICK TEST MODE")
        
        print("🔐 Testing Authentication...")
        if not self.login_to_appwrite():
            print("❌ Quick test failed at login")
            self.close_logging()
            return
            
        if not self.get_jwt_token():
            print("❌ Quick test failed at JWT")
            self.close_logging()
            return
            
        print("📋 Testing Report Upload...")
        report_id = self.test_upload_report()
        
        print("🔍 Testing Nearby Reports...")
        self.test_get_nearby_reports()
        
        result = "✅ Quick test completed successfully!" if report_id else "⚠️  Quick test completed with issues"
        print(f"\n{result}")
        self.close_logging()

    def interactive_mode(self):
        """Interactive mode for running specific tests"""
        self.log_section("🎮 INTERACTIVE MODE")
        
        tests = {
            "1": ("Login & JWT", lambda: self.login_to_appwrite() and self.get_jwt_token()),
            "2": ("Upload Report", self.test_upload_report),
            "3": ("Get Nearby Reports", self.test_get_nearby_reports),
            "4": ("Register NGO", self.test_register_ngo),
            "5": ("Get NGO Reports", self.test_get_ngo_reports),
            "6": ("Accept Report", lambda: self.test_accept_report()),
            "7": ("Resolve Report", lambda: self.test_resolve_report()),
            "8": ("Save Push Token", self.test_save_push_token),
            "9": ("Location Assignment Test", self.test_register_ngo_and_report_same_location),
            "0": ("Run All Tests", self.run_all_tests)
        }
        
        print("\n📋 Available Tests:")
        for key, (name, _) in tests.items():
            print(f"  {key}: {name}")
        
        try:
            choice = input("\n🎯 Enter test number (or 'q' to quit): ").strip()
            
            if choice.lower() == 'q':
                print("👋 Goodbye!")
                self.close_logging()
                return
                
            if choice in tests:
                test_name, test_func = tests[choice]
                print(f"\n🚀 Running: {test_name}")
                
                if choice == "1":  # Login requires special handling
                    if not self.login_to_appwrite():
                        print("❌ Login failed")
                        self.close_logging()
                        return
                    if not self.get_jwt_token():
                        print("❌ JWT failed")
                        self.close_logging()
                        return
                    print("✅ Authentication successful!")
                else:
                    test_func()
                    
            else:
                print("❌ Invalid choice")
                
        except KeyboardInterrupt:
            print("\n\n⏹️  Test interrupted by user")
        except Exception as e:
            print(f"❌ Error in interactive mode: {str(e)}")
        finally:
            self.close_logging()


def main():
    """Main function to run the API tester"""
    print("🎯 Django + Appwrite API Tester")
    print("=" * 50)
    
    # Check command line arguments
    if len(sys.argv) > 1:
        mode = sys.argv[1].lower()
        
        tester = AppwriteAPITester()
        
        if mode == "quick":
            tester.run_quick_test()
        elif mode == "interactive":
            tester.interactive_mode()
        elif mode == "all":
            tester.run_all_tests()
        else:
            print(f"❌ Unknown mode: {mode}")
            print("📋 Available modes: quick, interactive, all")
            tester.close_logging()
    else:
        # Default mode - run all tests
        tester = AppwriteAPITester()
        tester.run_all_tests()


if __name__ == "__main__":
    main()