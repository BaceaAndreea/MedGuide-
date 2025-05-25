Online Doctor Platform (Work in Progress) 
A comprehensive web platform for medical services, featuring AI diagnosis, doctor appointments, and health management.

Project Overview: 
This platform leverages Spring Boot (backend) and Angular (frontend) to create a full-featured online medical service that connects patients with doctors, facilitates appointment scheduling, and integrates AI technologies for medical diagnostics.

Key Features

For Patients: 
Doctor Search & Filtering: Find doctors by city, county, specialty with access to ratings and availability.
Appointment Scheduling: Book appointments with real-time calendar availability.
Smart Location Services: Find the nearest hospital based on user location.
AI-Based Diagnostics: Specialized AI integration for mammogram screenings to detect breast cancer.
Health Packages: Access to various subscription plans and health packages.
Medical Records: Secure access to test results and medical history.
Notification System: Email reminders for upcoming appointments.
Feedback System: Rate doctors and leave reviews after appointments.

For Doctors:
Availability Management: Set and update available appointment slots.
Patient Records: Access patient medical history and test results.
AI Diagnostic Tools: Leverage advanced AI models for tumor detection and characterization in CT scans, complementing your clinical expertise.

Security Features:
The security layer of the Online Doctor Platform ensures data protection, secure authentication, and role-based access control. This implementation follows industry best practices to safeguard user information and restrict unauthorized access. User passwords are securely stored in the database using BCrypt hashing to prevent exposure in case of a data breach.Configured Spring Security with JWT-based authentication. Applied CORS and CSRF settings to allow secure communication between the frontend and backend. Implemented a helper class for JWT (JSON Web Token) generation, validation, and extraction. Includes methods to generate both Access Tokens (short-lived) and Refresh Tokens (longer-lived).Applied role-based access control (RBAC) using @PreAuthorize annotations.

System Architecture:
Backend: Spring Boot with RESTful API services.
Frontend: Angular for responsive, modern UI.
Database: MySQL.
AI Integration: Machine learning models for medical image analysis.

Map Integration:
The platform features an interactive map showing hospital locations and available doctors, helping patients find the closest medical facilities.

*****Project Status
This project is actively being developed. Core features are under implementation and testing.  This project is actively being developed as part of my Bachelor's thesis
