# Construction Management System

A comprehensive construction management system built with React, TypeScript, and Tailwind CSS. The system provides both web and mobile interfaces for managing construction projects, tasks, issues, resources, attendance, petty cash, and commercial operations.

## Features

### 🏗️ Core Modules

- **Dashboard**: Overview with charts, statistics, and recent activity
- **Projects**: Complete project lifecycle management with progress tracking
- **Tasks**: Task assignment, tracking, and collaboration with comments
- **Issues**: Issue tracking with resolution workflow and priority management
- **Resources**: Management of labor, materials, and equipment resources
- **Attendance**: Employee attendance tracking with bulk upload capabilities
- **Petty Cash**: Expense tracking and financial management
- **Commercial**: Inventory, site transfers, material issues/returns, and consumptions
- **Reports**: Comprehensive reporting with export functionality

### 🔐 Authentication & Authorization

- Role-based access control (Admin, Manager, Site Supervisor, Employee)
- Module-level permissions
- Secure authentication system
- User profile management

### 📱 Responsive Design

- **Web App**: Desktop-optimized with sidebar navigation
- **Mobile App**: Mobile-first design with bottom tab navigation
- Responsive layouts that work on all screen sizes
- Touch-friendly interface for mobile devices

### 🎨 UI/UX Features

- Professional construction theme with blue/grey accents
- Intuitive navigation with collapsible submenus
- Color-coded status and priority indicators
- Interactive charts and data visualizations
- Real-time notifications
- Search and filtering across all modules

### 📊 Data Management

- Local storage persistence
- Dummy data for demonstration
- CRUD operations for all entities
- Data validation and error handling
- Export capabilities (PDF/Excel/CSV)

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM
- **Date Handling**: date-fns
- **Export**: jsPDF, xlsx

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd construction-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Demo Accounts

The system includes demo accounts for testing different user roles:

- **Admin**: `admin@construction.com` / `password`
- **Manager**: `manager@construction.com` / `password`
- **Site Supervisor**: `supervisor@construction.com` / `password`
- **Employee**: `employee@construction.com` / `password`

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts for state management
├── hooks/              # Custom React hooks
├── layouts/            # Layout components for web and mobile
├── pages/              # Page components for each module
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── constants/          # Application constants
└── main.tsx           # Application entry point
```

## Key Features

### Dashboard
- Project progress overview
- Task and issue summaries
- Financial metrics
- Attendance statistics
- Interactive charts and graphs

### Project Management
- Create, edit, and delete projects
- Track project progress and budget
- Assign projects to teams
- Project status management

### Task Management
- Task creation and assignment
- Priority and status tracking
- Due date management
- Comment system for collaboration
- Task filtering and search

### Issue Tracking
- Issue reporting and assignment
- Priority and status management
- Resolution workflow
- Comment system
- Issue filtering and search

### Resource Management
- Labor, material, and equipment tracking
- Resource allocation to projects
- Inventory management
- Cost tracking

### Attendance System
- Employee attendance recording
- Time tracking
- Overtime calculation
- Bulk upload capabilities
- Monthly reports

### Financial Management
- Petty cash tracking
- Expense categorization
- Budget monitoring
- Financial reporting

### Commercial Operations
- Inventory management
- Site transfers
- Material issues and returns
- Consumption tracking
- Stock level monitoring

### Reporting
- Comprehensive reports for all modules
- Export to PDF, Excel, and CSV
- Custom date ranges
- Module-specific reports

## Mobile App Features

- Bottom tab navigation
- Touch-optimized interface
- Swipe gestures
- Mobile-specific layouts
- Offline capability (with local storage)

## Responsive Design

The application is fully responsive and adapts to different screen sizes:

- **Desktop**: Full sidebar navigation with detailed views
- **Tablet**: Collapsible sidebar with optimized layouts
- **Mobile**: Bottom tab navigation with mobile-first design

## Data Persistence

The application uses browser local storage to persist data between sessions. In a production environment, this would be replaced with a backend API and database.

## Customization

The system is highly customizable:

- Theme colors can be modified in `tailwind.config.js`
- User roles and permissions can be updated in `src/constants/index.ts`
- Module configurations can be adjusted in the constants file
- UI components can be easily modified using Tailwind CSS classes

## Future Enhancements

- Backend API integration
- Real-time notifications
- File upload capabilities
- Advanced reporting features
- Mobile app deployment
- Multi-language support
- Advanced analytics and insights

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

Built with ❤️ for the construction industry
