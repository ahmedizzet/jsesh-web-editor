import React from 'react';
import {
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Trash2,
  CornerDownLeft,
} from 'lucide-react';

interface ToolbarProps {
  selectedCount: number;
  isNothingSelected: boolean;
  zoom: number;
  setZoom: (z: number | ((z: number) => number)) => void;
  selectAll: () => void;
  clearSelection: () => void;
  rotateSelected: (deg: number) => void;
  flipSelectedH: () => void;
  flipSelectedV: () => void;
  scaleSelected: (factor: number) => void;
  duplicateSelected: () => void;
  deleteSelected: () => void;
  addLineBreak: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedCount,
  isNothingSelected,
  zoom,
  setZoom,
  selectAll,
  clearSelection,
  rotateSelected,
  flipSelectedH,
  flipSelectedV,
  scaleSelected,
  duplicateSelected,
  deleteSelected,
  addLineBreak,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-3 flex items-center gap-4 flex-wrap shadow-sm">
      {/* Selection Controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Select</span>
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
        <span className="text-sm text-gray-600 ml-2">{selectedCount} selected</span>
      </div>

      <div className="w-px h-8 bg-gray-300" />

      {/* Transform Controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Transform</span>
        <button
          onClick={() => rotateSelected(90)}
          disabled={isNothingSelected}
          className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
          title="Rotate 90°"
        >
          <RotateCw size={18} />
        </button>
        <button
          onClick={() => rotateSelected(180)}
          disabled={isNothingSelected}
          className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
          title="Rotate 180°"
        >
          <RotateCw size={18} className="transform rotate-180" />
        </button>
        <button
          onClick={flipSelectedH}
          disabled={isNothingSelected}
          className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
          title="Flip Horizontal"
        >
          <FlipHorizontal size={18} />
        </button>
        <button
          onClick={flipSelectedV}
          disabled={isNothingSelected}
          className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
          title="Flip Vertical"
        >
          <FlipVertical size={18} />
        </button>
      </div>

      <div className="w-px h-8 bg-gray-300" />

      {/* Scale Controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Scale</span>
        <button
          onClick={() => scaleSelected(0.8)}
          disabled={isNothingSelected}
          className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
          title="Scale Down"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={() => scaleSelected(1.25)}
          disabled={isNothingSelected}
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
          disabled={isNothingSelected}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors flex items-center gap-1"
        >
          Duplicate
        </button>
        <button
          onClick={deleteSelected}
          disabled={isNothingSelected}
          className="p-2 bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="w-px h-8 bg-gray-300" />

      {/* Layout Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={addLineBreak}
          className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded shadow-sm transition-colors flex items-center gap-2"
          title="New Line"
        >
          <CornerDownLeft size={16} />
          New Line
        </button>
      </div>

      <div className="flex-1" />

      {/* View Controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">View</span>
        <button
          onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          <ZoomOut size={18} />
        </button>
        <span className="text-sm font-medium text-gray-700 w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          <ZoomIn size={18} />
        </button>
      </div>
    </div>
  );
};
