XFlyve — Transport Aotomation System

XFlyve is a full-stack logistics automation platform designed to replace spreadsheet-based coordination and manual workflows used by small transport companies.

It automates job assignments, driver workflows, and Proof-of-Delivery (POD) handling, reducing manual administrative work by ~70%.

🚀 Live Demo

Frontend: https://xflyve.vercel.app

Backend API: https://xflyve.onrender.com

🧩 Problem

Before XFlyve, daily operations relied on:

WhatsApp messages and phone calls

Excel sheets updated manually

PODs shared informally as images

No central system for job tracking

This caused data loss, duplicated work, and heavy admin overhead.

💡 Solution

XFlyve provides a single internal platform with role-based access for admins and drivers, centralizing all operational workflows.

✨ Features
Admin

Manage drivers, trucks, and job assignments

View submitted work diaries and PODs

Track job status in one place

Generate reports and export data

Secure role-based authentication

Driver

View assigned jobs and vehicles

Upload daily work logs and POD images

Update job status in real time

🛠️ Tech Stack

Frontend

React (Vite)

Material UI

Axios

Backend

Node.js

Express

MongoDB Atlas

JWT Authentication

Storage

Cloudinary (POD images & work diaries)

Security & Middleware

CORS

Helmet

Rate limiting

Compression

Deployment

Frontend: Vercel

Backend: Render

🏗️ Architecture

RESTful API design

MVC-style backend structure

Role-based access control

Scalable schema for future features (GPS, notifications, payroll automation)

📁 Project Structure
Backend
backend/
├── config/        # DB & Cloudinary setup
├── controllers/   # Business logic
├── middlewares/   # Auth, validation, error handling
├── models/        # Mongoose schemas
├── routes/        # API endpoints
├── utils/         # Helper functions
└── server.js      # Entry point

Frontend
xflyve-frontend/
├── src/
│   ├── api/
│   ├── components/
│   ├── pages/
│   ├── contexts/
│   └── layouts/
├── index.html
└── package.json

⚙️ Environment Variables
Backend (.env)
PORT=3001
MONGO_URI=
JWT_SECRET=
FRONTEND_URL=https://xflyve.vercel.app
CORS_WHITELIST=https://xflyve.vercel.app
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

Frontend (.env)
VITE_API_URL=https://xflyve.onrender.com/api
NODE_ENV=production

▶️ Running Locally
Frontend
cd xflyve-frontend
npm install
npm run build

Backend
cd backend
npm install
npm run start

🧪 Demo Credentials

Admin

Email: admin@example.com

Password: admin123

Driver

Email: kapil@example.com

Password: kapil123

📈 Impact

Reduced admin workload by ~70%

Faster POD submissions

Centralized job tracking

Fewer communication gaps

📚 What I Learned

Designing systems around real operational problems

Structuring scalable REST APIs

Role-based authentication & security

File handling and cloud storage integration

Deploying and maintaining full-stack apps

🔗 Links

Live App: https://xflyve.vercel.app

GitHub: https://github.com/Noobod/XFlyve
