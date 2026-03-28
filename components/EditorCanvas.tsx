import React, { useRef } from 'react';
import { GlyphInstance } from '../types/glyph';
import { createTransformString } from '../lib/utils';

interface EditorCanvasProps {
  glyphs: GlyphInstance[];
  selectedIds: Set<string>;
  zoom: number;
  toggleSelection: (id: string) => void;
  viewBoxWidth: number;
  viewBoxHeight: number;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  glyphs,
  selectedIds,
  zoom,
  toggleSelection,
  viewBoxWidth,
  viewBoxHeight,
}) => {
  const editorRef = useRef<SVGSVGElement>(null);

  return (
    <div className="flex-1 overflow-auto bg-gray-200 custom-scrollbar">
      <div className="min-w-full min-h-full flex p-16" style={{ padding: '64px' }}>
        <div
          className="bg-white shadow-2xl rounded-lg overflow-hidden m-auto flex-shrink-0"
          style={{
            width: viewBoxWidth * zoom,
            height: viewBoxHeight * zoom,
            transition: 'width 0.2s ease, height 0.2s ease',
          }}
        >
          <svg
            ref={editorRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            className="block"
            fill="black"
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

                  {/* Hit Area */}
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

                  {/* Sign Code Label */}
                  {(isSelected || zoom < 0.2) && (
                    <text
                      x="900"
                      y="-150"
                      textAnchor="middle"
                      fontSize="120"
                      fontFamily="monospace"
                      fill={isSelected ? '#3b82f6' : '#6b7280'}
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
    </div>
  );
};
