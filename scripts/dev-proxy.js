#!/usr/bin/env node
/**
 * dev-proxy.js — forwards POST /v1/chat/completions → OpenRouter, injecting
 * the real API key server-side. Run on your dev machine so Android devices on
 * the same LAN can reach OpenRouter without needing the key on-device.
 *
 * Usage:
 *   npm run dev:proxy
 *
 * Then in .env.local:
 *   EXPO_PUBLIC_DEV_PROXY=1
 *   EXPO_PUBLIC_DEV_PROXY_HOST=<your LAN IP>
 */

const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')

// ---------------------------------------------------------------------------
// Load .env.local without any third-party deps
// ---------------------------------------------------------------------------
function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local')
  try {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n')
    const env = {}
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx < 0) continue
      const k = trimmed.slice(0, eqIdx).trim()
      const raw = trimmed.slice(eqIdx + 1).trim()
      env[k] = raw.replace(/^['"]|['"]$/g, '')
    }
    return env
  } catch {
    return {}
  }
}

const fileEnv = loadEnvLocal()
const API_KEY =
  process.env.EXPO_PUBLIC_OPENROUTER_API_KEY ||
  fileEnv.EXPO_PUBLIC_OPENROUTER_API_KEY

if (!API_KEY) {
  console.error('[proxy] ERROR: EXPO_PUBLIC_OPENROUTER_API_KEY not found in .env.local or environment.')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Proxy config
// ---------------------------------------------------------------------------
const PROXY_PORT = 8787
const TARGET_HOST = 'openrouter.ai'
const TARGET_PATH = '/api/v1/chat/completions'

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, HTTP-Referer, X-Title',
}

const server = http.createServer((req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS)
    res.end()
    return
  }

  if (req.method !== 'POST' || req.url !== '/v1/chat/completions') {
    res.writeHead(404, { 'Content-Type': 'application/json', ...CORS_HEADERS })
    res.end(JSON.stringify({ error: 'Not found — only POST /v1/chat/completions is supported.' }))
    return
  }

  const chunks = []
  req.on('data', chunk => chunks.push(chunk))
  req.on('end', () => {
    const body = Buffer.concat(chunks)
    console.log(`[proxy] → ${TARGET_HOST}${TARGET_PATH}  (${body.length} bytes)`)

    const options = {
      hostname: TARGET_HOST,
      port: 443,
      path: TARGET_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'http://localhost',
        'X-Title': 'Counsel',
      },
    }

    const proxyReq = https.request(options, proxyRes => {
      console.log(`[proxy] ← status ${proxyRes.statusCode}`)
      res.writeHead(proxyRes.statusCode ?? 502, {
        'Content-Type': proxyRes.headers['content-type'] ?? 'application/json',
        ...CORS_HEADERS,
      })
      proxyRes.pipe(res)
    })

    proxyReq.on('error', err => {
      console.error('[proxy] upstream error:', err.message)
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: `Proxy upstream error: ${err.message}` }))
      }
    })

    proxyReq.write(body)
    proxyReq.end()
  })

  req.on('error', err => {
    console.error('[proxy] client request error:', err.message)
  })
})

server.listen(PROXY_PORT, '0.0.0.0', () => {
  const maskedKey = `${API_KEY.slice(0, 8)}...${API_KEY.slice(-4)}`
  console.log(`[proxy] Listening on http://0.0.0.0:${PROXY_PORT}`)
  console.log(`[proxy] API key: ${maskedKey}`)
  console.log(`[proxy] Forwarding to https://${TARGET_HOST}${TARGET_PATH}`)
  console.log(`[proxy] ─────────────────────────────────────────────`)
  console.log(`[proxy] In .env.local, set:`)
  console.log(`[proxy]   EXPO_PUBLIC_DEV_PROXY=1`)
  console.log(`[proxy]   EXPO_PUBLIC_DEV_PROXY_HOST=<your LAN IP>`)
  console.log(`[proxy] Find your LAN IP with: ipconfig (Windows) / ifconfig (Mac)`)
})
