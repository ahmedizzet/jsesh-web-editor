import React from 'react';
import { Grid3X3 } from 'lucide-react';
import { SignDefinition } from '../types/glyph';

interface GlyphLibraryProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredLibrary: SignDefinition[];
  insertGlyph: (sign: SignDefinition) => void;
}

export const GlyphLibrary: React.FC<GlyphLibraryProps> = ({
  searchTerm,
  setSearchTerm,
  filteredLibrary,
  insertGlyph,
}) => {
  return (
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

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {filteredLibrary.map((sign) => (
          <button
            key={sign.code}
            onClick={() => insertGlyph(sign)}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
          >
            <div className="w-16 h-16 bg-gray-50 rounded flex items-center justify-center border border-gray-200 group-hover:bg-white overflow-hidden p-1">
              {sign.svg ? (
                <svg
                  viewBox={`0 0 ${sign.width || 1800} ${sign.height || 1800}`}
                  className="w-12 h-12 text-gray-800"
                  dangerouslySetInnerHTML={{ __html: sign.svg }}
                />
              ) : (
                <img src={`/${sign.code}.svg`} alt={sign.name} className="w-12 h-12 object-contain" />
              )}
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
  );
};
