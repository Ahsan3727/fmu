# FMU Crime Branch — Backend Setup Guide

## 📁 Folder Structure

```
fmu-backend/
├── config/
│   ├── db.js              → MongoDB connection
│   └── multer.js          → File upload config
├── controllers/
│   ├── authController.js  → Admin login/register
│   └── complaintController.js → Complaint CRUD
├── middleware/
│   ├── auth.js            → JWT protection
│   └── errorHandler.js    → Global error handler
├── models/
│   ├── Admin.js           → Admin schema
│   └── Complaint.js       → Complaint schema
├── routes/
│   ├── auth.js            → /api/auth/*
│   └── complaints.js      → /api/complaints/*
├── uploads/               → Evidence files yahan save honge
│   └── FMU-XXXX-XXXXX/   → Har complaint ka alag folder
├── frontend-service/
│   ├── api.js             → Frontend API calls (copy to src/services/)
│   └── LandingPage.jsx    → Updated LandingPage with backend
├── .env.example           → Environment variables sample
├── package.json
└── server.js              → Entry point
```

---

## 🚀 Setup Steps

### 1. Backend Install

```bash
cd fmu-backend
npm install
```

### 2. .env File Banao

```bash
cp .env.example .env
```

`.env` mein yeh set karo:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/fmu_crime_branch
JWT_SECRET=koi_bhi_random_secret_likho_yahan
JWT_EXPIRE=7d
MAX_FILE_SIZE=10485760
FRONTEND_URL=http://localhost:5173
```

### 3. MongoDB Start Karo

```bash
# Local MongoDB
mongod

# Ya MongoDB Atlas use karo (free):
# https://www.mongodb.com/atlas
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fmu_crime_branch
```

### 4. First SuperAdmin Banao

Backend start karo:
```bash
npm run dev
```

Phir yeh API call karo (Postman ya browser se):
```
POST http://localhost:5000/api/auth/setup
Content-Type: application/json

{
  "name": "Admin",
  "email": "admin@fmu.edu.pk",
  "password": "Admin@123"
}
```

### 5. Frontend Mein Copy Karo

```bash
# api.js copy karo
cp frontend-service/api.js ../src/services/api.js

# LandingPage copy karo
cp frontend-service/LandingPage.jsx ../src/components/LandingPage.jsx
```

### 6. Frontend .env mein add karo

```
VITE_API_URL=http://localhost:5000/api
```

---

## 📡 API Endpoints

### Public (koi bhi use kar sakta hai)
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/complaints | Complaint submit |
| GET | /api/complaints/track/:id | Tracking ID se status check |
| POST | /api/auth/setup | Pehla admin banao (sirf ek baar) |
| POST | /api/auth/login | Admin login |

### Private (Admin token chahiye)
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/complaints | Sab complaints |
| GET | /api/complaints/stats | Dashboard stats |
| GET | /api/complaints/:id | Ek complaint |
| PUT | /api/complaints/:id | Status update |
| DELETE | /api/complaints/:id | Delete |
| GET | /api/auth/me | Apni info |

---

## 🗂️ Uploads Folder

- Har complaint ka alag folder banta hai: `uploads/FMU-XXXXX-XXXXX/`
- Files 10MB tak allowed hain
- Allowed types: JPG, PNG, PDF, DOC, DOCX
- Max 5 files per complaint
"# fmu" 
