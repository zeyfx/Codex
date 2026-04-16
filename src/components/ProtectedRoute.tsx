import { useRef, useEffect } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import Sidebar from './Sidebar'
import plainVideo from '../assets/plain.mp4'

export default function ProtectedRoute() {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.9
    }
  }, [])

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen w-full bg-[#0a0a0c] overflow-hidden selection:bg-indigo-500/30">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#060608]">
        {/* Background Texture Global */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <video
            ref={videoRef}
            src={plainVideo}
            autoPlay
            muted
            loop
            playsInline
            // Renderiza em 1/4 do tamanho para economizar 95% do processamento de GPU do blur, depois estica.
            style={{ transform: 'scale(4) translateZ(0)', transformOrigin: 'center center', willChange: 'transform' }}
            className="absolute left-[37.5%] top-[37.5%] w-[25%] h-[25%] object-cover opacity-20 blur-[5px] contrast-100 brightness-40"
          />
        </div>

        {/* ÁREA DE CONTEÚDO COM TRANSIÇÕES CONTROLADAS (SEM PISCADA) */}
        <div className="relative z-10 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="h-full p-10 overflow-y-auto route-transition-container pt-16"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
