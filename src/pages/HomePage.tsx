import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import type { LibraryItem } from '../types'
import Skeleton from '../components/Skeleton'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="codex-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content || "Sem descrição disponível."}
      </ReactMarkdown>
    </div>
  );
}

export default function HomePage() {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function fetchItems() {
      try {
        const { data, error } = await supabase
          .from('library_items')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setItems(data || [])
      } catch (err) {
        console.error('Erro ao buscar itens:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [])

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(i => i.category.toLowerCase() === filter.toLowerCase())

  return (
    <div className="h-full space-y-10 w-full px-2 sm:px-6 lg:px-12 mx-auto pb-12">
      
      {/* Header & Filtros */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-2">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter mt-4">Dashboard</h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">
            Explorar Catálogo Premium
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-[#0c0c0f] p-1.5 rounded-2xl border border-zinc-800/80 shadow-inner">
          {['all', 'vst', 'bank', 'preset', 'kit'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                ${filter === cat ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/80'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Itens - Solid & Clean */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-[32px]" />
          ))
        ) : (
          filteredItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.4) }}
              onClick={() => setSelectedItem(item)}
              className="group cursor-pointer relative aspect-[4/5] rounded-[32px] overflow-hidden bg-[#0c0c0f] border border-zinc-800/60 hover:border-zinc-700 transition-all duration-500 shadow-md hover:shadow-xl hover:shadow-black/50"
            >
              {/* Thumbnail */}
              <img 
                src={item.thumbnail_url} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" 
                alt={item.title} 
              />
              
              {/* Overlay de Degradê Frost */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/40 to-transparent opacity-90 transition-opacity group-hover:opacity-70" />

              {/* Info do Card */}
              <div className="absolute bottom-0 left-0 w-full p-6 space-y-2 z-10">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] shadow-sm">
                  {item.category}
                </span>
                <h3 className="text-base font-bold text-white leading-tight line-clamp-2 drop-shadow-md">
                  {item.title}
                </h3>
              </div>

              {/* Hover Badge */}
              <div className="absolute top-4 right-4 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-10">
                <div className="bg-white text-black p-2.5 rounded-xl shadow-xl">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal de Detalhes (Clean & Markdown) */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-5xl max-h-[85vh] bg-[#0c0c0f] rounded-[40px] border border-zinc-800/80 overflow-hidden flex flex-col md:flex-row shadow-2xl"
            >
              {/* Lado Esquerdo: Imagem */}
              <div className="w-full md:w-2/5 h-64 md:h-auto bg-[#050507] overflow-hidden border-r border-zinc-800/50">
                <img src={selectedItem.thumbnail_url} className="w-full h-full object-cover" alt="" />
              </div>

              {/* Lado Direito: Info & Action */}
              <div className="flex-1 p-8 md:p-12 overflow-y-auto no-scrollbar flex flex-col">
                 <div className="flex-1 space-y-8">
                    <div>
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-loose">
                        {selectedItem.category}
                      </span>
                      <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tighter leading-tight mt-1">
                        {selectedItem.title}
                      </h2>
                    </div>

                    <div className="border-t border-zinc-800/50 pt-6">
                      <MarkdownRenderer content={selectedItem.description} />
                    </div>
                 </div>

                 <div className="mt-10 flex gap-4 pt-6">
                    <a 
                      href={selectedItem.download_url}
                      className="flex-1 h-14 bg-white text-black font-black uppercase tracking-[0.15em] text-[11px] rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-lg shadow-white/10"
                    >
                      Processar Download
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                    <button 
                      onClick={() => setSelectedItem(null)}
                      className="w-14 h-14 bg-[#141418] text-zinc-400 rounded-xl flex items-center justify-center hover:bg-zinc-800 hover:text-white transition-all border border-zinc-800/80 active:scale-[0.98]"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
