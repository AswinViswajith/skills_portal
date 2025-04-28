Project Title

Overview
This is a full-stack web application built with a Node.js + Express backend and a React.js frontend.
It includes authentication (JWT middleware), file uploads, emailing functionality, and organized API routes and controllers.

Tech Stack
1. Frontend: React.js, Vite, TailwindCSS/Custom CSS

2. Backend: Node.js, Express.js

3. Database: (Specify if MongoDB, MySQL, etc. — currently not mentioned)

4. Authentication: JWT (JSON Web Token)

5. Utilities: Nodemailer (Email utility), File Upload (Multer or similar)

6. Other Tools: Git, Vite, ESLint

Project Structure
/backend
 ├── controllers/        # Handles request logic
 ├── Middleware/          # Middleware for authentication (e.g., jwtAuth.js)
 ├── models/              # Database models (if any)
 ├── node_modules/
 ├── public/
 │    └── uploads/        # Uploaded files (images, PDFs, Excel sheets, etc.)
 ├── routes/              # API routes
 ├── uploads/             # (Could be same as public/uploads)
 ├── utils/
 │    └── Email.js        # Email sending utility
 ├── .env                 # Environment variables
 ├── server.js            # Backend server entry point
 ├── package.json         # Backend dependencies and scripts

/frontend
 ├── src/
 │    ├── api/            # API calls
 │    ├── assets/         # Static images and files
 │    ├── components/     # React components
 │    ├── config/         # Configuration files
 │    ├── store/          # State management (Redux/Context)
 │    ├── App.jsx         # Main App component
 │    ├── main.jsx        # Entry point
 │    └── *.css           # Styling
 ├── public/
 │    └── logo.png        # Public static assets
 ├── .env                 # Frontend environment variables
 ├── vite.config.js       # Vite configuration
 ├── package.json         # Frontend dependencies and scripts

.gitignore                # Ignored files for Git
package-lock.json         # Lock file

Setup Instructions

1. Clone the repository
git clone <repository-url>
cd <repository-folder>

2. Install Backend Dependencies
cd backend
npm install

3. Install Frontend Dependencies
cd ../frontend
npm install

4. Configure Environment Variables
Backend .env example:
    PORT=5000
    JWT_SECRET=your_jwt_secret
    EMAIL_USER=your_email@example.com
    EMAIL_PASS=your_email_password

Frontend .env example:
VITE_API_URL=http://localhost:5000/api

5. Running the Application
Backend:
cd backend
npm run dev

Frontend:
cd frontend
npm run dev

The backend will run on http://localhost:5000 and the frontend on http://localhost:5173 (default Vite port).

Features
1. User Authentication with JWT

2. File Uploads (Images, PDFs, Excel sheets)

3. Sending Emails

4. Organized Controllers and Middleware

5. Frontend API integration

6. State Management Setup (Redux/Context API)

Folder Highlights
/backend/public/uploads/: Stores uploaded files such as images, PDFs, and Excel sheets.

/backend/utils/Email.js: Handles sending emails through nodemailer.

/frontend/src/api/: Centralized API call functions.

/frontend/src/components/: Reusable UI components.
