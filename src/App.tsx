import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { EnrollmentProvider } from './lib/enrollment.tsx'
import Admin from './pages/Admin'
import AdminCourses from './pages/AdminCourses'
import AdminHomework from './pages/AdminHomework'
import AdminNotices from './pages/AdminNotices'
import Batchim from './pages/Batchim'
import Conversation from './pages/Conversation'
import Homework from './pages/Homework'
import Home from './pages/Home'
import Notices from './pages/Notices'
import Numbers from './pages/Numbers'
import Pronunciation from './pages/Pronunciation'
import Quiz from './pages/Quiz'
import ThisWeek from './pages/ThisWeek'
import Trace from './pages/Trace'

export default function App() {
  return (
    <BrowserRouter>
      <EnrollmentProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/pronunciation" element={<Pronunciation />} />
            <Route path="/batchim" element={<Batchim />} />
            <Route path="/numbers" element={<Numbers />} />
            <Route path="/conversation" element={<Conversation />} />
            <Route path="/trace" element={<Trace />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/this-week" element={<ThisWeek />} />
            <Route path="/notices" element={<Notices />} />
            <Route path="/homework" element={<Homework />} />
            <Route path="/lesson" element={<Navigate to="/pronunciation" replace />} />
            <Route path="/practice" element={<Navigate to="/pronunciation" replace />} />
          </Route>
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route path="/admin/notices" element={<AdminNotices />} />
          <Route path="/admin/homework" element={<AdminHomework />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </EnrollmentProvider>
    </BrowserRouter>
  )
}
