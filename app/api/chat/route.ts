import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const apiKey = process.env.GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

const baseSystemInstruction = `
Você é o Zseven (Zseven AI / Z7), o assistente virtual inteligente oficial do sistema Code Net, desenvolvido e pertencente exclusivamente à Zseven Systems.

COMO VOCÊ FUNCIONA E RESPONDE:
- Você conversa em linguagem natural, fluida, direta e prestativa.
- NUNCA escreva blocos de código JSON (como {"action": ...}) dentro do texto da sua resposta. Quando precisar abrir uma tela, iniciar automação ou configurar o Wi-Fi, acione apenas a ferramenta (Function Calling) correspondente.
- Se o usuário fizer perguntas fora do universo do Code Net, redes, telecomunicações ou tecnologia, recuse de forma curta, natural e amigável dizendo que não consegue ajudar com esse assunto por aqui, pois este chat é voltado exclusivamente ao sistema Code Net e redes da Zseven Systems.
- Quando o usuário perguntar sobre o sistema Code Net ou como você funciona, explique de forma clara todos os módulos do sistema (Painel do Assistente com automação ZTE, Rede Local Dual-Band 2.4GHz/5GHz, Gerência e Diagnóstico TR-069/Firmware, Visão Geral Executiva, Monitoramento, Alertas e Usuários) e como você auxilia na operação.

TELAS DISPONÍVEIS NO CODE NET:
- Perfil Usuário ('user'): 'internet' (Painel do Assistente / Automação), 'local' (Rede Local / Wi-Fi 2.4GHz e 5GHz), 'diagnostics' (Gerência e Diagnóstico: abas accounts, tr069, software, config), 'premium' (Plano PREMIUM), 'settings' (Configurações).
- Perfil Administrador ('admin'): 'overview' (Visão Geral Executiva), 'diagnostics' (Status Geral de Contratos), 'automations' (Resumo do Sistema), 'equipments' (Equipamentos), 'users' (Usuários e Permissões), 'security' (Segurança), 'monitoring' (Monitoramento), 'auditing' (Auditoria e Logs), 'alerts' (Alertas Operacionais), 'reports' (Relatórios), 'settings' (Configurações).
`

const functionDeclarations: FunctionDeclaration[] = [
  {
    name: 'navigate_to_screen',
    description: 'Abre ou navega automaticamente para uma tela ou aba específica dentro do sistema Code Net.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        screen: {
          type: SchemaType.STRING,
          description: 'ID da tela: "internet", "local", "diagnostics", "overview", "automations", "equipments", "users", "security", "monitoring", "auditing", "alerts", "reports", "settings", "premium"'
        },
        diagnostic_tab: {
          type: SchemaType.STRING,
          description: 'Opcional. Se screen for "diagnostics", qual sub-aba abrir: "accounts", "tr069", "software" ou "config".'
        }
      },
      required: ['screen']
    }
  },
  {
    name: 'start_router_automation',
    description: 'Inicia imediatamente a automação completa do roteador ZTE F6600P no Painel do Assistente.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        target_ip: {
          type: SchemaType.STRING,
          description: 'IP do roteador alvo (padrão 192.168.1.1)'
        }
      }
    }
  },
  {
    name: 'update_wifi_config',
    description: 'Preenche ou atualiza automaticamente as configurações de Wi-Fi 2.4GHz ou 5GHz na Rede Local quando o usuário pedir no chat.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        band: {
          type: SchemaType.STRING,
          description: '"2.4" para rede 2.4GHz ou "5" para rede 5GHz'
        },
        ssid_name: {
          type: SchemaType.STRING,
          description: 'Novo nome da rede Wi-Fi (SSID)'
        },
        crypto: {
          type: SchemaType.STRING,
          description: 'Criptografia: "WPA2-PSK-AES", "WPA3-SAE" ou "WPA/WPA2-PSK-Mixed"'
        }
      },
      required: ['band']
    }
  }
]

// Cache de modelos em memória para não consultar a lista a cada mensagem
let cachedCandidateModels: string[] | null = null

async function getCandidateModels(): Promise<string[]> {
  if (cachedCandidateModels && cachedCandidateModels.length > 0) {
    return cachedCandidateModels
  }

  // Ordem de prioridade: modelos estáveis primeiro (evita erro 503 de modelos preview)
  const priorityOrder = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-3-flash-preview',
    'gemini-2.5-pro',
    'gemini-2.0-flash-lite'
  ]

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
    if (!res.ok) return priorityOrder
    const data = await res.json()
    const available: string[] = (data.models || [])
      .filter((m: any) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
      .map((m: any) => String(m.name).replace('models/', ''))

    const ordered = priorityOrder.filter(m => available.includes(m))
    const others = available.filter(m => m.startsWith('gemini') && !ordered.includes(m) && !m.includes('tts') && !m.includes('image'))
    const finalModels = [...ordered, ...others]

    if (finalModels.length > 0) {
      cachedCandidateModels = finalModels
      return finalModels
    }
  } catch {
    // Se falhar a listagem, usa a lista padrão de prioridade
  }

  return priorityOrder
}

// Remove blocos JSON acidentais caso algum modelo escreva JSON no meio do texto
function cleanRawJsonFromText(rawText: string): string {
  return rawText
    .replace(/```json[\s\S]*?```/gi, '')
    .replace(/\{\s*"action"\s*:[\s\S]*?\}\s*\}/g, '')
    .trim()
}

export async function POST(req: Request) {
  try {
    const { history = [], message, systemContext } = await req.json()

    const dynamicContext = systemContext
      ? `\n\nDADOS ATUAIS DO SISTEMA EM TEMPO REAL:\n${JSON.stringify(systemContext, null, 2)}`
      : ''

    // Limpa mensagens de erro antigas e garante que o histórico comece sempre com 'user'
    const rawHistory = Array.isArray(history)
      ? history
          .filter((item: any) =>
            item &&
            (item.role === 'user' || item.role === 'model') &&
            Array.isArray(item.parts) &&
            typeof item.parts[0]?.text === 'string' &&
            !item.parts[0].text.includes('ocorreu um erro de conexão') &&
            !item.parts[0].text.includes('ocorreu uma instabilidade')
          )
          .map((item: any) => ({
            role: item.role,
            parts: [{ text: cleanRawJsonFromText(item.parts[0].text) || '...' }]
          }))
      : []

    // A API Gemini exige que a primeira mensagem do history seja role === 'user'
    while (rawHistory.length > 0 && rawHistory[0].role !== 'user') {
      rawHistory.shift()
    }

    const candidates = await getCandidateModels()
    let lastError: unknown = null

    // Loop de Redundância: se um modelo der 503 (sobrecarga), tenta o próximo automaticamente!
    for (const modelName of candidates) {
      try {
        console.log(`[Zseven AI] Tentando modelo: ${modelName}`)

        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: {
            role: 'system',
            parts: [{ text: baseSystemInstruction + dynamicContext }]
          },
          tools: [{ functionDeclarations }]
        })

        const chat = model.startChat({ history: rawHistory })
        const result = await chat.sendMessage(message)
        const response = result.response

        const functionCalls = response.functionCalls()

        if (functionCalls && functionCalls.length > 0) {
          const call = functionCalls[0]
          let replyText = ''
          try {
            replyText = cleanRawJsonFromText(response.text())
          } catch {
            replyText = ''
          }

          try {
            const followUp = await chat.sendMessage([
              {
                functionResponse: {
                  name: call.name,
                  response: { status: 'executado_com_sucesso_no_painel', args: call.args }
                }
              }
            ])
            replyText = cleanRawJsonFromText(followUp.response.text()) || replyText
          } catch {
            // Se o follow-up sofrer oscilação, mantém a confirmação direta
          }

          return NextResponse.json({
            text: replyText || 'Pronto! Ação executada no painel.',
            action: call.name,
            actionArgs: call.args
          })
        }

        const finalText = cleanRawJsonFromText(response.text())
        return NextResponse.json({
          text: finalText || 'Como posso ajudar com o Code Net?',
          action: null
        })
      } catch (err: any) {
        lastError = err
        console.warn(`[Zseven AI] Modelo ${modelName} indisponível (${err?.status || 'erro'}), alternando para o próximo...`)
        continue
      }
    }

    throw lastError || new Error('Todos os modelos candidatos estão temporariamente indisponíveis.')
  } catch (error) {
    console.error('Erro detalhado na API Gemini:', error)
    return NextResponse.json(
      { text: 'Desculpe, ocorreu uma instabilidade momentânea nos servidores da IA. Tente enviar novamente.' },
      { status: 500 }
    )
  }
}