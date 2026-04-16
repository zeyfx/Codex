import { useState, useEffect, useMemo } from 'react'
import { useSearchStore } from '../stores/searchStore'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { LibraryItem } from '../types'
import Skeleton from '../components/Skeleton'

const CATEGORIES: Record<string, string> = {
  all: "Todos",
  vst: "VSTs",
  bank: "Banks",
  preset: "Presets",
  kit: "Kits",
  other: "Outros",
};

const CATEGORY_STYLES: Record<string, string> = {
  vst: "cat-vst",
  bank: "cat-bank",
  preset: "cat-preset",
  kit: "cat-kit",
  other: "cat-other",
};

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { query: search, selectedCategory: selectedCat } = useSearchStore()

  useEffect(() => {
    async function fetchItems() {
      try {
        const { data, error } = await supabase
          .from('library_items')
          .select('*')
          .order('title', { ascending: true })

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

  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchCat = selectedCat === 'all' || item.category.toLowerCase() === selectedCat.toLowerCase()
      const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [items, selectedCat, search])

  return (
    <div className="h-full space-y-8 w-full px-2 sm:px-6 lg:px-12 mx-auto pb-12">

      {/* Header Estilo Vortex Web */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-zinc-800/60 pb-8 pt-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-zinc-900 rounded-2xl shadow-sm border border-zinc-800/80">
            <svg className="w-6 h-6 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Biblioteca</h1>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest leading-none mt-1 inline-block">
              {filtered.length} Itens {selectedCat !== 'all' ? `em ${CATEGORIES[selectedCat]}` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Vortex Style - Solid & Clean */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-3xl" />
          ))
        ) : filtered.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.02, 0.2) }}
            onClick={() => navigate(`/item/${item.id}`)}
            className="group rounded-3xl border border-zinc-800/60 bg-[#0c0c0f] overflow-hidden hover:border-zinc-700 hover:bg-[#101014] transition-all cursor-pointer shadow-md hover:shadow-xl hover:shadow-black/50 flex flex-col"
          >
            <div className="relative aspect-[16/10] bg-[#050507] overflow-hidden">
              <img src={item.thumbnail_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0f] via-transparent to-transparent opacity-60" />
              <div className="absolute top-4 right-4">
                <div className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg ${CATEGORY_STYLES[item.category.toLowerCase()] || 'cat-other'}`}>
                  {item.category}
                </div>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-[15px] font-bold text-white tracking-tight line-clamp-1 group-hover:text-indigo-400 transition-colors mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed font-medium mt-auto">
                {item.description ? item.description.replace(/[#*`_\[\]]/g, "") : "Sem descrição disponível."}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
