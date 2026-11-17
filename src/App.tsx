import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import BeginnerGate from './components/BeginnerGate'
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
import Progress from './pages/Progress'
import Pronunciation from './pages/Pronunciation'
import RealTalk from './pages/RealTalk'
import SoundWorkout from './pages/SoundWorkout'
import Grammar from './pages/Grammar'
import Quiz from './pages/Quiz'
import SectionPage from './pages/SectionPage'
import ThisWeek from './pages/ThisWeek'
import Trace from './pages/Trace'

export default function App() {
  return (
    <BrowserRouter>
      <EnrollmentProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/sounds" element={<BeginnerGate><SectionPage id="sounds" /></BeginnerGate>} />
            <Route path="/talk" element={<BeginnerGate><SectionPage id="talk" /></BeginnerGate>} />
            <Route path="/me" element={<BeginnerGate><SectionPage id="me" /></BeginnerGate>} />
            <Route path="/grammar" element={<Grammar />} />
            <Route path="/grammar/:levelId" element={<Grammar />} />
            <Route path="/progress" element={<BeginnerGate><Progress /></BeginnerGate>} />
            <Route path="/pronunciation" element={<BeginnerGate><Pronunciation /></BeginnerGate>} />
            <Route path="/sound" element={<BeginnerGate><SoundWorkout /></BeginnerGate>} />
            <Route path="/batchim" element={<BeginnerGate><Batchim /></BeginnerGate>} />
            <Route path="/numbers" element={<BeginnerGate><Numbers /></BeginnerGate>} />
            <Route path="/conversation" element={<BeginnerGate><Conversation /></BeginnerGate>} />
            <Route path="/real-talk" element={<BeginnerGate><RealTalk /></BeginnerGate>} />
            <Route path="/trace" element={<BeginnerGate><Trace /></BeginnerGate>} />
            <Route path="/quiz" element={<BeginnerGate><Quiz /></BeginnerGate>} />
            <Route path="/this-week" element={<BeginnerGate><ThisWeek /></BeginnerGate>} />
            <Route path="/notices" element={<BeginnerGate><Notices /></BeginnerGate>} />
            <Route path="/homework" element={<BeginnerGate><Homework /></BeginnerGate>} />
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
