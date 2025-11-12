# Construction Management System

A comprehensive construction management system with both frontend and backend components, built for managing projects, tasks, issues, resources, attendance, and commercial operations.

## 📁 Project Structure

```
construction-management/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Auth, Data, Theme)
│   │   ├── layouts/        # Layout components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   └── constants/      # Application constants
│   ├── package.json
│   └── README.md
├── backend/                 # Node.js + Express + MongoDB backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   └── server.ts       # Main server file
│   ├── package.json
│   └── README.md
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### 1. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Update .env with your MongoDB connection
# MONGODB_URI=mongodb://localhost:27017/construction_management

# Start development server
npm run dev
```

The backend API will be available at `http://localhost:5000`

## 🎯 Features

### Frontend Features
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Dark/Light Mode**: Theme switching with persistent preferences
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Role-based Access**: Different views based on user roles
- **Real-time Updates**: Live data updates and notifications
- **Export Functionality**: Export data to Excel/CSV
- **Search & Filter**: Advanced search and filtering capabilities

### Backend Features
- **RESTful API**: Clean and well-documented API endpoints
- **Authentication**: JWT-based authentication system
- **Authorization**: Role-based access control
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Request validation and sanitization
- **Security**: Helmet, CORS, rate limiting
- **Error Handling**: Comprehensive error handling

### Core Modules
1. **Dashboard**: Overview of projects, tasks, and key metrics
2. **Projects**: Project management and tracking
3. **Tasks**: Task assignment and progress tracking
4. **Issues**: Issue reporting and resolution
5. **Resources**: Equipment and material management
6. **Attendance**: Employee time tracking
7. **Petty Cash**: Expense management
8. **Commercial**: Inventory and material operations
9. **Users**: User and role management
10. **Settings**: Application preferences
11. **Reports**: Analytics and reporting

## 👥 User Roles

- **Admin**: Full system access and user management
- **Manager**: Project and team management
- **Site Supervisor**: Task and issue management
- **Employee**: Basic access to assigned tasks

## 🛠️ Technology Stack

### Frontend
- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **React Context**: State management
- **Lucide React**: Icon library

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **TypeScript**: Type safety
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication
- **Express Validator**: Input validation
- **Helmet**: Security middleware

## 📊 Database Schema

### Core Models
- **User**: User accounts and authentication
- **Project**: Construction projects
- **Task**: Project tasks and assignments
- **Issue**: Issues and problems
- **Resource**: Equipment and materials
- **Attendance**: Employee time tracking
- **PettyCash**: Expense management

## 🔐 Security

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Server-side validation
- **CORS Protection**: Cross-origin request security
- **Rate Limiting**: API abuse prevention
- **Helmet**: Security headers

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend Deployment
```bash
cd backend
npm run build
npm start
# Deploy to your server or cloud platform
```

## 📱 Mobile Support

The frontend is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Progressive Web App (PWA) ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in each module

## 🔄 Development Workflow

1. **Frontend Development**: Work in the `frontend/` directory
2. **Backend Development**: Work in the `backend/` directory
3. **API Integration**: Connect frontend to backend APIs
4. **Testing**: Test both frontend and backend
5. **Deployment**: Deploy both components

## 📈 Future Enhancements

- Real-time notifications
- Advanced reporting
- Mobile app development
- Third-party integrations
- Advanced analytics
- Workflow automation