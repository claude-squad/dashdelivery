import { Sun, Moon } from 'lucide-react'
import { useStore } from '@/store/useStore'

export function ThemeToggle() {
  const { theme, setTheme } = useStore()
  const isLight = theme === 'light'

  return (
    <button
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
      title={isLight ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro'}
    >
      {isLight ? <Moon size={15} /> : <Sun size={15} />}
    </button>
  )
}
