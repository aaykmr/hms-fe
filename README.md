# Hospital Management System - Frontend

A modern React TypeScript frontend for the Hospital Management System with role-based access control (RBAC), comprehensive activity logging, real-time patient monitoring, and advanced calendar functionality.

## Features

- **Authentication**: Login and signup with JWT token management
- **Role-Based Access Control**: Different access levels (L1, L2, L3, L4)
- **Patient Registration**: Register new patients with comprehensive forms
- **Appointment Management**: Google Calendar-like weekly view with real-time current time indicator
- **Medical Records**: Create and manage patient medical records with advanced search and filtering
- **Doctor Dashboard**: View statistics and patient information
- **User Management**: L3/L4 users can manage user accounts and change clearance levels
- **Activity Logs**: Comprehensive audit trail viewing for all system activities
- **Patient Monitoring**: Real-time vital signs monitoring with interactive charts
- **Responsive Design**: Mobile-friendly interface with SCSS styling

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Styling**: SCSS with custom design system
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Yup validation
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **State Management**: React Context API
- **Charts**: SVG-based real-time charts for vital signs
- **Real-time Updates**: Short polling for live data

## Prerequisites

- Node.js 22.16.0 or higher
- npm or yarn
- Backend API running (see backend README)

## Installation

1. **Navigate to the frontend directory**

   ```bash
   cd hms-fe
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**

   ```bash
   npm start
   ```

   The application will open at `http://localhost:3000`

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Project Structure

```
src/
├── components/          # React components
│   ├── Login.tsx       # Login form
│   ├── Signup.tsx      # Signup form (L1 clearance by default)
│   ├── Dashboard.tsx   # Main dashboard with role-based navigation
│   ├── PatientRegistration.tsx
│   ├── AppointmentManagement.tsx
│   ├── DoctorAppointments.tsx  # Google Calendar-like weekly view
│   ├── MedicalRecords.tsx      # Advanced medical records management
│   ├── UserManagement.tsx      # User management (L3/L4 only)
│   ├── ActivityLogs.tsx        # Activity audit trail (L3/L4 only)
│   ├── PatientMonitoring.tsx   # Real-time patient monitoring
│   └── VitalSignsChart.tsx     # Reusable chart component
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── services/           # API services
│   └── api.ts         # API client and types
├── styles/            # SCSS styles
│   ├── main.scss      # Main stylesheet
│   └── components/    # Component-specific styles
└── App.tsx           # Main app component
```

## Key Features

### Google Calendar-like Appointment View

- **Weekly Layout**: Monday to Sunday with time slots from 12 AM to 11 PM
- **Current Time Indicator**: Red line showing current time with time label
- **Today Highlighting**: Current day column has distinct background
- **Appointment Details**: Click appointments to view details in right panel
- **Real-time Updates**: Current time line updates every minute

### Patient Monitoring System

- **Real-time Vital Signs**: Heart Rate, Blood Pressure, SpO2, Respiration Rate
- **Interactive Charts**: SVG-based charts with dynamic Y-axis scaling
- **Bed Management**: Add/remove monitoring beds, assign patients
- **Live Updates**: Short polling mechanism for real-time data
- **Responsive Design**: Charts adapt to different screen sizes

### Medical Records Management

- **Patient History**: Comprehensive medical record viewing
- **Advanced Search**: Filter by date range, diagnosis, doctor, and more
- **CSV Export**: Download medical records for external analysis
- **CRUD Operations**: Create, read, update medical records

### User Management & Activity Logs

- **Clearance Level Management**: L3/L4 users can change user access levels
- **Activity Audit Trail**: View all system activities with filtering
- **Permission-based Access**: Role-based visibility of management features

## Authentication Flow

1. **Login**: Users authenticate with staff ID and password
2. **Token Storage**: JWT tokens are stored in localStorage
3. **Protected Routes**: Routes are protected based on clearance level
4. **Auto Logout**: Users are automatically logged out on token expiration

## RBAC Clearance Levels

- **L1**: Basic access (receptionist)
  - Register patients
  - Create appointments
  - View basic information

- **L2**: Doctor access
  - All L1 permissions
  - View patient medical history
  - Create medical records
  - Update appointment status
  - Access patient monitoring

- **L3**: Senior doctor access
  - All L2 permissions
  - Manage user accounts
  - Change user clearance levels
  - View activity logs
  - Full patient monitoring access

- **L4**: Administrator access
  - Full system access
  - All L3 privileges
  - System configuration

## API Integration

The frontend communicates with the backend API through the `apiService` class in `src/services/api.ts`. All API calls include:

- Automatic JWT token inclusion
- Error handling
- Response type safety
- Automatic logout on authentication errors

## Styling

The application uses a custom SCSS design system with:

- **Variables**: Colors, spacing, breakpoints
- **Mixins**: Responsive design, flexbox utilities
- **Components**: Buttons, cards, forms, alerts
- **Utilities**: Spacing, typography, layout helpers
- **Light Theme**: Clean white backgrounds with dark text for optimal readability

## Development

### Adding New Components

1. Create the component in `src/components/`
2. Add corresponding SCSS file in `src/styles/components/`
3. Import the component in `App.tsx` if needed
4. Add routing if required

### Styling Guidelines

- Use SCSS variables for colors and spacing
- Follow BEM methodology for class naming
- Use mixins for responsive design
- Keep components modular and reusable
- Maintain consistent light theme throughout

### API Integration

- Add new API methods to `src/services/api.ts`
- Include proper TypeScript types
- Handle errors appropriately
- Update the API service documentation

### Chart Components

- Use the reusable `VitalSignsChart` component for new charts
- Configure props for different data types and styling
- Ensure responsive design with proper scaling

## Environment Variables

| Variable            | Description     | Default                     |
| ------------------- | --------------- | --------------------------- |
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000/api` |

## Build and Deployment

1. **Build for production**

   ```bash
   npm run build
   ```

2. **Serve the build**
   ```bash
   npx serve -s build
   ```

## Contributing

1. Follow the existing code style and patterns
2. Add proper TypeScript types
3. Include error handling
4. Test on different screen sizes
5. Update documentation as needed
6. Maintain consistent styling and theme

## License

MIT
