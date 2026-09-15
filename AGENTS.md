# Agent Operational Guide & Synchronization Rules

This file provides system instructions for AI coding agents (Antigravity, Gemini, Claude Code, Cursor, Codex) working within this repository.

For the comprehensive Gemini-specific harness, refer to [GEMINI.md](file:///C:/Users/Manuel%20Morales/Repos/HTML/html-to-pdf-cv/GEMINI.md).

---

## Core Rules for Autonomous Agents

1. **Keep all 5 CVs in Sync**:
   Every change in profile, skills, experience, or projects must be applied across:
   - `index.html` (EN Standard)
   - `es/index.html` (ES Standard Long)
   - `es/index-short.html` (ES Short A4)
   - `harvard-index.html` (EN Harvard ATS)
   - `es/harvard-index.html` (ES Harvard ATS)

2. **Single-Page A4 Budget for `es/index-short.html`**:
   The short resume must strictly fit on a single page (`pageRanges: '1'`). Never introduce content that pushes the document beyond 1 page without adjusting font/margins.

3. **Harvard ATS Format (`harvard-index.html` & `es/harvard-index.html`)**:
   Keep within a clean 2-page boundary. Maintain the XYZ impact phrasing format.

4. **Fast Build & Validation**:
   Use `npm run build:all` to compile all 5 CV PDFs via a single shared Puppeteer instance in ~10 seconds.
   Use `npm test` or `npm run validate` to assert that zero page count overflows exist.

5. **Commit Standard**:
   Write conventional, professional Git commits in English describing what changed and why.
