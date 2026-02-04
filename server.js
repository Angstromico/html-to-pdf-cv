const http = require('http')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const PORT = 4000

const MIMETYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf',
}

const server = http.createServer((req, res) => {
  // Enable CORS for development convenience (though strictly not needed for same-origin)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  // Serve Dashboard
  if (req.url === '/' && req.method === 'GET') {
    serveFile(res, 'dashboard.html', 'text/html')
    return
  }

  // API: Generate CV
  if (req.url === '/api/generate' && req.method === 'POST') {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk.toString()
    })
    req.on('end', () => {
      try {
        const { type, lang } = JSON.parse(body)
        handleGeneration(res, type, lang)
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }))
      }
    })
    return
  }

  // Serve Static Files (PDFs, images, etc.)
  // Basic security: Prevent directory traversal
  const safePath = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '')
  const filePath = path.join(__dirname, safePath)

  // Check if file exists and is within the directory
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIMETYPES[ext] || 'application/octet-stream'
    serveFile(res, safePath, contentType)
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not Found')
  }
})

function serveFile(res, fileName, contentType) {
  const filePath = path.join(__dirname, fileName)
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end(`Server Error: ${err.code}`)
    } else {
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(content)
    }
  })
}

function handleGeneration(res, type, lang) {
  let command = ''
  let outputFile = ''

  // Logic mapping based on existing scripts
  if (type === 'standard') {
    if (lang === 'en') {
      command = 'node generate-pdf.js'
      outputFile = 'manuel-morales-resume.pdf'
    } else if (lang === 'es') {
      command = 'node ./es/index.js'
      outputFile = 'manuel-morales-resume-es.pdf'
    }
  } else if (type === 'harvard') {
    if (lang === 'en') {
      command = 'node generate-harvard-pdf.js en'
      outputFile = 'manuel-morales-harvard.pdf'
    } else if (lang === 'es') {
      command = 'node generate-harvard-pdf.js es'
      outputFile = 'manuel-morales-harvard-es.pdf'
    }
  }

  if (!command) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ success: false, error: 'Invalid configuration' }))
    return
  }

  console.log(`Executing: ${command}`)

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          success: false,
          error: error.message,
          details: stderr,
        }),
      )
      return
    }

    console.log(`Success: ${stdout}`)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        success: true,
        message: 'CV Generated Successfully',
        file: outputFile,
      }),
    )
  })
}

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`)
})
