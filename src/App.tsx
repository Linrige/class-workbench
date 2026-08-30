import { HashRouter } from 'react-router-dom'
import AppRoutes from '@/router'

// HashRouter：静态托管（GitHub Pages 等）下刷新子页面不会 404
export default function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  )
}
