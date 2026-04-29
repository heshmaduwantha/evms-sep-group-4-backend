# Event Management System (EVMS)

The Event Management System (EVMS) is a comprehensive platform designed to streamline the organization, management, and tracking of events, volunteers, attendances, and user roles. 

## Technologies Used

### Frontend
- **Framework-** Angular 17+ (v21.2.5)
- **UI Components-** PrimeNG (v17.18.12), PrimeFlex
- **Charting & Data Viz:** Chart.js
- **PDF Generation:** jsPDF & jsPDF-autotable
- **Styling:** CSS, @fontsource/inter
- **Language:** TypeScript

### Backend
- **Framework:** NestJS (v11.0)
- **Database:** PostgreSQL (pg)
- **ORM:** TypeORM
- **Authentication:** Passport, JWT (JSON Web Tokens)
- **Security:** bcrypt (Password Hashing)
- **Language:** TypeScript

---

## Project Setup Instructions

### Prerequisites
Before you begin, ensure you have the following installed on your machine:
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **PostgreSQL** (running locally or via Docker)

### 1. Database Setup
1. Create a PostgreSQL database for the application.
2. Ensure you have a `.env` file in the `backend` directory configured with your database credentials. An example `.env` might look like:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_db_username
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   APP_PORT=3200
   JWT_SECRET=your_jwt_secret
   ```

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the backend server in development mode:
   ```bash
   npm run start:dev
   ```
   The backend should now be running on `http://localhost:3200` (or the port specified in your `.env`).

### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run start
   ```
   The frontend should now be running on `http://localhost:4200`.

---

## User Guide

### 1. Authentication & Authorization
- **Registration & Login:** Users can register an account and securely log in.
- **Role-Based Access Control:** The system distinguishes between different types of users (e.g., Admin, Organizer, Volunteer). Menus and features adjust automatically based on user permissions.

### 2. Event Management (Organizers & Admins)
- **Create Events:** Add new events, defining essential details such as the event name, schedule, location, and capacity.
- **Manage Events:** View a list of all events. Edit event details or remove events that are no longer active.
- **Applications:** Review and approve or reject applications submitted by volunteers for specific events.

### 3. Volunteer Management
- **Volunteer Dashboard:** Volunteers have access to a dedicated dashboard where they can discover upcoming events and apply to participate.
- **My Events:** Volunteers can keep track of events they are scheduled to attend and view their past participation history.

### 4. Attendance Tracking
- **Check-ins:** Organizers can check volunteers in upon arrival. The system includes a dedicated module for manual check-ins.
- **Attendance Records:** Organizers and admins can view comprehensive attendance logs for any given event to monitor volunteer turnout.

### 5. Reporting and Analytics
- **Dashboard Charts:** The main dashboard offers visual insights (via Chart.js) into system metrics such as event frequency and volunteer engagement.
- **Exporting Reports:** Users can generate detailed reports and export them as PDF files for offline review or archiving.

### 6. User Management (Admins)
- Admins possess the ability to view all registered users in the system.
- Admins can modify user roles and update account statuses, ensuring proper governance over platform access.
