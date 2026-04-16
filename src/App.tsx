import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import LibraryPage from './pages/LibraryPage'
import ItemDetailPage from './pages/ItemDetailPage'
import DownloaderPage from './pages/DownloaderPage'
import ProtectedRoute from './components/ProtectedRoute'
import TitleBar from './components/TitleBar'
import SplashScreen from './components/SplashScreen'

export default function App() {
  const [initLoading, setInitLoading] = useState(true)

  return (
    <>
      <AnimatePresence mode="wait">
        {initLoading && (
          <SplashScreen key="splash" onFinish={() => setInitLoading(false)} />
        )}
      </AnimatePresence>

      {!initLoading && (
        <div className="flex flex-col h-screen overflow-hidden">
          <TitleBar />
          <div className="flex-1 overflow-hidden relative">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected App Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/item/:id" element={<ItemDetailPage />} />
                <Route path="/downloader" element={<DownloaderPage />} />
              </Route>

              {/* Default Redirects */}
              <Route path="/" element={<Navigate to="/library" replace />} />
              <Route path="*" element={<Navigate to="/library" replace />} />
            </Routes>
          </div>
        </div>
      )}
    </>
  )
}
