# CNautAssignment

A full-stack project with **Spring Boot backend** and **React + TypeScript frontend** using Vite.  

This project visualizes users and their relationships, supports CRUD operations, hobbies management, and provides a popularity score system. The backend exposes REST APIs documented via **Swagger**, and the frontend is an interactive graph-based visualization.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup & Running](#setup--running)
  - [1. Backend](#1-backend)
  - [2. Frontend](#2-frontend)
- [Building Frontend for Production](#building-frontend-for-production)
- [Notes](#notes)
- [License](#license)

---

## Project Structure

CNautAssignment/
├─ Backend/ # Spring Boot backend
│ ├─ src/
│ ├─ pom.xml
│ └─ ...
├─ Frontend/ # React + TypeScript frontend (Vite)
│ ├─ src/
│ ├─ package.json
│ └─ ...
└─ README.md

- **Backend**: Handles REST APIs, database operations, and Swagger documentation.  
- **Frontend**: Interactive visualization of users, friends, and hobbies.

---

## Prerequisites

- Java 17+  
- Maven  
- Node.js 20+  
- npm (or yarn)  
- Optional: IDEs like IntelliJ, VSCode  

---

## Setup & Running

### 1. Backend

1. Open a terminal in the **Backend** folder:

```bash
cd Backend
mvn clean spring-boot:run
```

- **Backend** runs at http://localhost:8080/.
- **Swagger API docs**: http://localhost:8080/swagger-ui/index.html.

Make sure backend is running before starting the frontend, otherwise API requests will fail.

2. Frontend

  1. Open a new terminal in the Frontend folder:

cd Frontend


  2. Install dependencies (first time only):

npm install


  3. Start the development server:

npm run dev


- Frontend runs at the port shown in the console (usually http://localhost:5173/).
- The frontend communicates with the backend API.

##  Building Frontend for Production

  1. Build the frontend:

npm run build


This generates a dist/ folder containing the production-ready files.

  2. Optionally, serve frontend via Spring Boot:

- Copy dist/ contents into Backend/src/main/resources/static/frontend/.

- Adjust vite.config.ts base option to /frontend/ before building.

- Then visit http://localhost:8080/frontend/ to access the production frontend.

**Notes**

- Backend must start before frontend to ensure API requests work.

- Landing page can provide links to Swagger docs and Frontend App.

- You can customize React routes if needed, just ensure the base path matches Spring Boot static folder setup.

- .env file in frontend contains API base URL:

**VITE_API_BASE=http://localhost:8080/api**

Recommended .gitignore
# Node
node_modules/
dist/
.env

# Java / Maven
target/
*.log
*.class
*.jar

# IDE
.vscode/
.idea/
*.iml

License

This project is open-source and available for use under the MIT License.

Happy coding! 🚀


---

This README:  

- Explains **project structure** clearly.  
- Guides a developer to **run backend first, then frontend**.  
- Includes instructions for **building React for production** and serving via Spring Boot.  
- Mentions `.env` setup and gitignore.  

