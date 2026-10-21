#!/usr/bin/env node
/**
 * Direct CLI Runner for `create` command
 *
 * Usage:
 *   node create                  # Compiles Harvard (EN/ES) and Standard (EN/ES) [4 outputs]
 *   node create harvard          # Compiles Harvard format only (EN & ES) [2 outputs]
 *   node create standard         # Compiles Standard format only (EN & ES) [2 outputs]
 *   node create en               # Compiles Harvard and Standard in English [2 outputs]
 *   node create es               # Compiles Harvard and Standard in Spanish [2 outputs]
 *   node create harvard en       # Compiles strictly Harvard in English [1 output]
 *   node create standard es      # Compiles strictly Standard in Spanish [1 output]
 *
 * Supported runners:
 *   node create [flags]
 *   bun ./create [flags]
 *   bun run create [flags]
 *   npm run create -- [flags]
 */

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

const args = process.argv.slice(2)

// Detect if staging directory (.temp) exists and contains staged templates
const tempDir = path.resolve(__dirname, '.temp')
const hasTemp = fs.existsSync(tempDir)

// Build final arguments to pass to generate-all-cvs.js
const forwardArgs = ['create', ...args]

// If .temp exists and user didn't explicitly override source directory, use .temp
if (hasTemp && !args.includes('--source-dir') && !args.includes('--base')) {
  forwardArgs.push('--temp')
}

const scriptPath = path.resolve(__dirname, 'generate-all-cvs.js')
const child = spawn(process.execPath, [scriptPath, ...forwardArgs], {
  stdio: 'inherit',
})

child.on('close', (code) => {
  process.exit(code || 0)
})
