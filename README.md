# HieroWeb Editor

A modern, web-based vector SVG hieroglyphic editor inspired by JSesh. This project is built utilizing Next.js, React, and Tailwind CSS, and provides an interactive canvas to browse and assemble Egyptian hieroglyphs.

---

## 🎨 Features & Functions

- **Interactive Canvas Area**: A robust drag-and-drop styled SVG editor that handles visual transformations including scaling, rotating, flipping, selecting, deleting, and positioning elements freely on a gridded quadrat plane.
- **Glyph Library**: Real-time browsing and filtering of hundreds of common hieroglyphic signs (categorized by standard codes like `A1`, `G17`, `200`, etc.).
- **Rich SVG Output**: Capable of composing complex groups of signs and copying them to the clipboard natively as pure inline SVG data, making it highly portable.
- **Multiple Export Presets**: Export to clipboard in `small` or `large` SVG resolutions, or match the exact WYSIWYG view.
- **Keyboard Shortcuts**: Native support for typical editor workflows (Ctrl/Cmd+C for copying, Ctrl/Cmd+V for pasting standard SVG or JSesh encoding patterns, Delete/Backspace for clearing selection).

---

## 📁 File Structure

The project has recently been refactored into a modular architecture to enforce separation of concerns, improve reusability, and simplify long-term maintainability.

```text
jsesh-web-editor/
├── app/
│   └── page.tsx                # Main entrypoint and UI orchestration container.
├── components/
│   ├── EditorCanvas.tsx        # The SVG canvas handling the quadrat grid and glyph rendering.
│   ├── GlyphLibrary.tsx        # The interactive sidebar containing the searchable dataset.
│   └── Toolbar.tsx             # Upper control strip handling operations (Rotate, Flip, Scale, etc).
├── data/
│   └── glyphs.ts               # The massive static library dataset holding SVGs and categorization.
├── hooks/
│   └── useGlyphEditor.ts       # Custom React hook encapsulating all state logic, actions, and clipboard management.
├── lib/
│   └── utils.ts                # Pure functional utilities (ID generation, SVG path compilation, etc).
├── types/
│   └── glyph.ts                # Shared TypeScript definitions (SignDefinition, GlyphInstance).
└── public/                     # (Optional) Dynamically loaded SVG assets resolving fallback rendering.
```

---

## 🏗️ Architecture Summary

1. **State Management**: The core engine of the application exists within the `useGlyphEditor` hook. Centralizing the state minimizes erratic prop drubbing and ensures the DOM strictly renders what the internal business logic calculates.
2. **Data Model**: Every sign on the canvas is represented as a `GlyphInstance` which possesses its own unique mathematical transform vector (x, y, scale, rotation, flip status).
3. **SVG Rendering Pipeline**: Instead of relying on HTML elements with CSS transforms, the editor deeply leverages native `<svg>` and `<g>` manipulation matrices. This guarantees that exported outputs render identically to the user's interactive view because the structural mathematics strictly reflect SVG standards.
4. **Copy/Paste Logistics**: A custom fallback integration utilizes `ClipboardItem` capabilities to inject encoded XML vectors into the clipboard while preserving plaintext equivalents (e.g., standard MD codes or sign names) as a clean fallback mechanism. 

---

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
