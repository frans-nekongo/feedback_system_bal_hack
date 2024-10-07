# 🎓 Dynamic Feedback & Memo System 📚✨

**Crafted with Ballerina 🏗️ ,Kafka and NextJs 🎯**

---

## 🌟 What is this?

This is my project for the **BALLERINA X NUST** hackathon  a **Dynamic Feedback & Memo System** designed to enhance learning through **iterative feedback**. It's made for students and lecturers to collaborate efficiently during assessments. 

---

## 🎯 Purpose

Help students **learn and improve** through:

1. 📝 Submitting questions for tests.
2. 🚀 Building a test from various students' questions.
3. 📩 Receiving memos for the test from a lecturer.
4. 📊 Lecturers get Analytics for insights into which chapters most questions come from.

---

## 🛠️ How it works

- Students submit their questions. 
- These questions are pooled into a test 🧩.
- Lecturers create a **memo** 🧾 for the test.
- The **memo is released** to students for them to review 💡.

---

## 🔧 Tech Stack

- **Ballerina** 🐘 for service orchestration.
- **Nextjs** ⚛️ for Frontend.
- **Kafka** 🗣️ for real-time communication.
- **MySQL** 🛢️ for storing questions, answers and users.

---
## 🏗️ System Architecture Breakdown

This project is built using a **microservice architecture** with **Kafka** as the backbone for communication between services. It consists of **3 primary services** and a set of **8 Kafka topics** to streamline message flow. Here's how it all ties together:

### 🛠️ Services:

1. **Auth Service** 🔒:
   - Manages user authentication.
   - sends user credentials .
   
2. **Dynamic Service** 🔄:
   - This is the core of the system, managing all user interactions with the **database** and **Kafka**.
   - Responsible for processing test questions, feedback requests, and memos.
   
3. **Management Service** 📡:
   - Orchestrates the flow of requests between clients and Kafka topics.
   - Ensures that each client request is correctly routed to the appropriate service via Kafka.

### 🔗 Kafka Topics:

The system utilizes **8 Kafka topics** for handling different types of requests and responses:

- `authreq` 🔑: Handles requests for authentication.
- `authrep` 🔐: Sends responses for authentication requests.
  
- `quereq` ❓: Handles requests for submitting questions.
  
- `memreq` 💭: Handles requests for test memos (lecturers submitting answers).
  
- `memDuereq` 📅: Handles requests for retrieving memos .
- `memDuerep` 📨: Sends responses containing the memos .

- `testreq` 🎓: Handles requests retrieving test questions.
- `testrep` ✅: Sends responses with test details.

### 🎨 Frontend Technology:

The system's frontend is powered by **Next.js** ⚛️, which provides a seamless user experience for both students and lecturers. Next.js offers:

- **Server-side rendering** for fast page loads.
- **API routes** for handling interactions between the client and the microservices.
  
This architecture ensures that the system is scalable, efficient, and easy to maintain, while providing a solid foundation for adding future services and features with ease.

---

## 🚀 Future Add-ons

- **Auto-marking** 📝: Automatically grade student answers based on keywords.
- **Improve Analytics** 📊: Get insights into student performance and improvement.

---

## 🧠 Why Ballerina?

Its their hackathon lol but,Ballerina makes it super easy to add services 🛠️ and scale the system seamlessly, all while handling complex integrations with simplicity and power 💪,connecting to a DB!! simple , Kafka Topic Routing!! puts up a fight, etc... 

---

## 🌟 Try it out!.... [reminder add folder for sql databse create command with all tables,++ other]

Explore the code, and feel free to suggest improvements or advice! Let’s make education better together! 🌍👩‍💻👨‍💻

![image](https://github.com/user-attachments/assets/35a98b96-23aa-4974-9012-1e48024a0370)

