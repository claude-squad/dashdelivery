#!/usr/bin/env node
/**
 * office-hook.js — integra Claude Code ao DashDelivery em tempo real.
 * Lê o payload stdin do Claude Code e faz POST em /api/events.
 *
 * Ativação em .claude/settings.local.json:
 * {
 *   "hooks": {
 *     "PreToolUse":  [{ "matcher": ".*", "hooks": [{ "type": "command", "command": "node /caminho/office-hook.js pre"  }] }],
 *     "PostToolUse": [{ "matcher": ".*", "hooks": [{ "type": "command", "command": "node /caminho/office-hook.js post" }] }],
 *     "Stop":        [{ "hooks": [{ "type": "command", "command": "node /caminho/office-hook.js stop" }] }]
 *   }
 * }
 */

const http = require('http')

const phase = process.argv[2] || 'post'
const SERVER = 'http://localhost:3001'
const TIMEOUT_MS = 500

// Lê stdin completo
let raw = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (chunk) => { raw += chunk })
process.stdin.on('end', () => {
  let payload = {}
  try { payload = JSON.parse(raw) } catch { /* stdin vazio ou inválido — ignora */ }

  const toolName      = payload.tool_name ?? payload.toolName ?? ''
  const toolInput     = payload.tool_input ?? payload.toolInput ?? {}
  const toolResponse  = payload.tool_response ?? payload.toolResponse ?? {}

  const taskDescription = toolInput.description ?? toolInput.prompt ?? toolInput.command ?? toolInput.file_path ?? ''
  const filePath        = toolInput.file_path ?? toolInput.path ?? ''
  const command         = (toolInput.command ?? '').toString().substring(0, 120)
  const result          = (toolResponse.output ?? toolResponse.result ?? '').toString().substring(0, 80)
  const subagentType    = toolInput.subagent_type ?? toolInput.agentType ?? ''
  const correlationId   = `hook-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  const body = JSON.stringify({
    phase,
    toolName,
    subagentType,
    taskDescription: taskDescription.toString().substring(0, 200),
    filePath,
    command,
    result,
    correlationId,
    demandId: 'LIVE',
  })

  try {
    const url = new URL('/api/events', SERVER)
    const req = http.request({
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      timeout: TIMEOUT_MS,
    })
    req.on('error', () => {}) // server offline — ignora silenciosamente
    req.on('timeout', () => { req.destroy() })
    req.write(body)
    req.end()
  } catch { /* ignora */ }
})
