# Capstone Learning Insight Backend

Backend service for the Learning Insight application. This service collects user learning activity, processes it using an AI model (TensorFlow integration), and provides personalized learning insights and recommendations via RESTful APIs.

## 🚀 Tech Stack

* **Runtime:** Node.js
* **Framework:** [Hapi.js](https://hapi.dev/) (@hapi/hapi)
* **Database:** PostgreSQL
* **ORM/Query Builder:** `pg` (node-postgres)
* **Migration:** `node-pg-migrate`
* **Authentication:** JWT (@hapi/jwt)
* **Validation:** Joi
* **Security:** Bcrypt

## 📂 Project Structure

```text
.
├── migrations/       # Database migration files
├── src/
│   ├── api/          # Route handlers (controllers) and Plugin registration
│   ├── services/     # Business logic (Interact with DB and AI Model)
│   ├── validator/    # Joi schemas for request validation
│   ├── exceptions/   # Custom error handling
│   └── server.js     # Hapi server configuration
├── .env              # Environment variables
├── package.json
└── README.md
