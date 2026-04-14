import { createBrowserRouter } from 'react-router'

// Layouts
import PublicLayout from './components/layout/PublicLayout.jsx'
import DashboardLayout from './components/layout/DashboardLayout.jsx'

// Auth guards
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import RoleGuard from './auth/RoleGuard.jsx'

// Auth pages
import LoginPage from './pages/auth/LoginPage.jsx'
import RegisterPage from './pages/auth/RegisterPage.jsx'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx'
import VerifyEmailPage from './pages/auth/VerifyEmailPage.jsx'

// Public pages
import LandingPage from './pages/public/LandingPage.jsx'
import AnimalListPage from './pages/public/AnimalListPage.jsx'
import AnimalDetailPage from './pages/public/AnimalDetailPage.jsx'
import ReportPage from './pages/public/ReportPage.jsx'
import ReportConfirmation from './pages/public/ReportConfirmation.jsx'
import StoriesPage from './pages/public/StoriesPage.jsx'
import StoryDetailPage from './pages/public/StoryDetailPage.jsx'
import EventsPage from './pages/public/EventsPage.jsx'
import EventDetailPage from './pages/public/EventDetailPage.jsx'
import DonationPage from './pages/public/DonationPage.jsx'
import AdoptionFormPage from './pages/public/AdoptionFormPage.jsx'

// Dashboard pages
import DashboardHome from './pages/dashboard/DashboardHome.jsx'
import AnimalsManagement from './pages/dashboard/AnimalsManagement.jsx'
import ReportsManagement from './pages/dashboard/ReportsManagement.jsx'
import AdoptionsManagement from './pages/dashboard/AdoptionsManagement.jsx'
import DonationsManagement from './pages/dashboard/DonationsManagement.jsx'
import UsersManagement from './pages/dashboard/UsersManagement.jsx'
import ContentManagement from './pages/dashboard/ContentManagement.jsx'
import NotificationsPage from './pages/dashboard/NotificationsPage.jsx'
import MyApplications from './pages/dashboard/MyApplications.jsx'
import MyAdoptedAnimals from './pages/dashboard/MyAdoptedAnimals.jsx'
import ProfilePage from './pages/dashboard/ProfilePage.jsx'
import SettingsPage from './pages/dashboard/SettingsPage.jsx'
import VolunteerMissions from './pages/dashboard/VolunteerMissions.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export const router = createBrowserRouter([
  // Public routes with PublicLayout
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/animals', element: <AnimalListPage /> },
      { path: '/animals/:id', element: <AnimalDetailPage /> },
      { path: '/animals/:id/adopt', element: <AdoptionFormPage /> },
      { path: '/report', element: <ReportPage /> },
      { path: '/report/confirmation', element: <ReportConfirmation /> },
      { path: '/stories', element: <StoriesPage /> },
      { path: '/stories/:slug', element: <StoryDetailPage /> },
      { path: '/events', element: <EventsPage /> },
      { path: '/events/:slug', element: <EventDetailPage /> },
      { path: '/donate', element: <DonationPage /> },
    ],
  },

  // Auth routes (no layout wrapper)
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },

  // Dashboard routes (protected + DashboardLayout)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/dashboard', element: <DashboardHome /> },
          { path: '/dashboard/notifications', element: <NotificationsPage /> },
          { path: '/dashboard/profile', element: <ProfilePage /> },
          { path: '/dashboard/settings', element: <SettingsPage /> },

          // Any authenticated user can access these
          { path: '/dashboard/applications', element: <MyApplications /> },
          { path: '/dashboard/my-pets', element: <MyAdoptedAnimals /> },

          // Volunteer routes
          {
            element: <RoleGuard roles={['admin', 'shelter_staff', 'volunteer']} />,
            children: [
              { path: '/dashboard/missions', element: <VolunteerMissions /> },
            ],
          },

          // Staff/Admin routes
          {
            element: <RoleGuard roles={['admin', 'shelter_staff']} />,
            children: [
              { path: '/dashboard/animals', element: <AnimalsManagement /> },
              { path: '/dashboard/reports', element: <ReportsManagement /> },
              { path: '/dashboard/adoptions', element: <AdoptionsManagement /> },
              { path: '/dashboard/content', element: <ContentManagement /> },
            ],
          },

          // Admin-only routes
          {
            element: <RoleGuard roles={['admin']} />,
            children: [
              { path: '/dashboard/donations', element: <DonationsManagement /> },
              { path: '/dashboard/users', element: <UsersManagement /> },
            ],
          },
        ],
      },
    ],
  },

  // Catch-all 404
  { path: '*', element: <NotFoundPage /> },
])
