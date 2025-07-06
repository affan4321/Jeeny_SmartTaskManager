# 🎯 Jeeny Task Manager

<p align="center">
  <img src="./app/jeeny.png" alt="Jeeny Task Manager Logo" width="100" height="100">
</p>

<h1 align="center">Jeeny Task Manager</h1>

<p align="center">
  <strong>Simple, powerful, and beautiful task management for everyone</strong>
</p>

<p align="center">
  A modern, intuitive task management application built with Next.js 15 and Supabase
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#demo"><strong>Demo</strong></a> ·
  <a href="#getting-started"><strong>Getting Started</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#development"><strong>Development</strong></a> ·
  <a href="#assumptions-made"><strong>Assumptions</strong></a> ·
  <a href="#future-improvements"><strong>Future Improvements</strong></a> ·
  <a href="#contributing"><strong>Contributing</strong></a>
</p>

---

## ✨ Features

### 🚀 **Core Functionality**
- **Task Management**: Create, edit, delete, and organize tasks with ease
- **Due Dates**: Schedule tasks with deadline tracking
- **Task Status**: Mark tasks as complete or pending
- **Search & Filter**: Quickly find tasks with powerful search capabilities

### 🎨 **User Experience**
- **Stunning UI**: Modern, responsive design with beautiful animations
- **Dynamic Background**: Animated canvas with shooting star effects
- **Dark Mode**: Full dark/light theme support
- **Mobile Responsive**: Optimized for all device sizes
- **Intuitive Interface**: Clean, user-friendly design

### 🔐 **Authentication & Security**
- **Secure Authentication**: Email/password authentication via Supabase
- **User Management**: Sign up, login, password reset functionality
- **Protected Routes**: Secure access to user-specific data

### 🔔 **Smart Features**
- **Reminders**: Never miss a deadline with intelligent notifications
- **Real-time Updates**: Instant synchronization across devices
- **Data Persistence**: Reliable cloud-based storage

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library

### **Backend**
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Robust relational database
- **Row Level Security** - Database-level security
- **Real-time subscriptions** - Live data updates

### **Development & Testing**
- **Jest** - JavaScript testing framework
- **React Testing Library** - Testing utilities for React
- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking

## 🚀 Getting Started

### Check the deployed Site
- https://jeeny-smart-task-manager.vercel.app/

<h2>OR build on your system</h2>

### Prerequisites
- Node.js (v18 or higher)
- npm, yarn, or pnpm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/affan4321/Jeeny_SmartTaskManager.git
   cd Jeeny_SmartTaskManager
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up Supabase**
   - Create a new project at [Supabase Dashboard](https://database.new)
   - Copy your project URL and anon key
   - Run the SQL commands from `run-in-supabase-dashboard.sql` in your Supabase SQL editor

4. **Configure environment variables**
   - Copy `.env.example` to `.env.local`
   - Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Creating Tasks
1. Click the "Add Task" button
2. Enter task details (title, description, due date)
3. Save to add to your task list

### Managing Tasks
- **Edit**: Click the edit icon to modify task details
- **Complete**: Check the checkbox to mark tasks as complete
- **Delete**: Click the delete icon to remove tasks
- **Filter**: Use the search bar to find specific tasks

### User Account
- **Sign Up**: Create a new account with email and password
- **Login**: Access your tasks with existing credentials
- **Profile**: Manage your account settings

## 🧪 Testing

Run the test suite:
```bash
npm run test
# or
yarn test
# or
pnpm test
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)
1. **Push your code to GitHub**
2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
3. **Add environment variables**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy automatically**

### Manual Deployment
```bash
npm run build
npm run start
```

### Important Notes
- Make sure your Supabase environment variables are set correctly
- The app uses React 19 with `@testing-library/react@^16.0.0` for compatibility
- All tests should pass before deployment

## 🤝 Contributing

## 📋 Assumptions Made

During the development of this task manager application, several key assumptions were made to guide design and implementation decisions:

### **User Behavior Assumptions**
- **Single User Focus**: Each user manages their own tasks independently - no team collaboration features required
- **Personal Productivity**: Primary use case is individual task management rather than enterprise project management
- **Mobile-First Usage**: Users will frequently access the app on mobile devices, requiring responsive design
- **Real-time Expectations**: Users expect immediate updates when tasks are modified

### **Technical Assumptions**
- **Modern Browser Support**: Target modern browsers with ES6+ support and WebSocket capabilities
- **Stable Internet Connection**: Real-time features assume relatively stable internet connectivity
- **Timezone Handling**: Users primarily work within their local timezone with occasional cross-timezone scheduling
- **Storage Requirements**: Task data size remains reasonable (no large file attachments initially)

### **Scalability Assumptions**
- **User Base**: Designed to handle thousands of concurrent users, not millions
- **Task Volume**: Average user manages 50-200 tasks simultaneously
- **Geographic Distribution**: Primary user base concentrated in major metropolitan areas

### **Security Assumptions**
- **User Trust**: Users trust the platform with personal task data
- **Email Verification**: Valid email addresses for authentication and notifications
- **Browser Security**: Users maintain updated browsers with standard security practices

---

## 🚀 Future Improvements

Given additional development time, the following enhancements would significantly improve the application:

### **🎯 Core Functionality Enhancements**
- **Task Prioritization**: High/Medium/Low priority levels with visual indicators and sorting
- **Subtasks & Dependencies**: Break large tasks into smaller components with prerequisite relationships
- **Recurring Tasks**: Daily, weekly, monthly task repetition with customizable patterns
- **Task Templates**: Pre-defined task structures for common workflows
- **Bulk Operations**: Select and modify multiple tasks simultaneously
- **Advanced Search**: Filter by date ranges, categories, priority, and complex queries
- **Task Import/Export**: CSV, JSON, and popular task manager format support

### **👥 Collaboration Features**
- **Team Workspaces**: Shared task management for teams and projects
- **Task Assignment**: Delegate tasks to team members with notification systems
- **Comments & Updates**: Task-specific communication threads
- **Permission Management**: Role-based access control (Admin, Member, Viewer)
- **Activity Feeds**: Real-time updates on team task activities

### **📊 Analytics & Insights**
- **Productivity Dashboard**: Task completion rates, time tracking, and performance metrics
- **Progress Visualization**: Charts showing completion trends and productivity patterns
- **Time Tracking**: Built-in timer for task duration measurement
- **Goal Setting**: Monthly/quarterly objectives with progress tracking
- **Reports Generation**: Exportable productivity reports for personal or team review

### **🔧 Technical Improvements**
- **Offline Support**: Progressive Web App with offline task management capabilities
- **Performance Optimization**: Virtualized lists for large task datasets and lazy loading
- **Advanced Caching**: Intelligent cache management for improved response times
- **API Rate Limiting**: Enhanced security with request throttling and abuse prevention
- **Database Optimization**: Query optimization and indexing for scale
- **Error Monitoring**: Comprehensive logging and error tracking with Sentry integration

### **🎨 User Experience Enhancements**
- **Drag & Drop Interface**: Visual task reordering and category management
- **Keyboard Shortcuts**: Power user keyboard navigation and quick actions
- **Customizable Themes**: User-defined color schemes and layout preferences
- **Advanced Notifications**: Desktop, mobile push, email, and SMS reminder options
- **Accessibility Improvements**: Screen reader support and WCAG 2.1 AA compliance
- **Onboarding Flow**: Interactive tutorial for new users

### **🔌 Integration Capabilities**
- **Calendar Sync**: Two-way integration with Google Calendar, Outlook, and Apple Calendar
- **Third-party Apps**: Slack, Microsoft Teams, Trello, and Asana integrations
- **Email Integration**: Create tasks from emails and send task summaries
- **API Development**: Public REST API for third-party integrations
- **Webhook Support**: Real-time notifications to external systems

### **📱 Platform Expansion**
- **Native Mobile Apps**: iOS and Android applications with native notifications
- **Desktop Application**: Electron-based desktop app for Windows, macOS, and Linux
- **Browser Extensions**: Quick task creation from any webpage
- **Voice Integration**: Alexa and Google Assistant task management

### **🛡️ Advanced Security**
- **Two-Factor Authentication**: Enhanced account security with 2FA options
- **Single Sign-On (SSO)**: Enterprise authentication with SAML and OAuth providers
- **Data Encryption**: End-to-end encryption for sensitive task information
- **Audit Logging**: Comprehensive activity logs for security and compliance
- **GDPR Compliance**: Enhanced privacy controls and data portability features

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Muhammad Affan**
- GitHub: [https://github.com/affan4321](https://github.com/affan4321)
- Email: affan4321@gmail.com

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [Supabase](https://supabase.com/)
- Icons from [Lucide](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

---

<p align="center">
  Made with ❤️ by Muhammad Affan
</p>
