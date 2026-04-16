import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import type { LibraryItem } from '../types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Skeleton from '../components/Skeleton'

const CATEGORY_STYLES: Record<string, string> = {
  vst: "cat-vst",
  bank: "cat-bank",
  preset: "cat-preset",
  kit: "cat-kit",
  other: "cat-other",
};

function MarkdownRenderer({ content }: { content: string }) {
  // Limpeza de texto: remove escapes falsos e normaliza espaços
  const cleanContent = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\\r\\n/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/&nbsp;/g, ' ')
      .trim();
  };

  return (
    <div className="codex-markdown w-full break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Garante que links externos abram em nova aba
          a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
        }}
      >
        {cleanContent(content)}
      </ReactMarkdown>
    </div>
  );
}

export default function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState<LibraryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchItem() {
      if (!id) {
        setError("ID não fornecido.")
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('library_items')
          .select('*')
          .eq('id', id)
          .single()

        if (fetchError) throw fetchError
        if (!data) throw new Error("Item não encontrado.")

        setItem(data)
        setEditTitle(data.title)
        setEditDescription(data.description || "")
      } catch (err: any) {
        console.error('Erro ao buscar item:', err)
        setError(err.message || "Erro desconhecido ao carregar o item.")
      } finally {
        setLoading(false)
      }
    }
    fetchItem()
  }, [id])

  async function handleSave() {
    if (!item || !id) return
    try {
      setSaving(true)
      const { error: updateError } = await supabase
        .from('library_items')
        .update({
          title: editTitle,
          description: editDescription
        })
        .eq('id', id)

      if (updateError) throw updateError

      setItem({ ...item, title: editTitle, description: editDescription })
      setIsEditing(false)
    } catch (err: any) {
      console.error('Erro ao salvar item:', err)
      alert("Erro ao salvar: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-12">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-16">
          <Skeleton className="aspect-video rounded-[40px]" />
          <div className="space-y-6">
            <Skeleton className="h-20 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-[40px]" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6">
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-center max-w-md">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">Ops! Algo deu errado.</h2>
          <p className="text-sm text-zinc-400 mb-6">{error || "Não foi possível carregar as informações deste item."}</p>
          <button
            onClick={() => navigate('/library')}
            className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-zinc-200 transition-all"
          >
            Voltar para Biblioteca
          </button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-6 lg:px-12 py-10 pb-32 overflow-x-hidden"
    >
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between mb-12">
        <button
          onClick={() => navigate('/library')}
          className="group flex items-center gap-3 text-zinc-500 hover:text-white transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 transition-all">
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Voltar</span>
        </button>

        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={saving}
          className={`h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2
             ${isEditing
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'}`}
        >
          {saving ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Editar Item')}
          {!saving && !isEditing && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-20 items-start">
        {/* Main Content */}
        <div className="space-y-12">
          {/* Cover Image */}
          <div className="aspect-video rounded-[32px] overflow-hidden border border-white/5 shadow-2xl bg-[#050507]">
            <img src={item.thumbnail_url} className="w-full h-full object-cover shadow-inner" alt={item.title} />
          </div>

          {/* Details / Description */}
          <div className="space-y-10">
            <div className="flex items-center gap-6">
              <div className="flex-1 h-px bg-zinc-800/20" />
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full h-96 bg-zinc-950 border border-white/10 rounded-2xl p-6 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all font-mono leading-relaxed"
                  placeholder="Instruções em Markdown..."
                />
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest italic">
                  Suporta Markdown completo (negrito, links, listas, etc)
                </p>
              </div>
            ) : (
              <MarkdownRenderer content={item.description} />
            )}
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="lg:sticky lg:top-10 space-y-10">
          <div className="space-y-6">
            <div className={`inline-flex px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${CATEGORY_STYLES[item.category.toLowerCase()] || 'cat-other'}`}>
              {item.category}
            </div>

            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-zinc-950 border-b-2 border-indigo-500 p-0 py-2 text-2xl lg:text-3xl font-black text-white focus:outline-none tracking-tight"
              />
            ) : (
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tighter leading-[1.1] break-words">
                {item.title}
              </h1>
            )}
          </div>

          <div className="p-8 rounded-[28px] bg-zinc-900/40 border border-white/5 space-y-8 backdrop-blur-sm">
            <div className="space-y-4">
              <a
                href={item.download_url}
                className="w-full h-14 bg-white text-black font-black uppercase tracking-[0.15em] text-[11px] rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Baixar Agora
              </a>
              <p className="text-[9px] text-zinc-500 text-center font-bold uppercase tracking-[0.2em] opacity-40">
                Acesso via Codex Cloud
              </p>
            </div>

            <div className="h-px bg-white/5" />

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-600">
                <span>Status</span>
                <span className="text-emerald-500 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Ativo
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-600">
                <span>Adicionado em</span>
                <span className="text-white">
                  {new Date(item.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
