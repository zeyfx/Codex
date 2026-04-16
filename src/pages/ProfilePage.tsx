import { motion } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'

export default function ProfilePage() {
  const user = useAuthStore(s => s.user)

  // Se não houver usuário (ex: erro de carregamento inicial), não renderizamos nada
  // Em produção, isso garante que o app não "pisque" com dados errados.
  if (!user) return null

  const joinedDate = user.joinedAt ? new Date(user.joinedAt).toLocaleDateString('pt-BR') : '27/03/2026'

  return (
    <div className="h-full selection:bg-indigo-500/30">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }} // Transição ultra rápida apenas para suavizar a entrada
        className="max-w-4xl mx-auto"
      >
        
        {/* Banner e Avatar - Carregamento Instantâneo */}
        <div className="relative mb-16">
          <div className="h-40 w-full rounded-2xl overflow-hidden bg-zinc-900 border border-white/5">
            {user.bannerUrl && (
              <img src={user.bannerUrl} className="w-full h-full object-cover" alt="Banner" />
            )}
          </div>

          <div className="absolute -bottom-10 left-10">
            <div className="p-1 rounded-full bg-[#09090b]">
              <img 
                src={user.avatarUrl || ''} 
                className="w-20 h-20 rounded-full border border-white/10 bg-zinc-800" 
                alt={user.username} 
              />
            </div>
          </div>
        </div>

        {/* User Info Section */}
        <div className="mb-12">
          <h1 className="text-3xl font-black text-white tracking-tighter mb-1">
            {user.globalName || 'Usuário'}
          </h1>
          <div className="flex flex-col gap-1">
            <span className="text-zinc-500 font-medium lowercase">@{user.username}</span>
            <span className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest">{user.email}</span>
          </div>
        </div>

        {/* Informações Estáticas em Linha */}
        <div className="flex flex-wrap items-center gap-12 py-8 border-t border-b border-white/5">

           <div className="flex flex-col gap-1">
             <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Membro Desde</span>
             <span className="text-sm font-bold text-white uppercase">{joinedDate}</span>
           </div>

           <div className="w-px h-8 bg-white/5" />

           <div className="flex flex-col gap-1">
             <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Discord ID</span>
             <span className="text-sm font-bold text-zinc-400 font-mono tracking-tight">{user.discordId}</span>
           </div>
        </div>

      </motion.div>
    </div>
  )
}
