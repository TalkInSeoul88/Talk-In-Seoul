import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Pronunciation from './pages/Pronunciation'
import Quiz from './pages/Quiz'
import ThisWeek from './pages/ThisWeek'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/pronunciation" element={<Pronunciation />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/this-week" element={<ThisWeek />} />
          <Route path="/lesson" element={<Navigate to="/pronunciation" replace />} />
          <Route path="/practice" element={<Navigate to="/pronunciation" replace />} />
          <Route path="/homework" element={<Navigate to="/this-week" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
