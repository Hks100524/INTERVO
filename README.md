# 🚀 INTERVO - AI Interview Preparation Platform

INTERVO is a full-stack AI-powered interview preparation platform that helps students and job seekers practice technical interviews, receive AI-generated feedback, track performance, and improve their interview skills.

🌐 Live Demo: https://intervo-azure.vercel.app

---

## 📌 Overview

Preparing for technical interviews can be difficult without proper feedback.

INTERVO solves this problem by providing:

- AI-generated interview questions
- Real-time answer evaluation
- AI-powered feedback
- Performance analytics
- Session tracking
- User authentication
- Google OAuth login

The platform simulates an interview environment and helps users improve through continuous practice.

---

## ✨ Features

### 🔐 Authentication & Security

- JWT Authentication
- Secure Login & Signup
- Google OAuth Login
- Protected Routes
- Persistent Sessions
- Secure Cookie Handling

### 🤖 AI Interview Engine

- Dynamic Interview Questions
- AI-Powered Answer Analysis
- Instant Feedback Generation
- Performance Scoring
- Improvement Suggestions

### 📊 Dashboard Analytics

- Total Practice Sessions
- Average Performance Score
- Session History Tracking
- Progress Monitoring

### 👤 Profile Management

- Profile Information
- Username Update
- Password Change
- Profile Image Upload
- Google Account Integration

### ☁️ Cloud Features

- Cloudinary Image Storage
- MongoDB Atlas Database
- Vercel Deployment

---

## 🏗️ Tech Stack

### Frontend

- Next.js 16
- TypeScript
- Tailwind CSS
- React

### Backend

- Next.js API Routes
- Node.js

### Database

- MongoDB Atlas
- Mongoose

### Authentication

- JWT
- Google OAuth 2.0

### AI

- Google Gemini API

### Media Storage

- Cloudinary

### Deployment

- Vercel

---

## 📂 Project Structure

```bash
src/
│
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── feedback/
│   │   ├── generate/
│   │   └── sessions/
│   │
│   ├── dashboard/
│   ├── profile/
│   ├── practice/
│   └── home/
│
├── components/
│   ├── auth/
│   ├── dashboard/
│   ├── profile/
│   └── ui/
│
├── context/
│
├── lib/
│   ├── mongodb/
│   ├── oauth/
│   └── cloudinary/
│
├── models/
│
└── middleware.ts
```

---

## 🔄 Application Flow

```text
User Login
      ↓
Authentication
      ↓
Dashboard
      ↓
Start Practice Session
      ↓
AI Generates Questions
      ↓
User Answers Questions
      ↓
Gemini AI Evaluates Answers
      ↓
Feedback & Score Generated
      ↓
Results Stored in MongoDB
      ↓
Dashboard Analytics Updated
```

---

## 📸 Screenshots

### Home Page

(Add Screenshot)

### Dashboard

(Add Screenshot)

### Practice Page

(Add Screenshot)

### AI Feedback

(Add Screenshot)

### Profile Page

(Add Screenshot)

---

## 🔑 Environment Variables

Create a `.env.local` file:

```env
MONGODB_URI=YOUR_MONGODB_URI

JWT_SECRET=YOUR_SECRET

GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_REDIRECT_URI=YOUR_REDIRECT_URI

GEMINI_API_KEY=YOUR_GEMINI_API_KEY

CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
CLOUDINARY_FOLDER=YOUR_FOLDER
```

---

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/Hks100524/INTERVO.git
```

Move into project:

```bash
cd INTERVO
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build project:

```bash
npm run build
```

---

## 🎯 Future Enhancements

- Voice-Based Interviews
- Video Interview Simulation
- Resume Analyzer
- ATS Score Checker
- Company-Specific Interview Sets
- DSA Interview Module
- HR Interview Module
- AI Career Roadmap Generator

---

## 👨‍💻 Author

Harshit Kumar Sharma

- GitHub: https://github.com/Hks100524
- LinkedIn: (Add Your LinkedIn URL)

---

## ⭐ Support

If you found this project useful, consider giving it a star.

It helps the project grow and motivates further development.

⭐ Star this repository if you like it.
