import { create } from 'zustand'

interface ToastState {
  msg: string
  emoji: string
  show: (msg: string, emoji?: string) => void
  hide: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  msg: '',
  emoji: '✨',
  show: (msg, emoji = '✨') => set({ msg, emoji }),
  hide: () => set({ msg: '' }),
}))
