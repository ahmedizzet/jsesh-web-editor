'use client';

import React, { useState, useEffect } from 'react';
import { Copy, ClipboardPaste } from 'lucide-react';
import { useGlyphEditor } from '../hooks/useGlyphEditor';
import { GlyphLibrary } from '../components/GlyphLibrary';
import { Toolbar } from '../components/Toolbar';
import { EditorCanvas } from '../components/EditorCanvas';

export default function HieroglyphicEditor() {
  const editor = useGlyphEditor();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const {
    glyphs,
    selectedIds,
    searchTerm,
    setSearchTerm,
    zoom,
    setZoom,
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
  } = editor;

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
  }, [selectedIds, glyphs, handlePaste, copyToClipboard, deleteSelected]);

  // Calculate viewBox for editor
  const maxX = glyphs.length > 0 ? Math.max(...glyphs.map((g) => g.x + 2500)) : 4000;
  const maxY = glyphs.length > 0 ? Math.max(...glyphs.map((g) => g.y + 2500)) : 3000;
  const viewBoxWidth = maxX;
  const viewBoxHeight = maxY;

  if (!isMounted) return null;

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
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

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar - Glyph Library */}
        <GlyphLibrary
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredLibrary={filteredLibrary}
          insertGlyph={insertGlyph}
        />

        {/* Main Editor Area */}
        <main className="flex-1 flex flex-col min-h-0 min-w-0 bg-gray-100">
          {/* Toolbar */}
          <Toolbar
            selectedCount={selectedIds.size}
            isNothingSelected={isNothingSelected}
            zoom={zoom}
            setZoom={setZoom}
            selectAll={selectAll}
            clearSelection={clearSelection}
            rotateSelected={rotateSelected}
            flipSelectedH={flipSelectedH}
            flipSelectedV={flipSelectedV}
            scaleSelected={scaleSelected}
            duplicateSelected={duplicateSelected}
            deleteSelected={deleteSelected}
            addLineBreak={addLineBreak}
          />

          {/* SVG Canvas Area */}
          <EditorCanvas
            glyphs={glyphs}
            selectedIds={selectedIds}
            zoom={zoom}
            toggleSelection={toggleSelection}
            viewBoxWidth={viewBoxWidth}
            viewBoxHeight={viewBoxHeight}
          />

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

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs p-2 text-center">
        <span className="mx-2">Click glyphs to select</span>•
        <span className="mx-2">Ctrl+C to copy as SVG</span>•
        <span className="mx-2">Ctrl+V to paste</span>•
        <span className="mx-2">Delete to remove</span>
      </footer>
    </div>
  );
}