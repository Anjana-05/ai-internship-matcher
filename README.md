# AI-Based Smart Allocation Engine for PM Internship Scheme

This is a full-stack prototype for an AI-Based Smart Allocation Engine designed for a PM Internship Scheme. The application aims to intelligently match students with internship opportunities based on their skills, education, location preferences, and affirmative action categories, optimizing outcomes for both students and industry partners.

## Project Stack

**Frontend:**
*   **Framework:** Vite + React (JSX)
*   **State Management:** React Context API
*   **Routing:** React Router v6
*   **Styling:** Tailwind CSS
*   **API Client:** Axios
*   **Testing:** Vitest (for UI components and form validation)

**Backend:**
*   **Framework:** Node.js + Express.js
*   **Database:** MongoDB (with Mongoose ODM)
*   **Authentication:** JWT (JSON Web Tokens)
*   **Security:** CORS middleware, bcryptjs for password hashing
*   **Environment Variables:** `dotenv`
*   **Development:** `nodemon` for auto-restarts
*   **Testing:** Mocha & Chai (for API endpoint tests)

## Features

### Frontend Pages & Routes

*   **`/` - Landing Page:** Project overview, call-to-action buttons for login/signup or dashboard access based on authentication status.
*   **`/auth/student` - Student Auth Page:** Student login and signup forms.
*   **`/auth/industry` - Industry Auth Page:** Industry login and signup forms.
*   **`/opportunities` - Opportunities Page:** Browse available internship opportunities with filters and search. Students can view details and apply.
*   **`/opportunities/:id/apply` or `/apply` - Application Form / Profile Update Page:** Students can apply to a specific opportunity or update their profile details (skills, education, location preferences).
*   **`/dashboard` - Student Dashboard:** View personal application statuses and AI-recommended opportunities.
*   **`/dashboard/industry` - Industry Dashboard:** Industries can post new opportunities, and view applicants for their posted opportunities.
*   **`/dashboard/admin` - Admin Dashboard:** Admin users can manage all users and opportunities, and trigger the AI matching engine.
*   **`/ai-matches` - AI Matches Page:** View comprehensive AI matching results (Admin) or individual matches (Student).
*   **`/profile/student` - Student Profile Page:** View and update student-specific profile information.
*   **`/profile/industry` - Industry Profile Page:** View and update industry/company-specific profile information.

### Backend Models & Endpoints

*   **User Model:** Student, Industry, and Admin roles.
    *   Fields: `name`, `email`, `password`, `role`. Additional fields for `student` (e.g., `category`, `skills`, `education`, `locationPreferences`) and `industry` (e.g., `companyName`, `companyInfo`).
    *   Endpoints: `/api/auth/signup/:role`, `/api/auth/login/:role`, `/api/users` (Admin: get all users), `/api/users/:id` (Get/Update/Delete user).
*   **Opportunity Model:** Internship opportunities posted by industries.
    *   Fields: `title`, `company` (reference to User), `location`, `sector`, `duration`, `capacity`, `description`, `affirmativeCategory`.
    *   Endpoints: `/api/opportunities` (CRUD), `/api/opportunities/:id` (Get/Update/Delete single).
*   **Application Model:** Records student applications to opportunities.
    *   Fields: `student` (ref to User), `opportunity` (ref to Opportunity), `status`.
    *   Endpoints: `/api/applications` (Create), `/api/applications/me` (Student: get own applications), `/api/applications/opportunity/:id` (Industry: get applicants for an opportunity), `/api/applications/:id/status` (Industry: update application status).
*   **MatchResult Model:** Stores AI matching results.
    *   Fields: `student` (ref to User), `opportunity` (ref to Opportunity), `score`, `explanation` (JSON string for breakdown).
    *   Endpoints: `/api/match/run` (Admin: trigger AI matching), `/api/match/results` (Admin/Student: get results).

### AI Matching Functionality

*   A simple deterministic AI matching function is implemented in the backend that calculates a `score` based on configurable `weights` for:
    *   Skill Overlap
    *   Sector Match
    *   Location Preference
    *   Affirmative Action Priority
*   Matching is triggered by an admin and results are stored.

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

*   Node.js (v18 or higher recommended)
*   MongoDB (Community Edition or MongoDB Atlas account)

### 1. Backend Setup

Navigate to the `backend` directory:

```powershell
cd backend
```

**Install Dependencies:**

```powershell
npm install
```

**Create `.env` file:**

Create a file named `.env` in the `backend` directory. **This file is critical and needs to be created manually due to security configurations.** Copy the contents from `.env.example` into your new `.env` file:

```
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ai_allocation
JWT_SECRET=supersecretjsonwebtokenkey
JWT_EXPIRE=1h
FRONTEND_CORS_ORIGINS=http://localhost:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=adminpass

# AI Matching Weights (configurable)
SKILL_WEIGHT=0.5
SECTOR_WEIGHT=0.2
LOCATION_WEIGHT=0.2
AFFIRMATIVE_WEIGHT=0.1
```

**Seed the Database (Optional but Recommended):**

This will clear existing data and populate your MongoDB with sample admin, student, and industry users, along with opportunities. Make sure your MongoDB instance is running before executing this command.

```powershell
nodemon seed.js
```

After seeding, you can start the backend development server:

```powershell
npm run dev
```

The backend server will start on `http://localhost:8000` (or the port specified in your `.env` file).

### 2. Frontend Setup

Navigate to the `frontend` directory:

```powershell
cd ../frontend
```

**Install Dependencies:**

```powershell
npm install
```

**Create `.env` file:**

Create a file named `.env` in the `frontend` directory. **This file is critical and needs to be created manually due to security configurations.** Copy the contents from `.env.example` into your new `.env` file:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

**Start the Frontend Development Server:**

```powershell
npm run dev
```

The frontend application will open in your browser, typically at `http://localhost:5173`.

## Testing

### Backend Tests (Mocha/Chai)

From the `backend` directory:

```powershell
npm test
```

### Frontend Tests (Vitest)

From the `frontend` directory:

```powershell
npm test
```

## Example Usage (Post-Setup)

1.  **Open two terminal windows.**
2.  In one, navigate to `backend` and run `npm run dev`.
3.  In the other, navigate to `frontend` and run `npm run dev`.
4.  Open your browser to `http://localhost:5173`.

**Login with Seeded Users:**

*   **Admin:**
    *   Email: `admin@example.com`
    *   Password: `adminpass`
*   **Student (e.g., Alice):**
    *   Email: `alice@student.com`
    *   Password: `password`
*   **Industry (e.g., Innotech HR):**
    *   Email: `hr@innotech.com`
    *   Password: `password`

Explore the different dashboards and functionalities based on the logged-in user's role.
