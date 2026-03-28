import { useState, useCallback, useEffect } from 'react';
import { GlyphInstance, SignDefinition, CopyPreset } from '../types/glyph';
import { GLYPH_LIBRARY } from '../data/glyphs';
import { generateId, composeSvgString } from '../lib/utils';

export function useGlyphEditor() {
  const [glyphs, setGlyphs] = useState<GlyphInstance[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [zoom, setZoom] = useState(0.3);
  const [currentLineOffset, setCurrentLineOffset] = useState(0);

  const isNothingSelected = selectedIds.size === 0;

  const filteredLibrary = GLYPH_LIBRARY.filter((g) =>
    g.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => setSelectedIds(new Set(glyphs.map((g) => g.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const insertGlyph = async (sign: SignDefinition) => {
    let svgContent = sign.svg || '';

    if (!svgContent) {
      try {
        const response = await fetch(`/${sign.code}.svg`);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'image/svg+xml');
        const svgElement = doc.querySelector('svg');

        if (svgElement) {
          const vBox = svgElement.getAttribute('viewBox');
          const w = svgElement.getAttribute('width');
          const h = svgElement.getAttribute('height');
          const originalViewBox = vBox ? vBox : w && h ? `0 0 ${w} ${h}` : '0 0 1800 1800';
          svgContent = `<svg viewBox="${originalViewBox}" width="1800" height="1800" preserveAspectRatio="xMidYMid meet">${svgElement.innerHTML}</svg>`;
        }
      } catch (err) {
        console.error('Failed to fetch SVG:', err);
        svgContent = '<text x="900" y="900" text-anchor="middle" font-size="200">Error</text>';
      }
    }

    const lastOnLine = glyphs.filter((g) => g.y === currentLineOffset).pop();
    const x = lastOnLine ? lastOnLine.x + 2000 : 0;

    const newGlyph: GlyphInstance = {
      id: generateId(),
      signCode: sign.code,
      name: sign.name,
      svgContent: svgContent,
      x: x,
      y: currentLineOffset,
      rotation: 0,
      scale: 1,
      flipH: false,
      flipV: false,
    };

    setGlyphs((prev) => [...prev, newGlyph]);
    setSelectedIds(new Set([newGlyph.id]));
  };

  const addLineBreak = () => setCurrentLineOffset((prev) => prev + 2200);

  const updateSelectedGlyphs = (updates: Partial<GlyphInstance>) => {
    setGlyphs(glyphs.map((g) => (selectedIds.has(g.id) ? { ...g, ...updates } : g)));
  };

  const deleteSelected = () => {
    setGlyphs(glyphs.filter((g) => !selectedIds.has(g.id)));
    setSelectedIds(new Set());
  };

  const duplicateSelected = () => {
    const selected = glyphs.filter((g) => selectedIds.has(g.id));
    const newGlyphs = selected.map((g) => ({
      ...g,
      id: generateId(),
      x: g.x + 200,
    }));
    setGlyphs([...glyphs, ...newGlyphs]);
    setSelectedIds(new Set(newGlyphs.map((g) => g.id)));
  };

  const rotateSelected = (deg: number) => {
    setGlyphs(
      glyphs.map((g) => {
        if (!selectedIds.has(g.id)) return g;
        return { ...g, rotation: (g.rotation + deg) % 360 };
      })
    );
  };

  const flipSelectedH = () => {
    const firstSelectedId = Array.from(selectedIds)[0];
    const prevFlipH = glyphs.find((g) => g.id === firstSelectedId)?.flipH;
    updateSelectedGlyphs({ flipH: !prevFlipH });
  };

  const flipSelectedV = () => {
    const firstSelectedId = Array.from(selectedIds)[0];
    const prevFlipV = glyphs.find((g) => g.id === firstSelectedId)?.flipV;
    updateSelectedGlyphs({ flipV: !prevFlipV });
  };

  const scaleSelected = (factor: number) => {
    setGlyphs(
      glyphs.map((g) => {
        if (!selectedIds.has(g.id)) return g;
        const newScale = Math.max(0.1, Math.min(3, g.scale * factor));
        return { ...g, scale: newScale };
      })
    );
  };

  const copyToClipboard = async (preset: CopyPreset) => {
    const selected = glyphs.filter((g) => selectedIds.has(g.id));
    if (selected.length === 0) return;

    const ordered = [...selected].sort((a, b) => a.x - b.x);
    const svgString = composeSvgString(ordered, preset);
    const plainText = ordered.map((g) => g.signCode).join(' ');

    try {
      const htmlBlob = new Blob([svgString], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      const item = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob,
      });
      await navigator.clipboard.write([item]);
      alert(`Copied ${ordered.length} glyph(s) as ${preset} SVG to clipboard!`);
    } catch (err) {
      console.error('Clipboard write failed:', err);
      await navigator.clipboard.writeText(plainText);
      alert('Copied plain text fallback (clipboard API restricted)');
    }
  };

  const handlePaste = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        if (item.types.includes('text/html')) {
          const blob = await item.getType('text/html');
          const html = await blob.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const svgElement = doc.querySelector('svg');

          if (svgElement) {
            const vBox = svgElement.getAttribute('viewBox');
            const w = svgElement.getAttribute('width');
            const h = svgElement.getAttribute('height');
            const originalViewBox = vBox ? vBox : w && h ? `0 0 ${w} ${h}` : '0 0 1800 1800';

            const pastedContent = `<svg viewBox="${originalViewBox}" width="1800" height="1800" preserveAspectRatio="xMidYMid meet">${svgElement.innerHTML}</svg>`;

            const newGlyph: GlyphInstance = {
              id: generateId(),
              signCode: 'PASTED',
              name: 'External SVG',
              svgContent: pastedContent,
              x: glyphs.length * 2000,
              y: currentLineOffset,
              rotation: 0,
              scale: 1,
              flipH: false,
              flipV: false,
            };

            setGlyphs((prev) => [...prev, newGlyph]);
            setSelectedIds(new Set([newGlyph.id]));
            return;
          }
        }

        if (item.types.includes('text/plain')) {
          const blob = await item.getType('text/plain');
          const text = await blob.text();
          const codes = text.split(/\s+/).filter((c) => c);

          let insertedCount = 0;
          codes.forEach((code) => {
            const sign = GLYPH_LIBRARY.find((s) => s.code === code.toUpperCase());
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
  }, [glyphs, currentLineOffset]); // Important to include dependencies that update the callback

  return {
    glyphs,
    setGlyphs,
    selectedIds,
    setSelectedIds,
    searchTerm,
    setSearchTerm,
    zoom,
    setZoom,
    currentLineOffset,
    isNothingSelected,
    filteredLibrary,
    toggleSelection,
    selectAll,
    clearSelection,
    insertGlyph,
    addLineBreak,
    deleteSelected,
    duplicateSelected,
    rotateSelected,
    flipSelectedH,
    flipSelectedV,
    scaleSelected,
    copyToClipboard,
    handlePaste,
  };
}
