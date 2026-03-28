'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Copy,
  ClipboardPaste,
  Trash2,
  Grid3X3,
  Type,
  Download
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface GlyphInstance {
  id: string;
  signCode: string;
  name: string;
  svgContent: string; // Raw SVG inner content (paths, etc.)
  x: number;
  y: number;
  rotation: number;
  scale: number;
  flipH: boolean;
  flipV: boolean;
}

interface SignDefinition {
  code: string;
  name: string;
  category: string;
  svg: string; // Inner SVG content (paths)
  width: number;
  height: number;
}

type CopyPreset = 'small' | 'large' | 'wysiwyg';

// ============================================================================
// GLYPH LIBRARY (Subset of JSesh dataset)
// In production, load these dynamically from the GitHub repo
// ============================================================================

const GLYPH_LIBRARY: SignDefinition[] = [
  {
    code: 'A1',
    name: 'Seated Man',
    category: 'A. Man',
    width: 1800,
    height: 1800,
    svg: '<path d="M 900 200 C 800 200 750 300 750 400 C 750 500 800 550 850 600 L 850 900 L 600 1200 L 600 1400 L 800 1400 L 900 1100 L 1000 1400 L 1200 1400 L 1200 1200 L 950 900 L 950 600 C 1000 550 1050 500 1050 400 C 1050 300 1000 200 900 200 Z M 900 300 C 933 300 950 333 950 400 C 950 467 933 500 900 500 C 867 500 850 467 850 400 C 850 333 867 300 900 300 Z" fill="currentColor"/>'
  },
  {
    code: 'G1',
    name: 'Vulture',
    category: 'G. Birds',
    width: 1800,
    height: 1800,
    svg: '<path d="M 400 400 Q 300 200 500 150 Q 700 100 800 300 L 900 500 L 1000 300 Q 1100 100 1300 150 Q 1500 200 1400 400 Q 1300 600 1100 800 L 1100 1400 L 900 1300 L 700 1400 L 700 800 Q 500 600 400 400 Z M 600 400 Q 700 300 800 500 M 1200 400 Q 1100 300 1000 500" fill="none" stroke="currentColor" stroke-width="80" stroke-linecap="round"/><circle cx="900" cy="900" r="100" fill="currentColor"/>'
  },
  {
    code: 'G17',
    name: 'Owl',
    category: 'G. Birds',
    width: 1800,
    height: 1800,
    svg: '<ellipse cx="900" cy="1000" rx="400" ry="350" fill="currentColor"/><circle cx="750" cy="850" r="50" fill="white"/><circle cx="1050" cy="850" r="50" fill="white"/><path d="M 500 700 Q 400 500 600 400 Q 750 350 800 600 M 1300 700 Q 1400 500 1200 400 Q 1050 350 1000 600" fill="currentColor"/><path d="M 850 1100 Q 900 1150 950 1100" fill="none" stroke="white" stroke-width="40" stroke-linecap="round"/>'
  },
  {
    code: 'M17',
    name: 'Water Ripple',
    category: 'M. Trees',
    width: 1800,
    height: 1800,
    svg: '<path d="M 400 600 Q 600 400 800 600 T 1200 600 M 400 900 Q 600 700 800 900 T 1200 900 M 400 1200 Q 600 1000 800 1200 T 1200 1200" fill="none" stroke="currentColor" stroke-width="100" stroke-linecap="round"/>'
  },
  {
    code: 'N5',
    name: 'Sun',
    category: 'N. Sky',
    width: 1800,
    height: 1800,
    svg: '<circle cx="900" cy="900" r="300" fill="currentColor"/><path d="M 900 200 L 900 400 M 900 1400 L 900 1600 M 200 900 L 400 900 M 1400 900 L 1600 900 M 400 400 L 550 550 M 1250 1250 L 1400 1400 M 400 1400 L 550 1250 M 1250 550 L 1400 400" stroke="currentColor" stroke-width="100" stroke-linecap="round"/>'
  },
  {
    code: 'I9',
    name: 'Horn',
    category: 'I. Mammals',
    width: 1800,
    height: 1800,
    svg: '<path d="M 600 1200 Q 500 800 700 600 Q 900 400 1000 300 Q 1100 200 1200 250 Q 1300 300 1250 450 Q 1200 600 1100 700 Q 1000 800 1000 1200 Z" fill="currentColor"/>'
  },
  {
    code: 'D21',
    name: 'Mouth',
    category: 'D. Parts',
    width: 1800,
    height: 1800,
    svg: '<path d="M 600 700 Q 900 600 1200 700 Q 1300 900 1200 1100 Q 900 1200 600 1100 Q 500 900 600 700 Z M 700 900 Q 900 950 1100 900" fill="none" stroke="currentColor" stroke-width="80"/>'
  },
  {
    code: 'Q3',
    name: 'Stool',
    category: 'Q. Furniture',
    width: 1800,
    height: 1800,
    svg: '<path d="M 500 800 L 1300 800 L 1200 1300 L 600 1300 Z" fill="currentColor"/><path d="M 550 800 L 550 600 Q 550 500 650 500 L 1150 500 Q 1250 500 1250 600 L 1250 800" fill="none" stroke="currentColor" stroke-width="60"/>'
  },
  {
    code: 'V30',
    name: 'Basket',
    category: 'V. Rope',
    width: 1800,
    height: 1800,
    svg: '<path d="M 600 700 L 1200 700 L 1100 1200 L 700 1200 Z" fill="currentColor"/><path d="M 600 700 Q 600 600 700 600 L 1100 600 Q 1200 600 1200 700" fill="none" stroke="currentColor" stroke-width="60"/><path d="M 700 850 L 1100 850 M 720 1000 L 1080 1000" stroke="white" stroke-width="40"/>'
  },
  {
    code: 'X1',
    name: 'Bread',
    category: 'X. Food',
    width: 1800,
    height: 1800,
    svg: '<ellipse cx="900" cy="900" rx="350" ry="200" fill="currentColor"/><path d="M 600 850 Q 900 800 1200 850" fill="none" stroke="white" stroke-width="40" stroke-linecap="round"/>'
  },
  {
    code: 'Z1',
    name: 'Stroke',
    category: 'Z. Strokes',
    width: 1800,
    height: 600,
    svg: '<line x1="200" y1="300" x2="1600" y2="300" stroke="currentColor" stroke-width="150" stroke-linecap="round"/>'
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const generateId = () => Math.random().toString(36).substr(2, 9);

const createTransformString = (
  x: number,
  y: number,
  rotation: number,
  scale: number,
  flipH: boolean,
  flipV: boolean
): string => {
  // JSesh standard quadrat center
  const cx = 900;
  const cy = 900;

  const scaleX = scale * (flipH ? -1 : 1);
  const scaleY = scale * (flipV ? -1 : 1);

  // Order: translate to position -> translate to center -> rotate/scale -> translate back
  return `
    translate(${x}, ${y}) 
    translate(${cx}, ${cy}) 
    rotate(${rotation}) 
    scale(${scaleX}, ${scaleY}) 
    translate(-${cx}, -${cy})
  `.replace(/\s+/g, ' ').trim();
};

const composeSvgString = (
  glyphs: GlyphInstance[],
  preset: CopyPreset = 'large'
): string => {
  if (glyphs.length === 0) return '';

  // Calculate bounds
  const spacing = 1800;
  const totalWidth = glyphs.length * spacing;
  const height = 1800;

  // Scale factor based on preset
  let scale = 1;
  let viewBoxScale = 1;

  switch (preset) {
    case 'small':
      scale = 0.5;
      viewBoxScale = 2; // Inverse for viewBox
      break;
    case 'large':
      scale = 1;
      viewBoxScale = 1;
      break;
    case 'wysiwyg':
      scale = 1; // Use actual display scale in real implementation
      break;
  }

  const scaledWidth = totalWidth * scale;
  const scaledHeight = height * scale;

  // Build inner content
  const glyphGroups = glyphs.map((glyph, index) => {
    const x = index * spacing * scale;
    const y = 0;

    return `
      <g transform="translate(${x}, ${y}) scale(${scale})">
        ${glyph.svgContent}
      </g>
    `;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     width="${scaledWidth}" 
     height="${scaledHeight}" 
     viewBox="0 0 ${totalWidth} ${height}">
  <g fill="black" stroke="none">
    ${glyphGroups}
  </g>
</svg>`;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HieroglyphicEditor() {
  // Editor State
  const [glyphs, setGlyphs] = useState<GlyphInstance[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [zoom, setZoom] = useState(0.3); // View zoom level (not copy scale)

  const editorRef = useRef<SVGSVGElement>(null);

  // Filtered library
  const filteredLibrary = GLYPH_LIBRARY.filter(g =>
    g.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Selection helpers
  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    setSelectedIds(new Set(glyphs.map(g => g.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  // Glyph operations
  const insertGlyph = (sign: SignDefinition) => {
    const newGlyph: GlyphInstance = {
      id: generateId(),
      signCode: sign.code,
      name: sign.name,
      svgContent: sign.svg,
      x: glyphs.length * 2000, // Horizontal flow
      y: 0,
      rotation: 0,
      scale: 1,
      flipH: false,
      flipV: false
    };

    setGlyphs([...glyphs, newGlyph]);
    // Auto-select new glyph
    setSelectedIds(new Set([newGlyph.id]));
  };

  const updateSelectedGlyphs = (updates: Partial<GlyphInstance>) => {
    setGlyphs(glyphs.map(g =>
      selectedIds.has(g.id) ? { ...g, ...updates } : g
    ));
  };

  const deleteSelected = () => {
    setGlyphs(glyphs.filter(g => !selectedIds.has(g.id)));
    setSelectedIds(new Set());
  };

  const duplicateSelected = () => {
    const selected = glyphs.filter(g => selectedIds.has(g.id));
    const newGlyphs = selected.map(g => ({
      ...g,
      id: generateId(),
      x: g.x + 200 // Offset slightly
    }));
    setGlyphs([...glyphs, ...newGlyphs]);
    setSelectedIds(new Set(newGlyphs.map(g => g.id)));
  };

  // Transform handlers
  const rotateSelected = (deg: number) => {
    setGlyphs(glyphs.map(g => {
      if (!selectedIds.has(g.id)) return g;
      return { ...g, rotation: (g.rotation + deg) % 360 };
    }));
  };

  const flipSelectedH = () => {
    updateSelectedGlyphs({ flipH: !Array.from(selectedIds).map(id => glyphs.find(g => g.id === id)?.flipH)[0] });
  };

  const flipSelectedV = () => {
    updateSelectedGlyphs({ flipV: !Array.from(selectedIds).map(id => glyphs.find(g => g.id === id)?.flipV)[0] });
  };

  const scaleSelected = (factor: number) => {
    setGlyphs(glyphs.map(g => {
      if (!selectedIds.has(g.id)) return g;
      const newScale = Math.max(0.1, Math.min(3, g.scale * factor));
      return { ...g, scale: newScale };
    }));
  };

  // Clipboard Operations (CRITICAL REQUIREMENT)
  const copyToClipboard = async (preset: CopyPreset) => {
    const selected = glyphs.filter(g => selectedIds.has(g.id));
    if (selected.length === 0) return;

    // Order by x position for logical reading order
    const ordered = [...selected].sort((a, b) => a.x - b.x);

    // Generate SVG
    const svgString = composeSvgString(ordered, preset);
    const plainText = ordered.map(g => g.signCode).join(' ');

    try {
      // Create blobs for clipboard
      const htmlBlob = new Blob([svgString], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });

      const item = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob
      });

      await navigator.clipboard.write([item]);

      // Visual feedback
      alert(`Copied ${ordered.length} glyph(s) as ${preset} SVG to clipboard!`);
    } catch (err) {
      console.error('Clipboard write failed:', err);
      // Fallback
      await navigator.clipboard.writeText(plainText);
      alert('Copied plain text fallback (clipboard API restricted)');
    }
  };

  // Paste handler
  const handlePaste = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();

      for (const item of clipboardItems) {
        // Try HTML first (SVG content)
        if (item.types.includes('text/html')) {
          const blob = await item.getType('text/html');
          const html = await blob.text();

          // Parse SVG
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const svgElement = doc.querySelector('svg');

          if (svgElement) {
            // Extract glyphs - simplified: look for groups or paths
            // In full implementation, match against known glyph paths
            const paths = svgElement.querySelectorAll('path, circle, ellipse, line');

            if (paths.length > 0) {
              // Create a generic "pasted" glyph or try to match codes
              const pastedContent = Array.from(paths).map(p => p.outerHTML).join('');

              const newGlyph: GlyphInstance = {
                id: generateId(),
                signCode: 'PASTED',
                name: 'External SVG',
                svgContent: pastedContent,
                x: glyphs.length * 2000,
                y: 0,
                rotation: 0,
                scale: 1,
                flipH: false,
                flipV: false
              };

              setGlyphs(prev => [...prev, newGlyph]);
              setSelectedIds(new Set([newGlyph.id]));
              return;
            }
          }
        }

        // Fallback to plain text (sign codes)
        if (item.types.includes('text/plain')) {
          const blob = await item.getType('text/plain');
          const text = await blob.text();
          const codes = text.split(/\s+/).filter(c => c);

          let insertedCount = 0;
          codes.forEach(code => {
            const sign = GLYPH_LIBRARY.find(s => s.code === code.toUpperCase());
            if (sign) {
              setTimeout(() => insertGlyph(sign), insertedCount * 50);
              insertedCount++;
            }
          });

          if (insertedCount > 0) return;
        }
      }
    } catch (err) {
      console.error('Paste failed:', err);
      alert('Unable to paste. Ensure you have clipboard permissions.');
    }
  }, [glyphs]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        e.preventDefault();
        copyToClipboard('large');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        e.preventDefault();
        handlePaste();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, glyphs, handlePaste]);

  // Calculate viewBox for editor
  const maxX = glyphs.length > 0
    ? Math.max(...glyphs.map(g => g.x + 2000))
    : 2000;
  const viewBoxWidth = Math.max(4000, maxX);
  const viewBoxHeight = 2500;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">HieroWeb Editor</h1>
            <p className="text-slate-400 text-sm">Vector SVG Hieroglyphic Editor • JSesh-inspired</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard('small')}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Copy size={16} />
              Copy Small
            </button>
            <button
              onClick={() => copyToClipboard('large')}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Copy size={16} />
              Copy Large
            </button>
            <button
              onClick={() => copyToClipboard('wysiwyg')}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Copy size={16} />
              Copy WYSIWYG
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Glyph Library */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <Grid3X3 size={20} />
              <h2 className="font-semibold">Glyph Library</h2>
            </div>
            <input
              type="text"
              placeholder="Search signs (e.g., A1, G17)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredLibrary.map((sign) => (
              <button
                key={sign.code}
                onClick={() => insertGlyph(sign)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
              >
                <div className="w-16 h-16 bg-gray-50 rounded flex items-center justify-center border border-gray-200 group-hover:bg-white">
                  <svg
                    viewBox={`0 0 ${sign.width} ${sign.height}`}
                    className="w-12 h-12 text-gray-800"
                    dangerouslySetInnerHTML={{ __html: sign.svg }}
                  />
                </div>
                <div>
                  <div className="font-bold text-gray-900">{sign.code}</div>
                  <div className="text-xs text-gray-500">{sign.name}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Click to insert glyphs</p>
              <p>• Drag in editor to arrange</p>
              <p>• Select + Copy for SVG output</p>
            </div>
          </div>
        </aside>

        {/* Main Editor Area */}
        <main className="flex-1 flex flex-col bg-gray-100">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 p-3 flex items-center gap-4 flex-wrap shadow-sm">
            {/* Selection Controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Select
              </span>
              <button
                onClick={selectAll}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                All
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                None
              </button>
              <span className="text-sm text-gray-600 ml-2">
                {selectedIds.size} selected
              </span>
            </div>

            <div className="w-px h-8 bg-gray-300" />

            {/* Transform Controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transform
              </span>
              <button
                onClick={() => rotateSelected(90)}
                disabled={selectedIds.size === 0}
                className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                title="Rotate 90°"
              >
                <RotateCw size={18} />
              </button>
              <button
                onClick={() => rotateSelected(180)}
                disabled={selectedIds.size === 0}
                className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                title="Rotate 180°"
              >
                <RotateCw size={18} className="transform rotate-180" />
              </button>
              <button
                onClick={flipSelectedH}
                disabled={selectedIds.size === 0}
                className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                title="Flip Horizontal"
              >
                <FlipHorizontal size={18} />
              </button>
              <button
                onClick={flipSelectedV}
                disabled={selectedIds.size === 0}
                className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                title="Flip Vertical"
              >
                <FlipVertical size={18} />
              </button>
            </div>

            <div className="w-px h-8 bg-gray-300" />

            {/* Scale Controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scale
              </span>
              <button
                onClick={() => scaleSelected(0.8)}
                disabled={selectedIds.size === 0}
                className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                title="Scale Down"
              >
                <ZoomOut size={18} />
              </button>
              <button
                onClick={() => scaleSelected(1.25)}
                disabled={selectedIds.size === 0}
                className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                title="Scale Up"
              >
                <ZoomIn size={18} />
              </button>
            </div>

            <div className="w-px h-8 bg-gray-300" />

            {/* Edit Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={duplicateSelected}
                disabled={selectedIds.size === 0}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors flex items-center gap-1"
              >
                Duplicate
              </button>
              <button
                onClick={deleteSelected}
                disabled={selectedIds.size === 0}
                className="p-2 bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="flex-1" />

            {/* View Controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                View
              </span>
              <button
                onClick={() => setZoom(z => Math.max(0.1, z - 0.1))}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                <ZoomOut size={18} />
              </button>
              <span className="text-sm font-medium text-gray-700 w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(z => Math.min(2, z + 0.1))}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                <ZoomIn size={18} />
              </button>
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="flex-1 overflow-auto p-8 bg-gray-200">
            <div
              className="bg-white shadow-lg rounded-lg overflow-hidden inline-block"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                transition: 'transform 0.2s ease'
              }}
            >
              <svg
                ref={editorRef}
                width={viewBoxWidth}
                height={viewBoxHeight}
                viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                className="block"
                style={{ minWidth: viewBoxWidth, minHeight: viewBoxHeight }}
              >
                {/* Grid Background */}
                <defs>
                  <pattern id="grid" width="200" height="200" patternUnits="userSpaceOnUse">
                    <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                  </pattern>
                  <pattern id="quadrat-grid" width="1800" height="1800" patternUnits="userSpaceOnUse">
                    <rect width="1800" height="1800" fill="none" stroke="#d1d5db" strokeWidth="2" />
                    <line x1="900" y1="0" x2="900" y2="1800" stroke="#9ca3af" strokeWidth="1" strokeDasharray="10,10" />
                    <line x1="0" y1="900" x2="1800" y2="900" stroke="#9ca3af" strokeWidth="1" strokeDasharray="10,10" />
                  </pattern>
                </defs>

                <rect width="100%" height="100%" fill="url(#grid)" />
                <rect width={viewBoxWidth} height={viewBoxHeight} fill="url(#quadrat-grid)" opacity="0.5" />

                {/* Glyphs */}
                {glyphs.map((glyph) => {
                  const isSelected = selectedIds.has(glyph.id);
                  const transform = createTransformString(
                    glyph.x,
                    glyph.y,
                    glyph.rotation,
                    glyph.scale,
                    glyph.flipH,
                    glyph.flipV
                  );

                  return (
                    <g key={glyph.id} transform={transform}>
                      {/* Selection Box */}
                      {isSelected && (
                        <rect
                          x="-100"
                          y="-100"
                          width="2000"
                          height="2000"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="40"
                          strokeDasharray="100,50"
                          opacity="0.8"
                        />
                      )}

                      {/* Hit Area (invisible, larger for easier clicking) */}
                      <rect
                        x="0"
                        y="0"
                        width="1800"
                        height="1800"
                        fill="transparent"
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(glyph.id);
                        }}
                      />

                      {/* Glyph Content */}
                      <g dangerouslySetInnerHTML={{ __html: glyph.svgContent }} />

                      {/* Sign Code Label (when selected or zoomed out) */}
                      {(isSelected || zoom < 0.2) && (
                        <text
                          x="900"
                          y="-150"
                          textAnchor="middle"
                          fontSize="120"
                          fontFamily="monospace"
                          fill={isSelected ? "#3b82f6" : "#6b7280"}
                          fontWeight="bold"
                        >
                          {glyph.signCode}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Status Bar */}
          <div className="bg-white border-t border-gray-200 p-2 px-4 flex justify-between items-center text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>{glyphs.length} glyphs</span>
              <span className="text-gray-300">|</span>
              <span>Canvas: {viewBoxWidth}×{viewBoxHeight}</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handlePaste}
                className="flex items-center gap-2 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded transition-colors"
              >
                <ClipboardPaste size={16} />
                Paste (Ctrl+V)
              </button>
              <span className="text-xs text-gray-400">
                Standard Quadrat: 1800×1800
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Help Modal Trigger (simplified as footer info) */}
      <footer className="bg-slate-900 text-slate-400 text-xs p-2 text-center">
        <span className="mx-2">Click glyphs to select</span>•
        <span className="mx-2">Ctrl+C to copy as SVG</span>•
        <span className="mx-2">Ctrl+V to paste</span>•
        <span className="mx-2">Delete to remove</span>
      </footer>
    </div>
  );
}