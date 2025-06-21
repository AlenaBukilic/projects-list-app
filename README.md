# Projects List Application

A simple web application that displays project data from a PostgreSQL database. Built with Fastify backend and React frontend.

## Features

- **Backend**: Fastify server with PostgreSQL integration
- **Frontend**: React application with modern UI
- **Database**: PostgreSQL with sample project data
- **Real-time**: Refresh data functionality
- **Responsive**: Mobile-friendly design
- **Status Indicators**: Color-coded project status badges
- **Extended Data**: Includes Place and User information
- **Search Functionality**: Filter projects by Project ID, Applicant, or Project Name

## Project Structure

```
├── backend/                 # Fastify server
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── env.example         # Environment variables template
├── frontend/               # React application
│   ├── public/             # Static files
│   ├── src/                # React source code
│   └── package.json        # Frontend dependencies
├── database/               # Database setup
│   ├── setup.sql          # SQL script for table creation
│   └── update_schema.sql  # Migration script for existing databases
├── package.json           # Root package.json
└── README.md              # This file
```

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd projects-list-app
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create a new database
   createdb projects_db
   
   # Run the setup script
   psql -d projects_db -f database/setup.sql
   ```

4. **Configure environment variables**
   ```bash
   cd backend
   cp env.example .env
   ```
   
   Edit the `.env` file with your PostgreSQL credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=projects_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   PORT=3001
   ```

## Running the Application

### Development Mode (Both Backend and Frontend)

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend application on `http://localhost:3000`

### Running Separately

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/projects` - Get all projects
- `GET /api/projects?search=term` - Search projects across multiple fields
- `GET /api/projects?projectId=1` - Search by specific Project ID
- `GET /api/projects?applicant=name` - Search by specific Applicant
- `GET /api/projects?projectName=name` - Search by specific Project Name
- `GET /api/projects/:id` - Get project by ID

## Search Functionality

The application supports powerful search capabilities:

### General Search
- **URL**: `GET /api/projects?search=term`
- **Description**: Searches across Project ID, Applicant, and Project Name fields
- **Example**: `?search=John` will find projects with "John" in any of these fields

### Specific Field Search
- **Project ID**: `?projectId=1` - Find projects with ID containing "1"
- **Applicant**: `?applicant=Sarah` - Find projects by applicant name
- **Project Name**: `?projectName=Mobile` - Find projects by name

### Search Features
- **Case-insensitive**: Searches are not case-sensitive
- **Partial matching**: Uses `ILIKE` for partial string matching
- **Multiple terms**: Can combine different search parameters
- **Real-time results**: Shows result count and search status

## Database Schema

The `projects` table contains the following columns:
- `project id` (SERIAL PRIMARY KEY)
- `project name` (VARCHAR)
- `status` (VARCHAR) - pending, approved, rejected, in-progress
- `applicant` (VARCHAR)
- `submission date` (DATE)
- `place` (VARCHAR) - Location of the project
- `user` (VARCHAR) - User type/role associated with the project

## Features

### Backend
- Fastify server with CORS support
- PostgreSQL connection pooling
- Error handling and logging
- RESTful API endpoints
- Advanced search functionality with multiple field support

### Frontend
- Modern React hooks (useState, useEffect)
- Axios for API calls
- Responsive design with CSS Grid/Flexbox
- Status badges with color coding
- Loading and error states
- Refresh functionality
- Extended table with Place and User columns
- Search interface with real-time filtering

### UI Components
- Header with gradient background
- Data table with hover effects
- Status badges (pending, approved, rejected, in-progress)
- Refresh button with loading state
- Error message display
- Empty state handling
- Responsive table with horizontal scroll
- Search bar with clear functionality
- Search results counter

## Database Migration

If you have an existing database and want to add the new columns:

```bash
# Run the migration script
psql -d projects_db -f database/update_schema.sql
```

This will:
- Add the `place` and `user` columns if they don't exist
- Update existing records with sample data
- Create indexes for better performance

## Customization

### Adding New Status Types
1. Update the `getStatusClass` function in `frontend/src/App.js`
2. Add corresponding CSS classes in `frontend/src/index.css`

### Modifying Database Schema
1. Update the SQL script in `database/setup.sql`
2. Modify the API endpoints in `backend/server.js`
3. Update the frontend table headers and data mapping

### Adding New Search Fields
1. Update the search query in `backend/server.js`
2. Add new search parameters to the frontend search form
3. Update the search placeholder text

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env` file
- Ensure database and table exist

### Port Conflicts
- Backend runs on port 3001 by default
- Frontend runs on port 3000 by default
- Modify ports in `.env` file if needed

### CORS Issues
- Backend has CORS enabled for development
- Check browser console for CORS errors
- Verify API endpoint URLs

### Search Issues
- Ensure search terms are not empty
- Check browser console for API errors
- Verify the backend is running and accessible

## Production Deployment

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Set up production environment variables**

3. **Use a process manager like PM2 for the backend**

4. **Set up a reverse proxy (nginx) for production**
