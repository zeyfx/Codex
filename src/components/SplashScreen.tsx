import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import logo from '../assets/logo.svg'

interface SplashScreenProps {
  onFinish: () => void
}

import { check } from '@tauri-apps/plugin-updater'
import { ask } from '@tauri-apps/plugin-dialog'
import { relaunch } from '@tauri-apps/plugin-process'

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [status, setStatus] = useState('Buscando atualizações...')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const sequence = async () => {
      try {
        const update = await check()
        if (update) {
          setProgress(50)
          setStatus(`Update ${update.version} encontrado!`)
          
          const yes = await ask(`Uma nova versão (${update.version}) do Codex está disponível!\n\nNota: ${update.body}\n\nDeseja instalar agora?`, { 
            title: 'Atualização do Codex',
            kind: 'info',
            okLabel: 'Atualizar',
            cancelLabel: 'Lembrar mais tarde'
          })
          
          if (yes) {
            setStatus('Baixando e instalando...')
            let downloaded = 0;
            let contentLength = 0;
            await update.downloadAndInstall((event) => {
              switch (event.event) {
                case 'Started':
                  contentLength = event.data.contentLength || 0;
                  break;
                case 'Progress':
                  downloaded += event.data.chunkLength;
                  if (contentLength > 0) {
                     setProgress(Math.round((downloaded / contentLength) * 100));
                  }
                  break;
                case 'Finished':
                  setStatus('Instalação concluída!')
                  setProgress(100)
                  break;
              }
            })
            await relaunch()
            return // Para a sequência
          }
        }
      } catch (err) {
        console.error('Erro ao buscar pacote de update', err)
      }

      setProgress(30)
      setStatus('Versão Validada - App seguro')

      await new Promise(r => setTimeout(r, 600))
      setStatus('Carregando biblioteca visual...')
      setProgress(70)

      await new Promise(r => setTimeout(r, 600))
      setStatus('Pronto')
      setProgress(100)
      
      await new Promise(r => setTimeout(r, 400))
      onFinish()
    }

    sequence()
  }, [onFinish])

  return (
    <motion.div 
      className="fixed inset-0 z-[10001] bg-[#060608] flex flex-col items-center justify-center p-8 selection:bg-transparent"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {/* CARD CENTRAL FLUTUANTE */}
      <motion.div 
        className="w-[480px] h-[340px] bg-[#09090b] border border-white/5 rounded-[40px] flex flex-col items-center justify-center relative shadow-2xl shadow-black/80 overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {/* Fundo com gradiente sutil */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative flex flex-col items-center gap-10">
          
          {/* LOGO ANIMADA */}
          <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
             className="relative"
          >
            <img 
              src={logo} 
              alt="Codex" 
              className="w-16 h-16 object-contain" 
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <motion.div 
              className="absolute -inset-4 bg-indigo-500/10 blur-xl rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>

          {/* STATUS E BARRA */}
          <div className="w-48 space-y-3">
            <div className="flex justify-between items-end">
              <motion.p 
                key={status}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[9px] font-bold uppercase tracking-widest text-zinc-500"
              >
                {status}
              </motion.p>
              <span className="text-[9px] font-mono text-zinc-700">{progress}%</span>
            </div>

            <div className="h-[2px] w-full bg-zinc-900 overflow-hidden rounded-full">
              <motion.div 
                className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "circOut", duration: 0.4 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* RODAPÉ EXTERNO */}
      <div className="mt-8 flex flex-col items-center gap-2">
         <span className="text-[10px] uppercase font-black tracking-[0.3em] text-white/5">VORTEX SECURITY</span>
      </div>
    </motion.div>
  )
}
