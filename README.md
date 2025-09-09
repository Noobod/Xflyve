# Xflyve Transport Management System

**Xflyve** is a full-stack logistics platform designed to automate 70% of manual work for admins and drivers in transportation companies. It streamlines job assignments, truck management, work diaries, and Proof of Delivery (POD) uploads.

Live Demo:  
- **Frontend:** [xflyve.vercel.app](https://xflyve.vercel.app)  
- **Backend:** [xflyve.onrender.com](https://xflyve.onrender.com)  

---

## Features

### Admin
- Manage drivers, trucks, and job assignments  
- View work diaries and PODs  
- Generate reports and export to Excel  
- Role-based authentication  

### Driver
- View assigned jobs and trucks  
- Upload daily work logs and PODs  
- Track job status in real-time  

---

## Tech Stack

- **Frontend:** React, Vite, Material UI, Axios  
- **Backend:** Node.js, Express, MongoDB Atlas, JWT Authentication  
- **Storage:** Cloudinary (for PODs & diaries)  
- **Security:** CORS, Helmet, Rate Limiting, Compression  
- **Deployment:** Vercel (Frontend), Render (Backend)  

---

## Project Structure

**Backend**
backend/
├── config/ # DB and Cloudinary setup
├── controllers/ # API logic
├── middlewares/ # Auth, validation, error handling
├── models/ # Mongoose schemas
├── routes/ # API endpoints
├── utils/ # Helpers
├── uploads/ # Uploaded files
└── server.js # Entry point

**Frontend**
xflyve-frontend/
├── src/
│ ├── api.js
│ ├── components/
│ ├── pages/
│ ├── contexts/
│ └── layouts/
├── index.html
└── package.json

---

## Environment Variables

**Backend (.env)**
- PORT=3001
- MONGO_URI=<Your MongoDB Atlas URI>
- JWT_SECRET=<Your JWT Secret>
- FRONTEND_URL=https://xflyve.vercel.app
- CORS_WHITELIST=https://xflyve.vercel.app
- NODE_ENV=production
- CLOUDINARY_CLOUD_NAME=<Cloudinary Cloud Name>
- CLOUDINARY_API_KEY=<Cloudinary API Key>
- CLOUDINARY_API_SECRET=<Cloudinary API Secret>

**Frontend (.env)**
- VITE_API_URL=https://xflyve.onrender.com/api
- NODE_ENV=production

---

## Setup Instructions

### Frontend
```bash
cd xflyve-frontend
npm install
npm run build
```
### Backend
```bash
cd backend
npm install
npm run start
```

---

### Notes
- Ensure CORS allows frontend domain
- MongoDB Atlas must be accessible
- Cloudinary setup required for file uploads