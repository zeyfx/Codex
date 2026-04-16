import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const CATEGORIES = [
  { id: 'vst', label: 'VST' },
  { id: 'bank', label: 'Bank' },
  { id: 'preset', label: 'Preset' },
  { id: 'kit', label: 'Kit' },
  { id: 'other', label: 'Outro' },
]

export default function AdminPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    download_url: '',
    category: 'vst',
  })

  // Verificar se é realmente admin
  if (user?.role !== 'admin') {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
             <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
          </div>
          <h1 className="text-2xl font-black text-white">Acesso Restrito</h1>
          <p className="text-zinc-500 max-w-xs mx-auto text-sm">Apenas moderadores autorizados podem acessar o painel administrativo do Codex.</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: dbError } = await supabase
        .from('library_items')
        .insert([{
          ...formData,
          created_by: user?.supabaseId
        }])

      if (dbError) throw dbError

      setSuccess(true)
      setFormData({
        title: '',
        description: '',
        thumbnail_url: '',
        download_url: '',
        category: 'vst',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full space-y-8 max-w-[800px] mx-auto pb-12">
      <div className="border-b border-white/5 pb-8">
        <h1 className="text-4xl font-black text-white tracking-tighter">Admin Panel</h1>
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">
          Gerenciar Biblioteca do Aplicativo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Título do Produto</label>
            <input
              required
              type="text"
              placeholder="Ex: Xfer Serum v2.0"
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Categoria</label>
            <select
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Link da Thumbnail (URL)</label>
          <input
            required
            type="url"
            placeholder="https://suaimagem.com/foto.png"
            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
            value={formData.thumbnail_url}
            onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Link de Download (Magnet/Torrent)</label>
          <input
            required
            type="text"
            placeholder="magnet:?xt=urn:btih:..."
            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
            value={formData.download_url}
            onChange={(e) => setFormData({...formData, download_url: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Descrição (Suporta Markdown Completo)</label>
          <textarea
            required
            rows={8}
            placeholder="# Guia de Instalação\n1. Desative o antivírus..."
            className="w-full bg-white/5 border border-white/10 rounded-[24px] p-6 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all resize-none font-medium"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        {error && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest">
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs font-bold uppercase tracking-widest">
            Item cadastrado com sucesso e sincronizado!
          </motion.div>
        )}

        <button
          disabled={loading}
          type="submit"
          className="w-full h-14 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-zinc-200 transition-all disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? 'Sincronizando...' : 'Publicar na Biblioteca'}
        </button>
      </form>
    </div>
  )
}
