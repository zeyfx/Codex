import { create } from 'zustand'

interface SearchState {
  query: string
  setQuery: (q: string) => void
  selectedCategory: string
  setSelectedCategory: (c: string) => void
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  setQuery: (q) => set({ query: q }),
  selectedCategory: 'all',
  setSelectedCategory: (c) => set({ selectedCategory: c }),
}))
