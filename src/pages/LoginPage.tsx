import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '../stores/authStore'
import { Navigate } from 'react-router-dom'
import plainVideo from '../assets/plain.mp4'

const DiscordIcon = () => (
  <svg viewBox="0 0 18 18" fill="currentColor" className="w-8 h-8">
    <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612" />
  </svg>
)

export default function LoginPage() {
  const { loginWithDiscord, isLoading, error } = useAuth()
  const user = useAuthStore((s) => s.user)
  const [modal, setModal] = useState<'privacy' | 'terms' | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.9
    }
  }, [])

  if (user) return <Navigate to="/library" replace />

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black select-none">
      {/* Background Video Fullscreen */}
      <video
        ref={videoRef}
        src={plainVideo}
        autoPlay
        muted
        loop
        playsInline
        style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden', willChange: 'transform' }}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      {/* Overlay para melhorar a percepção de qualidade do vídeo (banding/artefatos) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-black/60 pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      <div className="relative z-10 flex h-full w-full">
        {/* LEFT SIDE SPARE (Empty for visual space) */}
        <div className="hidden md:block w-3/5 lg:w-[65%] h-full" />

        {/* RIGHT SIDE: Login Form with localized blur */}
        <div className="flex-1 h-full backdrop-blur-3xl bg-white/5 dark:bg-black/10 flex flex-col items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-[320px] space-y-10">

            <div className="space-y-2 text-center md:text-center">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Fazer login</h2>
            </div>

            <div className="flex justify-center">
              <motion.button
                onClick={loginWithDiscord}
                disabled={isLoading}
                className="relative w-full max-w-[240px] h-[48px] flex items-center justify-center px-6 rounded-full
                           bg-white/5 backdrop-blur-xl border border-white/10
                           text-white font-bold text-[10px] uppercase tracking-[0.2em]
                           transition-all duration-300
                           disabled:bg-white/10 disabled:cursor-not-allowed
                           shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden"
                whileHover={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 0 20px rgba(255,255,255,0.1)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 w-full justify-center absolute inset-0"
                    >
                      <div className="flex gap-1.5 translate-y-[0.5px]">
                        <motion.div
                          className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                      <span className="font-bold text-[11px] uppercase tracking-[0.2em] text-white">
                        Autenticando
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 w-full justify-center absolute inset-0"
                    >
                      <div className="w-5 h-5 flex items-center justify-center translate-y-[0.5px]">
                        <DiscordIcon />
                      </div>
                      <span className="relative top-[0.5px] font-bold text-[11px] uppercase tracking-[0.2em]">
                        Login
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Feedback de erro */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-red-500 text-xs text-center font-medium leading-relaxed">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-20 space-y-6">
              <div className="flex items-center justify-center gap-6">
                <span
                  onClick={() => setModal('terms')}
                  className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Suporte
                </span>
                <span
                  onClick={() => setModal('privacy')}
                  className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Privacidade
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL OVERLAY */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-8"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 p-10 rounded-3xl max-w-lg w-full max-h-[80vh] overflow-y-auto no-scrollbar"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-tighter">
                  {modal === 'privacy' ? 'Política de Privacidade' : 'Termos de Serviço'}
                </h3>
                <button onClick={() => setModal(null)} className="text-zinc-500 hover:text-white">✕</button>
              </div>

              <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
                {modal === 'privacy' ? (
                  <>
                    <p>No Codex, a sua privacidade é nossa prioridade. Coletamos apenas as informações necessárias do seu perfil do Discord (E-mail e Nome de Usuário) para criar sua conta e gerenciar seus kits.</p>
                    <p>Seus dados nunca são vendidos ou compartilhados com terceiros. Utilizamos criptografia de ponta a ponta para proteger todas as transações e históricos de download.</p>
                    <p>Ao utilizar o Codex, você concorda com a coleta mínima de dados para fins de autenticação e suporte ao cliente.</p>
                  </>
                ) : (
                  <>
                    <p>Bem-vindo ao Codex. Ao utilizar nossa plataforma, você concorda com as seguintes regras:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>O uso de recursos baixados no Codex é estritamente pessoal e não deve ser redistribuído sem autorização.</li>
                      <li>Tentativas de engenharia reversa do software ou abuso da API resultarão em banimento permanente.</li>
                      <li>O Codex reserva-se o direito de atualizar este software para garantir a segurança e estabilidade dos serviços.</li>
                    </ul>
                  </>
                )}
              </div>

              <button
                onClick={() => setModal(null)}
                className="mt-8 w-full py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-white/90 transition-all"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
