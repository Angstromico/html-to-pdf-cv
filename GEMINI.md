# Gemini AI Harness & Workspace Instructions

Welcome to the **Curriculum Vitae (CV) & Asset Generator** repository. This document serves as the primary system context, operational guide, and quality constraint specification for Gemini and Antigravity AI coding assistants operating in this repository.

---

## 1. Project Architecture & Document Inventory

This repository manages the professional profile, curriculum vitae versions, and branding assets for **Manuel Morales (Full Stack Developer)**. Documents are authored in pure HTML/CSS and compiled to PDF/DOCX using Puppeteer and Node.js/Bun.

### The 5 Core CV Documents

| Document Name | Source File | Build Command | Output File | Target Format | Page Budget |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Standard CV (English)** | `index.html` | `npm run build:cv:en` | `manuel-morales-resume.pdf` | A4 (Print margins) | 2 Pages |
| **Standard CV (Spanish)** | `es/index.html` | `npm run build:cv:es` | `manuel-morales-resume-es.pdf` | Custom 1500x2900px | 1 Long Page |
| **Short Resume (Spanish)** | `es/index-short.html` | `npm run build:cv:es:short` | `manuel-morales-resume-es-short.pdf` | A4 Compact | **Strictly 1 Page** |
| **Harvard ATS (English)** | `harvard-index.html` | `npm run build:harvard` | `manuel-morales-harvard.pdf` | US Letter (ATS standard) | 2 Pages |
| **Harvard ATS (Spanish)** | `es/harvard-index.html` | `npm run build:harvard:es` | `manuel-morales-harvard-es.pdf` | US Letter (ATS standard) | 2 Pages |

### Auxiliary Generators
- **PVC Diagram**: `npm run build:diagram` (`DiagramaTuberiasPVC.html` -> PDF & DOCX)
- **Social Banners**: `npm run generate:banner:en` / `npm run generate:banner:es`
- **Recommendation Letters**: `npm run generate:recommendation:en` / `npm run generate:recommendation:es`
- **Dashboard Web UI**: `npm run start` (Express app running on `http://localhost:4000/`)

---

## 2. The Multi-File Synchronization Contract

> [!IMPORTANT]
> **Every profile update must be synchronized across all 5 CV files.**
> Never update only one CV file unless the user explicitly requests changes for a single specific format.

When adding, updating, or removing:
1. **Work Experience**: Update in all 5 files (`index.html`, `es/index.html`, `es/index-short.html`, `harvard-index.html`, `es/harvard-index.html`).
2. **Featured Projects**: Update both English and Spanish representations.
3. **Technical & Core Skills**: Add new technologies to the corresponding list/category in all files.
4. **Contact / Personal Details**: Maintain consistency across headers and contact blocks.

### Naming & Canonical Terms
- **Current Role**: Fibex Telecom (Venezuela, Remote · Mar 2026 – Present)
- **Key Mobile Project**: "Fibex Oficina Móvil"
- **Primary Mobile Stack**: Flutter, Angular, Ionic
- **AI Acceleration**: Claude Code, Claude (AI-assisted engineering)
- **Backend Stack**: Golang, Rust, Node.js, Express, NestJS, Laravel, PostgreSQL, MongoDB

---

## 3. Strict Layout & Page Budget Constraints

### ⚠️ A4 Single-Page Constraint (`es/index-short.html`)
- The output PDF (`manuel-morales-resume-es-short.pdf`) is compiled with `pageRanges: '1'`.
- **Any content overflowing past page 1 is permanently clipped and invisible.**
- Always verify that the sidebar (`aside`) and main column (`section`) fit within the 1123px height threshold.
- If adding new skills or bullets, combine existing related entries or adjust `margin-bottom` and `padding` proportionately.

### 📄 Harvard ATS Standard (`harvard-index.html` & `es/harvard-index.html`)
- Formatted in Times New Roman, US Letter with 0.5in margins.
- Built using the XYZ achievement method ("Accomplished [X] as measured by [Y], by doing [Z]").
- Structured cleanly across **2 full pages**. Avoid leaving dangling single lines on a 3rd page.

### 🎨 Long Canvas (`es/index.html`)
- High-resolution single-page infographic format (1500px × 2900px).
- Optimized for digital sharing and full-page online preview.

---

## 4. Operational Workflow & Tooling

### Package Managers
Both **Bun** and **Node.js** are installed in the workspace environment:
- Fast builds: `bun run build:all`
- Standard: `npm run build:all`

### Available NPM Scripts
```bash
# Build & Validation
npm run build:all           # Generates all 5 CV PDFs in ~10s via single browser instance
npm run validate            # Generates all CVs and asserts page count budgets
npm test                    # Alias for validation check

# Granular CV Builders
npm run build:cv:en         # Standard English CV
npm run build:cv:es         # Standard Spanish CV (Long)
npm run build:cv:es:short   # Short Spanish CV (A4 1-Page)
npm run build:harvard       # Harvard English CV
npm run build:harvard:es    # Harvard Spanish CV

# Auxiliary
npm run build:diagram       # PVC diagram PDF & DOCX
npm run generate:banner:en  # English banner image
npm run generate:banner:es  # Spanish banner image
npm run start               # Launch local dashboard server
```

---

## 5. Gemini AI Step-by-Step Execution Protocol

Whenever fulfilling a user request to modify CVs:

1. **Plan Synchronized Edits**: Locate the exact sections in all 5 files (`index.html`, `es/index.html`, `es/index-short.html`, `harvard-index.html`, `es/harvard-index.html`).
2. **Execute Edits**: Use surgical replacements (`replace_file_content`) to preserve formatting, tags, and indentation.
3. **Execute Unified Build**: Run `npm run build:all` to compile all documents simultaneously.
4. **Validate Page Budgets**: Run `npm run validate` to confirm zero overflows on `es/index-short.html` (1 page) and Harvard templates (<= 2 pages).
5. **Git Versioning**: Create clean, professional Conventional Commits in English (`feat:`, `fix:`, `style:`, `docs:`, `chore:`).
