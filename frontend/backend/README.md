# Construction Management Backend API

A comprehensive backend API for the Construction Management System built with Node.js, Express.js, TypeScript, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Project Management**: Complete CRUD operations for construction projects
- **Task Management**: Task assignment, tracking, and status management
- **Issue Tracking**: Issue reporting, assignment, and resolution tracking
- **Resource Management**: Equipment, materials, and tool management
- **Attendance Tracking**: Employee attendance and time tracking
- **Petty Cash Management**: Expense tracking and approval workflows
- **Commercial Operations**: Inventory, transfers, and material management
- **User Management**: User accounts, roles, and permissions
- **Reporting**: Comprehensive reporting and analytics

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Environment**: dotenv

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd construction-management-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/construction_management
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system:
   ```bash
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | User login | Public |
| GET | `/auth/me` | Get current user | Private |
| PUT | `/auth/profile` | Update user profile | Private |
| PUT | `/auth/change-password` | Change password | Private |

### Project Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/projects` | Get all projects | Private |
| GET | `/projects/stats` | Get project statistics | Private |
| GET | `/projects/:id` | Get single project | Private |
| POST | `/projects` | Create new project | Admin, Manager |
| PUT | `/projects/:id` | Update project | Admin, Manager |
| DELETE | `/projects/:id` | Delete project | Admin, Manager |

### Task Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/tasks` | Get all tasks | Private |
| GET | `/tasks/project/:projectId` | Get tasks by project | Private |
| GET | `/tasks/:id` | Get single task | Private |
| POST | `/tasks` | Create new task | Admin, Manager, Site Supervisor |
| PUT | `/tasks/:id` | Update task | Admin, Manager, Site Supervisor |
| DELETE | `/tasks/:id` | Delete task | Admin, Manager, Site Supervisor |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```javascript
Authorization: Bearer <your-jwt-token>
```

## 👥 User Roles

- **Admin**: Full system access
- **Manager**: Project and team management
- **Site Supervisor**: Task and issue management
- **Employee**: Basic access to assigned tasks and issues

## 🗄️ Database Models

### User
- Personal information and authentication
- Role-based access control
- Account status and activity tracking

### Project
- Project details and timeline
- Budget and progress tracking
- Team assignment and management

### Task
- Task assignment and tracking
- Priority and status management
- Time tracking and estimation

### Issue
- Issue reporting and tracking
- Assignment and resolution
- Comments and attachments

### Resource
- Equipment and material management
- Inventory tracking
- Maintenance scheduling

### Attendance
- Employee time tracking
- Project-based attendance
- Approval workflows

### PettyCash
- Expense tracking
- Approval workflows
- Receipt management

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API request limiting
- **Input Validation**: Request validation
- **Password Hashing**: bcrypt encryption
- **JWT Security**: Token-based authentication

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 Monitoring

The API includes health check endpoint:
```
GET /health
```

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   NODE_ENV=production
   MONGODB_URI=mongodb://your-production-db
   JWT_SECRET=your-production-secret
   ```

3. **Start the application**
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions, please contact the development team.
