# ⚡ Energy Management System

A web-based application designed to manage users and their smart energy meters.  
The system enables real-time monitoring of energy consumption and offers secure access for both administrators and clients.  

---

## 🚀 Overview

The **Energy Management System (EMS)** provides a centralized platform for monitoring and managing smart devices in a distributed environment.  
The application supports two user types:

- **Administrators** — manage users, devices, and their associations through full CRUD operations.  
- **Clients** — view their devices, track consumption, and receive alerts when usage exceeds configured limits.  

Additionally, the platform includes a **chat module** that allows communication between clients and administrators, ensuring quick support and feedback.

---

## 🧩 Features

- 🔐 **User Authentication & Role Management** (Admin / Client)
- ⚙️ **CRUD Operations** for users, devices, and device–user associations
- 📊 **Real-Time Energy Monitoring**
- 🚨 **Alert System** for hourly consumption limit exceedance
- 💬 **Admin–Client Chat**
- 🧱 **Dockerized Deployment** for consistent development environments
- 🔁 **RESTful Services** for modular communication
- ⚡ **Scalable Architecture** with Load Balancer and Reverse Proxy

---

## 🛠️ Technologies Used

- **Backend:** Java Spring Boot  
- **Frontend:** JavaScript, HTML, CSS  
- **Database:** MySQL / PostgreSQL  
- **Containerization:** Docker  
- **Communication:** WebSockets, REST API  
- **Security:** Session handling, JWT Authentication, Cookies  
- **Additional Concepts:**  
  - HTTP Protocols & Methods  
  - ORM (Object-Relational Mapping)  
  - Reverse Proxy  
  - Message-Oriented Middleware (Queue vs Topic)  
  - Load Balancing  

---

## 🧱 System Architecture

The system follows a **client–server architecture** with RESTful endpoints for data management and WebSocket connections for real-time updates.  
Docker containers are used for backend, database, and proxy components, ensuring isolated and portable services.
