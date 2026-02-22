# Product Requirements Document: Internship Transcript Management System

## 1. Product Overview
The **Internship Transcript Management System** is a full-stack web application designed to manage, evaluate, and track internship transcripts and related documentation. It provides a comprehensive platform for administrators, academic staff, and students to handle the lifecycle of an internship, from managing general competencies to automated correspondence.

### Tech Stack
*   **Backend:** NestJS / Express.js, MongoDB (Mongoose), Swagger, Puppeteer (for PDFs).
*   **Frontend:** Nuxt.js / Vue.js, CoreUI/Vuetify (for Administrator templates), Chart.js (for data visualization).

## 2. Target Audience & User Personas
*   **Administrators:** Central figures who manage student databases, import data from external sheets (Excel/CSV), and configure academic structures (Schools, Programs, Courses).
*   **Advisors / Academic Staff:** Verify student competencies, provide specific and general evaluations, and maintain correspondence with students regarding their internship status.
*   **Students:** The subjects of the system whose internship activities, competencies, and achievements are being tracked and recorded.

## 3. Core Modules & Features

### 3.1 Authentication & Dashboard
*   **Login System:** Secure authentication flow for accessing the system securely.
*   **Analytics Dashboard:** Visual representation of key metrics such as total students, evaluated vs. non-evaluated records, and recent system activities using bar and pie charts.

### 3.2 Administrator Management Module
*   **Student Registry:** CRUD operations for the student database.
*   **Student Import Feature:** Ability to bulk import student records via Excel (.xlsx, .xls) and CSV files, automatically mapping data to internal databases including nested relations (Program, School, Course).
*   **Academic Configuration:** Manage the hierarchy of academic entities including Schools, Programs, and specific Courses.

### 3.3 Competencies Module
The core evaluation engine for internship transcripts, divided into:
*   **General Competencies (Soft Skills):** Evaluating overarching skills like communication, teamwork, and leadership.
*   **Specific Competencies (Hard Skills):** Technical evaluation strictly related to the student's program or course of study.
*   **Suggestions & Feedback:** Recording qualitative feedback, areas of improvement, and specific advice from advisors to students.
*   **Detailed Views:** In-depth page views to analyze specific competency metrics per student.

### 3.4 Correspondence (Communication) Module
*   **Advisor Correspondence:** Internal messaging and email system targeting academic advisors for notifications and task management.
*   **Student Correspondence:** Automated and manual communication pipelines to email students regarding transcript updates, evaluations, or missing requirements.

### 3.5 System Settings & Organization
*   **Organization Details:** Configuration of the main institution's details.
*   **Access & Groups:** Role-based access control and grouping.
*   **Verification Status:** Managing the tracking and workflow statuses of individual internship evaluations.

## 4. Data Entity Architecture (Domain Model)

*   **Academic Domain:**
    *   `School`: Faculty or primary academic division.
    *   `Program`: Specific degree or major program.
    *   `Course`: The specific internship or academic class.
*   **Competencies Domain:**
    *   `SoftSkill`: Maps to General Competencies.
    *   `HardSkill`: Maps to Specific Competencies.
    *   `Suggestions`: Linked feedback entries.
*   **Member Domain:**
    *   `Student`: The core entity being evaluated.
    *   `Advisor`: The evaluating staff member.
*   **Settings & Comm Domain:**
    *   `Message`, `Verification`, `Status`, `Group`: Meta-entries supporting application workflows.

## 5. Non-Functional Requirements
*   **Data Export & Reporting:** Ability to generate and download Excel reports and PDF summaries of student evaluations (using Puppeteer/jspdf).
*   **API Documentation:** Fully documented backend using Swagger for frontend integration and future API consumers.
*   **Security:** Rate-limiting, XSS protection, Helmet CSP, and JWT-based authentication to secure sensitive student data.
