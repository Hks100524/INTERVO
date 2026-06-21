# 🚀 INTERVO

### AI-Powered Interview Preparation Platform

INTERVO is a production-ready full-stack AI interview preparation platform that helps students and job seekers practice technical interviews, receive AI-generated feedback, track performance, and improve interview readiness through personalized practice sessions.

🌐 Live Demo: https://intervo-azure.vercel.app

---

## 🎯 Problem Statement

Many students struggle to prepare for technical interviews because they lack:

- Structured interview practice
- Instant feedback
- Performance tracking
- Personalized improvement suggestions

INTERVO solves this by simulating interview sessions and providing AI-powered evaluation and analytics.

---

## ✨ Key Features

### Authentication

- Secure JWT Authentication
- Google OAuth Login
- Protected Routes
- Persistent User Sessions

### AI Interview Engine

- AI Generated Questions
- AI Powered Feedback
- Answer Evaluation
- Performance Scoring

### Analytics Dashboard

- Session Tracking
- Performance Monitoring
- Average Score Analysis
- Historical Results

### User Profile

- Username Management
- Password Updates
- Profile Image Upload
- Google Account Integration

### Cloud Services

- MongoDB Atlas
- Cloudinary Storage
- Vercel Deployment


## 🏗️ System Architecture

```text
┌──────────────────────┐
│        User          │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Next.js Frontend   │
│  (React + TS)        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Authentication Layer │
│ JWT + Google OAuth   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   API Route Layer    │
│  Next.js Backend     │
└───────┬───────┬──────┘
        │       │
        │       │
        ▼       ▼

┌─────────────┐   ┌──────────────┐
│ MongoDB     │   │ Gemini AI    │
│ Atlas       │   │ Evaluation   │
└──────┬──────┘   └──────┬───────┘
       │                 │
       └─────────┬───────┘
                 │
                 ▼

      ┌─────────────────┐
      │ Feedback Engine │
      └────────┬────────┘
               │
               ▼

      ┌─────────────────┐
      │ Dashboard &     │
      │ Analytics       │
      └─────────────────┘
```


## 🚀 Why INTERVO?

Unlike traditional CRUD projects, INTERVO combines:

- Full Stack Development
- Authentication Systems
- AI Integration
- Cloud Storage
- Analytics
- Production Deployment

The project demonstrates practical experience in building scalable, real-world web applications using modern technologies.



## 💡 Skills Demonstrated

### Frontend

- React
- Next.js
- TypeScript
- Tailwind CSS

### Backend

- REST APIs
- Authentication
- JWT
- OAuth

### Database

- MongoDB Atlas
- Mongoose

### Cloud

- Cloudinary
- Vercel

### AI

- Gemini API Integration

### Software Engineering

- Protected Routes
- Session Management
- Error Handling
- API Design
- Deployment Workflow
