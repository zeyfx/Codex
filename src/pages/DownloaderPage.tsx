import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ───
interface FormatInfo {
  format_id: string
  format_note: string
  ext: string
  resolution: string
  width: number | null
  height: number | null
  fps: number | null
  filesize: number | null
  filesize_approx: number | null
  tbr: number | null
  vbr: number | null
  abr: number | null
  asr: number | null
  vcodec: string
  acodec: string
  dynamic_range: string | null
  audio_channels: number | null
  protocol: string
  language: string | null
  container: string | null
  has_video: boolean
  has_audio: boolean
}

interface VideoInfo {
  id: string
  title: string
  fulltitle: string
  description: string
  thumbnail: string
  thumbnails: string[]
  duration: number
  duration_string: string
  uploader: string
  channel: string
  channel_url: string
  channel_follower_count: number
  view_count: number
  like_count: number
  comment_count: number
  upload_date: string
  release_date: string
  webpage_url: string
  categories: string[]
  tags: string[]
  age_limit: number
  live_status: string
  is_live: boolean
  all_formats: FormatInfo[]
  video_formats: FormatInfo[]
  audio_formats: FormatInfo[]
  combined_formats: FormatInfo[]
  subtitles: { lang: string; name: string; formats: string[] }[]
  auto_subtitles: { lang: string; name: string; formats: string[] }[]
  chapters: { title: string; start_time: number; end_time: number }[]
  format_count: number
  video_format_count: number
  audio_format_count: number
}

interface DownloadProgress {
  percent: number; size: string; speed: string; eta: string
}

// ─── Helpers ───
function formatDuration(s: number): string {
  if (!s) return '0:00'
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60)
  return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${m}:${String(sec).padStart(2,'0')}`
}
function formatViews(n: number): string {
  if (!n) return '0'
  if (n >= 1e6) return `${(n/1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n/1e3).toFixed(1)}K`
  return String(n)
}
function formatBytes(b: number | null): string {
  if (!b) return '—'
  if (b >= 1073741824) return `${(b/1073741824).toFixed(2)} GB`
  if (b >= 1048576) return `${(b/1048576).toFixed(1)} MB`
  return `${(b/1024).toFixed(0)} KB`
}
function formatBitrate(k: number | null): string {
  if (!k) return '—'
  return k >= 1000 ? `${(k/1000).toFixed(1)} Mbps` : `${Math.round(k)} kbps`
}
function formatCodec(c: string): string {
  if (!c || c === 'none') return '—'
  return c.replace(/\..*$/, '').toUpperCase()
}

type DownloadMode = 'video_audio' | 'video_only' | 'audio_only'
type InputMode = 'single' | 'bulk'
type WizardStep = 'input' | 'mode' | 'video_select' | 'audio_select' | 'options' | 'downloading'

const MERGE_FORMATS = ['mp4', 'mkv', 'webm', 'avi', 'mov']
const AUDIO_FORMATS = ['mp3', 'aac', 'flac', 'm4a', 'opus', 'vorbis', 'wav']

// ─── Icons ───
const IconDownload = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
const IconSearch = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
const IconLink = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
const IconFolder = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
const IconBack = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
const IconVideo = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
const IconMusic = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
const IconVideoOff = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-4-4m4 4l4-4M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
const IconList = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
const IconCheck = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>

export default function DownloaderPage() {
  const api = (window as any).api
  const cleanupRef = useRef<(() => void)[]>([])

  // Core state
  const [step, setStep] = useState<WizardStep>('input')
  const [inputMode, setInputMode] = useState<InputMode>('single')
  const [url, setUrl] = useState('')
  const [bulkUrls, setBulkUrls] = useState('')
  const [loading, setLoading] = useState(false)
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [error, setError] = useState('')
  const [outputDir, setOutputDir] = useState('C:\\Codex\\downloads')
  const [downloadMode, setDownloadMode] = useState<DownloadMode>('video_audio')

  // Format selection
  const [selectedVideoFormat, setSelectedVideoFormat] = useState('')
  const [selectedAudioFormat, setSelectedAudioFormat] = useState('')
  const [mergeFormat, setMergeFormat] = useState('mp4')
  const [audioOutputFormat, setAudioOutputFormat] = useState('mp3')
  const [audioQuality, setAudioQuality] = useState('0')

  // Options
  const [embedThumbnail, setEmbedThumbnail] = useState(true)
  const [embedMetadata, setEmbedMetadata] = useState(true)
  const [embedSubtitles, setEmbedSubtitles] = useState(false)
  const [subtitleLangs, setSubtitleLangs] = useState('')
  const [sponsorblockRemove, setSponsorblockRemove] = useState(false)

  // Download state
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState<DownloadProgress | null>(null)
  const [downloadDone, setDownloadDone] = useState(false)
  const [ytdlpReady, setYtdlpReady] = useState<boolean | null>(null)
  const [ytdlpVersion, setYtdlpVersion] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  // Bulk state
  const [bulkIndex, setBulkIndex] = useState(0)
  const [bulkTotal, setBulkTotal] = useState(0)
  const [bulkResults, setBulkResults] = useState<{url:string;ok:boolean;msg:string}[]>([])

  // ─── Init ───
  useEffect(() => {
    async function init() {
      try {
        const [result, dir] = await Promise.all([api.ytdlpCheck(), api.ytdlpDefaultDir()])
        setYtdlpReady(result.installed)
        if (result.version) setYtdlpVersion(result.version)
        if (dir) setOutputDir(dir)

        // Auto-bootstrap se não estiver pronto
        if (!result.installed || !result.ffmpegReady) {
          setStatusMessage('Configurando motor de captura pela primeira vez...')
          if (!result.installed) await api.ytdlpInstall()
          if (!result.ffmpegReady) await api.ytdlpInstallFfmpeg()
          
          const finalCheck = await api.ytdlpCheck()
          setYtdlpReady(finalCheck.installed)
          setStatusMessage('')
        }
      } catch (err) { 
        console.error("Erro na inicialização:", err)
        setYtdlpReady(false) 
      }
    }
    init()

    const unsub = api.onYtdlpStatus?.((data: any) => {
      setStatusMessage(data.message || '')
      if (data.type === 'ready') {
        const timer = setTimeout(() => setStatusMessage(''), 3000)
        return () => clearTimeout(timer)
      }
    })
    if (unsub) cleanupRef.current.push(unsub)
    return () => { cleanupRef.current.forEach(fn => fn()) }
  }, [])

  useEffect(() => {
    const unsub = api.onYtdlpProgress?.((data: DownloadProgress) => setProgress(data))
    if (unsub) cleanupRef.current.push(unsub)
    return () => { if (unsub) unsub() }
  }, [])

  // ─── Fetch info ───
  const handleFetch = useCallback(async () => {
    const target = inputMode === 'single' ? url.trim() : bulkUrls.trim().split('\n').filter(Boolean)[0]
    if (!target) return
    setLoading(true); setError(''); setVideoInfo(null); setDownloadDone(false); setProgress(null)
    setSelectedVideoFormat(''); setSelectedAudioFormat('')
    try {
      let actualTarget = target
      
      // Auto-detect playlists in single mode
      if (inputMode === 'single') {
        setStatusMessage('Analizando fonte de mídia...')
        const pInfo = await api.ytdlpPlaylistInfo(target)
        if (pInfo.isPlaylist && pInfo.entries && pInfo.entries.length > 1) {
          const urls = pInfo.entries.map((e: any) => e.url).join('\n')
          setBulkUrls(urls)
          setInputMode('bulk')
          actualTarget = pInfo.entries[0].url // Use first video for format selection
          setStatusMessage(`Playlist detectada: ${pInfo.count} itens sincronizados.`)
        } else {
          setStatusMessage('Extraindo metadados da mídia...')
        }
      } else {
        setStatusMessage('Iniciando análise de lote...')
      }

      const info = await api.ytdlpInfo(actualTarget)
      setVideoInfo(info)
      if (info.subtitles?.length > 0) setSubtitleLangs(info.subtitles.map((s: any) => s.lang).join(','))
      setStep('mode')
      setStatusMessage('')
    } catch (err: any) {
      setError(err.message || 'Erro ao processar o link solicitado.')
      setStatusMessage('')
    } finally { setLoading(false) }
  }, [url, bulkUrls, inputMode])

  const handleChooseFolder = useCallback(async () => {
    const dir = await api.ytdlpChooseFolder()
    if (dir) setOutputDir(dir)
  }, [])

  // ─── Download single ───
  const doDownload = useCallback(async (targetUrl: string) => {
    await api.ytdlpDownload({
      url: targetUrl, outputDir, format: 'best',
      audioOnly: downloadMode === 'audio_only',
      audioFormat: audioOutputFormat, audioQuality,
      mergeFormat: downloadMode === 'audio_only' ? '' : mergeFormat,
      embedThumbnail, embedMetadata, embedSubtitles, subtitleLangs, sponsorblockRemove,
      videoFormatId: downloadMode === 'audio_only' ? '' : selectedVideoFormat,
      audioFormatId: downloadMode === 'video_only' ? '' : selectedAudioFormat,
    })
  }, [outputDir, downloadMode, audioOutputFormat, audioQuality, mergeFormat, embedThumbnail, embedMetadata, embedSubtitles, subtitleLangs, sponsorblockRemove, selectedVideoFormat, selectedAudioFormat])

  const handleDownload = useCallback(async () => {
    setDownloading(true); setProgress(null); setDownloadDone(false); setError(''); setStep('downloading')
    try {
      if (inputMode === 'bulk') {
        const urls = bulkUrls.trim().split('\n').map(u => u.trim()).filter(Boolean)
        setBulkTotal(urls.length); setBulkResults([])
        for (let i = 0; i < urls.length; i++) {
          setBulkIndex(i + 1); setProgress(null)
          try {
            await doDownload(urls[i])
            setBulkResults(r => [...r, { url: urls[i], ok: true, msg: 'Concluído' }])
          } catch (err: any) {
            setBulkResults(r => [...r, { url: urls[i], ok: false, msg: err.message }])
          }
        }
      } else {
        await doDownload(videoInfo?.webpage_url || url)
      }
      setDownloadDone(true)
    } catch (err: any) { setError(err.message || 'Erro durante o download') }
    finally { setDownloading(false) }
  }, [videoInfo, url, inputMode, bulkUrls, doDownload])

  // ─── Computed ───
  const estimatedSize = (() => {
    if (!videoInfo) return null
    if (downloadMode === 'audio_only') {
      const af = videoInfo.audio_formats.find(f => f.format_id === selectedAudioFormat) || videoInfo.audio_formats[0]
      return af?.filesize || af?.filesize_approx || null
    }
    const vf = videoInfo.video_formats.find(f => f.format_id === selectedVideoFormat) || videoInfo.video_formats[0]
    const af = videoInfo.audio_formats.find(f => f.format_id === selectedAudioFormat) || videoInfo.audio_formats[0]
    const vs = vf?.filesize || vf?.filesize_approx || 0
    const as_ = downloadMode === 'video_only' ? 0 : (af?.filesize || af?.filesize_approx || 0)
    return vs + as_ || null
  })()

  const goBack = () => {
    if (step === 'mode') { setStep('input'); setVideoInfo(null) }
    else if (step === 'video_select') setStep('mode')
    else if (step === 'audio_select') setStep(downloadMode === 'video_audio' ? 'video_select' : 'mode')
    else if (step === 'options') {
      if (downloadMode === 'video_audio') setStep('audio_select')
      else if (downloadMode === 'video_only') setStep('video_select')
      else setStep('audio_select')
    }
    else if (step === 'downloading' && downloadDone) resetAll()
  }

  const handleModeSelect = (mode: DownloadMode) => {
    setDownloadMode(mode); setSelectedVideoFormat(''); setSelectedAudioFormat('')
    if (mode === 'audio_only') setStep('audio_select')
    else setStep('video_select')
  }

  const handleVideoNext = () => {
    if (downloadMode === 'video_audio') setStep('audio_select')
    else setStep('options')
  }

  const resetAll = () => {
    setStep('input'); setVideoInfo(null); setUrl(''); setBulkUrls(''); setError('')
    setDownloadDone(false); setProgress(null); setSelectedVideoFormat(''); setSelectedAudioFormat('')
    setBulkResults([]); setBulkIndex(0); setBulkTotal(0)
  }

  // ─── Step indicator ───
  const steps: { key: WizardStep; label: string }[] = [
    { key: 'input', label: 'URL' }, { key: 'mode', label: 'Modo' },
    ...(downloadMode !== 'audio_only' ? [{ key: 'video_select' as WizardStep, label: 'Vídeo' }] : []),
    ...(downloadMode !== 'video_only' ? [{ key: 'audio_select' as WizardStep, label: 'Áudio' }] : []),
    { key: 'options', label: 'Opções' }, { key: 'downloading', label: 'Download' },
  ]
  const currentStepIdx = steps.findIndex(s => s.key === step)

  return (
    <div className="h-full max-w-[1200px] mx-auto pb-12 flex flex-col">
      {/* ═══ HEADER ═══ */}
      <div className="flex items-center justify-between gap-6 border-b border-white/[0.06] pb-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/10 text-white"><IconDownload /></div>
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-[0.2em] italic">Capture Engine</h1>
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              SISTEMA DE DOWNLOAD INTEGRADO {ytdlpVersion && <span className="text-zinc-700">VERSION {ytdlpVersion}</span>}
              {ytdlpReady === true && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px] shadow-emerald-500" />}
              {ytdlpReady === false && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px] shadow-amber-500" />}
            </span>
          </div>
        </div>
        {step !== 'input' && (
          <button onClick={goBack} className="h-9 px-4 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
            <IconBack /> Voltar
          </button>
        )}
      </div>

      {/* ═══ STEP INDICATOR ═══ */}
      <div className="flex items-center gap-1 mb-8">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-1 flex-1">
            <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= currentStepIdx ? 'bg-red-500' : 'bg-white/5'}`} />
          </div>
        ))}
      </div>
      <div className="flex justify-between mb-6 -mt-6 px-1">
        {steps.map((s, i) => (
          <span key={s.key} className={`text-[8px] font-black uppercase tracking-[0.2em] transition-colors ${i <= currentStepIdx ? 'text-red-400' : 'text-zinc-700'}`}>{s.label}</span>
        ))}
      </div>

      {/* Status */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
            className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/10 text-amber-400 text-xs font-bold mb-4"
          >{statusMessage}</motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            className="p-5 rounded-2xl bg-red-500/10 border border-red-500/10 text-red-400 text-xs font-medium leading-relaxed mb-4">
            <span className="font-black uppercase tracking-widest text-[10px] block mb-1">Erro</span>{error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ WIZARD STEPS ═══ */}
      <div className="flex-1">
        <AnimatePresence mode="wait">

          {/* ──── STEP: INPUT ──── */}
          {step === 'input' && (
            <motion.div key="input" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}} className="space-y-6">
              {/* Input mode toggle */}
              <div className="flex gap-2">
                <button onClick={() => setInputMode('single')}
                  className={`flex-1 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${inputMode==='single'?'bg-white text-black border-white':'bg-white/5 text-zinc-500 border-white/5 hover:text-white hover:bg-white/10'}`}>
                  <IconLink /> Link Único
                </button>
                <button onClick={() => setInputMode('bulk')}
                  className={`flex-1 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${inputMode==='bulk'?'bg-white text-black border-white':'bg-white/5 text-zinc-500 border-white/5 hover:text-white hover:bg-white/10'}`}>
                  <IconList /> Download em Massa
                </button>
              </div>

              {inputMode === 'single' ? (
                <div className="flex gap-3">
                  <div className="relative flex-1 group">
                    <input type="text" placeholder="Cole a URL do vídeo ou playlist aqui..." value={url}
                      onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleFetch()} disabled={loading}
                      className="w-full h-14 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-14 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10 transition-all disabled:opacity-40" />
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-400 transition-colors"><IconLink /></div>
                  </div>
                  <button onClick={handleFetch} disabled={loading || !url.trim()}
                    className="h-14 px-8 bg-white text-black font-black uppercase tracking-[0.15em] text-[10px] rounded-2xl hover:bg-zinc-200 transition-all active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3">
                    {loading ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <IconSearch />}
                    Buscar
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea placeholder={"Cole os links aqui, um por linha...\nhttps://youtube.com/watch?v=xxx\nhttps://youtube.com/watch?v=yyy"} value={bulkUrls}
                    onChange={e => setBulkUrls(e.target.value)} rows={8}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10 transition-all resize-none font-mono" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-600 font-bold">{bulkUrls.trim().split('\n').filter(Boolean).length} links detectados</span>
                    <button onClick={handleFetch} disabled={loading || !bulkUrls.trim()}
                      className="h-12 px-8 bg-white text-black font-black uppercase tracking-[0.15em] text-[10px] rounded-2xl hover:bg-zinc-200 transition-all active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3">
                      {loading ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <IconSearch />}
                      Analisar Primeiro Link
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-zinc-700 text-center font-medium">
                Suporta YouTube, SoundCloud, Vimeo e <span className="text-red-400/60">+1000 sites</span> • Aceita links de playlists do YouTube
              </p>

              {/* Loading skeleton */}
              {loading && (
                <div className="rounded-[32px] border border-white/[0.04] bg-white/[0.02] overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr]">
                    <div className="aspect-video lg:aspect-auto lg:h-56 bg-zinc-900/50 animate-pulse" />
                    <div className="p-8 space-y-4">
                      <div className="h-4 bg-white/5 rounded-xl w-3/4 animate-pulse" />
                      <div className="h-3 bg-white/5 rounded-lg w-1/2 animate-pulse" />
                      <div className="h-3 bg-white/5 rounded-lg w-2/3 animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!loading && !error && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.04] flex items-center justify-center mb-6 text-zinc-700"><IconVideo /></div>
                  <h3 className="text-sm font-bold text-zinc-400 mb-2">Nenhum vídeo carregado</h3>
                  <p className="text-xs text-zinc-700 max-w-xs leading-relaxed">Cole um link acima para começar.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ──── STEP: MODE SELECT ──── */}
          {step === 'mode' && videoInfo && (
            <motion.div key="mode" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}} className="space-y-6">
              <VideoPreviewCard info={videoInfo} />
              <div className="space-y-3">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Selecione o modo de download</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ModeCard icon={<IconMusic />} title="Conversão em Áudio" desc="Extração de alta fidelidade para formatos de estúdio (MP3, FLAC, WAV)" tag="ALPHA" onClick={() => handleModeSelect('audio_only')} highlight />
                  <ModeCard icon={<IconVideo />} title="Captura de Vídeo" desc="Preservação de resolução máxima com áudio integrado" tag="01" onClick={() => handleModeSelect('video_audio')} />
                  <ModeCard icon={<IconVideoOff />} title="Stream de Somente Vídeo" desc="Download purista da faixa visual sem processamento de áudio" tag="02" onClick={() => handleModeSelect('video_only')} />
                </div>
              </div>
            </motion.div>
          )}

          {/* ──── STEP: VIDEO SELECT ──── */}
          {step === 'video_select' && videoInfo && (
            <motion.div key="vselect" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}} className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Selecione a Qualidade do Vídeo</span>
                {estimatedSize && <span className="text-[10px] font-bold text-emerald-400">≈ {formatBytes(estimatedSize)}</span>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[420px] overflow-y-auto no-scrollbar pr-1">
                <FormatCard selected={selectedVideoFormat === ''} onClick={() => setSelectedVideoFormat('')} label="Melhor Automático" sublabel="bv*+ba" highlight />
                {videoInfo.video_formats
                  .filter((f, i, arr) => arr.findIndex(x => x.height === f.height && x.ext === f.ext) === i)
                  .map(f => (
                    <FormatCard key={f.format_id} selected={selectedVideoFormat === f.format_id} onClick={() => setSelectedVideoFormat(f.format_id)}
                      label={f.resolution} sublabel={`${f.ext.toUpperCase()} • ${formatCodec(f.vcodec)}${f.fps ? ` • ${f.fps}fps` : ''}`}
                      size={formatBytes(f.filesize || f.filesize_approx)} bitrate={formatBitrate(f.tbr || f.vbr)}
                      badge={f.dynamic_range === 'HDR' ? 'HDR' : undefined} />
                  ))}
              </div>
              {downloadMode !== 'video_only' && (
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Formato de Saída</span>
                  <div className="flex flex-wrap gap-2">
                    {MERGE_FORMATS.map(fmt => (
                      <button key={fmt} onClick={() => setMergeFormat(fmt)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${mergeFormat===fmt?'bg-red-500/20 text-red-400 border-red-500/20':'bg-white/5 text-zinc-600 border-white/5 hover:text-white hover:bg-white/10'}`}
                      >{fmt}</button>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={handleVideoNext}
                className="w-full h-12 bg-white text-black font-black uppercase tracking-[0.15em] text-[10px] rounded-2xl hover:bg-zinc-200 transition-all active:scale-[0.97] flex items-center justify-center gap-2">
                {downloadMode === 'video_audio' ? 'Próximo: Selecionar Áudio' : 'Próximo: Opções'}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </motion.div>
          )}

          {/* ──── STEP: AUDIO SELECT ──── */}
          {step === 'audio_select' && videoInfo && (
            <motion.div key="aselect" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}} className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Selecione a Faixa de Áudio</span>
                {estimatedSize && <span className="text-[10px] font-bold text-emerald-400">≈ {formatBytes(estimatedSize)}</span>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[350px] overflow-y-auto no-scrollbar pr-1">
                <FormatCard selected={selectedAudioFormat === ''} onClick={() => setSelectedAudioFormat('')} label="Melhor Automático" sublabel="ba (melhor áudio)" highlight />
                {videoInfo.audio_formats.map(f => (
                  <FormatCard key={f.format_id} selected={selectedAudioFormat === f.format_id} onClick={() => setSelectedAudioFormat(f.format_id)}
                    label={`${formatCodec(f.acodec)} • ${f.ext}`}
                    sublabel={`${f.asr ? `${f.asr}Hz` : ''}${f.audio_channels ? ` • ${f.audio_channels}ch` : ''}${f.language ? ` • ${f.language}` : ''}`}
                    size={formatBytes(f.filesize || f.filesize_approx)} bitrate={formatBitrate(f.abr || f.tbr)} />
                ))}
              </div>
              {downloadMode === 'audio_only' && (
                <>
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Formato de Saída do Áudio</span>
                    <div className="flex flex-wrap gap-2">
                      {AUDIO_FORMATS.map(fmt => (
                        <button key={fmt} onClick={() => setAudioOutputFormat(fmt)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${audioOutputFormat===fmt?'bg-red-500/20 text-red-400 border-red-500/20':'bg-white/5 text-zinc-600 border-white/5 hover:text-white hover:bg-white/10'}`}
                        >{fmt}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Qualidade • {audioQuality==='0'?'Máxima':audioQuality==='5'?'Média':audioQuality==='10'?'Mínima':`Nível ${audioQuality}`}</span>
                    <input type="range" min="0" max="10" value={audioQuality} onChange={e => setAudioQuality(e.target.value)}
                      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg" />
                    <div className="flex justify-between text-[8px] text-zinc-700 font-bold uppercase tracking-widest"><span>Melhor</span><span>Pior</span></div>
                  </div>
                </>
              )}
              <button onClick={() => setStep('options')}
                className="w-full h-12 bg-white text-black font-black uppercase tracking-[0.15em] text-[10px] rounded-2xl hover:bg-zinc-200 transition-all active:scale-[0.97] flex items-center justify-center gap-2">
                Próximo: Opções
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </motion.div>
          )}

          {/* ──── STEP: OPTIONS ──── */}
          {step === 'options' && (
            <motion.div key="options" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}} className="space-y-5">
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Opções de Pós-processamento</span>
              <div className="space-y-2">
                <ToggleOption label="Embutir Thumbnail" desc="Adicionar a capa como thumbnail no arquivo" value={embedThumbnail} onChange={setEmbedThumbnail} />
                <ToggleOption label="Embutir Metadados" desc="Adicionar título, artista, data etc." value={embedMetadata} onChange={setEmbedMetadata} />
                <ToggleOption label="Remover Patrocínios" desc="Remover segmentos via SponsorBlock (YouTube)" value={sponsorblockRemove} onChange={setSponsorblockRemove} />
                <ToggleOption label="Embutir Legendas" desc="Baixar e embutir legendas no vídeo" value={embedSubtitles} onChange={setEmbedSubtitles} />
              </div>

              {/* Output dir */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Pasta de Destino</span>
                <div className="flex gap-3 items-center">
                  <button onClick={handleChooseFolder} className="h-11 px-5 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"><IconFolder /> Alterar</button>
                  <span className="text-[11px] text-zinc-600 truncate flex-1 font-mono">{outputDir}</span>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-2">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Resumo</span>
                <div className="flex items-center gap-2 flex-wrap text-[9px] uppercase tracking-widest font-bold text-zinc-500">
                  <span className="text-white">{downloadMode === 'video_audio' ? 'Vídeo+Áudio' : downloadMode === 'video_only' ? 'Somente Vídeo' : 'Somente Áudio'}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-800" />
                  <span>{downloadMode === 'audio_only' ? audioOutputFormat : mergeFormat}</span>
                  {estimatedSize && <><span className="w-1 h-1 rounded-full bg-zinc-800" /><span className="text-emerald-400">{formatBytes(estimatedSize)}</span></>}
                  {inputMode === 'bulk' && <><span className="w-1 h-1 rounded-full bg-zinc-800" /><span className="text-amber-400">{bulkUrls.trim().split('\n').filter(Boolean).length} links</span></>}
                </div>
              </div>

              <button onClick={handleDownload} disabled={!outputDir}
                className="w-full h-14 bg-gradient-to-r from-red-600 to-red-500 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl hover:from-red-500 hover:to-red-400 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_8px_30px_rgba(239,68,68,0.20)]">
                <IconDownload /> Iniciar Download
              </button>
            </motion.div>
          )}

          {/* ──── STEP: DOWNLOADING ──── */}
          {step === 'downloading' && (
            <motion.div key="dl" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}} className="space-y-5">
              {inputMode === 'bulk' && bulkTotal > 0 && (
                <div className="space-y-3">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Download em Massa • {bulkIndex}/{bulkTotal}</span>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400" initial={{width:0}} animate={{width:`${(bulkIndex/bulkTotal)*100}%`}} />
                  </div>
                  <div className="max-h-48 overflow-y-auto no-scrollbar space-y-1">
                    {bulkResults.map((r, i) => (
                      <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] ${r.ok ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-red-500/5 border border-red-500/10'}`}>
                        {r.ok ? <span className="text-emerald-400"><IconCheck /></span> : <span className="text-red-400">✕</span>}
                        <span className="truncate flex-1 text-zinc-400 font-mono">{r.url}</span>
                        <span className={r.ok ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{r.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {progress && (
                <div className="space-y-3 p-6 rounded-2xl border border-white/[0.04] bg-white/[0.02]">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold">
                    <span className={downloadDone ? 'text-emerald-400' : 'text-white'}>{downloadDone ? 'Concluído!' : `${progress.percent.toFixed(1)}%`}</span>
                    <div className="flex items-center gap-4 text-zinc-600">
                      <span>{progress.size}</span><span>{progress.speed}</span><span>{progress.eta}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className={`h-full rounded-full ${downloadDone?'bg-emerald-500':'bg-gradient-to-r from-red-600 to-red-400'}`}
                      initial={{width:0}} animate={{width:`${Math.min(progress.percent,100)}%`}} transition={{duration:0.3}} />
                  </div>
                </div>
              )}

              {downloadDone && (
                <button onClick={resetAll}
                  className="w-full h-12 bg-white text-black font-black uppercase tracking-[0.15em] text-[10px] rounded-2xl hover:bg-zinc-200 transition-all active:scale-[0.97] flex items-center justify-center gap-2">
                  Novo Download
                </button>
              )}

              {downloading && !progress && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 border-3 border-white/10 border-t-red-500 rounded-full animate-spin mb-4" />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Preparando download...</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Sub-components ───

function VideoPreviewCard({ info }: { info: VideoInfo }) {
  return (
    <div className="rounded-[28px] border border-white/[0.04] bg-white/[0.02] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr]">
        <div className="relative aspect-video lg:aspect-auto lg:h-full bg-zinc-900 overflow-hidden">
          {info.thumbnail && <img src={info.thumbnail} alt={info.title} className="w-full h-full object-cover" />}
          {info.duration > 0 && (
            <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 backdrop-blur-xl rounded-lg text-white text-[10px] font-black tracking-widest">
              {info.duration_string || formatDuration(info.duration)}
            </div>
          )}
        </div>
        <div className="p-6 flex flex-col gap-2">
          <h2 className="text-sm font-bold text-white tracking-tight leading-snug line-clamp-2">{info.title}</h2>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[9px] uppercase tracking-widest text-zinc-500 font-bold">
            <span>{info.uploader || info.channel}</span>
            {info.view_count > 0 && <><span className="w-1 h-1 rounded-full bg-zinc-700" /><span>{formatViews(info.view_count)} views</span></>}
            {info.upload_date && <><span className="w-1 h-1 rounded-full bg-zinc-700" /><span>{info.upload_date.replace(/(\d{4})(\d{2})(\d{2})/, '$3/$2/$1')}</span></>}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[9px] text-zinc-500 font-bold">{info.format_count} formatos</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[9px] text-zinc-500 font-bold">{info.video_format_count} vídeo</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[9px] text-zinc-500 font-bold">{info.audio_format_count} áudio</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ModeCard({ icon, title, desc, tag, onClick, highlight }: { icon: React.ReactNode; title: string; desc: string; tag: string; onClick: () => void; highlight?: boolean }) {
  return (
    <button onClick={onClick}
      className={`p-6 rounded-2xl border transition-all text-left group active:scale-[0.97] relative overflow-hidden flex flex-col items-start ${
        highlight 
          ? 'bg-red-500/[0.03] border-red-500/20 hover:bg-red-500/[0.06] hover:border-red-500/30 ring-1 ring-red-500/10' 
          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]'
      }`}>
      {highlight && (
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-red-500/10 blur-[40px] rounded-full" />
      )}
      <div className={`p-2 rounded-lg mb-4 transition-all ${highlight ? 'bg-red-500/10 text-red-400' : 'text-zinc-500 group-hover:text-red-400 bg-white/5 group-hover:bg-red-400/5'}`}>
        {icon}
      </div>
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-sm font-black text-white uppercase tracking-tight italic">{title}</h3>
        {highlight && <span className="px-1.5 py-0.5 bg-red-500 text-white text-[7px] font-black rounded-md uppercase tracking-widest animate-pulse">Recomendado</span>}
      </div>
      <p className="text-[10px] text-zinc-600 leading-relaxed font-medium">{desc}</p>
      <span className="absolute bottom-3 right-3 text-[10px] font-black text-zinc-800 uppercase tracking-widest opacity-20">{tag}</span>
    </button>
  )
}

function FormatCard({ selected, onClick, label, sublabel, size, bitrate, highlight, badge }: {
  selected: boolean; onClick: () => void; label: string; sublabel: string
  size?: string; bitrate?: string; highlight?: boolean; badge?: string
}) {
  return (
    <button onClick={onClick}
      className={`p-3 rounded-xl border text-left transition-all ${selected ? 'bg-red-500/15 border-red-500/20 ring-1 ring-red-500/20'
        : highlight ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/5'}`}>
      <div className="flex items-start justify-between gap-1">
        <span className={`text-[11px] font-bold ${selected ? 'text-red-400' : 'text-white'}`}>{label}</span>
        {badge && <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[7px] font-black rounded-md uppercase">{badge}</span>}
      </div>
      <span className="text-[9px] text-zinc-600 font-medium block mt-0.5">{sublabel}</span>
      {(size || bitrate) && (
        <div className="flex items-center gap-2 mt-1.5 text-[9px] font-bold">
          {size && size !== '—' && <span className="text-emerald-400/70">{size}</span>}
          {bitrate && bitrate !== '—' && <span className="text-zinc-600">{bitrate}</span>}
        </div>
      )}
    </button>
  )
}

function ToggleOption({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${value ? 'bg-white/5 border-white/10' : 'bg-transparent border-white/[0.04] hover:bg-white/[0.02]'}`}>
      <div className={`w-9 h-5 rounded-full flex items-center transition-all flex-shrink-0 ${value ? 'bg-red-500 justify-end' : 'bg-zinc-800 justify-start'}`}>
        <div className={`w-4 h-4 rounded-full bg-white mx-0.5 transition-all shadow-sm ${value ? 'shadow-red-500/50' : ''}`} />
      </div>
      <div>
        <span className="text-[11px] font-bold text-white block">{label}</span>
        <span className="text-[9px] text-zinc-600">{desc}</span>
      </div>
    </button>
  )
}
