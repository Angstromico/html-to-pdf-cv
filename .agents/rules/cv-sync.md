# CV Synchronization and Formatting Rules

## Multi-Format Consistency
Whenever modifying or adding:
- Professional experience
- Projects
- Technical or core skills
- Education or contact data

The agent MUST update all 5 templates:
1. `index.html` (EN Standard)
2. `es/index.html` (ES Standard Long)
3. `es/index-short.html` (ES Short A4)
4. `harvard-index.html` (EN Harvard)
5. `es/harvard-index.html` (ES Harvard)

## Budget & Page Verification
- `es/index-short.html` MUST never exceed 1 page.
- `harvard-index.html` and `es/harvard-index.html` MUST balance cleanly across 2 pages.
- Always run `npm run validate` after making layout or content modifications to verify page count limits before concluding any task.
