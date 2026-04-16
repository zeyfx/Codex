import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import { useSearchStore } from '../stores/searchStore'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { LibraryItem } from '../types'
import Fuse from 'fuse.js'

const CATEGORIES = [
  { id: 'all', name: 'Todos' },
  { id: 'vst', name: 'VSTs' },
  { id: 'bank', name: 'Banks' },
  { id: 'preset', name: 'Presets' },
  { id: 'kit', name: 'Kits' },
  { id: 'other', name: 'Outros' },
]

const CATEGORY_STYLES: Record<string, string> = {
  vst: "cat-vst",
  bank: "cat-bank",
  preset: "cat-preset",
  kit: "cat-kit",
  other: "cat-other",
};

export default function TitleBar() {
  const api = (window as any).api
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const { query, setQuery, selectedCategory, setSelectedCategory } = useSearchStore()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  // Local Search States
  const [isExpanded, setIsExpanded] = useState(false)
  const [tempQuery, setTempQuery] = useState(query)
  const [searchResults, setSearchResults] = useState<LibraryItem[]>([])
  const [allItems, setAllItems] = useState<LibraryItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Configuração do Fuse (Fuzzy Search)
  const fuse = useMemo(() => {
    return new Fuse(allItems, {
      keys: ['title', 'category'],
      threshold: 0.35, // Tolerância a erros (quanto menor, mais estrito)
      distance: 100,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [allItems]);

  useEffect(() => {
    async function preloadItems() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('library_items')
          .select('id, title, thumbnail_url, category')
        
        if (!error && data) setAllItems(data as any)
      } catch (err) {
        console.error("Erro ao indexar biblioteca:", err)
      }
    }
    preloadItems()
  }, [user])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        setIsExpanded(true)
        setTimeout(() => searchInputRef.current?.focus(), 100)
      }
      if (e.key === 'Escape') {
        setShowResults(false)
        setIsExpanded(false)
        searchInputRef.current?.blur()
      }
    };
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Buscar resultados fuzzy em tempo real
  useEffect(() => {
    if (tempQuery.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const results = fuse.search(tempQuery)
    setSearchResults(results.map(r => r.item).slice(0, 8))
    setIsSearching(false)
  }, [tempQuery, fuse])

  const handleSelectResult = (item: LibraryItem) => {
    setTempQuery("")
    setQuery("")
    setShowResults(false)
    setIsExpanded(false)
    navigate(`/item/${item.id}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setQuery(tempQuery)
    setShowResults(false)
    searchInputRef.current?.blur()
  }

  const isLoginPage = location.pathname === '/login'

  return (
    <header
      onMouseDown={() => api?.startDragging()}
      className="absolute top-0 left-0 w-full h-12 flex items-center justify-between pl-4 z-[9999] bg-[#09090b]/40 backdrop-blur-md border-b border-white/[0.02]"
    >
      <div className="flex-1 h-full" />

      {/* Título ou Busca Centralizada */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          {(!user || isLoginPage) ? (
            <motion.span
              key="logo"
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
              className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/20 select-none"
            >
              Codex
            </motion.span>
          ) : (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
              className="pointer-events-auto flex items-center gap-2"
              onMouseDown={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
            >
              <div className="relative group/filter">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`relative w-8 h-8 rounded-xl border flex items-center justify-center transition-all
                     ${selectedCategory !== 'all'
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                      : 'bg-white/5 border-white/5 text-zinc-600 hover:text-white hover:bg-white/10'}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  {selectedCategory !== 'all' && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#09090b] shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  )}
                </button>

                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 mt-2 p-1.5 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-[100] w-40"
                    >
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.id)
                            setIsFilterOpen(false)
                          }}
                          className={`w-full h-9 flex items-center px-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all
                              ${selectedCategory === cat.id
                              ? 'bg-indigo-500 text-white'
                              : 'text-zinc-500 hover:bg-white/5 hover:text-white'}`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.form 
                onSubmit={handleSearchSubmit}
                initial={false}
                animate={{ width: isExpanded ? 320 : 32 }}
                className="relative h-8 group overflow-visible"
              >
                {!isExpanded ? (
                  <button
                    onClick={() => {
                      setIsExpanded(true)
                      setTimeout(() => searchInputRef.current?.focus(), 50)
                    }}
                    className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-600 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                ) : (
                  <div className="relative w-full h-full">
                    <input
                      ref={searchInputRef}
                      type="text"
                      autoFocus
                      placeholder="Buscar no Codex..."
                      value={tempQuery}
                      onChange={(e) => {
                        setTempQuery(e.target.value)
                        setShowResults(true)
                      }}
                      onBlur={() => {
                        if (tempQuery === "") setIsExpanded(false)
                        // Pequeno delay para permitir clique nos resultados antes de sumir
                        setTimeout(() => setShowResults(false), 200)
                      }}
                      onFocus={() => setShowResults(true)}
                      className="w-full h-full bg-white/5 border border-indigo-500/50 rounded-xl px-10 text-[10px] font-bold uppercase tracking-widest text-white placeholder:text-zinc-600 focus:outline-none focus:bg-white/10 transition-all font-mono"
                    />
                    <svg className="w-3.5 h-3.5 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    
                    {/* Botão de fechar busca (X) */}
                    <button
                      type="button"
                      onClick={() => {
                        setTempQuery("")
                        setIsExpanded(false)
                        setShowResults(false)
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-600 hover:text-white transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Dropdown de Resultados Ampliado */}
                <AnimatePresence>
                  {showResults && tempQuery.length >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[480px] bg-[#0c0c0f] border border-white/10 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] backdrop-blur-2xl p-3 z-[200] space-y-1.5"
                    >
                      {isSearching ? (
                        <div className="p-10 flex flex-col items-center justify-center gap-4 text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">
                           <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                           Vasculhando a biblioteca...
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 gap-1">
                          <p className="px-4 py-2 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Resultados Encontrados</p>
                          {searchResults.map(item => (
                            <button
                              key={item.id}
                              onClick={() => handleSelectResult(item)}
                              className="w-full p-4 flex items-center gap-5 rounded-2xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all text-left group"
                            >
                              <div className="w-16 h-16 rounded-[14px] overflow-hidden bg-zinc-900 border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-500">
                                <img src={item.thumbnail_url} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2 mb-1">
                                   <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-white/5 ${CATEGORY_STYLES[item.category.toLowerCase()] || 'cat-other'}`}>
                                      {item.category}
                                   </span>
                                 </div>
                                 <p className="text-[13px] font-black text-white truncate leading-tight group-hover:text-indigo-400 transition-colors">
                                   {item.title}
                                 </p>
                                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest opacity-60">Visualizar Detalhes</p>
                              </div>
                              <svg className="w-4 h-4 text-zinc-800 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-16 flex flex-col items-center justify-center text-center">
                          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                             <svg className="w-6 h-6 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 011.383-1.03 4.001 4.001 0 013.91 0 4 4 0 011.383 1.03m0 0l1.383 1.383m-1.383-1.383l1.383-1.383m-1.383 1.383a4 4 0 010 5.656m0 0l-1.383-1.383m1.383 1.383l-1.383 1.383" />
                             </svg>
                          </div>
                          <p className="text-[11px] text-zinc-500 font-black uppercase tracking-widest">Nada foi encontrado</p>
                          <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest mt-1">Tente usar outros termos de busca</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controles da Janela */}
      <div
        className="no-drag flex items-center h-full"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => api?.minimizeWindow()}
          className="w-11 h-12 flex items-center justify-center text-zinc-600 hover:text-white hover:bg-white/5 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        <button
          onClick={() => api?.maximizeWindow()}
          className="w-11 h-12 flex items-center justify-center text-zinc-600 hover:text-white hover:bg-white/5 transition-all"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4z" />
          </svg>
        </button>

        <button
          onClick={() => api?.closeWindow()}
          className="w-11 h-12 flex items-center justify-center text-zinc-600 hover:text-white hover:bg-red-500/90 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </header>
  )
}
