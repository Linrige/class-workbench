import { Navigate, Route, Routes } from 'react-router-dom'
import BasicLayout from '@/layouts/BasicLayout'
import Home from '@/pages/Home'
import Students from '@/pages/Students'
import Schedule from '@/pages/Schedule'
import Todos from '@/pages/Todos'
import Homework from '@/pages/Homework'
import Attendance from '@/pages/Attendance'
import Settings from '@/pages/Settings'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<BasicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/students" element={<Students />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/todos" element={<Todos />} />
        <Route path="/homework" element={<Homework />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
