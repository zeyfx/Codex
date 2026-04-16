import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import logo from '../assets/logo.svg'

const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const LibraryIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
)

const AdminIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
)

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

const ProfileIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

const StarIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showExitMenu, setShowExitMenu] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore(s => s.logout)
  const user = useAuthStore(s => s.user)

  const isAdmin = user?.role === 'admin'

  const smoothTransition = { type: 'tween', ease: [0.4, 0, 0.2, 1], duration: 0.35 }

  const menuItems = [
    { name: 'Biblioteca', path: '/library', icon: <LibraryIcon /> },
    { name: 'Downloader', path: '/downloader', icon: <DownloadIcon /> },
  ]

  // Se for admin, adicionamos o item de Painel Admin
  if (isAdmin) {
    menuItems.push({ name: 'Admin', path: '/admin', icon: <AdminIcon /> })
  }

  const displayName = user?.globalName || user?.username || 'Usuário'

  return (
    <motion.div
      className="h-full bg-[#09090b] border-r border-white/5 flex flex-col items-center py-6 no-drag z-[10000] selection:bg-transparent overflow-hidden"
      animate={{ width: isExpanded ? 260 : 80 }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        setIsExpanded(false)
        setShowExitMenu(false)
      }}
      transition={smoothTransition}
    >
      {/* LOGO */}
      <div className="mb-10 flex items-center justify-center h-10 w-full no-drag">
        <img 
          src={logo} 
          alt="Codex" 
          className="w-6 h-6 min-w-[24px] brightness-0 invert opacity-60" 
        />
      </div>

      {/* NAVEGAÇÃO PRINCIPAL */}
      <nav className="flex-1 w-full px-3 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path} className="block group">
              <motion.div
                className={`flex items-center h-12 rounded-xl transition-colors duration-200 relative
                  ${isActive 
                    ? 'bg-indigo-500/10 text-indigo-400' 
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                  }`}
                animate={{ paddingLeft: isExpanded ? 16 : 0 }}
                transition={smoothTransition}
              >
                <div className="flex items-center justify-center min-w-[54px] h-full">
                  {item.icon}
                </div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      transition={smoothTransition}
                      className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>

                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-full"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* USUÁRIO & MENU DE CONTEXTO EXPANDIDO */}
      <div className="w-full px-3 pt-6 border-t border-white/5">
        <div className="relative">
          <AnimatePresence>
            {showExitMenu && isExpanded && (
               <motion.div
                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 10, scale: 0.95 }}
                 className="absolute bottom-full left-0 w-full mb-3 p-2 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-[100] space-y-1"
               >
                 <button
                   onClick={() => {
                     navigate('/profile')
                     setShowExitMenu(false)
                   }}
                   className="w-full h-10 flex items-center gap-3 px-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-[10px] font-bold uppercase tracking-widest"
                 >
                   <ProfileIcon />
                   Meu Perfil
                 </button>


                 <div className="h-px bg-white/5 my-1 mx-2" />

                 <button
                   onClick={logout}
                   className="w-full h-10 flex items-center gap-3 px-3 rounded-xl text-red-500/80 hover:text-red-500 hover:bg-red-500/10 transition-all text-[10px] font-bold uppercase tracking-widest font-black"
                 >
                   <LogoutIcon />
                   Desconectar
                 </button>
               </motion.div>
            )}
          </AnimatePresence>

          {/* CARD DO USUÁRIO NO MENU */}
          <motion.div 
            onClick={() => isExpanded && setShowExitMenu(!showExitMenu)}
            className={`px-3 py-3 rounded-2xl flex items-center gap-3 overflow-hidden cursor-pointer transition-all duration-300
              ${showExitMenu ? 'bg-indigo-600/10' : 'bg-white/5 hover:bg-white/10'}`}
          >
            <div className="relative flex-shrink-0">
               <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 overflow-hidden">
                 {user?.avatarUrl ? (
                   <img src={user.avatarUrl} className="w-full h-full object-cover" alt="User" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-indigo-500/10 text-indigo-400">
                     <ProfileIcon />
                   </div>
                 )}
               </div>
            </div>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col min-w-0"
                >
                  <span className="text-[11px] font-black text-white truncate leading-tight">
                    {displayName}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {isExpanded && (
              <motion.div 
                animate={{ rotate: showExitMenu ? 180 : 0 }}
                className={`ml-auto transition-colors ${showExitMenu ? 'text-indigo-400' : 'text-zinc-600'}`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
