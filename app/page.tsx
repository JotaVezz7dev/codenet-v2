'use client'


import { useState, useEffect, useRef, useId, memo } from 'react'
import { 
  Activity, ArrowUp, Copy, ThumbsUp, ThumbsDown, BarChart2, Bell, CheckCircle2, ChevronDown, ChevronRight, 
  Cpu, DollarSign, DownloadCloud, Eye, EyeOff, FileArchive, FileText, FileUp, 
  Globe, HelpCircle, Home, Key, LockKeyhole, LogIn, Mic, Network, 
  PanelLeftClose, PanelLeftOpen, Play, Pause, RefreshCw, RotateCcw, 
  Router, Save, Search, Server, Settings, ShieldCheck, Sparkles, 
  Terminal, TrendingUp, UploadCloud, User, UserCheck, UserPlus, Wifi, X,
  ShieldAlert, Shield, PieChart, AlertTriangle, Radio, Filter, Code2, Zap
} from 'lucide-react'

// Ícone personalizado do Assistente
const CHAT_API_URL = 'https://codenet-ai-api.vercel.app/api/chat'

async function requestGeminiChat(message: string, history: { role: string; parts: { text: string }[] }[], systemContext: unknown, signal: AbortSignal): Promise<{ text: string; action: string | null; actionArgs?: Record<string, unknown> }> {
  const response = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, systemContext }),
    signal
  })
  if (!response.ok) throw new Error('Chat backend returned HTTP ' + response.status)
  const data = await response.json()
  if (!data || typeof data.text !== 'string') throw new Error('Invalid chat response')
  return data
}

function AssistantIcon({ className = "w-7 h-7", style }: { className?: string, style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor" className={className} style={style}>
      <path d="M 48,10 C 48,32 30,50 8,50 C 30,50 48,68 48,90 C 48,68 66,50 88,50 C 66,50 48,32 48,10 Z" />
      <path d="M 80,8 C 80,18 70,28 60,28 C 70,28 80,38 80,48 C 80,38 90,28 100,28 C 90,28 80,18 80,8 Z" />
    </svg>
  )
}

function Z7RobotIcon({ className = 'w-9 h-9' }: { className?: string }) {
  const [failed, setFailed] = useState(false)
  if (!failed) return <img src="/codenet-v2/z7-robo.png" alt="" draggable={false} className={`${className} mix-blend-screen object-contain`} onError={() => setFailed(true)} />
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path d="M32 15V9" stroke="white" strokeWidth="3" />
      <circle cx="32" cy="6" r="4" fill="white" />
      <rect x="10" y="16" width="44" height="39" rx="12" fill="white" />
      <rect x="4" y="29" width="5" height="14" rx="2.5" fill="white" />
      <rect x="55" y="29" width="5" height="14" rx="2.5" fill="white" />
      <text x="32" y="28" textAnchor="middle" fontSize="10" fontWeight="900" fontFamily="Arial, sans-serif" fill="#17132e">Z7</text>
      <circle cx="23" cy="37" r="5" fill="#17132e" />
      <circle cx="41" cy="37" r="5" fill="#17132e" />
      <path d="M25 47Q32 52 39 47" stroke="#17132e" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function ZsevenAiIcon({ className = 'w-8 h-8' }: { className?: string }) {
  const [failed, setFailed] = useState(false)
  return failed
    ? <AssistantIcon className={className} />
    : <img src="/codenet-v2/ia-zseven.png" alt="" draggable={false} style={{ filter: 'brightness(0) saturate(100%) invert(69%) sepia(46%) saturate(1500%) hue-rotate(213deg) brightness(100%) contrast(96%)' }} className={`${className} mix-blend-screen object-contain`} onError={() => setFailed(true)} />
}

function DraggableAiFab({ onOpen, label }: { onOpen: () => void; label: string }) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const snapFrameRef = useRef<number | null>(null)
  const cancelPendingSnap = () => {
    if (snapFrameRef.current !== null) cancelAnimationFrame(snapFrameRef.current)
    snapFrameRef.current = null
  }
  const scheduleSnap = () => {
    cancelPendingSnap()
    snapFrameRef.current = requestAnimationFrame(() => {
      snapFrameRef.current = requestAnimationFrame(() => {
        snapFrameRef.current = null
        setPosition(prev => prev ? snapToEdge(prev.x, prev.y) : prev)
      })
    })
  }
  const dragRef = useRef<{ id: number; startX: number; startY: number; x: number; y: number; moved: boolean } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const hasUserMovedRef = useRef(false)
  const suppressClickRef = useRef(false)
  const clamp = (x: number, y: number) => ({
    x: Math.max(0, Math.min(x, Math.max(0, window.innerWidth - 56))),
    y: Math.max(0, Math.min(y, Math.max(0, window.innerHeight - 56)))
  })

  const snapToEdge = (x: number, y: number) => clamp(
    x + 28 < window.innerWidth / 2 ? 12 : window.innerWidth - 68,
    y
  )

  useEffect(() => {
    try {
      const saved = safeJsonParse(sessionStorage.getItem('codenet_ai_fab_position_v1') || 'null', null)
      if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) { hasUserMovedRef.current = true; setPosition(snapToEdge(saved.x, saved.y)) }
    } catch { /* Keep the default when browser storage is unavailable. */ }
    const resize = () => {
      cancelPendingSnap()
      setDragging(false)
      dragRef.current = null
      setPosition(prev => hasUserMovedRef.current && prev ? snapToEdge(prev.x, prev.y) : snapToEdge(window.innerWidth - 68, Math.round(window.innerHeight * 0.45)))
    }
    resize()
    window.addEventListener('resize', resize)
    return () => { cancelPendingSnap(); window.removeEventListener('resize', resize) }
  }, [])

  useEffect(() => {
    if (!position || !hasUserMovedRef.current || dragRef.current) return
    try { sessionStorage.setItem('codenet_ai_fab_position_v1', JSON.stringify(position)) } catch { /* Position still persists while mounted. */ }
  }, [position])
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={label}
      title={label}
      className={`md:hidden fixed z-20 size-14 rounded-full overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-violet-400 `}
      style={{ ...(position ? { left: position.x, top: position.y } : { right: 12, top: '45%', visibility: 'hidden' as const }), transition: dragging ? 'none' : 'left 850ms cubic-bezier(0.25, 0.8, 0.25, 1), top 850ms cubic-bezier(0.25, 0.8, 0.25, 1), transform 300ms ease' }}
      onPointerDown={e => {
        if (!e.isPrimary || e.button !== 0 || dragRef.current) return
        cancelPendingSnap()
        setDragging(true)
        const rect = e.currentTarget.getBoundingClientRect()
        suppressClickRef.current = false
        dragRef.current = { id: e.pointerId, startX: e.clientX, startY: e.clientY, x: rect.left, y: rect.top, moved: false }
        // Freeze any in-flight snap at its rendered position and re-render without a transition.
        setPosition({ x: rect.left, y: rect.top })
        e.currentTarget.setPointerCapture(e.pointerId)
      }}
      onPointerMove={e => {
        const drag = dragRef.current
        if (!drag || drag.id !== e.pointerId) return
        const dx = e.clientX - drag.startX
        const dy = e.clientY - drag.startY
        if (Math.hypot(dx, dy) >= 6) { drag.moved = true; hasUserMovedRef.current = true }
        if (drag.moved) setPosition(clamp(drag.x + dx, drag.y + dy))
      }}
      onPointerUp={e => {
        const drag = dragRef.current
        if (!drag || drag.id !== e.pointerId) return
        const dx = e.clientX - drag.startX
        const dy = e.clientY - drag.startY
        const moved = drag.moved || Math.hypot(dx, dy) >= 6
        if (moved) hasUserMovedRef.current = true
        dragRef.current = null
        suppressClickRef.current = true
        if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
        setDragging(false)
        scheduleSnap()
        if (!moved) onOpen()
      }}
      onPointerCancel={() => {
        dragRef.current = null
        suppressClickRef.current = true
        setDragging(false)
        scheduleSnap()
      }}
      onLostPointerCapture={() => {
        if (!dragRef.current) return
        dragRef.current = null
        suppressClickRef.current = true
        setPosition(prev => prev ? snapToEdge(prev.x, prev.y) : prev)
      }}
      onClick={e => {
        // Pointer taps are handled above. Preserve keyboard/screen reader activation.
        if (e.detail === 0 || !suppressClickRef.current) onOpen()
        suppressClickRef.current = false
      }}
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full animate-spin" style={{ background: 'conic-gradient(from 0deg, transparent 0%, #8b5cf6 30%, #38bdf8 55%, #ec4899 75%, transparent 100%)', animationDuration: '4s' }} />
      <span className="pointer-events-none absolute inset-[2px] flex items-center justify-center rounded-full bg-[#100c24]">
        <AssistantIcon className="size-8 text-violet-200 drop-shadow-[0_0_8px_#38bdf8]" />
      </span>
    </button>
  )
}

interface AiChatMessage {
  id: string
  sender: 'user' | 'ai'
  text: string
  time: string
  actionBadge?: string
}


type Stage = 'idle' | 'uploading' | 'success'
type SidebarMenu = 'internet' | 'local' | 'diagnostics' | 'overview' | 'automations' | 'equipments' | 'users' | 'security' | 'monitoring' | 'auditing' | 'alerts' | 'reports' | 'settings' | 'premium' | 'firmware_catalog' | 'optical_test' | 'report_center' | 'bench_guide' | 'bench_defaults' | 'manual_config'
const USER_ALLOWED_MENUS: readonly SidebarMenu[] = ['internet', 'local', 'diagnostics', 'firmware_catalog', 'optical_test', 'report_center', 'bench_guide', 'bench_defaults', 'manual_config', 'settings', 'premium']
const ADMIN_ONLY_MENUS: readonly SidebarMenu[] = ['overview', 'automations', 'equipments', 'users', 'security', 'monitoring', 'auditing', 'alerts', 'reports']

function requestsAdminScreen(text: string) {
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  return /\b(abrir|abra|abre|acessar|acesse|acessa|ir|va|ver|mostrar|mostre|open|show|navigate|go|access)\b/.test(normalized) && /\b(alertas?|visao geral|monitoramento|usuarios|seguranca|auditoria|automacoes|equipamentos|alerts?|overview|monitoring|users|security|auditing|audit|automations|equipments)\b/.test(normalized)
}

function resolveSmartChatIntent(text: string, userRole: 'user' | 'admin' | null, lang: Language): SidebarMenu | null {
  const input = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  // Only explicit navigation: questions and configuration commands still go to RAG.
  if (/\b(nao|not|don't|never)\b/.test(input)) return null
  if (/\b(como|qual|quais|por que|how|what|why)\b/.test(input)) return null
  if (!/\b(abrir|abra|abre|ver|veja|acessar|acesse|acessa|mostrar|mostre|ir|va|open|show|view|access|navigate|go)\b/.test(input)) return null
  const userRoutes: [SidebarMenu, RegExp][] = [
    ['firmware_catalog', /catalogo|catalog|firmwares?|arquivos? bin|bin files?/],
    ['optical_test', /teste rapido|teste optico|medir sinal|optical test|quick test/],
    ['report_center', /central de relatorios|relatorios|historico de lotes|exportar sn|reports?|batch history|export serial/],
    ['bench_guide', /guia de bancada|16 regras|manual de bancada|ajuda de erros|bench guide|16 rules|error help/],
    ['bench_defaults', /padroes da bancada|valores padrao|bench defaults|default values/],
    ['manual_config', /configuracao manual|modo manual|192\.168\.1\.1|manual configuration|manual mode/],
    ['internet', /bot de automacao|automation bot|configurador de onu|painel|fila|onu configurator|dashboard|queue/],
    ['local', /rede local|wi-?fi|ssid|local network/],
    ['diagnostics', /gerencia|diagnostico|tr-?069|diagnostics|management/],
    ['settings', /configuracoes|settings/], ['premium', /premium/]
  ]
  const adminRoutes: [SidebarMenu, RegExp][] = [
    ['alerts', /alertas?|alerts?/], ['users', /usuarios|permissoes|users|permissions/],
    ['security', /seguranca|security/], ['monitoring', /monitoramento|monitoring|operacoes|operations/],
    ['auditing', /auditoria|logs|audit/], ['automations', /automacoes|automations/],
    ['equipments', /equipamentos|equipment|devices/], ['reports', /relatorios|reports/],
    ['diagnostics', /gerencia|diagnostico|tr-?069|diagnostics|management/],
    ['overview', /visao geral|metricas|overview|metrics|contratos|contracts|painel|dashboard/],
    ['settings', /configuracoes|settings/]
  ]
  const routes = userRole === 'user' ? userRoutes : userRole === 'admin' ? adminRoutes : []
  // Both language dictionaries are accepted regardless of the panel language.
  void lang
  return routes.find(([, pattern]) => pattern.test(input))?.[0] ?? null
}

const CHAT_SUGGESTIONS = {
  user: [
    ['Abrir Catálogo de Firmwares', 'Open Firmware Catalog'],
    ['Abrir Teste Rápido Óptico', 'Open Quick Optical Test'],
    ['Qual a diferença entre a F6600P branca e preta?', 'What is the difference between the white and black F6600P?'],
    ['Como funciona o cálculo do Padrão CTO?', 'How does the CTO baseline calculation work?'],
    ['Abrir Configuração Manual da ONU', 'Open Manual Configuration of the ONU'],
    ['Ver Central de Relatórios e exportar SNs', 'View Report Center and export serials'],
    ['Abrir Guia de Bancada (16 Regras)', 'Open Bench Guide (16 Rules)'],
    ['Como funciona o PLANO PREMIUM?', 'How does the PREMIUM PLAN work?']
  ],
  admin: [
    ['Analisar Setores e Permissões', 'Analyze Departments and Permissions'],
    ['Detectar Invasores e Alertas Operacionais', 'Detect Intruders and Operational Alerts'],
    ['Abrir Visão Geral e Métricas de Rede', 'Open Overview and Network Metrics'],
    ['Monitorar Operações em Andamento', 'Monitor Ongoing Operations'],
    ['Ver Status Geral de Contratos', 'View Overall Contract Status'],
    ['Abrir Painel de Alertas Operacionais', 'Open Operational Alerts Panel'],
    ['Resumo de automações e falhas do dia', 'Summary of today’s automations and failures'],
    ['Auditar Segurança e Hash SHA-256', 'Audit Security and SHA-256 Hash']
  ]
} as const

const ChatComposerForm = memo(function ChatComposerForm({ onSend, disabled, locked, lang, placeholder, sendLabel }: { onSend: (text: string) => void; disabled: boolean; locked: boolean; lang: Language; placeholder: string; sendLabel: string }) {
  const [draftText, setDraftText] = useState('')
  return <form onSubmit={event => { event.preventDefault(); const text = draftText.trim(); if (disabled || !text) return; onSend(text); setDraftText('') }} className="relative flex items-center">
    <input type="text" disabled={disabled} placeholder={locked ? (lang === 'pt' ? 'Chat bloqueado durante a automação da ONU...' : 'Chat locked during ONU automation...') : placeholder} aria-label={placeholder} value={draftText} onChange={event => setDraftText(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && event.nativeEvent.isComposing) event.preventDefault() }} maxLength={2000} className="w-full h-12 bg-card border border-border rounded-2xl pl-4 pr-12 text-base sm:text-xs outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all text-foreground shadow-inner disabled:cursor-not-allowed" />
    <div className="absolute right-2 flex items-center gap-1"><button type="submit" disabled={disabled || !draftText.trim()} aria-label={sendLabel} title={sendLabel} className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl p-2 disabled:cursor-not-allowed"><ArrowUp size={16} /></button></div>
  </form>
})

const mobileShowcaseCard = 'rounded-3xl border border-border bg-card/80 p-5 space-y-4 min-w-0'
function MobileAiExplainer({ lang, executive = false }: { lang: Language; executive?: boolean }) {
  const [tab, setTab] = useState(0)
  const id = useId()
  const l = (pt: string, en: string) => lang === 'pt' ? pt : en
  const titles = executive ? [l('Auditar segurança', 'Audit security'), l('Analisar contratos', 'Analyze contracts'), l('Monitorar operações', 'Monitor operations')] : [l('1. Intenção Inteligente', '1. Smart Intent'), l('2. Estrelinha Pensando (Análise)', '2. Thinking Star (Analysis)'), l('3. Resposta & Proteção', '3. Response & Protection')]
  const descriptions = executive ? [l('A IA ajuda a interpretar eventos e verificações SHA-256 disponíveis. A autorização deve ser validada pelo servidor; uma explicação não aplica bloqueios.', 'AI helps interpret available events and SHA-256 checks. Authorization belongs on the server; explanations do not apply blocks.'), l('Com o contrato fornecido à base de conhecimento, a IA pode ajudar a comparar cláusulas e SLAs do provedor. Esta demonstração não acessa contratos privados.', 'With contracts supplied to the knowledge base, AI can help compare ISP clauses and SLAs. This demonstration does not access private contracts.'), l('Os eventos recebidos da bancada contextualizam as respostas. Durante uma automação, o envio ao chat fica bloqueado e volta ao concluir ou cancelar.', 'Received bench events provide context. Chat submission locks during automation and unlocks after completion or cancellation.')] : [l('Comandos explícitos, como “abrir relatórios”, direcionam a tela respeitando o perfil. Perguntas seguem diretamente para a API do Gemini.', 'Explicit commands such as “open reports” navigate within role permissions. Questions go directly to the Gemini API.'), l('A estrela representa a análise da pergunta com os dados disponibilizados pela sessão e pela base RAG. Este cartão explica o fluxo; não envia uma consulta.', 'The star represents question analysis with available session and RAG data. This card explains the flow; it sends no query.'), l('A resposta orienta o operador. Credenciais sensíveis não devem ser expostas; ações passam pelas validações do sistema. O chat requer conexão e fica bloqueado durante a automação.', 'Responses guide operators. Sensitive credentials must not be exposed; actions pass system validation. Chat requires connectivity and locks during automation.')]
  return <article className={mobileShowcaseCard}><h3 className="font-bold flex items-center gap-3"><AssistantIcon className="w-8 h-8 shrink-0 text-violet-400 mobile-ai-shimmer drop-shadow-[0_0_12px_rgba(167,139,250,0.95)] motion-safe:animate-pulse" />{executive ? l('Zseven IA Executiva', 'Executive Zseven AI') : l('Como Funciona a Zseven IA', 'How Zseven AI Works')}<ZsevenSparkIcon /></h3><div role="tablist" aria-label={l('Etapas da IA', 'AI stages')} className="grid grid-cols-1 gap-2">{titles.map((title, index) => <button type="button" role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel`} aria-selected={tab === index} key={title} onClick={() => setTab(index)} className={`min-h-11 rounded-xl border px-3 py-2 text-sm text-left ${tab === index ? 'border-violet-500 bg-violet-500/10' : 'border-border'}`}>{title}</button>)}</div><p id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${tab}`} className="text-sm text-muted-foreground leading-relaxed">{descriptions[tab]}</p><style>{`@keyframes mobile-star-shimmer { 0%,100% { filter:brightness(1); opacity:.8 } 50% { filter:brightness(1.9); opacity:1 } } .mobile-ai-shimmer path { animation:mobile-star-shimmer 2.6s ease-in-out infinite } .mobile-ai-shimmer path:nth-child(2) { animation-delay:.7s } @media(prefers-reduced-motion:reduce) { .mobile-ai-shimmer path { animation:none } }`}</style></article>
}
function MobileBotShowcase({ lang }: { lang: Language }) {
  const l = (pt: string, en: string) => lang === 'pt' ? pt : en
  const [stage, setStage] = useState(0), [playing, setPlaying] = useState(false)
  const [cto, setCto] = useState('-20.00'), [power, setPower] = useState('-20.20')
  const [model, setModel] = useState<BatchModel>('ZTE F6201B')
  useEffect(() => {
    if (!playing) return
    const stopOnDesktop = () => { if (window.innerWidth >= 768) setPlaying(false) }
    window.addEventListener('resize', stopOnDesktop)
    const timer = setTimeout(() => { if (window.innerWidth >= 768) { setPlaying(false); return }; setStage(value => value + 1); if (stage >= 5) setPlaying(false) }, 1200)
    return () => { clearTimeout(timer); window.removeEventListener('resize', stopOnDesktop) }
  }, [playing, stage])
  const steps = [l('Login Inicial', 'Initial Login'), l('Leitura Óptica & Prints', 'Optical Reading & Screenshots'), l('Flash Firmware .bin', 'Flash Firmware .bin'), l('Backup DNS .bin', 'DNS Backup .bin'), l('Senha Admin', 'Admin Password'), l('Wi-Fi Dual-Band 2.4G/5G', 'Dual-Band Wi-Fi 2.4G/5G')]
  const details = [l('Acessa 192.168.1.1 pela LAN usando os acessos definidos na bancada.', 'Accesses 192.168.1.1 over LAN using bench credentials.'), l('Lê SN e potência, aplica a regra CTO e registra 01_POTENCIA_PON.png e 02_SN_ONU.png. Sem fibra exige Modo Bancada autorizado.', 'Reads serial and power, applies CTO rules and records both screenshots. No fiber requires authorized Bench Mode.'), l('Envia o firmware homologado e aguarda reinicialização. A variante preta dispensa esta etapa.', 'Uploads approved firmware and waits for reboot. The black variant skips this stage.'), l('Restaura o backup DNS do modelo e aguarda o retorno da interface.', 'Restores the model DNS backup and waits for the interface to return.'), l('Valida o acesso administrativo sem registrar senhas no terminal.', 'Validates administrative access without logging passwords.'), l('Configura os SSIDs das duas bandas e verifica a confirmação no painel antes do relatório.', 'Configures both SSIDs and checks panel confirmation before reporting.')]
  const baseline = Number(cto.replace(',', '.')), measured = Number(power.replace(',', '.'))
  const valid = cto.trim() !== '' && power.trim() !== '' && Number.isFinite(baseline) && Number.isFinite(measured) && baseline >= -40 && baseline <= 0
  const result = valid ? testZteOptical(measured, baseline) : null
  const opticalLabel = result ? (lang === 'pt' ? result.optical : result.optical === 'APROVADA' ? 'PASSED' : result.optical === 'APROVADA COM AVISO' ? 'PASSED WITH WARNING' : 'SIGNAL REJECTED') : l('Informe valores válidos.', 'Enter valid values.')
  const files = batchModelFiles(model)
  return <section className="md:hidden space-y-5" aria-label={l('Demonstração mobile do BOT', 'Mobile BOT showcase')}>
    <div><p className="text-xs font-mono text-violet-400">CODE NET · MOBILE LAB</p><h2 className="text-2xl font-bold mt-2">{l('Arquitetura & Operação do BOT', 'BOT Architecture & Operations')}</h2><p className="text-sm text-muted-foreground mt-2">{l('Fluxo técnico das 6 etapas, cálculo óptico e inteligência Zseven IA.', 'Technical six-stage flow, optical calculations and Zseven AI intelligence.')}</p></div>
    <article className={mobileShowcaseCard}><h3 className="font-bold">{l('Arquitetura em movimento', 'Architecture in motion')}</h3><div className="space-y-2">{['Notebook Code Net', 'WebSocket :8765', 'Motor Playwright', 'ONU ZTE 192.168.1.1'].map((label, i) => <div key={label}><div className="rounded-xl border border-violet-500/30 p-3 text-sm flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-violet-400 motion-safe:animate-pulse" style={{ animationDelay: `${i * 250}ms` }} />{label}</div>{i < 3 && <div aria-hidden className="h-5 w-px mx-auto bg-violet-500/30 relative overflow-hidden"><span className="absolute inset-x-0 h-2 bg-cyan-400 animate-[mobile-flow_1.2s_linear_infinite] motion-reduce:animate-none" /></div>}</div>)}</div><div className="space-y-2">{steps.map((step, i) => <details key={step} className="rounded-xl border border-border p-3"><summary className="min-h-8 cursor-pointer font-semibold text-sm">{i + 1}/6 {step}</summary><p className="text-sm text-muted-foreground mt-3">{details[i]}</p></details>)}</div></article>
    <article className={mobileShowcaseCard}><h3 className="font-bold">{l('Simulador visual · sem conexão com ONU', 'Visual simulator · no ONU connection')}</h3><button type="button" disabled={playing} onClick={() => { setStage(0); setPlaying(true) }} className="w-full rounded-xl bg-violet-600 text-white p-3 font-semibold disabled:opacity-45">{l('▶ Simular Demonstração Visual das 6 Etapas', '▶ Simulate the 6-stage visual demonstration')}</button>{playing && <button type="button" onClick={() => setPlaying(false)} className="rounded-xl border border-border p-3">{l('Parar demonstração', 'Stop demonstration')}</button>}<div role="progressbar" aria-label={l('Progresso da demonstração', 'Demo progress')} aria-valuenow={Math.round(stage / 6 * 100)} aria-valuemin={0} aria-valuemax={100} className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-violet-500 transition-[width] duration-500" style={{ width: `${stage / 6 * 100}%` }} /></div><ol className="space-y-2">{steps.map((step, i) => <li key={step} className={`text-sm rounded-xl p-3 ${stage > i ? 'bg-emerald-500/10' : 'bg-background/50'}`}>{stage > i ? '✓' : `${i + 1}/6`} {step}</li>)}</ol><div role="status" className="text-sm">{stage >= 2 && <p>{l('Exemplo: SN ZTEG12345678 · −20,20 dBm · APROVADA · capturas simuladas.', 'Example: SN ZTEG12345678 · −20.20 dBm · PASSED · simulated screenshots.')}</p>}{stage >= 3 && <p>Firmware: 100% {l('(simulado)', '(simulated)')}</p>}{stage >= 4 && <p>Backup: 100% {l('(simulado)', '(simulated)')}</p>}{stage === 6 && <p className="font-bold mt-2 text-emerald-500">✓ 100% · {l('Demonstração concluída', 'Demonstration complete')}</p>}</div></article>
    <article className={mobileShowcaseCard}><h3 className="font-bold">{l('Calculadora Óptica CTO', 'CTO Optical Calculator')}</h3><div className="grid grid-cols-2 gap-3">{[[l('Padrão CTO (dBm)', 'CTO baseline (dBm)'), cto, setCto], [l('Potência (dBm)', 'Power (dBm)'), power, setPower]].map(([label, value, setter]) => <label key={String(label)} className="text-xs space-y-2"><span>{String(label)}</span><input inputMode="decimal" value={String(value)} onChange={e => (setter as (v: string) => void)(e.target.value)} className="w-full rounded-xl border border-border bg-background p-3 text-base" /></label>)}</div><p className="text-xs text-muted-foreground">{l('Mínimo = CTO − 0,50 dBm. Valores digitados; não é medição da ONU.', 'Minimum = CTO − 0.50 dBm. Entered values, not an ONU measurement.')}</p><p role="status" className={`rounded-xl border p-3 text-sm font-bold ${result?.passed ? 'border-emerald-500/40' : 'border-rose-500/40'}`}>{opticalLabel}</p><h4 className="font-semibold">{l('Referência rápida por modelo', 'Quick model reference')}</h4><div className="grid grid-cols-2 gap-2">{batchModels.map(item => <button type="button" key={item} aria-pressed={model === item} onClick={() => setModel(item)} className={`rounded-xl border p-3 text-xs min-h-12 ${model === item ? 'border-violet-500 bg-violet-500/10' : 'border-border'}`}>{item}</button>)}</div><p className="text-xs break-all leading-relaxed">Firmware: {files.firmware || l('Dispensado', 'Waived')}<br />Backup: {files.backup}<br />{files.version}</p></article>
    <MobileAiExplainer lang={lang} /><style>{`@keyframes mobile-flow { from { transform:translateY(-10px) } to { transform:translateY(28px) } }`}</style>
  </section>
}
function MobileAdminPocketNoc({ lang, data }: { lang: Language; data: ReturnType<typeof useAdminData> }) {
  const l = (pt: string, en: string) => lang === 'pt' ? pt : en
  const [sector, setSector] = useState(0), [metric, setMetric] = useState<'CPU' | 'PON' | 'LAN'>('CPU')
  const sectors = ['Técnicos', 'NOC', 'Suporte', 'Almoxarifado', 'Engenharia']
  const modules = ['Configurador ZTE', 'Monitoramento', 'Diagnósticos', 'Estoque de ONUs', 'Firmware & Segurança']
  const attempts = data.batches.flatMap(batch => batch.attempts)
  const measured = attempts.filter(a => a.power !== null && a.optical !== 'PENDENTE')
  const passed = measured.filter(a => a.optical === 'APROVADA' || a.optical === 'APROVADA COM AVISO').length
  const sla = measured.length ? passed / measured.length * 100 : 96
  return <section className="md:hidden space-y-4 mb-6" aria-label="Pocket NOC Executivo"><div><p className="text-xs text-violet-400 font-mono">POCKET NOC</p><h2 className="text-2xl font-bold">{l('Painel Operacional Executivo', 'Executive Operations Panel')}</h2><p className="text-xs text-muted-foreground mt-2">{l('Telemetria em tempo real, setores ativos e segurança da frota ZTE.', 'Real-time telemetry, active sectors and ZTE fleet security.')}</p></div>
    <article className={mobileShowcaseCard}><h3 className="font-bold">SLA & Fleet Radar</h3><AnimatedDepthChart kind="dual-line" label={l('SLA / throughput ilustrativos', 'Illustrative SLA / throughput')} values={[sla, 100 - sla]} /><p className="text-sm">{sla.toFixed(1)}% SLA · {measured.length ? l('histórico local (inclui simulações)', 'local history (includes simulations)') : l('referência demonstrativa', 'demo reference')}</p><p className="text-lg font-bold">94.4% Online <span className="text-xs font-normal text-muted-foreground">{l('(exemplo)', '(example)')}</span></p><div className="grid grid-cols-2 gap-2">{batchModels.map(model => <div key={model} className="rounded-xl bg-background/50 p-3 text-xs">{model}<strong className="block text-xl mt-1">{attempts.filter(a => a.model === model).length}</strong>{l('tentativas locais', 'local attempts')}</div>)}</div></article>
    <article className={mobileShowcaseCard}><h3 className="font-bold">{l('Setores · demonstração interativa', 'Sectors · interactive demo')}</h3><div className="flex flex-wrap gap-2">{sectors.map((name, i) => <button type="button" key={name} aria-pressed={sector === i} onClick={() => setSector(i)} className={`rounded-full border px-3 py-3 text-xs ${sector === i ? 'border-violet-500 bg-violet-500/10' : 'border-border'}`}>{name}</button>)}</div><div role="status" className="rounded-xl bg-background/50 p-4 space-y-2 text-sm"><p>{modules[sector]}</p><p>IP: 192.0.2.{10 + sector}</p><p>{l('ONUs configuradas (exemplo)', 'Configured ONUs (example)')}: {[12, 8, 5, 21, 9][sector]}</p></div></article>
    <article className={mobileShowcaseCard}><h3 className="font-bold flex items-center gap-2"><ShieldCheck size={20} />{l('Escudo de segurança', 'Security shield')}</h3><div className="rounded-xl border border-violet-500/30 p-4 space-y-3"><p className="motion-safe:animate-pulse text-sm">PBKDF2-HMAC-SHA256 → SHA-256</p><p className="text-sm">210.000 {l('iterações', 'iterations')}</p></div><details className="text-sm"><summary className="cursor-pointer py-2">{l('Verificações e bloqueios', 'Checks and blocks')}</summary><p className="mt-2 text-muted-foreground">{l('Firmware: aguardando arquivo para verificar SHA-256 na tela Segurança. Demonstração de bloqueio: 192.0.2.14 · tentativa inválida. Não representa bloqueio aplicado nem autenticação validada pelo servidor.', 'Firmware: awaiting a file for SHA-256 verification on Security. Block example: 192.0.2.14 · invalid attempt. This is not an applied block or server-validated authentication.')}</p></details></article>
    <article className={mobileShowcaseCard}><h3 className="font-bold">ZX279128 · Chipset & PON</h3><p className="text-xs text-muted-foreground">{l('Telemetria ilustrativa · sem leitura física', 'Illustrative telemetry · no physical reading')}</p><div className="flex gap-2">{(['CPU', 'PON', 'LAN'] as const).map(name => <button type="button" key={name} aria-pressed={metric === name} onClick={() => setMetric(name)} className={`flex-1 rounded-xl border py-3 text-xs ${metric === name ? 'border-violet-500 bg-violet-500/10' : 'border-border'}`}>{name}</button>)}</div><svg viewBox="0 0 240 60" role="img" aria-label={l('Curva ilustrativa', 'Illustrative sparkline')} className="w-full h-16 text-violet-400"><polyline points={metric === 'CPU' ? '0,45 30,30 60,38 90,18 120,25 150,15 180,32 210,20 240,28' : metric === 'PON' ? '0,30 30,28 60,32 90,29 120,31 150,28 180,30 210,29 240,30' : '0,45 30,40 60,10 90,35 120,40 150,25 180,35 210,15 240,30'} fill="none" stroke="currentColor" strokeWidth="3" /></svg><p role="status" className="font-mono text-sm">{metric === 'CPU' ? 'CPU 34% · 48°C' : metric === 'PON' ? 'Rx −19.50 dBm · Tx +2.30 dBm' : 'WebSocket 18 ms · LAN 1 Gbps'}</p></article>
    <MobileAiExplainer lang={lang} executive />
  </section>
}

function MobileDualLineChart({ label }: { label: string }) {
  const id = useId().replace(/:/g, '')
  const host = useRef<HTMLDivElement>(null)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let visible = false, timer: ReturnType<typeof setInterval> | undefined
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => { clearInterval(timer); timer = undefined; if (visible && window.innerWidth < 768 && !document.hidden && !motion.matches) timer = setInterval(() => setTick(t => t + 1), 900) }
    const observer = new IntersectionObserver(entries => { visible = entries.some(e => e.isIntersecting); sync() })
    if (host.current) observer.observe(host.current)
    window.addEventListener('resize', sync); document.addEventListener('visibilitychange', sync); motion.addEventListener('change', sync)
    return () => { observer.disconnect(); clearInterval(timer); window.removeEventListener('resize', sync); document.removeEventListener('visibilitychange', sync); motion.removeEventListener('change', sync) }
  }, [])
  const points = (phase: number, band: number) => Array.from({ length: 9 }, (_, i) => [24 + i * 31, 35 + band * 35 + Math.sin(i * .9 + phase * .5 + band) * 14])
  return <div ref={host} className="min-w-0"><svg viewBox="0 0 300 160" role="img" aria-label={label} className="w-full h-auto overflow-visible"><defs>{['#10b981', '#38bdf8'].map((color, i) => <linearGradient key={color} id={`${id}-area-${i}`} x1="0" y1="0" x2="0" y2="1"><stop stopColor={color} stopOpacity=".35" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient>)}<filter id={`${id}-glow`}><feGaussianBlur stdDeviation="2" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs><path d="M24 126 L272 126 L288 143 L40 143Z" fill="currentColor" opacity=".08" />{Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${24 + i * 31} 18V126l16 17`} stroke="currentColor" opacity=".12" />)}{[30, 60, 90, 126].map(y => <path key={y} d={`M24 ${y}H272`} stroke="currentColor" opacity=".12" />)}<path d="M24 18V126H272" fill="none" stroke="currentColor" opacity=".45" />{['#10b981', '#38bdf8'].map((color, band) => { const next = points(tick, band), previous = points(Math.max(0, tick - 1), band), value = (p: number[][]) => p.map(v => v.join(',')).join(' '); return <g key={color}><polygon points={`24,126 ${value(next)} 272,126`} fill={`url(#${id}-area-${band})`} /><polyline points={value(next)} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round"><animate key={tick} attributeName="points" from={value(previous)} to={value(next)} dur=".9s" fill="freeze" /></polyline>{next.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill={color} filter={`url(#${id}-glow)`}><animate key={tick} attributeName="cy" from={previous[i][1]} to={y} dur=".9s" fill="freeze" /></circle>)}</g>})}<text x="24" y="155" fill="currentColor" fontSize="8">0</text><text x="230" y="155" fill="currentColor" fontSize="8">900 ms</text></svg><p className="text-[10px] text-muted-foreground">● SLA / Online · ● Throughput · {label}</p></div>
}
function MobileCopy({ label, value, secret = false, lang }: { label: string; value: string; secret?: boolean; lang: Language }) {
  const [status, setStatus] = useState('')
  useEffect(() => setStatus(''), [value])
  return <div className="rounded-xl border border-border p-3 min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="font-mono text-sm break-all mt-2">{secret ? '••••••••' : value || '—'}</p><button type="button" disabled={!value} onClick={async () => { try { await navigator.clipboard.writeText(value); setStatus(lang === 'pt' ? 'Copiado' : 'Copied') } catch { setStatus(lang === 'pt' ? 'Não foi possível copiar' : 'Unable to copy') } }} className="mt-2 rounded-lg border border-border px-3 py-2 text-xs disabled:opacity-40">{lang === 'pt' ? 'Copiar' : 'Copy'} {label}</button><p role="status" className="text-xs mt-1">{status}</p></div>
}
function MobileModelCards({ lang, filter = '' }: { lang: Language; filter?: string }) {
  const l = (pt: string, en: string) => lang === 'pt' ? pt : en
  return <div className="space-y-3">{batchModels.filter(m => m.toLowerCase().includes(filter.toLowerCase())).map(model => { const f = batchModelFiles(model); return <details key={model} className={mobileShowcaseCard}><summary className="cursor-pointer font-bold py-2">{model}</summary><dl className="text-xs space-y-3 break-all"><div><dt>Firmware</dt><dd>{f.firmware || l('Dispensado automaticamente', 'Automatically waived')}</dd></div><div><dt>Backup</dt><dd>{f.backup}</dd></div><div><dt>{l('Versão homologada', 'Approved version')}</dt><dd>{f.version}</dd></div><div><dt>Hardware</dt><dd>{l('Modelo/variante conforme etiqueta da ONU. CPU, RAM e portas devem ser conferidos na ficha da revisão; especificações não cadastradas.', 'Model/variant follows the ONU label. Check revision documentation for CPU, RAM and ports; specifications are not registered.')}</dd></div></dl></details>})}</div>
}
function MobileOpticalAnalyzer({ lang }: { lang: Language }) {
  const [cto, setCto] = useState('-20.00'), [power, setPower] = useState('-20.20')
  const c = Number(cto.replace(',', '.')), p = Number(power.replace(',', '.'))
  const valid = cto.trim() && power.trim() && Number.isFinite(c) && Number.isFinite(p) && c >= -40 && c <= 0 && p >= -40 && p <= 10
  const result = valid ? testZteOptical(p, c) : null
  const color = !result ? '#64748b' : !result.passed ? '#ef4444' : result.optical === 'APROVADA COM AVISO' ? '#eab308' : '#10b981'
  return <article className={mobileShowcaseCard}><h2 className="font-bold">{lang === 'pt' ? 'Analisador de Espectro Óptico' : 'Optical Spectrum Analyzer'}</h2><div className="grid grid-cols-2 gap-3"><label className="text-xs">CTO (dBm)<input inputMode="decimal" value={cto} onChange={e => setCto(e.target.value)} className="w-full mt-2 rounded-xl border border-border bg-background p-3 text-base" /></label><label className="text-xs">Rx (dBm)<input inputMode="decimal" value={power} onChange={e => setPower(e.target.value)} className="w-full mt-2 rounded-xl border border-border bg-background p-3 text-base" /></label></div><div className="h-6 rounded-full bg-muted overflow-hidden"><div className="h-full transition-all duration-500" style={{ width: valid ? `${Math.max(0, Math.min(100, (p + 40) * 2))}%` : '0%', background: color }} /></div><p role="status" className="font-bold text-sm" style={{ color }}>{result ? lang === 'pt' ? result.optical : !result.passed ? 'SIGNAL REJECTED' : result.optical === 'APROVADA COM AVISO' ? 'PASSED WITH WARNING' : 'PASSED' : lang === 'pt' ? 'Informe valores válidos.' : 'Enter valid values.'}</p><p className="text-xs text-muted-foreground">{lang === 'pt' ? 'Verde: CTO − 0,50 até CTO · Amarelo: acima do CTO · Vermelho: abaixo do mínimo. Cálculo a partir dos valores digitados.' : 'Green: CTO − 0.50 through CTO · Yellow: above CTO · Red: below minimum. Calculated from entered values.'}</p></article>
}
function MobileReportCards({ batches, lang }: { batches: ConfigBatch[]; lang: Language }) {
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [pdf, setPdf] = useState<string | null>(null)
  const mounted = useRef(true), busyRef = useRef(false)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  useEffect(() => { if (!pdf) return; const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setPdf(null) }; document.addEventListener('keydown', onKey); return () => { URL.revokeObjectURL(pdf); document.removeEventListener('keydown', onKey) } }, [pdf])
  async function report(batch: ConfigBatch, download: boolean) {
    if (busyRef.current) return; busyRef.current = true; setBusy(true); setMessage('')
    try { const blob = await createBatchPdf(batch); if (!mounted.current) return; const url = URL.createObjectURL(blob); if (download) { const link = document.createElement('a'); link.href = url; link.download = safePdfFileName(batch.pdfFileName); document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000) } else setPdf(url) } catch { if (mounted.current) setMessage(lang === 'pt' ? 'Não foi possível gerar o relatório.' : 'Unable to generate report.') } finally { busyRef.current = false; if (mounted.current) setBusy(false) }
  }
  return <div className="space-y-3">{batches.length === 0 && <p className="text-sm text-muted-foreground">{lang === 'pt' ? 'Nenhum lote registrado.' : 'No recorded batches.'}</p>}{batches.map(batch => <article key={batch.owner + batch.id} className={mobileShowcaseCard}><h3 className="font-bold">{batch.model}</h3><p className="text-xs break-all">{batch.owner} · {batch.status} · {batch.mode === 'mock' ? 'SIMULAÇÃO' : 'AUTOMAÇÃO ZTE'}<br />{batch.id} · {configuredAttempts(batch).length}/{batch.requested}</p><div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => void report(batch, false)} className="rounded-xl border border-border p-3 text-xs">{lang === 'pt' ? 'Abrir PDF' : 'Open PDF'}</button><button type="button" disabled={busy} onClick={() => void report(batch, true)} className="rounded-xl border border-border p-3 text-xs">{lang === 'pt' ? 'Baixar PDF' : 'Download PDF'}</button></div><MobileCopy lang={lang} label="SN" value={configuredAttempts(batch).map(a => a.serial).join('\n')} /></article>)}{message && <p role="status">{message}</p>}{pdf && <div role="dialog" aria-modal="true" aria-label="PDF" className="fixed inset-0 z-[100] bg-background p-3 flex flex-col gap-3"><button autoFocus type="button" onClick={() => setPdf(null)} className="self-end rounded-xl border border-border p-3">{lang === 'pt' ? 'Fechar PDF' : 'Close PDF'}</button><a href={pdf} target="_blank" rel="noopener noreferrer" className="text-sm underline">{lang === 'pt' ? 'Abrir em nova guia' : 'Open in new tab'}</a><iframe title="PDF" src={pdf} className="w-full flex-1 bg-white" /></div>}</div>
}
function MobileUserScreens({ menu, lang, queue, ssid24, ssid5, pass24, pass5, setSsid24, setSsid5, setPass24, setPass5, adminUser, adminPassword, acs, locked }: { menu: SidebarMenu; lang: Language; queue: ReturnType<typeof useBatchConfigurator>; ssid24: string; ssid5: string; pass24: string; pass5: string; setSsid24: (v: string) => void; setSsid5: (v: string) => void; setPass24: (v: string) => void; setPass5: (v: string) => void; adminUser: string; adminPassword: string; acs: string; locked: boolean }) {
  const l = (pt: string, en: string) => lang === 'pt' ? pt : en
  const [model, setModel] = useState<BatchModel>('ZTE F6201B'), [checked, setChecked] = useState<number[]>([]), [band, setBand] = useState(24)
  const f = batchModelFiles(model)
  const paths = ['Internet > Estado > PON', 'Informação PON > SN', 'Gerência > Administração > Atualização de software', 'Gerência > Administração > Restaurar configuração padrão', 'Gerência > Gestão de Contas', 'Rede local > WLAN > Configuração SSID']
  const titles: Partial<Record<SidebarMenu, string>> = { local: l('Rede Local', 'Local Network'), diagnostics: l('Gerência e Diagnóstico', 'Management and Diagnostics'), firmware_catalog: l('Catálogo de Firmwares', 'Firmware Catalog'), optical_test: l('Teste Rápido Óptico', 'Quick Optical Test'), report_center: l('Central de Relatórios', 'Report Center'), bench_guide: l('Guia de Bancada', 'Bench Guide'), bench_defaults: l('Padrões da Bancada', 'Bench Defaults'), manual_config: l('Configuração Manual', 'Manual Configuration') }
  return <section className="md:hidden space-y-5"><h1 className="text-2xl font-bold">{titles[menu]}</h1>
    {menu === 'local' && <><article className={mobileShowcaseCard}><div className="grid grid-cols-2 gap-2">{[24, 5].map(value => <button type="button" key={value} aria-pressed={band === value} onClick={() => setBand(value)} className={`rounded-xl border p-3 text-sm ${band === value ? 'border-violet-500 bg-violet-500/10' : 'border-border'}`}>{value === 24 ? l('2.4 GHz · Alcance', '2.4 GHz · Range') : l('5 GHz · Performance', '5 GHz · Performance')}</button>)}</div><svg viewBox="0 0 280 80" role="img" aria-label={l('Visualização de frequência ilustrativa', 'Illustrative frequency visualization')} className="w-full h-24 text-violet-400 motion-safe:animate-pulse"><path d={band === 24 ? 'M0 40 Q35 0 70 40 T140 40 T210 40 T280 40' : 'M0 40 Q17 0 35 40 T70 40 T105 40 T140 40 T175 40 T210 40 T245 40 T280 40'} fill="none" stroke="currentColor" strokeWidth="3" /></svg><p className="text-xs text-muted-foreground">{l('Prévia da sessão; a gravação física depende da configuração da ONU.', 'Session preview; physical persistence depends on ONU configuration.')}</p>{[[ssid24, pass24, setSsid24, setPass24, '2.4 GHz'], [ssid5, pass5, setSsid5, setPass5, '5 GHz']].map(([ssid, pass, setSsid, setPass, label]) => <div key={String(label)} className="space-y-3"><label className="block text-sm">SSID {String(label)}<input disabled={locked} maxLength={32} value={String(ssid)} onChange={e => { if (new TextEncoder().encode(e.target.value).length <= 32) (setSsid as (v: string) => void)(e.target.value) }} className="w-full mt-2 border border-border rounded-xl bg-background p-3" /></label><label className="block text-sm">WPA {String(label)}<input disabled={locked} type="password" minLength={8} maxLength={63} value={String(pass)} onChange={e => (setPass as (v: string) => void)(e.target.value)} className="w-full mt-2 border border-border rounded-xl bg-background p-3" /></label><MobileCopy lang={lang} label={`WPA ${label}`} value={String(pass)} secret /></div>)}</article></>}
    {menu === 'diagnostics' && ['1. Governança de Contas', '2. Telemetria TR-069 ACS :7547', '3. Flash ROM Firmware', '4. Provisionamento Backup DNS'].map((name, i) => <details key={name} className={mobileShowcaseCard}><summary className="cursor-pointer font-bold py-2">{name}</summary><p className="text-sm break-all">{i === 0 ? `${l('Usuário configurado', 'Configured user')}: ${adminUser}` : i === 1 ? `ACS: ${acs}` : i === 2 ? l('Use somente firmware homologado e verifique SHA-256 no desktop.', 'Use approved firmware and verify SHA-256 on desktop.') : l('O backup deve corresponder ao modelo e à revisão da ONU.', 'Backup must match the ONU model and revision.')}</p><p className="text-xs text-muted-foreground flex items-center gap-2"><span className="size-2 rounded-full bg-cyan-400 motion-safe:animate-pulse" />{i === 1 ? l('CWMP · configuração da sessão; sincronização não confirmada', 'CWMP · session setting; sync unconfirmed') : l('SHA-256 · fluxo ilustrativo; arquivo não verificado', 'SHA-256 · illustrative flow; file unverified')}</p></details>)}
    {menu === 'firmware_catalog' && <MobileModelCards lang={lang} />}
    {menu === 'optical_test' && <MobileOpticalAnalyzer lang={lang} />}
    {menu === 'report_center' && <MobileReportCards batches={queue.history} lang={lang} />}
    {(menu === 'bench_guide' || menu === 'bench_defaults') && <><p className="text-xs text-muted-foreground">{l('Exceção autorizada: Modo Bancada permite ausência de potência, sem dispensar sinal medido reprovado.', 'Authorized exception: Bench Mode permits absent power, but not a measured rejected signal.')}</p><BenchGuideModule lang={lang} />{menu === 'bench_defaults' && <MobileModelCards lang={lang} />}</>}
    {menu === 'manual_config' && <><article className={mobileShowcaseCard}><label className="block text-sm">{l('Modelo da ONU', 'ONU model')}<select value={model} onChange={e => { setModel(e.target.value as BatchModel); setChecked([]) }} className="w-full mt-2 border border-border bg-background rounded-xl p-3">{batchModels.map(m => <option key={m}>{m}</option>)}</select></label><p className="text-xs break-all">Firmware: {f.firmware || l('Dispensado', 'Waived')}<br />Backup: {f.backup}<br />{f.version}</p>{paths.map((path, i) => <label key={path} className="flex gap-3 rounded-xl border border-border p-3 text-xs"><input type="checkbox" checked={checked.includes(i)} onChange={e => setChecked(old => e.target.checked ? [...old, i] : old.filter(n => n !== i))} /><span>{i + 1}/6 · {path}</span></label>)}<p role="status" className="text-xs">{checked.length}/6 · {l('Conferência manual', 'Manual checklist')}</p></article><article className={mobileShowcaseCard}><h2 className="font-bold">{l('Acessos e SSIDs · copiar', 'Access and SSIDs · copy')}</h2><MobileCopy lang={lang} label={l('Login ONU', 'ONU login')} value={queue.access.user1} /><MobileCopy lang={lang} label={l('Senha de acesso', 'Access password')} value={queue.access.password1} secret /><MobileCopy lang={lang} label="SSID 2.4 GHz" value={ssid24} /><MobileCopy lang={lang} label="SSID 5 GHz" value={ssid5} /><MobileCopy lang={lang} label="WPA 2.4 GHz" value={pass24} secret /><MobileCopy lang={lang} label="WPA 5 GHz" value={pass5} secret /></article></>}
  </section>
}
function MobileAdminScreens({ menu, lang, data }: { menu: SidebarMenu; lang: Language; data: AdminData }) {
  const l = (pt: string, en: string) => lang === 'pt' ? pt : en
  const [filter, setFilter] = useState(''), [contract, setContract] = useState(0), [permissions, setPermissions] = useState<Record<string, 'admin' | 'user'>>({}), [feedback, setFeedback] = useState('')
  useEffect(() => { const saved = safeJsonParse(localStorage.getItem('codenet_demo_permissions_v1') || '{}', {}); if (saved && typeof saved === 'object') setPermissions(saved) }, [])
  const attempts = data.batches.flatMap(b => b.attempts), configured = attempts.filter(a => a.result === 'CONFIGURADA').length
  const people = [...data.people, ...demoPeople(data.tick)]
  const sectors = ['Técnicos', 'NOC', 'Suporte', 'Almoxarifado', 'Engenharia']
  return <section className="md:hidden space-y-4 mb-6"><h1 className="text-2xl font-bold">{l('Painel Operacional Executivo', 'Executive Operations Panel')}</h1><p className="text-sm text-muted-foreground">{l('Telemetria em tempo real, setores ativos e segurança da frota ZTE.', 'Real-time telemetry, active sectors and ZTE fleet security.')}</p>
    {['overview', 'automations'].includes(menu) && <><MobileAdminPocketNoc lang={lang} data={data} /><div className="grid grid-cols-2 gap-3">{[[l('Lotes locais', 'Local batches'), data.batches.length], [l('ONUs configuradas', 'Configured ONUs'), configured]].map(([name, value]) => <article key={name} className={mobileShowcaseCard}><p className="text-xs">{name}</p><strong className="text-2xl">{value}</strong></article>)}</div><article className={mobileShowcaseCard}><h2 className="font-bold">{l('Pipeline · histórico local', 'Pipeline · local history')}</h2>{(['firmware', 'backup', 'adminPassword', 'wifi5'] as const).map((key, i) => { const total = attempts.filter(a => a[key] === 'CONFIRMADO PELO BOT' || a[key] === 'DISPENSADO').length; return <div key={key}><p className="text-xs">{i + 1}/4 {['Firmware', 'Backup DNS', 'Admin', 'Wi-Fi'][i]} · {total}/{attempts.length}</p><div className="h-2 mt-2 rounded bg-muted overflow-hidden"><div className="h-full bg-violet-500 transition-[width] duration-700" style={{ width: `${attempts.length ? total / attempts.length * 100 : 0}%` }} /></div></div>})}</article>{sectors.map((sector, i) => <article key={sector} className={mobileShowcaseCard}><h3 className="font-bold">{sector}</h3><p className="text-sm">{data.events[i]?.action || l('Aguardando eventos registrados.', 'Waiting for recorded events.')}</p><p className="text-xs text-muted-foreground">{l('Distribuição visual por setor; vínculo de origem não confirmado.', 'Visual sector grouping; source assignment unconfirmed.')}</p></article>)}</>}
    {['diagnostics', 'reports'].includes(menu) && <><article className={mobileShowcaseCard}><h2 className="font-bold">{l('Contratos · referência demonstrativa', 'Contracts · demonstration reference')}</h2><div className="grid grid-cols-3 gap-2">{[l('Ativos', 'Active'), l('Inativos', 'Inactive'), l('Suspensos', 'Suspended')].map((label, i) => <button key={label} type="button" aria-pressed={contract === i} onClick={() => setContract(i)} className={`rounded-xl border p-3 text-xs ${contract === i ? 'border-violet-500 bg-violet-500/10' : 'border-border'}`}>{label}</button>)}</div><p role="status" className="text-sm">{[128, 14, 6][contract]} · {l('exemplo, sem API comercial', 'example, no commercial API')}</p><AnimatedDepthChart kind="dual-line" values={[96, 70]} label={l('SLA / throughput ilustrativos', 'Illustrative SLA / throughput')} /></article><MobileReportCards batches={data.batches} lang={lang} /></>}
    {menu === 'equipments' && <><label className="block text-sm">{l('Buscar modelo', 'Search model')}<input value={filter} onChange={e => setFilter(e.target.value)} className="mt-2 w-full border border-border bg-background rounded-xl p-3" /></label>{batchModels.filter(m => m.toLowerCase().includes(filter.toLowerCase())).map(m => <article key={m} className={mobileShowcaseCard}><h2 className="font-bold">{m}</h2><p className="text-sm">{attempts.filter(a => a.model === m).length} {l('tentativas registradas · estoque físico indisponível', 'recorded attempts · physical inventory unavailable')}</p></article>)}<MobileModelCards lang={lang} filter={filter} /></>}
    {['users', 'monitoring'].includes(menu) && <>{people.map(person => <article key={person.id} className={mobileShowcaseCard}><h2 className="font-bold">{person.name}</h2><p className="text-xs text-muted-foreground">{person.source === 'demo' ? l('Sessão demonstrativa', 'Demo session') : l('Presença local registrada', 'Recorded local presence')}</p><p className="text-sm">{person.target} · {person.module}<br />{person.ip} · {Math.max(0, Math.floor((Date.now() - person.login) / 60000))} min</p><span className="inline-flex items-center gap-2 text-xs"><RefreshCw size={12} className="motion-safe:animate-spin" />{l('Em andamento', 'Running')}</span><label className="block text-xs">{l('Perfil (referência)', 'Role (reference)')}<select disabled={person.source !== 'demo'} value={permissions[person.id] || person.role} onChange={e => { const role = e.target.value as 'admin' | 'user'; if (person.source !== 'demo' || !['admin', 'user'].includes(role)) return; try { const next = { ...permissions, [person.id]: role }; localStorage.setItem('codenet_demo_permissions_v1', JSON.stringify(next)); setPermissions(next); writeAdminEvent('Admin', 'Permissão de referência alterada / Reference permission changed'); setFeedback(l('Referência salva; não altera autenticação real.', 'Reference saved; real authentication unchanged.')) } catch { setFeedback(l('Não foi possível salvar.', 'Unable to save.')) } }} className="mt-2 w-full border border-border bg-background rounded-xl p-3"><option value="user">{l('Operador', 'Operator')}</option><option value="admin">Admin</option></select></label></article>)}<p role="status" className="text-xs">{feedback}</p></>}
    {['security', 'auditing', 'alerts'].includes(menu) && <><article className={mobileShowcaseCard}><h2 className="font-bold flex gap-2"><ShieldCheck />PBKDF2-HMAC-SHA256</h2><p>210.000 {l('iterações', 'iterations')} · SHA-256</p><p className="text-xs text-muted-foreground">{l('Derivação local; autorização de produção depende do servidor. Os bloqueios abaixo são exemplos.', 'Local derivation; production authorization depends on the server. Blocks below are examples.')}</p><AnimatedDepthChart kind="dual-line" values={[70, 50]} label={l('Atividade ilustrativa', 'Illustrative activity')} /></article>{['BLOCK', 'DENY', 'REJECT'].map((action, i) => <article key={action} className={mobileShowcaseCard}><h3 className="font-bold text-rose-500">{action}</h3><p className="text-sm">192.0.2.{14 + i} · {l('Evento demonstrativo', 'Demo event')}</p></article>)}<button type="button" onClick={() => adminExport('auditoria-mobile.csv', [['Data', 'Operador', 'Ação'], ...data.events.map(e => [e.at, e.user, e.action])])} className="rounded-xl border border-border p-3 text-sm">{l('Exportar eventos registrados', 'Export recorded events')}</button>{data.events.slice(0, 50).map(e => <article key={e.id} className={mobileShowcaseCard}><p className="text-xs">{e.at} · {e.user}</p><p className="text-sm break-words">{e.action}</p></article>)}{!data.events.length && <p className="text-sm text-muted-foreground">{l('Nenhum evento registrado disponível.', 'No recorded events available.')}</p>}</>}
  </section>
}


function ChatSuggestions({ role, lang, isOpen, disabled, onSelect }: { role: 'user' | 'admin'; lang: Language; isOpen: boolean; disabled: boolean; onSelect: (text: string) => void }) {
  const [offset, setOffset] = useState(0)
  const bank = CHAT_SUGGESTIONS[role]
  const icons = role === 'user' ? [FileArchive, Radio, Router, Activity, Globe, FileText, HelpCircle, DollarSign] : [UserCheck, ShieldAlert, Home, TrendingUp, PieChart, Bell, Cpu, LockKeyhole]
  const rotate = () => setOffset(previous => (previous + 4) % bank.length)
  useEffect(() => {
    if (!isOpen || disabled) return
    setOffset(previous => (previous + 4) % bank.length)
    const timer = setInterval(() => setOffset(previous => (previous + 4) % bank.length), 12000)
    return () => clearInterval(timer)
  }, [isOpen, disabled, role, bank.length])
  return <>
    {Array.from({ length: 4 }, (_, index) => {
      const suggestionIndex = (offset + index) % bank.length
      const suggestion = bank[suggestionIndex][lang === 'pt' ? 0 : 1]
      const Icon = icons[suggestionIndex]
      return <button key={suggestion} type="button" disabled={disabled} onClick={() => onSelect(suggestion)} className="disabled:opacity-45 disabled:cursor-not-allowed flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-border bg-background/50 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all text-sm font-medium text-foreground shadow-sm group w-full text-left"><Icon className="disabled:opacity-45 disabled:cursor-not-allowed w-4 h-4 text-violet-400 shrink-0" /><span>{suggestion}</span></button>
    })}
    <button type="button" disabled={disabled} onClick={rotate} className="disabled:opacity-45 disabled:cursor-not-allowed inline-flex items-center gap-2 self-start rounded-lg px-3 py-2 text-xs text-violet-300 hover:bg-violet-500/10"><RefreshCw size={14} />{lang === 'pt' ? 'Outras sugestões' : 'Other suggestions'}</button>
  </>
}

type DiagTab = 'accounts' | 'tr069' | 'software' | 'config'
type Language = 'pt' | 'en'

interface LogMessage {
  id: string
  time: string
  type: 'info' | 'success' | 'warning' | 'command' | 'error'
  text: string
  stepIndex?: number
  isCommand?: boolean
  isInit?: boolean
  targetIp?: string
  targetModel?: string
}

interface MonitorOperation {
  id: string
  user: string
  equipment: string
  action: string
  start: string
  time: string
  status: string
}

interface LogEntry {
  id: string
  time: string
  tech: string
  type: string
  desc: string
  size: string
  user: string
}

const translations = {
  pt: {
    systemTitle: 'Code Net',
    systemSubtitle: 'Automação de Redes',
    networkCode: 'REDE DE CÓDIGOS',
    automationHub: 'Central de Automação',
    hello: 'Olá',
    userFallback: 'Usuário',
    adminFallback: 'Administrador',
    settings: 'Configurações',
    logout: 'Sair',
    menu: 'Menu',
    operation: 'Operação',
    management: 'Gestão',
    supervision: 'Supervisão',
    system: 'Sistema',
    assistantPanel: 'BOT de Automação',
    localNetwork: 'Rede Local',
    aiMode: 'Modo IA',
    premiumPlan: 'Plano PREMIUM',
    overview: 'Visão Geral',
    diagAndMgmt: 'Gerência e Diagnóstico',
    automations: 'Automações',
    equipments: 'Equipamentos',
    usersAndPerms: 'Usuários e Permissões',
    security: 'Segurança',
    monitoring: 'Monitoramento',
    auditAndLogs: 'Auditoria e Logs',
    alerts: 'Alertas',
    reports: 'Relatórios',
    inDevelopment: 'Módulo em Desenvolvimento',
    inDevDesc: (menu: string) => `A tela de ${menu} está em processo de construção e estará disponível nas próximas atualizações do protótipo.`,
    chatWelcome: (user: string) => `Olá, ${user},\nComo posso ajudar?`,
    askSomething: 'Pergunte algo',
    aiDisclaimer: 'O Zseven é uma IA e pode cometer erros, portanto, verifique se há erros e não compartilhe informações confidenciais.',
    privacyPolicy: 'Política de Privacidade',
    quickActionUsers: 'Analisar Usuários',
    quickActionInvaders: 'Detectar Invasores',
    quickActionUpdates: 'Ideias de UPDATES',
    quickActionAutomate: 'Vamos automatizar',
    quickActionScale: 'Como aumentar minha automação',
    quickActionSummary: 'Resumo do sistema Code Net',
    quickActionPremium: 'Como funciona o PLANO PREMIUM',
    automationProgress: 'Progresso da Automação',
    targetRouter: 'Roteador Alvo',
    running: 'Em Execução',
    completed: 'Concluído',
    waiting: 'Aguardando',
    elapsedTime: 'Tempo decorrido',
    refreshRate: 'Taxa de Atualização',
    startAutomation: 'Iniciar Automação do Roteador',
    automating: 'Automatizando...',
    reset: 'Resetar',
    consoleTitle: 'Assistant Log Console — bash',
    consoleWaiting: 'Aguardando início da automação...',
    consoleHelp: 'Clique em "Iniciar Automação" para ver os dados em tempo real.',
    liveFeed: 'Feed ao Vivo',
    loginWelcome: 'Bem-vindo(a) ao Code Net!',
    loginSubWelcome: 'O sistema Code Net foi desenvolvido com a finalidade de automatizar e otimizar a configuração de Roteadores, tornando o processo mais rápido, seguro e eficiente.',
    loginFeaturesTitle: 'Principais funcionalidades:',
    feat1: 'Gestão de Contas e Credenciais',
    feat2: 'Gerenciamento TR069 (ACS / Telemetria)',
    feat3: 'Atualização de software (Firmware)',
    feat4: 'Aplicação de configurações padrão',
    feat5: 'Configuração das redes Wi-Fi 2.4 GHz e 5 GHz (SSID)',
    courseTag: 'Sistema criado pelos alunos do Curso: Análise de Desenvolvimento de Sistemas | Fatec Itapetininga - SP',
    developedBy: 'Desenvolvido pela',
    inPartnership: 'em parceria com a provedora',
    createAccountTitle: 'Crie sua conta no',
    accessTitle: 'Acesse o',
    loginSubtitle: 'Gerencie Atualizações e Configurações de Roteadores em um só Sistema.',
    userFieldLabel: 'Nome do Usuário:',
    userFieldPlaceholder: 'Seu Nome',
    passFieldLabel: 'Insira sua senha de 8 caracteres:',
    passFieldPlaceholder: 'Sua Senha',
    confirmPassLabel: 'Confirme sua senha de 8 caracteres:',
    confirmPassPlaceholder: 'Repita a Senha',
    finishRegisterBtn: 'Finalizar Cadastro',
    enterSystemBtn: 'Entrar no sistema',
    backToLogin: 'Voltar para login',
    createAccountBtn: 'Criar conta',
    dataProtected: 'Seus dados são protegidos e isolados por conta',
    diagSubheader: 'PAINEL OPERACIONAL',
    diagTitle: 'Gerência e Diagnóstico do Roteador',
    diagDesc: 'Selecione a opção desejada para gerenciar credenciais, parâmetros TR069 ou efetuar atualização e restauração.',
    tabAccounts: 'Gestão de Contas',
    tabTr069: 'Gestão TR069',
    tabSoftware: 'Atualização de software',
    tabConfig: 'Configuração',
    pageInfo: 'Informações da página',
    pageInfoAccounts: 'Esta página fornece a função de configuração do parâmetro de conta web.',
    pageInfoTR069: 'Esta página fornece a função do parâmetro(s) gestão TR069 de configuração.',
    adminAccountMgmt: 'Administrador Gerenciamento de conta',
    passRulesTitle: 'Uma senha forte é necessária e deve atender a estas regras:',
    rule1: 'A senha deve ter pelo menos 8 caracteres.',
    rule2: 'Deve conter pelo menos 1 letra maiúscula, 1 letra minúscula e 1 número.',
    rule3: 'Não deve ter relação de contexto com o nome de usuário, como o mesmo ou o inverso.',
    userLabel: 'Usuário:',
    currentPassLabel: 'Senha atual:',
    newPassLabel: 'Nova senha:',
    confirmNewPassLabel: 'Confirmar senha:',
    applyBtn: 'Aplicar',
    cancelBtn: 'Cancelar',
    basicSettings: 'Configuração básica',
    wanConn: 'Conexão WAN:',
    periodicInform: 'Periódica Inform:',
    periodicInterval: 'Periódica Informe Intervalo:',
    acsAuth: 'Autenticando ACS:',
    fileServerAuth: 'Autenticação de servidor de arquivos:',
    on: 'Ligado',
    off: 'Desligado',
    softwareUpdateDesc: 'Envie o firmware oficial para iniciar a atualização.',
    dropFirmwareText: 'Clique para selecionar o arquivo',
    startUpdateBtn: 'Iniciar atualização',
    continueConfigBtn: 'Continuar para Configuração Padrão',
    configDefaultTitle: 'Configuração padrão',
    configDefaultDesc: 'Envie o arquivo de configuração padrão para restaurar as definições.',
    startConfigBtn: 'Iniciar configuração',
    company: 'Empresa',
    about: 'Sobre',
    brand: 'Marca',
    policy: 'Política',
    terms: 'Termos',
    privacy: 'Privacidade',
    guidelines: 'Diretrizes',
    companyInfo: 'Detalhes da empresa',
    social: 'Social',
    language: 'Idioma',
    ptBr: 'Português (Brasil)',
    enUs: 'Inglês',
    realTimeTracking: 'Acompanhe a automação em tempo real via terminal de comandos e indicador de progresso.',
    passRequired: 'A senha é obrigatória.',
    passMismatch: 'As senhas não coincidem.',
    accountCreated: 'Conta criada com sucesso! Realize o acesso.',
    passLengthError: 'A senha deve conter exatamente 8 caracteres.',
    selectFileError: 'Selecione um arquivo antes de continuar.',
    agentSettingsSoon: 'Configurações do agente disponíveis em breve.',
    closeChat: 'Fechar Chat',
    dictate: 'Ditar',
    send: 'Enviar',
    info: 'Informações',
    togglePass: 'Alternar visibilidade da senha',
    openSidebar: 'Abrir barra lateral',
    closeSidebar: 'Fechar barra lateral',
    fileTypes: 'BIN, DNS, CFG ou CONF',
    processing: 'Processando...',
    discordTitle: 'Acesse nosso Discord',
    youtubeTitle: 'Acesse nosso canal no YouTube',
    password: 'Senha:',
    connReqUrl: 'Pedido de Conexão URL:',
    connReqUser: 'Pedido de Conexão Nome usuário:',
    connReqPass: 'Pedido de Conexão Senha:',
    any: 'Qualquer',
    fillField: 'Preencha este campo.',
    enterCurrentPass: 'Digite a senha atual',
    enterNewPass: 'Digite a nova senha',
    confirmNewPass: 'Confirme a nova senha',
    passwordsDoNotMatch: 'As senhas digitadas não coincidem.',
    accountSettingsSaved: 'Configurações de conta salvas com sucesso!',
    tr069Saved: 'Parâmetros TR069 salvos com sucesso!',
    updateSuccess: 'Atualização concluída no roteador.',
    configSuccess: 'Configuração padrão aplicada com sucesso.',
    localNetworkTitle: 'Rede Local (LAN)',
    localNetworkDesc: 'Gerencie endereços IP, DHCP, lista de dispositivos Wi-Fi e portas Ethernet.',
    ssid24: 'SSID1 (2,4 GHz)',
    ssid5: 'SSID5 (5 GHz)',
    ssidName: 'Nome SSID:',
    ssidStatus: 'SSID:',
    cryptoType: 'Tipo de criptografia:',
    wpaPassword: 'Senha WPA:',
    isolation: 'SSID de isolamento:',
    maxClients: 'Quantidade máxima de clientes:',
    applyChanges: 'Aplicar Alterações',
    cancel: 'Cancelar',
    ssidPlaceholder24: 'Ex: MinhaRede_2.4G',
    ssidPlaceholder5: 'Ex: MinhaRede_5G',
    passPlaceholder: 'Digite a senha da rede Wi-Fi',
    localNetworkSuccess: 'Alterações aplicadas com sucesso!',
    systemSummaryTitle: 'Resumo do Sistema',
    completedLegend: 'Concluídas',
    failuresLegend: 'Falhas',
    totalLegend: 'Total',
    ongoingOperationsTitle: 'Operações em Andamento',
    seeAll: 'Ver todos',
    colId: 'ID',
    colUser: 'Usuário',
    colEquipment: 'Equipamento',
    colAction: 'Ação',
    colStart: 'Início',
    colTime: 'Tempo',
    colStatus: 'Status',
    inProgress: 'Em andamento',
    refreshMonitoring: 'Atualizar monitoramento',
    refreshBtn: 'Atualizar',
    generalStatusTitle: 'Status Geral',
    contractsSubtitle: 'Contratos',
    activeContracts: 'Ativos',
    suspendedContracts: 'Suspensos',
    inactiveContracts: 'Inativos',
    activeClients: 'Clientes ativos',
    contractsWord: 'Contratos:',
    totalContracts: 'Contratos total',
    recentActivityTitle: 'Atividade Recente',
    blockedLoginsTitle: 'Tentativas de Login Bloqueadas',
    alertsPanelTitle: 'Alertas de Operação',
    deviceStatusOverview: 'Status dos Dispositivos',
    networkTraffic: 'Tráfego de Rede',
    throughputLabel: 'Throughput (Mbps, Upload/Download)',
    online: 'Online',
    offline: 'Offline',
    pending: 'Pendente',
    logViewerTitle: 'Visualizador de Logs',
    logDescriptionTitle: 'Console de Scripts e Execução',
    marketMetricsTitle: 'Métricas de Tráfego por Rota (Provedores)',
    marketMetricsDesc: 'Throughput, latência e densidade por rota de backbone ISP',
    deviceModel: 'Modelo do Dispositivo',
    wanIpLabel: 'IP WAN',
    connectedStatus: 'Conectado',
    uptimeLabel: 'Tempo de Atividade',
    tr069ActiveStatus: 'TR069 ACS Ativo',
    httpTestLabel: 'Teste HTTP',
    pingTestLabel: 'Teste de Ping',
    speedRateLabel: 'Taxa de Velocidade',
    filterLogPlaceholder: 'Filtrar log...',
    clearFilter: 'Limpar filtro',
    colDateTime: 'Data e Hora',
    colTech: 'Tecnologia',
    colType: 'Tipo',
    colDesc: 'Descrição',
    colSize: 'Tamanho',
    showingEvents: (count: number) => `Exibindo ${count} eventos`,
    liveBackgroundSync: '● Sincronização em segundo plano ativa',
    asyncThreadRunning: 'Thread assíncrona em execução',
    backboneOutput: 'Saída do Backbone (Gbps)',
    livePeeringThroughput: 'Throughput de Peering ao Vivo',
    transitIp: 'Trânsito IP',
    cdnCache: 'Cache CDN',
    manualSyncLog: 'Sincronização manual forçada por Técnicos'
  },
  en: {
    systemTitle: 'Code Net',
    systemSubtitle: 'Network Automation',
    networkCode: 'CODE NETWORK',
    automationHub: 'Automation Center',
    hello: 'Hello',
    userFallback: 'User',
    adminFallback: 'Administrator',
    settings: 'Settings',
    logout: 'Sign Out',
    menu: 'Menu',
    operation: 'Operation',
    management: 'Management',
    supervision: 'Supervision',
    system: 'System',
    assistantPanel: 'Automation BOT',
    localNetwork: 'Local Network',
    aiMode: 'AI Mode',
    premiumPlan: 'PREMIUM Plan',
    overview: 'Overview',
    diagAndMgmt: 'Management & Diagnostics',
    automations: 'Automations',
    equipments: 'Equipments',
    usersAndPerms: 'Users & Permissions',
    security: 'Security',
    monitoring: 'Monitoring',
    auditAndLogs: 'Audit & Logs',
    alerts: 'Alerts',
    reports: 'Reports',
    inDevelopment: 'Module Under Development',
    inDevDesc: (menu: string) => `The ${menu} section is currently under development and will be available in future releases.`,
    chatWelcome: (user: string) => `Hello, ${user},\nHow can I help you?`,
    askSomething: 'Ask something',
    aiDisclaimer: 'Zseven is an AI and can make mistakes, so check for errors and do not share confidential information.',
    privacyPolicy: 'Privacy Policy',
    quickActionUsers: 'Analyze Users',
    quickActionInvaders: 'Detect Intruders',
    quickActionUpdates: 'Update Suggestions',
    quickActionAutomate: "Let's automate",
    quickActionScale: 'How to scale my automation',
    quickActionSummary: 'Code Net overview',
    quickActionPremium: 'How PREMIUM Plan works',
    automationProgress: 'Automation Progress',
    targetRouter: 'Target Router',
    running: 'Running',
    completed: 'Completed',
    waiting: 'Waiting',
    elapsedTime: 'Elapsed Time',
    refreshRate: 'Refresh Rate',
    startAutomation: 'Start Router Automation',
    automating: 'Automating...',
    reset: 'Reset',
    consoleTitle: 'Assistant Log Console — bash',
    consoleWaiting: 'Waiting for automation start...',
    consoleHelp: 'Click "Start Router Automation" to stream real-time logs.',
    liveFeed: 'Live Feed',
    loginWelcome: 'Welcome to Code Net!',
    loginSubWelcome: 'The Code Net platform was engineered to automate and optimize router configurations, delivering maximum efficiency, speed, and security.',
    loginFeaturesTitle: 'Key features:',
    feat1: 'Account & Credentials Governance',
    feat2: 'TR069 ACS & Telemetry Management',
    feat3: 'Automated Firmware & Software Updates',
    feat4: 'Default Provisioning Templates',
    feat5: 'Dual-band Wi-Fi Configuration (2.4 GHz & 5 GHz SSID)',
    courseTag: 'System crafted by Systems Analysis & Development students | Fatec Itapetininga - SP',
    developedBy: 'Engineered by',
    inPartnership: 'in partnership with ISP',
    createAccountTitle: 'Create your account on',
    accessTitle: 'Sign in to',
    loginSubtitle: 'Manage Router Provisioning & Firmware in a single unified console.',
    userFieldLabel: 'Username:',
    userFieldPlaceholder: 'Your Name',
    passFieldLabel: 'Enter your 8-character password:',
    passFieldPlaceholder: 'Your Password',
    confirmPassLabel: 'Confirm your 8-character password:',
    confirmPassPlaceholder: 'Repeat Password',
    finishRegisterBtn: 'Complete Registration',
    enterSystemBtn: 'Sign In',
    backToLogin: 'Back to sign in',
    createAccountBtn: 'Create account',
    dataProtected: 'Your data is secured and isolated per account',
    diagSubheader: 'OPERATIONAL DASHBOARD',
    diagTitle: 'Router Management & Diagnostics',
    diagDesc: 'Select an option to manage credentials, TR069 parameters, or execute firmware flash and config provisioning.',
    tabAccounts: 'Account Management',
    tabTr069: 'TR069 Management',
    tabSoftware: 'Software Update',
    tabConfig: 'Configuration',
    pageInfo: 'Page Information',
    pageInfoAccounts: 'This section provides access to web management account configurations.',
    pageInfoTR069: 'This section configures TR069 ACS management telemetry parameters.',
    adminAccountMgmt: 'Administrator Account Management',
    passRulesTitle: 'A strong password is required and must comply with these guidelines:',
    rule1: 'Password must have at least 8 characters.',
    rule2: 'Must contain at least 1 uppercase letter, 1 lowercase letter, and 1 digit.',
    rule3: 'Must not relate to the username (direct or reversed).',
    userLabel: 'User:',
    currentPassLabel: 'Current password:',
    newPassLabel: 'New password:',
    confirmNewPassLabel: 'Confirm password:',
    applyBtn: 'Apply',
    cancelBtn: 'Cancel',
    basicSettings: 'Basic Settings',
    wanConn: 'WAN Connection:',
    periodicInform: 'Periodic Inform:',
    periodicInterval: 'Periodic Inform Interval:',
    acsAuth: 'ACS Authentication:',
    fileServerAuth: 'File Server Authentication:',
    on: 'Enabled',
    off: 'Disabled',
    softwareUpdateDesc: 'Upload official router firmware to initiate flash update.',
    dropFirmwareText: 'Click to select a file',
    startUpdateBtn: 'Start update',
    continueConfigBtn: 'Proceed to Default Configuration',
    configDefaultTitle: 'Default Configuration',
    configDefaultDesc: 'Upload the default configuration backup file to restore device parameters.',
    startConfigBtn: 'Start configuration',
    company: 'Company',
    about: 'About',
    brand: 'Brand',
    policy: 'Policy',
    terms: 'Terms',
    privacy: 'Privacy',
    guidelines: 'Guidelines',
    companyInfo: 'Company Details',
    social: 'Social',
    language: 'Language',
    ptBr: 'Português (Brasil)',
    enUs: 'English',
    realTimeTracking: 'Track real-time automation via command terminal and progress indicator.',
    passRequired: 'Password is required.',
    passMismatch: 'Passwords do not match.',
    accountCreated: 'Account created successfully! Please sign in.',
    passLengthError: 'Password must be exactly 8 characters long.',
    selectFileError: 'Please select a file before continuing.',
    agentSettingsSoon: 'Agent settings available soon.',
    closeChat: 'Close Chat',
    dictate: 'Dictate',
    send: 'Send',
    info: 'Information',
    togglePass: 'Toggle password visibility',
    openSidebar: 'Open sidebar',
    closeSidebar: 'Close sidebar',
    fileTypes: 'BIN, DNS, CFG or CONF',
    processing: 'Processing...',
    discordTitle: 'Join our Discord',
    youtubeTitle: 'Visit our YouTube channel',
    password: 'Password:',
    connReqUrl: 'Connection Request URL:',
    connReqUser: 'Connection Request Username:',
    connReqPass: 'Connection Request Password:',
    any: 'Any',
    fillField: 'Please fill out this field.',
    enterCurrentPass: 'Enter current password',
    enterNewPass: 'Enter new password',
    confirmNewPass: 'Confirm new password',
    passwordsDoNotMatch: 'Passwords do not match.',
    accountSettingsSaved: 'Account settings updated successfully!',
    tr069Saved: 'TR069 settings saved successfully!',
    updateSuccess: 'Router update successfully applied.',
    configSuccess: 'Default configuration applied successfully.',
    localNetworkTitle: 'Local Network (LAN)',
    localNetworkDesc: 'Manage IP addresses, DHCP, Wi-Fi device list, and Ethernet ports.',
    ssid24: 'SSID1 (2.4 GHz)',
    ssid5: 'SSID5 (5 GHz)',
    ssidName: 'SSID Name:',
    ssidStatus: 'SSID:',
    cryptoType: 'Encryption Type:',
    wpaPassword: 'WPA Password:',
    isolation: 'SSID Isolation:',
    maxClients: 'Max Clients:',
    applyChanges: 'Apply Changes',
    cancel: 'Cancel',
    ssidPlaceholder24: 'E.g.: MyNetwork_2.4G',
    ssidPlaceholder5: 'E.g.: MyNetwork_5G',
    passPlaceholder: 'Enter Wi-Fi password',
    localNetworkSuccess: 'Changes applied successfully!',
    systemSummaryTitle: 'System Summary',
    completedLegend: 'Completed',
    failuresLegend: 'Failures',
    totalLegend: 'Total',
    ongoingOperationsTitle: 'Ongoing Operations',
    seeAll: 'See all',
    colId: 'ID',
    colUser: 'User',
    colEquipment: 'Equipment',
    colAction: 'Action',
    colStart: 'Start',
    colTime: 'Time',
    colStatus: 'Status',
    inProgress: 'In progress',
    refreshMonitoring: 'Refresh monitoring',
    refreshBtn: 'Refresh',
    generalStatusTitle: 'General Status',
    contractsSubtitle: 'Contracts',
    activeContracts: 'Active',
    suspendedContracts: 'Suspended',
    inactiveContracts: 'Inactive',
    activeClients: 'Active clients',
    contractsWord: 'Contracts:',
    totalContracts: 'Total contracts',
    recentActivityTitle: 'Recent Activity',
    blockedLoginsTitle: 'Blocked Login Attempts',
    alertsPanelTitle: 'Operational Alerts',
    deviceStatusOverview: 'Device Status Overview',
    networkTraffic: 'Network Traffic',
    throughputLabel: 'Throughput (Mbps, Upload/Download)',
    online: 'Online',
    offline: 'Offline',
    pending: 'Pending',
    logViewerTitle: 'Log Viewer',
    logDescriptionTitle: 'Script Console & Execution',
    marketMetricsTitle: 'Route Traffic Metrics (ISP Market)',
    marketMetricsDesc: 'Throughput, latency and route density across ISP backbones',
    deviceModel: 'Device Model',
    wanIpLabel: 'WAN IP',
    connectedStatus: 'Connected',
    uptimeLabel: 'Uptime',
    tr069ActiveStatus: 'TR069 ACS Active',
    httpTestLabel: 'HTTP Test',
    pingTestLabel: 'Ping Test',
    speedRateLabel: 'Speed Rate',
    filterLogPlaceholder: 'Filter log...',
    clearFilter: 'Clear filter',
    colDateTime: 'Date & Time',
    colTech: 'Technology',
    colType: 'Type',
    colDesc: 'Description',
    colSize: 'Size',
    showingEvents: (count: number) => `Showing ${count} events`,
    liveBackgroundSync: '● Live background sync active',
    asyncThreadRunning: 'Async thread running',
    backboneOutput: 'Backbone Output (Gbps)',
    livePeeringThroughput: 'Live Peering Throughput',
    transitIp: 'Transit IP',
    cdnCache: 'CDN Cache',
    manualSyncLog: 'Manual sync forced by Técnicos'
  }
}

// -------------------------------------------------------------------------------------------------
// COMPONENTES AUXILIARES
// -------------------------------------------------------------------------------------------------

function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const canvas = canvasRef.current, ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    let width = 0, height = 0, frame = 0, previousTime = 0
    let cursor: { x: number; y: number } | null = null
    const particles: { x: number; y: number; vx: number; vy: number; mx: number; my: number; radius: number }[] = []
    const resize = () => {
      width = canvas.parentElement?.clientWidth || window.innerWidth
      height = canvas.parentElement?.clientHeight || window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(Math.floor((width * height) / 5500), 140)
      particles.splice(count)
      while (particles.length < count) particles.push({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - 0.5) * 0.7, vy: (Math.random() - 0.5) * 0.7, mx: 0, my: 0, radius: Math.random() * 2 + 1.5 })
      particles.forEach(p => { p.x = Math.max(0, Math.min(width, p.x)); p.y = Math.max(0, Math.min(height, p.y)) })
      cursor = null
    }
    const move = (event: MouseEvent) => { const rect = canvas.getBoundingClientRect(); cursor = { x: event.clientX - rect.left, y: event.clientY - rect.top } }
    const leave = () => { cursor = null }
    const out = (event: MouseEvent) => { if (!event.relatedTarget) leave() }
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', move, { passive: true })
    window.addEventListener('mouseout', out)
    window.addEventListener('mouseleave', leave)
    window.addEventListener('blur', leave)
    const draw = (time: number) => {
      const dt = previousTime ? Math.min((time - previousTime) / 16.667, 2) : 1
      previousTime = time
      ctx.clearRect(0, 0, width, height)
      const radius = 160
      for (const p of particles) {
        p.mx *= Math.pow(0.92, dt); p.my *= Math.pow(0.92, dt)
        if (cursor) {
          const dx = cursor.x - p.x, dy = cursor.y - p.y, distance = Math.hypot(dx, dy)
          if (distance > 0.1 && distance < radius) {
            const proximity = 1 - distance / radius
            // A soft exclusion ring and tangential drift prevent all particles sticking to one pixel.
            const force = distance < 28 ? -0.045 : 0.025 * proximity
            p.mx += (dx / distance * force - dy / distance * 0.008 * proximity) * dt
            p.my += (dy / distance * force + dx / distance * 0.008 * proximity) * dt
          }
        }
        p.x += (p.vx + p.mx) * dt; p.y += (p.vy + p.my) * dt
        if (p.x < 0 || p.x > width) { p.vx *= -1; p.mx *= -0.5; p.x = Math.max(0, Math.min(width, p.x)) }
        if (p.y < 0 || p.y > height) { p.vy *= -1; p.my *= -0.5; p.y = Math.max(0, Math.min(height, p.y)) }
      }
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const proximity = cursor ? Math.max(0, 1 - Math.hypot(cursor.x - p.x, cursor.y - p.y) / radius) : 0
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(167, 139, 250, ${0.7 + proximity * 0.3})`
        ctx.shadowColor = '#a78bfa'; ctx.shadowBlur = 8 + proximity * 14; ctx.fill(); ctx.shadowBlur = 0
        if (cursor && proximity > 0) {
          ctx.beginPath(); ctx.moveTo(cursor.x, cursor.y); ctx.lineTo(p.x, p.y)
          ctx.strokeStyle = `rgba(196, 181, 253, ${proximity * 0.65})`; ctx.lineWidth = 1 + proximity
          ctx.shadowBlur = proximity * 8; ctx.stroke(); ctx.shadowBlur = 0
        }
        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j], distance = Math.hypot(p.x - other.x, p.y - other.y)
          if (distance >= 170) continue
          const otherProximity = cursor ? Math.max(0, 1 - Math.hypot(cursor.x - other.x, cursor.y - other.y) / radius) : 0
          const glow = Math.max(proximity, otherProximity)
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(other.x, other.y)
          ctx.strokeStyle = `rgba(167, 139, 250, ${(1 - distance / 170) * (0.45 + glow * 0.35)})`
          ctx.lineWidth = 1 + glow * 0.5; ctx.shadowBlur = glow * 6; ctx.stroke(); ctx.shadowBlur = 0
        }
      }
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize); window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseout', out); window.removeEventListener('mouseleave', leave); window.removeEventListener('blur', leave)
    }
  }, [])
  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 pointer-events-none z-0" />
}

function ZsevenSparkIcon({ className = 'w-7 h-7' }: { className?: string }) {
  const id = useId().replace(/:/g, '')
  return <svg className={`${className} shrink-0`} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <style>{`
      @keyframes zseven-spark-trail { 0%,100% { opacity:.3 } 50% { opacity:1 } }
      @keyframes zseven-spark-rotate { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
      .zseven-spark-trail { animation:zseven-spark-trail 1.6s ease-in-out infinite; }
      .zseven-spark-star { transform-box:fill-box; transform-origin:center; animation:zseven-spark-rotate 4s linear infinite; }
      @media (prefers-reduced-motion:reduce) { .zseven-spark-trail,.zseven-spark-star { animation:none } .zseven-spark-shimmer { display:none } }
    `}</style>
    <defs>
      <linearGradient id={`${id}-trail`} x1="8" y1="56" x2="42" y2="20" gradientUnits="userSpaceOnUse"><stop stopColor="#00f2fe" /><stop offset=".45" stopColor="#06b6d4" /><stop offset="1" stopColor="#2575fc" /></linearGradient>
      <linearGradient id={`${id}-shimmer`} x1="18" y1="0" x2="62" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#2575fc" stopOpacity="0" /><stop offset=".5" stopColor="#b9faff" stopOpacity=".85" /><stop offset="1" stopColor="#2575fc" stopOpacity="0" /><animateTransform attributeName="gradientTransform" type="translate" values="-36 -36;36 36" dur="1.6s" repeatCount="indefinite" /></linearGradient>
    </defs>
    <g stroke={`url(#${id}-trail)`} strokeWidth="5" strokeLinecap="round">
      <path className="zseven-spark-trail" d="M8 43L17 34" />
      <path className="zseven-spark-trail" style={{ animationDelay: '160ms' }} d="M10 53L29 34" />
      <path className="zseven-spark-trail" style={{ animationDelay: '320ms' }} d="M21 56L39 38" />
    </g>
    <g className="zseven-spark-star">
      <path d="M43 4C45 15 48 18 59 20C48 22 45 25 43 36C41 25 38 22 27 20C38 18 41 15 43 4Z" fill="#2575fc" />
      <path className="zseven-spark-shimmer" d="M43 4C45 15 48 18 59 20C48 22 45 25 43 36C41 25 38 22 27 20C38 18 41 15 43 4Z" fill={`url(#${id}-shimmer)`} />
    </g>
  </svg>
}

function ChatResponseActions({ text, lang }: { text: string; lang: Language }) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const [selectedVote, setSelectedVote] = useState<'like' | 'dislike' | null>(null)
  const [showFeedbackText, setShowFeedbackText] = useState(false)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tooltipId = useId()
  function chooseFeedback(value: 'like' | 'dislike') {
    if (selectedVote && selectedVote !== value) return
    setSelectedVote(value)
    setShowFeedbackText(true)
    if (feedbackTimer.current !== null) clearTimeout(feedbackTimer.current)
    feedbackTimer.current = setTimeout(() => { setShowFeedbackText(false); feedbackTimer.current = null }, 10000)
  }
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; if (timeout.current !== null) clearTimeout(timeout.current); if (feedbackTimer.current !== null) clearTimeout(feedbackTimer.current) } }, [])
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      if (!mounted.current) return
      setCopied(true); setCopyError(false)
      if (timeout.current !== null) clearTimeout(timeout.current)
      timeout.current = setTimeout(() => setCopied(false), 1600)
    } catch { if (mounted.current) { setCopied(false); setCopyError(true) } }
  }
  const button = 'inline-flex h-8 w-8 items-center justify-center rounded-lg text-violet-400 hover:bg-violet-500/15 focus-visible:outline focus-visible:outline-violet-400'
  return <div className="mt-2 border-t border-border/50 pt-2">
    <div className="flex items-center gap-1">
      <span className="relative inline-flex group/copy"><button type="button" className={button} aria-describedby={tooltipId + '-copy'} aria-label={copied ? (lang === 'pt' ? 'Copiado' : 'Copied') : (lang === 'pt' ? 'Copiar resposta' : 'Copy response')} onClick={() => void copy()}>{copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}</button><span id={tooltipId + '-copy'} role="tooltip" className="pointer-events-none invisible absolute bottom-full left-0 z-20 mb-2 w-max max-w-[160px] rounded-lg border border-violet-500/30 bg-[#17132e] px-3 py-2 text-[11px] text-violet-100 shadow-xl opacity-0 transition-opacity group-hover/copy:visible group-hover/copy:opacity-100 group-focus-within/copy:visible group-focus-within/copy:opacity-100">{lang === 'pt' ? 'Copiar resposta' : 'Copy response'}</span></span>
      {selectedVote !== 'dislike' && <span className="relative inline-flex group/like"><button type="button" aria-describedby={tooltipId + '-like'} aria-label={lang === 'pt' ? 'Boa resposta' : 'Good response'} aria-pressed={selectedVote === 'like'} className={button + (selectedVote === 'like' ? ' bg-violet-500/20' : '')} onClick={() => chooseFeedback('like')}><ThumbsUp size={15} fill={selectedVote === 'like' ? 'currentColor' : 'none'} /></button><span id={tooltipId + '-like'} role="tooltip" className="pointer-events-none invisible absolute bottom-full left-0 z-20 mb-2 w-max max-w-[160px] rounded-lg border border-violet-500/30 bg-[#17132e] px-3 py-2 text-[11px] text-violet-100 shadow-xl opacity-0 transition-opacity group-hover/like:visible group-hover/like:opacity-100 group-focus-within/like:visible group-focus-within/like:opacity-100">{lang === 'pt' ? 'Boa resposta' : 'Good response'}</span></span>}
      {selectedVote !== 'like' && <span className="relative inline-flex group/dislike"><button type="button" aria-describedby={tooltipId + '-dislike'} aria-label={lang === 'pt' ? 'Resposta ruim' : 'Bad response'} aria-pressed={selectedVote === 'dislike'} className={button + (selectedVote === 'dislike' ? ' bg-violet-500/20' : '')} onClick={() => chooseFeedback('dislike')}><ThumbsDown size={15} fill={selectedVote === 'dislike' ? 'currentColor' : 'none'} /></button><span id={tooltipId + '-dislike'} role="tooltip" className="pointer-events-none invisible absolute bottom-full left-0 z-20 mb-2 w-max max-w-[160px] rounded-lg border border-violet-500/30 bg-[#17132e] px-3 py-2 text-[11px] text-violet-100 shadow-xl opacity-0 transition-opacity group-hover/dislike:visible group-hover/dislike:opacity-100 group-focus-within/dislike:visible group-focus-within/dislike:opacity-100">{lang === 'pt' ? 'Resposta ruim' : 'Bad response'}</span></span>}
    </div>
    <p role="status" className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{copyError ? (lang === 'pt' ? 'Não foi possível copiar. Selecione e copie o texto da resposta.' : 'Unable to copy. Select and copy the response text.') : copied ? (lang === 'pt' ? 'Resposta copiada.' : 'Response copied.') : ''}</p>
    {showFeedbackText && selectedVote && <p role="status" className="mt-1 text-[10px] leading-relaxed text-violet-300">{selectedVote === 'like' ? (lang === 'pt' ? 'Valeu! Com seu feedback, o Zseven IA fica ainda melhor para todo mundo' : 'Thanks! Your feedback helps make Zseven AI even better for everyone') : (lang === 'pt' ? 'Obrigado pelo seu feedback, iremos analisar o comportamento do Zseven IA.' : "Thank you for your feedback, we will analyze Zseven AI's behavior.")}</p>}
  </div>
}

function ModoIABtn({ onClick, label, className = 'mt-0' }: { onClick: () => void, label: string, className?: string }) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    btnRef.current.style.setProperty('--x', `${e.clientX - rect.left}px`)
    btnRef.current.style.setProperty('--y', `${e.clientY - rect.top}px`)
  }
  return (
    <button ref={btnRef} onMouseMove={handleMouseMove} onClick={onClick} className={`relative w-full flex items-center gap-3 px-3.5 h-12 py-0 shrink-0 rounded-xl text-sm font-bold transition-all duration-200 text-violet-300 bg-violet-600/10 border border-violet-500/30 overflow-hidden group shadow-[0_0_10px_rgba(139,92,246,0.1)] hover:shadow-[0_0_20px_rgba(139,92,246,0.25)] ${className} active:scale-95`}>
      <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" style={{ background: 'radial-gradient(70px circle at var(--x, 50%) var(--y, 50%), rgba(167, 139, 250, 0.3), transparent)' }} />
      <div className="relative z-10 w-10 h-10 flex items-center justify-center shrink-0 text-violet-400">
        <ZsevenAiIcon className="w-10 h-10 text-violet-400" />
      </div>
      <span className="relative z-10 tracking-wide">{label}</span>
    </button>
  )
}

function PremiumBtn({ label, onClick }: { label: string, onClick: () => void }) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    btnRef.current.style.setProperty('--x', `${e.clientX - rect.left}px`)
    btnRef.current.style.setProperty('--y', `${e.clientY - rect.top}px`)
  }
  return (
    <button ref={btnRef} onMouseMove={handleMouseMove} onClick={onClick} className="relative w-full flex items-center gap-3 px-3.5 h-12 py-0 shrink-0 rounded-xl text-sm font-bold transition-all duration-200 text-violet-300 bg-violet-600/10 border border-violet-500/30 overflow-hidden group shadow-[0_0_10px_rgba(139,92,246,0.1)] hover:shadow-[0_0_20px_rgba(139,92,246,0.25)] mt-2 active:scale-95">
      <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" style={{ background: 'radial-gradient(70px circle at var(--x, 50%) var(--y, 50%), rgba(167, 139, 250, 0.3), transparent)' }} />
      <div className="relative z-10 w-10 h-10 flex items-center justify-center shrink-0 text-violet-400">
        <DollarSign className="w-5 h-5 text-violet-400" />
      </div>
      <span className="relative z-10 tracking-wide">{label}</span>
    </button>
  )
}

function LanguageSelector({ lang, setLang, t, dropDirection = 'down' }: { lang: Language, setLang: (l: Language) => void, t: any, dropDirection?: 'up' | 'down' }) {
  const [isOpen, setIsOpen] = useState(false)
  const langDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex flex-col gap-2 relative" ref={langDropdownRef}>
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t.language}</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-violet-800/50 bg-[#12132e] text-violet-200 hover:border-violet-500 transition-all text-xs font-semibold min-w-[190px] shadow-sm active:scale-95"
        >
          <div className="flex items-center gap-2">
            <Globe size={15} className="text-violet-400" />
            <span>{lang === 'pt' ? t.ptBr : t.enUs}</span>
          </div>
          <ChevronDown size={15} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-violet-400' : 'text-muted-foreground'}`} />
        </button>

        {isOpen && (
          <div className={`absolute ${dropDirection === 'down' ? 'top-full mt-2' : 'bottom-full mb-2'} left-0 w-full rounded-xl border border-violet-700/60 bg-[#161838] shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 p-1.5 flex flex-col gap-1`}>
            <button
              type="button"
              onClick={() => {
                setLang('pt')
                setIsOpen(false)
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-colors ${lang === 'pt' ? 'bg-violet-600 text-white font-semibold' : 'text-slate-300 hover:bg-violet-900/40 hover:text-white'}`}
            >
              <span>{t.ptBr}</span>
              {lang === 'pt' && <CheckCircle2 size={14} className="text-white" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setLang('en')
                setIsOpen(false)
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-colors ${lang === 'en' ? 'bg-violet-600 text-white font-semibold' : 'text-slate-300 hover:bg-violet-900/40 hover:text-white'}`}
            >
              <span>{t.enUs}</span>
              {lang === 'en' && <CheckCircle2 size={14} className="text-white" />}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// -------------------------------------------------------------------------------------------------
// COMPONENTE: VISÃO GERAL EXECUTIVA & OPERACIONAL (ADMIN)
// -------------------------------------------------------------------------------------------------
function OverviewModule({ 
  t, 
  logs, 
  setLogs, 
  scriptLines, 
  setScriptLines, targetRouterIp, targetRouterModel, defaultLogFilter, trPeriodicInform, trAcsUrl, onRefresh
}: { 
  t: any
  logs: LogEntry[]
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>
  scriptLines: string[]
  targetRouterIp: string
  targetRouterModel: string
  defaultLogFilter: string
  trPeriodicInform: boolean
  trAcsUrl: string
  onRefresh: (data: unknown) => void
  setScriptLines: React.Dispatch<React.SetStateAction<string[]>>
}) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [logFilter, setLogFilter] = useState(defaultLogFilter)
  useEffect(() => setLogFilter(defaultLogFilter), [defaultLogFilter])
  const [pingData, setPingData] = useState([18, 22, 19, 21, 20, 24, 19, 20])
  const [marketCdnWave, setMarketCdnWave] = useState([65, 50, 80, 45, 65, 90, 60, 85, 70])
  const [marketWave, setMarketWave] = useState([45, 60, 50, 80, 75, 110, 95, 130, 120])
  const [marketBarData, setMarketBarData] = useState([35, 55, 75, 45, 95, 120, 110])

  useEffect(() => {
    let time = 0

    const loop = () => {
      if (!desktopChartMotionAllowed()) return
      time += 0.55
      setMarketCdnWave(prev => prev.map((_, idx) => Math.round(60 + Math.cos(time * .73 + idx * 1.3) * 28)))
      setPingData(prev => prev.map((val, idx) => Math.round(20 + Math.sin(time + idx * 0.8) * 3)))
      setMarketWave(prev => prev.map((val, idx) => Math.round(80 + Math.sin(time * 1.3 + idx) * 25)))
      setMarketBarData(prev => prev.map((val, idx) => Math.round(70 + Math.cos(time * 1.1 + idx) * 30)))
    }

    const timer = setInterval(loop, 750)
    return () => clearInterval(timer)
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setPingData(prev => prev.map(() => Math.floor(Math.random() * 10) + 16))
      setMarketWave(prev => prev.map(() => Math.floor(Math.random() * 60) + 60))
      setMarketBarData(prev => prev.map(() => Math.floor(Math.random() * 80) + 40))

      const now = new Date().toISOString().replace('T', ' ').substring(0, 19)
      const newEntry: LogEntry = {
        id: `#0${Math.floor(Math.random() * 900) + 100}`,
        time: now,
        tech: 'ZTE Fleet',
        type: '0xFF' + Math.floor(Math.random() * 90 + 10),
        desc: t.manualSyncLog,
        size: '1083',
        user: 'Técnicos'
      }
      setLogs(prev => [newEntry, ...prev.slice(0, 7)])
      onRefresh({ targetRouterIp, targetRouterModel, latestLog: newEntry })
      setIsRefreshing(false)
    }, 500)
  }

  const getMiniSpline = (pts: number[], w = 120, h = 40, max = 35) => {
    const step = w / (pts.length - 1)
    return pts.reduce((acc, val, i) => {
      const x = i * step
      const y = h - (val / max) * h
      if (i === 0) return `M ${x} ${y}`
      const prevX = (i - 1) * step
      const prevY = h - (pts[i - 1] / max) * h
      const cx1 = prevX + (x - prevX) / 2
      return `${acc} C ${cx1} ${prevY}, ${cx1} ${y}, ${x} ${y}`
    }, '')
  }

  const getAreaSpline = (pts: number[], w = 320, h = 100, max = 150) => {
    const step = w / (pts.length - 1)
    return pts.reduce((acc, val, i) => {
      const x = i * step
      const y = h - (val / max) * h
      if (i === 0) return `M ${x} ${y}`
      const prevX = (i - 1) * step
      const prevY = h - (pts[i - 1] / max) * h
      const cx1 = prevX + (x - prevX) / 2
      return `${acc} C ${cx1} ${prevY}, ${cx1} ${y}, ${x} ${y}`
    }, '')
  }

  const filteredLogs = logs.filter(l => 
    l.desc.toLowerCase().includes(logFilter.toLowerCase()) ||
    l.user.toLowerCase().includes(logFilter.toLowerCase()) ||
    l.tech.toLowerCase().includes(logFilter.toLowerCase())
  )

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 font-sans">
      {/* 1. CABEÇALHO DE DISPOSITIVOS E KPIS (EM PORTUGUÊS) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-stretch">
        <div className="rounded-2xl border border-violet-900/40 bg-[#0c0d1c]/95 p-4 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t.deviceModel}</span>
          <p className="font-bold text-sm text-white mt-1">{targetRouterModel}</p>
          <span className="text-[10px] text-violet-400 font-mono mt-2">v2.10.10</span>
        </div>

        <div className="rounded-2xl border border-violet-900/40 bg-[#0c0d1c]/95 p-4 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t.wanIpLabel}</span>
          <p className="font-mono text-xs sm:text-sm font-semibold text-white mt-1">{targetRouterIp}</p>
          <span className="text-[10px] text-emerald-400 font-medium mt-2">{t.connectedStatus}</span>
        </div>

        <div className="rounded-2xl border border-violet-900/40 bg-[#0c0d1c]/95 p-4 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t.uptimeLabel}</span>
          <p className="font-mono text-sm font-bold text-white mt-1">14d 08h</p>
          <span title={trAcsUrl} className="text-[10px] text-muted-foreground mt-2">{trPeriodicInform ? t.tr069ActiveStatus : `TR069 · ${t.off}`}</span>
        </div>

        <div className="rounded-2xl border border-violet-900/40 bg-[#0c0d1c]/95 p-4 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t.httpTestLabel}</span>
            <ArrowUp size={14} className="text-cyan-400" />
          </div>
          <p className="font-mono text-lg font-black text-cyan-400 mt-1">92 <span className="text-xs font-normal text-slate-400">Mbps</span></p>
          <div className="w-full h-5 mt-1 overflow-hidden">
            <svg viewBox="0 0 120 40" className="w-full h-full">
              <path d={getMiniSpline([20, 25, 22, 28, 30, 27, 32], 120, 40, 35)} fill="none" stroke="#38bdf8" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <div className="rounded-2xl border border-violet-900/40 bg-[#0c0d1c]/95 p-4 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t.pingTestLabel}</span>
            <Activity size={14} className="text-emerald-400 animate-pulse" />
          </div>
          <p className="font-mono text-lg font-black text-emerald-400 mt-1">{pingData[pingData.length - 1]} <span className="text-xs font-normal text-slate-400">ms</span></p>
          <div className="w-full h-5 mt-1 overflow-hidden">
            <svg viewBox="0 0 120 40" className="w-full h-full">
              <path d={getMiniSpline(pingData, 120, 40, 30)} fill="none" stroke="#10b981" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <div className="rounded-2xl border border-violet-900/40 bg-[#0c0d1c]/95 p-4 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t.speedRateLabel}</span>
            <Zap size={14} className="text-violet-400" />
          </div>
          <p className="font-mono text-lg font-black text-violet-400 mt-1">92 <span className="text-xs font-normal text-slate-400">Mbps</span></p>
          <div className="w-full h-5 mt-1 overflow-hidden">
            <svg viewBox="0 0 120 40" className="w-full h-full">
              <path d={getMiniSpline([15, 20, 18, 25, 22, 29, 31], 120, 40, 35)} fill="none" stroke="#8b5cf6" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. VISUALIZADOR DE LOGS E SCRIPTS (EM PORTUGUÊS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 rounded-3xl border border-violet-900/40 bg-[#0c0d1c]/95 p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/30 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <FileText size={16} />
              </div>
              <h3 className="font-bold text-white text-base tracking-tight">{t.logViewerTitle}</h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-slate-500" />
                <input
                  type="text"
                  value={logFilter}
                  onChange={e => setLogFilter(e.target.value)}
                  placeholder={t.filterLogPlaceholder}
                  className="h-8 w-44 rounded-xl border border-border bg-[#05060f] pl-8 pr-3 text-xs text-white outline-none focus:border-violet-500"
                />
              </div>
              <button 
                type="button" 
                onClick={() => setLogFilter('')}
                className="p-1.5 rounded-lg border border-border text-slate-400 hover:text-white transition-colors"
                title={t.clearFilter}
              >
                <Filter size={14} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-border/30 text-slate-400 font-mono text-[11px]">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">{t.colDateTime}</th>
                  <th className="py-2.5 px-3">{t.colTech}</th>
                  <th className="py-2.5 px-3">{t.colUser}</th>
                  <th className="py-2.5 px-3">{t.colType}</th>
                  <th className="py-2.5 px-3">{t.colDesc}</th>
                  <th className="py-2.5 px-3 text-right">{t.colSize}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10 font-sans">
                {filteredLogs.map((item, idx) => (
                  <tr key={item.id + idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-500">{String(idx + 1).padStart(2, '0')}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{item.time}</td>
                    <td className="py-2.5 px-3 font-medium text-cyan-400">{item.tech}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{item.user}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-violet-400">{item.type}</td>
                    <td className="py-2.5 px-3 text-slate-300 truncate max-w-[160px]">{item.desc}</td>
                    <td className="py-2.5 px-3 font-mono text-right text-slate-400">{item.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-3 mt-3 border-t border-border/20 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>{t.showingEvents(filteredLogs.length)}</span>
            <span className="text-emerald-400">{t.liveBackgroundSync}</span>
          </div>
        </div>

        <div className="rounded-3xl border border-violet-900/40 bg-[#090b16]/95 p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between font-mono">
          <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Code2 size={16} className="text-violet-400" />
              <h3 className="font-bold text-white text-xs tracking-tight">{t.logDescriptionTitle}</h3>
            </div>
            <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="flex-1 bg-[#05060f]/90 rounded-2xl p-4 border border-border/40 text-[11px] text-slate-300 leading-relaxed overflow-y-auto max-h-[220px] custom-scrollbar space-y-1 select-text">
            {scriptLines.map((line, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-slate-600 select-none">{i + 1}</span>
                <span className={line.startsWith('//') ? 'text-slate-500 italic' : line.includes('import') || line.includes('const') ? 'text-violet-400' : 'text-slate-200'}>
                  {line}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-border/20 text-[10px] text-slate-500 flex items-center justify-between">
            <span>{t.asyncThreadRunning}</span>
            <span className="text-violet-400">Node v20.x</span>
          </div>
        </div>
      </div>

      {/* 3. CARD DE MÉTRICAS DE REDE / MERCADO (EM PORTUGUÊS) */}
      <div className="w-full rounded-3xl border border-violet-900/40 bg-[#0c0d1c]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/30 pb-5 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">{t.marketMetricsTitle}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t.marketMetricsDesc}</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono font-semibold">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
              <span className="text-slate-300">{t.transitIp}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
              <span className="text-slate-300">{t.cdnCache}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="flex flex-col gap-2">
            <DesktopChartStyles /><span className="text-xs font-semibold text-slate-300">{t.backboneOutput}</span><span className="text-[10px] text-muted-foreground">Simulação / Simulation · Gbps</span>
            <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2 bg-[#05060f]/60 rounded-2xl border border-border/30">
              {marketBarData.map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[9px] font-mono text-amber-300">{(val / 10).toFixed(1)}G</span><div 
                    className="desktop-chart-fill w-full rounded-t-lg bg-gradient-to-t from-violet-600 via-fuchsia-500 to-amber-400 transition-all duration-700"
                    style={{ height: `${(val / 140) * 70}%` }}
                  />
                  <span className="text-[9px] font-mono text-slate-500">{`R${idx + 1}`}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-300">{t.livePeeringThroughput} · {(marketWave[8]/10).toFixed(1)} / {(marketCdnWave[8]/10).toFixed(1)} Gbps</span>
            <div className="h-32 w-full bg-[#05060f]/60 rounded-2xl border border-border/30 p-2 relative overflow-hidden flex items-center">
              <svg viewBox="0 0 320 100" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="marketGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path className="desktop-chart-path" d={`${getAreaSpline(marketWave, 320, 100, 140)} L 320 100 L 0 100 Z`} fill="url(#marketGrad)" />
                <path className="desktop-chart-path" d={getAreaSpline(marketWave, 320, 100, 140)} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                <path className="desktop-chart-path" d={`${getAreaSpline(marketCdnWave, 320, 100, 140)} L320 100 L0 100Z`} fill="#f59e0b" opacity=".12" />
                <path className="desktop-chart-path" d={getAreaSpline(marketCdnWave, 320, 100, 140)} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                {[marketWave, marketCdnWave].map((wave, series) => wave.map((value,i) => <circle key={series+'-'+i} cx={i*40} cy={100-value/140*100} r="2" fill={series ? '#f59e0b' : '#38bdf8'} className="transition-all duration-700 desktop-chart-pulse" />))}
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg shadow-violet-900/40 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          <span>{t.refreshBtn}</span>
        </button>
      </div>

    </div>
  )
}

// -------------------------------------------------------------------------------------------------
// COMPONENTE: GRÁFICO RESUMO DO SISTEMA (AUTOMAÇÕES)
// -------------------------------------------------------------------------------------------------
function SystemSummaryChart({ t, onRefresh, initialSnapshot }: { t: any; onRefresh?: (data: unknown) => void; initialSnapshot?: any }) {
  const [basePoints, setBasePoints] = useState<{ time: string; hourLabel: string; total: number; completed: number; failures: number }[]>(() => Array.isArray(initialSnapshot) && initialSnapshot.length > 1 ? initialSnapshot : [
    { time: '00h', hourLabel: '00:00', total: 28, completed: 18, failures: 1 },
    { time: '02h', hourLabel: '02:00', total: 38, completed: 25, failures: 2 },
    { time: '04h', hourLabel: '04:00', total: 52, completed: 35, failures: 3 },
    { time: '07h', hourLabel: '07:00', total: 68, completed: 58, failures: 5 },
    { time: '10h', hourLabel: '10:00', total: 72, completed: 59, failures: 4 },
    { time: '13h', hourLabel: '13:00', total: 70, completed: 55, failures: 3 },
    { time: '16h', hourLabel: '16:00', total: 74, completed: 62, failures: 4 },
    { time: '18h', hourLabel: '18:00', total: 87, completed: 81, failures: 6 },
    { time: '21h', hourLabel: '21:00', total: 82, completed: 69, failures: 5 },
    { time: '24h', hourLabel: '24:00', total: 94, completed: 78, failures: 8 },
  ])

  const [dataPoints, setDataPoints] = useState(basePoints)
  const [hoverIndex, setHoverIndex] = useState<number>(6)
  const [entryProgress, setEntryProgress] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const entryTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const triggerAnimation = () => {
    if (entryTimer.current !== null) clearInterval(entryTimer.current)
    setEntryProgress(0)
    const start = Date.now()
    entryTimer.current = setInterval(() => {
      const progress = Math.min((Date.now() - start) / 1200, 1)
      setEntryProgress(1 - Math.pow(1 - progress, 3))
      if (progress === 1 && entryTimer.current !== null) { clearInterval(entryTimer.current); entryTimer.current = null }
    }, 900)
  }
  useEffect(() => {
    triggerAnimation()
    return () => { if (entryTimer.current !== null) clearInterval(entryTimer.current) }
  }, [])

  useEffect(() => {
    const startTime = Date.now()

    const liveTick = () => {
      const elapsedSec = (Date.now() - startTime) / 1000

      setDataPoints(
        basePoints.map((p, idx) => {
          const wave = Math.sin(elapsedSec * 1.5 + idx * 0.8) * 1.8
          const waveSmall = Math.cos(elapsedSec * 1.2 + idx * 0.5) * 0.4

          const newTotal = Math.max(15, Math.round(p.total + wave))
          const newCompleted = Math.max(10, Math.min(newTotal - 2, Math.round(p.completed + wave * 0.85)))
          const newFailures = Math.max(0, Math.round(p.failures + waveSmall))

          return {
            ...p,
            total: newTotal,
            completed: newCompleted,
            failures: newFailures
          }
        })
      )

    }

    const timer = setInterval(liveTick, 900)
    return () => clearInterval(timer)
  }, [basePoints])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      const next = basePoints.map(point => ({ ...point, total: point.total + 1, completed: point.completed + 1 }))
      setBasePoints(next); setDataPoints(next); onRefresh?.(next)
      triggerAnimation()
      setIsRefreshing(false)
    }, 500)
  }

  const width = 800
  const height = 300
  const paddingX = 45
  const paddingTop = 25
  const paddingBottom = 45
  const chartW = width - paddingX * 2
  const chartH = height - paddingTop - paddingBottom
  const maxY = 120

  const getX = (i: number) => paddingX + (i / (dataPoints.length - 1)) * chartW
  const getY = (val: number) => {
    const animatedVal = val * entryProgress
    return paddingTop + chartH - (animatedVal / maxY) * chartH
  }

  const createSplinePath = (key: 'total' | 'completed' | 'failures') => {
    return dataPoints.reduce((acc, point, i, arr) => {
      const x = getX(i)
      const y = getY(point[key])
      if (i === 0) return `M ${x} ${y}`
      const prevX = getX(i - 1)
      const prevY = getY(arr[i - 1][key])
      const cx1 = prevX + (x - prevX) / 2
      const cx2 = cx1
      return `${acc} C ${cx1} ${prevY}, ${cx2} ${y}, ${x} ${y}`
    }, '')
  }

  const activePoint = dataPoints[hoverIndex] || dataPoints[6]
  const activeX = getX(hoverIndex)

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-5 font-sans">
      <div className="w-full rounded-3xl border border-violet-900/40 bg-[#0c0d1c]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/30 mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-md">
              <Activity size={20} className="animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{t.systemSummaryTitle}</h2>
          </div>

          <div className="flex items-center gap-5 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-slate-300">{t.completedLegend}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#f43f5e] shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
              <span className="text-slate-300">{t.failuresLegend}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#8b5cf6] shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
              <span className="text-slate-300">{t.totalLegend}</span>
            </div>
          </div>
        </div>

        <div className="relative w-full overflow-hidden select-none">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {[120, 90, 60, 30, 0].map((val) => {
              const y = paddingTop + chartH - (val / maxY) * chartH
              return (
                <g key={val}>
                  <text x="10" y={y + 4} fill="#64748b" fontSize="12" fontFamily="monospace">
                    {val}
                  </text>
                  <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#1e293b" strokeDasharray={val === 0 ? "none" : "3 4"} strokeWidth="1" />
                </g>
              )
            })}

            {['00h', '04h', '08h', '12h', '16h', '20h', '24h'].map((label, idx, arr) => {
              const x = paddingX + (idx / (arr.length - 1)) * chartW
              return (
                <g key={label}>
                  <line x1={x} y1={paddingTop} x2={x} y2={paddingTop + chartH} stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />
                  <text x={x} y={height - 12} textAnchor="middle" fill="#64748b" fontSize="12" fontFamily="monospace">
                    {label}
                  </text>
                </g>
              )
            })}

            <line
              x1={activeX}
              y1={paddingTop}
              x2={activeX}
              y2={paddingTop + chartH}
              stroke="#475569"
              strokeDasharray="2 2"
              strokeWidth="1.5"
              className="transition-all duration-75"
            />

            <path d={`${createSplinePath('total')} L ${getX(dataPoints.length - 1)} ${paddingTop + chartH} L ${getX(0)} ${paddingTop + chartH} Z`} fill="url(#totalGrad)" />
            <path d={`${createSplinePath('completed')} L ${getX(dataPoints.length - 1)} ${paddingTop + chartH} L ${getX(0)} ${paddingTop + chartH} Z`} fill="url(#completedGrad)" />

            <path d={createSplinePath('total')} fill="none" stroke="#8b5cf6" strokeWidth="3.5" strokeLinecap="round" />
            <path d={createSplinePath('completed')} fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
            <path d={createSplinePath('failures')} fill="none" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" />

            {dataPoints.map((p, i) => {
              const x = getX(i)
              const yTotal = getY(p.total)
              const yComp = getY(p.completed)
              const yFail = getY(p.failures)
              const isSelected = i === hoverIndex

              return (
                <g key={i} className="cursor-pointer" onMouseEnter={() => setHoverIndex(i)}>
                  <circle cx={x} cy={yTotal} r={isSelected ? 5.5 : 4} fill="#8b5cf6" stroke="#0c0d1c" strokeWidth={isSelected ? 3 : 2} />
                  <circle cx={x} cy={yComp} r={isSelected ? 5.5 : 4} fill="#10b981" stroke="#0c0d1c" strokeWidth={isSelected ? 3 : 2} />
                  <circle cx={x} cy={yFail} r={isSelected ? 5.5 : 4} fill="#f43f5e" stroke="#0c0d1c" strokeWidth={isSelected ? 3 : 2} />
                  <rect x={x - 20} y={paddingTop} width={40} height={chartH} fill="transparent" />
                </g>
              )
            })}

            <circle cx={activeX} cy={getY(activePoint.failures)} r="4.5" fill="#ffffff" stroke="#f43f5e" strokeWidth="2" />
          </svg>

          <div 
            className="absolute pointer-events-none transition-all duration-150 ease-out z-20"
            style={{
              left: `${((activeX - 10) / width) * 100}%`,
              top: `${((getY(activePoint.total) - 20) / height) * 100}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="rounded-2xl border border-slate-700/80 bg-[#090b16]/95 backdrop-blur-xl p-3.5 shadow-[0_10px_25px_rgba(0,0,0,0.7)] text-xs min-w-[130px] flex flex-col gap-1.5 font-sans">
              <span className="font-bold text-white text-xs border-b border-slate-800 pb-1">{activePoint.hourLabel}</span>
              <div className="flex items-center justify-between text-violet-400 font-bold">
                <span>{t.totalLegend}:</span>
                <span className="font-mono text-white text-sm">{activePoint.total}</span>
              </div>
              <div className="flex items-center justify-between text-[#10b981] font-semibold">
                <span>{t.completedLegend}:</span>
                <span className="font-mono text-white">{activePoint.completed}</span>
              </div>
              <div className="flex items-center justify-between text-[#f43f5e] font-semibold">
                <span>{t.failuresLegend}:</span>
                <span className="font-mono text-white">{activePoint.failures}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg shadow-violet-900/40 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          <span>{t.refreshBtn}</span>
        </button>
      </div>
    </div>
  )
}

// -------------------------------------------------------------------------------------------------
// COMPONENTE: TABELA DE OPERAÇÕES EM ANDAMENTO (MONITORAMENTO)
// -------------------------------------------------------------------------------------------------
function MonitoringModule({ t, onRefresh, initialSnapshot }: { t: any; onRefresh?: (data: unknown) => void; initialSnapshot?: any }) {
  const initialOperations: MonitorOperation[] = [
    { id: '#000184', user: 'Técnicos', equipment: 'ZTE F6600P', action: 'Atualizando firmware', start: '18:21', time: '02:31', status: 'Em andamento' },
    { id: '#000183', user: 'NOC', equipment: 'ZTE F673AV9', action: 'Configurando Wi-Fi', start: '18:12', time: '10:24', status: 'Em andamento' },
    { id: '#000182', user: 'Suporte', equipment: 'ZTE F680', action: 'Aplicando DNS', start: '18:08', time: '14:15', status: 'Em andamento' },
    { id: '#000181', user: 'Técnicos', equipment: 'ZTE F6600P', action: 'Config. padrão', start: '17:56', time: '25:32', status: 'Em andamento' },
    { id: '#000180', user: 'Almoxarifado', equipment: 'ZTE F601', action: 'Validando config.', start: '17:48', time: '33:12', status: 'Em andamento' },
  ]

  const [operations, setOperations] = useState<MonitorOperation[]>(() => Array.isArray(initialSnapshot) ? initialSnapshot : initialOperations)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      const equipments = ['ZTE F6600P', 'ZTE F673AV9', 'ZTE F680', 'ZTE F601', 'ZTE ZXHN F670L']
      const actions = ['Atualizando firmware', 'Configurando Wi-Fi', 'Aplicando DNS', 'Config. padrão', 'Validando config.', 'Provisionando TR069']
      const admins = ['Técnicos', 'NOC', 'Suporte', 'Almoxarifado', 'Engenharia']

      const randomBaseId = Math.floor(Math.random() * 800) + 200

      const newOps: MonitorOperation[] = Array.from({ length: 5 }).map((_, index) => {
        const idNum = String(randomBaseId - index).padStart(6, '0')
        const randomAdmin = admins[Math.floor(Math.random() * admins.length)]
        const randomEq = equipments[Math.floor(Math.random() * equipments.length)]
        const randomAct = actions[Math.floor(Math.random() * actions.length)]
        const startMin = Math.floor(Math.random() * 45) + 10
        const startHour = Math.floor(Math.random() * 4) + 17
        const minTime = Math.floor(Math.random() * 35) + 1
        const secTime = Math.floor(Math.random() * 59)

        return {
          id: `#${idNum}`,
          user: randomAdmin,
          equipment: randomEq,
          action: randomAct,
          start: `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`,
          time: `${String(minTime).padStart(2, '0')}:${String(secTime).padStart(2, '0')}`,
          status: 'Em andamento'
        }
      })

      setOperations(newOps)
      onRefresh?.(newOps)
      setIsRefreshing(false)
    }, 600)
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-5">
      <div className="w-full rounded-3xl border border-violet-900/40 bg-[#0c0d1c]/95 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="p-6 sm:p-7 flex items-center justify-between border-b border-border/30 bg-[#0a0b18]">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-md">
              <Shield size={20} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{t.ongoingOperationsTitle}</h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button type="button" className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">
              {t.seeAll}
            </button>
            <span className="size-6 rounded-full bg-violet-600/30 border border-violet-500/40 text-violet-300 font-bold font-mono text-xs flex items-center justify-center shadow-inner">
              {operations.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-border/30 text-slate-400 font-semibold bg-slate-900/30">
                <th className="py-4 px-6 font-mono text-xs uppercase tracking-wider">{t.colId}</th>
                <th className="py-4 px-6">{t.colUser}</th>
                <th className="py-4 px-6">{t.colEquipment}</th>
                <th className="py-4 px-6">{t.colAction}</th>
                <th className="py-4 px-6 font-mono text-xs">{t.colStart}</th>
                <th className="py-4 px-6 font-mono text-xs">{t.colTime}</th>
                <th className="py-4 px-6 text-center">{t.colStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 font-sans">
              {operations.map((op) => (
                <tr key={op.id} className="hover:bg-violet-950/20 transition-colors">
                  <td className="py-4 px-6 font-mono font-medium text-slate-400">{op.id}</td>
                  <td className="py-4 px-6 font-semibold text-white">{op.user}</td>
                  <td className="py-4 px-6 text-slate-300 font-mono text-xs">{op.equipment}</td>
                  <td className="py-4 px-6 text-slate-300">{op.action}</td>
                  <td className="py-4 px-6 font-mono text-xs text-slate-400">{op.start}</td>
                  <td className="py-4 px-6 font-mono text-xs text-slate-300">{op.time}</td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-medium text-xs shadow-sm">
                      <span className="size-3.5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent inline-block shrink-0" />
                      <span>{t.inProgress}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg shadow-violet-900/40 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          <span>{t.refreshMonitoring}</span>
        </button>
      </div>
    </div>
  )
}

// -------------------------------------------------------------------------------------------------
// COMPONENTE: GRÁFICO DE PIZZA / ROSCA (STATUS GERAL) - ADMIN
// -------------------------------------------------------------------------------------------------
function GeneralStatusPieChart({ t, onRefresh, initialSnapshot }: { t: any; onRefresh?: (data: unknown) => void; initialSnapshot?: any }) {
  const initialData = [
    { id: 'active', label: t.activeContracts, count: 7778, color: '#38bdf8' },
    { id: 'inactive', label: t.inactiveContracts, count: 893, color: '#eab308' },
    { id: 'suspended', label: t.suspendedContracts, count: 375, color: '#ef4444' },
  ]

  const [data, setData] = useState<typeof initialData>(() => Array.isArray(initialSnapshot) && initialSnapshot.length === 3 ? initialSnapshot : initialData)
  useEffect(() => { setData(prev => prev.map(entry => ({ ...entry, label: entry.id === 'active' ? t.activeContracts : entry.id === 'inactive' ? t.inactiveContracts : t.suspendedContracts }))) }, [t.activeContracts, t.inactiveContracts, t.suspendedContracts])
  const [hoveredSlice, setHoveredSlice] = useState<any | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [animationProgress, setAnimationProgress] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const triggerEntryAnimation = () => {
    setAnimationProgress(0)
    let start: number | null = null
    const duration = 1100

    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setAnimationProgress(ease)

      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }

  useEffect(() => {
    triggerEntryAnimation()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      const randomDelta1 = Math.floor(Math.random() * 60) - 25
      const randomDelta2 = Math.floor(Math.random() * 20) - 10
      const randomDelta3 = Math.floor(Math.random() * 16) - 8

      const next = [
        { id: 'active', label: t.activeContracts, count: 7778 + randomDelta1, color: '#38bdf8' },
        { id: 'inactive', label: t.inactiveContracts, count: 893 + randomDelta2, color: '#eab308' },
        { id: 'suspended', label: t.suspendedContracts, count: 375 + randomDelta3, color: '#ef4444' },
      ]
      setData(next); onRefresh?.(next)
      triggerEntryAnimation()
      setIsRefreshing(false)
    }, 500)
  }

  const totalCount = data.reduce((acc, cur) => acc + cur.count, 0)
  const cx = 150
  const cy = 150
  const radius = 110

  let currentAngle = -90

  const slices = data.map((item) => {
    const sliceAngle = (item.count / totalCount) * 360 * animationProgress
    const startAngle = currentAngle
    const endAngle = currentAngle + sliceAngle
    currentAngle += sliceAngle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = cx + radius * Math.cos(startRad)
    const y1 = cy + radius * Math.sin(startRad)
    const x2 = cx + radius * Math.cos(endRad)
    const y2 = cy + radius * Math.sin(endRad)

    const largeArc = sliceAngle > 180 ? 1 : 0

    const pathData = sliceAngle >= 359.99
      ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius} Z`
      : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`

    return {
      ...item,
      pathData,
      percentage: ((item.count / totalCount) * 100).toFixed(1),
    }
  })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-5 font-sans">
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="w-full rounded-3xl border border-violet-900/40 bg-[#0c0d1c]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
      >
        <div className="flex items-center justify-between pb-5 border-b border-border/30 mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-md">
              <PieChart size={20} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{t.generalStatusTitle}</h2>
              <p className="text-xs text-muted-foreground">{t.contractsSubtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-slate-700/60 bg-slate-900/40 text-slate-300 hover:text-white hover:border-violet-500 transition-all shadow-sm active:scale-95"
            title={t.refreshBtn}
          >
            <RefreshCw size={17} className={isRefreshing ? "animate-spin text-violet-400" : ""} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-around gap-8 py-2">
          <div className="flex flex-col gap-3 min-w-[200px]">
            {slices.map((slice) => {
              const isHovered = hoveredSlice?.id === slice.id
              return (
                <div
                  key={slice.id}
                  onMouseEnter={() => setHoveredSlice(slice)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  className={`flex items-center gap-3 px-3.5 py-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    isHovered ? 'bg-white/10 scale-105' : 'hover:bg-white/5'
                  }`}
                >
                  <span 
                    className="size-3.5 rounded-full shrink-0 shadow-md"
                    style={{ backgroundColor: slice.color, boxShadow: `0 0 10px ${slice.color}80` }} 
                  />
                  <div className="flex items-center justify-between w-full text-xs font-semibold">
                    <span className="text-slate-200">{slice.label}</span>
                    <span className="font-mono text-slate-400 ml-4">{slice.count.toLocaleString()}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="relative size-[280px] sm:size-[300px] flex items-center justify-center select-none">
            <svg viewBox="0 0 300 300" className="size-full overflow-visible">
              <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.35" />
              </filter>

              {slices.map((slice) => {
                const isHovered = hoveredSlice?.id === slice.id
                return (
                  <path
                    key={slice.id}
                    d={slice.pathData}
                    fill={slice.color}
                    filter="url(#pieShadow)"
                    className="cursor-pointer transition-all duration-300 ease-out"
                    style={{
                      transformOrigin: '150px 150px',
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                      opacity: hoveredSlice && !isHovered ? 0.65 : 1,
                    }}
                    onMouseEnter={() => setHoveredSlice(slice)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  />
                )
              })}
            </svg>

            <div className="absolute size-24 rounded-full bg-[#0c0d1c] border border-violet-900/60 shadow-inner flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t.totalLegend}</span>
              <span className="font-mono text-sm font-extrabold text-white">{totalCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-border/30 flex flex-col gap-2.5 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-border/10">
            <span className="font-semibold text-emerald-400">{t.activeClients}</span>
            <span className="font-mono font-bold text-slate-300">3.976</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-border/10">
            <span className="font-semibold text-[#38bdf8]">{t.activeContracts}</span>
            <span className="font-mono font-bold text-white">{data.find(d => d.id === 'active')?.count.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-border/10">
            <span className="font-semibold text-[#eab308]">{t.inactiveContracts}</span>
            <span className="font-mono font-bold text-slate-300">{data.find(d => d.id === 'inactive')?.count.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-border/10">
            <span className="font-semibold text-[#ef4444]">{t.suspendedContracts}</span>
            <span className="font-mono font-bold text-slate-300">{data.find(d => d.id === 'suspended')?.count.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 font-bold">
            <span className="text-slate-200">{t.totalContracts}</span>
            <span className="font-mono text-sm text-violet-400">{totalCount.toLocaleString()}</span>
          </div>
        </div>

        {hoveredSlice && (
          <div 
            className="absolute pointer-events-none z-30 transition-all duration-75 ease-out"
            style={{
              left: `${mousePos.x + 15}px`,
              top: `${mousePos.y - 45}px`,
            }}
          >
            <div className="rounded-xl border border-slate-300/80 bg-white text-slate-900 p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-xs min-w-[125px] flex flex-col font-sans animate-in fade-in zoom-in-95 duration-150">
              <span className="font-bold text-slate-800 text-xs">{hoveredSlice.label}</span>
              <div className="flex items-center justify-between gap-3 text-slate-600 text-[11px] mt-0.5">
                <span>{t.contractsWord}</span>
                <strong className="font-mono text-slate-900 text-xs">{hoveredSlice.count.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg shadow-violet-900/40 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          <span>{t.refreshBtn}</span>
        </button>
      </div>
    </div>
  )
}

// -------------------------------------------------------------------------------------------------
// COMPONENTE: PAINEL DE ALERTAS OPERACIONAIS COM GRÁFICOS AO VIVO (ADMIN)
// -------------------------------------------------------------------------------------------------
function OperationalAlertsModule({ t, onRefresh, initialSnapshot }: { t: any; onRefresh?: (data: unknown) => void; initialSnapshot?: any }) {
  const initialAlerts = [
    { id: '1', title: 'Falha na atualização', subtitle: 'ZTE F6600P – Técnicos', time: '18:15', icon: AlertTriangle, color: 'bg-rose-500/20 text-rose-400 border-rose-500/40' },
    { id: '2', title: 'Agente offline', subtitle: 'Agente #03 – ZTE F673AV9', time: '17:42', icon: Radio, color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
    { id: '3', title: 'Muitas tentativas de login', subtitle: 'NOC (5 tentativas)', time: '16:08', icon: ShieldAlert, color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
    { id: '4', title: 'Configuração com erro', subtitle: 'ZTE F680', time: '14:32', icon: Settings, color: 'bg-rose-500/20 text-rose-400 border-rose-500/40' },
    { id: '5', title: 'Equipamento sem resposta', subtitle: 'ZTE F601', time: '12:11', icon: Shield, color: 'bg-orange-500/20 text-orange-400 border-orange-500/40' }
  ]

  const [alerts, setAlerts] = useState(() => Array.isArray(initialSnapshot) ? initialSnapshot.map((entry, index) => ({ ...entry, icon: initialAlerts[index % initialAlerts.length].icon })) : initialAlerts)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [onlineRate, setOnlineRate] = useState(94.4)
  const [trafficWave, setTrafficWave] = useState<number[]>([40, 80, 110, 85, 140, 190, 150, 230, 180])
  const [trafficWaveDownload, setTrafficWaveDownload] = useState<number[]>([60, 100, 130, 105, 160, 210, 170, 250, 200])

  useEffect(() => {
    let time = 0

    const loop = () => {
      if (!desktopChartMotionAllowed()) return
      time += 0.65

      setTrafficWave([
        Math.round(40 + Math.sin(time * 1.2) * 8),
        Math.round(80 + Math.cos(time * 1.5) * 12),
        Math.round(110 + Math.sin(time * 1.8) * 14),
        Math.round(85 + Math.cos(time * 1.3) * 10),
        Math.round(140 + Math.sin(time * 1.6) * 15),
        Math.round(190 + Math.cos(time * 1.4) * 18),
        Math.round(150 + Math.sin(time * 1.7) * 12),
        Math.round(230 + Math.cos(time * 1.2) * 20),
        Math.round(180 + Math.sin(time * 1.5) * 14),
      ])

      setTrafficWaveDownload([
        Math.round(60 + Math.cos(time * 1.1) * 9),
        Math.round(100 + Math.sin(time * 1.4) * 14),
        Math.round(130 + Math.cos(time * 1.7) * 16),
        Math.round(105 + Math.sin(time * 1.2) * 11),
        Math.round(160 + Math.cos(time * 1.5) * 17),
        Math.round(210 + Math.sin(time * 1.3) * 20),
        Math.round(170 + Math.cos(time * 1.6) * 13),
        Math.round(250 + Math.sin(time * 1.1) * 22),
        Math.round(200 + Math.cos(time * 1.4) * 16),
      ])

    }

    const timer = setInterval(loop, 700)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    let phase = 0
    const timer = setInterval(() => {
      if (!desktopChartMotionAllowed()) return
      phase += .6
      setOnlineRate(+(94.5 + Math.sin(phase) * .3).toFixed(1))
    }, 850)
    return () => clearInterval(timer)
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      const models = ['ZTE F6600P', 'ZTE F673AV9', 'ZTE F680', 'ZTE F601', 'ZTE ZXHN F670L']
      const admins = ['Técnicos', 'NOC', 'Suporte', 'Almoxarifado', 'Engenharia']

      const updated = alerts.map((a, i) => ({
        ...a,
        subtitle: `${models[Math.floor(Math.random() * models.length)]} – ${admins[i % admins.length]}`,
        time: `${18 - i}:${String(Math.floor(Math.random() * 50) + 10).padStart(2, '0')}`
      }))
      setAlerts(updated)
      onRefresh?.(updated.map(({ icon, ...entry }) => entry))
      setIsRefreshing(false)
    }, 550)
  }

  const getSpline = (pts: number[]) => {
    const step = 320 / (pts.length - 1)
    return pts.reduce((acc, val, i) => {
      const x = i * step
      const y = 140 - (val / 280) * 120
      if (i === 0) return `M ${x} ${y}`
      const prevX = (i - 1) * step
      const prevY = 140 - (pts[i - 1] / 280) * 120
      const cx1 = prevX + (x - prevX) / 2
      return `${acc} C ${cx1} ${prevY}, ${cx1} ${y}, ${x} ${y}`
    }, '')
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 font-sans"><DesktopChartStyles /><p className="text-xs text-muted-foreground">Telemetria ilustrativa / Illustrative telemetry</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="rounded-3xl border border-violet-900/40 bg-[#0c0d1c]/95 p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/30 pb-4 mb-4">
            <h3 className="font-bold text-white text-base tracking-tight">{t.deviceStatusOverview}</h3>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30">
              Total: 287
            </span>
          </div>

          <div className="flex items-center justify-around py-2">
            <div className="relative size-40 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#1e293b" strokeWidth="9" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="38" 
                  fill="transparent" 
                  stroke="#38bdf8" 
                  strokeWidth="9" 
                  strokeDasharray={`${onlineRate * 2.38} 238`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="38" 
                  fill="transparent" 
                  stroke="#f97316" 
                  strokeWidth="9" 
                  strokeDasharray={`${(98.6-onlineRate)*2.38} 238`}
                  strokeDashoffset={-onlineRate*2.38}
                  strokeLinecap="round"
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="38" 
                  fill="transparent" 
                  stroke="#fbbf24" 
                  strokeWidth="9" 
                  strokeDasharray="4 238"
                  strokeDashoffset={-98.6*2.38}
                  strokeLinecap="round"
                />
                <circle cx="50" cy="50" r="44" fill="none" stroke="#67e8f9" strokeWidth="2" strokeDasharray="25 252" className="desktop-chart-radar" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xl font-extrabold font-mono text-white">{onlineRate}%</span>
                <span className="text-[10px] text-cyan-300 uppercase tracking-wider font-semibold">{t.online}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="desktop-chart-pulse size-3 rounded-full bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]" />
                <span className="text-slate-200">{onlineRate.toFixed(1)}% {t.online}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="desktop-chart-pulse size-3 rounded-full bg-[#f97316] shadow-[0_0_8px_#f97316]" />
                <span className="text-slate-300">{(98.6-onlineRate).toFixed(1)}% {t.offline}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="desktop-chart-pulse size-3 rounded-full bg-[#fbbf24] shadow-[0_0_8px_#fbbf24]" />
                <span className="text-slate-400">1.4% {t.pending}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-violet-900/40 bg-[#0c0d1c]/95 p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/30 pb-4 mb-4">
            <div>
              <h3 className="font-bold text-white text-base tracking-tight">{t.networkTraffic}</h3>
              <p className="text-[10px] text-muted-foreground">{t.throughputLabel}</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              Last 2 hours
            </span>
          </div>

          <div className="relative w-full h-[140px] select-none">
            <svg viewBox="0 0 320 140" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="trafficGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {[120, 80, 40, 0].map(y => (
                <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="#1e293b" strokeDasharray="3 3" strokeWidth="0.8" />
              ))}

              <path className="desktop-chart-path" d={`${getSpline(trafficWave)} L 320 140 L 0 140 Z`} fill="url(#trafficGrad1)" />
              <path className="desktop-chart-path" d={getSpline(trafficWave)} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
              <path className="desktop-chart-path" d={getSpline(trafficWaveDownload)} fill="none" stroke="#818cf8" strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" opacity="0.8" />
              {[trafficWave, trafficWaveDownload].map((wave,i) => <circle key={i} r="3" fill={i ? '#818cf8' : '#38bdf8'} className="desktop-chart-packet"><animateMotion dur={i ? '4s' : '3s'} repeatCount="indefinite" path={getSpline(wave)} /></circle>)}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-border/20">
            <span>0 min</span>
            <span className="text-cyan-400">↓ {trafficWave[8]} / ↑ {trafficWaveDownload[8]} Mbps · Demo</span>
            <span>2 hours</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg shadow-violet-900/40 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
          <span>{t.refreshBtn}</span>
        </button>
      </div>

      <div className="w-full rounded-3xl border border-violet-900/40 bg-[#0c0d1c]/95 p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-border/30 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Bell size={18} />
            </div>
            <h3 className="font-bold text-white text-base tracking-tight">{t.alertsPanelTitle}</h3>
          </div>

          <button 
            type="button"
            onClick={handleRefresh}
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
          >
            {t.seeAll}
          </button>
        </div>

        <div className="flex flex-col divide-y divide-border/20">
          {alerts.map((item) => {
            const IconComponent = item.icon
            return (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-4 hover:bg-white/[0.02] px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`size-9 rounded-xl border flex items-center justify-center shrink-0 ${item.color}`}>
                    <IconComponent size={18} />
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-xs sm:text-sm text-white tracking-tight truncate">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground font-mono truncate">{item.subtitle}</p>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-slate-400 shrink-0">{item.time}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------------------------------------------
// COMPONENTE: USUÁRIOS E PERMISSÕES (ATIVIDADE RECENTE PADRONIZADA)
// -------------------------------------------------------------------------------------------------
function UsersAndPermsModule({ t }: { t: any }) {
  const [searchTerm, setSearchTerm] = useState('')

  const activities = [
    { id: '1', text: 'Técnicos iniciou configuração', detail: 'ZTE F6600P – 18:21', type: 'config', icon: Settings, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { id: '2', text: 'NOC atualizou firmware', detail: 'ZTE F673AV9 – 18:15', type: 'success', icon: CheckCircle2, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { id: '3', text: 'Suporte finalizou configuração', detail: 'ZTE F680 – 18:03', type: 'success', icon: CheckCircle2, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { id: '4', text: 'Sistema detectou falha na atualização', detail: 'ZTE F6600P – 17:58', type: 'error', icon: X, color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    { id: '5', text: 'Almoxarifado realizou login no sistema', detail: '192.168.1.10 – 17:42', type: 'user', icon: User, color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
    { id: '6', text: 'Tentativa de login bloqueada', detail: 'Usuário: Engenharia – 17:31', type: 'warn', icon: Shield, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  ]

  const filtered = activities.filter(a => 
    a.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.detail.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 font-sans">
      <div className="w-full rounded-3xl border border-violet-900/40 bg-[#0c0d1c]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/30 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-md">
              <UserCheck size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{t.recentActivityTitle}</h2>
              <p className="text-xs text-muted-foreground">{t.usersAndPerms}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar usuário..."
                className="h-9 w-48 rounded-xl border border-border bg-[#05060f] pl-8 pr-3 text-xs text-white outline-none focus:border-violet-500"
              />
            </div>
            <button 
              type="button" 
              onClick={() => setSearchTerm('')}
              className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
            >
              {t.seeAll}
            </button>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-border/20">
          {filtered.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`size-10 rounded-xl border flex items-center justify-center shrink-0 ${item.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-xs sm:text-sm text-white tracking-tight truncate">{item.text}</p>
                    <p className="text-[11px] text-muted-foreground font-mono truncate">{item.detail}</p>
                  </div>
                </div>

                <button 
                  type="button"
                  className="px-3 py-1.5 rounded-lg border border-slate-700/60 text-[11px] text-slate-300 hover:text-white hover:border-violet-500 hover:bg-violet-950/20 transition-all shrink-0"
                >
                  Verificar
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------------------------------------------
// APLICAÇÃO PRINCIPAL
// -------------------------------------------------------------------------------------------------

const automationSteps = {
  pt: [
      { pct: 5, text: 'Testando conectividade de rede com a ONT...', type: 'info', delay: 800 },
      { pct: 15, text: 'Ping 192.168.1.1: Sucesso (0.8ms response time)', type: 'success', delay: 1500 },
      { pct: 25, text: 'Autenticando sessão Telnet/SSH com credenciais seguras...', type: 'info', delay: 2300 },
      { pct: 35, text: 'Sessão aberta no roteador ZTE F6600P [User: admin]', type: 'success', delay: 3200 },
      { pct: 45, text: 'Obtendo snapshot da versão de Firmware atual (V2.10.10)...', type: 'info', delay: 4200 },
      { pct: 55, text: 'Enviando pacote de Atualização/Configuração para o dispositivo...', type: 'info', delay: 5300 },
      { pct: 68, text: 'Flash ROM escrita com sucesso. Validando hash SHA-256...', type: 'success', delay: 6500 },
      { pct: 78, text: 'Aplicando parâmetros TR069 ACS e credenciais de gerência...', type: 'info', delay: 7800 },
      { pct: 88, text: 'Reconfigurando SSIDs de Wi-Fi (2.4GHz e 5GHz)...', type: 'info', delay: 8800 },
      { pct: 95, text: 'Comandando reinicialização do serviço de rede...', type: 'warning', delay: 9800 },
      { pct: 100, text: 'Automação concluída com sucesso! Roteador 100% atualizado e configurado.', type: 'success', delay: 11000 }
    ],
  en: [
      { pct: 5, text: 'Testing network connectivity with target ONT...', type: 'info', delay: 800 },
      { pct: 15, text: 'Ping 192.168.1.1: Success (0.8ms response time)', type: 'success', delay: 1500 },
      { pct: 25, text: 'Authenticating Telnet/SSH session with credentials...', type: 'info', delay: 2300 },
      { pct: 35, text: 'Session opened on ZTE F6600P [User: admin]', type: 'success', delay: 3200 },
      { pct: 45, text: 'Acquiring active Firmware version snapshot (V2.10.10)...', type: 'info', delay: 4200 },
      { pct: 55, text: 'Pushing Upgrade/Configuration batch to device...', type: 'info', delay: 5300 },
      { pct: 68, text: 'ROM flashed successfully. Validating SHA-256 hash...', type: 'success', delay: 6500 },
      { pct: 78, text: 'Injecting TR069 ACS telemetry and management credentials...', type: 'info', delay: 7800 },
      { pct: 88, text: 'Reconfiguring dual-band Wi-Fi SSIDs (2.4GHz & 5GHz)...', type: 'info', delay: 8800 },
      { pct: 95, text: 'Triggering scheduled network daemon reboot...', type: 'warning', delay: 9800 },
      { pct: 100, text: 'Automation completed! Router fully provisioned and operational.', type: 'success', delay: 11000 }
    ]
}

function automationLogText(log: LogMessage, lang: Language) {
  if (log.isCommand) return `code-net-bot --target=${log.targetIp || '192.168.1.1'} --mode=full-auto`
  if (log.isInit) return lang === 'pt' ? 'Iniciando sequência de automação do roteador...' : 'Initializing router automation workflow...'
  const text = log.stepIndex === undefined ? log.text : automationSteps[lang][log.stepIndex]?.text || log.text
  return text.replaceAll('192.168.1.1', log.targetIp || '192.168.1.1').replaceAll('ZTE F6600P', log.targetModel || 'ZTE F6600P')
}

type SettingsValues = {
  username: string; lang: Language; targetRouterIp: string; targetRouterModel: string
  terminalAutoScroll: boolean; soundAlerts: boolean; visualAlerts: boolean
  telemetryInterval: number; trAcsUrl: string; cwmpPort: number; maxAutomationThreads: number
  defaultLogFilter: string
  requireFirmwareHash: boolean; aiEnabled: boolean
}

const operationalDefaults = {
  targetRouterModel: 'ZTE F6600P', terminalAutoScroll: true, soundAlerts: false,
  visualAlerts: true, telemetryInterval: 4500, cwmpPort: 7547, maxAutomationThreads: 1,
  defaultLogFilter: '',
  requireFirmwareHash: false
}

const validRouterIp = (value: unknown): value is string => typeof value === 'string' && /^(\d{1,3}\.){3}\d{1,3}$/.test(value) && value.split('.').every(part => Number(part) <= 255)

// Client-side corruption/tamper detection only. A public digest is not server authorization.
const ADMIN_PASSWORD_SHA256 = '47bb5f112b04b33bca358f7a1390cc645fa5c5793293ad602629565a9f3108e4'
function safeJsonParse(raw: string, fallback: unknown): any {
  try {
    return JSON.parse(raw, (key, value) => ['__proto__', 'constructor', 'prototype'].includes(key) ? undefined : value)
  } catch { return fallback }
}
async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}
async function createSessionIntegrity(role: 'admin' | 'user', name: string, adminAuthVerified: boolean) {
  if (role === 'admin' && !adminAuthVerified) throw new Error('Admin authentication was not verified')
  const payload = `${role}:${name}:codenet-session-v1-guard` + (role === 'admin' ? `:admin-hash-verified:${ADMIN_PASSWORD_SHA256}` : '')
  return sha256Hex(payload)
}
async function verifySessionIntegrity(saved: any): Promise<boolean> {
  if (!saved || saved.logged !== true || !['admin', 'user'].includes(saved.userRole) || typeof saved.username !== 'string' || !saved.username.trim() || typeof saved.integrityToken !== 'string') return false
  if (saved.userRole === 'admin' && saved.adminAuthVerified !== true) return false
  return saved.integrityToken === await createSessionIntegrity(saved.userRole, saved.username, saved.adminAuthVerified === true)
}
function safePdfFileName(value: unknown): string {
  const name = typeof value === 'string' ? value.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^\.+/, '_').slice(0, 180) : ''
  return name && name !== '_' ? name : 'relatorio.pdf'
}
function safeOpenRouter(ip: unknown) {
  if (validRouterIp(ip)) window.open(`http://${ip}`, '_blank', 'noopener,noreferrer')
}

// Local prototype credentials only. The backend must independently authenticate API access.
async function localPasswordHash(password: string, salt: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 210000, hash: 'SHA-256' }, key, 256)
  return Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, '0')).join('')
}

function SettingsModule({ values, role, lang, setLang, aiEnabled, setAiEnabled, onClose, onSave, onLogout, onClearChat, themeMode, accentColor, onAppearance }: {
  themeMode: ThemeMode; accentColor: AccentColor; onAppearance: (theme: ThemeMode, accent: AccentColor) => void
  values: SettingsValues; role: 'user' | 'admin' | null
  lang: Language; setLang: (lang: Language) => void
  aiEnabled: boolean; setAiEnabled: (enabled: boolean) => void
  onClose: () => void
  onSave: (values: SettingsValues, credentials: { current: string; next: string; confirm: string }) => Promise<void>
  onLogout: () => void; onClearChat: () => void
}) {
  const [section, setSection] = useState('account')
  const [draft, setDraft] = useState(values)
  const [credentials, setCredentials] = useState({ current: '', next: '', confirm: '' })
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)
  const pt = lang === 'pt'
  const l = (a: string, b: string) => pt ? a : b
  const admin = role === 'admin'
  const menus = [
    { id: 'account', icon: User, label: l('Minha Conta', 'My Account') },
    { id: 'operations', icon: Router, label: l('Configurações Operacionais', 'Operational Settings') },
    { id: 'preferences', icon: Globe, label: l('Preferências & Idioma', 'Preferences & Language') },
    { id: 'security', icon: Shield, label: l('Segurança & Sessão', 'Security & Session') }
  ]
  const field = (key: keyof SettingsValues, label: string, type = 'text', min?: number, max?: number) => (
    <label className="flex flex-col gap-2 text-sm min-w-0" key={key}>
      <span className="font-medium text-muted-foreground">{label}</span>
      <input type={type} min={min} max={max} required={key !== 'defaultLogFilter'} value={String(draft[key])}
        onChange={e => setDraft(prev => ({ ...prev, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
        className="w-full min-w-0 h-11 px-3 rounded-xl bg-background border border-border text-foreground focus:border-violet-500 outline-none" />
    </label>
  )
  const toggle = (key: keyof SettingsValues, label: string) => (
    <label key={key} className="flex items-center justify-between gap-4 rounded-xl border border-border p-4 text-sm">
      <span>{label}</span><input type="checkbox" checked={Boolean(draft[key])} onChange={e => setDraft(prev => ({ ...prev, [key]: e.target.checked }))} className="size-4 accent-violet-500 shrink-0" />
    </label>
  )
  return (
    <section className="relative w-full max-w-6xl mx-auto pb-12">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 pr-12">{l('Configurações', 'Settings')}</h2>
      <button type="button" onClick={onClose} aria-label={l('Fechar configurações', 'Close settings')} title={l('Fechar configurações', 'Close settings')} className="absolute top-0 right-0 p-2 rounded-xl text-muted-foreground hover:bg-violet-500/15 hover:text-violet-300 hover:border-violet-500/40 transition-all duration-200 hover:text-foreground transition-colors"><X size={24} /></button>
      <div className="grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)] gap-5">
        <nav className="rounded-3xl border border-border bg-card/70 p-3 flex flex-col gap-2 self-start" aria-label={l('Seções de configurações', 'Settings sections')}>
          {menus.map(item => <button key={item.id} type="button" aria-current={section === item.id ? 'page' : undefined} onClick={() => { setSection(item.id); setFeedback('') }} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm ${section === item.id ? 'bg-violet-600 text-white' : 'text-muted-foreground hover:bg-violet-500/10'}`}><item.icon size={18} className="shrink-0" />{item.label}</button>)}
        </nav>
        <form className="rounded-3xl min-w-0 border border-border bg-card/70 p-4 sm:p-7 flex flex-col gap-5" onSubmit={async e => {
          e.preventDefault(); if (saving) return; setSaving(true); setFeedback('')
          try { await onSave({ ...draft, lang, aiEnabled }, credentials); setCredentials({ current: '', next: '', confirm: '' }); setFeedback(l('Alterações salvas neste navegador.', 'Changes saved in this browser.')) }
          catch (error) { setFeedback(error instanceof Error ? error.message : l('Não foi possível salvar.', 'Unable to save.')) }
          finally { setSaving(false) }
        }}>
          <h3 className="text-lg font-semibold">{menus.find(item => item.id === section)?.label}</h3>
          {section === 'account' && <>
            {field('username', admin ? l('Administrador Mestre', 'Master Administrator') : l('Nome do Operador', 'Operator Name'))}
            <p className="text-sm text-violet-300">{admin ? l('Engenheiro de Redes / Admin Zseven', 'Network Engineer / Zseven Admin') : l('Operador Técnico Code Net', 'Code Net Technical Operator')}</p>
            <p className="text-xs text-muted-foreground">{l('Credencial local do protótipo neste navegador. Não altera uma senha no servidor.', 'Local prototype credential in this browser. Does not change a server password.')}</p>
            {(['current', 'next', 'confirm'] as const).map((key, i) => <label key={key} className="flex flex-col gap-2 text-sm">{[l('Senha atual', 'Current password'), l('Nova senha (8 caracteres)', 'New password (8 characters)'), l('Confirmar nova senha', 'Confirm new password')][i]}<input type="password" minLength={key === 'next' || key === 'confirm' ? 8 : undefined} autoComplete={key === 'current' ? 'current-password' : 'new-password'} value={credentials[key]} onChange={e => setCredentials(prev => ({ ...prev, [key]: e.target.value }))} className="h-11 px-3 rounded-xl bg-background border border-border" /></label>)}
          </>}
          {section === 'operations' && (admin ? <>
            {field('telemetryInterval', l('Intervalo de telemetria (ms)', 'Telemetry interval (ms)'), 'number', 1000, 3600000)}
            {field('trAcsUrl', l('Servidor ACS Mestre', 'Master ACS server'), 'url')}
            {field('cwmpPort', l('Porta CWMP', 'CWMP port'), 'number', 1, 65535)}
            {field('maxAutomationThreads', l('Limite global de threads', 'Global thread limit'), 'number', 1, 64)}
            <p className="text-xs text-muted-foreground">{l('O executor atual usa uma thread por execução.', 'The current executor uses one thread per run.')}</p>
          </> : <>
            {field('targetRouterIp', l('IP Padrão do Roteador Alvo', 'Default Target Router IP'))}
            {field('targetRouterModel', l('Modelo Padrão', 'Default Model'))}
            {toggle('terminalAutoScroll', l('Auto-Scroll no Terminal', 'Terminal Auto-Scroll'))}
          </>)}
          {section === 'preferences' && <>
            <AppearanceControls themeMode={themeMode} accentColor={accentColor} onChange={onAppearance} lang={lang} />
            <label className="flex flex-col gap-2 text-sm">{l('Idioma do painel', 'Dashboard language')}<select value={lang} onChange={(e) => setLang(e.target.value as Language)} className="h-11 px-3 rounded-xl bg-background border border-border"><option value="pt">Português (Brasil)</option><option value="en">English</option></select></label>
            {admin ? field('defaultLogFilter', l('Filtro padrão do Visualizador de Logs', 'Default Log Viewer filter')) : <>{toggle('soundAlerts', l('Alertas sonoros', 'Sound alerts'))}{toggle('visualAlerts', l('Alertas visuais', 'Visual alerts'))}</>}
          </>}
          {section === 'security' && <>
            <p className="text-sm text-muted-foreground">{l('Sessão local neste navegador. O acesso à API deve ser autenticado pelo servidor; localStorage não é um mecanismo de autorização.', 'Local session in this browser. API access must be authenticated by the server; localStorage is not an authorization mechanism.')}</p>
            {admin && <>
              {toggle('requireFirmwareHash', l('Exigir SHA-256 esperado antes de enviar firmware', 'Require expected SHA-256 before firmware upload'))}
            </>}
            <label className="flex items-center justify-between gap-4 rounded-xl border border-border p-4 text-sm"><span>{l('Habilitar Zseven IA nesta sessão', 'Enable Zseven AI in this session')}</span><input type="checkbox" checked={aiEnabled} onChange={e => setAiEnabled(e.target.checked)} className="size-4 accent-violet-500 shrink-0" /></label>
            <button type="button" onClick={() => { onClearChat(); const notice = l('Histórico da Zseven IA limpo.', 'Zseven AI history cleared.'); setFeedback(notice); alert(notice) }} className="rounded-xl border border-border px-4 py-3 text-sm text-left">{l('Limpar histórico da IA', 'Clear AI history')}</button>
            <button type="button" onClick={onLogout} className="rounded-xl border border-red-500/30 text-red-400 px-4 py-3 text-left text-sm">{l('Encerrar sessão do Code Net', 'Sign out of Code Net')}</button>
          </>}
          {feedback && <p role="status" className="text-sm rounded-xl bg-violet-500/10 text-violet-300 p-3">{feedback}</p>}
          <button disabled={saving} type="submit" className="rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-5 py-3 font-semibold text-sm self-start">{saving ? l('Salvando…', 'Saving…') : l('Salvar Alterações', 'Save Changes')}</button>
        </form>
      </div>
    </section>
  )
}


const batchModels = ['ZTE F6201B', 'ZTE F670L', 'ZTE F6600P branca', 'ZTE F6600P preta'] as const
type BatchModel = typeof batchModels[number]
type BatchStatus = 'EM ANDAMENTO' | 'CONCLUÍDO' | 'ENCERRADO PELO OPERADOR'
type OpticalResult = 'SEM FIBRA (MODO BANCADA)' | 'PENDENTE' | 'APROVADA' | 'APROVADA COM AVISO' | 'REPROVADA NO SINAL' | 'FALHA TÉCNICA NO TESTE'
type BatchAttempt = {
  id: string; position: number; attempt: number; serial: string; startedAt: string; endedAt?: string
  model: BatchModel; power: number | null; optical: OpticalResult
  result: 'EM ANDAMENTO' | 'CONFIGURADA' | 'REPROVADA' | 'REPROVADA NO SINAL' | 'FALHA TÉCNICA NO TESTE' | 'INTERROMPIDA'; opticalWarning: string
  firmware: string; backup: string; adminPassword: string; wifi24: string; wifi5: string
  ssid24: string; ssid5: string; firmwareFile: string; expectedVersion: string; backupFile: string; occurrence: string
  evidence?: { powerPath: string; serialPath: string; powerUrl?: string; serialUrl?: string }
}
type BatchLog = { id: string; time: string; type: LogMessage['type']; pt: string; en: string }
type BatchStartOptions = { unitary?: boolean; model?: BatchModel; allowNoFiber?: boolean }
type ConfigBatch = {
  allowNoFiber?: boolean; unitary?: boolean; unitStage?: number
  id: string; mode: 'mock' | 'python'; owner: string; startedAt: string; endedAt?: string; status: BatchStatus
  model: BatchModel; requested: number; cto: number; minimum: number; firmwareRequested: boolean; backupRequested: boolean
  attempts: BatchAttempt[]; logs: BatchLog[]; pdfFileName: string; progress: number; stopRequested: boolean; lastEventId?: string; ssid24?: string; ssid5?: string; workerSubmitted?: boolean
}
type ZteQuestion = { kind: 'replace' | 'access'; id: string; position: number; attempt: number; reason: string }
type ZteConnection = 'idle' | 'connecting' | 'python' | 'mock' | 'disconnected'
const ZTE_LOCAL_SERVER = 'http://127.0.0.1:8765'
const ZTE_WEBSOCKET = 'ws://127.0.0.1:8765/ws'
const ZTE_WIFI_DEFAULTS = { ssid24: 'Router Lyberty 2.4G', ssid5: 'Router Lyberty 5G', password: 'Lybertynet123#' }
const zteDefaultAccess = () => ({ user1: 'multipro', password1: 'multipro', user2: 'multipro', password2: 'Lybertynet123#' })
const batchDate = (date = new Date()) => {
  const two = (value: number) => String(value).padStart(2, '0')
  return { day: `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}`, time: `${two(date.getHours())}-${two(date.getMinutes())}-${two(date.getSeconds())}` }
}
const configuredAttempts = (batch: ConfigBatch) => batch.attempts.filter(item => item.result === 'CONFIGURADA').sort((a, b) => (a.endedAt || '').localeCompare(b.endedAt || ''))
function testZteOptical(power: number | null, cto: number, allowNoFiber = false): { optical: OpticalResult; warning: string; passed: boolean } {
  if (power === null && allowNoFiber) return { optical: 'SEM FIBRA (MODO BANCADA)', warning: 'Sem fibra óptica: configuração pela LAN autorizada pelo operador. Não representa aprovação óptica.', passed: true }
  if (power === null || !Number.isFinite(power)) return { optical: 'FALHA TÉCNICA NO TESTE', warning: 'Não foi possível ler a potência óptica da ONU.', passed: false }
  // Compare rounded power-meter units to avoid floating-point errors at CTO - 0.50.
  const measured = Math.round(power * 10000), baseline = Math.round(cto * 10000)
  if (measured < baseline - 5000) return { optical: 'REPROVADA NO SINAL', warning: 'Sinal da ONU abaixo do limite mínimo permitido.', passed: false }
  if (measured > baseline) return { optical: 'APROVADA COM AVISO', warning: 'Sinal da ONU acima do padrão da CTO.', passed: true }
  return { optical: 'APROVADA', warning: '', passed: true }
}
function zteNoDeviceNotice(ip: string, lang: Language = 'pt') {
  return lang === 'pt'
    ? `⚠ Nenhuma ONU ou roteador conectado ao PC (${ip}). A automação só será iniciada após conectar o equipamento via cabo de rede ao dispositivo.`
    : `⚠ No ONU or router connected to the PC (${ip}). Automation will only start after connecting the equipment via network cable.`
}
function zteOperationalText(value: string, lang: Language = 'pt') {
  const missingDevice = value.match(/^⚠ Nenhuma ONU ou roteador conectado ao PC \(([^)]+)\)/)
  if (missingDevice) return zteNoDeviceNotice(missingDevice[1], lang)
  return value.replace(/bot_zte\.py|worker\s+Python|Python\s+worker|\bworkers?\b|\bPython\b/gi, lang === 'pt' ? 'Automação ZTE' : 'ZTE Automation')
}
function redactZteText(value: string, secrets: string[] = []) {
  let text = value.replace(/((?:senha|password|passwd|pwd)\s*[:=]\s*)(?:\[credencial omitida\]|"[^"]*"|'[^']*'|[^\s,;]+)/gi, '$1[credencial omitida]')
  for (const secret of [...new Set([ZTE_WIFI_DEFAULTS.password, 'multipro', ...secrets])].filter(Boolean).sort((a, b) => b.length - a.length)) text = text.split(secret).join('[credencial omitida]')
  return text
}
const batchModelFiles = (model: BatchModel): { firmware: string; version: string; backup: string; referenceSn?: string } => {
  if (model === 'ZTE F6201B') return { firmware: './Firmware/Att ZXHN F6201B_V9.3.10P7N8.bin', version: 'V9.3.10P7N8', backup: './Backup/Config ZXHN F6201B.bin' }
  // Empty firmware represents Python None: the black variant always waives this stage.
  if (model === 'ZTE F6600P preta') return { firmware: '', version: 'V9.1 10P4N2', backup: './Backup/Config ZXHN F6600P V9.1 10P4N2.bin', referenceSn: 'ZTEGDD2A6961' }
  if (model === 'ZTE F6600P branca') return { firmware: './Firmware/Att ZXHN F6600P_V9.0.10P6N40.bin', version: 'V9.0.10P6N40', backup: './Backup/Config ZXHN F6600P.bin', referenceSn: 'ZTEGD7B68E19' }
  return { firmware: './Firmware/Att ZXHN F670L_V9.0.10P1N1.bin', version: 'V9.0.10P1N1', backup: './Backup/Config ZXHN F670L.bin' }
}
function zteEvidenceUrl(path: unknown): string | undefined {
  if (typeof path !== 'string' || !path.trim()) return undefined
  try {
    // Decode before URL parsing: URL normalizes dot segments and would hide traversal.
    const decoded = decodeURIComponent(path)
    if (/[\u0000-\u001f\u007f]/.test(decoded) || /%[a-f\d]{2}/i.test(decoded)) return undefined
    let clean = decoded.replaceAll('\\', '/')
    if (clean.split('/').some(segment => segment === '..')) return undefined
    if (/^https?:\/\//i.test(clean)) {
      const url = new URL(clean)
      if (url.origin !== ZTE_LOCAL_SERVER || url.username || url.password || url.search || url.hash) return undefined
      clean = decodeURIComponent(url.pathname)
      if (!clean.startsWith('/evidencias/')) return undefined
    }
    clean = clean.replace(/^\.\//, '')
    if (clean.startsWith('/evidencias/')) clean = clean.slice('/evidencias/'.length)
    if (!clean.startsWith('Registro de PON/Lotes/') || clean.split('/').some(segment => segment === '..' || segment === '.' || !segment) || /[\u0000?#]/.test(clean)) return undefined
    return ZTE_LOCAL_SERVER + '/evidencias/' + clean.split('/').map(encodeURIComponent).join('/')
  } catch { return undefined }
}

function useBatchConfigurator(owner: string, enabled: boolean, initialModel: string, targetIp: string, ssids: { ssid24: string; ssid5: string; password24?: string; password5?: string }) {
  const normalized = batchModels.includes(initialModel as BatchModel) ? initialModel as BatchModel : initialModel === 'ZTE F6600P' ? 'ZTE F6600P preta' : 'ZTE F6201B'
  const [model, setModel] = useState<BatchModel>(normalized)
  const [quantity, setQuantity] = useState(1)
  const [cto, setCto] = useState('-20.00')
  const [firmwareRequested, setFirmwareRequested] = useState(normalized !== 'ZTE F6600P preta')
  const [backupRequested, setBackupRequested] = useState(true)
  const [allowNoFiber, setAllowNoFiber] = useState(false)
  const [access, setAccess] = useState(zteDefaultAccess)
  const [serialInput, setSerialInput] = useState('')
  const [history, setHistory] = useState<ConfigBatch[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [notice, setNotice] = useState('')
  const [ready, setReady] = useState(false)
  const [greetingSeed, setGreetingSeed] = useState(0)
  const [question, setQuestion] = useState<ZteQuestion | null>(null)
  const [connection, setConnection] = useState<ZteConnection>('idle')
  const [commandPending, setCommandPending] = useState(false)
  const current = useRef<ConfigBatch | null>(null)
  const stored = useRef<ConfigBatch[]>([])
  const connectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const socket = useRef<WebSocket | null>(null)
  const serials = useRef<string[]>([])
  const session = useRef(0)
  const pendingQuestion = useRef<ZteQuestion | null>(null)
  const secrets = useRef<string[]>([])
  const seenEvents = useRef(new Set<string>())
  const commandBusy = useRef(false)
  const storageKey = `codenet_batches_v1:${encodeURIComponent(owner)}`
  const rememberSecrets = (...values: string[]) => { secrets.current = [...new Set([...secrets.current, ...values.filter(Boolean)])] }
  const clean = (value: string) => redactZteText(value, secrets.current)
  function ask(value: ZteQuestion | null) { pendingQuestion.current = value; setQuestion(value); commandBusy.current = false; setCommandPending(false) }
  function commit(batch: ConfigBatch) {
    current.current = batch
    stored.current = [batch, ...stored.current.filter(item => item.id !== batch.id)]
    setHistory(stored.current)
    try { localStorage.setItem(storageKey, JSON.stringify(stored.current)) }
    catch { setNotice('Não foi possível salvar os lotes neste navegador. Exporte o PDF antes de sair.') }
  }
  function appendLog(batch: ConfigBatch, text: string, type: LogMessage['type'] = 'info'): ConfigBatch {
    const safe = clean(text)
    return { ...batch, logs: [...batch.logs, { id: crypto.randomUUID(), time: new Date().toISOString(), type, pt: safe, en: safe }] }
  }
  function log(text: string, type: LogMessage['type'] = 'info') { if (current.current) commit(appendLog(current.current, text, type)) }
  function closeTransport() {
    if (connectTimer.current !== null) clearTimeout(connectTimer.current)
    const ws = socket.current; socket.current = null
    if (ws) { ws.onopen = null; ws.onmessage = null; ws.onerror = null; ws.onclose = null; try { ws.close() } catch { /* Local cleanup must complete even if the transport already closed. */ } }
  }
  useEffect(() => {
    if (current.current?.status !== 'EM ANDAMENTO') { setModel(normalized); setFirmwareRequested(normalized !== 'ZTE F6600P preta'); setBackupRequested(true) }
  }, [initialModel, owner])
  function loadHistory() {
    try {
      const parsed: unknown = safeJsonParse(localStorage.getItem(storageKey) || '[]', [])
      if (!Array.isArray(parsed)) throw new Error('Invalid history')
      const valid = parsed.filter((item): item is ConfigBatch => Boolean(item && typeof item === 'object' && item.owner === owner && ['mock', 'python'].includes(item.mode) && typeof item.id === 'string' && typeof item.startedAt === 'string' && typeof item.pdfFileName === 'string' && typeof item.cto === 'number' && typeof item.minimum === 'number' && Number.isInteger(item.requested) && batchModels.includes(item.model) && Array.isArray(item.attempts) && item.attempts.every((a: BatchAttempt) => a && typeof a.serial === 'string' && typeof a.id === 'string') && Array.isArray(item.logs) && item.logs.every((l: BatchLog) => l && typeof l.pt === 'string' && typeof l.en === 'string')))
      valid.forEach(batch => { batch.pdfFileName = safePdfFileName(batch.pdfFileName) })
      const active = current.current?.status === 'EM ANDAMENTO' ? current.current : null
      stored.current = active ? [active, ...valid.filter(item => item.id !== active.id)] : valid
      setHistory(stored.current); setSelectedId(prev => stored.current.some(item => item.id === prev) ? prev : stored.current[0]?.id || '')
    } catch { setNotice('O histórico local está inválido ou indisponível.') }
  }
  useEffect(() => {
    session.current++; closeTransport(); current.current = null; stored.current = []; serials.current = []; secrets.current = []; seenEvents.current.clear()
    setHistory([]); setSelectedId(''); setNotice(''); setReady(false); setSerialInput(''); setAccess(zteDefaultAccess()); setConnection('idle'); ask(null)
    if (!enabled || !owner) return
    loadHistory()
    stored.current = stored.current.map(batch => batch.status !== 'EM ANDAMENTO' || (batch.mode === 'python' && batch.workerSubmitted !== false) ? batch : appendLog({ ...batch, status: 'ENCERRADO PELO OPERADOR', endedAt: new Date().toISOString(), stopRequested: true,
      attempts: batch.attempts.map(item => item.result === 'EM ANDAMENTO' ? { ...item, result: 'INTERROMPIDA', endedAt: new Date().toISOString(), occurrence: 'Simulação interrompida ao fechar ou recarregar a sessão.' } : item)
    }, batch.mode === 'mock' ? 'Simulação interrompida ao fechar ou recarregar a sessão.' : "Conexão inicial cancelada antes do envio ao serviço de automação.", 'warning'))
    setHistory(stored.current)
    const remote = stored.current.find(batch => batch.status === 'EM ANDAMENTO' && batch.mode === 'python')
    if (remote) { current.current = remote; setSelectedId(remote.id); setConnection('disconnected'); setNotice("Lote pendente. Reconecte para consultar o andamento; nenhuma nova execução será iniciada.") }
    try { localStorage.setItem(storageKey, JSON.stringify(stored.current)) } catch { setNotice('Falha ao salvar histórico local.') }
    setReady(true)
    return () => { session.current++; closeTransport(); current.current = null }
  }, [owner, enabled])
  function chooseModel(value: BatchModel) { if (current.current?.status === 'EM ANDAMENTO') return; setModel(value); setFirmwareRequested(value !== 'ZTE F6600P preta'); setBackupRequested(true) }
  function finish(status: Exclude<BatchStatus, 'EM ANDAMENTO'>) {
    const batch = current.current
    if (!batch || batch.status !== 'EM ANDAMENTO') return
    commit(appendLog({ ...batch, status, endedAt: batch.endedAt || new Date().toISOString(), progress: status === 'CONCLUÍDO' ? 100 : batch.progress,
      attempts: batch.attempts.map(item => item.result === 'EM ANDAMENTO' ? { ...item, result: 'INTERROMPIDA', endedAt: new Date().toISOString(), occurrence: 'Operação encerrada pelo operador.' } : item)
    }, status === 'CONCLUÍDO' ? 'FILA CONCLUÍDA' : 'FILA ENCERRADA PELO OPERADOR', 'success'))
    ask(null); serials.current = []; closeTransport(); setConnection('idle'); setGreetingSeed(value => value + 1)
  }
  function sendCommand(type: string, data: Record<string, unknown> = {}) {
    if (!current.current || socket.current?.readyState !== WebSocket.OPEN) { setNotice("Sem conexão com o serviço de automação. Reconecte para enviar o comando."); return false }
    try { socket.current.send(JSON.stringify({ type, lote_id: current.current.id, ...data })); return true }
    catch { setNotice("Não foi possível enviar o comando ao serviço de automação."); return false }
  }
  function endQueue() {
    if (commandBusy.current || current.current?.status !== 'EM ANDAMENTO') return
    if (sendCommand('encerrar')) { commandBusy.current = true; setCommandPending(true); log("Encerramento solicitado; aguardando confirmação do serviço de automação.", 'warning') }
  }
  function cancelAutomation() {
    const batch = current.current
    if (!batch || batch.status !== 'EM ANDAMENTO') return
    // Best-effort remote cancellation; local cleanup never waits for an acknowledgement.
    let delivered = batch.workerSubmitted !== true
    try {
      if (socket.current?.readyState === 1) {
        socket.current.send(JSON.stringify({ type: 'encerrar', lote_id: batch.id }))
        delivered = true
      }
    } catch { delivered = false }
    session.current++ // Ignore callbacks already queued by a previous connection or timer.
    commit(appendLog({ ...batch, stopRequested: true }, '🛑 Automação cancelada pelo operador.', 'warning'))
    finish('ENCERRADO PELO OPERADOR')
    setConnection('idle')
    setNotice(delivered ? '' : 'Cancelamento local concluído. Não foi possível confirmar a parada no equipamento; verifique a bancada antes de reiniciar.')
  }
  function stopAfterCurrent() {
    const batch = current.current
    if (batch?.status !== 'EM ANDAMENTO' || batch.stopRequested) return
    if (pendingQuestion.current) { endQueue(); return }
    if (batch.mode === 'python' && !sendCommand('parar_apos_atual')) return
    commit(appendLog({ ...batch, stopRequested: true }, 'Parada solicitada: concluir a operação atual, sem iniciar outro equipamento.', 'warning'))
  }
  function confirmReplacement() {
    const pending = pendingQuestion.current
    if (pending?.kind !== 'replace' || commandBusy.current) return
    if (current.current?.mode === 'python') {
      if (sendCommand('resposta', { pergunta_id: pending.id, resposta: 'repetir', posicao: pending.position, tentativa: pending.attempt })) { ask(null); log('Troca da ONU confirmada. Repetir a mesma posição.', 'command') }
    }
  }
  function submitNewAccess(user: string, password: string) {
    if (pendingQuestion.current?.kind !== 'access' || commandBusy.current) return false
    if (!user.trim() || !password) { setNotice('Informe o novo usuário e a senha.'); return false }
    rememberSecrets(password)
    if (current.current?.mode === 'python') {
      if (!sendCommand('acesso', { pergunta_id: pendingQuestion.current.id, usuario: user.trim(), senha: password })) return false
      ask(null); log("Novo acesso enviado ao serviço de automação: senha=[credencial omitida].", 'command'); return true
    }
    return false
  }

  function submitSerial() {
    const sn = serialInput.trim()
    if (!/^[a-zA-Z0-9-]{6,40}$/.test(sn)) { setNotice('Informe um SN de 6 a 40 caracteres alfanuméricos (hífen permitido).'); return }
    if (serials.current.includes(sn) || current.current?.attempts.some(item => item.serial === sn && item.result !== 'REPROVADA NO SINAL' && item.result !== 'FALHA TÉCNICA NO TESTE')) { setNotice('Este SN já foi registrado nesta fila.'); return }
    if (current.current?.status === 'EM ANDAMENTO' && current.current.mode === 'python') { if (!sendCommand('serial', { sn })) return }
    else serials.current.push(sn)
    setSerialInput(''); setNotice(`SN ${sn} reservado para a próxima leitura da fila.`)
  }

  // LOCAL WORKER CONTRACT (adapter boundary, not an assumed implementation of the unprovided Python scripts):
  // ws://127.0.0.1:8765/ws. Send {type:'iniciar', lote_id, config}; resume with {type:'retomar', lote_id, after_event_id}.
  // Receive {type:'log'|'lote'|'pergunta'|'acesso'|'progresso'|'tentativa'|'final', lote_id, event_id, data}.
  // Commands: resposta/repetir, acesso, serial, parar_apos_atual, encerrar. The worker owns hardware execution.
  // config.permitir_sem_fibra permits an explicit null/-- optical reading; modo_unitario fixes quantidade=1.
  // The worker must still capture both evidences, read SN and confirm all stages; this frontend cannot execute bot_zte.py.
  // Optional progresso.data.etapa_unitaria is 1..6. Unsupported workers must report failure instead of claiming success.
  // Evidence files are served via GET /evidencias/<relative path> with CORS for the Code Net origin.
  function receiveWorkerEvent(raw: unknown) {
    const batch = current.current
    if (!batch || batch.status !== 'EM ANDAMENTO' || !raw || typeof raw !== 'object') return
    const event = raw as { type?: unknown; lote_id?: unknown; event_id?: unknown; data?: unknown }
    if (event.lote_id !== batch.id || typeof event.event_id !== 'string' || typeof event.type !== 'string' || !event.data || typeof event.data !== 'object') return
    if (seenEvents.current.has(event.event_id) || event.event_id === batch.lastEventId) return
    const data = event.data as Record<string, unknown>
    const str = (key: string, fallback = '') => typeof data[key] === 'string' ? clean(data[key] as string) : fallback
    const timestamp = (key: string) => typeof data[key] === 'string' && Number.isFinite(Date.parse(data[key] as string)) ? data[key] as string : undefined
    let next: ConfigBatch = { ...batch, lastEventId: event.event_id }
    if (event.type === 'log') next = appendLog(next, str('text'), ['info', 'success', 'warning', 'command', 'error'].includes(String(data.level)) ? data.level as LogMessage['type'] : 'info')
    else if (event.type === 'lote') next = { ...next, startedAt: timestamp('inicio') || next.startedAt }
    else if (event.type === 'progresso') {
      if (typeof data.percentual !== 'number' || !Number.isFinite(data.percentual)) return
      next.progress = Math.max(next.progress, Math.min(99, Math.max(0, data.percentual)))
      if (batch.unitary && Number.isInteger(data.etapa_unitaria) && Number(data.etapa_unitaria) >= 1 && Number(data.etapa_unitaria) <= 6) next.unitStage = Number(data.etapa_unitaria)
    } else if (event.type === 'pergunta' || event.type === 'acesso') {
      if (!Number.isInteger(data.posicao) || !Number.isInteger(data.tentativa) || Number(data.posicao) < 1 || Number(data.posicao) > batch.requested) return
      ask({ kind: event.type === 'acesso' ? 'access' : 'replace', id: str('pergunta_id', event.event_id), position: Number(data.posicao), attempt: Number(data.tentativa), reason: event.type === 'acesso' ? 'Os dois pares não conseguiram acesso.' : str('motivo', 'FALHA TÉCNICA NO TESTE') })
    } else if (event.type === 'tentativa') {
      const position = Number(data.posicao), attemptNumber = Number(data.tentativa)
      if (!Number.isInteger(position) || position < 1 || position > batch.requested || !Number.isInteger(attemptNumber) || attemptNumber < 1 || (data.modelo && data.modelo !== batch.model)) return
      const id = `${position}:${attemptNumber}`, previous = batch.attempts.find(item => item.id === id)
      if (pendingQuestion.current && (position !== pendingQuestion.current.position || attemptNumber > pendingQuestion.current.attempt)) { setNotice("O serviço de automação tentou avançar uma fila pausada. Confirme a troca da ONU antes de continuar."); return }
      if (previous?.endedAt) return
      const powerProvided = Object.prototype.hasOwnProperty.call(data, 'potencia')
      const absent = data.potencia === null || data.potencia === '--' || (!powerProvided && data.optico === 'SEM FIBRA (MODO BANCADA)')
      const hasPower = typeof data.potencia === 'number' && Number.isFinite(data.potencia)
      if (powerProvided && !hasPower && !absent) { setNotice("Leitura óptica inválida recebida do serviço de automação. Aguardando uma leitura válida."); return }
      const power = hasPower ? data.potencia as number : absent ? null : previous?.power ?? null
      const check = testZteOptical(power, batch.cto, batch.allowNoFiber === true && !hasPower && (absent || previous?.optical === 'SEM FIBRA (MODO BANCADA)'))
      const endedAt = timestamp('fim')
      const values = ['EM ANDAMENTO', 'CONFIGURADA', 'REPROVADA NO SINAL', 'FALHA TÉCNICA NO TESTE', 'INTERROMPIDA']
      if (!values.includes(String(data.resultado))) return
      const result = (endedAt && !check.passed && data.resultado !== 'INTERROMPIDA' ? check.optical : data.resultado) as BatchAttempt['result']
      if (result !== 'EM ANDAMENTO' && !endedAt) return
      const stage = (key: string, fallback = 'PENDENTE') => ['PENDENTE', 'CONFIRMADO PELO BOT', 'DISPENSADO', 'FALHA'].includes(String(data[key])) ? String(data[key]) : fallback
      const evidence = data.evidencias && typeof data.evidencias === 'object' ? data.evidencias as Record<string, unknown> : {}
      const powerPath = typeof evidence.potencia === 'string' ? evidence.potencia : previous?.evidence?.powerPath || ''
      const serialPath = typeof evidence.sn === 'string' ? evidence.sn : previous?.evidence?.serialPath || ''
      const item: BatchAttempt = { id, position, attempt: attemptNumber, serial: str('sn', previous?.serial || ''), model: batch.model, startedAt: timestamp('inicio') || previous?.startedAt || new Date().toISOString(), endedAt,
        power, optical: power === null && !endedAt && !absent && previous?.optical !== 'SEM FIBRA (MODO BANCADA)' ? 'PENDENTE' : check.optical, opticalWarning: power === null && !endedAt && !absent && previous?.optical !== 'SEM FIBRA (MODO BANCADA)' ? '' : check.warning, result,
        firmware: stage('firmware', previous?.firmware || (batch.firmwareRequested ? 'PENDENTE' : 'DISPENSADO')), backup: stage('backup', previous?.backup || (batch.backupRequested ? 'PENDENTE' : 'DISPENSADO')),
        adminPassword: stage('senha_admin', previous?.adminPassword), wifi24: stage('wifi24', previous?.wifi24), wifi5: stage('wifi5', previous?.wifi5),
        ssid24: str('ssid24').trim() || previous?.ssid24 || batch.ssid24 || ZTE_WIFI_DEFAULTS.ssid24, ssid5: str('ssid5').trim() || previous?.ssid5 || batch.ssid5 || ZTE_WIFI_DEFAULTS.ssid5,
        firmwareFile: str('arquivo_firmware', previous?.firmwareFile || (batch.firmwareRequested ? "Aguardando serviço de automação" : '')), expectedVersion: str('versao_esperada', previous?.expectedVersion || "Aguardando serviço de automação"), backupFile: str('arquivo_backup', previous?.backupFile || (batch.backupRequested ? "Aguardando serviço de automação" : '')), occurrence: str('ocorrencia', check.warning),
        evidence: { powerPath, serialPath, powerUrl: zteEvidenceUrl(powerPath), serialUrl: zteEvidenceUrl(serialPath) } }
      if (item.result === 'CONFIGURADA' && (!item.serial || !check.passed || !zteEvidenceUrl(powerPath) || !zteEvidenceUrl(serialPath) || ![item.firmware, item.backup, item.adminPassword, item.wifi24, item.wifi5].every(value => value === 'CONFIRMADO PELO BOT' || value === 'DISPENSADO'))) { setNotice('Confirmação incompleta recebida da ONU. Aguardando SN, evidências e etapas confirmadas pelo bot.'); return }
      next.attempts = previous ? batch.attempts.map(value => value.id === id ? item : value) : [...batch.attempts, item]
      if (check.warning && (previous?.opticalWarning !== check.warning)) next = appendLog(next, `${check.optical}: ${check.warning}`, 'warning')
      if (endedAt && !check.passed && result !== 'INTERROMPIDA') ask({ kind: 'replace', id: str('pergunta_id', event.event_id), position, attempt: attemptNumber, reason: check.optical })
    } else if (event.type === 'final') {
      if (data.situacao !== 'CONCLUÍDO' && data.situacao !== 'ENCERRADO PELO OPERADOR') return
      if (data.situacao === 'CONCLUÍDO' && configuredAttempts(batch).length < batch.requested) { setNotice("O serviço de automação encerrou sem enviar todas as tentativas. Reconecte para sincronizar os dados."); return }
      next.endedAt = timestamp('fim'); commit(next); finish(data.situacao); return
    } else return
    seenEvents.current.add(event.event_id); commit(next)
  }
  // Preflight contract: verificar_dispositivo must probe/login to the target on the bot host.
  // Reply {type:'dispositivo', lote_id, data:{ip, conectado:true}} only after real device confirmation.
  // Merely opening the WebSocket is NOT proof of an ONU. No browser no-cors probe or mock fallback.
  function connectWorker(batch: ConfigBatch, config?: Record<string, unknown>) {
    closeTransport(); setConnection('connecting'); setNotice('')
    const token = session.current
    let verified = false, failed = false
    const unavailable = () => {
      if (failed || token !== session.current) return
      failed = true; closeTransport(); commandBusy.current = false; setCommandPending(false)
      setConnection('disconnected'); ask(null)
      if (config && !verified) {
        const warning = zteNoDeviceNotice(String(config.ip))
        const active = current.current
        if (active?.id === batch.id) commit(appendLog({ ...active, status: 'ENCERRADO PELO OPERADOR', endedAt: new Date().toISOString(), progress: 0, unitStage: 0, workerSubmitted: false, attempts: [] }, warning, 'warning'))
        setNotice(warning)
      } else {
        const warning = 'Conexão com o serviço de automação interrompida. Reconecte para sincronizar o lote.'
        log(warning, 'warning'); setNotice(warning)
      }
    }
    try {
      const ws = new WebSocket(ZTE_WEBSOCKET); socket.current = ws
      connectTimer.current = setTimeout(unavailable, 6000)
      ws.onopen = () => {
        if (token !== session.current || socket.current !== ws) return
        try {
          if (config) ws.send(JSON.stringify({ type: 'verificar_dispositivo', lote_id: batch.id, ip: config.ip }))
          else {
            ws.send(JSON.stringify({ type: 'retomar', lote_id: batch.id, after_event_id: batch.lastEventId || null }))
            verified = true
            if (connectTimer.current !== null) clearTimeout(connectTimer.current)
            setConnection('python')
          }
        } catch { unavailable() }
      }
      ws.onmessage = message => {
        if (token !== session.current || socket.current !== ws || failed) return
        try {
          const event = JSON.parse(String(message.data))
          if (config && !verified) {
            if (event?.type !== 'dispositivo' || event.lote_id !== batch.id || event.data?.ip !== config.ip) return
            if (event.data.conectado !== true) { unavailable(); return }
            // Credentials/configuration are sent only after the real device check succeeds.
            ws.send(JSON.stringify({ type: 'iniciar', lote_id: batch.id, config }))
            verified = true
            if (connectTimer.current !== null) clearTimeout(connectTimer.current)
            if (current.current?.id === batch.id) commit({ ...current.current, workerSubmitted: true })
            serials.current = []; setConnection('python'); setNotice('')
            return
          }
          receiveWorkerEvent(event)
        } catch { if (config && !verified) unavailable(); else log('Evento inválido recebido do serviço de automação (conteúdo omitido).', 'warning') }
      }
      ws.onerror = unavailable
      ws.onclose = unavailable
    } catch { unavailable() }
  }
  function reconnect() { if (current.current?.mode === 'python' && current.current.status === 'EM ANDAMENTO' && connection !== 'connecting') connectWorker(current.current) }
  function startAutomation(options: BatchStartOptions = {}) {
    if (!ready || !enabled || current.current?.status === 'EM ANDAMENTO') return
    const runModel = options.unitary ? options.model || model : model
    const requested = options.unitary ? 1 : quantity
    const bench = options.allowNoFiber ?? allowNoFiber
    if (!batchModels.includes(runModel) || !validRouterIp(targetIp)) { setNotice('Modelo ou IP inválido.'); return }
    const baseline = Number(cto.trim().replace(',', '.'))
    if (!Number.isInteger(requested) || requested < 1 || requested > 100 || !cto.trim() || !Number.isFinite(baseline) || baseline > 0 || baseline < -40) { setNotice('Use quantidade de 1 a 100 e CTO entre -40 e 0 dBm.'); return }
    const typed = serialInput.trim()
    if (typed && !/^[a-zA-Z0-9-]{6,40}$/.test(typed)) { setNotice('Número de série inválido.'); return }
    if (typed && !serials.current.includes(typed)) serials.current.push(typed)
    setSerialInput(''); setNotice(''); ask(null); seenEvents.current.clear()
    const now = new Date(), stamp = batchDate(now), hash = crypto.randomUUID().replaceAll('-', '').slice(0, 6)
    const id = `${stamp.day.replaceAll('-', '')}_${stamp.time.replaceAll('-', '')}_${hash}`
    const batch: ConfigBatch = { id, owner, mode: 'python', startedAt: now.toISOString(), model: runModel, requested, allowNoFiber: bench, unitary: options.unitary === true, cto: baseline, minimum: Number((baseline - 0.5).toFixed(4)), firmwareRequested: runModel !== 'ZTE F6600P preta' && (options.unitary || firmwareRequested), backupRequested: options.unitary || runModel === 'ZTE F6600P preta' || backupRequested,
      status: 'EM ANDAMENTO', attempts: [], logs: [], progress: 0, stopRequested: false, workerSubmitted: false, pdfFileName: `Relatorio_${runModel.replace('ZTE ', '').replaceAll(' ', '_')}_${stamp.day}_${stamp.time}_${hash}.pdf` }
    const wifi = { ssid24: ssids.ssid24.trim() || ZTE_WIFI_DEFAULTS.ssid24, ssid5: ssids.ssid5.trim() || ZTE_WIFI_DEFAULTS.ssid5 }
    batch.ssid24 = wifi.ssid24; batch.ssid5 = wifi.ssid5
    const password24 = ssids.password24 || ZTE_WIFI_DEFAULTS.password, password5 = ssids.password5 || ZTE_WIFI_DEFAULTS.password
    rememberSecrets(access.password1, access.password2, password24, password5)
    const credentials = { ...access }
    // Secrets exist only in this transient transport payload, never in ConfigBatch/localStorage/PDF/logs.
    const config = { modelo: runModel, quantidade: requested, permitir_sem_fibra: bench, modo_unitario: options.unitary === true, cto: baseline, firmware: batch.firmwareRequested, backup: batch.backupRequested,
      acessos: [{ usuario: credentials.user1, senha: credentials.password1 }, { usuario: credentials.user2, senha: credentials.password2 }],
      ssid24: { nome: wifi.ssid24, senha: password24 }, ssid5: { nome: wifi.ssid5, senha: password5 }, pasta_backup: './Backup', pasta_firmware: './Firmware', arquivo_firmware: batchModelFiles(runModel).firmware, arquivo_backup: batchModelFiles(runModel).backup, versao_esperada: batchModelFiles(runModel).version, ip: targetIp, sns: [...serials.current] }
    commit(batch); setSelectedId(id)
    connectWorker(batch, config)
  }
  const activeBatch = history.find(item => item.id === current.current?.id) || null
  const selected = history.find(item => item.id === selectedId) || null
  const running = activeBatch?.status === 'EM ANDAMENTO' && activeBatch.workerSubmitted === true
  function resetView() { if (running || connection === 'connecting') return; current.current = null; serials.current = []; setSerialInput(''); setSelectedId(''); setNotice(''); setConnection('idle'); ask(null); setGreetingSeed(value => value + 1) }
  return { targetIp, targetSsids: { ssid24: ssids.ssid24.trim() || ZTE_WIFI_DEFAULTS.ssid24, ssid5: ssids.ssid5.trim() || ZTE_WIFI_DEFAULTS.ssid5 }, allowNoFiber, setAllowNoFiber, model, chooseModel, quantity, setQuantity, cto, setCto, firmwareRequested, setFirmwareRequested, backupRequested, setBackupRequested, access, setAccess, serialInput, setSerialInput, submitSerial,
    history, selectedId, setSelectedId, selected, activeBatch, running, ready, notice, setNotice, greetingSeed, startAutomation, stopAfterCurrent, loadHistory, resetView, question, connection, commandPending, confirmReplacement, endQueue, cancelAutomation, submitNewAccess, reconnect }
}


function batchSummaryRows(batch: ConfigBatch): [string, string][] {
  const date = (value?: string) => value ? new Date(value).toLocaleString('pt-BR', { hour12: false }) : 'Em andamento'
  return [
    ['Lote', batch.id], ['Início / encerramento', `${date(batch.startedAt)} / ${date(batch.endedAt)}`], ['Situação', batch.status],
    ['Solicitadas / configuradas', `${batch.requested} / ${configuredAttempts(batch).length}`], ['Tentativas', String(batch.attempts.length)],
    ['CTO / limite mínimo', `${batch.cto.toFixed(2)} / ${batch.minimum.toFixed(2)} dBm`],
    ['Firmware / backup', `${batch.firmwareRequested ? 'Solicitado' : 'Dispensado'} / ${batch.backupRequested ? 'Solicitado' : 'Dispensado'}`]
  ]
}
function attemptReportRows(item: BatchAttempt): [string, string][] {
  return [
    ['SN / resultado', `${item.serial} / ${item.result}`], ['Horário', new Date(item.endedAt || item.startedAt).toLocaleString('pt-BR', { hour12: false })],
    ['Modelo / variante', item.model], ['Potência / teste óptico', `${item.power === null ? 'Não medida' : item.power.toFixed(4) + ' dBm'} / ${item.optical}`],
    ['Aviso óptico', item.opticalWarning || 'Nenhum aviso registrado'], ['Firmware', item.firmware], ['Backup', item.backup],
    ['Senha administrativa', item.adminPassword], ['Wi-Fi 2,4 GHz / 5 GHz', `${item.wifi24} / ${item.wifi5}`],
    ['SSIDs previstos', `${item.ssid24?.trim() || ZTE_WIFI_DEFAULTS.ssid24} / ${item.ssid5?.trim() || ZTE_WIFI_DEFAULTS.ssid5}`],
    ['Arquivo de firmware', item.firmwareFile || 'Dispensado'], ['Versão esperada', item.expectedVersion], ['Arquivo de backup', item.backupFile || 'Dispensado'],
    ['Ocorrência', item.occurrence || 'Operação em andamento.']
  ]
}

async function createBatchPdf(batch: ConfigBatch): Promise<Blob> {
  // Standalone vector PDF writer (A4, WinAnsi text and JPEG logos). No extra npm dependency.
  // The same bytes are used for preview, printing and download. Evidence is loaded per attempt from the local Python server; mock/unavailable images remain labeled placeholders.
  type Logo = { bytes: Uint8Array; width: number; height: number }
  async function logo(src: string, background = '#111827'): Promise<Logo | null> {
    return new Promise(resolve => {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      const timeout = setTimeout(() => resolve(null), 3500)
      image.onload = () => {
        clearTimeout(timeout)
        try {
          const canvas = document.createElement('canvas')
          const scale = Math.min(1, 1600 / image.naturalWidth)
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
          const context = canvas.getContext('2d')!
          context.fillStyle = background; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height)
          const raw = atob(canvas.toDataURL('image/jpeg', 0.95).split(',')[1])
          resolve({ bytes: Uint8Array.from(raw, char => char.charCodeAt(0)), width: canvas.width, height: canvas.height })
        } catch { resolve(null) }
      }
      image.onerror = () => { clearTimeout(timeout); resolve(null) }; image.src = src
    })
  }
  const logos = await Promise.all([logo('/codenet-v2/codenet-logo.png'), logo('/codenet-v2/zseven.jpeg')])
  const evidenceImages = new Map<string, { power: Logo | null; serial: Logo | null }>()
  if (batch.mode === 'python') {
    // Bound parallel image loads so a large batch does not open hundreds of HTTP requests at once.
    for (let offset = 0; offset < batch.attempts.length; offset += 4) {
      await Promise.all(batch.attempts.slice(offset, offset + 4).map(async item => {
        const powerUrl = zteEvidenceUrl(item.evidence?.powerUrl || item.evidence?.powerPath)
        const serialUrl = zteEvidenceUrl(item.evidence?.serialUrl || item.evidence?.serialPath)
        const [power, serial] = await Promise.all([powerUrl ? logo(powerUrl, '#ffffff') : Promise.resolve(null), serialUrl ? logo(serialUrl, '#ffffff') : Promise.resolve(null)])
        evidenceImages.set(item.id, { power, serial })
      }))
    }
  }
  const pdfImages: { name: string; image: Logo }[] = []
  logos.forEach((image, index) => { if (image) pdfImages.push({ name: 'Im' + index, image }) })
  const pages: string[] = []
  let content = '', y = 0
  const height = 842, width = 595, margin = 40, usable = width - margin * 2
  const escaped = (value: string) => zteOperationalText(value).replace(/[–—]/g, '-').replace(/…/g, '...').replace(/[“”]/g, '"').replace(/[’]/g, "'").replace(/[^\x20-\xFF\n]/g, '?').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
  const text = (value: string, x: number, top: number, size = 9, bold = false, color = '0.12 0.15 0.2') => { content += `BT /${bold ? 'F2' : 'F1'} ${size} Tf ${color} rg 1 0 0 1 ${x} ${height - top - size} Tm (${escaped(value)}) Tj ET\n` }
  const rect = (x: number, top: number, w: number, h: number, color: string) => { content += `${color} rg ${x} ${height - top - h} ${w} ${h} re f\n` }
  function wrap(value: string, maxWidth: number, size = 9) {
    const limit = Math.max(8, Math.floor(maxWidth / (size * 0.55))), lines: string[] = []
    for (const paragraph of zteOperationalText(value).split('\n')) {
      let line = ''
      for (const word of paragraph.split(/\s+/)) {
        if ((line + ' ' + word).trim().length > limit && line) { lines.push(line); line = '' }
        let remaining = word
        while (remaining.length > limit) { if (line) { lines.push(line); line = '' }; lines.push(remaining.slice(0, limit)); remaining = remaining.slice(limit) }
        line = (line + ' ' + remaining).trim()
      }
      lines.push(line)
    }
    return lines
  }
  function finishPage() {
    if (!content) return
    text(`${batch.mode === 'mock' ? 'SIMULAÇÃO' : "AUTOMAÇÃO ZTE"} · ${batch.id}`, margin, 809, 8, false, '0.4 0.4 0.4')
    text(String(pages.length + 1), 540, 809, 8)
    pages.push(content)
  }
  function newPage() {
    finishPage(); content = ''
    rect(0, 0, width, 82, '0.067 0.094 0.153')
    logos.forEach((image, index) => {
      if (!image) { text(index === 0 ? 'Code Net' : 'Zseven Systems', margin + index * 110, 30, 10, true, '1 1 1'); return }
      const scale = Math.min(95 / image.width, 42 / image.height), w = image.width * scale, h = image.height * scale
      content += `q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${margin + index * 110} ${(height - 20 - h).toFixed(2)} cm /Im${index} Do Q\n`
    })
    text('CONFIGURADOR ZTE · CODE NET', 310, 28, 11, true, '1 1 1')
    text(batch.mode === 'mock' ? 'AMBIENTE DE SIMULAÇÃO / MOCK' : "REGISTROS DA AUTOMAÇÃO ZTE", 310, 47, 8, false, '0.75 0.8 0.95')
    y = 103
  }
  function ensure(space: number) { if (y + space > 790) newPage() }
  function heading(value: string, size = 16) { ensure(size + 20); text(value, margin, y, size, true); y += size + 14 }
  function tableRow(label: string, value: string, index: number) {
    const left = wrap(label, 150), right = wrap(value, usable - 180)
    const rows = Math.max(left.length, right.length)
    for (let offset = 0; offset < rows;) {
      ensure(26)
      const count = Math.min(rows - offset, Math.max(1, Math.floor((790 - y - 12) / 13))), h = count * 13 + 12
      rect(margin, y, usable, h, index % 2 === 0 ? '0.95 0.96 0.98' : '0.99 0.99 0.99')
      left.slice(offset, offset + count).forEach((line, i) => text(line, margin + 8, y + 6 + i * 13, 9, true))
      right.slice(offset, offset + count).forEach((line, i) => text(line, margin + 173, y + 6 + i * 13))
      y += h; offset += count
    }
  }
  newPage(); heading('Relatório de configuração', 21); heading(batch.model, 13)
  batchSummaryRows(batch).forEach(([key, value], i) => tableRow(key, value, i))
  y += 20; heading('Resumo das tentativas', 14)
  function summaryHeader() { ensure(26); rect(margin, y, usable, 24, '0.9 0.92 0.96'); [['POS.', 0], ['SN', 58], ['SINAL', 285], ['RESULTADO', 375]].forEach(([label, x]) => text(String(label), margin + Number(x) + 8, y + 7, 8, true)); y += 24 }
  summaryHeader()
  if (!batch.attempts.length) tableRow('Tentativas', 'Nenhuma tentativa registrada.', 0)
  batch.attempts.forEach((item, i) => {
    if (y + 48 > 790) { newPage(); heading('Resumo das tentativas (continuação)', 14); summaryHeader() }
    rect(margin, y, usable, 42, i % 2 ? '0.99 0.99 0.99' : '0.95 0.96 0.98')
    text(`${item.position}.${item.attempt}`, margin + 8, y + 8, 8)
    text(item.serial, margin + 66, y + 8, 8)
    text(item.power === null ? 'Não medida' : item.power.toFixed(4), margin + 293, y + 8, 8)
    wrap(item.result, 120, 8).forEach((line, index) => text(line, margin + 383, y + 7 + index * 11, 8, true)); y += 42
  })
  for (const item of batch.attempts) {
    newPage(); heading(`Posição ${item.position} | Tentativa ${item.attempt}`, 19)
    attemptReportRows(item).forEach(([key, value], i) => tableRow(key, value, i))
    y += 14; ensure(205); heading('Evidências', 14)
    const top = y
    ;['Potência óptica', 'Número de série'].forEach((label, index) => {
      const x = margin + index * ((usable + 12) / 2), w = (usable - 12) / 2
      rect(x, top, w, 160, '0.91 0.92 0.94'); text(label, x + 10, top + 10, 10, true)
      const image = index === 0 ? evidenceImages.get(item.id)?.power : evidenceImages.get(item.id)?.serial
      if (image) {
        const name = 'Evidence' + pdfImages.length
        pdfImages.push({ name, image })
        const scale = Math.min((w - 16) / image.width, 112 / image.height), iw = image.width * scale, ih = image.height * scale
        content += 'q ' + iw.toFixed(2) + ' 0 0 ' + ih.toFixed(2) + ' ' + (x + (w - iw) / 2).toFixed(2) + ' ' + (height - top - 30 - ih).toFixed(2) + ' cm /' + name + ' Do Q\n'
      } else {
        text(batch.mode === 'mock' ? 'Placeholder do ambiente de simulação.' : 'Captura indisponível no servidor local.', x + 10, top + 65, 8)
        text(batch.mode === 'mock' ? 'Nenhuma imagem técnica foi capturada.' : 'Verifique o arquivo e a permissão CORS.', x + 10, top + 81, 8, false, '0.4 0.4 0.4')
      }
      text(index === 0 ? '01_POTENCIA_PON.png' : '02_SN_ONU.png', x + 10, top + 145, 7, false, '0.4 0.4 0.4')
    }); y += 172
  }
  finishPage()
  const encode = (value: string) => Uint8Array.from(value, char => char.charCodeAt(0) & 255)
  const combine = (chunks: Uint8Array[]) => { const out = new Uint8Array(chunks.reduce((sum, item) => sum + item.length, 0)); let offset = 0; for (const chunk of chunks) { out.set(chunk, offset); offset += chunk.length }; return out }
  const objects: Uint8Array[] = [], reserve = () => { objects.push(new Uint8Array()); return objects.length }, put = (id: number, value: string | Uint8Array) => { objects[id - 1] = typeof value === 'string' ? encode(value) : value }
  const catalog = reserve(), pageTree = reserve(), font = reserve(), boldFont = reserve()
  put(font, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'); put(boldFont, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>')
  const imageRefs: string[] = []
  pdfImages.forEach(({ name, image }) => { const id = reserve(); put(id, combine([encode(`<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`), image.bytes, encode('\nendstream')])); imageRefs.push(`${"/" + name} ${id} 0 R`) })
  const pageIds: number[] = []
  pages.forEach(stream => { const page = reserve(), contents = reserve(), bytes = encode(stream); pageIds.push(page); put(contents, combine([encode(`<< /Length ${bytes.length} >>\nstream\n`), bytes, encode('\nendstream')])); put(page, `<< /Type /Page /Parent ${pageTree} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${font} 0 R /F2 ${boldFont} 0 R >> /XObject << ${imageRefs.join(' ')} >> >> /Contents ${contents} 0 R >>`) })
  put(catalog, `<< /Type /Catalog /Pages ${pageTree} 0 R >>`); put(pageTree, `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`)
  const chunks = [encode('%PDF-1.4\n%âãÏÓ\n')], offsets = [0]; let length = chunks[0].length
  objects.forEach((object, i) => { offsets.push(length); const chunk = combine([encode(`${i + 1} 0 obj\n`), object, encode('\nendobj\n')]); chunks.push(chunk); length += chunk.length })
  const xref = length
  chunks.push(encode(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`))
  return new Blob([combine(chunks).buffer as ArrayBuffer], { type: 'application/pdf' })
}



function SingleOnuPanel({ queue, lang, terminalAutoScroll, onOpenPdf, onDownloadPdf, pdfBusy }: { queue: ReturnType<typeof useBatchConfigurator>; lang: Language; terminalAutoScroll: boolean; onOpenPdf: (batch: ConfigBatch) => Promise<void>; onDownloadPdf: (batch: ConfigBatch) => Promise<void>; pdfBusy: boolean }) {
  const l = (pt: string, en: string) => lang === 'pt' ? pt : en
  const [model, setModel] = useState<BatchModel>('ZTE F6600P branca')
  const [allowNoFiber, setAllowNoFiber] = useState(true)
  const [dismissedId, setDismissedId] = useState<string | null>(null)
  const [panelTab, setPanelTab] = useState<'devices' | 'logs' | 'reports'>('devices')
  const status = (value: string) => lang === 'pt' ? value : ({ 'EM ANDAMENTO': 'RUNNING', 'CONCLUÍDO': 'COMPLETED', 'ENCERRADO PELO OPERADOR': 'STOPPED BY OPERATOR', 'CONFIGURADA': 'CONFIGURED', 'REPROVADA': 'REJECTED', 'REPROVADA NO SINAL': 'SIGNAL REJECTED', 'FALHA TÉCNICA NO TESTE': 'TECHNICAL TEST FAILURE', 'INTERROMPIDA': 'INTERRUPTED' }[value] || value)
  const terminal = useRef<HTMLDivElement | null>(null)
  const userIsNearBottomRef = useRef(true)
  const prevLogLengthRef = useRef(0)
  const terminalBatchIdRef = useRef<string | undefined>(undefined)
  const latest = queue.history.find(item => item.unitary === true)
  const batch = latest && latest.id !== dismissedId ? latest : null
  const logs = batch?.logs || []
  const attempt = batch?.attempts[batch.attempts.length - 1]
  const complete = batch?.status === 'CONCLUÍDO' && attempt?.result === 'CONFIGURADA'
  const running = batch?.status === 'EM ANDAMENTO' && batch.workerSubmitted === true
  const files = batchModelFiles(running && batch ? batch.model : model)
  const confirmed = (value?: string) => value === 'CONFIRMADO PELO BOT' || value === 'DISPENSADO'
  const stage = batch?.workerSubmitted !== true ? 0 : complete ? 6 : batch?.unitStage || (confirmed(attempt?.adminPassword) ? 6 : confirmed(attempt?.backup) ? 5 : confirmed(attempt?.firmware) ? 4 : attempt?.optical !== 'PENDENTE' && attempt?.serial ? 3 : attempt ? 2 : 1)
  const steps = [l(`Login Inicial (${queue.targetIp})`, `Initial Login (${queue.targetIp})`), l('Leitura de SN e Sinal + Prints (Com ou Sem Fibra)', 'Read Serial and Signal + Screenshots (With or Without Fiber)'), l('Envio de Firmware (.bin) + Reboot', 'Firmware Upload (.bin) + Reboot'), l('Restauração de Backup DNS (.bin) + Reboot', 'DNS Backup Restore (.bin) + Reboot'), l('Validação / Troca da Senha Admin', 'Validate / Change Admin Password'), l('Configuração Wi-Fi 2.4 GHz & 5 GHz (Confirmação no Painel)', 'Configure Wi-Fi 2.4 GHz & 5 GHz (Panel Confirmation)')]
  useEffect(() => {
    if (terminalBatchIdRef.current !== batch?.id) {
      terminalBatchIdRef.current = batch?.id
      prevLogLengthRef.current = 0
      userIsNearBottomRef.current = true
    }
    if (logs.length > prevLogLengthRef.current && terminalAutoScroll === true && userIsNearBottomRef.current && panelTab === 'logs' && terminal.current) {
      terminal.current.scrollTo({ top: terminal.current.scrollHeight, behavior: 'auto' })
    }
    prevLogLengthRef.current = logs.length
  }, [logs.length, batch?.id, panelTab, terminalAutoScroll])
  return <section aria-labelledby="single-onu-title" className="w-full min-w-0 rounded-3xl border border-violet-500/30 bg-card/80 p-5 sm:p-6 space-y-6">
    <div><h2 id="single-onu-title" className="text-xl font-bold flex items-start gap-3"><Router className="shrink-0 mt-1" size={24} /><span>{l('Configurador Unitário · 1 ONU por Vez (Cabo de Rede LAN · Com ou Sem Fibra)', 'Single-ONU Configurator · One ONU at a Time (LAN Cable · With or Without Fiber)')}</span></h2><p className="mt-2 text-xs text-muted-foreground">{l('Um ciclo por comando do operador. Acessos e padrão CTO são os definidos no card acima.', 'One cycle per operator command. Credentials and CTO baseline use the card above.')}</p></div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5"><div className="space-y-4"><label className="block text-sm font-semibold">{l('Modelo da ONU', 'ONU Model')}<select value={running && batch ? batch.model : model} disabled={queue.running || queue.connection === 'connecting'} onChange={e => setModel(e.target.value as BatchModel)} className="mt-2 w-full rounded-xl border border-border bg-background p-3">{(['ZTE F6600P branca', 'ZTE F6201B', 'ZTE F6600P preta', 'ZTE F670L'] as const).map(item => <option key={item}>{item}</option>)}</select></label><label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={batch ? batch.allowNoFiber === true : allowNoFiber} disabled={queue.running || !!batch} onChange={e => setAllowNoFiber(e.target.checked)} className="mt-1 accent-violet-500" />{l('Continuar mesmo sem fibra óptica (Modo Bancada / LAN)', 'Continue without optical fiber (Bench / LAN Mode)')}</label><p className="text-xs text-muted-foreground">{l('Dispensa apenas a ausência de potência. Sinal medido abaixo de CTO − 0,50 dBm continua reprovado.', 'Only absent optical power is waived. A measured signal below CTO − 0.50 dBm still fails.')}</p></div><dl className="min-w-0 space-y-3 rounded-2xl border border-border bg-background/40 p-4 text-xs"><div><dt className="text-muted-foreground">Firmware · .bin</dt><dd className="font-mono break-all mt-1">{files.firmware || l('Dispensado na variante preta', 'Waived for black variant')}</dd></div><div><dt className="text-muted-foreground">Backup · .bin</dt><dd className="font-mono break-all mt-1">{files.backup}</dd></div><div><dt>SSID 2.4 GHz / 5 GHz</dt><dd className="font-mono break-all mt-1">{batch?.ssid24 || queue.targetSsids.ssid24} / {batch?.ssid5 || queue.targetSsids.ssid5}</dd></div></dl></div>
    <ol className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{steps.map((label, index) => <li key={label} aria-current={batch && !complete && index + 1 === stage ? 'step' : undefined} className={`rounded-2xl border p-4 text-sm ${batch && (complete || index + 1 < stage) ? 'border-emerald-500/40 bg-emerald-500/10' : batch && index + 1 === stage ? 'border-violet-500 bg-violet-500/10' : 'border-border'}`}><span className="block text-xs font-mono mb-2">{index + 1}/6 {batch && (complete || index + 1 < stage) ? '✓' : ''}</span>{label}</li>)}</ol>
    <div><p className="text-sm mb-2" role="status">{complete ? l('ONU configurada. Conecte a próxima ONU e clique em Preparar Próxima ONU.', 'ONU configured. Connect the next ONU and click Prepare Next ONU.') : batch ? batch.status : l('Pronto para configurar uma única ONU.', 'Ready to configure one ONU.')} · {batch?.progress || 0}%</p><div role="progressbar" aria-label={l('Progresso unitário', 'Single-ONU progress')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={batch?.progress || 0} className="h-2 rounded-full bg-background overflow-hidden"><div className="h-full bg-violet-500 transition-[width] duration-500" style={{ width: `${batch?.progress || 0}%` }} /></div></div>
    {attempt && <p className="text-sm break-words">SN: <strong className="font-mono">{attempt.serial || '—'}</strong> · {attempt.power === null ? '-- dBm' : `${attempt.power.toFixed(4)} dBm`} · {attempt.optical}</p>}
    {queue.notice && <p role="alert" className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4 text-sm text-amber-600 dark:text-amber-300">{zteOperationalText(queue.notice, lang)}</p>}
    <div className="flex flex-wrap gap-3"><button type="button" disabled={queue.running || queue.connection === 'connecting' || !queue.ready || complete} onClick={() => { queue.startAutomation({ unitary: true, model, allowNoFiber: batch?.allowNoFiber ?? allowNoFiber }) }} className="rounded-xl bg-violet-600 text-white px-5 py-3 text-sm font-bold disabled:opacity-40">{l('Configurar 1 ONU Agora →', 'Configure 1 ONU Now →')}</button><button type="button" disabled={!batch?.endedAt || pdfBusy} onClick={() => { if (batch) void onOpenPdf(batch) }} className="rounded-xl border border-border px-4 py-3 text-sm disabled:opacity-40">{l('Abrir PDF desta ONU', 'Open This ONU’s PDF')}</button><button type="button" disabled={!batch || running || queue.running || queue.connection === 'connecting'} onClick={() => { if (batch) { setDismissedId(batch.id) } }} className="rounded-xl border border-border px-4 py-3 text-sm disabled:opacity-40">{l('Preparar Próxima ONU', 'Prepare Next ONU')}</button>{(queue.running || queue.connection === 'connecting') && <button type="button" onClick={queue.cancelAutomation} className="bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl px-4 py-3 flex items-center justify-center gap-2"><X size={16} />{l('Cancelar Automação', 'Cancel Automation')}</button>}</div>
          <div role="tablist" aria-label={l('Acompanhamento da fila', 'Queue tracking')} className="flex overflow-x-auto border-b border-border/60 px-3 sm:px-5 gap-1">
            {(['devices', 'logs', 'reports'] as const).map((tab, index) => <button key={tab} id={`unit-tab-${tab}`} role="tab" aria-selected={panelTab === tab} aria-controls={`unit-panel-${tab}`} tabIndex={panelTab === tab ? 0 : -1} onKeyDown={event => { if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const tabs = ['devices', 'logs', 'reports'] as const; const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3; setPanelTab(tabs[next]); document.getElementById(`unit-tab-${tabs[next]}`)?.focus() } }} onClick={() => setPanelTab(tab)} className={`shrink-0 border-b-2 px-3 py-4 text-xs font-semibold transition-colors ${panelTab === tab ? 'border-violet-400 text-violet-300' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{tab === 'devices' ? l('Equipamentos e tentativas', 'Devices and attempts') : tab === 'logs' ? l('Registro detalhado', 'Detailed log') : l('Relatórios e SN', 'Reports and serials')}</button>)}
          </div>
          <div id="unit-panel-devices" role="tabpanel" aria-labelledby="unit-tab-devices" hidden={panelTab !== 'devices'} className="p-5 sm:p-6">
            <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="text-[10px] tracking-wider text-muted-foreground border-b border-border"><tr>{['POS.', l('NÚMERO DE SÉRIE', 'SERIAL NUMBER'), l('SINAL (dBm)', 'SIGNAL (dBm)'), l('RESULTADO', 'RESULT')].map(label => <th key={label} className="px-3 py-3 whitespace-nowrap">{label}</th>)}</tr></thead><tbody>{batch?.attempts.map(item => <tr key={item.id} className="border-b border-border/40"><td className="px-3 py-4 font-mono">{item.position}.{item.attempt}</td><td className="px-3 py-4 font-mono whitespace-nowrap">{item.serial}</td><td className="px-3 py-4 font-mono" title={item.opticalWarning}>{item.power === null ? '—' : item.power.toFixed(4)}</td><td className="px-3 py-4"><span className={`rounded-full px-2 py-1 text-[10px] whitespace-nowrap ${item.result === 'CONFIGURADA' ? 'bg-emerald-500/10 text-emerald-400' : item.result.includes('REPROVADA') || item.result === 'FALHA TÉCNICA NO TESTE' || item.result === 'INTERROMPIDA' ? 'bg-red-500/10 text-red-400' : 'bg-violet-500/10 text-violet-300'}`}>{status(item.result)}</span>{item.optical === 'SEM FIBRA (MODO BANCADA)' && <p className="mt-2 text-[10px] text-amber-400">{l('SEM FIBRA (MODO BANCADA)', 'NO FIBER (BENCH MODE)')}</p>}{item.optical === 'APROVADA COM AVISO' && <p className="mt-2 text-[10px] text-amber-400">{l('APROVADA COM AVISO', 'PASSED WITH WARNING')}</p>}</td></tr>)}{!batch?.attempts.length && <tr><td colSpan={4} className="py-12 text-center text-muted-foreground">{l('Nenhuma tentativa registrada. Inicie uma fila.', 'No attempts recorded. Start a queue.')}</td></tr>}</tbody></table></div>
          </div>
          <div id="unit-panel-logs" role="tabpanel" aria-labelledby="unit-tab-logs" hidden={panelTab !== 'logs'} className="p-3 sm:p-5">
            <div style={{ fontFamily: 'Consolas, "Courier New", monospace' }} className="rounded-2xl border border-slate-800 bg-[#132b3a] text-[#dce9f3] p-4 font-mono shadow-inner"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3 text-[11px] text-slate-400"><span className="flex items-center gap-2"><Terminal size={14} />Assistant Log Console — bash</span><span className="text-amber-300">{queue.connection === 'python' ? l('AUTOMAÇÃO ZTE · TEMPO REAL', 'ZTE AUTOMATION · REAL TIME') : l('AGUARDANDO CONEXÃO DA ONU', 'WAITING FOR ONU CONNECTION')}</span></div><div ref={terminal} onScroll={event => { const el = event.currentTarget; userIsNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight <= 45 }} role="log" aria-label={l('Registro técnico do Configurador ZTE', 'ZTE configurator technical log')} aria-live="polite" className="min-h-[260px] max-h-[420px] overflow-y-auto space-y-2 text-[11px] leading-relaxed custom-scrollbar">{!logs.length && <p className="text-slate-500">{l('Aguardando o início da fila…', 'Waiting for the queue to start…')}</p>}{logs.map(log => <div key={log.id} className="flex gap-3"><span className="shrink-0 text-slate-600">{new Date(log.time).toLocaleTimeString(lang === 'pt' ? 'pt-BR' : 'en-US', { hour12: false })}</span><span className={`min-w-0 break-words ${log.type === 'success' ? 'text-emerald-400' : log.type === 'warning' || log.type === 'error' ? 'text-amber-400' : log.type === 'command' ? 'text-cyan-400' : 'text-[#dce9f3]'} whitespace-pre-wrap`}>{log.type === 'command' ? '$ ' : ''}{zteOperationalText(lang === 'pt' ? log.pt : log.en, lang)}</span></div>)}</div><div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-500">Zseven Automation Bot · {queue.question ? l('Aguardando operador', 'Waiting for operator') : queue.running ? l('Em execução', 'Running') : l('Aguardando', 'Waiting')} · UTF-8</div></div>
          </div>
          <div id="unit-panel-reports" role="tabpanel" aria-labelledby="unit-tab-reports" hidden={panelTab !== 'reports'} className="space-y-4">
            <div className="flex flex-wrap gap-2"><button type="button" disabled={!batch?.endedAt || pdfBusy} onClick={() => { if (batch) void onOpenPdf(batch) }} className="rounded-xl border border-border px-4 py-3 text-sm disabled:opacity-40"><FileText size={14} />{l('Abrir PDF desta ONU', 'Open This ONU’s PDF')}</button><button type="button" disabled={!batch?.endedAt || pdfBusy} onClick={() => { if (batch) void onDownloadPdf(batch) }} className="rounded-xl border border-border px-4 py-3 text-sm disabled:opacity-40"><DownloadCloud size={14} />{l('Baixar PDF...', 'Download PDF...')}</button></div>
            <label className="block text-xs space-y-2"><span>{l('SN configurado', 'Configured serial')}</span><textarea readOnly rows={3} value={batch ? configuredAttempts(batch).map(item => item.serial).join('\n') : ''} className="w-full rounded-xl border border-border bg-background p-3 font-mono" /></label>
            {batch ? <SerialExportActions batch={batch} lang={lang} /> : <p className="text-sm text-muted-foreground">{l('Nenhum relatório unitário disponível.', 'No single-ONU report available.')}</p>}
          </div>
  </section>
}

function AssistantPanelModule({ lang, greetingMessage, queue, terminalAutoScroll, startAutomation, onModelChange, reportsOnly = false, onOpenConfigurator, onManual }: {
  lang: Language; greetingMessage: string; queue: ReturnType<typeof useBatchConfigurator>; terminalAutoScroll: boolean
  startAutomation: () => void; onModelChange: (model: string) => void; reportsOnly?: boolean; onOpenConfigurator?: () => void; onManual?: () => void
}) {
  const l = (pt: string, en: string) => lang === 'pt' ? pt : en
  const [panelTab, setPanelTab] = useState<'devices' | 'logs' | 'reports'>(reportsOnly ? 'reports' : 'devices')
  const [showPasswords, setShowPasswords] = useState({ password1: false, password2: false })
  const [filter, setFilter] = useState('')
  const [newAccess, setNewAccess] = useState({ user: '', password: '' })
  const [showNewPassword, setShowNewPassword] = useState(false)
  const accessDialog = useRef<HTMLDivElement>(null)
  const replaceButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    setNewAccess({ user: '', password: '' }); setShowNewPassword(false)
    if (reportsOnly) return
    if (queue.question?.kind === 'replace') replaceButton.current?.focus()
    if (queue.question?.kind !== 'access') return
    const previous = document.activeElement as HTMLElement | null
    accessDialog.current?.querySelector<HTMLInputElement>('input')?.focus()
    function trap(event: KeyboardEvent) {
      if (event.key !== 'Tab') return
      const elements = accessDialog.current?.querySelectorAll<HTMLElement>('input, button:not(:disabled)')
      if (!elements?.length) return
      const first = elements[0], last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', trap)
    return () => { document.removeEventListener('keydown', trap); previous?.focus() }
  }, [queue.question?.id, queue.question?.kind, reportsOnly])
  const [pdf, setPdf] = useState<{ url: string; name: string } | null>(null)
  const [pdfBusy, setPdfBusy] = useState(false)
  const pdfBusyRef = useRef(false)
  const mounted = useRef(true)
  const terminal = useRef<HTMLDivElement>(null)
  const userIsNearBottomRef = useRef(true)
  const prevLogLengthRef = useRef(0)
  const terminalBatchIdRef = useRef<string | undefined>(undefined)
  const pdfFrame = useRef<HTMLIFrameElement>(null)
  const modal = useRef<HTMLDivElement>(null)
  const batch = queue.activeBatch || queue.selected
  const logs = batch?.logs || []
  const blackModel = queue.model === 'ZTE F6600P preta'
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const date = (value: string) => new Date(value).toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US', { hour12: false })
  const reports = queue.history.filter(item => item.status !== 'EM ANDAMENTO' && normalize(`${date(item.startedAt)} ${item.startedAt} ${item.model} ${item.status} ${item.id}`).includes(normalize(filter)))
  const selectedReport = queue.selected?.status !== 'EM ANDAMENTO' ? queue.selected : null
  const inputClass = 'w-full min-w-0 rounded-xl border border-border/70 bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50'
  const secondary = 'inline-flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-xs font-semibold hover:bg-muted/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])
  useEffect(() => {
    if (terminalBatchIdRef.current !== batch?.id) {
      terminalBatchIdRef.current = batch?.id
      prevLogLengthRef.current = 0
      userIsNearBottomRef.current = true
    }
    if (logs.length > prevLogLengthRef.current && terminalAutoScroll === true && userIsNearBottomRef.current && panelTab === 'logs' && terminal.current) {
      terminal.current.scrollTo({ top: terminal.current.scrollHeight, behavior: 'auto' })
    }
    prevLogLengthRef.current = logs.length
  }, [logs.length, batch?.id, panelTab, terminalAutoScroll])
  useEffect(() => {
    if (!pdf) return
    const previous = document.activeElement as HTMLElement | null
    modal.current?.focus()
    function keydown(event: KeyboardEvent) {
      if (event.key === 'Escape') setPdf(null)
      if (event.key === 'Tab' && modal.current) {
        const elements = modal.current.querySelectorAll<HTMLElement>('button, a[href], iframe, [tabindex="0"]')
        const first = elements[0], last = elements[elements.length - 1]
        if (event.shiftKey && (document.activeElement === first || document.activeElement === modal.current)) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', keydown)
    return () => { URL.revokeObjectURL(pdf.url); document.removeEventListener('keydown', keydown); previous?.focus() }
  }, [pdf])
  async function openPdf(report: ConfigBatch | null) {
    if (!report || pdfBusyRef.current) return
    pdfBusyRef.current = true; setPdfBusy(true)
    try {
      const blob = await createBatchPdf(report)
      if (mounted.current) setPdf({ url: URL.createObjectURL(blob), name: report.pdfFileName })
    } catch { if (mounted.current) queue.setNotice(l('Não foi possível gerar o PDF.', 'Unable to generate the PDF.')) }
    finally { pdfBusyRef.current = false; if (mounted.current) setPdfBusy(false) }
  }
  async function downloadPdf(report: ConfigBatch | null) {
    if (!report || pdfBusyRef.current) return
    pdfBusyRef.current = true; setPdfBusy(true)
    type WritableFile = { createWritable: () => Promise<{ write: (blob: Blob) => Promise<void>; close: () => Promise<void>; abort: () => Promise<void> }> }
    const pickerWindow = window as typeof window & { showSaveFilePicker?: (options: { suggestedName: string; types: { description: string; accept: Record<string, string[]> }[] }) => Promise<WritableFile> }
    try {
      // Open the native picker synchronously from the click, before PDF/logo awaits consume user activation.
      const handle = pickerWindow.showSaveFilePicker ? await pickerWindow.showSaveFilePicker({ suggestedName: safePdfFileName(report.pdfFileName), types: [{ description: 'PDF', accept: { 'application/pdf': ['.pdf'] } }] }) : null
      const blob = await createBatchPdf(report)
      if (handle) {
        const writable = await handle.createWritable()
        try { await writable.write(blob); await writable.close() }
        catch (error) { await writable.abort().catch(() => undefined); throw error }
      } else {
        const url = URL.createObjectURL(blob), link = document.createElement('a')
        link.href = url; link.download = safePdfFileName(report.pdfFileName); document.body.appendChild(link); link.click(); link.remove()
        setTimeout(() => URL.revokeObjectURL(url), 60000)
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError') && mounted.current) queue.setNotice(l('Não foi possível salvar o PDF. Tente novamente.', 'Unable to save the PDF. Please try again.'))
    } finally { pdfBusyRef.current = false; if (mounted.current) setPdfBusy(false) }
  }
  function printPdf() {
    try { pdfFrame.current?.contentWindow?.focus(); pdfFrame.current?.contentWindow?.print() }
    catch { queue.setNotice(l('Use o botão de impressão do visualizador de PDF do navegador.', 'Use the browser PDF viewer print button.')) }
  }
  const status = (value: string) => lang === 'pt' ? value : ({ 'EM ANDAMENTO': 'RUNNING', 'CONCLUÍDO': 'COMPLETED', 'ENCERRADO PELO OPERADOR': 'STOPPED BY OPERATOR', 'CONFIGURADA': 'CONFIGURED', 'REPROVADA': 'REJECTED', 'REPROVADA NO SINAL': 'SIGNAL REJECTED', 'FALHA TÉCNICA NO TESTE': 'TECHNICAL TEST FAILURE', 'INTERROMPIDA': 'INTERRUPTED' }[value] || value)
  const reportContent = (<div id="assistant-panel-reports" role={reportsOnly ? "region" : "tabpanel"} aria-labelledby={reportsOnly ? "report-center-title" : "assistant-tab-reports"} hidden={!reportsOnly && panelTab !== 'reports'} className="p-5 sm:p-6 space-y-4">
            <div><label htmlFor="assistant-report-filter" className="block mb-2 text-xs font-semibold">{l('Buscar por data, modelo, situação ou lote', 'Search by date, model, status or batch')}</label><div className="flex gap-2"><input id="assistant-report-filter" type="text" className={inputClass} value={filter} onChange={event => setFilter(event.target.value)} /><button className={secondary} onClick={queue.loadHistory}><RefreshCw size={14} /><span>{l('Atualizar', 'Refresh')}</span></button></div></div>
            <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="text-[10px] tracking-wider text-muted-foreground"><tr>{[l('DATA / HORA', 'DATE / TIME'), l('MODELO', 'MODEL'), 'SNs', l('SITUAÇÃO', 'STATUS')].map(label => <th key={label} className="px-3 py-3 whitespace-nowrap">{label}</th>)}</tr></thead><tbody>{reports.map(report => <tr key={report.id} className={`border-t border-border/50 cursor-pointer hover:bg-violet-500/5 ${queue.selectedId === report.id ? 'bg-violet-500/10' : ''}`} onClick={() => queue.setSelectedId(report.id)}><td className="p-3 whitespace-nowrap"><button className="text-left hover:text-violet-300 focus-visible:outline focus-visible:outline-violet-400" aria-pressed={queue.selectedId === report.id} onClick={() => queue.setSelectedId(report.id)} title={report.id}>{date(report.startedAt)}</button></td><td className="p-3 whitespace-nowrap">{report.model}{reportsOnly && <span className="ml-2 text-[10px] text-muted-foreground">{report.mode === 'mock' ? l('Gerado localmente', 'Generated locally') : "Bancada Local"}</span>}</td><td className="p-3 font-mono">{configuredAttempts(report).length}</td><td className="p-3 text-[10px] font-semibold whitespace-nowrap">{status(report.status)}</td></tr>)}{!reports.length && <tr><td colSpan={4} className="py-10 text-center text-muted-foreground">{l('Nenhum lote encerrado encontrado.', 'No finished batches found.')}</td></tr>}</tbody></table></div>
            <div className="flex flex-wrap gap-2"><button className={secondary} disabled={!selectedReport || pdfBusy} onClick={() => void openPdf(selectedReport)}><FileText size={14} />{l('Abrir PDF selecionado', 'Open selected PDF')}</button><button className={secondary} disabled={!selectedReport || pdfBusy} onClick={() => void downloadPdf(selectedReport)}><DownloadCloud size={14} />{l('Baixar PDF...', 'Download PDF...')}</button></div>
            <p className="text-xs text-muted-foreground break-words">{selectedReport ? `${configuredAttempts(selectedReport).length} ${l('SN(s) configurado(s), na ordem de conclusão. PDF:', 'serial(s) configured, in completion order. PDF:')} ${selectedReport.pdfFileName}` : l('Selecione um lote para consultar os SNs e o PDF.', 'Select a batch to view its serials and PDF.')}</p>
            <textarea readOnly aria-label={l('SNs configurados', 'Configured serials')} className={`${inputClass} min-h-[140px] font-mono resize-y`} value={selectedReport ? configuredAttempts(selectedReport).map(item => item.serial).join('\n') : ''} />
            {reportsOnly && selectedReport && <SerialExportActions key={selectedReport.id} batch={selectedReport} lang={lang} />}
          </div>)
  const pdfViewer = (pdf && <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm p-2 sm:p-5 flex" onClick={event => { if (event.target === event.currentTarget) setPdf(null) }}><div ref={modal} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="batch-pdf-title" className="flex flex-col w-full max-w-6xl mx-auto h-full min-h-0 rounded-2xl border border-border bg-card overflow-hidden outline-none"><div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 border-b border-border"><h2 id="batch-pdf-title" className="min-w-0 flex-1 text-xs sm:text-sm font-semibold break-words">{pdf.name}</h2><div className="flex gap-2"><button className={secondary} onClick={printPdf}>{l('Imprimir', 'Print')}</button><button className={secondary} onClick={() => setPdf(null)}><X size={16} />{l('Fechar', 'Close')}</button></div></div><p className="px-4 py-2 text-[11px] text-muted-foreground">{l("Evidências do serviço de automação são incorporadas quando disponíveis; simulações usam placeholders identificados.", "Available automation service evidence is embedded; simulations use labeled placeholders.")} <a href={pdf.url} target="_blank" rel="noopener noreferrer" className="text-violet-400 underline">{l('Abrir em nova aba', 'Open in a new tab')}</a></p><iframe ref={pdfFrame} src={pdf.url} title={l('Relatório de configuração em PDF', 'Configuration PDF report')} className="w-full flex-1 min-h-0 bg-slate-200" /></div></div>)
  if (reportsOnly) return <section className="space-y-6 min-w-0"><div className="flex flex-wrap items-center justify-between gap-3"><h1 id="report-center-title" className="text-2xl font-bold">{l('Central de Relatórios', 'Report Center')}</h1><button type="button" onClick={onOpenConfigurator} className={secondary}>{l('Abrir BOT de Automação', 'Open Automation BOT')}</button></div><ReportCenterMetrics history={queue.history} lang={lang} />{queue.running && <p className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-3 text-sm">{l("Existe uma fila em andamento. Volte ao Configurador para acompanhar ou responder às solicitações do serviço de automação.", "A queue is running. Return to the Configurator to monitor it or answer automation service prompts.")}</p>}{queue.notice && <p role="status" className="text-sm text-amber-300">{zteOperationalText(queue.notice, lang)}</p>}<div className="rounded-3xl border border-border bg-card/80 overflow-hidden">{reportContent}</div>{pdfViewer}</section>
  return (
    <section className="space-y-6 min-w-0 animate-in fade-in duration-500">
      <MobileBotShowcase lang={lang} />
      <div className="hidden md:block space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0"><h1 className="text-2xl sm:text-3xl bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent font-extrabold tracking-tight drop-shadow-[0_0_18px_rgba(139,92,246,0.22)]">{greetingMessage}</h1><p className="mt-2 text-sm text-muted-foreground">{l('Configuração em lote de equipamentos ZTE', 'ZTE device batch configuration')}</p></div>
        {(queue.connection === 'connecting' || queue.connection === 'disconnected' || queue.running) && <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-400">{queue.connection === 'connecting' ? l("Preparando automação…", "Preparing automation…") : queue.connection === 'disconnected' ? l("Conexão interrompida", "Connection interrupted") : queue.activeBatch?.mode === 'mock' ? l('Execução local · sem conexão com ONU', 'Local execution · no ONU connection') : l("Automação Ativa · Tempo Real", "Active Automation · Real Time")}</span>}
      </div>
      {queue.notice && <div role="alert" className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4 text-sm break-words">{zteOperationalText(queue.notice, lang)}</div>}
      {queue.connection === 'disconnected' && <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm">{l("Reconecte à bancada para consultar o estado do lote.", "Reconnect to the bench to retrieve the run status.")}</p><button className={secondary} onClick={queue.reconnect}>{l("Reconectar ao serviço de automação", "Reconnect to automation service")}</button></div>}
      {queue.question?.kind === 'replace' && <div role="alert" className="rounded-2xl border border-amber-500/50 bg-amber-500/10 p-5 space-y-4"><p className="font-semibold text-amber-200">{queue.question.reason} — {l('Troque a ONU reprovada e conecte outra unidade do mesmo modelo em', 'Replace the rejected ONU and connect another unit of the same model at')} 192.168.1.1. {l('Deseja repetir esta posição da fila?', 'Repeat this queue position?')}</p><p className="text-xs text-muted-foreground">{l('Posição', 'Position')} {queue.question.position} · {l('Tentativa registrada', 'Recorded attempt')} {queue.question.attempt}</p><div className="flex flex-wrap gap-3"><button ref={replaceButton} className="rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40" disabled={queue.commandPending || queue.connection === 'disconnected' || queue.connection === 'connecting'} onClick={queue.confirmReplacement}>{l('Confirmar troca da ONU e testar novamente (Mesma Posição)', 'Confirm ONU replacement and retest (Same Position)')}</button><button className={secondary} onClick={queue.cancelAutomation}>{l('Encerrar fila', 'End queue')}</button></div></div>}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6 items-start">
        <form className="bg-card/80 backdrop-blur-md border border-violet-900/40 rounded-3xl p-5 space-y-5 min-w-0" onSubmit={event => { event.preventDefault(); startAutomation() }}>
          <div className="flex items-center gap-3"><Z7RobotIcon className="w-11 h-11 shrink-0" /><div><h2 className="font-bold">{l('Preparar configuração', 'Prepare configuration')}</h2><p className="text-xs text-muted-foreground mt-1">{l('Defina o perfil e acessos da fila', 'Set queue profile and access')}</p></div></div>
          <label className="block text-xs font-semibold space-y-2"><span>{l('Modelo do equipamento', 'Device model')}</span><select className={inputClass} value={queue.model} disabled={queue.running || queue.connection === 'connecting'} onChange={event => { queue.chooseModel(event.target.value as BatchModel); onModelChange(event.target.value) }}>{batchModels.map(model => <option key={model} value={model}>{model}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold space-y-2"><span>{l('Quantidade', 'Quantity')}</span><input type="number" min={1} max={100} step={1} required className={inputClass} value={queue.quantity || ''} disabled={queue.running || queue.connection === 'connecting'} onChange={event => queue.setQuantity(Number(event.target.value))} /></label>
            <label className="block text-xs font-semibold space-y-2"><span>{l('Padrão CTO (dBm)', 'CTO baseline (dBm)')}</span><input type="text" inputMode="decimal" required pattern="-?[0-9]+([.,][0-9]{1,4})?" className={inputClass} value={queue.cto} disabled={queue.running || queue.connection === 'connecting'} onChange={event => queue.setCto(event.target.value)} /></label>
          </div>
          <fieldset className="space-y-3"><legend className="text-xs font-bold mb-3">{l('Etapas de configuração', 'Configuration stages')}</legend>
            <label className="flex items-start gap-2 text-sm"><input type="checkbox" disabled={queue.running || queue.connection === 'connecting'} checked={queue.allowNoFiber} onChange={event => queue.setAllowNoFiber(event.target.checked)} className="mt-1 accent-violet-500" />{l('Continuar mesmo sem fibra óptica (Modo Bancada / LAN)', 'Continue without optical fiber (Bench / LAN Mode)')}</label>
            <label className={`flex items-center gap-2 text-sm ${blackModel ? 'text-muted-foreground' : ''}`}><input type="checkbox" className="accent-violet-500" disabled={blackModel || queue.running} checked={!blackModel && queue.firmwareRequested} onChange={event => queue.setFirmwareRequested(event.target.checked)} />{l('Atualizar firmware', 'Update firmware')}</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-violet-500" disabled={queue.running || queue.connection === 'connecting'} checked={blackModel || queue.backupRequested} onChange={event => queue.setBackupRequested(event.target.checked)} />{l('Restaurar backup', 'Restore backup')}</label>
            <p className="text-[11px] leading-relaxed text-muted-foreground">{blackModel ? l('F6600P preta: backup V9.1 10P4N2 (pasta ./Backup). Atualização de firmware dispensada automaticamente.', 'Black F6600P: V9.1 10P4N2 backup (./Backup folder). Firmware update automatically waived.') : queue.model === 'ZTE F6600P branca' ? l('F6600P branca: backup Config ZXHN F6600P.bin (pasta ./Backup). Firmware exclusivo da branca na pasta ./Firmware quando solicitado.', 'White F6600P: Config ZXHN F6600P.bin backup (./Backup folder). White variant firmware in ./Firmware when requested.') : l('O bot selecionará os arquivos nas pastas ./Backup e ./Firmware deste modelo e verificará se o equipamento conectado corresponde à seleção.', 'The bot will select this model’s files in ./Backup and ./Firmware and verify that the connected device matches the selection.')}</p>
          </fieldset>
          <fieldset className="space-y-3"><legend className="text-xs font-bold mb-3">{l('Acessos ao equipamento', 'Device access')}</legend>
            {([1, 2] as const).map(index => {
              const userKey = index === 1 ? 'user1' : 'user2', passwordKey = index === 1 ? 'password1' : 'password2'
              return <div key={index} className="grid grid-cols-2 gap-3">
                <label className="block text-xs space-y-2"><span>{l('Usuário', 'User')} {index}</span><input className={inputClass} autoComplete="off" value={queue.access[userKey]} disabled={queue.running || queue.connection === 'connecting'} onChange={event => queue.setAccess(prev => ({ ...prev, [userKey]: event.target.value }))} /></label>
                <label className="block text-xs space-y-2"><span>{l('Senha', 'Password')} {index}</span><div className="relative"><input className={`${inputClass} pr-9`} autoComplete="new-password" type={showPasswords[passwordKey] ? 'text' : 'password'} value={queue.access[passwordKey]} disabled={queue.running || queue.connection === 'connecting'} onChange={event => queue.setAccess(prev => ({ ...prev, [passwordKey]: event.target.value }))} /><button type="button" className="absolute inset-y-0 right-0 px-2 text-muted-foreground" aria-label={`${showPasswords[passwordKey] ? l('Ocultar senha', 'Hide password') : l('Mostrar senha', 'Show password')} ${index}`} onClick={() => setShowPasswords(prev => ({ ...prev, [passwordKey]: !prev[passwordKey] }))}>{showPasswords[passwordKey] ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
              </div>
            })}
          </fieldset>
          <button type="submit" disabled={queue.running || queue.connection === 'connecting' || !queue.ready} className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-3 text-white text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><Play size={16} />{queue.connection === 'connecting' ? l('Conectando…', 'Connecting…') : queue.question ? l('Fila pausada', 'Queue paused') : queue.running ? l('Fila em execução', 'Queue running') : l('Iniciar fila →', 'Start queue →')}</button>
          {(queue.running || queue.connection === 'connecting') && <button type="button" onClick={queue.cancelAutomation} className="bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl px-4 py-3 flex items-center justify-center gap-2"><X size={16} />{l('Cancelar Automação', 'Cancel Automation')}</button>}
          <button type="button" onClick={onManual} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/40 px-4 py-3 text-sm text-violet-300 hover:bg-violet-500/10"><Globe size={18} />{l('Abrir Interface ZTE (Manual)', 'Open ZTE Interface (Manual)')}</button>
        </form>
        <div className="min-w-0 overflow-hidden rounded-3xl border border-border/70 bg-card/80 backdrop-blur-md">
          <div className="p-5 sm:p-6 space-y-4 border-b border-border/60">
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-4"><div className="min-w-[220px] flex-1"><h2 className="text-lg font-bold">{l('Acompanhamento da fila', 'Queue tracking')}</h2><p className="mt-1 text-xs text-muted-foreground break-words" role="status">{batch ? `${batch.model} · ${status(batch.status)} · ${configuredAttempts(batch).length}/${batch.requested}` : l('Pronto para iniciar. Prepare a ONU e configure sua fila.', 'Ready to start. Prepare the ONU and configure your queue.')}</p></div><div className="shrink-0 flex flex-wrap items-center gap-2 max-w-full"><button className={secondary} disabled={!batch || pdfBusy} onClick={() => void openPdf(batch)}><FileText size={14} />{l('Abrir relatório PDF', 'Open PDF report')}</button><button className={secondary} disabled={!queue.running || queue.activeBatch?.stopRequested || queue.connection === 'connecting' || queue.connection === 'disconnected' || queue.commandPending} onClick={queue.stopAfterCurrent}><Pause size={14} />{queue.activeBatch?.stopRequested ? l('Parada solicitada', 'Stop requested') : l('Parar após operação atual', 'Stop after current operation')}</button>{(queue.running || queue.connection === 'connecting') && <button type="button" onClick={queue.cancelAutomation} className="bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl px-4 py-3 flex items-center justify-center gap-2"><X size={16} />{l('Cancelar Automação', 'Cancel Automation')}</button>}</div></div>
            <div><label htmlFor="assistant-serial" className="block mb-2 text-[10px] font-bold tracking-widest text-muted-foreground">{l('LEITURA DO NÚMERO DE SÉRIE', 'SERIAL NUMBER SCAN')}</label><div className="flex gap-2"><input id="assistant-serial" className={`${inputClass} font-mono`} value={queue.serialInput} onChange={event => queue.setSerialInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); queue.submitSerial() } }} maxLength={40} autoComplete="off" placeholder={l('Digite ou bipe o SN da próxima ONU', 'Type or scan the next ONU serial')} /><button className={secondary} onClick={queue.submitSerial}>{l('Registrar', 'Register')}</button></div><p className="mt-2 text-[11px] text-muted-foreground">{l("Digite ou bipe o SN (opcional). A leitura oficial do SN e do sinal óptico é capturada diretamente da ONU conectada.", "Type or scan the SN (optional). Official SN and optical signal readings are captured directly from the connected ONU.")}</p></div>
            {batch && <div><div className="flex justify-between gap-3 mb-2 text-xs"><span className="min-w-0 break-words">{logs.length ? zteOperationalText(lang === 'pt' ? logs[logs.length - 1].pt : logs[logs.length - 1].en, lang) : status(batch.status)}</span><span className="font-mono text-violet-400 shrink-0">{batch.progress}%</span></div><div role="progressbar" aria-label={l('Progresso da fila', 'Queue progress')} aria-valuenow={batch.progress} aria-valuemin={0} aria-valuemax={100} className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-600 to-cyan-400 transition-[width] duration-500" style={{ width: `${batch.progress}%` }} /></div></div>}
          </div>
          <div role="tablist" aria-label={l('Acompanhamento da fila', 'Queue tracking')} className="flex overflow-x-auto border-b border-border/60 px-3 sm:px-5 gap-1">
            {(['devices', 'logs', 'reports'] as const).map((tab, index) => <button key={tab} id={`assistant-tab-${tab}`} role="tab" aria-selected={panelTab === tab} aria-controls={`assistant-panel-${tab}`} tabIndex={panelTab === tab ? 0 : -1} onKeyDown={event => { if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const tabs = ['devices', 'logs', 'reports'] as const; const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3; setPanelTab(tabs[next]); document.getElementById(`assistant-tab-${tabs[next]}`)?.focus() } }} onClick={() => setPanelTab(tab)} className={`shrink-0 border-b-2 px-3 py-4 text-xs font-semibold transition-colors ${panelTab === tab ? 'border-violet-400 text-violet-300' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{tab === 'devices' ? l('Equipamentos e tentativas', 'Devices and attempts') : tab === 'logs' ? l('Registro detalhado', 'Detailed log') : l('Relatórios e SN', 'Reports and serials')}</button>)}
          </div>
          <div id="assistant-panel-devices" role="tabpanel" aria-labelledby="assistant-tab-devices" hidden={panelTab !== 'devices'} className="p-5 sm:p-6">
            <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="text-[10px] tracking-wider text-muted-foreground border-b border-border"><tr>{['POS.', l('NÚMERO DE SÉRIE', 'SERIAL NUMBER'), l('SINAL (dBm)', 'SIGNAL (dBm)'), l('RESULTADO', 'RESULT')].map(label => <th key={label} className="px-3 py-3 whitespace-nowrap">{label}</th>)}</tr></thead><tbody>{batch?.attempts.map(item => <tr key={item.id} className="border-b border-border/40"><td className="px-3 py-4 font-mono">{item.position}.{item.attempt}</td><td className="px-3 py-4 font-mono whitespace-nowrap">{item.serial}</td><td className="px-3 py-4 font-mono" title={item.opticalWarning}>{item.power === null ? '—' : item.power.toFixed(4)}</td><td className="px-3 py-4"><span className={`rounded-full px-2 py-1 text-[10px] whitespace-nowrap ${item.result === 'CONFIGURADA' ? 'bg-emerald-500/10 text-emerald-400' : item.result.includes('REPROVADA') || item.result === 'FALHA TÉCNICA NO TESTE' || item.result === 'INTERROMPIDA' ? 'bg-red-500/10 text-red-400' : 'bg-violet-500/10 text-violet-300'}`}>{status(item.result)}</span>{item.optical === 'SEM FIBRA (MODO BANCADA)' && <p className="mt-2 text-[10px] text-amber-400">{l('SEM FIBRA (MODO BANCADA)', 'NO FIBER (BENCH MODE)')}</p>}{item.optical === 'APROVADA COM AVISO' && <p className="mt-2 text-[10px] text-amber-400">{l('APROVADA COM AVISO', 'PASSED WITH WARNING')}</p>}</td></tr>)}{!batch?.attempts.length && <tr><td colSpan={4} className="py-12 text-center text-muted-foreground">{l('Nenhuma tentativa registrada. Inicie uma fila.', 'No attempts recorded. Start a queue.')}</td></tr>}</tbody></table></div>
            {batch && !queue.running && <button className={`${secondary} mt-5`} onClick={queue.resetView}><RotateCcw size={14} />{l('Preparar nova fila', 'Prepare new queue')}</button>}
          </div>
          <div id="assistant-panel-logs" role="tabpanel" aria-labelledby="assistant-tab-logs" hidden={panelTab !== 'logs'} className="p-3 sm:p-5">
            <div style={{ fontFamily: 'Consolas, "Courier New", monospace' }} className="rounded-2xl border border-slate-800 bg-[#132b3a] text-[#dce9f3] p-4 font-mono shadow-inner"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3 text-[11px] text-slate-400"><span className="flex items-center gap-2"><Terminal size={14} />Assistant Log Console — bash</span><span className="text-amber-300">{queue.connection === 'python' ? l('AUTOMAÇÃO ZTE · TEMPO REAL', 'ZTE AUTOMATION · REAL TIME') : l('AGUARDANDO CONEXÃO DA ONU', 'WAITING FOR ONU CONNECTION')}</span></div><div ref={terminal} onScroll={event => { const el = event.currentTarget; userIsNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight <= 45 }} role="log" aria-label={l('Registro técnico do Configurador ZTE', 'ZTE configurator technical log')} aria-live="polite" className="min-h-[260px] max-h-[420px] overflow-y-auto space-y-2 text-[11px] leading-relaxed custom-scrollbar">{!logs.length && <p className="text-slate-500">{l('Aguardando o início da fila…', 'Waiting for the queue to start…')}</p>}{logs.map(log => <div key={log.id} className="flex gap-3"><span className="shrink-0 text-slate-600">{new Date(log.time).toLocaleTimeString(lang === 'pt' ? 'pt-BR' : 'en-US', { hour12: false })}</span><span className={`min-w-0 break-words ${log.type === 'success' ? 'text-emerald-400' : log.type === 'warning' || log.type === 'error' ? 'text-amber-400' : log.type === 'command' ? 'text-cyan-400' : 'text-[#dce9f3]'} whitespace-pre-wrap`}>{log.type === 'command' ? '$ ' : ''}{zteOperationalText(lang === 'pt' ? log.pt : log.en, lang)}</span></div>)}</div><div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-500">Zseven Automation Bot · {queue.question ? l('Aguardando operador', 'Waiting for operator') : queue.running ? l('Em execução', 'Running') : l('Aguardando', 'Waiting')} · UTF-8</div></div>
          </div>
          {reportContent}
        </div>
      </div>
      <SingleOnuPanel queue={queue} lang={lang} terminalAutoScroll={terminalAutoScroll} onOpenPdf={openPdf} onDownloadPdf={downloadPdf} pdfBusy={pdfBusy} />
      {queue.question?.kind === 'access' && <div className="fixed inset-0 z-[75] bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center"><div ref={accessDialog} role="dialog" aria-modal="true" aria-labelledby="zte-access-title" aria-describedby="zte-access-description" className="w-full max-w-md max-h-full overflow-y-auto rounded-3xl border border-violet-500/30 bg-card p-6 shadow-2xl"><h2 id="zte-access-title" className="text-xl font-bold">{l('Novo acesso ao equipamento', 'New device credentials')}</h2><p id="zte-access-description" className="mt-2 text-sm text-muted-foreground">{l('Os dois pares não conseguiram acesso.', 'Neither credential pair could sign in.')}</p>{queue.notice && <p role="status" className="mt-3 text-xs text-amber-300">{zteOperationalText(queue.notice, lang)}</p>}<form className="mt-5 space-y-4" onSubmit={event => { event.preventDefault(); if (queue.submitNewAccess(newAccess.user, newAccess.password)) setNewAccess({ user: '', password: '' }) }}><label className="block text-sm space-y-2"><span>{l('Usuário', 'Username')}</span><input required className={inputClass} autoComplete="off" value={newAccess.user} onChange={event => setNewAccess(prev => ({ ...prev, user: event.target.value }))} /></label><label className="block text-sm space-y-2"><span>{l('Senha', 'Password')}</span><div className="relative"><input required className={inputClass + ' pr-10'} autoComplete="new-password" type={showNewPassword ? 'text' : 'password'} value={newAccess.password} onChange={event => setNewAccess(prev => ({ ...prev, password: event.target.value }))} /><button type="button" aria-label={l('Mostrar/ocultar senha', 'Show/hide password')} className="absolute right-3 top-3" onClick={() => setShowNewPassword(value => !value)}>{showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label><div className="flex flex-wrap gap-3"><button type="submit" disabled={queue.commandPending || queue.connection === 'disconnected' || queue.connection === 'connecting'} className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40">{l('Tentar novo acesso', 'Try new credentials')}</button><button type="button" className={secondary} onClick={queue.cancelAutomation}>{l('Encerrar fila', 'End queue')}</button>{queue.connection === 'disconnected' && <button type="button" className={secondary} onClick={queue.reconnect}>{l("Reconectar ao serviço de automação", "Reconnect to automation service")}</button>}</div></form></div></div>}
      {pdfViewer}
      </div>
    </section>
  )
}



const userOperationalMenus = [
  { id: 'firmware_catalog', pt: 'Catálogo de Firmwares', en: 'Firmware Catalog', icon: FileArchive },
  { id: 'optical_test', pt: 'Teste Rápido Óptico', en: 'Quick Optical Test', icon: Radio },
  { id: 'report_center', pt: 'Central de Relatórios', en: 'Report Center', icon: FileText },
  { id: 'bench_guide', pt: 'Guia de Bancada', en: 'Bench Guide', icon: HelpCircle },
  { id: 'bench_defaults', pt: 'Padrões da Bancada', en: 'Bench Defaults', icon: LockKeyhole },
  { id: 'manual_config', pt: 'Configuração Manual', en: 'Manual Configuration', icon: Globe }
] as const

function FirmwareCatalogModule({ lang, running, onSelect }: { lang: Language; running: boolean; onSelect: (model: BatchModel) => void }) {
  const l = (pt: string, en: string) => lang === 'pt' ? pt : en
  return <section className="space-y-6 min-w-0"><div><h1 className="text-2xl font-bold">{l('Catálogo de Firmwares', 'Firmware Catalog')}</h1><p className="mt-2 text-sm text-muted-foreground">{l('Modelos homologados e arquivos previstos pelo Configurador ZTE.', 'Approved models and expected ZTE configurator files')}</p></div>
    {running && <p role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm">{l('Uma fila está em andamento. Aguarde o encerramento para trocar de modelo.', 'A queue is running. Wait for it to finish before changing models.')}</p>}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">{batchModels.map(model => {
      const files = batchModelFiles(model)
      return <article key={model} className="min-w-0 rounded-3xl border border-violet-900/40 bg-card/80 p-5 sm:p-6 flex flex-col gap-4"><div className="flex items-center gap-3"><span className="rounded-xl bg-violet-500/10 p-3 text-violet-400"><Router size={24} /></span><h2 className="font-bold text-lg">{model}</h2></div>
        <span className={`self-start rounded-full px-3 py-1 text-xs ${files.firmware ? 'bg-cyan-500/10 text-cyan-300' : 'bg-amber-500/10 text-amber-300'}`}>{files.firmware ? l('Firmware habilitado · solicitado por padrão', 'Firmware enabled · requested by default') : l('Firmware dispensado automaticamente', 'Firmware automatically waived')}</span>
        <dl className="space-y-4 text-sm"><div><dt className="text-xs text-muted-foreground">Firmware · ./Firmware</dt><dd className="mt-1 font-mono break-words [overflow-wrap:anywhere]">{files.firmware || l('Dispensado (None)', 'Waived (None)')}</dd></div><div><dt className="text-xs text-muted-foreground">Backup · ./Backup</dt><dd className="mt-1 font-mono break-words [overflow-wrap:anywhere]">{files.backup}</dd></div><div><dt className="text-xs text-muted-foreground">{files.firmware ? l('Versão esperada após atualização', 'Expected version after update') : l('Versão do backup', 'Backup version')}</dt><dd className="mt-1 font-mono">{files.version}</dd></div>{files.referenceSn && <div><dt className="text-xs text-muted-foreground">{l('SN cadastrado de referência da variante', 'Variant reference serial')}</dt><dd className="mt-1 font-mono">{files.referenceSn}</dd></div>}</dl>
        {files.referenceSn && <p className="text-xs text-muted-foreground">{l('Referência de identificação; o SN de cada ONU continua sendo lido individualmente.', 'Identification reference; each ONU serial is still read individually.')}</p>}
        <button type="button" disabled={running} onClick={() => onSelect(model)} className="mt-auto rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed">{l('Selecionar este modelo no Configurador', 'Select this model in the Configurator')}</button>
      </article>
    })}</div>
  </section>
}

function QuickOpticalTestModule({ lang, onManual, targetRouterIp }: { lang: Language; onManual?: () => void; targetRouterIp: string }) {
  const l = (pt: string, en: string) => lang === 'pt' ? pt : en
  const [baseline, setBaseline] = useState('-20.00')
  const [measured, setMeasured] = useState('-20.35')
  const [probing, setProbing] = useState(false)
  const [probe, setProbe] = useState<{ kind: 'response' | 'blocked'; ms?: number } | null>(null)
  const request = useRef<AbortController | null>(null)
  useEffect(() => () => { request.current?.abort(); request.current = null }, [])
  const parse = (value: string) => /^-?\d+(?:[.,]\d{1,4})?$/.test(value.trim()) ? Number(value.replace(',', '.')) : NaN
  const cto = parse(baseline), power = parse(measured)
  const valid = Number.isFinite(cto) && Number.isFinite(power) && cto >= -40 && cto <= 0 && power >= -60 && power <= 10
  const result = valid ? testZteOptical(power, cto) : null
  const number = (value: number) => value.toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  async function testConnection() {
    if (request.current) return
    const controller = new AbortController(); request.current = controller; setProbing(true); setProbe(null)
    const timer = setTimeout(() => controller.abort(), 4000), start = performance.now()
    try {
      // Browser HTTP probe only: never invent ICMP results or infer reachability from a rejected fetch.
      const response = await fetch(`http://${validRouterIp(targetRouterIp) ? targetRouterIp : '192.168.1.1'}/`, { method: 'GET', mode: 'no-cors', credentials: 'omit', cache: 'no-store', signal: controller.signal })
      if (request.current !== controller) return
      setProbe({ kind: response.type === 'opaque' || response.ok ? 'response' : 'blocked', ms: Math.round(performance.now() - start) })
    } catch { if (request.current === controller) setProbe({ kind: 'blocked' }) }
    finally { clearTimeout(timer); if (request.current === controller) { request.current = null; setProbing(false) } }
  }
  const input = 'mt-2 w-full rounded-xl border border-border bg-background/70 px-4 py-3 font-mono outline-none focus:border-violet-500'
  return <section className="space-y-6 min-w-0"><div><h1 className="text-2xl font-bold">{l('Teste Rápido Óptico', 'Quick Optical Test')}</h1><p className="mt-2 text-sm text-muted-foreground">{l('Validação avulsa, sem iniciar uma fila ou alterar configurações na ONU.', 'Standalone validation without starting a queue or changing ONU settings.')}</p></div>
    <div className="rounded-3xl border border-violet-900/40 bg-card/80 p-5 sm:p-6 space-y-6"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><label className="text-sm font-semibold">{l('Padrão da CTO (dBm)', 'CTO baseline (dBm)')}<input className={input} inputMode="decimal" value={baseline} onChange={event => setBaseline(event.target.value)} /></label><label className="text-sm font-semibold">{l('Potência medida na ONU (dBm)', 'Measured ONU power (dBm)')}<input className={input} inputMode="decimal" value={measured} onChange={event => setMeasured(event.target.value)} /></label></div>
      {!result ? <p role="status" className="text-sm text-amber-300">{l('Informe CTO entre -40 e 0 dBm e potência entre -60 e 10 dBm; vírgula ou ponto são aceitos.', 'Enter CTO from -40 to 0 dBm and power from -60 to 10 dBm; comma or dot accepted.')}</p> : <div aria-live="polite" className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="rounded-2xl bg-background/60 p-4"><p className="text-xs text-muted-foreground">{l('Limite mínimo · CTO − 0,50', 'Minimum · CTO − 0.50')}</p><p className="mt-2 text-xl font-mono">{number(cto - 0.5)} dBm</p></div><div className="rounded-2xl bg-background/60 p-4"><p className="text-xs text-muted-foreground">{l('Diferença · ONU − CTO', 'Difference · ONU − CTO')}</p><p className="mt-2 text-xl font-mono">{power - cto > 0 ? '+' : ''}{number(power - cto)} dBm</p></div></div><div className={`rounded-2xl border p-5 ${!result.passed ? 'border-red-500/40 bg-red-500/10 text-red-300' : result.warning ? 'border-amber-500/40 bg-amber-500/10 text-amber-300' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'}`}><p className="font-bold">{lang === 'pt' ? result.optical : !result.passed ? 'SIGNAL REJECTED' : result.warning ? 'PASSED WITH WARNING' : 'PASSED'}</p>{result.warning && <p className="mt-2 text-sm">{lang === 'pt' ? result.warning : result.passed ? 'ONU power is above the CTO baseline.' : 'ONU power is below the minimum allowed threshold.'}</p>}</div></div>}
    </div>
    <div className="rounded-3xl border border-border bg-card/80 p-5 sm:p-6 space-y-3"><h2 className="font-bold">{l('Conectividade · 192.168.1.1', 'Connectivity · 192.168.1.1')}</h2><div className="flex flex-wrap items-center gap-3"><button type="button" disabled={probing} onClick={() => void testConnection()} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"><Radio size={18} />{probing ? l('Testando…', 'Testing…') : l('Testar resposta rápida do IP', 'Test IP response')}</button><button type="button" onClick={() => safeOpenRouter(targetRouterIp)} className="inline-flex items-center gap-2 rounded-xl border border-violet-500/40 px-4 py-3 text-sm font-semibold text-violet-300 hover:bg-violet-500/10"><Globe size={18} className="shrink-0" />{l('Abrir Interface da ONU', 'Open ONU Interface')} ({targetRouterIp})</button></div><p className="text-xs text-muted-foreground">{l('Consulta HTTP pelo navegador, com limite de 4 segundos; não é um ping ICMP.', 'Browser HTTP request with a 4-second timeout; this is not an ICMP ping.')}</p>{probe && <p role="status" className="text-sm">{probe.kind === 'response' ? l(`Resposta HTTP detectada em ${probe.ms} ms. O navegador não expõe o status HTTP neste modo.`, `HTTP response detected in ${probe.ms} ms. The browser does not expose the HTTP status in this mode.`) : l('Não foi possível confirmar a resposta. Verifique cabo/rede e se o navegador bloqueou acesso HTTP à rede local.', 'Unable to confirm a response. Check the network/cable and whether the browser blocked local HTTP access.')}</p>}</div>
    <button type="button" onClick={onManual} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/40 px-4 py-3 text-sm text-violet-300 hover:bg-violet-500/10"><Globe size={18} />{l('Abrir Interface ZTE (Manual)', 'Open ZTE Interface (Manual)')}</button>
  </section>
}

function SerialExportActions({ batch, lang }: { batch: ConfigBatch; lang: Language }) {
  const [message, setMessage] = useState<'copied' | 'downloaded' | 'error' | null>(null)
  useEffect(() => { setMessage(null) }, [batch.id])
  const serials = [...new Set(configuredAttempts(batch).map(item => item.serial.trim()).filter(Boolean))].join('\n')
  async function copy() { try { await navigator.clipboard.writeText(serials); setMessage('copied') } catch { setMessage('error') } }
  function download() {
    const url = URL.createObjectURL(new Blob([serials + '\n'], { type: 'text/plain;charset=utf-8' })), link = document.createElement('a')
    link.href = url; link.download = `SN_${batch.id}.txt`; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000); setMessage('downloaded')
  }
  const l = (pt: string, en: string) => lang === 'pt' ? pt : en
  return <div className="rounded-xl border border-border bg-background/40 p-4 space-y-3"><h3 className="text-sm font-semibold">{l('Exportação de SNs', 'Serial Export')}</h3><p className="text-xs text-muted-foreground">{l('Lista do lote selecionado, somente ONUs configuradas, sem duplicatas e na ordem de conclusão.', 'Selected batch: configured ONUs only, deduplicated in completion order.')}</p><div className="flex flex-wrap gap-2"><button type="button" disabled={!serials} onClick={() => void copy()} className="rounded-lg border border-border px-3 py-2 text-xs disabled:opacity-40">{l('Copiar SNs', 'Copy serials')}</button><button type="button" disabled={!serials} onClick={download} className="rounded-lg border border-border px-3 py-2 text-xs disabled:opacity-40">{l('Exportar TXT', 'Export TXT')}</button></div>{message && <p role="status" className="text-xs text-violet-300">{message === 'copied' ? l('SNs copiados.', 'Serials copied.') : message === 'downloaded' ? l('Arquivo de SNs preparado para download.', 'Serial file prepared for download.') : l('Não foi possível copiar; use a lista de texto acima.', 'Unable to copy; use the text list above.')}</p>}</div>
}

function ManualConfigModule({ lang, targetRouterIp, ssid24Name, ssid5Name }: { lang: Language; targetRouterIp: string; ssid24Name: string; ssid5Name: string }) {
  const l = (pt: string, en: string) => lang === 'pt' ? pt : en
  const [model, setModel] = useState<BatchModel>('ZTE F6201B')
  const [checkedSteps, setCheckedSteps] = useState<number[]>([])
  const files = batchModelFiles(model)
  const [copied, setCopied] = useState<number | null>(null)
  const [error, setError] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mounted = useRef(true)
  const copySequence = useRef(0)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; if (timer.current !== null) clearTimeout(timer.current) } }, [])
  const values = [
    [l('Usuário Padrão', 'Default Username'), 'multipro'],
    [l('Senha Inicial', 'Initial Password'), 'multipro'],
    [l('Nova Senha Administrativa', 'New Administrative Password'), 'Lybertynet123#'],
    ['SSID 2.4 GHz', ssid24Name], ['SSID 5 GHz', ssid5Name],
    [l('Senha Wi-Fi WPA', 'Wi-Fi WPA Password'), 'Lybertynet123#']
  ]
  async function copy(index: number) {
    const sequence = ++copySequence.current
    try {
      await navigator.clipboard.writeText(values[index][1])
      if (!mounted.current || sequence !== copySequence.current) return
      if (timer.current !== null) clearTimeout(timer.current)
      setCopied(index); setError(false)
      timer.current = setTimeout(() => { setCopied(null); timer.current = null }, 2000)
    } catch { if (mounted.current && sequence === copySequence.current) { setCopied(null); setError(true) } }
  }
  const paths = [
    [l('Conferir Sinal Óptico', 'Check Optical Signal'), 'Internet > Estado > Potência de entrada do módulo óptico'],
    [l('Conferir Serial (SN)', 'Check Serial (SN)'), 'Informação PON > SN'],
    [l('Atualizar Firmware', 'Update Firmware'), 'Gerência & Diagnóstico > Administração de sistema > Atualização de software'],
    [l('Restaurar Backup', 'Restore Backup'), 'Gerência & Diagnóstico > Administração de sistema > Gerenciamento de configuração padrão > Restaurar configuração padrão'],
    [l('Alterar Senha Admin', 'Change Admin Password'), 'Gerência & Diagnóstico > Gestão de Contas'],
    [l('Configurar Wi-Fi', 'Configure Wi-Fi'), 'Rede local > WLAN > WLAN Básica > Configuração SSID WLAN']
  ]
  const steps = [
    { text: l('Conecte uma ONU do modelo selecionado via cabo e confirme o modelo na interface.', 'Connect one ONU of the selected model by cable and confirm the model in its interface.') },
    { text: l('Entre na interface, confira a potência de entrada e leia o SN. Só prossiga após aprovação no teste óptico.', 'Log in, check input optical power and read the serial. Proceed only after passing the optical test.') },
    { text: files.firmware ? l('Se a atualização de firmware for solicitada, selecione este arquivo em Atualização de software:', 'If a firmware update is requested, select this file under Software Update:') : l('F6600P preta: atualização de firmware dispensada. Não selecione o firmware da variante branca.', 'Black F6600P: firmware update waived. Do not select the white variant firmware.'), file: files.firmware },
    ...(files.firmware ? [{ text: l('Após atualizar, aguarde o reinício, faça novo login e confirme a versão: ', 'After updating, wait for restart, log in again and confirm version: ') + files.version }] : []),
    { text: l('Para restaurar o backup, escolha este arquivo em Restaurar configuração padrão:', 'To restore the backup, select this file under Restore Default Configuration:'), file: files.backup },
    { text: l('Após restaurar, aguarde o reinício e faça novo login. Confira a sessão antes de continuar.', 'After restoring, wait for restart and log in again. Confirm the session before continuing.') },
    { text: l('Altere a senha administrativa e configure os SSIDs e a senha WPA usando a cola rápida ao lado. Confira os valores salvos na interface.', 'Change the administrative password and configure SSIDs and WPA password using the quick reference beside this checklist. Verify saved values in the interface.') }
  ]
  return <section className="min-w-0 space-y-6">
    <div><h1 className="text-2xl font-bold">{l('Configuração Manual', 'Manual Configuration')}</h1><p className="mt-2 text-sm text-muted-foreground">{l('Conecte a ONU via cabo ao notebook e abra a interface web para configurar o equipamento.', 'Connect the ONU to your laptop by cable and open its web interface to configure the device.')}</p></div>
    <button type="button" onClick={() => safeOpenRouter(targetRouterIp)} className="inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-violet-600 px-5 py-4 font-semibold text-white hover:bg-violet-500"><Globe size={22} className="shrink-0" /><span className="break-all text-left">{l('Abrir Interface Web da ONU', 'Open ONU Web Interface')} (http://{targetRouterIp})</span></button>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
      <div className="min-w-0 rounded-3xl border border-border bg-card/80 p-5 sm:p-6">
        <h2 className="text-lg font-bold">{l('Checklist Passo a Passo Manual por Modelo', 'Manual Step-by-Step Checklist by Model')}</h2>
        <label className="mt-5 block text-sm font-semibold">{l('Modelo do equipamento', 'Device model')}<select value={model} onChange={event => { setModel(event.target.value as BatchModel); setCheckedSteps([]) }} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm">{batchModels.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
        <p className="mt-3 text-xs text-muted-foreground">{l('Selecione os arquivos locais nas pastas ./Firmware e ./Backup. As marcações são apenas uma conferência manual.', 'Select local files from ./Firmware and ./Backup. Checkmarks are a manual checklist only.')}</p>
        <ol className="mt-5 space-y-4">{steps.map((step, index) => <li key={model + index}><label className="flex items-start gap-3 rounded-xl border border-border/60 p-3"><input type="checkbox" checked={checkedSteps.includes(index)} onChange={event => setCheckedSteps(previous => event.target.checked ? [...previous, index] : previous.filter(item => item !== index))} className="mt-1 shrink-0 accent-violet-500" /><span className="min-w-0 text-sm leading-relaxed"><span className="font-semibold text-violet-300">{index + 1}. </span>{step.text}{step.file && <code className="mt-2 block break-all rounded-lg bg-background/70 p-3 text-xs text-violet-300">{step.file}</code>}</span></label></li>)}</ol>
      </div>
    <div className="rounded-3xl border border-violet-900/40 bg-card/80 p-5 sm:p-6"><h2 className="text-lg font-bold">{l('Cola Rápida de Bancada', 'Bench Quick Reference')}</h2><div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">{values.map(([label, value], index) => <article key={label} className="min-w-0 rounded-2xl border border-border bg-background/50 p-4"><h3 className="text-xs text-muted-foreground">{label}</h3><p className="mt-3 break-all font-mono text-sm select-all">{value || l('Não definido', 'Not set')}</p><button type="button" disabled={!value} onClick={() => void copy(index)} aria-label={`${l('Copiar', 'Copy')} ${label}`} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-violet-500/30 px-3 py-2 text-xs text-violet-300 hover:bg-violet-500/10 disabled:opacity-40">{copied === index ? <CheckCircle2 size={15} /> : <Copy size={15} />}{copied === index ? l('Copiado', 'Copied') : l('Copiar', 'Copy')}</button></article>)}</div><p role="status" className="mt-3 text-xs text-violet-300">{error ? l('Não foi possível copiar. Selecione o valor e copie manualmente.', 'Unable to copy. Select the value and copy it manually.') : copied !== null ? l('Valor copiado.', 'Value copied.') : ''}</p></div>
    </div>
    <div className="rounded-3xl border border-border bg-card/80 p-5 sm:p-6"><h2 className="text-lg font-bold">{l('Guia Rápido de Caminhos na Interface ZTE', 'ZTE Interface Quick Navigation Guide')}</h2><dl className="mt-5 space-y-4">{paths.map(([label, path]) => <div key={label} className="border-b border-border/50 pb-4 last:border-0 last:pb-0"><dt className="text-sm font-semibold">{label}</dt><dd className="mt-2 break-words text-sm text-muted-foreground">{path}</dd></div>)}</dl></div>
  </section>
}

function BenchGuideModule({ lang }: { lang: Language }) {
  const l = (pt: string, en: string) => lang === 'pt' ? pt : en
  const [checked, setChecked] = useState<number[]>([])
  const [filter, setFilter] = useState('')
  // Official rules transcribed from the list supplied by the user (Relatorios_ZTE.py).
  const entries: [string, string, string, string][] = [
    [
        "Regra 01",
        "Rule 01",
        "A configuração só começa após aprovação no teste óptico e leitura do SN.",
        "Configuration starts only after passing the optical test and reading the serial number."
    ],
    [
        "Regra 02",
        "Rule 02",
        "A leitura usa somente o valor associado à potência de entrada. Valor ausente (--), inválido ou leitura não disponível é falha técnica, sem usar tensão ou outros números da página.",
        "Only the value associated with input power is read. A missing (--), invalid, or unavailable reading is a technical failure; voltage or other numbers on the page must not be used."
    ],
    [
        "Regra 03",
        "Rule 03",
        "Limite mínimo = padrão da CTO menos 0,50 dBm. Sinal abaixo desse limite é REPROVADO.",
        "Minimum threshold = CTO baseline minus 0.50 dBm. A signal below this threshold is REJECTED."
    ],
    [
        "Regra 04",
        "Rule 04",
        "Entre o limite e o padrão, inclusive: APROVADA. Acima do padrão: APROVADA COM AVISO, conforme a regra original.",
        "Between the threshold and the baseline, inclusive: PASSED. Above the baseline: PASSED WITH WARNING, as specified by the original rule."
    ],
    [
        "Regra 05",
        "Rule 05",
        "Sinal reprovado exige troca da ONU e repetição da mesma posição. Falha técnica não autoriza configurar.",
        "A rejected signal requires replacing the ONU and repeating the same position. A technical failure does not authorize configuration."
    ],
    [
        "Regra 06",
        "Rule 06",
        "Fila sequencial, uma ONU por vez em 192.168.1.1, com confirmação antes de cada unidade.",
        "The queue is sequential, one ONU at a time at 192.168.1.1, with confirmation before each unit."
    ],
    [
        "Regra 07",
        "Rule 07",
        "Um SN configurado com sucesso não é contado novamente no mesmo lote. O TXT inclui apenas sucessos, sem duplicados e na ordem de configuração.",
        "A successfully configured serial is not counted again in the same batch. The TXT includes only successful configurations, without duplicates and in configuration order."
    ],
    [
        "Regra 08",
        "Rule 08",
        "O modelo conectado deve corresponder ao selecionado. Para SNs conhecidos, a variante F6600P também é conferida.",
        "The connected model must match the selected model. For known serials, the F6600P variant is also checked."
    ],
    [
        "Regra 09",
        "Rule 09",
        "F6600P branca usa Config ZXHN F6600P.bin; preta usa Config ZXHN F6600P V9.1 10P4N2.bin. O firmware disponível é exclusivo da branca.",
        "White F6600P uses Config ZXHN F6600P.bin; black uses Config ZXHN F6600P V9.1 10P4N2.bin. The available firmware is exclusive to the white variant."
    ],
    [
        "Regra 10",
        "Rule 10",
        "Arquivos solicitados precisam ter seleção única, existir e não ser vazios. Etapas dispensadas não exigem arquivo.",
        "Requested files must have a unique selection, exist, and not be empty. Waived stages do not require a file."
    ],
    [
        "Regra 11",
        "Rule 11",
        "Firmware solicitado exige reinício, novo login e confirmação da versão. Backup solicitado exige reinício e novo login.",
        "Requested firmware requires a restart, a new login, and version confirmation. Requested backup requires a restart and a new login."
    ],
    [
        "Regra 12",
        "Rule 12",
        "Cada login tenta os dois pares de acesso. Se ambos falharem, solicita outro usuário e senha. Cancelar encerra a fila com relatório parcial.",
        "Each login tries both credential pairs. If both fail, another username and password are requested. Canceling ends the queue with a partial report."
    ],
    [
        "Regra 13",
        "Rule 13",
        "Acesso confirmado exige saída do formulário de login e evidência visível da sessão. Troca de senha usa a credencial que autenticou e atualiza o acesso na memória.",
        "Confirmed access requires leaving the login form and visible session evidence. Password changes use the authenticated credential and update access in memory."
    ],
    [
        "Regra 14",
        "Rule 14",
        "Senha administrativa e Wi-Fi seguem as verificações existentes do bot. As credenciais não são gravadas no PDF nem no JSON.",
        "Administrative and Wi-Fi passwords follow the bot's existing checks. Credentials are not written to the PDF or JSON."
    ],
    [
        "Regra 15",
        "Rule 15",
        "Parar a fila aguarda a operação atual. Uploads e reinícios não são interrompidos pelo botão de parada.",
        "Stopping the queue waits for the current operation. Uploads and restarts are not interrupted by the stop button."
    ],
    [
        "Regra 16",
        "Rule 16",
        "As confirmações registradas refletem a interface web; não representam teste externo de conectividade ou autenticação Wi-Fi.",
        "Recorded confirmations reflect the web interface; they do not represent an external connectivity or Wi-Fi authentication test."
    ]
]
  const normalized = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  return <section className="space-y-5 min-w-0"><h1 className="text-2xl font-bold">{l('Guia de Bancada', 'Bench Guide')}</h1><p className="text-sm text-muted-foreground">{l('16 regras oficiais do Relatorios_ZTE.py.', '16 official rules from Relatorios_ZTE.py.')}</p><div className="flex flex-wrap gap-3 items-center"><label className="flex-1 min-w-[200px]"><span className="sr-only">{l('Buscar orientação', 'Search guidance')}</span><input value={filter} onChange={event => setFilter(event.target.value)} placeholder={l('Buscar orientação ou erro', 'Search guidance or error')} className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm" /></label><span className="text-sm text-violet-300">{checked.length}/16 {l('conferidos', 'checked')}</span><button type="button" onClick={() => setChecked([])} className="rounded-xl border border-border px-4 py-3 text-xs">{l('Reiniciar checklist', 'Reset checklist')}</button></div><div className="space-y-3">{entries.map(([ptTitle, enTitle, ptBody, enBody], index) => {
      const title = l(ptTitle, enTitle), body = l(ptBody, enBody)
      if (!normalized(title + ' ' + body).includes(normalized(filter))) return null
      return <div key={index} className="flex items-start gap-3 rounded-2xl border border-border bg-card/80 p-4"><input type="checkbox" aria-label={`${l('Conferido', 'Checked')}: ${title}`} checked={checked.includes(index)} onChange={event => setChecked(prev => event.target.checked ? [...prev, index] : prev.filter(item => item !== index))} className="mt-1 size-4 accent-violet-500 shrink-0" /><details className="min-w-0 flex-1"><summary className="cursor-pointer text-sm font-semibold">{String(index + 1).padStart(2, '0')} · {title}</summary><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p></details></div>
    })}</div></section>
}

function BenchDefaultsModule({ lang, ssid24, ssid5, targetIp, running, onLocal, onNewQueue }: { lang: Language; ssid24: string; ssid5: string; targetIp: string; running: boolean; onLocal: () => void; onNewQueue: () => void }) {
  const l = (pt: string, en: string) => lang === 'pt' ? pt : en
  const rows = [
    [l('IP da ONU', 'ONU IP'), '192.168.1.1', targetIp], [l('Usuário padrão', 'Default username'), 'multipro', 'multipro'],
    ['SSID 2.4G', ZTE_WIFI_DEFAULTS.ssid24, ssid24.trim() || ZTE_WIFI_DEFAULTS.ssid24], ['SSID 5G', ZTE_WIFI_DEFAULTS.ssid5, ssid5.trim() || ZTE_WIFI_DEFAULTS.ssid5],
    [l('Timeout de Interface', 'Interface timeout'), '120s', '120s'], [l('Estabilização pós-boot', 'Post-boot stabilization'), '8s', '8s']
  ]
  return <section className="space-y-6 min-w-0"><div><h1 className="text-2xl font-bold">{l('Padrões da Bancada', 'Bench Defaults')}</h1><p className="mt-2 text-sm text-muted-foreground">{l('Compare a referência operacional com os parâmetros atuais da sessão.', 'Compare operational references with the current session parameters.')}</p></div><div className="overflow-x-auto rounded-3xl border border-border bg-card/80 p-4 sm:p-6"><table className="w-full text-left text-sm"><thead className="text-xs text-muted-foreground"><tr><th className="p-3">{l('Parâmetro', 'Parameter')}</th><th className="p-3">{l('Padrão de referência', 'Reference default')}</th><th className="p-3">{l("Valor atual / referência do serviço de automação", "Current value / automation service reference")}</th></tr></thead><tbody>{rows.map(([label, expected, actual]) => <tr key={label} className="border-t border-border/50"><th scope="row" className="p-3 font-medium">{label}</th><td className="p-3 font-mono whitespace-nowrap">{expected}</td><td className={`p-3 font-mono whitespace-nowrap ${actual !== expected ? 'text-amber-300' : 'text-emerald-300'}`}>{actual}{actual !== expected && <span className="ml-2 text-[10px] font-sans">{l('Personalizado', 'Customized')}</span>}</td></tr>)}</tbody></table></div><p className="text-xs text-muted-foreground">{l("Os tempos são referências operacionais fornecidas, não uma leitura da configuração do servidor.", "Timing values are supplied automation script references, not a live server configuration reading.")}</p><div className="flex flex-wrap gap-3"><button type="button" onClick={onLocal} className="rounded-xl border border-border px-4 py-3 text-sm">{l('Editar SSIDs na Rede Local', 'Edit SSIDs in Local Network')}</button><button type="button" disabled={running} onClick={onNewQueue} className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40">{running ? l('Fila em andamento', 'Queue running') : l('Iniciar nova fila', 'Start new queue')}</button></div></section>
}

function ReportCenterMetrics({ history, lang }: { history: ConfigBatch[]; lang: Language }) {
  const ended = history.filter(batch => batch.status !== 'EM ANDAMENTO')
  const attempts = ended.flatMap(batch => batch.attempts)
  const l = (pt: string, en: string) => lang === 'pt' ? pt : en
  const rejected = ended.reduce((count, batch) => count + batch.attempts.filter(item => item.result === 'REPROVADA NO SINAL' || (item.result === 'REPROVADA' && item.power !== null && item.power < batch.minimum)).length, 0)
  const metrics = [[l('Total de lotes', 'Total batches'), ended.length], [l('ONUs configuradas', 'Configured ONUs'), attempts.filter(item => item.result === 'CONFIGURADA').length], [l('Aprovadas com aviso', 'Passed with warning'), attempts.filter(item => item.result === 'CONFIGURADA' && item.optical === 'APROVADA COM AVISO').length], [l('Reprovadas no sinal', 'Signal rejections'), rejected]]
  return <div className="space-y-3"><div className="grid grid-cols-2 xl:grid-cols-4 gap-3">{metrics.map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-violet-900/40 bg-card/80 p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold text-violet-300">{value}</p></div>)}</div><p className="text-xs text-muted-foreground">{l('Dados locais deste operador; origem de cada lote identificada na tabela.', 'Local data for this operator; each batch source is identified in the table.')}</p></div>
}


type AdminEvent = { id: string; at: string; user: string; action: string; source: 'local' | 'demo' }
type AdminPerson = { id: string; name: string; role: 'admin' | 'user'; ip: string; target: string; module: string; login: number; seen: number; source: 'local' | 'demo' }
const adminCard = 'min-w-0 rounded-3xl border border-border bg-card/80 p-5 space-y-4'
const adminButton = 'rounded-xl border border-border px-3 py-2 text-sm hover:bg-violet-500/10 disabled:opacity-40'
function pruneAdminEvents(limit = 150) {
  const entries: { key: string; time: number }[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith('codenet_audit_event:')) continue
    const event = safeJsonParse(localStorage.getItem(key) || '', null)
    const time = typeof event?.at === 'string' ? Date.parse(event.at) : NaN
    entries.push({ key, time: Number.isFinite(time) ? time : 0 })
  }
  entries.sort((a, b) => a.time - b.time || a.key.localeCompare(b.key))
  entries.slice(0, Math.max(0, entries.length - limit)).forEach(entry => localStorage.removeItem(entry.key))
}
function writeAdminEvent(user: string, action: string) {
  try {
    pruneAdminEvents(149)
    const event: AdminEvent = { id: crypto.randomUUID(), at: new Date().toISOString(), user, action, source: 'local' }
    localStorage.setItem('codenet_audit_event:' + event.id, JSON.stringify(event))
    pruneAdminEvents(150)
  } catch { /* Audit storage must not block the operation. */ }
}
function adminExport(name: string, rows: (string | number)[][], csv = true) {
  const value = rows.map(row => row.map(cell => {
    let text = String(cell); if (/^[=+@\-]/.test(text)) text = "'" + text
    return csv ? '"' + text.replaceAll('"', '""') + '"' : text.replace(/[\r\n\t]/g, ' ')
  }).join(csv ? ',' : '\t')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['\uFEFF' + value], { type: csv ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8' }))
  const link = document.createElement('a'); link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000)
}
function useAdminData(enabled: boolean) {
  const [batches, setBatches] = useState<ConfigBatch[]>([])
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [people, setPeople] = useState<AdminPerson[]>([])
  const [tick, setTick] = useState(0)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!enabled) return
    const refresh = () => {
      const found = new Map<string, ConfigBatch>(), logs: AdminEvent[] = [], sessions: AdminPerson[] = []
      try {
        for (let index = 0; index < localStorage.length; index++) {
          const key = localStorage.key(index) || ''
          if (!/^(codenet_batches_v1:|codenet_audit_event:|codenet_presence:)/.test(key)) continue
          try {
            const data = safeJsonParse(localStorage.getItem(key) || 'null', null)
            if (key.startsWith('codenet_batches_v1:') && Array.isArray(data)) data.forEach(batch => { if (batch && typeof batch.id === 'string' && batchModels.includes(batch.model) && Array.isArray(batch.attempts) && Array.isArray(batch.logs)) found.set(batch.owner + ':' + batch.id, { ...batch, pdfFileName: safePdfFileName(batch.pdfFileName) }) })
            if (key.startsWith('codenet_audit_event:') && data?.id && data?.action && data?.at) logs.push(data)
            if (key.startsWith('codenet_presence:') && data?.id && data?.seen > Date.now() - 16000) sessions.push(data)
          } catch { /* Skip an invalid entry without discarding other operators. */ }
        }
        setBatches([...found.values()].sort((a, b) => b.startedAt.localeCompare(a.startedAt))); setEvents(logs.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 1000)); setPeople(sessions); setError('')
      } catch { setError('Armazenamento local indisponível / Local storage unavailable') }
      setTick(value => value + 1)
    }
    refresh(); const timer = setInterval(refresh, 3000); window.addEventListener('storage', refresh)
    return () => { clearInterval(timer); window.removeEventListener('storage', refresh) }
  }, [enabled])
  return { batches, events, people, tick, error }
}
type AdminData = ReturnType<typeof useAdminData>
function AdminStats({ items }: { items: [string, string | number][] }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{items.map(([label, value]) => <div key={label} className={adminCard}><p className="text-xs text-muted-foreground">{label}</p><p className="text-2xl font-bold text-violet-400">{value}</p></div>)}</div>
}
function AdminTable({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return <div className="overflow-x-auto rounded-2xl border border-border"><table className="w-full text-left text-xs"><thead className="bg-violet-500/10"><tr>{headers.map(header => <th key={header} className="p-3 whitespace-nowrap">{header}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i} className="border-t border-border/50">{row.map((cell, j) => <td key={j} className="p-3 whitespace-nowrap">{cell}</td>)}</tr>)}{!rows.length && <tr><td colSpan={headers.length} className="p-6 text-muted-foreground">—</td></tr>}</tbody></table></div>
}
function adminAttempts(data: AdminData) { return data.batches.flatMap(batch => batch.attempts.map(attempt => ({ batch, attempt }))) }
function AdminEquipmentsModule({ data, lang }: { data: AdminData; lang: Language }) {
  const [filter, setFilter] = useState('')
  const l = (pt: string, en: string) => lang === 'pt' ? pt : en
  const attempts = adminAttempts(data)
  const baseline = [128, 96, 84, 72]
  const sampleRows = batchModels.flatMap((model, index) => [
    [`DEMO-ZTE${index}001`, model, '-20.20', 'Técnicos', l('Configurada', 'Configured'), 'Referência'],
    [`DEMO-ZTE${index}002`, model, '-20.80', 'NOC', l('Reprovada no Sinal', 'Signal rejected'), 'Referência'],
    [`DEMO-ZTE${index}003`, model, '—', 'Suporte', l('Em Bancada', 'On bench'), 'Referência']
  ])
  const rows = [...attempts.map(({ batch, attempt: a }) => [a.serial || '—', a.model, a.power ?? '—', batch.owner, a.result === 'CONFIGURADA' ? l('Configurada', 'Configured') : a.result === 'EM ANDAMENTO' ? l('Em Bancada', 'On bench') : a.result, batch.mode === 'mock' ? 'Gerado localmente' : "Bancada Local"]), ...sampleRows].filter(row => row.join(' ').toLowerCase().includes(filter.toLowerCase()))
  return <section className="space-y-6"><h1 className="text-2xl font-bold">{l('Equipamentos', 'Equipment')}</h1><div className="grid grid-cols-1 xl:grid-cols-2 gap-5">{batchModels.map((model, i) => { const files = batchModelFiles(model), count = attempts.filter(({ attempt: a }) => a.model === model && a.result === 'CONFIGURADA').length; return <article key={model} className={adminCard}><h2 className="font-bold flex items-center gap-2"><Router size={20} />{model}</h2><p className="text-3xl font-bold">{baseline[i] + count}</p><p className="text-xs text-muted-foreground">{baseline[i]} {l('estoque inicial', 'opening stock')} + {count} {l('configuradas nos lotes locais', 'configured in local batches')}</p><p className="text-emerald-400 text-sm">{files.firmware ? l('Homologado', 'Approved') : l('Dispensado na variante preta', 'Waived for black variant')} · {files.version}</p><p className="text-xs">{l('Versão ativa de referência; não consultada na ONU.', 'Reference active version; not queried from the ONU.')}</p><code className="block break-all text-xs">{files.firmware || '—'}</code><code className="block break-all text-xs">{files.backup}</code></article> })}</div><input value={filter} onChange={e => setFilter(e.target.value)} placeholder={l('Buscar SN, modelo, dBm, operador ou status', 'Search SN, model, dBm, operator or status')} aria-label={l('Filtrar inventário', 'Filter inventory')} className="w-full rounded-xl border border-border bg-background px-4 py-3" /><AdminTable headers={['SN', l('Modelo', 'Model'), 'dBm', l('Operador', 'Operator'), 'Status', l('Origem', 'Source')]} rows={rows} /></section>
}
function AdminSecurityModule({ lang, required, onRequired, user }: { lang: Language; required: boolean; onRequired: (value: boolean) => void; user: string }) {
  const l = (pt: string, en: string) => lang === 'pt' ? pt : en
  const [file, setFile] = useState<File | null>(null), [expected, setExpected] = useState(''), [hash, setHash] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('')
  const generation = useRef(0)
  useEffect(() => () => { generation.current++ }, [])
  async function calculate() {
    if (!file || busy) return
    const id = ++generation.current; setBusy(true); setHash(''); setError('')
    try {
      const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
      if (id !== generation.current) return
      const result = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join(''); setHash(result)
      writeAdminEvent(user, expected.trim() && result !== expected.trim().toLowerCase() ? 'SHA-256 divergente / mismatch (inspector)' : 'SHA-256 calculado / calculated (inspector)')
    } catch { if (id === generation.current) setError(l('Falha ao ler/calcular o arquivo.', 'Unable to read/hash the file.')) }
    finally { if (id === generation.current) setBusy(false) }
  }
  const now = new Date().toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US')
  return <section className="space-y-6"><h1 className="text-2xl font-bold">{l('Segurança', 'Security')}</h1><div className="grid grid-cols-1 xl:grid-cols-2 gap-5"><div className={adminCard}><h2 className="font-bold">PBKDF2-HMAC-SHA256</h2><p className="text-3xl font-mono text-violet-400">210.000 {l('iterações', 'iterations')}</p><p className="text-sm text-muted-foreground">{l('Derivação de credenciais locais disponível no protótipo. A sessão atual não possui token autenticado pelo servidor; o login de demonstração não valida esse hash.', 'Local credential derivation is available in this prototype. This session has no server-authenticated token; demo login does not validate this hash.')}</p><div className="flex items-center gap-3"><Key /><span>PBKDF2 → SHA-256 → 256 bits</span></div></div><div className={adminCard}><h2 className="font-bold">{l('Inspetor SHA-256 real', 'Real SHA-256 inspector')}</h2><input type="file" disabled={busy} onChange={e => { generation.current++; setFile(e.target.files?.[0] || null); setHash(''); setError('') }} className="w-full text-sm" /><input aria-label="SHA-256 esperado / expected" value={expected} onChange={e => setExpected(e.target.value)} placeholder={l('Hash esperado (opcional, 64 hex)', 'Expected hash (optional, 64 hex)')} className="w-full bg-background border border-border rounded-xl p-3 text-xs font-mono" /><button type="button" disabled={!file || busy || Boolean(expected && !/^[a-f\d]{64}$/i.test(expected.trim()))} onClick={() => void calculate()} className={adminButton}>{busy ? l('Calculando…', 'Calculating…') : l('Gerar / Verificar SHA-256', 'Generate / Verify SHA-256')}</button><output className="block break-all text-xs font-mono">{hash}</output>{hash && expected && <p role="status" className={hash === expected.trim().toLowerCase() ? 'text-emerald-400' : 'text-red-400'}>{hash === expected.trim().toLowerCase() ? l('Hash confirmado', 'Hash confirmed') : l('Hash SHA-256 divergente', 'SHA-256 mismatch')}</p>}{error && <p role="alert">{error}</p>}<label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={required} onChange={e => onRequired(e.target.checked)} />{l('Exigir validação SHA-256 antes do flash de firmware', 'Require SHA-256 validation before firmware flash')}</label><p className="text-xs text-muted-foreground">{l("Aplica a política existente no envio manual de firmware. O serviço de automação ZTE mantém sua validação própria.", "Applies the existing manual firmware upload policy. The ZTE automation service retains its own validation.")}</p></div></div><AdminTable headers={[l('Proteção', 'Protection'), 'Status', l('Origem', 'Source')]} rows={[[l('Rotação de senha ONU', 'ONU password rotation'), 'multipro → [credencial protegida]', 'Referência'], ['WPA2-PSK-AES', l('Política', 'Policy'), 'Referência'], ['CORS / ws://127.0.0.1:8765/ws', l('Origin lock: backend não verificado', 'Origin lock: backend not verified'), 'Referência']]} /><h2 className="font-bold">{l('Tentativas bloqueadas e intrusões', 'Blocked attempts and intrusions')}</h2><AdminTable headers={['IP', l('Alvo', 'Target'), l('Horário', 'Time'), l('Motivo', 'Reason'), l('Ação', 'Action')]} rows={[[ '192.0.2.14', 'admin', now, l('Força bruta bloqueada', 'Brute force blocked'), 'BLOCK'], ['198.51.100.8', 'operador', now, l('Hash SHA-256 divergente', 'SHA-256 mismatch'), 'DENY'], ['203.0.113.22', 'api', now, l('Token inválido', 'Invalid token'), 'REJECT']]} /></section>
}
function demoPeople(tick: number): AdminPerson[] {
  return ['Técnicos', 'NOC', 'Suporte'].map((name, index) => ({ id: 'demo-' + name, name, role: index === 2 ? 'admin' : 'user', ip: `192.168.10.${21 + index}`, target: batchModels[index], module: ['BOT de Automação', 'Modo IA', 'Rede Local'][(index + Math.floor(tick / 4)) % 3], login: Date.now() - (index + 1) * 900000, seen: Date.now(), source: 'demo' }))
}
function useDemoStart() { const [start] = useState(Date.now()); return start }
function AnimatedDepthChart({ values, label, kind = 'ribbon' }: { values: number[]; label: string; kind?: 'ribbon' | 'bars' | 'gauge' | 'dual-line' }) {
  return kind === 'dual-line' ? <MobileDualLineChart label={label} /> : <AnimatedDepthChartBase values={values} label={label} kind={kind} />
}
function AnimatedDepthChartBase({ values, label, kind = 'ribbon' }: { values: number[]; label: string; kind?: 'ribbon' | 'bars' | 'gauge' }) {
  const id = useId().replace(/:/g, '')
  const ref = useRef<SVGSVGElement | null>(null)
  const latest = useRef(values)
  latest.current = values
  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0, visible = true, disposed = false
    const wave = (t: number, i: number) => Math.sin(t * .9 + i * 1.3) * .6 + Math.cos(t * 1.7 - i * .7) * .4 + Math.sin(t * Math.SQRT2 * .13 + i) * .18
    const paint = (now: number) => {
      const t = motion.matches ? 0 : now / 1000
      const data = latest.current.length ? latest.current : [0]
      const max = Math.max(1, ...data)
      if (kind === 'bars') {
        svg.querySelectorAll<SVGGElement>('[data-bar]').forEach((group, i) => {
          const x = 18 + i * 210 / data.length, width = Math.max(4, 170 / data.length), h = Math.max(2, data[i] / max * 58 + (motion.matches ? 0 : wave(t, i) * 3)), y = 86 - h
          group.children[0].setAttribute('d', `M${x} 86V${y}H${x + width}V86Z`)
          group.children[1].setAttribute('d', `M${x} ${y}l7 -6h${width}l-7 6Z`)
          group.children[2].setAttribute('d', `M${x + width} ${y}l7 -6V80l-7 6Z`)
        })
      } else if (kind === 'gauge') {
        svg.querySelectorAll<SVGCircleElement>('[data-shine]').forEach((circle, i) => circle.setAttribute('transform', `rotate(${t * (13 + i * 3)} 120 52)`))
      } else {
        const points = Array.from({ length: 28 }, (_, i) => ({ x: 8 + i * 8.3, y: 50 - wave(t, i * .18) * 13 - (data[i % data.length] / max) * 12 }))
        const path = points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')
        svg.querySelectorAll<SVGPathElement>('[data-ribbon]').forEach(p => p.setAttribute('d', path))
        svg.querySelector('[data-area]')?.setAttribute('d', path + ' L232 88 L8 88Z')
      }
    }
    let lastPaint = -Infinity
    const animate = (now: number) => { if (now - lastPaint >= 50) { paint(now); lastPaint = now } if (!disposed && visible && !document.hidden && !motion.matches) frame = requestAnimationFrame(animate) }
    const restart = () => { cancelAnimationFrame(frame); if (!disposed && visible && !document.hidden) { paint(performance.now()); if (!motion.matches) frame = requestAnimationFrame(animate) } }
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? true; restart() })
    observer?.observe(svg); motion.addEventListener('change', restart); document.addEventListener('visibilitychange', restart); restart()
    return () => { disposed = true; cancelAnimationFrame(frame); observer?.disconnect(); motion.removeEventListener('change', restart); document.removeEventListener('visibilitychange', restart) }
  }, [kind, values.length])
  const sum = values.reduce((total, value) => total + value, 0)
  return <svg ref={ref} viewBox="0 0 240 104" className="w-full h-28 text-violet-400" role="img" aria-label={label}>
    <defs><linearGradient id={id + '-depth'} x1="0" y1="0" x2="0" y2="1"><stop stopColor="currentColor" stopOpacity=".65" /><stop offset="1" stopColor="currentColor" stopOpacity=".02" /></linearGradient></defs>
    <path d="M8 89L222 89L234 79" fill="none" stroke="currentColor" opacity=".2" />
    {kind === 'bars' ? values.map((_, i) => <g key={i} data-bar=""><path fill={`url(#${id}-depth)`} /><path fill="currentColor" opacity=".85" /><path fill="currentColor" opacity=".35" /></g>) : kind === 'gauge' ? values.map((value, i) => { const radius = Math.max(8, 40 - i * 10), circumference = 2 * Math.PI * radius; return <g key={i}><ellipse cx="120" cy="58" rx={radius} ry={radius * .8} fill="none" stroke="currentColor" strokeWidth="7" opacity=".1" /><circle cx="120" cy="52" r={radius} fill="none" stroke="currentColor" strokeWidth="6" opacity=".18" /><circle cx="120" cy="52" r={radius} fill="none" stroke={['#10b981', '#f59e0b', '#ef4444'][i % 3]} strokeWidth="6" strokeDasharray={`${sum ? value / sum * circumference : 0} ${circumference}`} transform="rotate(-90 120 52)" /><circle data-shine="" cx="120" cy="52" r={radius} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray={`6 ${circumference}`} opacity=".75" /></g> }) : <><path data-area="" fill={`url(#${id}-depth)`} /><path data-ribbon="" fill="none" stroke="currentColor" strokeWidth="8" opacity=".13" transform="translate(0 8)" /><path data-ribbon="" fill="none" stroke="currentColor" strokeWidth="5" opacity=".3" transform="translate(0 4)" /><path data-ribbon="" fill="none" stroke="currentColor" strokeWidth="2.5" /></>}
  </svg>
}

function AdminSparkline({ values, label }: { values: number[]; label: string }) {
  return <AnimatedDepthChart values={values} label={label} />
}
function AdminAuditingModule({ data, lang }: { data: AdminData; lang: Language }) {
  const [query, setQuery] = useState('')
  const start = useDemoStart(), l = (pt: string, en: string) => lang === 'pt' ? pt : en
  const people = [...data.people, ...demoPeople(data.tick).map(p => ({ ...p, login: start - 900000 }))]
  const demoEvents: AdminEvent[] = ['Login', 'BOT iniciado / started', 'Modo IA', 'Rede Local'].map((action, i) => ({ id: 'demo-' + i, at: new Date(start - i * 60000).toISOString(), user: ['Técnicos', 'NOC'][i % 2], action, source: 'demo' }))
  const batchEvents: AdminEvent[] = data.batches.map(b => ({ id: b.id, at: b.startedAt, user: b.owner, action: 'Lote iniciado / Batch started · ' + b.id + ' · ' + b.mode, source: 'local' }))
  const events = [...data.events, ...batchEvents, ...demoEvents].sort((a, b) => b.at.localeCompare(a.at)).filter(e => `${e.user} ${e.action} ${e.at}`.toLowerCase().includes(query.toLowerCase()))
  const rows = events.map(e => [e.at, e.user, e.action, e.source === 'demo' ? 'Referência / Reference' : e.source])
  return <section className="space-y-5"><h1 className="text-2xl font-bold">{l('Auditoria e Logs', 'Audit and Logs')}</h1><AdminStats items={[[l('Operadores Online', 'Online operators'), people.length], [l('Usando o BOT de Automação', 'Using Automation BOT'), people.filter(p => /internet|BOT/.test(p.module)).length], [l('Usando o Modo IA', 'Using AI Mode'), people.filter(p => /IA/.test(p.module)).length], [l('Logins registrados hoje (local)', 'Logins recorded today (local)'), data.events.filter(e => e.action === 'Login' && new Date(e.at).toDateString() === new Date().toDateString()).length]]} /><AdminTable headers={[l('Usuário', 'User'), 'IP', l('Módulo', 'Module'), l('Duração (min)', 'Duration (min)'), l('Origem', 'Source')]} rows={people.map(p => [p.name, p.ip, p.module, Math.floor((Date.now() - p.login) / 60000), p.source === 'demo' ? 'Referência / Reference' : p.source])} /><input aria-label={l('Buscar auditoria', 'Search audit')} value={query} onChange={e => setQuery(e.target.value)} placeholder={l('Buscar auditoria', 'Search audit')} className="w-full rounded-xl bg-background border border-border p-3" /><div className="flex flex-wrap gap-3">{['TXT', 'CSV'].map(format => <button key={format} type="button" className={adminButton} onClick={() => adminExport('auditoria.' + format.toLowerCase(), [['Time', 'User', 'Event', 'Source'], ...rows], format === 'CSV')}>{l('Exportar Auditoria', 'Export Audit')} ({format})</button>)}</div><AdminTable headers={[l('Horário', 'Time'), l('Usuário', 'User'), l('Evento', 'Event'), l('Origem', 'Source')]} rows={rows} /></section>
}
function demoReportBatches(): ConfigBatch[] {
  return batchModels.map((model, index) => {
    const files = batchModelFiles(model), start = new Date(); start.setHours(9, index * 10, 0, 0)
    const end = new Date(start.getTime() + 240000).toISOString()
    const attempts: BatchAttempt[] = Array.from({ length: 3 }, (_, i) => {
      const power = [-20.8, -20.2, -19.7][i], optical = testZteOptical(power, -20)
      return { id: 'demo-' + index + '-' + i, position: i === 2 ? 2 : 1, attempt: i === 1 ? 2 : 1, serial: 'DEMO-ZTE' + index + '00' + i, startedAt: new Date(start.getTime() + i * 80000).toISOString(), endedAt: new Date(start.getTime() + (i + 1) * 80000).toISOString(), model, power, optical: optical.optical, result: optical.passed ? 'CONFIGURADA' : 'REPROVADA NO SINAL', opticalWarning: optical.warning, firmware: files.firmware && optical.passed ? 'CONFIRMADO (SIMULAÇÃO)' : 'DISPENSADO', backup: optical.passed ? 'CONFIRMADO (SIMULAÇÃO)' : 'PENDENTE', adminPassword: optical.passed ? 'CONFIRMADO (SIMULAÇÃO)' : 'PENDENTE', wifi24: optical.passed ? 'CONFIRMADO (SIMULAÇÃO)' : 'PENDENTE', wifi5: optical.passed ? 'CONFIRMADO (SIMULAÇÃO)' : 'PENDENTE', ssid24: 'Router Lyberty 2.4G', ssid5: 'Router Lyberty 5G', firmwareFile: files.firmware, expectedVersion: files.version, backupFile: files.backup, occurrence: 'DEMONSTRAÇÃO · sem conexão com equipamento real' }
    })
    return { id: 'DEMO-' + index, owner: ['Técnicos', 'NOC'][index % 2], mode: 'mock', startedAt: start.toISOString(), endedAt: end, status: 'CONCLUÍDO', model, requested: 2, cto: -20, minimum: -20.5, firmwareRequested: !!files.firmware, backupRequested: true, attempts, logs: [{ id: 'demo', time: end, type: 'info', pt: 'Relatório demonstrativo. Sem execução real.', en: 'Demo report. No real execution.' }], pdfFileName: 'DEMO_' + model.replaceAll(' ', '_') + '.pdf', progress: 100, stopRequested: false }
  })
}
function useAdminModal(open: boolean) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const focusables = () => Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not([disabled]), select, input, iframe, [tabindex="0"]') || [])
    focusables()[0]?.focus()
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const items = focusables(), first = items[0], last = items[items.length - 1]
      if (!first) { event.preventDefault(); return }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', trap)
    return () => { document.removeEventListener('keydown', trap); previous?.focus() }
  }, [open])
  return ref
}

function AdminReportsModule({ data, lang }: { data: AdminData; lang: Language }) {
  const [includeDemo, setIncludeDemo] = useState(true)
  const [demoBatches] = useState(demoReportBatches)
  const [filter, setFilter] = useState(''), [busy, setBusy] = useState(''), [error, setError] = useState(''), [pdf, setPdf] = useState<{ url: string; name: string } | null>(null)
  const modalRef = useAdminModal(!!pdf)
  const mounted = useRef(true), urls = useRef<string[]>([])
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; urls.current.forEach(url => URL.revokeObjectURL(url)) } }, [])
  useEffect(() => { if (!pdf) return; const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setPdf(null) }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close) }, [pdf])
  const l = (pt: string, en: string) => lang === 'pt' ? pt : en
  const batches = [...data.batches.filter(b => b.endedAt), ...(includeDemo ? demoBatches : [])], attempts = batches.flatMap(b => b.attempts)
  const passed = attempts.filter(a => a.optical === 'APROVADA').length, warning = attempts.filter(a => a.optical === 'APROVADA COM AVISO').length, rejected = attempts.filter(a => a.optical === 'REPROVADA NO SINAL').length
  const tested = passed + warning + rejected
  const filtered = batches.filter(b => (b.id + b.owner + b.model + b.mode).toLowerCase().includes(filter.toLowerCase()))
  async function report(batch: ConfigBatch, download: boolean) {
    if (busy) return; setBusy(batch.id); setError('')
    try {
      const blob = await createBatchPdf(batch); if (!mounted.current) return
      const url = URL.createObjectURL(blob); urls.current.push(url)
      if (download) { const link = document.createElement('a'); link.href = url; link.download = safePdfFileName(batch.pdfFileName); document.body.appendChild(link); link.click(); link.remove() } else setPdf({ url, name: batch.pdfFileName })
    } catch { if (mounted.current) setError(l('Não foi possível gerar o PDF.', 'Unable to generate PDF.')) }
    finally { if (mounted.current) setBusy('') }
  }
  const productivity = [...new Set(batches.map(b => b.owner))].flatMap(owner => batchModels.map(model => [owner, model, batches.filter(b => b.owner === owner && b.model === model).reduce((sum, b) => sum + configuredAttempts(b).length, 0)] as (string | number)[]))
  return <section className="space-y-5"><h1 className="text-2xl font-bold">{l('Relatórios · SLA Executivo', 'Reports · Executive SLA')}</h1><p className="text-xs text-muted-foreground">{l('Consolidado dos lotes locais e exemplos opcionais, sempre identificados.', 'Consolidated local batches and optional reference examples, always labeled.')}</p><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={includeDemo} onChange={e => setIncludeDemo(e.target.checked)} />{l('Incluir relatórios de referência nos indicadores', 'Include reference reports in metrics')}</label><AdminStats items={[[l('ONUs configuradas', 'Configured ONUs'), attempts.filter(a => a.result === 'CONFIGURADA').length], [l('Aprovação óptica', 'Optical approval'), tested ? ((passed + warning) / tested * 100).toFixed(1) + '%' : '—'], [l('Com aviso', 'With warning'), warning], [l('Reprovadas < CTO − 0,50', 'Rejected < CTO − 0.50'), rejected]]} /><div className={adminCard}><h2 className="font-bold">{l('SLA Óptico', 'Optical SLA')}</h2><DesktopOpticalSlaChart counts={[passed, warning, rejected]} lang={lang} /></div><h2 className="font-bold">{l('Produtividade por modelo e operador', 'Productivity by model and operator')}</h2><AdminTable headers={[l('Operador', 'Operator'), l('Modelo', 'Model'), l('Configuradas', 'Configured')]} rows={productivity} /><input aria-label={l('Filtrar lotes', 'Filter batches')} value={filter} onChange={e => setFilter(e.target.value)} placeholder={l('Buscar lote, modelo ou operador', 'Search batch, model or operator')} className="w-full rounded-xl border border-border bg-background p-3" /><button type="button" className={adminButton} onClick={() => adminExport('resumo-lotes.csv', [['Batch', 'Operator', 'Model', 'Source', 'Configured', 'Started', 'Ended'], ...filtered.map(b => [b.id, b.owner, b.model, b.mode, configuredAttempts(b).length, b.startedAt, b.endedAt || ''])])}>{l('Exportar resumo CSV', 'Export CSV summary')}</button><div className="overflow-x-auto"><table className="w-full text-xs text-left"><thead><tr>{['Lote / Batch', 'Operador / Operator', 'Modelo / Model', 'Origem / Source', 'PDF'].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead><tbody>{filtered.map(b => <tr key={b.owner + b.id} className="border-t border-border"><td className="p-3">{b.id}</td><td>{b.owner}</td><td>{b.model}</td><td>{b.mode === 'mock' ? 'Gerado / Generated' : "Bancada Local"}</td><td className="flex gap-2 p-3"><button type="button" className={adminButton} disabled={!!busy} onClick={() => void report(b, false)}>{l('Abrir', 'Open')}</button><button type="button" className={adminButton} disabled={!!busy} onClick={() => void report(b, true)}>{l('Baixar', 'Download')}</button></td></tr>)}</tbody></table>{!filtered.length && <p className="p-5 text-sm">{l('Conclua um lote no BOT para gerar o primeiro relatório.', 'Complete a BOT batch to generate the first report.')}</p>}</div>{error && <p role="alert">{error}</p>}{pdf && <div ref={modalRef} role="dialog" aria-modal="true" aria-label={pdf.name} className="fixed inset-0 z-[100] bg-black/70 p-3 sm:p-8 flex flex-col"><div className="bg-card p-3 flex justify-between items-center"><span className="truncate">{pdf.name}</span><button autoFocus type="button" onClick={() => setPdf(null)} aria-label={l('Fechar PDF', 'Close PDF')}><X /></button></div><iframe title={pdf.name} src={pdf.url} className="w-full flex-1 bg-white" /></div>}</section>
}
function AdminUsersLive({ data, lang }: { data: AdminData; lang: Language }) {
  const [permissions, setPermissions] = useState<Record<string, 'admin' | 'user'>>({})
  const [editing, setEditing] = useState<AdminPerson | null>(null), [permission, setPermission] = useState<'admin' | 'user'>('user'), [error, setError] = useState('')
  const modalRef = useAdminModal(!!editing)
  const start = useDemoStart(), l = (pt: string, en: string) => lang === 'pt' ? pt : en
  useEffect(() => { try { const saved = safeJsonParse(localStorage.getItem('codenet_demo_permissions_v1') || '{}', {}); if (saved && typeof saved === 'object') setPermissions(saved) } catch { /* Start with the demo defaults. */ } }, [])
  const people = [...data.people, ...demoPeople(data.tick).map(p => ({ ...p, login: start - 900000 }))]
  const attempts = adminAttempts(data)
  const samples = Array.from({ length: 18 }, (_, i) => Math.round(12 + 7 * Math.sin((data.tick + i) / 3)))
  function save() {
    if (!editing) return
    try { const next = { ...permissions, [editing.id]: permission }; localStorage.setItem('codenet_demo_permissions_v1', JSON.stringify(next)); setPermissions(next); setEditing(null); setError(''); writeAdminEvent('Admin', 'Permissão de referência alterada / Reference permission changed') } catch { setError(l('Falha ao salvar.', 'Unable to save.')) }
  }
  return <div className="space-y-5"><div className={adminCard}><h2 className="font-bold">{l('Usuários e ONUs · uso ao vivo', 'Users and ONUs · live usage')}</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div><p>{l('Sessões Ativas', 'Active Sessions')}: {people.length}</p><AdminSparkline label="Sessões" values={samples.map(v => v / 3)} /></div><div><p>{l('ONUs configuradas (lotes locais)', 'Configured ONUs (local batches)')}: {attempts.filter(x => x.attempt.result === 'CONFIGURADA').length}</p><AnimatedDepthChart kind="bars" label={l('ONUs por setor', 'ONUs by department')} values={people.map((p, i) => p.source === 'demo' ? 3 + i : attempts.filter(x => x.batch.owner === p.name && x.attempt.result === 'CONFIGURADA').length)} /></div><div><p>{l('Requisições / min', 'Requests / min')}: {samples[samples.length - 1]}</p><AdminSparkline label="Requests" values={samples} /></div></div></div><div className={adminCard}><h2 className="font-bold">{l('Permissões e acompanhamento', 'Permissions and tracking')}</h2><div className="overflow-x-auto"><table className="w-full text-xs text-left"><thead><tr>{['Operador / Cargo', 'Rede / IP', 'ONU', 'Módulo', 'Login', 'Permissão', ''].map((label, i) => <th key={i} className="p-3">{lang === 'pt' ? label : ['Operator / Role', 'Network / IP', 'ONU', 'Module', 'Login', 'Permission', ''][i]}</th>)}</tr></thead><tbody>{people.map(p => <tr key={p.id} className="border-t border-border"><td className="p-3">{p.name} · {p.source === 'demo' ? l('Referência', 'Reference') : p.source}</td><td>{p.ip}</td><td>{p.target}</td><td>{p.module}</td><td>{new Date(p.login).toLocaleTimeString()}</td><td>{(permissions[p.id] || p.role) === 'admin' ? l('Admin Total', 'Full Admin') : l('Operador de Bancada', 'Bench Operator')}</td><td><button type="button" className={adminButton} disabled={p.source !== 'demo'} onClick={() => { setEditing(p); setPermission(permissions[p.id] || p.role) }}>{l('Alterar', 'Change')}</button></td></tr>)}</tbody></table></div><p className="text-xs text-muted-foreground">{l('Permissões de referência persistem neste navegador. Sessões reais mantêm o perfil do login; autorização no servidor será integrada futuramente.', 'Reference permissions persist in this browser. Real sessions retain their login role; server authorization will be integrated later.')}</p></div>{editing && <div ref={modalRef} className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onKeyDown={e => { if (e.key === 'Escape') setEditing(null) }}><form role="dialog" aria-modal="true" aria-label={l('Alterar permissão de referência', 'Change reference permission')} onSubmit={e => { e.preventDefault(); save() }} className={adminCard + ' w-full max-w-md bg-background'}><h3 className="font-bold">{editing.name}</h3><select autoFocus value={permission} onChange={e => setPermission(e.target.value as 'admin' | 'user')} className="w-full bg-background border border-border rounded-xl p-3"><option value="user">{l('Operador de Bancada', 'Bench Operator')}</option><option value="admin">{l('Admin Total', 'Full Admin')}</option></select><div className="flex gap-3"><button type="submit" className={adminButton}>{l('Salvar', 'Save')}</button><button type="button" className={adminButton} onClick={() => setEditing(null)}>{l('Cancelar', 'Cancel')}</button></div>{error && <p role="alert">{error}</p>}</form></div>}</div>
}
function desktopChartMotionAllowed() {
  return window.innerWidth >= 768 && !document.hidden && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
function useDesktopChartPulse(ms = 800) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => { if (desktopChartMotionAllowed()) setPhase(p => p + 1) }, ms)
    return () => clearInterval(timer)
  }, [ms])
  return phase
}
function DesktopChartStyles() {
  return <style>{`
    @keyframes desktopChartShimmer { from { transform:translateX(-110%) } to { transform:translateX(110%) } }
    @keyframes desktopChartFlow { to { stroke-dashoffset:-90 } }
    .desktop-chart-flow { animation:desktopChartFlow 4s linear infinite; }
    @keyframes desktopChartRadar { to { transform:rotate(360deg) } }
    @keyframes desktopChartBreathe { 50% { opacity:.45; transform:scaleY(.96) } }
    .desktop-chart-fill { position:relative; overflow:hidden; transition:width .7s ease-in-out; }
    .desktop-chart-fill:after { content:''; position:absolute; inset:0; background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent); animation:desktopChartShimmer 2.8s linear infinite; }
    .desktop-chart-radar { transform-origin:50px 50px; animation:desktopChartRadar 5s linear infinite; }
    .desktop-chart-pulse { animation:desktopChartBreathe 2.4s ease-in-out infinite; transform-origin:bottom; }
    .desktop-chart-path { transition:d .7s ease-in-out; }
    @media (prefers-reduced-motion:reduce), (max-width:767px) {
      .desktop-chart-fill:after,.desktop-chart-radar,.desktop-chart-pulse,.desktop-chart-flow { animation:none!important; }
      .desktop-chart-packet { display:none; }
      .desktop-chart-path { transition:none; }
    }
  `}</style>
}
// Visual activity is illustrative; counters and PON values remain recorded batch data.
function DesktopStageChart({ stage, done, total, power, lang }: { stage: number; done: number; total: number; power: number | null; lang: Language }) {
  const phase = useDesktopChartPulse(800), id = useId().replace(/:/g, '')
  const [selected, setSelected] = useState(0)
  const pct = total ? done / total * 100 : 0
  const l = (pt: string, en: string) => lang === 'pt' ? pt : en
  const series = (offset: number) => Array.from({ length: 10 }, (_, i) => 150 - Math.max(4, pct * .85 + (total ? 16 + Math.sin(phase * .65 + i * .85 + offset) * 14 : 0)))
  const a = series(0), b = series(2.5)
  const path = (ys: number[]) => ys.map((y, i) => i === 0 ? `M24,${y}` : stage === 1 ? `C${24+(i-1)*32+16},${ys[i-1]} ${24+i*32-16},${y} ${24+i*32},${y}` : `L${24+i*32},${y}`).join(' ')
  const titles = [l('Escrita Flash · espectro', 'Flash write · spectrum'), l('Backup DNS / OFFLINE → ONLINE', 'DNS backup / OFFLINE → ONLINE'), l('Validação de credenciais · nós', 'Credential validation · nodes'), '2.4 GHz / 5 GHz']
  const readout = `${done}/${total} · ${pct.toFixed(1)}% · PON ${power === null ? '—' : power.toFixed(2) + ' dBm'}`
  return <div className="space-y-3"><DesktopChartStyles /><p className="text-xs font-mono text-muted-foreground">{readout}</p><svg viewBox="0 0 350 180" role="img" aria-label={titles[stage] + ': ' + readout} className="w-full h-48 rounded-2xl bg-background/60 border border-border">
    <defs><linearGradient id={id + 'fill'} x2="0" y2="1"><stop stopColor="#38bdf8" stopOpacity=".8" /><stop offset="1" stopColor="#8b5cf6" stopOpacity=".15" /></linearGradient></defs>
    {[0,1,2,3,4,5,6,7,8,9].map(i => <path key={i} d={`M${24+i*32} 20V150L${36+i*32} 160`} stroke="currentColor" opacity=".09" />)}
    {[50,100,150].map(y => <path key={y} d={`M24 ${y}H312L324 ${y+10}`} stroke="currentColor" opacity=".12" fill="none" />)}
    {(stage === 0 || stage === 3) && a.map((y,i) => <g key={i} onMouseEnter={() => setSelected(i)} onClick={() => setSelected(i)}><title>{titles[stage]} · {readout}</title><path d={`M${24+i*32} ${y}l6 -5v${150-y}l-6 5Z`} fill="#8b5cf6" opacity=".55" className="desktop-chart-path" /><rect x={14+i*32} y={y} width={stage === 3 ? 9 : 16} height={150-y} rx="2" fill={`url(#${id}fill)`} className="transition-all duration-700" />{stage === 3 && <rect x={24+i*32} y={b[i]} width="9" height={150-b[i]} rx="2" fill="#10b981" opacity=".75" className="transition-all duration-700" />}</g>)}
    {stage === 1 && <><path d={`${path(a)}L312 150H24Z`} fill={`url(#${id}fill)`} className="desktop-chart-path" /><path d={`${path(b)}L312 150H24Z`} fill="#8b5cf6" opacity=".2" className="desktop-chart-path" /></>}
    {stage !== 0 && <><path d={path(a)} fill="none" stroke="#38bdf8" strokeWidth="2.5" className="desktop-chart-path" /><path d={path(b)} fill="none" stroke={stage === 3 ? '#10b981' : '#8b5cf6'} strokeWidth="2" strokeDasharray={stage === 2 ? '4 4' : undefined} className="desktop-chart-path" />{a.map((y,i) => <circle key={i} cx={24+i*32} cy={y} r={i === selected ? 5 : 3} fill="#38bdf8" className="transition-all duration-700 desktop-chart-pulse" onMouseEnter={() => setSelected(i)} />)}</>}
    <text x="24" y="173" fontSize="9" fill="currentColor">{titles[stage]}</text>
  </svg><div className="flex gap-1" aria-label={l('Selecionar amostra visual', 'Select visual sample')}>{a.map((_, i) => <button type="button" key={i} onClick={() => setSelected(i)} aria-pressed={selected === i} aria-label={`${l('Amostra', 'Sample')} ${i+1}: ${readout}`} className={`flex-1 rounded p-1 text-[10px] border ${selected === i ? 'border-cyan-400 bg-cyan-400/10' : 'border-border'}`}>{i+1}</button>)}</div><p className="text-[10px] text-muted-foreground">{l('Movimento ilustrativo · conclusão e PON do histórico local. Sem medição de throughput/latência.', 'Illustrative motion · completion and PON from local history. No throughput/latency measurement.')}</p></div>
}
function DesktopOpticalSlaChart({ counts, lang }: { counts: number[]; lang: Language }) {
  const [filter, setFilter] = useState(-1)
  const id = useId().replace(/:/g, '')
  const labels = lang === 'pt' ? ['Aprovadas', 'Aprovadas com aviso', 'Reprovadas'] : ['Passed', 'Passed with warning', 'Rejected']
  const colors = ['#10b981', '#f59e0b', '#f43f5e'], total = counts.reduce((sum,n) => sum+n,0)
  return <div className="space-y-4"><DesktopChartStyles /><div className="flex flex-wrap gap-2">{[lang === 'pt' ? 'Todas' : 'All', ...labels].map((label,i) => <button type="button" key={label} aria-pressed={filter === i-1} onClick={() => setFilter(i-1)} className={`px-3 py-2 rounded-full border text-xs ${filter === i-1 ? 'border-violet-500 bg-violet-500/10' : 'border-border'}`}>{label}</button>)}</div><svg viewBox="0 0 540 210" className="w-full h-60 bg-background/60 rounded-2xl" role="img" aria-label={labels.map((label,i) => `${label}: ${counts[i]}`).join(', ')}>
    {[30,80,130,180].map((y,i) => <g key={y}><path d={`M35 ${y}H510L525 ${y+8}`} stroke="currentColor" opacity=".12" fill="none" /><text x="2" y={y+4} fill="currentColor" fontSize="9">{100-i*100/3 | 0}%</text></g>)}
    {counts.map((count,i) => { const h = total ? count/total*150 : 0, x = 80+i*150, y = 180-h; return <g key={labels[i]} opacity={filter === -1 || filter === i ? 1 : .15} className="transition-opacity duration-300"><defs><linearGradient id={`${id}-${i}`} x2="0" y2="1"><stop stopColor={colors[i]} stopOpacity=".45" /><stop offset="1" stopColor={colors[i]} stopOpacity=".03" /></linearGradient></defs><path d={`M35 ${y}H510V180H35Z`} fill={`url(#${id}-${i})`} /><path d={`M35 180C55 180 55 ${y} 80 ${y}H510`} stroke={colors[i]} fill="none" strokeWidth="2" strokeDasharray="5 4" className="desktop-chart-flow" /><path d={`M${x+38} ${y}l10 -8v${h}l-10 8Z`} fill={colors[i]} opacity=".4" /><rect x={x} y={y} width="38" height={h} rx="4" fill={colors[i]} opacity=".85" /><circle cx={x+19} cy={y} r="4" fill={colors[i]} className="desktop-chart-pulse" /><text x={x+19} y={Math.max(16,y-12)} textAnchor="middle" fontSize="12" fill="currentColor">{count}</text><text x={x+19} y="201" textAnchor="middle" fontSize="9" fill="currentColor">{labels[i]}</text></g> })}
  </svg><p className="text-xs text-muted-foreground">{lang === 'pt' ? 'Distribuição atual dos relatórios · linhas = proporção por resultado (não histórico temporal).' : 'Current report distribution · lines = result proportions (not a time series).'}</p>{counts.map((count,i) => <button key={labels[i]} type="button" aria-pressed={filter === i} onClick={() => setFilter(filter === i ? -1 : i)} className="block w-full text-left rounded-xl border border-border p-3 hover:bg-violet-500/5"><span className="flex justify-between text-sm"><span>{labels[i]}: {count}</span><span className="font-mono">{(total ? count/total*100 : 0).toFixed(1)}%</span></span><div className="mt-2 h-3 rounded bg-background overflow-hidden"><div className="desktop-chart-fill desktop-chart-pulse h-full rounded" style={{ width: `${total ? count/total*100 : 0}%`, background: colors[i] }} /></div></button>)}</div>
}

function AdminPipeline({ data, lang }: { data: AdminData; lang: Language }) {
  const l = (pt: string, en: string) => lang === 'pt' ? pt : en
  const attempts = adminAttempts(data), completed = attempts.filter(x => x.attempt.result === 'CONFIGURADA')
  const stages: [string, keyof BatchAttempt][] = [[l('Etapa 1: Flash Firmware', 'Stage 1: Firmware Flash'), 'firmware'], [l('Etapa 2: Restauração Backup & Reboot', 'Stage 2: Backup Restore & Reboot'), 'backup'], [l('Etapa 3: Senha Admin', 'Stage 3: Admin Password'), 'adminPassword'], [l('Etapa 4: Provisionamento SSIDs 2.4G/5G', 'Stage 4: Provision SSIDs 2.4G/5G'), 'wifi5']]
  const active = data.batches.filter(b => !b.endedAt)
  return <div className="space-y-5"><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{stages.map(([label, key], index) => { const count = attempts.filter(x => /CONFIRM|CONCLU|SUCESS|OK/.test(String(x.attempt[key])) && (key !== 'wifi5' || /CONFIRM|CONCLU|SUCESS|OK/.test(x.attempt.wifi24))).length; const percent = attempts.length ? count / attempts.length * 100 : 0; return <div key={key} className={adminCard}><h3 className="font-semibold text-sm">{label}</h3><p className="text-xs">{attempts.length ? `${count}/${attempts.length} · ${l('lotes locais', 'local batches')}` : l('Pipeline', 'Pipeline')}</p><div className="h-3 rounded bg-background"><div className="desktop-chart-fill h-full rounded bg-violet-500 transition-all duration-700" style={{ width: percent + '%' }} /></div><DesktopStageChart stage={index} done={count} total={attempts.length} power={attempts.length ? attempts[attempts.length - 1].attempt.power : null} lang={lang} /><p>{percent.toFixed(0)}%</p></div> })}</div><div className={adminCard}><h2 className="font-bold">{l("Fila e threads do serviço de automação", "Queue and automation service threads")}</h2><p className="text-sm">{active.length ? `${active.length} ${l('lotes sem encerramento registrado; status baseado no histórico local', 'batches without a recorded end; status based on local history')}` : l('Playwright / Chromium · 1 thread · aguardando ONU', 'Playwright / Chromium · 1 thread · waiting for ONU')}</p><AdminTable headers={[l('Modelo', 'Model'), l('Tempo médio', 'Average time'), l('Sucesso', 'Success')]} rows={batchModels.map((model, i) => { const rows = attempts.filter(x => x.attempt.model === model), done = completed.filter(x => x.attempt.model === model && x.attempt.endedAt); const mean = done.length ? done.reduce((sum, x) => sum + Math.max(0, Date.parse(x.attempt.endedAt!) - Date.parse(x.attempt.startedAt)), 0) / done.length / 1000 : null; return [model, mean !== null ? mean.toFixed(0) + 's · local' : [265, 290, 310, 180][i] + 's', rows.length ? (rows.filter(x => x.attempt.result === 'CONFIGURADA').length / rows.length * 100).toFixed(1) + '% · local' : '96.0%'] })} /></div></div>
}
function AdminTelemetry({ tick, lang }: { tick: number; lang: Language }) {
  const l = (pt: string, en: string) => lang === 'pt' ? pt : en
  const signal = -19.7 + Math.sin(tick / 3) * .15
  const cards = [[l('Chipset ZTE & CPU/Memória', 'ZTE Chipset & CPU/Memory'), `ZX279128 · CPU ${18 + tick % 5}% · RAM ${42 + tick % 3}% · Temp ${46 + tick % 2}°C`, '0x279128'], [l('Módulo Óptico PON & Laser Tx/Rx', 'PON Optical Module & Laser Tx/Rx'), `Rx ${signal.toFixed(2)} dBm · Tx 2.30 dBm · 11.4 mA · 3.29 V`, '0x81'], [l('Stream CWMP/WebSocket', 'CWMP/WebSocket Stream'), `PORT 8765 / 7547 · ${12 + tick % 7} ms`, '0xFFFB']]
  return <div className="space-y-3"><div className="grid grid-cols-1 xl:grid-cols-3 gap-4">{cards.map(([title, value, hex], index) => <div key={title} className={adminCard}><h3 className="font-bold text-sm">{title}</h3><p className="font-mono text-xs leading-relaxed">{value}</p><AdminSparkline label={title + ''} values={Array.from({ length: 16 }, (_, i) => 30 + Math.sin((tick + i + index * 3) / 2) * 10)} /><code className="inline-block rounded bg-violet-500/10 px-3 py-1 text-violet-400">{hex} · {['ATIVO', 'PON OK', 'SYNC'][index]}</code></div>)}</div></div>
}

type ThemeMode = 'dark' | 'light'
type AccentColor = 'violet' | 'cyan' | 'emerald'
function AppearanceControls({ themeMode, accentColor, onChange, lang }: { themeMode: ThemeMode; accentColor: AccentColor; onChange: (theme: ThemeMode, accent: AccentColor) => void; lang: Language }) {
  return <div className="space-y-4"><fieldset><legend className="text-sm mb-3">{lang === 'pt' ? 'Tema da Interface' : 'Interface Theme'}</legend><div className="flex flex-wrap gap-3">{(['dark', 'light'] as const).map(mode => <button key={mode} type="button" aria-pressed={themeMode === mode} onClick={() => onChange(mode, 'violet')} className={adminButton + (themeMode === mode ? ' ring-2 ring-violet-500' : '')}>{lang === 'pt' ? mode === 'dark' ? 'Modo Escuro (Padrão)' : 'Modo Claro' : mode === 'dark' ? 'Dark Mode (Default)' : 'Light Mode'}</button>)}</div></fieldset></div>
}
function AppearanceStyle({ themeMode, accentColor }: { themeMode: ThemeMode; accentColor: AccentColor }) {
  const colors = { violet: ['#8b5cf6', '#7c3aed', '#a78bfa', '139,92,246'], cyan: ['#06b6d4', '#0e7490', '#22d3ee', '6,182,212'], emerald: ['#10b981', '#047857', '#34d399', '16,185,129'] }[accentColor]
  return <style>{`
    .codenet-ui { --color-violet-500:${colors[0]}; --color-violet-600:${colors[1]}; --color-violet-400:${colors[2]}; --color-violet-300:${colors[2]}; --accent-rgb:${colors[3]}; }
    .codenet-ui [class~="bg-violet-600"] { background-color:${colors[1]} !important; color:white !important; }
    .codenet-ui [class~="bg-violet-500"] { background-color:${colors[0]} !important; }
    .codenet-ui [class*="text-violet-"] { color:${themeMode === 'light' ? colors[1] : colors[2]} !important; }
    .codenet-ui [class*="border-violet-"] { border-color:rgba(${colors[3]},.35) !important; }
    .codenet-ui [class*="shadow-violet-"] { --tw-shadow-color:rgba(${colors[3]},.3); }
    .codenet-ui [class~="bg-violet-500/5"], .codenet-ui [class~="bg-violet-500/10"], .codenet-ui [class~="bg-violet-500/15"], .codenet-ui [class~="bg-violet-500/20"] { background-color:rgba(${colors[3]},.12) !important; }
    ${themeMode === 'light' ? `
    .codenet-ui { color-scheme:light; --background:#f1f5f9; --foreground:#0f172a; --card:#fff; --border:#cbd5e1; --muted-foreground:#475569; --color-background:#f1f5f9; --color-foreground:#0f172a; --color-card:#fff; --color-border:#cbd5e1; --color-muted-foreground:#475569; background:#f1f5f9 !important; color:#0f172a !important; }
    .codenet-ui [class*="bg-background"], .codenet-ui [class*="bg-[#0"], .codenet-ui [class*="bg-[#1"], .codenet-ui [class*="bg-slate-9"], .codenet-ui [class*="bg-black"] { background-color:#f1f5f9 !important; }
    .codenet-ui [class*="bg-card"], .codenet-ui aside { background-color:#fff !important; }
    .codenet-ui [class*="text-white"], .codenet-ui [class*="text-slate-3"], .codenet-ui [class*="text-slate-4"] { color:#1e293b !important; }
    .codenet-ui [class*="text-muted-foreground"] { color:#475569 !important; }
    .codenet-ui [class*="border-border"] { border-color:#cbd5e1 !important; }
    .codenet-ui [class~="bg-violet-600"], .codenet-ui [class~="bg-violet-600"] * { color:#fff !important; }
    .codenet-ui img[src="/codenet-v2/codenet-logo.png"], .codenet-ui img[src="/codenet-v2/z7-robo.png"], .codenet-ui img[src="/codenet-v2/zseven.jpeg"] { mix-blend-mode:normal !important; filter:invert(1) hue-rotate(180deg); }
    .codenet-ui .mix-blend-screen { mix-blend-mode:normal !important; }
    .codenet-ui [class~="bg-violet-600"] img[src="/codenet-v2/z7-robo.png"] { filter:none; }
    .codenet-ui svg[aria-hidden="true"] { isolation:isolate; }
    .codenet-ui input, .codenet-ui select, .codenet-ui textarea { color:#0f172a; background-color:#fff; }
    .codenet-ui [role="dialog"] { color:#0f172a; }
    .codenet-ui [class*="fixed"][class*="bg-black/"] { background-color:rgba(0,0,0,.65) !important; }
    .codenet-ui aside svg [fill="white"] { fill:#1e293b; }
    .codenet-ui [class~="bg-violet-600"] svg [fill="white"] { fill:white; }
    .codenet-ui [class*="text-emerald-"], .codenet-ui [class*="text-green-"] { color:#047857 !important; }
    .codenet-ui [class*="text-amber-"], .codenet-ui [class*="text-yellow-"] { color:#92400e !important; }
    ` : '.codenet-ui { color-scheme:dark; }'}
    .codenet-ui button { transition:background-color .2s,color .2s,border-color .2s,box-shadow .2s; }
    .codenet-ui button:not(:disabled):not([class~="bg-violet-600"]):hover { background-color:rgba(${colors[3]},.15) !important; color:${themeMode === 'light' ? colors[1] : colors[2]} !important; border-color:rgba(${colors[3]},.4) !important; }
    ${themeMode === 'light' ? `
    .codenet-ui .lucide { color:#0f172a !important; }
    .codenet-ui [class~="bg-violet-600"] .lucide, .codenet-ui [class~="bg-violet-600"] svg { color:white !important; }
    .codenet-ui aside nav button:not([class~="bg-violet-600"]):not(:hover) { background-color:transparent !important; color:#1e293b !important; }
    .codenet-ui img[src="/codenet-v2/discord.jpeg"], .codenet-ui img[src="/codenet-v2/youtube.jpeg"] { filter:brightness(0); opacity:.85; }
    .codenet-ui a:hover img[src="/codenet-v2/discord.jpeg"] { filter:invert(34%) sepia(85%) saturate(3015%) hue-rotate(222deg) brightness(97%) contrast(93%); opacity:1; }
    .codenet-ui a:hover img[src="/codenet-v2/youtube.jpeg"] { filter:invert(23%) sepia(90%) saturate(6054%) hue-rotate(354deg) brightness(94%) contrast(115%); opacity:1; }
    ` : ''}
    @media (prefers-reduced-motion:reduce) { .codenet-ui svg * { transition:none !important; } }
  `}</style>
}

export default function Page() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark')
  const accentColor: AccentColor = 'violet'
  useEffect(() => { try { const saved = safeJsonParse(localStorage.getItem('codenet_appearance_v1') || '{}', {}); if (saved.themeMode === 'light') setThemeMode('light'); /* Saved accent colors are ignored: violet is fixed. */ } catch { /* Use default appearance. */ } }, [])
  function changeAppearance(theme: ThemeMode, accent: AccentColor) {
    setThemeMode(theme)
    try { localStorage.setItem('codenet_appearance_v1', JSON.stringify({ themeMode: theme, accentColor: 'violet' })) } catch { /* Session appearance remains available. */ }
  }
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionGuard, setSessionGuard] = useState({ integrityToken: '', adminAuthVerified: false })
  const sessionEpoch = useRef(0)
  const [targetRouterIp, setTargetRouterIp] = useState('192.168.1.1')
  const [preferences, setPreferences] = useState(operationalDefaults)
  const [aiEnabled, setAiEnabled] = useState(true)
  const [expectedFirmwareHash, setExpectedFirmwareHash] = useState('')
  const [globalFeedback, setGlobalFeedback] = useState('')
  const [moduleSnapshots, setModuleSnapshots] = useState<Record<string, unknown>>({})
  const automationTimers = useRef<ReturnType<typeof setTimeout>[]>([])
  const automationBusy = useRef(false)
  const validatedFirmwareRef = useRef<{ file: File; hash: string } | null>(null)
  const authBusy = useRef(false)
  const [autoStepIndex, setAutoStepIndex] = useState<number | null>(null)
  const [automationTarget, setAutomationTarget] = useState({ ip: '192.168.1.1', model: 'ZTE F6600P' })


  const [isMounted, setIsMounted] = useState(false)
  const [lang, setLang] = useState<Language>('pt')

  const t = translations[lang]
  
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null)
  const [account, setAccount] = useState(false)
  const [logged, setLogged] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [showHelpModal, setShowHelpModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeMenu, setActiveMenu] = useState<SidebarMenu>('internet')
  const adminData = useAdminData(logged && userRole === 'admin' && ['equipments', 'auditing', 'reports', 'users', 'automations', 'monitoring'].includes(activeMenu))

  const handleMenuClick = (menu: SidebarMenu) => {
    if (userRole === 'user' && !USER_ALLOWED_MENUS.includes(menu)) return
    setActiveMenu(menu)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }
  const [tab, setTab] = useState<DiagTab>('accounts')

  const [isChatOpen, setIsChatOpen] = useState(false)
  const [logoAnimating, setLogoAnimating] = useState(false)
  const [chatMessages, setChatMessages] = useState<AiChatMessage[]>([])
  const [chatComposerReset, setChatComposerReset] = useState(0)
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [aiPhase, setAiPhase] = useState<'thinking' | 'responding'>('thinking')
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const chatBusyRef = useRef(false)
  const chatSequenceRef = useRef(0)
  const presenceId = useRef('')
  const loginAt = useRef(0)
  useEffect(() => {
    if (!sessionReady || !logged || !userRole) return
    if (!presenceId.current) presenceId.current = crypto.randomUUID()
    loginAt.current = Date.now()
    writeAdminEvent(username, 'Login')
    return () => { try { localStorage.removeItem('codenet_presence:' + presenceId.current) } catch { /* Presence expires automatically. */ } }
  }, [sessionReady, logged, userRole, username])
  useEffect(() => {
    if (!sessionReady || !logged || !userRole) return
    const heartbeat = () => {
      const person: AdminPerson = { id: presenceId.current, name: username, role: userRole, ip: lang === 'pt' ? 'IP local não detectado' : 'Local IP not detected', target: preferences.targetRouterModel, module: isChatOpen ? 'Modo IA' : activeMenu === 'internet' ? 'BOT de Automação' : activeMenu, login: loginAt.current, seen: Date.now(), source: 'local' }
      try { localStorage.setItem('codenet_presence:' + presenceId.current, JSON.stringify(person)) } catch { /* Presence is best effort. */ }
    }
    heartbeat(); const timer = setInterval(heartbeat, 5000)
    const leave = () => { try { localStorage.removeItem('codenet_presence:' + presenceId.current) } catch { /* TTL fallback. */ } }
    window.addEventListener('pagehide', leave)
    return () => { clearInterval(timer); window.removeEventListener('pagehide', leave); leave() }
  }, [sessionReady, logged, userRole, username, activeMenu, isChatOpen, preferences.targetRouterModel, lang])
  useEffect(() => { if (logged && activeMenu === 'manual_config') writeAdminEvent(username, 'Acesso à Configuração Manual / Manual Configuration access') }, [logged, activeMenu, username])
  const chatRequestRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!aiEnabled) {
      chatRequestRef.current?.abort(); chatRequestRef.current = null
      chatBusyRef.current = false; setIsAiTyping(false); setIsChatOpen(false)
    }
  }, [aiEnabled])

  useEffect(() => {
    if (isChatOpen && chatScrollRef.current) {
      chatScrollRef.current.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [chatMessages, isAiTyping, isChatOpen])

  useEffect(() => {
    // Do not carry one account's conversation into another session.
    chatRequestRef.current?.abort()
    chatRequestRef.current = null
    chatBusyRef.current = false
    setChatMessages([])
    setChatComposerReset(value => value + 1)
    setIsAiTyping(false)
    return () => {
      chatRequestRef.current?.abort()
      chatRequestRef.current = null
      chatBusyRef.current = false
    }
  }, [logged, userRole, username])


  
  const [firmware, setFirmware] = useState<File | null>(null)
  const [config, setConfig] = useState<File | null>(null)
  const [stage, setStage] = useState<Stage>('idle')
  const [message, setMessage] = useState('')

  const [greetingMessage, setGreetingMessage] = useState('')

  const [isAutoRunning, setIsAutoRunning] = useState(false)
  const [autoProgress, setAutoProgress] = useState(0)
  const [autoStepText, setAutoStepText] = useState('')
  const [autoLogs, setAutoLogs] = useState<LogMessage[]>([])
  const [autoElapsedTime, setAutoElapsedTime] = useState(0)
  
  const terminalContainerRef = useRef<HTMLDivElement>(null)

  const [adminUser, setAdminUser] = useState('admin')
  const [adminCurrentPass, setAdminCurrentPass] = useState('')
  const [adminNewPass, setAdminNewPass] = useState('')
  const [adminConfirmPass, setAdminConfirmPass] = useState('')
  const [showAdminCurrentPass, setShowAdminCurrentPass] = useState(false)
  const [showAdminNewPass, setShowAdminNewPass] = useState(false)
  const [showAdminConfirmPass, setShowAdminConfirmPass] = useState(false)
  const [accountFeedbackMessage, setAccountFeedbackMessage] = useState('')

  const [trWanConnection, setTrWanConnection] = useState('Qualquer')
  const [trAcsUrl, setTrAcsUrl] = useState('https://acs.provedor.com.br')
  const [trAcsUser, setTrAcsUser] = useState('admin')
  const [trAcsPass, setTrAcsPass] = useState('••••••••')
  const [showTrAcsPass, setShowTrAcsPass] = useState(false)
  const [trConnReqUrl, setTrConnReqUrl] = useState('http://192.168.1.1:7547/')
  const [trConnReqUser, setTrConnReqUser] = useState('admin')
  const [trConnReqPass, setTrConnReqPass] = useState('••••••••')
  const [showTrConnReqPass, setShowTrConnReqPass] = useState(false)
  const [trPeriodicInform, setTrPeriodicInform] = useState(true)
  const [trPeriodicInterval, setTrPeriodicInterval] = useState(86400)
  const [trAcsAuth, setTrAcsAuth] = useState(false)
  const [trFileServerAuth, setTrFileServerAuth] = useState(false)
  const [trFeedbackMessage, setTrFeedbackMessage] = useState('')

  const [ssid24Name, setSsid24Name] = useState(ZTE_WIFI_DEFAULTS.ssid24)
  const [ssid24Enabled, setSsid24Enabled] = useState(true)
  const [ssid24Crypto, setSsid24Crypto] = useState('WPA2-PSK-AES')
  const [ssid24Pass, setSsid24Pass] = useState(ZTE_WIFI_DEFAULTS.password)
  const [showSsid24Pass, setShowSsid24Pass] = useState(false)
  const [ssid24Isolation, setSsid24Isolation] = useState(false)
  const [ssid24MaxClients, setSsid24MaxClients] = useState(32)

  const [ssid5Name, setSsid5Name] = useState(ZTE_WIFI_DEFAULTS.ssid5)
  const [ssid5Enabled, setSsid5Enabled] = useState(true)
  const [ssid5Crypto, setSsid5Crypto] = useState('WPA2-PSK-AES')
  const [ssid5Pass, setSsid5Pass] = useState(ZTE_WIFI_DEFAULTS.password)
  const [showSsid5Pass, setShowSsid5Pass] = useState(false)
  const [ssid5Isolation, setSsid5Isolation] = useState(false)
  const [ssid5MaxClients, setSsid5MaxClients] = useState(32)

  const [localNetworkMessage, setLocalNetworkMessage] = useState('')

  // Estados com atualização em segundo plano para Visão Geral
  const [overviewLogs, setOverviewLogs] = useState<LogEntry[]>([
    { id: '#01', time: '2026-09-08 15:48:38', tech: 'ZTE Fleet', type: '0xFFFB', desc: 'Remote TR069 Inform recebido', size: '1083', user: 'Técnicos' },
    { id: '#02', time: '2026-09-08 15:48:35', tech: 'ZTE Fleet', type: '0xFFFD', desc: 'Resposta de ping ativo OK (19ms)', size: '1083', user: 'NOC' },
    { id: '#03', time: '2026-09-08 15:48:30', tech: 'ZTE Fleet', type: '0xFFFA', desc: 'Canal Wi-Fi da ONT otimizado (CH 6)', size: '1083', user: 'Suporte' },
    { id: '#04', time: '2026-09-08 15:48:22', tech: 'ZTE Fleet', type: '0xFFFB', desc: 'Renovação de concessão DHCP aprovada', size: '1083', user: 'Técnicos' },
    { id: '#05', time: '2026-09-08 15:48:15', tech: 'ZTE Fleet', type: '0xFFFC', desc: 'Validação de firmware SHA256 verificada', size: '1083', user: 'Almoxarifado' },
    { id: '#06', time: '2026-09-08 15:48:08', tech: 'ZTE Fleet', type: '0xFFFE', desc: 'Verificação de velocidade throughput 92.4 Mbps', size: '1083', user: 'NOC' },
    { id: '#07', time: '2026-09-08 15:48:01', tech: 'ZTE Fleet', type: '0xFFFA', desc: 'Regra de mapeamento de portas injetada', size: '1083', user: 'Engenharia' },
    { id: '#08', time: '2026-09-08 15:47:50', tech: 'ZTE Fleet', type: '0xFFFB', desc: 'Token de autenticação de sessão OK', size: '1083', user: 'Técnicos' },
  ])

  const [scriptLines, setScriptLines] = useState<string[]>([
    '// Importações',
    "import { zsevenEngine } from '@codenet/core'",
    '',
    '// Nome da coleção',
    "export const stream = 'TelemetriaAoVivo'",
    '',
    '// Definição do esquema',
    'const schema = new RouteSchema({',
    '  targetDevice: "ZTE F6600P",',
    '  authStatus: "Sincronizado",',
    '  latencyPeak: 20',
    '})',
    '',
    '// Execução contínua do pipeline',
    'zsevenEngine.listen("0.0.0.0:7547", () => {',
    '  console.log("Socket de telemetria ativo: 92 Mbps");',
    '})'
  ])

  const batchQueue = useBatchConfigurator(username, sessionReady && logged && userRole === 'user', preferences.targetRouterModel, targetRouterIp, { ssid24: ssid24Name, ssid5: ssid5Name, password24: ssid24Pass, password5: ssid5Pass })
  const isAutomationActive = isAutoRunning || batchQueue.running || batchQueue.connection === 'connecting'
  useEffect(() => {
    if (!isAutomationActive) return
    chatRequestRef.current?.abort()
    chatRequestRef.current = null
    chatBusyRef.current = false
    setIsAiTyping(false)
  }, [isAutomationActive])

  const [greetingIndex, setGreetingIndex] = useState(0)
  const completedBatchRef = useRef('')
  useEffect(() => {
    if (sessionReady && logged) setGreetingIndex(Math.floor(Math.random() * 4))
  }, [sessionReady, logged, username, batchQueue.greetingSeed])
  useEffect(() => {
    // Keep the existing AI context in sync with the batch engine without changing the RAG contract.
    if (!logged || userRole !== 'user') return
    const batch = batchQueue.activeBatch
    setIsAutoRunning(batchQueue.running)
    setAutoProgress(batch?.progress || 0)
    setAutoStepIndex(null)
    setAutoLogs(batch?.logs.map(log => ({ id: log.id, time: log.time, type: log.type, text: lang === 'pt' ? log.pt : log.en })) || [])
    const last = batch?.logs[batch.logs.length - 1]
    setAutoStepText(last ? (lang === 'pt' ? last.pt : last.en) : (lang === 'pt' ? 'Pronto para iniciar automação' : 'Ready to start automation'))
    if (batch?.endedAt && completedBatchRef.current !== batch.id) {
      completedBatchRef.current = batch.id
      recordSystemUpdate('Automation', { mode: batch.mode, batchId: batch.id, targetRouterIp, model: batch.model, progress: batch.progress, status: batch.status })
    }
  }, [batchQueue.activeBatch, batchQueue.running, lang, logged, userRole])

  useEffect(() => {
    if (!sessionReady || !logged) return
    const bgInterval = setInterval(() => {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19)
      const admins = ['Técnicos', 'NOC', 'Suporte', 'Almoxarifado', 'Engenharia']
      const actions = [
        'TR069 inform periódico validado',
        'Telemetria de ping verificada (18ms)',
        'Amostra de teste de velocidade 92.1 Mbps',
        'Potência óptica Rx da ONT: -18.2 dBm',
        'Beacon de SSID sincronizado'
      ]

      const randomAdmin = admins[Math.floor(Math.random() * admins.length)]
      const randomAction = actions[Math.floor(Math.random() * actions.length)]

      const nextEntry: LogEntry = {
        id: `#0${Math.floor(Math.random() * 900) + 100}`,
        time: now,
        tech: 'ZTE Fleet',
        type: '0xFF' + Math.floor(Math.random() * 90 + 10),
        desc: randomAction,
        size: '1083',
        user: randomAdmin
      }

      setOverviewLogs(prev => [nextEntry, ...prev.slice(0, 7)])

      setScriptLines(prev => {
        const timeStr = new Date().toTimeString().split(' ')[0]
        const newLine = `// [${timeStr}] Pacote de sincronização entregue: ${randomAction}`
        return [...prev.slice(-14), newLine]
      })
    }, preferences.telemetryInterval)

    return () => clearInterval(bgInterval)
  }, [sessionReady, logged, preferences.telemetryInterval])

  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false)
    setIsMounted(true)
  }, [])

  useEffect(() => {
    {
      const user = username.trim() ? username : t.userFallback
      const templates = lang === 'pt' ? [
        `Bem-vindo! ${user}`,
        `Olá, ${user}! Pronto para automatizar o Roteador?`,
        `Sem perder mais tempo, ${user}, vamos automatizar`,
        `Como posso ajudar, ${user}?`
      ] : [
        `Welcome! ${user}`,
        `Hello, ${user}! Ready to automate the router?`,
        `Let's get right into automation, ${user}`,
        `How may I assist you, ${user}?`
      ]
      const randomIndex = greetingIndex % templates.length
      setGreetingMessage(templates[randomIndex])
    }
  }, [greetingIndex, username, lang, t.userFallback])

  useEffect(() => {
    if (preferences.terminalAutoScroll && terminalContainerRef.current) {
      terminalContainerRef.current.scrollTo({
        top: terminalContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [autoLogs, preferences.terminalAutoScroll, lang])

  useEffect(() => {
    if (isChatOpen) {
      setLogoAnimating(true)
      const timer = setTimeout(() => {
        setLogoAnimating(false)
      }, 1000) 
      return () => clearTimeout(timer)
    }
  }, [isChatOpen])

  const startAutomation = () => {
    if (userRole === 'user') {
      if (!logged || batchQueue.running) return
      setAutoElapsedTime(0)
      setAutomationTarget({ ip: targetRouterIp, model: batchQueue.model })
      setPreferences(prev => ({ ...prev, targetRouterModel: batchQueue.model }))
      // The user configurator connects to the local Python worker, falling back only before a real run starts.
      batchQueue.startAutomation()
      return
    }
    // Preserve the existing Admin automation flow.
    if (isAutoRunning || automationBusy.current || preferences.maxAutomationThreads < 1) return
    if (preferences.requireFirmwareHash && (!firmware || validatedFirmwareRef.current?.file !== firmware || validatedFirmwareRef.current?.hash !== expectedFirmwareHash.trim().toLowerCase())) {
      setGlobalFeedback(lang === 'pt' ? 'Valide o firmware com SHA-256 na aba Software antes da automação.' : 'Validate firmware with SHA-256 in the Software tab before automation.')
      handleMenuClick('diagnostics'); setTab('software'); return
    }
    automationBusy.current = true
    const runTarget = { ip: targetRouterIp, model: preferences.targetRouterModel }
    setAutomationTarget(runTarget)
    setAutoStepIndex(null)

    setIsAutoRunning(true)
    setAutoProgress(0)
    setAutoElapsedTime(0)
    setAutoLogs([])

    const addLog = (text: string, type: LogMessage['type'] = 'info', metadata: Partial<LogMessage> = {}) => {
      const now = new Date()
      const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0')
      setAutoLogs(prev => [...prev, {
        id: Math.random().toString(36).substring(2, 9),
        time: timeStr,
        type,
        text,
        targetIp: runTarget.ip,
        targetModel: runTarget.model,
        ...metadata
      }])
    }

    addLog(`code-net-bot --target=${runTarget.ip} --mode=full-auto`, 'command', { isCommand: true })
    addLog(lang === 'pt' ? 'Iniciando sequência de automação do roteador...' : 'Initializing router automation workflow...', 'info', { isInit: true })

    const steps = automationSteps[lang]

    steps.forEach((step, stepIndex) => {
      const timer = setTimeout(() => {
        setAutoProgress(step.pct)
        setAutoStepIndex(stepIndex)
        setAutoStepText(step.text)
        addLog(step.text, step.type as LogMessage['type'], { stepIndex })

        if (step.pct === 100) {
          automationBusy.current = false
          recordSystemUpdate('Automation', { targetRouterIp: runTarget.ip, model: runTarget.model, progress: 100 })
          setIsAutoRunning(false)
        }
      }, step.delay)
      automationTimers.current.push(timer)
    })
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAutoRunning) {
      interval = setInterval(() => {
        setAutoElapsedTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isAutoRunning])

  async function enter(e: React.FormEvent) {
    e.preventDefault()
    if (authBusy.current) return
    if (!password) { alert(t.passRequired); return }
    authBusy.current = true
    try {
      const name = username.trim()
      if (!name) throw new Error(t.fillField)
      if (['__proto__', 'constructor', 'prototype'].includes(name)) throw new Error(lang === 'pt' ? 'Nome inválido.' : 'Invalid name.')
      if (account) {
        if (password.length !== 8) throw new Error(t.passLengthError)
        if (password !== confirmPassword) throw new Error(t.passMismatch)
        alert(t.accountCreated); setAccount(false); setPassword(''); setConfirmPassword(''); return
      }
      const adminVerified = await sha256Hex(password) === ADMIN_PASSWORD_SHA256
      if (!adminVerified && password.length !== 8) throw new Error(lang === 'pt' ? 'Credenciais inválidas.' : 'Invalid credentials.')
      const role = adminVerified ? 'admin' : 'user'
      const integrityToken = await createSessionIntegrity(role, name, adminVerified)
      setSessionGuard({ integrityToken, adminAuthVerified: adminVerified })
      restoreLocalProfile(role, name)
      setUsername(name); setUserRole(role); setActiveMenu(role === 'admin' ? 'overview' : 'internet')
      setIsChatOpen(false); setLogged(true); setMessage('')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : (lang === 'pt' ? 'Não foi possível acessar o armazenamento local.' : 'Local storage is unavailable.')
      setMessage(errorMessage)
      alert(errorMessage)
    }
    finally { authBusy.current = false }
  }


  async function run(file: File | null, next: 'software' | 'config') {
    if (!file) return setMessage(t.selectFileError)
    if (next === 'software' && preferences.requireFirmwareHash) {
      if (!/^[a-fA-F0-9]{64}$/.test(expectedFirmwareHash.trim())) return setMessage(lang === 'pt' ? 'Informe o SHA-256 esperado do firmware.' : 'Enter the expected firmware SHA-256.')
      try {
        const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await file.arrayBuffer())), byte => byte.toString(16).padStart(2, '0')).join('')
        if (hash !== expectedFirmwareHash.trim().toLowerCase()) return setMessage(lang === 'pt' ? 'SHA-256 divergente. Envio bloqueado.' : 'SHA-256 mismatch. Upload blocked.')
        validatedFirmwareRef.current = { file, hash }
      } catch { return setMessage(lang === 'pt' ? 'Não foi possível validar o firmware.' : 'Unable to validate firmware.') }
    }
    setStage('uploading')
    setMessage('')
    window.setTimeout(() => {
      setStage('success')
      setMessage(next === 'software' ? t.updateSuccess : t.configSuccess)
    }, 2200)
  }

  function handleSaveAccount(e: React.FormEvent) {
    e.preventDefault()
    if (adminNewPass !== adminConfirmPass) {
      setAccountFeedbackMessage(t.passwordsDoNotMatch)
      return
    }
    recordSystemUpdate('Account', { adminUser })
    setAccountFeedbackMessage(t.accountSettingsSaved)
    setTimeout(() => setAccountFeedbackMessage(''), 4000)
  }

  function handleSaveTR069(e: React.FormEvent) {
    e.preventDefault()
    recordSystemUpdate('TR-069', { trAcsUrl, trPeriodicInform, trPeriodicInterval })
    setTrFeedbackMessage(t.tr069Saved)
    setTimeout(() => setTrFeedbackMessage(''), 4000)
  }

  const handleApplyLocalNetwork = (e: React.FormEvent) => {
    e.preventDefault()
    recordSystemUpdate('Wi-Fi', { ssid24Name, ssid24Enabled, ssid24Crypto, ssid5Name, ssid5Enabled, ssid5Crypto })
    setLocalNetworkMessage(t.localNetworkSuccess)
    setTimeout(() => setLocalNetworkMessage(''), 4500)
  }

  const handleCancelLocalNetwork = () => {
    setSsid24Name(ZTE_WIFI_DEFAULTS.ssid24)
    setSsid24Pass(ZTE_WIFI_DEFAULTS.password)
    setSsid24Enabled(true)
    setSsid24Crypto('WPA2-PSK-AES')
    setSsid24Isolation(false)
    setSsid24MaxClients(32)

    setSsid5Name(ZTE_WIFI_DEFAULTS.ssid5)
    setSsid5Pass(ZTE_WIFI_DEFAULTS.password)
    setSsid5Enabled(true)
    setSsid5Crypto('WPA2-PSK-AES')
    setSsid5Isolation(false)
    setSsid5MaxClients(32)

    setLocalNetworkMessage('')
  }

  const menuNameMap: Record<SidebarMenu, string> = {
    firmware_catalog: lang === 'pt' ? 'Catálogo de Firmwares' : 'Firmware Catalog',
    optical_test: lang === 'pt' ? 'Teste Rápido Óptico' : 'Quick Optical Test',
    report_center: lang === 'pt' ? 'Central de Relatórios' : 'Report Center',
    bench_guide: lang === 'pt' ? 'Guia de Bancada' : 'Bench Guide',
    bench_defaults: lang === 'pt' ? 'Padrões da Bancada' : 'Bench Defaults',
    manual_config: lang === 'pt' ? 'Configuração Manual' : 'Manual Configuration',
    internet: t.assistantPanel,
    local: t.localNetwork,
    diagnostics: t.diagAndMgmt,
    overview: t.overview,
    automations: t.automations,
    equipments: t.equipments,
    users: t.usersAndPerms,
    security: t.security,
    monitoring: t.monitoring,
    auditing: t.auditAndLogs,
    alerts: t.alerts,
    reports: t.reports,
    settings: t.settings,
    premium: lang === 'pt' ? 'PLANOS PREMIUM' : 'PREMIUM PLANS'
  }

  const sessionSnapshot = { ...sessionGuard, logged, userRole, username, activeMenu, tab, lang, ssid24Name, ssid24Enabled, ssid24Crypto, ssid24Isolation, ssid24MaxClients, ssid5Name, ssid5Enabled, ssid5Crypto, ssid5Isolation, ssid5MaxClients, adminUser, trWanConnection, trAcsUrl, trAcsUser, trConnReqUrl, trPeriodicInform, trPeriodicInterval, trAcsAuth, trFileServerAuth, targetRouterIp, preferences, aiEnabled, moduleSnapshots, overviewLogs }

  function restoreLocalProfile(role: 'admin' | 'user', name: string) {
    try {
      const profiles = safeJsonParse(localStorage.getItem('codenet_profiles_v1') || '{}', {})
      const saved = profiles[JSON.stringify([role, name])]
      const defaults = { logged: false, userRole: null, username: '', activeMenu: 'internet', tab: 'accounts', lang: 'pt', ssid24Name: '', ssid24Enabled: true, ssid24Crypto: 'WPA2-PSK-AES', ssid24Isolation: false, ssid24MaxClients: 32, ssid5Name: '', ssid5Enabled: true, ssid5Crypto: 'WPA2-PSK-AES', ssid5Isolation: false, ssid5MaxClients: 32, adminUser: 'admin', trWanConnection: 'Qualquer', trAcsUrl: 'https://acs.provedor.com.br', trAcsUser: 'admin', trConnReqUrl: 'http://192.168.1.1:7547/', trPeriodicInform: true, trPeriodicInterval: 86400, trAcsAuth: false, trFileServerAuth: false, targetRouterIp: '192.168.1.1', preferences: operationalDefaults }
      if (saved && typeof saved === 'object') {
        if (typeof saved.ssid24Name === typeof defaults.ssid24Name) setSsid24Name(saved.ssid24Name.trim() || ZTE_WIFI_DEFAULTS.ssid24)
        if (typeof saved.ssid24Enabled === typeof defaults.ssid24Enabled) setSsid24Enabled(saved.ssid24Enabled)
        if (typeof saved.ssid24Crypto === typeof defaults.ssid24Crypto) setSsid24Crypto(saved.ssid24Crypto)
        if (typeof saved.ssid24Isolation === typeof defaults.ssid24Isolation) setSsid24Isolation(saved.ssid24Isolation)
        if (typeof saved.ssid24MaxClients === typeof defaults.ssid24MaxClients) setSsid24MaxClients(saved.ssid24MaxClients)
        if (typeof saved.ssid5Name === typeof defaults.ssid5Name) setSsid5Name(saved.ssid5Name.trim() || ZTE_WIFI_DEFAULTS.ssid5)
        if (typeof saved.ssid5Enabled === typeof defaults.ssid5Enabled) setSsid5Enabled(saved.ssid5Enabled)
        if (typeof saved.ssid5Crypto === typeof defaults.ssid5Crypto) setSsid5Crypto(saved.ssid5Crypto)
        if (typeof saved.ssid5Isolation === typeof defaults.ssid5Isolation) setSsid5Isolation(saved.ssid5Isolation)
        if (typeof saved.ssid5MaxClients === typeof defaults.ssid5MaxClients) setSsid5MaxClients(saved.ssid5MaxClients)
        if (typeof saved.adminUser === typeof defaults.adminUser) setAdminUser(saved.adminUser)
        if (typeof saved.trWanConnection === typeof defaults.trWanConnection) setTrWanConnection(saved.trWanConnection)
        if (typeof saved.trAcsUrl === typeof defaults.trAcsUrl) setTrAcsUrl(saved.trAcsUrl)
        if (typeof saved.trAcsUser === typeof defaults.trAcsUser) setTrAcsUser(saved.trAcsUser)
        if (typeof saved.trConnReqUrl === typeof defaults.trConnReqUrl) setTrConnReqUrl(saved.trConnReqUrl)
        if (typeof saved.trPeriodicInform === typeof defaults.trPeriodicInform) setTrPeriodicInform(saved.trPeriodicInform)
        if (typeof saved.trPeriodicInterval === typeof defaults.trPeriodicInterval) setTrPeriodicInterval(saved.trPeriodicInterval)
        if (typeof saved.trAcsAuth === typeof defaults.trAcsAuth) setTrAcsAuth(saved.trAcsAuth)
        if (typeof saved.trFileServerAuth === typeof defaults.trFileServerAuth) setTrFileServerAuth(saved.trFileServerAuth)
        setTargetRouterIp(validRouterIp(saved.targetRouterIp) ? saved.targetRouterIp : '192.168.1.1')
        if (typeof saved.aiEnabled === 'boolean') setAiEnabled(saved.aiEnabled)
        else if (typeof saved.preferences?.aiEnabled === 'boolean') setAiEnabled(saved.preferences.aiEnabled)
        if (saved.preferences && typeof saved.preferences === 'object') {
          const clean = { ...operationalDefaults }
          for (const key of Object.keys(operationalDefaults) as (keyof typeof operationalDefaults)[]) {
            if (typeof saved.preferences[key] === typeof operationalDefaults[key]) Object.assign(clean, { [key]: saved.preferences[key] })
          }
          clean.telemetryInterval = Math.max(1000, Math.min(3600000, clean.telemetryInterval))
          clean.cwmpPort = Math.max(1, Math.min(65535, clean.cwmpPort))
          clean.maxAutomationThreads = Math.max(1, Math.min(64, clean.maxAutomationThreads))
          setPreferences(clean)
        }
        if (saved.moduleSnapshots && typeof saved.moduleSnapshots === 'object' && !Array.isArray(saved.moduleSnapshots)) setModuleSnapshots(saved.moduleSnapshots)
        if (Array.isArray(saved.overviewLogs) && saved.overviewLogs.every((entry: any) => entry && typeof entry.id === 'string' && typeof entry.desc === 'string')) setOverviewLogs(saved.overviewLogs.slice(0, 30))

        if (saved.lang === 'pt' || saved.lang === 'en') setLang(saved.lang)
      }
      const policy = safeJsonParse(localStorage.getItem('codenet_security_v1') || '{}', {})
      setPreferences(prev => ({ ...prev,
        requireFirmwareHash: typeof policy.requireFirmwareHash === 'boolean' ? policy.requireFirmwareHash : prev.requireFirmwareHash,
      }))
    } catch { setGlobalFeedback(lang === 'pt' ? 'Não foi possível restaurar as configurações da conta.' : 'Unable to restore account settings.') }
  }

  function resetLocalConfiguration() {
    setSsid24Name(ZTE_WIFI_DEFAULTS.ssid24)
    setSsid24Enabled(true)
    setSsid24Crypto('WPA2-PSK-AES')
    setSsid24Isolation(false)
    setSsid24MaxClients(32)
    setSsid5Name(ZTE_WIFI_DEFAULTS.ssid5)
    setSsid5Enabled(true)
    setSsid5Crypto('WPA2-PSK-AES')
    setSsid5Isolation(false)
    setSsid5MaxClients(32)
    setAdminUser('admin')
    setTrWanConnection('Qualquer')
    setTrAcsUrl('https://acs.provedor.com.br')
    setTrAcsUser('admin')
    setTrConnReqUrl('http://192.168.1.1:7547/')
    setTrPeriodicInform(true)
    setTrPeriodicInterval(86400)
    setTrAcsAuth(false)
    setTrFileServerAuth(false)
    setTargetRouterIp('192.168.1.1')
    setPreferences(operationalDefaults)
    setAiEnabled(true)
    setModuleSnapshots({})
    setOverviewLogs([])
    setTrAcsPass('••••••••'); setTrConnReqPass('••••••••'); setExpectedFirmwareHash('')
  }

  useEffect(() => {
    let cancelled = false
    void (async () => {
    try {
      const raw = localStorage.getItem('codenet_session_v1')
      if (raw) {
        const saved = safeJsonParse(raw, null)
        if (!await verifySessionIntegrity(saved)) throw new Error('Invalid session integrity')
        if (cancelled) return
        setSessionGuard({ integrityToken: saved.integrityToken, adminAuthVerified: saved.adminAuthVerified === true })
        const defaults = { logged: false, userRole: null, username: '', activeMenu: 'internet', tab: 'accounts', lang: 'pt', ssid24Name: '', ssid24Enabled: true, ssid24Crypto: 'WPA2-PSK-AES', ssid24Isolation: false, ssid24MaxClients: 32, ssid5Name: '', ssid5Enabled: true, ssid5Crypto: 'WPA2-PSK-AES', ssid5Isolation: false, ssid5MaxClients: 32, adminUser: 'admin', trWanConnection: 'Qualquer', trAcsUrl: 'https://acs.provedor.com.br', trAcsUser: 'admin', trConnReqUrl: 'http://192.168.1.1:7547/', trPeriodicInform: true, trPeriodicInterval: 86400, trAcsAuth: false, trFileServerAuth: false, targetRouterIp: '192.168.1.1', preferences: operationalDefaults }
        if (!saved || typeof saved !== 'object') throw new Error('Invalid session')
        if (['admin', 'user'].includes(saved.userRole)) setUserRole(saved.userRole)
        if (typeof saved.username === typeof defaults.username) setUsername(saved.username)
        if (typeof saved.activeMenu === typeof defaults.activeMenu && Object.prototype.hasOwnProperty.call(menuNameMap, saved.activeMenu)) setActiveMenu(saved.activeMenu)
        if (typeof saved.tab === typeof defaults.tab && ['accounts', 'tr069', 'software', 'config'].includes(saved.tab)) setTab(saved.tab)
        if (typeof saved.lang === typeof defaults.lang && ['pt', 'en'].includes(saved.lang)) setLang(saved.lang)
        if (typeof saved.ssid24Name === typeof defaults.ssid24Name) setSsid24Name(saved.ssid24Name.trim() || ZTE_WIFI_DEFAULTS.ssid24)
        if (typeof saved.ssid24Enabled === typeof defaults.ssid24Enabled) setSsid24Enabled(saved.ssid24Enabled)
        if (typeof saved.ssid24Crypto === typeof defaults.ssid24Crypto) setSsid24Crypto(saved.ssid24Crypto)
        if (typeof saved.ssid24Isolation === typeof defaults.ssid24Isolation) setSsid24Isolation(saved.ssid24Isolation)
        if (typeof saved.ssid24MaxClients === typeof defaults.ssid24MaxClients) setSsid24MaxClients(saved.ssid24MaxClients)
        if (typeof saved.ssid5Name === typeof defaults.ssid5Name) setSsid5Name(saved.ssid5Name.trim() || ZTE_WIFI_DEFAULTS.ssid5)
        if (typeof saved.ssid5Enabled === typeof defaults.ssid5Enabled) setSsid5Enabled(saved.ssid5Enabled)
        if (typeof saved.ssid5Crypto === typeof defaults.ssid5Crypto) setSsid5Crypto(saved.ssid5Crypto)
        if (typeof saved.ssid5Isolation === typeof defaults.ssid5Isolation) setSsid5Isolation(saved.ssid5Isolation)
        if (typeof saved.ssid5MaxClients === typeof defaults.ssid5MaxClients) setSsid5MaxClients(saved.ssid5MaxClients)
        if (typeof saved.adminUser === typeof defaults.adminUser) setAdminUser(saved.adminUser)
        if (typeof saved.trWanConnection === typeof defaults.trWanConnection) setTrWanConnection(saved.trWanConnection)
        if (typeof saved.trAcsUrl === typeof defaults.trAcsUrl) setTrAcsUrl(saved.trAcsUrl)
        if (typeof saved.trAcsUser === typeof defaults.trAcsUser) setTrAcsUser(saved.trAcsUser)
        if (typeof saved.trConnReqUrl === typeof defaults.trConnReqUrl) setTrConnReqUrl(saved.trConnReqUrl)
        if (typeof saved.trPeriodicInform === typeof defaults.trPeriodicInform) setTrPeriodicInform(saved.trPeriodicInform)
        if (typeof saved.trPeriodicInterval === typeof defaults.trPeriodicInterval) setTrPeriodicInterval(saved.trPeriodicInterval)
        if (typeof saved.trAcsAuth === typeof defaults.trAcsAuth) setTrAcsAuth(saved.trAcsAuth)
        if (typeof saved.trFileServerAuth === typeof defaults.trFileServerAuth) setTrFileServerAuth(saved.trFileServerAuth)
        setTargetRouterIp(validRouterIp(saved.targetRouterIp) ? saved.targetRouterIp : '192.168.1.1')
        if (typeof saved.aiEnabled === 'boolean') setAiEnabled(saved.aiEnabled)
        else if (typeof saved.preferences?.aiEnabled === 'boolean') setAiEnabled(saved.preferences.aiEnabled)
        if (saved.preferences && typeof saved.preferences === 'object') {
          const clean = { ...operationalDefaults }
          for (const key of Object.keys(operationalDefaults) as (keyof typeof operationalDefaults)[]) {
            if (typeof saved.preferences[key] === typeof operationalDefaults[key]) Object.assign(clean, { [key]: saved.preferences[key] })
          }
          clean.telemetryInterval = Math.max(1000, Math.min(3600000, clean.telemetryInterval))
          clean.cwmpPort = Math.max(1, Math.min(65535, clean.cwmpPort))
          clean.maxAutomationThreads = Math.max(1, Math.min(64, clean.maxAutomationThreads))
          setPreferences(clean)
        }
        if (saved.moduleSnapshots && typeof saved.moduleSnapshots === 'object' && !Array.isArray(saved.moduleSnapshots)) setModuleSnapshots(saved.moduleSnapshots)
        if (Array.isArray(saved.overviewLogs) && saved.overviewLogs.every((entry: any) => entry && typeof entry.id === 'string' && typeof entry.desc === 'string')) setOverviewLogs(saved.overviewLogs.slice(0, 30))
        setLogged(saved.logged === true && ['admin', 'user'].includes(saved.userRole) && typeof saved.username === 'string' && saved.username.length > 0)
      }
    } catch { if (cancelled) return; try { localStorage.removeItem('codenet_session_v1') } catch { /* Memory session still ends. */ } setLogged(false); setUserRole(null); setSessionGuard({ integrityToken: '', adminAuthVerified: false }); setGlobalFeedback(lang === 'pt' ? 'Não foi possível restaurar a sessão local.' : 'Unable to restore local session.') }
    finally { if (!cancelled) setSessionReady(true) }
    })()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!sessionReady || !logged || !sessionGuard.integrityToken) return
    const timer = setTimeout(() => {
    try {
      localStorage.setItem('codenet_session_v1', JSON.stringify(sessionSnapshot))
      const profiles = safeJsonParse(localStorage.getItem('codenet_profiles_v1') || '{}', {})
      const { integrityToken: _token, adminAuthVerified: _verified, logged: _logged, userRole: _role, username: _username, activeMenu: _menu, tab: _tab, ...configuration } = sessionSnapshot
      profiles[JSON.stringify([userRole, username])] = configuration
      localStorage.setItem('codenet_profiles_v1', JSON.stringify(profiles))
    }
    catch { setGlobalFeedback(lang === 'pt' ? 'Não foi possível salvar a sessão neste navegador.' : 'Unable to save this browser session.') }
    }, 400)
    return () => clearTimeout(timer)
  }, [sessionGuard, sessionReady, logged, userRole, username, activeMenu, tab, lang, ssid24Name, ssid24Enabled, ssid24Crypto, ssid24Isolation, ssid24MaxClients, ssid5Name, ssid5Enabled, ssid5Crypto, ssid5Isolation, ssid5MaxClients, adminUser, trWanConnection, trAcsUrl, trAcsUser, trConnReqUrl, trPeriodicInform, trPeriodicInterval, trAcsAuth, trFileServerAuth, targetRouterIp, preferences, aiEnabled, moduleSnapshots, overviewLogs])

  useEffect(() => () => {
    automationTimers.current.forEach(clearTimeout)
    automationTimers.current = []
    automationBusy.current = false
  }, [logged])

  const displayAutoStepText = autoStepIndex === null
    ? (lang === 'pt' ? 'Pronto para iniciar automação' : 'Ready to start automation')
    : automationLogText({ id: '', time: '', type: 'info', text: autoStepText, stepIndex: autoStepIndex, targetIp: automationTarget.ip, targetModel: automationTarget.model }, lang)

  function recordSystemUpdate(module: string, detail: unknown = {}) {
    writeAdminEvent(username, module + ' atualizado / updated')
    const now = new Date()
    const snapshot = { updatedAt: now.toISOString(), data: detail }
    setModuleSnapshots(prev => ({ ...prev, [module]: snapshot }))
    setOverviewLogs(prev => [{ id: `sync-${now.getTime()}`, time: now.toISOString().replace('T', ' ').slice(0, 19), tech: preferences.targetRouterModel, type: 'CONFIG', desc: `${module}: ${lang === 'pt' ? 'dados atualizados' : 'data updated'}`, size: String(JSON.stringify(detail).length), user: username }, ...prev].slice(0, 30))
    if (preferences.visualAlerts) setGlobalFeedback(`${module} — ${lang === 'pt' ? 'Atualizado' : 'Updated'} · ${now.toLocaleTimeString()}`)
    if (preferences.soundAlerts) {
      try {
        const audio = new AudioContext()
        const oscillator = audio.createOscillator()
        const gain = audio.createGain()
        oscillator.connect(gain); gain.connect(audio.destination); gain.gain.value = 0.025
        oscillator.frequency.value = 660; oscillator.start(); oscillator.stop(audio.currentTime + 0.12)
        oscillator.onended = () => { void audio.close() }
      } catch { /* Browser audio restrictions must not prevent saving. */ }
    }
  }

  function clearChatHistory() {
    chatRequestRef.current?.abort(); chatRequestRef.current = null
    chatBusyRef.current = false; setIsAiTyping(false); setChatMessages([]); setChatComposerReset(value => value + 1)
  }

  function logout() {
    sessionEpoch.current++
    setSessionGuard({ integrityToken: '', adminAuthVerified: false })
    writeAdminEvent(username, 'Logout')
    try { localStorage.removeItem('codenet_session_v1') } catch { /* Session still ends in memory. */ }
    clearChatHistory()
    automationTimers.current.forEach(clearTimeout); automationTimers.current = []; automationBusy.current = false
    setIsAutoRunning(false); setAutoProgress(0); setAutoLogs([]); setAutoStepIndex(null); setAutoElapsedTime(0)
    setLogged(false); setUsername(''); setPassword(''); setConfirmPassword(''); setMessage(''); setUserRole(null)
    setActiveMenu('internet'); setTab('accounts'); setIsChatOpen(false); setGlobalFeedback('')
    setSsid24Pass(ZTE_WIFI_DEFAULTS.password); setSsid5Pass(ZTE_WIFI_DEFAULTS.password); setAdminCurrentPass(''); setAdminNewPass(''); setAdminConfirmPass('')
    setFirmware(null); setConfig(null); setStage('idle'); validatedFirmwareRef.current = null
    resetLocalConfiguration()
  }

  async function saveSettings(values: SettingsValues, credentials: { current: string; next: string; confirm: string }) {
    const saveEpoch = sessionEpoch.current
    if (!values.username.trim()) throw new Error(lang === 'pt' ? 'Informe o nome.' : 'Enter a name.')
    if (!validRouterIp(values.targetRouterIp)) throw new Error(lang === 'pt' ? 'IP IPv4 inválido.' : 'Invalid IPv4 address.')
    if (!values.targetRouterModel.trim()) throw new Error(lang === 'pt' ? 'Informe o modelo.' : 'Enter a model.')
    if (!['pt', 'en'].includes(values.lang)) throw new Error('Invalid language')
    const numeric: [number, number, number][] = [[values.telemetryInterval, 1000, 3600000], [values.cwmpPort, 1, 65535], [values.maxAutomationThreads, 1, 64]]
    if (numeric.some(([value, min, max]) => !Number.isInteger(value) || value < min || value > max)) throw new Error(lang === 'pt' ? 'Verifique os limites numéricos.' : 'Check numeric limits.')
    let acs: URL
    try { acs = new URL(values.trAcsUrl); if (!['http:', 'https:'].includes(acs.protocol)) throw new Error() } catch { throw new Error(lang === 'pt' ? 'URL ACS inválida.' : 'Invalid ACS URL.') }
    const storedCredentials = safeJsonParse(localStorage.getItem('codenet_credentials_v1') || '{}', {}) as Record<string, { salt: string; hash: string; role: 'admin' | 'user' }>
    const previousCredential = storedCredentials[username]
    const changingPassword = Boolean(credentials.next || credentials.confirm)
    if (changingPassword) {
      if (credentials.next.length !== 8 || credentials.next !== credentials.confirm) throw new Error(lang === 'pt' ? 'A nova senha deve ter 8 caracteres e coincidir com a confirmação.' : 'The new password must have 8 characters and match confirmation.')
      const matches = password ? credentials.current === password : previousCredential ? await localPasswordHash(credentials.current, previousCredential.salt) === previousCredential.hash : false
      if (!matches) throw new Error(lang === 'pt' ? 'Senha atual incorreta. Após restaurar uma sessão antiga sem credencial local, entre novamente antes de alterar a senha.' : 'Incorrect current password. After restoring an old session without a local credential, sign in again before changing the password.')
    }
    const nextName = values.username.trim()
    if (['__proto__', 'constructor', 'prototype'].includes(nextName)) throw new Error(lang === 'pt' ? 'Nome inválido.' : 'Invalid name.')
    if (nextName !== username && Object.prototype.hasOwnProperty.call(storedCredentials, nextName)) throw new Error(lang === 'pt' ? 'Nome já cadastrado neste navegador.' : 'Name already registered in this browser.')
    if (changingPassword) {
      const salt = crypto.randomUUID()
      storedCredentials[nextName] = { salt, hash: await localPasswordHash(credentials.next, salt), role: userRole === 'admin' ? 'admin' : 'user' }
    } else if (previousCredential) storedCredentials[nextName] = previousCredential
    if (nextName !== username) delete storedCredentials[username]
    const nextPreferences = userRole === 'admin' ? {
      ...preferences, telemetryInterval: values.telemetryInterval, cwmpPort: values.cwmpPort, maxAutomationThreads: values.maxAutomationThreads,
      defaultLogFilter: values.defaultLogFilter,
      requireFirmwareHash: values.requireFirmwareHash
    } : { ...preferences, targetRouterModel: values.targetRouterModel, terminalAutoScroll: values.terminalAutoScroll, soundAlerts: values.soundAlerts, visualAlerts: values.visualAlerts }
    const nextAcs = userRole === 'admin' ? values.trAcsUrl : trAcsUrl
    const nextIp = userRole === 'user' ? values.targetRouterIp : targetRouterIp
    // Confirm storage succeeds before reporting success or changing the displayed values.
    localStorage.setItem('codenet_credentials_v1', JSON.stringify(storedCredentials))
    if (userRole === 'admin') localStorage.setItem('codenet_security_v1', JSON.stringify({ requireFirmwareHash: values.requireFirmwareHash }))
    if (!userRole) throw new Error('Session ended')
    const nextGuard = { integrityToken: await createSessionIntegrity(userRole, nextName, sessionGuard.adminAuthVerified), adminAuthVerified: sessionGuard.adminAuthVerified }
    if (saveEpoch !== sessionEpoch.current) throw new Error('Session ended')
    localStorage.setItem('codenet_session_v1', JSON.stringify({ ...sessionSnapshot, ...nextGuard, username: nextName, lang: values.lang, targetRouterIp: nextIp, trAcsUrl: nextAcs, preferences: nextPreferences, aiEnabled: values.aiEnabled }))
    if (nextName !== username) {
      const profiles = safeJsonParse(localStorage.getItem('codenet_profiles_v1') || '{}', {})
      delete profiles[JSON.stringify([userRole, username])]
      localStorage.setItem('codenet_profiles_v1', JSON.stringify(profiles))
    }
    setSessionGuard(nextGuard)
    setUsername(nextName); setLang(values.lang); setTargetRouterIp(nextIp); setTrAcsUrl(nextAcs); setPreferences(nextPreferences); setAiEnabled(values.aiEnabled)
    if (changingPassword) setPassword(credentials.next)
    if (userRole === 'admin' && values.cwmpPort !== preferences.cwmpPort) {
      try { const url = new URL(trConnReqUrl); url.port = String(values.cwmpPort); setTrConnReqUrl(url.toString()) } catch { /* Keep user-entered URL if invalid. */ }
    }
    recordSystemUpdate('Settings', { username: nextName, targetRouterIp: nextIp, trAcsUrl: nextAcs, ...nextPreferences })
  }


  async function sendChatMessage(query: string) {
    const text = query.trim()
    if (!text || chatBusyRef.current || !logged || isAutomationActive) return
    if (!aiEnabled) { setGlobalFeedback(lang === 'pt' ? 'Zseven IA desabilitada nas configurações.' : 'Zseven AI is disabled in settings.'); return }

    writeAdminEvent(username, 'Consulta Zseven IA / Zseven AI query')
    const smartIntent = resolveSmartChatIntent(text, userRole, lang)
    const controller = new AbortController()
    chatRequestRef.current = controller
    chatBusyRef.current = true
    setAiPhase('thinking')
    setIsAiTyping(true)

    const timestamp = () => new Date().toLocaleTimeString(lang === 'pt' ? 'pt-BR' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    const id = `chat-${Date.now()}-${++chatSequenceRef.current}`
    setChatMessages(prev => [...prev, { id, sender: 'user', text, time: timestamp() }])

    // This render's history excludes the new message, sent separately as `message`.
    const history = chatMessages.map(item => ({
      role: item.sender === 'user' ? 'user' : 'model',
      parts: [{ text: item.text }]
    }))

    try {
      const data = await requestGeminiChat(text, history, {
          username, userRole, activeMenu, lang, targetRouterIp, autoProgress, isAutoRunning,
          availableScreens: (userRole === 'user' ? USER_ALLOWED_MENUS : [...ADMIN_ONLY_MENUS, 'diagnostics', 'settings'] as SidebarMenu[]).map(id => ({ id, name: menuNameMap[id] })),
          zteModels: batchModels.map(model => ({ model, ...batchModelFiles(model), firmwareRequired: Boolean(batchModelFiles(model).firmware) })),
          ssid24Name, ssid24Enabled, ssid24Crypto, ssid5Name, ssid5Enabled, ssid5Crypto,
          trAcsUrl, trPeriodicInform, trPeriodicInterval, latestLogs: overviewLogs.slice(0, 3),
          targetRouterModel: preferences.targetRouterModel, preferences, moduleSnapshots
        }, controller.signal)

      // Ignore responses belonging to a closed session or a canceled request.
      if (controller.signal.aborted || chatRequestRef.current !== controller) return

      const requestedScreen = data.actionArgs?.screen
      const blockedNavigation = userRole === 'user' && (
        requestsAdminScreen(text) || (!smartIntent && data.action === 'navigate_to_screen' && (
          typeof requestedScreen !== 'string' || ADMIN_ONLY_MENUS.includes(requestedScreen as SidebarMenu) || !USER_ALLOWED_MENUS.includes(requestedScreen as SidebarMenu)
        ))
      )
      const responseText = blockedNavigation
        ? (lang === 'pt' ? 'A tela solicitada (como Alertas Operacionais ou Visão Geral) é exclusiva para o perfil de Administrador. No seu perfil de Operador, posso abrir o Configurador de ONU, Rede Local, Teste Rápido Óptico, Catálogo de Firmwares ou Central de Relatórios!' : 'The requested screen is exclusive to the Administrator profile. With your Operator profile, I can open the ONU Configurator, Local Network, Quick Optical Test, Firmware Catalog, or Report Center!')
        : smartIntent ? (lang === 'pt' ? `Pronto! Abri a tela de ${menuNameMap[smartIntent]} para você.` : `Done! I opened ${menuNameMap[smartIntent]} for you.`) : data.text
      setAiPhase('responding')
      // Cancel the display delay on logout, history clear, AI disable or unmount.
      await new Promise<void>(resolve => {
        const finish = () => { clearTimeout(timer); controller.signal.removeEventListener('abort', finish); resolve() }
        const timer = setTimeout(finish, 450)
        controller.signal.addEventListener('abort', finish, { once: true })
        if (controller.signal.aborted) finish()
      })
      if (controller.signal.aborted || chatRequestRef.current !== controller) return

      setChatMessages(prev => [...prev, { id: `${id}-ai`, sender: 'ai', text: responseText, time: timestamp() }])

      if (blockedNavigation) return
      if (smartIntent) { handleMenuClick(smartIntent); return }
      if (data.action === 'navigate_to_screen') {
        const screen = data.actionArgs?.screen
        if (typeof screen === 'string' && Object.prototype.hasOwnProperty.call(menuNameMap, screen)) {
          handleMenuClick(screen as SidebarMenu)
          const diagnosticTab = data.actionArgs?.diagnostic_tab
          if (typeof diagnosticTab === 'string' && ['accounts', 'tr069', 'software', 'config'].includes(diagnosticTab)) setTab(diagnosticTab as DiagTab)
        }
      } else if (data.action === 'start_router_automation') {
        handleMenuClick('internet')
        startAutomation()
      } else if (data.action === 'update_wifi_config') {
        const args = data.actionArgs
        if (args?.band === '2.4' || args?.band === '5') {
          const name = args.ssid ?? args.ssidName ?? args.name
          const cryptoMode = args.crypto ?? args.encryption
          if ((name !== undefined && (typeof name !== 'string' || !name.trim() || new TextEncoder().encode(name).length > 32)) ||
              (cryptoMode !== undefined && !['WPA2-PSK-AES', 'WPA3-SAE', 'WPA/WPA2-PSK-Mixed'].includes(String(cryptoMode)))) throw new Error('Invalid Wi-Fi parameters')
          if (typeof name === 'string') (args.band === '2.4' ? setSsid24Name : setSsid5Name)(name)
          if (typeof cryptoMode === 'string') (args.band === '2.4' ? setSsid24Crypto : setSsid5Crypto)(cryptoMode)
          handleMenuClick('local')
          setLocalNetworkMessage(t.localNetworkSuccess)
          recordSystemUpdate('Wi-Fi', { band: args.band, ssid: name, crypto: cryptoMode })
        }
      }
    } catch {
      if (controller.signal.aborted || chatRequestRef.current !== controller) return
      if (smartIntent && !(userRole === 'user' && requestsAdminScreen(text))) {
        handleMenuClick(smartIntent)
        setChatMessages(prev => [...prev, { id: `${id}-ai`, sender: 'ai', text: lang === 'pt' ? `Pronto! Abri a tela de ${menuNameMap[smartIntent]} para você.` : `Done! I opened ${menuNameMap[smartIntent]} for you.`, time: timestamp() }])
        return
      }
      setChatMessages(prev => [...prev, {
        id: `${id}-error`,
        sender: 'ai',
        text: lang === 'pt' ? 'Desculpe, ocorreu um erro de conexão com os servidores da Zseven IA.' : 'Sorry, a connection error occurred with the Zseven AI servers.',
        time: timestamp()
      }])
    } finally {
      if (chatRequestRef.current === controller) {
        chatRequestRef.current = null
        chatBusyRef.current = false
        setIsAiTyping(false)
      }
    }
  }


  const isImplementedScreen = 
    activeMenu === 'settings' ||
    (userRole === 'admin' && ['equipments', 'security', 'auditing', 'reports'].includes(activeMenu)) ||
    (userRole === 'user' && userOperationalMenus.some(menu => menu.id === activeMenu)) ||
    (activeMenu === 'internet' && userRole === 'user') ||
    (activeMenu === 'local' && userRole === 'user') ||
    (activeMenu === 'diagnostics' && userRole === 'user') ||
    (activeMenu === 'overview' && userRole === 'admin') ||
    (activeMenu === 'diagnostics' && userRole === 'admin') ||
    (activeMenu === 'automations' && userRole === 'admin') ||
    (activeMenu === 'monitoring' && userRole === 'admin') ||
    (activeMenu === 'alerts' && userRole === 'admin') ||
    (activeMenu === 'users' && userRole === 'admin');

  if (!sessionReady) return <main className="min-h-screen bg-[#05060f] text-violet-300 flex items-center justify-center" aria-busy="true"><RefreshCw className="animate-spin" size={24} /></main>

  if (!logged) {
    return (
      <main className="min-h-screen bg-[#05060f] text-foreground flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden">

        <NetworkBackground />
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.12),transparent_70%)] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05060f] via-transparent to-[#05060f]/80 pointer-events-none z-0" />

        <section className="relative w-full max-w-xl mx-auto my-auto z-10">
          <div className="rounded-[2.2rem] border border-violet-950/40 bg-[#0a0a1d]/90 p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">

            {showHelpModal && (
              <div className="absolute inset-0 bg-[#0a0a1d]/95 backdrop-blur-md z-30 p-8 sm:p-10 flex flex-col justify-center items-center text-center animate-in fade-in zoom-in duration-200 overflow-y-auto">
                <button 
                  type="button" 
                  onClick={() => setShowHelpModal(false)} 
                  className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-white hover:bg-violet-500/20 transition-colors"
                  title={t.closeChat}
                >
                  <X size={24} />
                </button>

                <div className="flex flex-col items-center w-full my-auto">
                  <div className="size-14 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-4 shadow-lg shadow-violet-500/10 shrink-0">
                    <HelpCircle size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{t.loginWelcome}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 text-left">
                    {t.loginSubWelcome}
                  </p>
                  <div className="w-full text-left bg-violet-950/30 border border-violet-900/40 rounded-2xl p-4 mb-5">
                    <p className="text-sm font-semibold text-violet-400 mb-2">{t.loginFeaturesTitle}</p>
                    <ul className="text-xs text-muted-foreground space-y-1.5">
                      <li className="flex items-start gap-2"><span className="text-violet-400 font-bold">•</span><span>{t.feat1}</span></li>
                      <li className="flex items-start gap-2"><span className="text-violet-400 font-bold">•</span><span>{t.feat2}</span></li>
                      <li className="flex items-start gap-2"><span className="text-violet-400 font-bold">•</span><span>{t.feat3}</span></li>
                      <li className="flex items-start gap-2"><span className="text-violet-400 font-bold">•</span><span>{t.feat4}</span></li>
                      <li className="flex items-start gap-2"><span className="text-violet-400 font-bold">•</span><span>{t.feat5}</span></li>
                    </ul>
                  </div>
                  <p className="text-xs text-violet-300 font-medium text-center mb-1">
                    {t.courseTag}
                  </p>
                  <p className="text-xs text-muted-foreground/80 italic text-center">
                    {t.developedBy} <strong className="text-violet-400 not-italic">Zseven Systems</strong> {t.inPartnership} <strong className="text-violet-400 not-italic">LybertyNet</strong>
                  </p>
                </div>
              </div>
            )}

            <div className="mb-7">
              <div className="absolute top-6 right-6 z-20">
                <button 
                  type="button" 
                  onClick={() => setShowHelpModal(true)} 
                  className="size-10 rounded-full border border-violet-500/40 bg-violet-950/40 text-violet-400 hover:bg-violet-600 hover:text-white flex items-center justify-center transition-all shadow-md shrink-0 active:scale-95"
                  title={t.info}
                >
                  <HelpCircle size={20} />
                </button>
              </div>

              <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  {account && <span className="block text-xl sm:text-2xl">{t.createAccountTitle}</span>}
                  <button type="button" title="Atualizar página" aria-label={lang === 'pt' ? 'Atualizar página' : 'Reload page'} onClick={() => window.location.reload()} className="block mx-auto cursor-pointer rounded-lg focus-visible:outline focus-visible:outline-violet-400"><img src="/codenet-v2/codenet-logo.png" alt="Code Net" className="h-20 sm:h-24 w-auto object-contain mix-blend-screen mx-auto cursor-pointer" /></button>
                </h1>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {t.loginSubtitle}
                </p>
              </div>
            </div>

            {(message || globalFeedback) && <p role="alert" className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">{message || globalFeedback}</p>}
            <form onSubmit={enter} className="flex flex-col gap-5">
              <label className="flex flex-col gap-2 text-sm font-semibold text-muted-foreground">
                {t.userFieldLabel}
                <div className="group relative flex items-center">
                  <User size={20} className="absolute left-4 text-violet-500/70 group-hover:text-violet-400 group-focus-within:text-violet-400 transition-colors pointer-events-none" />
                  <input 
                    required
                    onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity(t.fillField)}
                    onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                    className="h-12 w-full rounded-2xl border border-violet-900/50 bg-background/40 pl-12 pr-4 text-base text-foreground outline-none transition-all duration-200 hover:border-violet-400 hover:shadow-[0_0_15px_rgba(139,92,246,0.25)] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    placeholder={t.userFieldPlaceholder} 
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-muted-foreground">
                {t.passFieldLabel}
                <div className="group relative flex items-center">
                  <Key size={20} className="absolute left-4 text-violet-500/70 group-hover:text-violet-400 group-focus-within:text-violet-400 transition-colors pointer-events-none" />
                  <input 
                    required
                    onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity(t.fillField)}
                    onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                    className="h-12 w-full rounded-2xl border border-violet-900/50 bg-background/40 pl-12 pr-12 text-base text-foreground outline-none transition-all duration-200 hover:border-violet-400 hover:shadow-[0_0_15px_rgba(139,92,246,0.25)] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30" 
                    value={password} 
                    maxLength={8}
                    onChange={e => setPassword(e.target.value)} 
                    placeholder={t.passFieldPlaceholder} 
                    type={showLoginPassword ? "text" : "password"} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowLoginPassword(!showLoginPassword)} 
                    className="absolute right-4 text-violet-500/70 hover:text-violet-400 transition-colors"
                    title={t.togglePass}
                  >
                    {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </label>

              {account && (
                <label className="flex flex-col gap-2 text-sm font-semibold text-muted-foreground">
                  {t.confirmPassLabel}
                  <div className="group relative flex items-center">
                    <Key size={20} className="absolute left-4 text-violet-500/70 group-hover:text-violet-400 group-focus-within:text-violet-400 transition-colors pointer-events-none" />
                    <input 
                      required
                      onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity(t.fillField)}
                      onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                      className="h-12 w-full rounded-2xl border border-violet-900/50 bg-background/40 pl-12 pr-12 text-base text-foreground outline-none transition-all duration-200 hover:border-violet-400 hover:shadow-[0_0_15px_rgba(139,92,246,0.25)] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30" 
                      value={confirmPassword} 
                      maxLength={8}
                      onChange={e => setConfirmPassword(e.target.value)} 
                      placeholder={t.confirmPassPlaceholder} 
                      type={showConfirmPassword ? "text" : "password"} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      className="absolute right-4 text-violet-500/70 hover:text-violet-400 transition-colors"
                      title={t.togglePass}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </label>
              )}

              <button 
                className="mt-2 h-12 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-violet-900/50 transition-all active:scale-[0.98]" 
                type="submit"
              >
                {isMounted && (account ? <UserPlus size={20} /> : <LogIn size={20} />)} 
                <span>{account ? t.finishRegisterBtn : t.enterSystemBtn}</span>
              </button>
            </form>

            <button 
              type="button" 
              onClick={() => { setAccount(!account); setPassword(''); setConfirmPassword('') }} 
              className="mt-4 w-full rounded-2xl border border-violet-900/40 h-11 text-xs sm:text-sm font-medium text-muted-foreground hover:text-white hover:bg-violet-500/15 hover:text-violet-300 hover:border-violet-500/40 transition-all duration-200 flex items-center justify-center gap-2 transition-colors"
            >
              {isMounted && (account ? <X size={16} /> : <UserPlus size={16} />)} 
              <span>{account ? t.backToLogin : t.createAccountBtn}</span>
            </button>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <LockKeyhole size={15} className="text-violet-500" /> {t.dataProtected}
            </div>

            <div className="mt-6 flex items-center justify-center gap-8 border-t border-violet-900/30 pt-5 px-2">
              <div className="flex-1 flex justify-center items-center h-32 overflow-hidden group cursor-pointer">
                <img 
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/63301-removebg-preview-evtf2xONDjnCPkhRJfhOwDInQ0bzH6.png" 
                  alt="Logo Zseven Systems" 
                  className="w-full h-full object-contain mix-blend-screen transform scale-[2.1] transition-all duration-300 ease-out group-hover:scale-[2.25] group-hover:-translate-y-1.5 group-hover:brightness-125 group-hover:animate-pulse pointer-events-auto select-none"
                />
              </div>

              <span className="text-5xl font-extralight text-violet-500/30 select-none pb-1">|</span>

              <div className="flex-1 flex justify-center items-center h-24 overflow-hidden rounded-xl group cursor-pointer">
                <img 
                  src="/codenet-v2/LybertyNet.jpeg"
                  alt="Logo LybertyNet" 
                  className="w-full h-full object-cover rounded-xl transition-all duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-1.5 group-hover:brightness-110 group-hover:animate-pulse pointer-events-auto select-none shadow-sm"
                />
              </div>
            </div>

          </div>
        </section>

        <div className="w-full max-w-xl mx-auto flex justify-center mt-4 z-10">
          <LanguageSelector lang={lang} setLang={setLang} t={t} dropDirection="up" />
        </div>

      </main>
    )
  }

  const select = (e: React.ChangeEvent<HTMLInputElement>, kind: 'firmware' | 'config') => { 
    const f = e.target.files?.[0] ?? null
    kind === 'firmware' ? setFirmware(f) : setConfig(f)
    setStage('idle')
    setMessage('') 
  }

  return (
    <div className="codenet-ui h-dvh overflow-hidden bg-background text-foreground flex flex-col md:flex-row relative">
      <AppearanceStyle themeMode={themeMode} accentColor={accentColor} />
      {logged && aiEnabled && !isChatOpen && (
        <DraggableAiFab label={t.aiMode} onOpen={() => { setSidebarOpen(false); setIsChatOpen(true) }} />
      )}
      {sidebarOpen && (
        <button
          type="button"
          aria-label={t.closeSidebar}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {isChatOpen && (
        <button
          type="button"
          aria-label={t.closeChat}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] 2xl:hidden"
          onClick={() => setIsChatOpen(false)}
        />
      )}
      <aside 
        className={`${
          sidebarOpen ? 'translate-x-0 w-[280px] md:w-[260px]' : '-translate-x-full w-0 md:w-0 overflow-hidden border-none p-0'
        } [&_button]:h-12 [&_button]:py-0 [&_button]:flex [&_button]:items-center [&_button]:shrink-0 border-r border-border bg-card/60 backdrop-blur-xl flex flex-col shrink-0 fixed inset-y-0 left-0 z-40 transition-transform duration-300 md:relative md:translate-x-0 h-full`}
      >
        <div className="h-[80px] shrink-0 py-0 flex items-center border-b border-border px-5">
          <div className="w-full grid grid-cols-[36px_minmax(0,1fr)_36px] items-center gap-2">
            <div className="size-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-900/40 shrink-0">
              <Router size={20} />
            </div>
            <div className="min-w-0 flex justify-center">
              <button type="button" title="Atualizar página" aria-label={lang === 'pt' ? 'Atualizar página' : 'Reload page'} onClick={() => window.location.reload()} className="block mx-auto cursor-pointer rounded-lg focus-visible:outline focus-visible:outline-violet-400"><img src="/codenet-v2/codenet-logo.png" alt="Code Net" className="h-10 w-auto max-w-full scale-125 object-contain mix-blend-screen mx-auto cursor-pointer" /></button>
            </div>
          <button 
            type="button" 
            onClick={() => setSidebarOpen(false)} 
            title={t.closeSidebar}
            className="text-muted-foreground hover:text-foreground hover:bg-violet-500/15 hover:text-violet-300 hover:border-violet-500/40 transition-all duration-200 p-1.5 rounded-lg transition-colors"
          >
            <PanelLeftClose size={18} />
          </button>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1 overflow-y-auto custom-scrollbar">
          
          {/* BOTÕES DO USUÁRIO */}
          {userRole === 'user' && (
            <div className="flex flex-col gap-5 pb-4">
              <nav className="flex flex-col gap-1.5">
                <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2 mt-2">{t.menu}</p>
                <button 
                  type="button" 
                  onClick={() => handleMenuClick('internet')} 
                  className={`w-full flex items-center gap-3 px-3.5 h-12 py-0 shrink-0 rounded-xl text-sm font-medium transition-all duration-200 ${activeMenu === 'internet' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400'}`}
                >
                  <span className="w-10 h-10 flex items-center justify-center shrink-0 text-white"><Z7RobotIcon className="w-10 h-10 shrink-0 text-white"  /></span>
                  <span>{t.assistantPanel}</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => handleMenuClick('local')} 
                  className={`w-full flex items-center gap-3 px-3.5 h-12 py-0 shrink-0 rounded-xl text-sm font-medium transition-all duration-200 ${activeMenu === 'local' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400'}`}
                >
                  <span className="w-10 h-10 flex items-center justify-center shrink-0 text-white"><Network size={22} className="shrink-0 text-white"  /></span>
                  <span>{t.localNetwork}</span>
                </button>
                
                <button 
                  type="button" 
                  onClick={() => handleMenuClick('diagnostics')} 
                  className={`w-full flex items-center gap-3 px-3.5 h-12 py-0 shrink-0 rounded-xl text-sm font-medium transition-all duration-200 ${activeMenu === 'diagnostics' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400'}`}
                >
                  <span className="w-10 h-10 flex items-center justify-center shrink-0 text-white"><Activity size={20} className="shrink-0 text-white"  /></span>
                  <span>{t.diagAndMgmt}</span>
                </button>
                
                {userOperationalMenus.map(menu => { const Icon = menu.icon; return <button key={menu.id} type="button" onClick={() => handleMenuClick(menu.id)} className={`w-full flex items-center gap-3 px-3.5 h-12 py-0 shrink-0 rounded-xl text-sm font-medium transition-all duration-200 ${activeMenu === menu.id ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400'}`}><span className="w-10 h-10 flex items-center justify-center shrink-0 text-white"><Icon size={21} /></span><span className="text-left leading-tight">{lang === 'pt' ? menu.pt : menu.en}</span></button> })}
                {aiEnabled && <ModoIABtn className="mt-4" onClick={() => { handleMenuClick(activeMenu); setIsChatOpen(true) }} label={t.aiMode} />}
                <PremiumBtn label={t.premiumPlan} onClick={() => handleMenuClick('premium')} />
              </nav>
            </div>
          )}

          {/* BOTÕES DO ADMINISTRADOR */}
          {userRole === 'admin' && (
            <div className="flex flex-col gap-5 pb-4">
              <nav className="flex flex-col gap-1.5">
                <button 
                  type="button" 
                  onClick={() => handleMenuClick('overview')} 
                  className={`w-full flex items-center justify-start text-left gap-3 px-3.5 h-12 py-0 shrink-0 rounded-xl text-sm font-medium transition-all duration-200 ${activeMenu === 'overview' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400'}`}
                >
                  <span className="w-10 h-10 flex items-center justify-center shrink-0 text-white"><Home size={20} className="shrink-0 text-white"  /></span>
                  <span className="text-left leading-tight truncate">{t.overview}</span>
                </button>
              </nav>

              <nav className="flex flex-col gap-1.5">
                <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1">{t.operation}</p>
                
                <button 
                  type="button" 
                  onClick={() => handleMenuClick('diagnostics')} 
                  className={`w-full flex items-center justify-start text-left gap-3 px-3.5 h-12 py-0 shrink-0 rounded-xl text-sm font-medium transition-all duration-200 ${activeMenu === 'diagnostics' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400'}`}
                >
                  <span className="w-10 h-10 flex items-center justify-center shrink-0 text-white"><Activity size={20} className="shrink-0 text-white"  /></span>
                  <span className="text-left leading-tight truncate">{t.diagAndMgmt}</span>
                </button>

                <button 
                  type="button" 
                  onClick={() => handleMenuClick('automations')} 
                  className={`w-full flex items-center justify-start text-left gap-3 px-3.5 h-12 py-0 shrink-0 rounded-xl text-sm font-medium transition-all duration-200 ${activeMenu === 'automations' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400'}`}
                >
                  <span className="w-10 h-10 flex items-center justify-center shrink-0 text-white"><Router size={20} className="shrink-0" /></span>
                  <span className="text-left leading-tight truncate">{t.automations}</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => handleMenuClick('equipments')} 
                  className={`w-full flex items-center justify-start text-left gap-3 px-3.5 h-12 py-0 shrink-0 rounded-xl text-sm font-medium transition-all duration-200 ${activeMenu === 'equipments' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400'}`}
                >
                  <span className="w-10 h-10 flex items-center justify-center shrink-0 text-white"><Server size={20} className="shrink-0 text-white"  /></span>
                  <span className="text-left leading-tight truncate">{t.equipments}</span>
                </button>
              </nav>

              <nav className="flex flex-col gap-1.5">
                <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1">{t.management}</p>
                <button 
                  type="button" 
                  onClick={() => handleMenuClick('users')} 
                  className={`w-full flex items-center justify-start text-left gap-3 px-3.5 h-12 py-0 shrink-0 rounded-xl text-sm font-medium transition-all duration-200 ${activeMenu === 'users' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400'}`}
                >
                  <span className="w-10 h-10 flex items-center justify-center shrink-0 text-white"><User size={20} className="shrink-0 text-white"  /></span>
                  <span className="text-left leading-tight truncate">{t.usersAndPerms}</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => handleMenuClick('security')} 
                  className={`w-full flex items-center justify-start text-left gap-3 px-3.5 h-12 py-0 shrink-0 rounded-xl text-sm font-medium transition-all duration-200 ${activeMenu === 'security' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400'}`}
                >
                  <span className="w-10 h-10 flex items-center justify-center shrink-0 text-white"><LockKeyhole size={20} className="shrink-0 text-white"  /></span>
                  <span className="text-left leading-tight truncate">{t.security}</span>
                </button>
              </nav>

              <nav className="flex flex-col gap-1.5">
                <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1">{t.supervision}</p>
                <button 
                  type="button" 
                  onClick={() => handleMenuClick('monitoring')} 
                  className={`w-full flex items-center justify-start text-left gap-3 px-3.5 h-12 py-0 shrink-0 rounded-xl text-sm font-medium transition-all duration-200 ${activeMenu === 'monitoring' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400'}`}
                >
                  <span className="w-10 h-10 flex items-center justify-center shrink-0 text-white"><TrendingUp size={20} className="shrink-0 text-white"  /></span>
                  <span className="text-left leading-tight truncate">{t.monitoring}</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => handleMenuClick('auditing')} 
                  className={`w-full flex items-center justify-start text-left gap-3 px-3.5 h-12 py-0 shrink-0 rounded-xl text-sm font-medium transition-all duration-200 ${activeMenu === 'auditing' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400'}`}
                >
                  <span className="w-10 h-10 flex items-center justify-center shrink-0 text-white"><FileText size={20} className="shrink-0 text-white"  /></span>
                  <span className="text-left leading-tight truncate">{t.auditAndLogs}</span>
                </button>
                
                <button 
                  type="button" 
                  onClick={() => handleMenuClick('alerts')} 
                  className={`relative w-full flex items-center justify-start text-left gap-3 px-3.5 h-12 py-0 shrink-0 rounded-xl text-sm font-medium transition-all duration-200 ${activeMenu === 'alerts' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400'}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-10 h-10 flex items-center justify-center shrink-0 text-white"><Bell size={20} className="shrink-0 text-white"  /></span>
                    <span className="text-left leading-tight truncate">{t.alerts}</span>
                  </div>
                  <span className="ml-auto shrink-0 size-5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse">
                    3
                  </span>
                </button>

                <button 
                  type="button" 
                  onClick={() => handleMenuClick('reports')} 
                  className={`w-full flex items-center justify-start text-left gap-3 px-3.5 h-12 py-0 shrink-0 rounded-xl text-sm font-medium transition-all duration-200 ${activeMenu === 'reports' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400'}`}
                >
                  <span className="w-10 h-10 flex items-center justify-center shrink-0 text-white"><BarChart2 size={20} className="shrink-0 text-white"  /></span>
                  <span className="text-left leading-tight truncate">{t.reports}</span>
                </button>
              </nav>

              <nav className="flex flex-col gap-1.5">
                <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1">{t.system}</p>
                <button 
                  type="button" 
                  onClick={() => handleMenuClick('settings')} 
                  className={`w-full flex items-center justify-start text-left gap-3 px-3.5 h-12 py-0 shrink-0 rounded-xl text-sm font-medium transition-all duration-200 ${activeMenu === 'settings' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400'}`}
                >
                  <span className="w-10 h-10 flex items-center justify-center shrink-0 text-white"><Settings size={20} className="shrink-0 text-white"  /></span>
                  <span className="text-left leading-tight truncate">{t.settings}</span>
                </button>

                {aiEnabled && <ModoIABtn onClick={() => { handleMenuClick(activeMenu); setIsChatOpen(true) }} label={t.aiMode} />}
              </nav>
            </div>
          )}

        </div>
        <div className="p-4 border-t border-border/60 shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-2 py-1">
            <ShieldCheck size={14} className="text-violet-500" /> Zseven v1.0.0
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-background/50 h-full min-h-0 relative">
        <header className="h-[80px] shrink-0 py-0 flex items-center border-b border-border bg-card/40 backdrop-blur px-4 sm:px-6 justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {!sidebarOpen && (
              <button 
                type="button" 
                onClick={() => setSidebarOpen(true)} 
                title={t.openSidebar}
                className="flex items-center gap-2 rounded-xl border border-violet-900/50 bg-violet-900/20 p-2 text-violet-400 hover:bg-violet-600 hover:text-white transition-all shadow-sm"
              >
                <PanelLeftOpen size={18} />
                <span className="text-xs font-semibold hidden sm:inline">{t.menu}</span>
              </button>
            )}
            <div className="min-w-0">
              <p className="truncate font-mono text-[9px] sm:text-[11px] uppercase tracking-wide sm:tracking-[.2em] text-violet-500 font-semibold">{t.networkCode}</p>
              <h1 className="truncate text-sm sm:text-lg font-bold text-foreground">{t.automationHub}</h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            {userRole === 'admin' && (<button
              type="button"
              onClick={() => userRole === 'admin' && setActiveMenu('alerts')}
              className="relative p-2 rounded-xl border border-border bg-card/50 text-muted-foreground hover:text-foreground hover:bg-violet-500/15 hover:text-violet-300 hover:border-violet-500/40 transition-all duration-200 transition-colors"
              title={t.alerts}
            >
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 size-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-md animate-pulse">
                3
              </span>
            </button>)}

            <span className="hidden lg:block text-sm text-muted-foreground">{t.hello}, <strong className="text-foreground">{userRole === 'admin' ? `${username || t.adminFallback} | Admin` : username || t.userFallback}</strong></span>
            <button type="button" onClick={() => handleMenuClick('settings')} title={t.settings} aria-label={t.settings} className="flex shrink-0 items-center gap-2 rounded-lg border border-border px-2 sm:px-3 py-2 sm:py-1.5 text-xs font-medium hover:bg-violet-500/15 hover:text-violet-300 hover:border-violet-500/40 transition-all duration-200 transition-colors"><Settings size={15}/><span className="hidden sm:inline">{t.settings}</span></button>
            <button type="button" onClick={logout} className="shrink-0 whitespace-nowrap rounded-lg border border-border px-2 sm:px-3 py-2 sm:py-1.5 text-xs font-medium hover:bg-violet-500/15 hover:text-violet-300 hover:border-violet-500/40 transition-all duration-200 transition-colors">{t.logout}</button>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto flex flex-col relative custom-scrollbar">
          
          <div className="flex-1 flex flex-col 2xl:flex-row w-full p-4 sm:p-6 md:p-8 gap-4 sm:gap-6">
            
            <div className="flex-1 w-full min-w-0 flex flex-col relative">
              
              {globalFeedback && <p role="status" className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-violet-500/10 p-3 text-xs text-violet-300">{globalFeedback}<button type="button" onClick={() => setGlobalFeedback('')} aria-label={lang === 'pt' ? 'Fechar aviso' : 'Dismiss notice'}><X size={16} /></button></p>}
              {userRole === 'admin' && [...ADMIN_ONLY_MENUS, 'diagnostics'].includes(activeMenu) && <MobileAdminScreens key={activeMenu} menu={activeMenu} lang={lang} data={adminData} />}
              {userRole === 'user' && ['local', 'diagnostics', 'firmware_catalog', 'optical_test', 'report_center', 'bench_guide', 'bench_defaults', 'manual_config'].includes(activeMenu) && <MobileUserScreens key={activeMenu} menu={activeMenu} lang={lang} queue={batchQueue} ssid24={ssid24Name} ssid5={ssid5Name} pass24={ssid24Pass} pass5={ssid5Pass} setSsid24={setSsid24Name} setSsid5={setSsid5Name} setPass24={setSsid24Pass} setPass5={setSsid5Pass} adminUser={adminUser} adminPassword={adminCurrentPass} acs={trAcsUrl} locked={isAutomationActive} />}
              <div className={(userRole === 'admin' && [...ADMIN_ONLY_MENUS, 'diagnostics'].includes(activeMenu)) || (userRole === 'user' && ['local', 'diagnostics', 'firmware_catalog', 'optical_test', 'report_center', 'bench_guide', 'bench_defaults', 'manual_config'].includes(activeMenu)) ? 'hidden md:block' : 'contents'}>
              {userRole === 'user' && activeMenu === 'firmware_catalog' && <FirmwareCatalogModule lang={lang} running={batchQueue.running} onSelect={model => { if (batchQueue.running) return; batchQueue.chooseModel(model); setPreferences(prev => ({ ...prev, targetRouterModel: model })); handleMenuClick('internet') }} />}
              {userRole === 'user' && activeMenu === 'optical_test' && <QuickOpticalTestModule lang={lang} targetRouterIp={targetRouterIp} onManual={() => handleMenuClick('manual_config')} />}
              {userRole === 'user' && activeMenu === 'report_center' && <AssistantPanelModule reportsOnly lang={lang} greetingMessage={greetingMessage} queue={batchQueue} terminalAutoScroll={preferences.terminalAutoScroll} startAutomation={startAutomation} onModelChange={model => setPreferences(prev => ({ ...prev, targetRouterModel: model }))} onOpenConfigurator={() => handleMenuClick('internet')} />}
              {userRole === 'user' && activeMenu === 'bench_guide' && <BenchGuideModule lang={lang} />}
              {userRole === 'user' && activeMenu === 'bench_defaults' && <BenchDefaultsModule lang={lang} ssid24={ssid24Name} ssid5={ssid5Name} targetIp={targetRouterIp} running={batchQueue.running} onLocal={() => handleMenuClick('local')} onNewQueue={() => { if (batchQueue.running) return; handleMenuClick('internet'); startAutomation() }} />}
              {userRole === 'user' && activeMenu === 'manual_config' && <ManualConfigModule lang={lang} targetRouterIp={targetRouterIp} ssid24Name={ssid24Name} ssid5Name={ssid5Name} />}
              {userRole === 'admin' && activeMenu === 'equipments' && <AdminEquipmentsModule data={adminData} lang={lang} />}
              {userRole === 'admin' && activeMenu === 'security' && <AdminSecurityModule lang={lang} user={username} required={preferences.requireFirmwareHash} onRequired={value => { setPreferences(prev => ({ ...prev, requireFirmwareHash: value })); try { localStorage.setItem('codenet_security_v1', JSON.stringify({ requireFirmwareHash: value })) } catch { /* In-memory policy still applies. */ } writeAdminEvent(username, 'Política SHA-256 / SHA-256 policy: ' + value) }} />}
              {userRole === 'admin' && activeMenu === 'auditing' && <AdminAuditingModule data={adminData} lang={lang} />}
              {userRole === 'admin' && activeMenu === 'reports' && <AdminReportsModule data={adminData} lang={lang} />}
              {activeMenu === 'settings' && <SettingsModule themeMode={themeMode} accentColor={accentColor} onAppearance={changeAppearance} role={userRole} lang={lang} setLang={setLang} aiEnabled={aiEnabled} setAiEnabled={setAiEnabled} onClose={() => handleMenuClick(userRole === 'admin' ? 'overview' : 'internet')} values={{ username, lang, targetRouterIp, trAcsUrl, ...preferences, aiEnabled }} onSave={saveSettings} onLogout={logout} onClearChat={clearChatHistory} />}
              {/* TELA DE ESPERA PARA MENUS NÃO IMPLEMENTADOS */}
              {!isImplementedScreen && (
                <div className="flex-1 flex flex-col items-center justify-center py-32 text-muted-foreground animate-in fade-in zoom-in duration-300">
                  <Settings size={48} className="mb-4 opacity-20" />
                  <h2 className="text-xl font-semibold text-foreground">{t.inDevelopment}</h2>
                  <p className="text-sm mt-2 text-center max-w-md">
                    {t.inDevDesc(menuNameMap[activeMenu])}
                  </p>
                </div>
              )}

              {/* --- TELA DO ADMINISTRADOR: VISÃO GERAL (DASHBOARD COMPLETO) --- */}
              {activeMenu === 'overview' && userRole === 'admin' && (
                <div className="flex-1 w-full flex flex-col gap-6 animate-in fade-in duration-500 pb-16">
                  <div className="mb-2 flex flex-col gap-1 max-w-6xl mx-auto w-full">
                    <p className="font-mono text-xs uppercase tracking-[.2em] text-violet-500 font-semibold">{t.diagSubheader}</p>
                    <h2 className="text-3xl font-bold tracking-tight">{t.overview}</h2>
                  </div>
                  <OverviewModule 
                    t={t} 
                    logs={overviewLogs} 
                    setLogs={setOverviewLogs}
                    scriptLines={scriptLines}
                    setScriptLines={setScriptLines}
                    targetRouterIp={targetRouterIp}
                    targetRouterModel={preferences.targetRouterModel}
                    defaultLogFilter={preferences.defaultLogFilter}
                    trPeriodicInform={trPeriodicInform}
                    trAcsUrl={trAcsUrl}
                    onRefresh={data => recordSystemUpdate('Overview', data)}
                  />
                </div>
              )}

              {/* --- TELA DO ADMINISTRADOR: ALERTAS --- */}
              {activeMenu === 'alerts' && userRole === 'admin' && (
                <div className="flex-1 w-full flex flex-col gap-6 animate-in fade-in duration-500 pb-16">
                  <div className="mb-2 flex flex-col gap-1 max-w-5xl mx-auto w-full">
                    <p className="font-mono text-xs uppercase tracking-[.2em] text-violet-500 font-semibold">{t.supervision}</p>
                    <h2 className="text-3xl font-bold tracking-tight">{t.alerts}</h2>
                  </div>
                  <OperationalAlertsModule t={t} initialSnapshot={(moduleSnapshots.OperationalAlertsModule as { data?: unknown } | undefined)?.data} onRefresh={data => recordSystemUpdate('OperationalAlertsModule', data)} />
                </div>
              )}

              {/* --- TELA DO ADMINISTRADOR: USUÁRIOS E PERMISSÕES --- */}
              {activeMenu === 'users' && userRole === 'admin' && (
                <div className="flex-1 w-full flex flex-col gap-6 animate-in fade-in duration-500 pb-16">
                  <div className="mb-2 flex flex-col gap-1 max-w-5xl mx-auto w-full">
                    <p className="font-mono text-xs uppercase tracking-[.2em] text-violet-500 font-semibold">{t.management}</p>
                    <h2 className="text-3xl font-bold tracking-tight">{t.usersAndPerms}</h2>
                  </div>
                  <AdminUsersLive data={adminData} lang={lang} />
                  <UsersAndPermsModule t={t} />
                </div>
              )}

              {/* --- TELA DO ADMINISTRADOR: GERÊNCIA E DIAGNÓSTICO (STATUS GERAL PIE CHART) --- */}
              {activeMenu === 'diagnostics' && userRole === 'admin' && (
                <div className="flex-1 w-full flex flex-col gap-6 animate-in fade-in duration-500 pb-16">
                  <div className="mb-2 flex flex-col gap-1 max-w-5xl mx-auto w-full">
                    <p className="font-mono text-xs uppercase tracking-[.2em] text-violet-500 font-semibold">{t.diagSubheader}</p>
                    <h2 className="text-3xl font-bold tracking-tight">{t.diagAndMgmt}</h2>
                  </div>
                  <GeneralStatusPieChart t={t} initialSnapshot={(moduleSnapshots.GeneralStatusPieChart as { data?: unknown } | undefined)?.data} onRefresh={data => recordSystemUpdate('GeneralStatusPieChart', data)} />
                </div>
              )}

              {/* --- TELA DO ADMINISTRADOR: AUTOMAÇÕES --- */}
              {activeMenu === 'automations' && userRole === 'admin' && (
                <div className="flex-1 w-full flex flex-col gap-6 animate-in fade-in duration-500 pb-16">
                  <div className="mb-2 flex flex-col gap-1 max-w-5xl mx-auto w-full">
                    <p className="font-mono text-xs uppercase tracking-[.2em] text-violet-500 font-semibold">{t.diagSubheader}</p>
                    <h2 className="text-3xl font-bold tracking-tight">{t.automations}</h2>
                  </div>
                  <SystemSummaryChart t={t} initialSnapshot={(moduleSnapshots.SystemSummaryChart as { data?: unknown } | undefined)?.data} onRefresh={data => recordSystemUpdate('SystemSummaryChart', data)} />
                  <AdminPipeline data={adminData} lang={lang} />
                </div>
              )}

              {/* --- TELA DO ADMINISTRADOR: MONITORAMENTO --- */}
              {activeMenu === 'monitoring' && userRole === 'admin' && (
                <div className="flex-1 w-full flex flex-col gap-6 animate-in fade-in duration-500 pb-16">
                  <div className="mb-2 flex flex-col gap-1 max-w-5xl mx-auto w-full">
                    <p className="font-mono text-xs uppercase tracking-[.2em] text-violet-500 font-semibold">{t.supervision}</p>
                    <h2 className="text-3xl font-bold tracking-tight">{t.monitoring}</h2>
                  </div>
                  <AdminTelemetry tick={adminData.tick} lang={lang} />
                  <MonitoringModule t={t} initialSnapshot={(moduleSnapshots.MonitoringModule as { data?: unknown } | undefined)?.data} onRefresh={data => recordSystemUpdate('MonitoringModule', data)} />
                </div>
              )}

              {/* --- TELA DO USUÁRIO: REDE LOCAL (LAN) --- */}
              {activeMenu === 'local' && userRole === 'user' && (
                <div className="flex-1 w-full flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-16">
                  <div className="rounded-2xl border border-violet-900/30 bg-[#0c0d24]/90 p-4 sm:p-5 flex items-center gap-4 shadow-lg backdrop-blur-md">
                    <div className="size-10 rounded-xl bg-violet-950/60 border border-violet-800/40 flex items-center justify-center text-violet-400 shrink-0">
                      <Wifi size={20} />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">{t.localNetworkTitle}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.localNetworkDesc}</p>
                    </div>
                  </div>

                  <form onSubmit={handleApplyLocalNetwork} className="flex flex-col gap-6">
                    {/* CARD 2.4 GHz */}
                    <div className="rounded-2xl border border-border/80 bg-[#090b17]/90 p-6 sm:p-7 shadow-xl flex flex-col gap-5">
                      <div className="flex items-center justify-between border-b border-border/40 pb-4">
                        <div className="flex items-center gap-2.5 text-violet-400 font-bold text-sm">
                          <Wifi size={18} />
                          <span className="text-white">{t.ssid24}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input 
                              type="radio" 
                              name="ssid24EnabledRadio" 
                              checked={ssid24Enabled} 
                              onChange={() => setSsid24Enabled(true)} 
                              className="accent-violet-600" 
                            />
                            <span className={ssid24Enabled ? "text-white font-medium" : "text-muted-foreground"}>{t.on}</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input 
                              type="radio" 
                              name="ssid24EnabledRadio" 
                              checked={!ssid24Enabled} 
                              onChange={() => setSsid24Enabled(false)} 
                              className="accent-violet-600" 
                            />
                            <span className={!ssid24Enabled ? "text-white font-medium" : "text-muted-foreground"}>{t.off}</span>
                          </label>
                        </div>
                      </div>

                      <div className="grid gap-4 text-xs sm:text-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-2">
                          <label className="font-semibold text-muted-foreground">{t.ssidName}</label>
                          <input 
                            required
                            type="text" 
                            value={ssid24Name}
                            onChange={e => setSsid24Name(e.target.value)}
                            onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity(t.fillField)}
                            onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                            placeholder={t.ssidPlaceholder24}
                            className="h-10 rounded-xl border border-border bg-[#05060f]/80 px-3.5 text-foreground outline-none focus:border-violet-500 font-mono text-xs transition-colors"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-2">
                          <label className="font-semibold text-muted-foreground">{t.ssidStatus}</label>
                          <div className="flex items-center gap-4 text-xs">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="radio" 
                                name="ssid24Status" 
                                checked={ssid24Enabled} 
                                onChange={() => setSsid24Enabled(true)} 
                                className="accent-violet-600" 
                              />
                              <span className={ssid24Enabled ? "text-white font-medium" : "text-muted-foreground"}>{t.on}</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="radio" 
                                name="ssid24Status" 
                                checked={!ssid24Enabled} 
                                onChange={() => setSsid24Enabled(false)} 
                                className="accent-violet-600" 
                              />
                              <span className={!ssid24Enabled ? "text-white font-medium" : "text-muted-foreground"}>{t.off}</span>
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-2">
                          <label className="font-semibold text-muted-foreground">{t.cryptoType}</label>
                          <select 
                            value={ssid24Crypto} 
                            onChange={e => setSsid24Crypto(e.target.value)}
                            className="h-10 rounded-xl border border-border bg-[#05060f]/80 px-3.5 text-foreground outline-none focus:border-violet-500 font-mono text-xs"
                          >
                            <option value="WPA2-PSK-AES">WPA2-PSK-AES</option>
                            <option value="WPA3-SAE">WPA3-SAE</option>
                            <option value="WPA/WPA2-PSK-Mixed">WPA/WPA2-PSK-Mixed</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-2">
                          <label className="font-semibold text-muted-foreground">{t.wpaPassword}</label>
                          <div className="relative flex items-center">
                            <input 
                              required
                              type={showSsid24Pass ? "text" : "password"}
                              value={ssid24Pass}
                              onChange={e => setSsid24Pass(e.target.value)}
                              onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity(t.fillField)}
                              onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                              placeholder={t.passPlaceholder}
                              className="h-10 w-full rounded-xl border border-border bg-[#05060f]/80 pl-3.5 pr-10 text-foreground outline-none focus:border-violet-500 font-mono text-xs transition-colors"
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowSsid24Pass(!showSsid24Pass)}
                              className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                              title={t.togglePass}
                            >
                              {showSsid24Pass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-2">
                          <label className="font-semibold text-muted-foreground">{t.isolation}</label>
                          <div className="flex items-center gap-4 text-xs">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="radio" 
                                name="ssid24Iso" 
                                checked={ssid24Isolation} 
                                onChange={() => setSsid24Isolation(true)} 
                                className="accent-violet-600" 
                              />
                              <span className={ssid24Isolation ? "text-white font-medium" : "text-muted-foreground"}>{t.on}</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="radio" 
                                name="ssid24Iso" 
                                checked={!ssid24Isolation} 
                                onChange={() => setSsid24Isolation(false)} 
                                className="accent-violet-600" 
                              />
                              <span className={!ssid24Isolation ? "text-white font-medium" : "text-muted-foreground"}>{t.off}</span>
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-2">
                          <label className="font-semibold text-muted-foreground">{t.maxClients}</label>
                          <input 
                            type="number" 
                            value={ssid24MaxClients} 
                            onChange={e => setSsid24MaxClients(Number(e.target.value))}
                            className="h-10 w-28 rounded-xl border border-border bg-[#05060f]/80 px-3.5 text-foreground outline-none focus:border-violet-500 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* CARD 5 GHz */}
                    <div className="rounded-2xl border border-border/80 bg-[#090b17]/90 p-6 sm:p-7 shadow-xl flex flex-col gap-5">
                      <div className="flex items-center justify-between border-b border-border/40 pb-4">
                        <div className="flex items-center gap-2.5 text-violet-400 font-bold text-sm">
                          <Wifi size={18} />
                          <span className="text-white">{t.ssid5}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input 
                              type="radio" 
                              name="ssid5EnabledRadio" 
                              checked={ssid5Enabled} 
                              onChange={() => setSsid5Enabled(true)} 
                              className="accent-violet-600" 
                            />
                            <span className={ssid5Enabled ? "text-white font-medium" : "text-muted-foreground"}>{t.on}</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input 
                              type="radio" 
                              name="ssid5EnabledRadio" 
                              checked={!ssid5Enabled} 
                              onChange={() => setSsid5Enabled(false)} 
                              className="accent-violet-600" 
                            />
                            <span className={!ssid5Enabled ? "text-white font-medium" : "text-muted-foreground"}>{t.off}</span>
                          </label>
                        </div>
                      </div>

                      <div className="grid gap-4 text-xs sm:text-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-2">
                          <label className="font-semibold text-muted-foreground">{t.ssidName}</label>
                          <input 
                            required
                            type="text" 
                            value={ssid5Name}
                            onChange={e => setSsid5Name(e.target.value)}
                            onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity(t.fillField)}
                            onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                            placeholder={t.ssidPlaceholder5}
                            className="h-10 rounded-xl border border-border bg-[#05060f]/80 px-3.5 text-foreground outline-none focus:border-violet-500 font-mono text-xs transition-colors"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-2">
                          <label className="font-semibold text-muted-foreground">{t.ssidStatus}</label>
                          <div className="flex items-center gap-4 text-xs">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="radio" 
                                name="ssid5Status" 
                                checked={ssid5Enabled} 
                                onChange={() => setSsid5Enabled(true)} 
                                className="accent-violet-600" 
                              />
                              <span className={ssid5Enabled ? "text-white font-medium" : "text-muted-foreground"}>{t.on}</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="radio" 
                                name="ssid5Status" 
                                checked={!ssid5Enabled} 
                                onChange={() => setSsid5Enabled(false)} 
                                className="accent-violet-600" 
                              />
                              <span className={!ssid5Enabled ? "text-white font-medium" : "text-muted-foreground"}>{t.off}</span>
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-2">
                          <label className="font-semibold text-muted-foreground">{t.cryptoType}</label>
                          <select 
                            value={ssid5Crypto} 
                            onChange={e => setSsid5Crypto(e.target.value)}
                            className="h-10 rounded-xl border border-border bg-[#05060f]/80 px-3.5 text-foreground outline-none focus:border-violet-500 font-mono text-xs"
                          >
                            <option value="WPA2-PSK-AES">WPA2-PSK-AES</option>
                            <option value="WPA3-SAE">WPA3-SAE</option>
                            <option value="WPA/WPA2-PSK-Mixed">WPA/WPA2-PSK-Mixed</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-2">
                          <label className="font-semibold text-muted-foreground">{t.wpaPassword}</label>
                          <div className="relative flex items-center">
                            <input 
                              required
                              type={showSsid5Pass ? "text" : "password"}
                              value={ssid5Pass}
                              onChange={e => setSsid5Pass(e.target.value)}
                              onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity(t.fillField)}
                              onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                              placeholder={t.passPlaceholder}
                              className="h-10 w-full rounded-xl border border-border bg-[#05060f]/80 pl-3.5 pr-10 text-foreground outline-none focus:border-violet-500 font-mono text-xs transition-colors"
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowSsid5Pass(!showSsid5Pass)}
                              className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                              title={t.togglePass}
                            >
                              {showSsid5Pass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-2">
                          <label className="font-semibold text-muted-foreground">{t.isolation}</label>
                          <div className="flex items-center gap-4 text-xs">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="radio" 
                                name="ssid5Iso" 
                                checked={ssid5Isolation} 
                                onChange={() => setSsid5Isolation(true)} 
                                className="accent-violet-600" 
                              />
                              <span className={ssid5Isolation ? "text-white font-medium" : "text-muted-foreground"}>{t.on}</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="radio" 
                                name="ssid5Iso" 
                                checked={!ssid5Isolation} 
                                onChange={() => setSsid5Isolation(false)} 
                                className="accent-violet-600" 
                              />
                              <span className={!ssid5Isolation ? "text-white font-medium" : "text-muted-foreground"}>{t.off}</span>
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-2">
                          <label className="font-semibold text-muted-foreground">{t.maxClients}</label>
                          <input 
                            type="number" 
                            value={ssid5MaxClients} 
                            onChange={e => setSsid5MaxClients(Number(e.target.value))}
                            className="h-10 w-28 rounded-xl border border-border bg-[#05060f]/80 px-3.5 text-foreground outline-none focus:border-violet-500 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* BOTÕES DE AÇÃO */}
                    <div className="flex flex-col items-end gap-3 mt-1">
                      <div className="flex items-center gap-3">
                        <button 
                          type="button" 
                          onClick={handleCancelLocalNetwork}
                          className="h-10 px-5 rounded-xl border border-border bg-card/50 text-xs font-medium text-slate-300 hover:bg-violet-500/15 hover:text-violet-300 hover:border-violet-500/40 transition-all duration-200 hover:text-white transition-colors"
                        >
                          {t.cancel}
                        </button>
                        <button 
                          type="submit" 
                          className="h-10 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-900/40 transition-all active:scale-[0.98]"
                        >
                          {t.applyChanges}
                        </button>
                      </div>

                      {localNetworkMessage && (
                        <div className="w-full sm:w-auto flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-400 px-5 py-3 text-xs font-semibold shadow-lg shadow-emerald-950/30 animate-in fade-in slide-in-from-top-2 duration-200">
                          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                          <span>{localNetworkMessage}</span>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* --- TELA MIGRADADA: GERÊNCIA E DIAGNÓSTICO (ACESSO EXCLUSIVO DO USER) --- */}
              {activeMenu === 'diagnostics' && userRole === 'user' && (
                <div className="flex-1 w-full flex flex-col animate-in fade-in duration-500 pb-16">
                  <div className="mb-8 flex flex-col gap-1">
                    <p className="font-mono text-xs uppercase tracking-[.2em] text-violet-500 font-semibold">{t.diagSubheader}</p>
                    <h2 className="text-3xl font-bold tracking-tight">{t.diagTitle}</h2>
                    <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed mt-1">
                      {t.diagDesc}
                    </p>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[240px_1fr] items-start">
                    <nav className="flex gap-2 lg:flex-col sticky top-0">
                      <button 
                        type="button" 
                        onClick={() => setTab('accounts')} 
                        className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-left text-xs font-semibold transition-colors ${tab === 'accounts' ? 'bg-violet-600 text-white shadow-sm' : 'border border-border bg-card hover:bg-violet-500/15 hover:text-violet-300 hover:border-violet-500/40 transition-all duration-200'}`}
                      >
                        <UserCheck size={16}/> {t.tabAccounts}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setTab('tr069')} 
                        className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-left text-xs font-semibold transition-colors ${tab === 'tr069' ? 'bg-violet-600 text-white shadow-sm' : 'border border-border bg-card hover:bg-violet-500/15 hover:text-violet-300 hover:border-violet-500/40 transition-all duration-200'}`}
                      >
                        <Server size={16}/> {t.tabTr069}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setTab('software')} 
                        className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-left text-xs font-semibold transition-colors ${tab === 'software' ? 'bg-violet-600 text-white shadow-sm' : 'border border-border bg-card hover:bg-violet-500/15 hover:text-violet-300 hover:border-violet-500/40 transition-all duration-200'}`}
                      >
                        <FileUp size={16}/> {t.tabSoftware}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setTab('config')} 
                        className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-left text-xs font-semibold transition-colors ${tab === 'config' ? 'bg-violet-600 text-white shadow-sm' : 'border border-border bg-card hover:bg-violet-500/15 hover:text-violet-300 hover:border-violet-500/40 transition-all duration-200'}`}
                      >
                        <Wifi size={16}/> {t.tabConfig}
                      </button>
                    </nav>

                    <div className="flex flex-col gap-6">
                      {tab === 'accounts' && (
                        <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
                          <div className="mb-6">
                            <h3 className="text-xl font-bold">{t.pageInfo}</h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {t.pageInfoAccounts}
                            </p>
                          </div>

                          <form onSubmit={handleSaveAccount} className="flex flex-col gap-6">
                            <div className="rounded-2xl border border-border bg-background/50 p-5">
                              <h4 className="font-semibold text-sm mb-4 text-violet-400 flex items-center gap-2">
                                <span>▼</span> {t.adminAccountMgmt}
                              </h4>

                              <div className="mb-6 rounded-xl border border-violet-900/40 bg-violet-950/20 p-4 text-xs text-muted-foreground leading-relaxed">
                                <p className="font-semibold text-violet-300 mb-1 flex items-center gap-1.5">
                                  <HelpCircle size={14} /> {t.passRulesTitle}
                                </p>
                                <ol className="list-decimal list-inside space-y-1 pl-1">
                                  <li>{t.rule1}</li>
                                  <li>{t.rule2}</li>
                                  <li>{t.rule3}</li>
                                </ol>
                              </div>

                              <div className="grid gap-4 text-xs sm:text-sm max-w-xl">
                                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-2">
                                  <label className="font-semibold text-muted-foreground">{t.userLabel}</label>
                                  <input 
                                    type="text" 
                                    value={adminUser} 
                                    onChange={e => setAdminUser(e.target.value)} 
                                    className="h-10 rounded-xl border border-border bg-background px-3.5 text-foreground outline-none focus:border-violet-500" 
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-2">
                                  <label className="font-semibold text-muted-foreground">{t.currentPassLabel}</label>
                                  <div className="relative flex items-center">
                                    <input 
                                      required
                                      type={showAdminCurrentPass ? "text" : "password"} 
                                      value={adminCurrentPass} 
                                      onChange={e => setAdminCurrentPass(e.target.value)} 
                                      placeholder={t.enterCurrentPass} 
                                      className="h-10 w-full rounded-xl border border-border bg-background pl-3.5 pr-10 text-foreground outline-none focus:border-violet-500" 
                                    />
                                    <button 
                                      type="button" 
                                      onClick={() => setShowAdminCurrentPass(!showAdminCurrentPass)} 
                                      className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                                      title={t.togglePass}
                                    >
                                      {showAdminCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-2">
                                  <label className="font-semibold text-muted-foreground">{t.newPassLabel}</label>
                                  <div className="relative flex items-center">
                                    <input 
                                      required
                                      type={showAdminNewPass ? "text" : "password"} 
                                      value={adminNewPass} 
                                      onChange={e => setAdminNewPass(e.target.value)} 
                                      placeholder={t.enterNewPass} 
                                      className="h-10 w-full rounded-xl border border-border bg-background pl-3.5 pr-10 text-foreground outline-none focus:border-violet-500" 
                                    />
                                    <button 
                                      type="button" 
                                      onClick={() => setShowAdminNewPass(!showAdminNewPass)} 
                                      className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                                      title={t.togglePass}
                                    >
                                      {showAdminNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-2">
                                  <label className="font-semibold text-muted-foreground">{t.confirmNewPassLabel}</label>
                                  <div className="relative flex items-center">
                                    <input 
                                      required
                                      type={showAdminConfirmPass ? "text" : "password"} 
                                      value={adminConfirmPass} 
                                      onChange={e => setAdminConfirmPass(e.target.value)} 
                                      placeholder={t.confirmNewPass} 
                                      className="h-10 w-full rounded-xl border border-border bg-background pl-3.5 pr-10 text-foreground outline-none focus:border-violet-500" 
                                    />
                                    <button 
                                      type="button" 
                                      onClick={() => setShowAdminConfirmPass(!showAdminConfirmPass)} 
                                      className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                                      title={t.togglePass}
                                    >
                                      {showAdminConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-6 flex items-center justify-end gap-3">
                                <button type="submit" className="h-10 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition-all">
                                  {t.applyBtn}
                                </button>
                                <button type="button" onClick={() => { setAdminCurrentPass(''); setAdminNewPass(''); setAdminConfirmPass('') }} className="h-10 px-6 rounded-xl border border-border text-xs font-medium hover:bg-violet-500/15 hover:text-violet-300 hover:border-violet-500/40 transition-all duration-200 transition-colors">
                                  {t.cancelBtn}
                                </button>
                              </div>
                            </div>

                            {accountFeedbackMessage && (
                              <div className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 p-4 text-xs font-medium text-violet-400">
                                <CheckCircle2 size={16} /> {accountFeedbackMessage}
                              </div>
                            )}
                          </form>
                        </section>
                      )}

                      {tab === 'tr069' && (
                        <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
                          <div className="mb-6">
                            <h3 className="text-xl font-bold">{t.pageInfo}</h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {t.pageInfoTR069}
                            </p>
                          </div>

                          <form onSubmit={handleSaveTR069} className="flex flex-col gap-6">
                            <div className="rounded-2xl border border-border bg-background/50 p-5">
                              <h4 className="font-semibold text-sm mb-4 text-violet-400 flex items-center gap-2">
                                <span>▼</span> {t.basicSettings}
                              </h4>

                              <div className="grid gap-4 text-xs sm:text-sm">
                                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-2">
                                  <label className="font-semibold text-muted-foreground">{t.wanConn}</label>
                                  <select 
                                    value={trWanConnection} 
                                    onChange={e => setTrWanConnection(e.target.value)} 
                                    className="h-10 rounded-xl border border-border bg-background px-3.5 text-foreground outline-none focus:border-violet-500" 
                                  >
                                    <option value="Qualquer">{t.any}</option>
                                    <option value="INTERNET">INTERNET</option>
                                    <option value="TR069_VOIP">TR069_VOIP</option>
                                  </select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-2">
                                  <label className="font-semibold text-muted-foreground">ACS URL:</label>
                                  <input 
                                    type="text" 
                                    value={trAcsUrl} 
                                    onChange={e => setTrAcsUrl(e.target.value)} 
                                    className="h-10 rounded-xl border border-border bg-background px-3.5 text-foreground outline-none focus:border-violet-500 font-mono text-xs" 
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-2">
                                  <label className="font-semibold text-muted-foreground">{t.userLabel}</label>
                                  <input 
                                    type="text" 
                                    value={trAcsUser} 
                                    onChange={e => setTrAcsUser(e.target.value)} 
                                    className="h-10 rounded-xl border border-border bg-background px-3.5 text-foreground outline-none focus:border-violet-500 font-mono text-xs" 
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-2">
                                  <label className="font-semibold text-muted-foreground">{t.password}</label>
                                  <div className="relative flex items-center">
                                    <input 
                                      type={showTrAcsPass ? "text" : "password"} 
                                      value={trAcsPass} 
                                      onChange={e => setTrAcsPass(e.target.value)} 
                                      className="h-10 w-full rounded-xl border border-border bg-background pl-3.5 pr-10 text-foreground outline-none focus:border-violet-500 font-mono text-xs" 
                                    />
                                    <button 
                                      type="button" 
                                      onClick={() => setShowTrAcsPass(!showTrAcsPass)} 
                                      className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                                      title={t.togglePass}
                                    >
                                      {showTrAcsPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-2">
                                  <label className="font-semibold text-muted-foreground">{t.connReqUrl}</label>
                                  <input 
                                    type="text" 
                                    value={trConnReqUrl} 
                                    onChange={e => setTrConnReqUrl(e.target.value)} 
                                    className="h-10 rounded-xl border border-border bg-background px-3.5 text-foreground outline-none focus:border-violet-500 font-mono text-xs" 
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-2">
                                  <label className="font-semibold text-muted-foreground">{t.connReqUser}</label>
                                  <input 
                                    type="text" 
                                    value={trConnReqUser} 
                                    onChange={e => setTrConnReqUser(e.target.value)} 
                                    className="h-10 rounded-xl border border-border bg-background px-3.5 text-foreground outline-none focus:border-violet-500 font-mono text-xs" 
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-2">
                                  <label className="font-semibold text-muted-foreground">{t.connReqPass}</label>
                                  <div className="relative flex items-center">
                                    <input 
                                      type={showTrConnReqPass ? "text" : "password"} 
                                      value={trConnReqPass} 
                                      onChange={e => setTrConnReqPass(e.target.value)} 
                                      className="h-10 w-full rounded-xl border border-border bg-background pl-3.5 pr-10 text-foreground outline-none focus:border-violet-500 font-mono text-xs" 
                                    />
                                    <button 
                                      type="button" 
                                      onClick={() => setShowTrConnReqPass(!showTrConnReqPass)} 
                                      className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                                      title={t.togglePass}
                                    >
                                      {showTrConnReqPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-2">
                                  <label className="font-semibold text-muted-foreground">{t.periodicInform}</label>
                                  <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input 
                                        type="radio" 
                                        name="trPeriodicInform" 
                                        checked={trPeriodicInform} 
                                        onChange={() => setTrPeriodicInform(true)} 
                                        className="accent-violet-600" 
                                      />
                                      <span>{t.on}</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input 
                                        type="radio" 
                                        name="trPeriodicInform" 
                                        checked={!trPeriodicInform} 
                                        onChange={() => setTrPeriodicInform(false)} 
                                        className="accent-violet-600" 
                                      />
                                      <span>{t.off}</span>
                                    </label>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-2">
                                  <label className="font-semibold text-muted-foreground">{t.periodicInterval}</label>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="number" 
                                      value={trPeriodicInterval} 
                                      onChange={e => setTrPeriodicInterval(Number(e.target.value))} 
                                      className="h-10 w-32 rounded-xl border border-border bg-background px-3.5 text-foreground outline-none focus:border-violet-500" 
                                    />
                                    <span className="text-muted-foreground text-xs">s</span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-2">
                                  <label className="font-semibold text-muted-foreground">{t.acsAuth}</label>
                                  <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input 
                                        type="radio" 
                                        name="trAcsAuth" 
                                        checked={trAcsAuth} 
                                        onChange={() => setTrAcsAuth(true)} 
                                        className="accent-violet-600" 
                                      />
                                      <span>{t.on}</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input 
                                        type="radio" 
                                        name="trAcsAuth" 
                                        checked={!trAcsAuth} 
                                        onChange={() => setTrAcsAuth(false)} 
                                        className="accent-violet-600" 
                                      />
                                      <span>{t.off}</span>
                                    </label>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-2">
                                  <label className="font-semibold text-muted-foreground">{t.fileServerAuth}</label>
                                  <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input 
                                        type="radio" 
                                        name="trFileServerAuth" 
                                        checked={trFileServerAuth} 
                                        onChange={() => setTrFileServerAuth(true)} 
                                        className="accent-violet-600" 
                                      />
                                      <span>{t.on}</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input 
                                        type="radio" 
                                        name="trFileServerAuth" 
                                        checked={!trFileServerAuth} 
                                        onChange={() => setTrFileServerAuth(false)} 
                                        className="accent-violet-600" 
                                      />
                                      <span>{t.off}</span>
                                    </label>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-6 flex items-center justify-end gap-3">
                                <button type="submit" className="h-10 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition-all">
                                  {t.applyBtn}
                                </button>
                                <button type="button" className="h-10 px-6 rounded-xl border border-border text-xs font-medium hover:bg-violet-500/15 hover:text-violet-300 hover:border-violet-500/40 transition-all duration-200 transition-colors">
                                  {t.cancelBtn}
                                </button>
                              </div>
                            </div>

                            {trFeedbackMessage && (
                              <div className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 p-4 text-xs font-medium text-violet-400">
                                <CheckCircle2 size={16} /> {trFeedbackMessage}
                              </div>
                            )}
                          </form>
                        </section>
                      )}

                      {tab === 'software' && (
                        <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
                          <div className="mb-6 flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-bold">{t.tabSoftware}</h3>
                              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                {t.softwareUpdateDesc}
                              </p>
                            </div>
                            <div className="rounded-xl bg-accent p-3 text-violet-400">
                              <UploadCloud size={22} />
                            </div>
                          </div>

                          <label className="group flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-background px-5 text-center hover:border-violet-500 hover:bg-violet-500/15 hover:text-violet-300 hover:border-violet-500/40 transition-all duration-200/50 transition-colors">
                            <input className="sr-only" type="file" accept=".bin,.dns,.cfg,.conf" onChange={e => select(e, 'firmware')} />
                            <UploadCloud className="text-muted-foreground group-hover:text-violet-500 transition-colors" size={28} />
                            <span className="font-medium text-sm">{t.dropFirmwareText}</span>
                            <span className="text-xs text-muted-foreground">{t.fileTypes}</span>
                            {firmware && (
                              <span className="rounded-lg bg-accent px-3 py-1.5 text-xs text-foreground font-mono border border-border">
                                {firmware.name}
                              </span>
                            )}
                          </label>

                          {message && (
                            <div className={`mt-5 flex items-center gap-2 rounded-xl border p-4 text-xs font-medium ${stage === 'success' ? 'border-violet-500/30 bg-violet-500/10 text-violet-400' : 'border-destructive/30 bg-destructive/10 text-destructive'}`}>
                              {stage === 'success' && <CheckCircle2 size={16} />} {message}
                            </div>
                          )}

                          {preferences.requireFirmwareHash && <label className="flex flex-col gap-2 mt-4 text-xs">SHA-256<input aria-label="SHA-256" value={expectedFirmwareHash} onChange={e => setExpectedFirmwareHash(e.target.value)} maxLength={64} className="h-10 min-w-0 rounded-xl bg-background border border-border px-3 font-mono" /></label>}
                          <button type="button" onClick={() => run(firmware, 'software')} disabled={stage === 'uploading'} className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium disabled:opacity-60 transition-all shadow-lg shadow-violet-900/30">
                            {stage === 'uploading' ? (
                              <><span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent"/> {t.processing}</>
                            ) : (
                              <>{t.startUpdateBtn} <ChevronRight size={16}/></>
                            )}
                          </button>

                          {stage === 'success' && (
                            <button type="button" onClick={() => { setTab('config'); setStage('idle'); setMessage('') }} className="mt-3 w-full rounded-xl border border-border py-2.5 text-xs font-medium hover:bg-violet-500/15 hover:text-violet-300 hover:border-violet-500/40 transition-all duration-200 transition-colors">
                              {t.continueConfigBtn}
                            </button>
                          )}
                        </section>
                      )}

                      {tab === 'config' && (
                        <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
                          <div className="mb-6 flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-bold">{t.configDefaultTitle}</h3>
                              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                {t.configDefaultDesc}
                              </p>
                            </div>
                            <div className="rounded-xl bg-accent p-3 text-violet-400">
                              <FileArchive size={22} />
                            </div>
                          </div>

                          <label className="group flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-background px-5 text-center hover:border-violet-500 hover:bg-violet-500/15 hover:text-violet-300 hover:border-violet-500/40 transition-all duration-200/50 transition-colors">
                            <input className="sr-only" type="file" accept=".bin,.dns,.cfg,.conf" onChange={e => select(e, 'config')} />
                            <UploadCloud className="text-muted-foreground group-hover:text-violet-500 transition-colors" size={28} />
                            <span className="font-medium text-sm">{t.dropFirmwareText}</span>
                            <span className="text-xs text-muted-foreground">{t.fileTypes}</span>
                            {config && (
                              <span className="rounded-lg bg-accent px-3 py-1.5 text-xs text-foreground font-mono border border-border">
                                {config.name}
                              </span>
                            )}
                          </label>

                          {message && (
                            <div className={`mt-5 flex items-center gap-2 rounded-xl border p-4 text-xs font-medium ${stage === 'success' ? 'border-violet-500/30 bg-violet-500/10 text-violet-400' : 'border-destructive/30 bg-destructive/10 text-destructive'}`}>
                              {stage === 'success' && <CheckCircle2 size={16} />} {message}
                            </div>
                          )}

                          <button type="button" onClick={() => run(config, 'config')} disabled={stage === 'uploading'} className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium disabled:opacity-60 transition-all shadow-lg shadow-violet-900/30">
                            {stage === 'uploading' ? (
                              <><span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent"/> {t.processing}</>
                            ) : (
                              <>{t.startConfigBtn} <ChevronRight size={16}/></>
                            )}
                          </button>
                        </section>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* --- TELA DO USUÁRIO: PAINEL DO ASSISTENTE --- */}
              {activeMenu === 'internet' && userRole === 'user' && (
                <AssistantPanelModule
                  lang={lang}
                  onManual={() => handleMenuClick('manual_config')}
                  greetingMessage={greetingMessage}
                  queue={batchQueue}
                  terminalAutoScroll={preferences.terminalAutoScroll}
                  startAutomation={startAutomation}
                  onModelChange={model => setPreferences(prev => ({ ...prev, targetRouterModel: model }))}
                />
              )}

              </div>
            </div>

            {/* CHAT DO ASSISTENTE GLOBAL */}
            <div className={`fixed inset-y-0 right-0 sm:right-4 sm:top-20 sm:bottom-4 z-50 p-3 sm:p-0 2xl:sticky 2xl:inset-auto 2xl:top-6 2xl:self-start 2xl:h-[calc(100dvh-116px)] 2xl:p-0 2xl:z-auto shrink-0 transition-all duration-500 ease-in-out ${isChatOpen ? 'w-full sm:w-[380px] 2xl:w-[380px] translate-x-0 opacity-100 overflow-hidden 2xl:overflow-visible' : 'w-0 translate-x-full opacity-0 pointer-events-none hidden 2xl:block overflow-hidden'}`}>
              <aside className="w-full 2xl:w-[380px] flex flex-col h-full min-h-0 rounded-3xl border border-border bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="p-4 sm:p-6 shrink-0 border-b border-border/40 bg-card/80">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`transition-all duration-700 ${logoAnimating ? 'scale-110 drop-shadow-[0_0_20px_rgba(167,139,250,1)]' : 'drop-shadow-md'}`}>
                      <AssistantIcon 
                        className="w-8 h-8 text-violet-400" 
                        style={logoAnimating ? { animation: 'spin 1s ease-in-out 1' } : {}}
                      />
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <button className="hover:text-foreground transition-colors" title={t.closeChat} onClick={() => setIsChatOpen(false)}>
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground leading-tight whitespace-pre-line">
                    {t.chatWelcome(username || (userRole === 'admin' ? t.adminFallback : t.userFallback))}
                  </h3>
                </div>

                <div ref={chatScrollRef} className="flex-1 min-h-0 p-5 overflow-y-auto overscroll-contain flex flex-col justify-start gap-3 custom-scrollbar">
                  <p className="text-[10px] text-muted-foreground">{lang === 'pt' ? 'Zseven IA' : 'Zseven AI'} · Zseven Systems</p>
                  {chatMessages.length === 0 && userRole && <ChatSuggestions key={userRole} role={userRole} lang={lang} isOpen={isChatOpen} disabled={isAiTyping || isAutomationActive} onSelect={text => void sendChatMessage(text)} />}
                  <div role="log" aria-live="polite" aria-relevant="additions" aria-label={lang === 'pt' ? 'Conversa com Zseven IA' : 'Conversation with Zseven AI'} className="flex flex-col gap-3">
                    {chatMessages.map(item => (
                      <article key={item.id} className={`max-w-[95%] min-w-0 rounded-2xl px-3 py-2.5 text-sm ${item.sender === 'user' ? 'self-end bg-violet-600 text-white' : 'self-start bg-background/80 border border-border text-foreground'}`}>
                        <p className="text-[10px] font-semibold opacity-75 mb-1">{item.sender === 'ai' ? (lang === 'pt' ? 'Zseven IA' : 'Zseven AI') : username || t.userFallback}</p>
                        <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-relaxed">{item.sender === 'ai' ? item.text.replace(/\bZseven (?:AI|IA)\b/g, lang === 'pt' ? 'Zseven IA' : 'Zseven AI') : item.text}</p>
                        {item.actionBadge && <span className="inline-block mt-2 rounded-lg bg-violet-500/15 px-2 py-1 text-[10px] text-violet-300 break-words">{item.actionBadge}</span>}
                        <time className="block mt-1 text-right text-[10px] opacity-60">{item.time}</time>
                        {item.sender === 'ai' && <ChatResponseActions text={item.text} lang={lang} />}
                      </article>
                    ))}
                  </div>
                  {isAiTyping && <p role="status" className="flex items-center gap-2 text-xs text-violet-300"><ZsevenSparkIcon />{aiPhase === 'thinking' ? (lang === 'pt' ? 'Zseven IA está pensando...' : 'Zseven AI is thinking...') : (lang === 'pt' ? 'Zseven IA está respondendo...' : 'Zseven AI is responding...')}</p>}
                </div>

                <div className="p-5 border-t border-border/40 bg-background/80 shrink-0">
                  {isAutomationActive && <p role="status" className="mb-3 text-xs text-muted-foreground">{lang === 'pt' ? '🔒 Automação em andamento — o envio de mensagens será liberado automaticamente ao concluir.' : '🔒 Automation in progress — messaging will unlock automatically when it finishes.'}</p>}
                  <ChatComposerForm key={String(logged) + ':' + username + ':' + userRole + ':' + String(aiEnabled) + ':' + chatComposerReset} onSend={text => { void sendChatMessage(text) }} disabled={isAiTyping || isAutomationActive} locked={isAutomationActive} lang={lang} placeholder={t.askSomething} sendLabel={t.send} />
                  <p className="text-[10px] text-muted-foreground mt-4 text-center leading-relaxed px-2">
                    {t.aiDisclaimer} <a href="#" className="underline hover:text-violet-400">{t.privacyPolicy}</a>.
                  </p>
                </div>
              </aside>
            </div>

          </div>
          
          {/* RODAPÉ */}
          <footer className="w-full border-t border-violet-900/20 bg-card/40 backdrop-blur-xl px-8 py-10 mt-auto shrink-0 z-10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-10">
              
              <div className="flex flex-col sm:flex-row items-center gap-8 md:gap-10">
                <div className="flex items-center justify-center">
                  <img 
                    src="/codenet-v2/zseven.jpeg" 
                    alt="Zseven Systems" 
                    className="h-24 w-auto object-contain opacity-100 hover:opacity-125 transition-opacity drop-shadow-md"
                  />
                </div>

                <LanguageSelector lang={lang} setLang={setLang} t={t} dropDirection="down" />
              </div>

              <div className="flex flex-1 justify-center gap-12 sm:gap-24 text-sm text-center md:text-left">
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold text-foreground mb-1">{t.company}</h4>
                  <a href="#" className="text-muted-foreground hover:text-violet-400 transition-colors">{t.about}</a>
                  <a href="#" className="text-muted-foreground hover:text-violet-400 transition-colors">{t.brand}</a>
                  <a href="#" className="text-muted-foreground hover:text-violet-400 transition-colors">{t.aiMode}</a>
                  <a href="#" className="text-muted-foreground hover:text-violet-400 transition-colors">{t.premiumPlan}</a>
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="font-bold text-foreground mb-1">{t.policy}</h4>
                  <a href="#" className="text-muted-foreground hover:text-violet-400 transition-colors">{t.terms}</a>
                  <a href="#" className="text-muted-foreground hover:text-violet-400 transition-colors">{t.privacy}</a>
                  <a href="#" className="text-muted-foreground hover:text-violet-400 transition-colors">{t.guidelines}</a>
                  <a href="#" className="text-muted-foreground hover:text-violet-400 transition-colors">{t.companyInfo}</a>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-4 min-w-[140px]">
                <h4 className="font-bold text-foreground text-center tracking-wide">{t.social}</h4>
                <div className="flex items-center justify-center gap-5">
                  <a 
                    href="https://discord.gg/8Z9WstczZm" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="group flex items-center justify-center"
                    title={t.discordTitle}
                  >
                    <img 
                      src="/codenet-v2/discord.jpeg" 
                      alt="Discord" 
                      className="w-[37px] h-[37px] object-contain opacity-70 group-hover:opacity-100 group-hover:[filter:invert(34%)_sepia(85%)_saturate(3015%)_hue-rotate(222deg)_brightness(97%)_contrast(93%)] transition-all duration-300"
                    />
                  </a>
                  <a 
                    href="https://youtube.com/@zseven_yt?si=vSNXi9ye-ZdCQN9U" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="group flex items-center justify-center"
                    title={t.youtubeTitle}
                  >
                    <img 
                      src="/codenet-v2/youtube.jpeg" 
                      alt="YouTube" 
                      className="w-[50px] h-[50px] object-contain opacity-70 group-hover:opacity-100 group-hover:[filter:invert(23%)_sepia(90%)_saturate(6054%)_hue-rotate(354deg)_brightness(94%)_contrast(115%)] transition-all duration-300"
                    />
                  </a>
                </div>
              </div>

            </div>
          </footer>

        </main>
      </div>
    </div>
  )
}
