# 🔐 Authentication System Update

## 📋 Summary of Changes

The authentication system has been updated to work with the actual backend endpoint structure. The backend doesn't have a unified `/auth/register/` endpoint, so we use a different approach:

1. **User Registration**: Create Appwrite account directly
2. **NGO Registration**: Create Appwrite account + register with `/ngo/` endpoint

## 🚀 Updated Authentication Flow

### 1. **Login Process**
- User enters credentials
- Frontend calls `/auth/login/` endpoint
- Backend validates with Appwrite and checks Django DB for account type
- Returns: JWT + account type + user info
- Frontend stores everything locally and navigates based on account type

### 2. **Registration Process**
- **Step 1**: Create Appwrite account using AppwriteService
- **Step 2**: Login to get JWT token
- **Step 3**: If NGO, register with `/ngo/` endpoint using JWT
- **Step 4**: Store authentication data and navigate

## 📁 Files Modified

### 1. **New Files Created**
- `frontend/api/authService.ts` - New authentication service
- `frontend/README_AUTHENTICATION_UPDATE.md` - This documentation

### 2. **Files Updated**
- `frontend/core/redux/slices/authSlice.ts` - Updated to use new auth service
- `frontend/screens/LoginScreen.tsx` - Simplified login/registration flow
- `frontend/api/karunaApi.ts` - Updated to use new auth service
- `frontend/App.tsx` - Updated navigation logic
- `frontend/package.json` - Added @react-navigation/stack dependency

## 🔧 Key Changes

### **Authentication Service (`authService.ts`)**
```typescript
// Updated methods:
- login(email, password) → Returns { success, appwrite_jwt, user_info }
- register(email, password, name, accountType) → Creates Appwrite account + NGO registration
- logout() → Clears local storage
- makeAPICall(endpoint, options) → Handles authenticated API calls
- checkAuthStatus() → Checks stored authentication
```

### **Registration Flow**
```typescript
// For NGO registration:
1. Create Appwrite account (AppwriteService.createAccount)
2. Login to get JWT (AppwriteService.login)
3. Register NGO with backend (/ngo/ endpoint)
4. Store authentication data
5. Navigate to NGO dashboard
```

## 🎯 Backend Endpoints

### **Available Endpoints**
- `POST /auth/login/` - Login with Appwrite validation
- `POST /ngo/` - Register new NGO (requires JWT)
- `GET /ngo/` - List NGOs (requires JWT)
- `GET /users/profile/whoami/` - Get account type
- `GET /health/` - Health check

### **Missing Endpoints**
- `POST /auth/register/` - **Does not exist** (handled by Appwrite + NGO endpoint)

## 🧪 Testing

### **Test Login Flow**
1. Open app
2. Enter valid credentials
3. Should navigate to appropriate dashboard based on account type

### **Test Registration Flow**
1. Open app
2. Switch to "Register" mode
3. Fill form with new credentials
4. Select "User" or "NGO" account type
5. Submit registration
6. Should navigate to appropriate dashboard

### **Test API Calls**
1. Login successfully
2. Try to access protected endpoints
3. Should work with stored JWT

## 🔍 Debugging

### **Check Authentication Status**
```typescript
// In any component:
const { authenticated, accountType, user } = useSelector((state: any) => state.auth);
console.log('Auth status:', { authenticated, accountType, user });
```

### **Check Stored Data**
```typescript
// In any component:
import AsyncStorage from '@react-native-async-storage/async-storage';

const checkStoredAuth = async () => {
  const jwt = await AsyncStorage.getItem('appwrite_jwt');
  const accountType = await AsyncStorage.getItem('account_type');
  const userInfo = await AsyncStorage.getItem('user_info');
  
  console.log('Stored auth:', { jwt: !!jwt, accountType, userInfo });
};
```

## 🚨 Common Issues

### **1. "No authentication token found"**
- User needs to login again
- Check if JWT is stored in AsyncStorage

### **2. "Authentication expired"**
- Token has expired
- User will be logged out automatically
- Need to login again

### **3. "NGO registration failed"**
- Check if JWT is valid
- Check if NGO endpoint is accessible
- Check backend logs for specific error

### **4. "Appwrite account creation failed"**
- Check Appwrite configuration
- Check network connectivity
- Check if email already exists

## 📱 Backend Requirements

The backend provides these endpoints:

### **POST /auth/login/**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### **Response Format**
```json
{
  "success": true,
  "appwrite_jwt": "token_here",
  "user_info": {
    "user_id": "id_here",
    "account_type": "user|ngo|new",
    "name": "User Name",
    "email": "user@example.com",
    "verified": true
  }
}
```

### **POST /ngo/** (for NGO registration)
```json
{
  "name": "NGO Name",
  "email": "ngo@example.com",
  "phone": "",
  "description": "NGO description",
  "category": "animal",
  "latitude": "0.0",
  "longitude": "0.0",
  "website": ""
}
```

## ✅ Success Criteria

- [ ] Login works with existing accounts
- [ ] User registration works (Appwrite only)
- [ ] NGO registration works (Appwrite + backend)
- [ ] Navigation works based on account type
- [ ] API calls work with stored JWT
- [ ] Logout clears all stored data
- [ ] Error handling works properly

## 🎉 Ready for Testing!

The authentication system is now updated and ready for testing with your backend. The registration flow now properly handles the actual backend structure.

### **Updated Backend URL**
- Changed from `http://192.168.29.139:8000` to `http://192.168.1.6:8000`

### **Registration Process**
1. **User Registration**: Appwrite account creation only
2. **NGO Registration**: Appwrite account + backend NGO registration 