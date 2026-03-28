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
  svg?: string; // Optional if loading from public
  width?: number;
  height?: number;
}

type CopyPreset = 'small' | 'large' | 'wysiwyg';

// ============================================================================
// GLYPH LIBRARY (Subset of JSesh dataset)
// In production, load these dynamically from the GitHub repo
// ============================================================================

const NUMERIC_GLYPHS: SignDefinition[] = [
  { code: "200", name: "200", category: "Numbers", width: 1800, height: 1800 },
  { code: "20", name: "20", category: "Numbers", width: 1800, height: 1800 },
  { code: "2", name: "2", category: "Numbers", width: 1800, height: 1800 },
  { code: "300", name: "300", category: "Numbers", width: 1800, height: 1800 },
  { code: "30", name: "30", category: "Numbers", width: 1800, height: 1800 },
  { code: "3", name: "3", category: "Numbers", width: 1800, height: 1800 },
  { code: "400", name: "400", category: "Numbers", width: 1800, height: 1800 },
  { code: "40", name: "40", category: "Numbers", width: 1800, height: 1800 },
  { code: "4", name: "4", category: "Numbers", width: 1800, height: 1800 },
  { code: "500", name: "500", category: "Numbers", width: 1800, height: 1800 },
  { code: "50", name: "50", category: "Numbers", width: 1800, height: 1800 },
  { code: "5", name: "5", category: "Numbers", width: 1800, height: 1800 },
];

const MAN_GLYPHS_A: SignDefinition[] = [
  { code: "A100A", name: "A100A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A100B", name: "A100B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A100", name: "A100", category: "A. Man", width: 1800, height: 1800 },
  { code: "A101A", name: "A101A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A101B", name: "A101B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A101C", name: "A101C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A101D", name: "A101D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A101", name: "A101", category: "A. Man", width: 1800, height: 1800 },
  { code: "A102", name: "A102", category: "A. Man", width: 1800, height: 1800 },
  { code: "A103", name: "A103", category: "A. Man", width: 1800, height: 1800 },
  { code: "A104A", name: "A104A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A104B", name: "A104B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A104", name: "A104", category: "A. Man", width: 1800, height: 1800 },
  { code: "A105", name: "A105", category: "A. Man", width: 1800, height: 1800 },
  { code: "A107", name: "A107", category: "A. Man", width: 1800, height: 1800 },
  { code: "A108A", name: "A108A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A108", name: "A108", category: "A. Man", width: 1800, height: 1800 },
  { code: "A109A", name: "A109A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A109B", name: "A109B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A109C", name: "A109C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A109D", name: "A109D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A109E", name: "A109E", category: "A. Man", width: 1800, height: 1800 },
  { code: "A109F", name: "A109F", category: "A. Man", width: 1800, height: 1800 },
  { code: "A109G", name: "A109G", category: "A. Man", width: 1800, height: 1800 },
  { code: "A109h", name: "A109h", category: "A. Man", width: 1800, height: 1800 },
  { code: "A109", name: "A109", category: "A. Man", width: 1800, height: 1800 },
  { code: "A10A", name: "A10A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A10B", name: "A10B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A10", name: "A10", category: "A. Man", width: 1800, height: 1800 },
  { code: "A110", name: "A110", category: "A. Man", width: 1800, height: 1800 },
  { code: "A111", name: "A111", category: "A. Man", width: 1800, height: 1800 },
  { code: "A112", name: "A112", category: "A. Man", width: 1800, height: 1800 },
  { code: "A113", name: "A113", category: "A. Man", width: 1800, height: 1800 },
  { code: "A114A", name: "A114A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A114B", name: "A114B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A114", name: "A114", category: "A. Man", width: 1800, height: 1800 },
  { code: "A115", name: "A115", category: "A. Man", width: 1800, height: 1800 },
  { code: "A116A", name: "A116A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A116B", name: "A116B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A116", name: "A116", category: "A. Man", width: 1800, height: 1800 },
  { code: "A117A", name: "A117A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A117B", name: "A117B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A117", name: "A117", category: "A. Man", width: 1800, height: 1800 },
  { code: "A118", name: "A118", category: "A. Man", width: 1800, height: 1800 },
  { code: "A119A", name: "A119A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A119", name: "A119", category: "A. Man", width: 1800, height: 1800 },
  { code: "A11", name: "A11", category: "A. Man", width: 1800, height: 1800 },
  { code: "A120", name: "A120", category: "A. Man", width: 1800, height: 1800 },
  { code: "A121A", name: "A121A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A121B", name: "A121B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A121C", name: "A121C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A121", name: "A121", category: "A. Man", width: 1800, height: 1800 },
  { code: "A122", name: "A122", category: "A. Man", width: 1800, height: 1800 },
  { code: "A123", name: "A123", category: "A. Man", width: 1800, height: 1800 },
  { code: "A124", name: "A124", category: "A. Man", width: 1800, height: 1800 },
  { code: "A125", name: "A125", category: "A. Man", width: 1800, height: 1800 },
  { code: "A126", name: "A126", category: "A. Man", width: 1800, height: 1800 },
  { code: "A127", name: "A127", category: "A. Man", width: 1800, height: 1800 },
  { code: "A12A", name: "A12A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A12B", name: "A12B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A12C", name: "A12C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A12D", name: "A12D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A12", name: "A12", category: "A. Man", width: 1800, height: 1800 },
  { code: "A130", name: "A130", category: "A. Man", width: 1800, height: 1800 },
  { code: "A131A", name: "A131A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A131C", name: "A131C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A131", name: "A131", category: "A. Man", width: 1800, height: 1800 },
  { code: "A132", name: "A132", category: "A. Man", width: 1800, height: 1800 },
  { code: "A133A", name: "A133A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A133B", name: "A133B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A133", name: "A133", category: "A. Man", width: 1800, height: 1800 },
  { code: "A135A", name: "A135A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A135B", name: "A135B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A135C", name: "A135C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A135D", name: "A135D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A135E", name: "A135E", category: "A. Man", width: 1800, height: 1800 },
  { code: "A135F", name: "A135F", category: "A. Man", width: 1800, height: 1800 },
  { code: "A135", name: "A135", category: "A. Man", width: 1800, height: 1800 },
  { code: "A136", name: "A136", category: "A. Man", width: 1800, height: 1800 },
  { code: "A137", name: "A137", category: "A. Man", width: 1800, height: 1800 },
  { code: "A138", name: "A138", category: "A. Man", width: 1800, height: 1800 },
  { code: "A139A", name: "A139A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A139B", name: "A139B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A139C", name: "A139C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A139D", name: "A139D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A139", name: "A139", category: "A. Man", width: 1800, height: 1800 },
  { code: "A13A", name: "A13A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A13B", name: "A13B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A13C", name: "A13C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A13D", name: "A13D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A13E", name: "A13E", category: "A. Man", width: 1800, height: 1800 },
  { code: "A13F", name: "A13F", category: "A. Man", width: 1800, height: 1800 },
  { code: "A13G", name: "A13G", category: "A. Man", width: 1800, height: 1800 },
  { code: "A13h", name: "A13h", category: "A. Man", width: 1800, height: 1800 },
  { code: "A13I", name: "A13I", category: "A. Man", width: 1800, height: 1800 },
  { code: "A13J", name: "A13J", category: "A. Man", width: 1800, height: 1800 },
  { code: "A13K", name: "A13K", category: "A. Man", width: 1800, height: 1800 },
  { code: "A13L", name: "A13L", category: "A. Man", width: 1800, height: 1800 },
  { code: "A13M", name: "A13M", category: "A. Man", width: 1800, height: 1800 },
  { code: "A13N", name: "A13N", category: "A. Man", width: 1800, height: 1800 },
];

const MAN_GLYPHS_B: SignDefinition[] = [
  { code: "A13O", name: "A13O", category: "A. Man", width: 1800, height: 1800 },
  { code: "A13P", name: "A13P", category: "A. Man", width: 1800, height: 1800 },
  { code: "A13", name: "A13", category: "A. Man", width: 1800, height: 1800 },
  { code: "A140A", name: "A140A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A140", name: "A140", category: "A. Man", width: 1800, height: 1800 },
  { code: "A141A", name: "A141A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A141", name: "A141", category: "A. Man", width: 1800, height: 1800 },
  { code: "A142", name: "A142", category: "A. Man", width: 1800, height: 1800 },
  { code: "A143A", name: "A143A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A143", name: "A143", category: "A. Man", width: 1800, height: 1800 },
  { code: "A144", name: "A144", category: "A. Man", width: 1800, height: 1800 },
  { code: "A145", name: "A145", category: "A. Man", width: 1800, height: 1800 },
  { code: "A146", name: "A146", category: "A. Man", width: 1800, height: 1800 },
  { code: "A147", name: "A147", category: "A. Man", width: 1800, height: 1800 },
  { code: "A148", name: "A148", category: "A. Man", width: 1800, height: 1800 },
  { code: "A149", name: "A149", category: "A. Man", width: 1800, height: 1800 },
  { code: "A14A", name: "A14A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A14B", name: "A14B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A14C", name: "A14C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A14D", name: "A14D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A14E", name: "A14E", category: "A. Man", width: 1800, height: 1800 },
  { code: "A14F", name: "A14F", category: "A. Man", width: 1800, height: 1800 },
  { code: "A14G", name: "A14G", category: "A. Man", width: 1800, height: 1800 },
  { code: "A14h", name: "A14h", category: "A. Man", width: 1800, height: 1800 },
  { code: "A14I", name: "A14I", category: "A. Man", width: 1800, height: 1800 },
  { code: "A14J", name: "A14J", category: "A. Man", width: 1800, height: 1800 },
  { code: "A14", name: "A14", category: "A. Man", width: 1800, height: 1800 },
  { code: "A150", name: "A150", category: "A. Man", width: 1800, height: 1800 },
  { code: "A151", name: "A151", category: "A. Man", width: 1800, height: 1800 },
  { code: "A152", name: "A152", category: "A. Man", width: 1800, height: 1800 },
  { code: "A153A", name: "A153A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A153", name: "A153", category: "A. Man", width: 1800, height: 1800 },
  { code: "A155", name: "A155", category: "A. Man", width: 1800, height: 1800 },
  { code: "A156", name: "A156", category: "A. Man", width: 1800, height: 1800 },
  { code: "A157", name: "A157", category: "A. Man", width: 1800, height: 1800 },
  { code: "A158A", name: "A158A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A158B", name: "A158B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A158C", name: "A158C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A158D", name: "A158D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A158E", name: "A158E", category: "A. Man", width: 1800, height: 1800 },
  { code: "A158F", name: "A158F", category: "A. Man", width: 1800, height: 1800 },
  { code: "A158", name: "A158", category: "A. Man", width: 1800, height: 1800 },
  { code: "A159", name: "A159", category: "A. Man", width: 1800, height: 1800 },
  { code: "A15A", name: "A15A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A15B", name: "A15B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A15C", name: "A15C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A15", name: "A15", category: "A. Man", width: 1800, height: 1800 },
  { code: "A160", name: "A160", category: "A. Man", width: 1800, height: 1800 },
  { code: "A161", name: "A161", category: "A. Man", width: 1800, height: 1800 },
  { code: "A165A", name: "A165A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A165", name: "A165", category: "A. Man", width: 1800, height: 1800 },
  { code: "A166", name: "A166", category: "A. Man", width: 1800, height: 1800 },
  { code: "A16A", name: "A16A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A16B", name: "A16B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A16C", name: "A16C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A16", name: "A16", category: "A. Man", width: 1800, height: 1800 },
  { code: "A17A", name: "A17A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A17B", name: "A17B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A17C", name: "A17C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A17D", name: "A17D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A17", name: "A17", category: "A. Man", width: 1800, height: 1800 },
  { code: "A18", name: "A18", category: "A. Man", width: 1800, height: 1800 },
  { code: "A19", name: "A19", category: "A. Man", width: 1800, height: 1800 },
  { code: "A1A", name: "A1A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A1B", name: "A1B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A1C", name: "A1C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A1", name: "A1", category: "A. Man", width: 1800, height: 1800 },
  { code: "A20", name: "A20", category: "A. Man", width: 1800, height: 1800 },
  { code: "A21A", name: "A21A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A21B", name: "A21B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A21", name: "A21", category: "A. Man", width: 1800, height: 1800 },
  { code: "A22", name: "A22", category: "A. Man", width: 1800, height: 1800 },
  { code: "A23A", name: "A23A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A23B", name: "A23B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A23C", name: "A23C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A23D", name: "A23D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A23E", name: "A23E", category: "A. Man", width: 1800, height: 1800 },
  { code: "A23F", name: "A23F", category: "A. Man", width: 1800, height: 1800 },
  { code: "A23G", name: "A23G", category: "A. Man", width: 1800, height: 1800 },
  { code: "A23h", name: "A23h", category: "A. Man", width: 1800, height: 1800 },
  { code: "A23", name: "A23", category: "A. Man", width: 1800, height: 1800 },
  { code: "A24", name: "A24", category: "A. Man", width: 1800, height: 1800 },
  { code: "A25A", name: "A25A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A25", name: "A25", category: "A. Man", width: 1800, height: 1800 },
  { code: "A26", name: "A26", category: "A. Man", width: 1800, height: 1800 },
  { code: "A27A", name: "A27A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A27", name: "A27", category: "A. Man", width: 1800, height: 1800 },
  { code: "A28", name: "A28", category: "A. Man", width: 1800, height: 1800 },
  { code: "A29", name: "A29", category: "A. Man", width: 1800, height: 1800 },
  { code: "A2A", name: "A2A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A2", name: "A2", category: "A. Man", width: 1800, height: 1800 },
  { code: "A30", name: "A30", category: "A. Man", width: 1800, height: 1800 },
  { code: "A31A", name: "A31A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A31B", name: "A31B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A31C", name: "A31C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A31", name: "A31", category: "A. Man", width: 1800, height: 1800 },
  { code: "A32A", name: "A32A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A32B", name: "A32B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A32C", name: "A32C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A32D", name: "A32D", category: "A. Man", width: 1800, height: 1800 },
];

const MAN_GLYPHS_C: SignDefinition[] = [
  { code: "A32E", name: "A32E", category: "A. Man", width: 1800, height: 1800 },
  { code: "A32F", name: "A32F", category: "A. Man", width: 1800, height: 1800 },
  { code: "A32G", name: "A32G", category: "A. Man", width: 1800, height: 1800 },
  { code: "A32h", name: "A32h", category: "A. Man", width: 1800, height: 1800 },
  { code: "A32", name: "A32", category: "A. Man", width: 1800, height: 1800 },
  { code: "A33A", name: "A33A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A33B", name: "A33B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A33C", name: "A33C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A33D", name: "A33D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A33E", name: "A33E", category: "A. Man", width: 1800, height: 1800 },
  { code: "A33", name: "A33", category: "A. Man", width: 1800, height: 1800 },
  { code: "A34A", name: "A34A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A34B", name: "A34B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A34", name: "A34", category: "A. Man", width: 1800, height: 1800 },
  { code: "A35A", name: "A35A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A35B", name: "A35B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A35C", name: "A35C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A35D", name: "A35D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A35E", name: "A35E", category: "A. Man", width: 1800, height: 1800 },
  { code: "A35F", name: "A35F", category: "A. Man", width: 1800, height: 1800 },
  { code: "A35", name: "A35", category: "A. Man", width: 1800, height: 1800 },
  { code: "A36A", name: "A36A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A36B", name: "A36B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A36C", name: "A36C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A36", name: "A36", category: "A. Man", width: 1800, height: 1800 },
  { code: "A37", name: "A37", category: "A. Man", width: 1800, height: 1800 },
  { code: "A38", name: "A38", category: "A. Man", width: 1800, height: 1800 },
  { code: "A39", name: "A39", category: "A. Man", width: 1800, height: 1800 },
  { code: "A3A", name: "A3A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A3B", name: "A3B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A3", name: "A3", category: "A. Man", width: 1800, height: 1800 },
  { code: "A40A", name: "A40A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A40B", name: "A40B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A40C", name: "A40C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A40D", name: "A40D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A40E", name: "A40E", category: "A. Man", width: 1800, height: 1800 },
  { code: "A40F", name: "A40F", category: "A. Man", width: 1800, height: 1800 },
  { code: "A40G", name: "A40G", category: "A. Man", width: 1800, height: 1800 },
  { code: "A40h", name: "A40h", category: "A. Man", width: 1800, height: 1800 },
  { code: "A40I", name: "A40I", category: "A. Man", width: 1800, height: 1800 },
  { code: "A40", name: "A40", category: "A. Man", width: 1800, height: 1800 },
  { code: "A41", name: "A41", category: "A. Man", width: 1800, height: 1800 },
  { code: "A42A", name: "A42A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A42B", name: "A42B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A42C", name: "A42C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A42", name: "A42", category: "A. Man", width: 1800, height: 1800 },
  { code: "A43A", name: "A43A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A43B", name: "A43B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A43C", name: "A43C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A43D", name: "A43D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A43E", name: "A43E", category: "A. Man", width: 1800, height: 1800 },
  { code: "A43F", name: "A43F", category: "A. Man", width: 1800, height: 1800 },
  { code: "A43G", name: "A43G", category: "A. Man", width: 1800, height: 1800 },
  { code: "A43h", name: "A43h", category: "A. Man", width: 1800, height: 1800 },
  { code: "A43I", name: "A43I", category: "A. Man", width: 1800, height: 1800 },
  { code: "A43J", name: "A43J", category: "A. Man", width: 1800, height: 1800 },
  { code: "A43K", name: "A43K", category: "A. Man", width: 1800, height: 1800 },
  { code: "A43L", name: "A43L", category: "A. Man", width: 1800, height: 1800 },
  { code: "A43M", name: "A43M", category: "A. Man", width: 1800, height: 1800 },
  { code: "A43", name: "A43", category: "A. Man", width: 1800, height: 1800 },
  { code: "A44", name: "A44", category: "A. Man", width: 1800, height: 1800 },
  { code: "A45A", name: "A45A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A45B", name: "A45B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A45C", name: "A45C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A45D", name: "A45D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A45E", name: "A45E", category: "A. Man", width: 1800, height: 1800 },
  { code: "A45", name: "A45", category: "A. Man", width: 1800, height: 1800 },
  { code: "A46", name: "A46", category: "A. Man", width: 1800, height: 1800 },
  { code: "A47A", name: "A47A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A47B", name: "A47B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A47C", name: "A47C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A47D", name: "A47D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A47E", name: "A47E", category: "A. Man", width: 1800, height: 1800 },
  { code: "A47", name: "A47", category: "A. Man", width: 1800, height: 1800 },
  { code: "A48A", name: "A48A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A48B", name: "A48B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A48", name: "A48", category: "A. Man", width: 1800, height: 1800 },
  { code: "A49A", name: "A49A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A49", name: "A49", category: "A. Man", width: 1800, height: 1800 },
  { code: "A4A", name: "A4A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A4B", name: "A4B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A4C", name: "A4C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A4D", name: "A4D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A4", name: "A4", category: "A. Man", width: 1800, height: 1800 },
  { code: "A50A", name: "A50A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A50B", name: "A50B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A50C", name: "A50C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A50D", name: "A50D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A50E", name: "A50E", category: "A. Man", width: 1800, height: 1800 },
  { code: "A50F", name: "A50F", category: "A. Man", width: 1800, height: 1800 },
  { code: "A50G", name: "A50G", category: "A. Man", width: 1800, height: 1800 },
  { code: "A50", name: "A50", category: "A. Man", width: 1800, height: 1800 },
  { code: "A51A", name: "A51A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A51B", name: "A51B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A51C", name: "A51C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A51D", name: "A51D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A51E", name: "A51E", category: "A. Man", width: 1800, height: 1800 },
  { code: "A51F", name: "A51F", category: "A. Man", width: 1800, height: 1800 },
  { code: "A51G", name: "A51G", category: "A. Man", width: 1800, height: 1800 },
  { code: "A51", name: "A51", category: "A. Man", width: 1800, height: 1800 },
];

const MAN_GLYPHS_D: SignDefinition[] = [
  { code: "A52A", name: "A52A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A52B", name: "A52B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A52C", name: "A52C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A52D", name: "A52D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A52E", name: "A52E", category: "A. Man", width: 1800, height: 1800 },
  { code: "A52F", name: "A52F", category: "A. Man", width: 1800, height: 1800 },
  { code: "A52G", name: "A52G", category: "A. Man", width: 1800, height: 1800 },
  { code: "A52h", name: "A52h", category: "A. Man", width: 1800, height: 1800 },
  { code: "A52I", name: "A52I", category: "A. Man", width: 1800, height: 1800 },
  { code: "A52J", name: "A52J", category: "A. Man", width: 1800, height: 1800 },
  { code: "A52", name: "A52", category: "A. Man", width: 1800, height: 1800 },
  { code: "A53A", name: "A53A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A53", name: "A53", category: "A. Man", width: 1800, height: 1800 },
  { code: "A54", name: "A54", category: "A. Man", width: 1800, height: 1800 },
  { code: "A55A", name: "A55A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A55", name: "A55", category: "A. Man", width: 1800, height: 1800 },
  { code: "A56", name: "A56", category: "A. Man", width: 1800, height: 1800 },
  { code: "A57A", name: "A57A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A57B", name: "A57B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A57C", name: "A57C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A57D", name: "A57D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A57", name: "A57", category: "A. Man", width: 1800, height: 1800 },
  { code: "A58A", name: "A58A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A58B", name: "A58B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A58", name: "A58", category: "A. Man", width: 1800, height: 1800 },
  { code: "A59A", name: "A59A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A59", name: "A59", category: "A. Man", width: 1800, height: 1800 },
  { code: "A5A", name: "A5A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A5B", name: "A5B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A5", name: "A5", category: "A. Man", width: 1800, height: 1800 },
  { code: "A60A", name: "A60A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A60", name: "A60", category: "A. Man", width: 1800, height: 1800 },
  { code: "A61", name: "A61", category: "A. Man", width: 1800, height: 1800 },
  { code: "A62A", name: "A62A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A62", name: "A62", category: "A. Man", width: 1800, height: 1800 },
  { code: "A63A", name: "A63A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A63B", name: "A63B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A63", name: "A63", category: "A. Man", width: 1800, height: 1800 },
  { code: "A66", name: "A66", category: "A. Man", width: 1800, height: 1800 },
  { code: "A67", name: "A67", category: "A. Man", width: 1800, height: 1800 },
  { code: "A68", name: "A68", category: "A. Man", width: 1800, height: 1800 },
  { code: "A69", name: "A69", category: "A. Man", width: 1800, height: 1800 },
  { code: "A6A", name: "A6A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A6B", name: "A6B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A6C", name: "A6C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A6D", name: "A6D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A6E", name: "A6E", category: "A. Man", width: 1800, height: 1800 },
  { code: "A6F", name: "A6F", category: "A. Man", width: 1800, height: 1800 },
  { code: "A6G", name: "A6G", category: "A. Man", width: 1800, height: 1800 },
  { code: "A6h", name: "A6h", category: "A. Man", width: 1800, height: 1800 },
  { code: "A6I", name: "A6I", category: "A. Man", width: 1800, height: 1800 },
  { code: "A6J", name: "A6J", category: "A. Man", width: 1800, height: 1800 },
  { code: "A6K", name: "A6K", category: "A. Man", width: 1800, height: 1800 },
  { code: "A6L", name: "A6L", category: "A. Man", width: 1800, height: 1800 },
  { code: "A6", name: "A6", category: "A. Man", width: 1800, height: 1800 },
  { code: "A71", name: "A71", category: "A. Man", width: 1800, height: 1800 },
  { code: "A72A", name: "A72A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A72", name: "A72", category: "A. Man", width: 1800, height: 1800 },
  { code: "A73A", name: "A73A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A73B", name: "A73B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A73", name: "A73", category: "A. Man", width: 1800, height: 1800 },
  { code: "A74", name: "A74", category: "A. Man", width: 1800, height: 1800 },
  { code: "A75", name: "A75", category: "A. Man", width: 1800, height: 1800 },
  { code: "A76A", name: "A76A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A76B", name: "A76B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A76C", name: "A76C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A76D", name: "A76D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A76", name: "A76", category: "A. Man", width: 1800, height: 1800 },
  { code: "A77", name: "A77", category: "A. Man", width: 1800, height: 1800 },
  { code: "A78", name: "A78", category: "A. Man", width: 1800, height: 1800 },
  { code: "A7A", name: "A7A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A7", name: "A7", category: "A. Man", width: 1800, height: 1800 },
  { code: "A80A", name: "A80A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A80B", name: "A80B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A80", name: "A80", category: "A. Man", width: 1800, height: 1800 },
  { code: "A81A", name: "A81A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A81B", name: "A81B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A81", name: "A81", category: "A. Man", width: 1800, height: 1800 },
  { code: "A82", name: "A82", category: "A. Man", width: 1800, height: 1800 },
  { code: "A83", name: "A83", category: "A. Man", width: 1800, height: 1800 },
  { code: "A84", name: "A84", category: "A. Man", width: 1800, height: 1800 },
  { code: "A85", name: "A85", category: "A. Man", width: 1800, height: 1800 },
  { code: "A86", name: "A86", category: "A. Man", width: 1800, height: 1800 },
  { code: "A87A", name: "A87A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A87", name: "A87", category: "A. Man", width: 1800, height: 1800 },
  { code: "A88", name: "A88", category: "A. Man", width: 1800, height: 1800 },
  { code: "A89", name: "A89", category: "A. Man", width: 1800, height: 1800 },
  { code: "A8A", name: "A8A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A8", name: "A8", category: "A. Man", width: 1800, height: 1800 },
  { code: "A90A", name: "A90A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A90B", name: "A90B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A90C", name: "A90C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A90D", name: "A90D", category: "A. Man", width: 1800, height: 1800 },
  { code: "A90", name: "A90", category: "A. Man", width: 1800, height: 1800 },
  { code: "A91", name: "A91", category: "A. Man", width: 1800, height: 1800 },
  { code: "A92", name: "A92", category: "A. Man", width: 1800, height: 1800 },
  { code: "A93", name: "A93", category: "A. Man", width: 1800, height: 1800 },
  { code: "A94", name: "A94", category: "A. Man", width: 1800, height: 1800 },
  { code: "A95", name: "A95", category: "A. Man", width: 1800, height: 1800 },
  { code: "A96A", name: "A96A", category: "A. Man", width: 1800, height: 1800 },
];

const MAN_GLYPHS_E: SignDefinition[] = [
  { code: "A96", name: "A96", category: "A. Man", width: 1800, height: 1800 },
  { code: "A97", name: "A97", category: "A. Man", width: 1800, height: 1800 },
  { code: "A98", name: "A98", category: "A. Man", width: 1800, height: 1800 },
  { code: "A99", name: "A99", category: "A. Man", width: 1800, height: 1800 },
  { code: "A9A", name: "A9A", category: "A. Man", width: 1800, height: 1800 },
  { code: "A9B", name: "A9B", category: "A. Man", width: 1800, height: 1800 },
  { code: "A9C", name: "A9C", category: "A. Man", width: 1800, height: 1800 },
  { code: "A9", name: "A9", category: "A. Man", width: 1800, height: 1800 },
];

const GLYPH_LIBRARY: SignDefinition[] = [
  ...NUMERIC_GLYPHS,
  ...MAN_GLYPHS_A,
  ...MAN_GLYPHS_B,
  ...MAN_GLYPHS_C,
  ...MAN_GLYPHS_D,
  ...MAN_GLYPHS_E,
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
  const cx = 1800;
  const cy = 1800;

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

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

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
  const insertGlyph = async (sign: SignDefinition) => {
    let svgContent = sign.svg || '';

    // Fetch if missing
    if (!svgContent) {
      try {
        const response = await fetch(`/${sign.code}.svg`);
        const text = await response.text();
        // Extract inner content from <svg>...</svg>
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'image/svg+xml');
        const svgElement = doc.querySelector('svg');
        if (svgElement) {
          svgContent = svgElement.innerHTML;
        }
      } catch (err) {
        console.error('Failed to fetch SVG:', err);
        svgContent = '<text x="500" y="1000" font-size="200">Error</text>';
      }
    }

    const newGlyph: GlyphInstance = {
      id: generateId(),
      signCode: sign.code,
      name: sign.name,
      svgContent: svgContent,
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
                <div className="w-16 h-16 bg-gray-50 rounded flex items-center justify-center border border-gray-200 group-hover:bg-white overflow-hidden p-1">
                  {sign.svg ? (
                    <svg
                      viewBox={`0 0 ${sign.width || 1800} ${sign.height || 1800}`}
                      className="w-12 h-12 text-gray-800"
                      dangerouslySetInnerHTML={{ __html: sign.svg }}
                    />
                  ) : (
                    <img
                      src={`/${sign.code}.svg`}
                      alt={sign.name}
                      className="w-12 h-12 object-contain"
                    />
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
                disabled={!isMounted || selectedIds.size === 0}
                className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                title="Rotate 90°"
              >
                <RotateCw size={18} />
              </button>
              <button
                onClick={() => rotateSelected(180)}
                disabled={!isMounted || selectedIds.size === 0}
                className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                title="Rotate 180°"
              >
                <RotateCw size={18} className="transform rotate-180" />
              </button>
              <button
                onClick={flipSelectedH}
                disabled={!isMounted || selectedIds.size === 0}
                className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                title="Flip Horizontal"
              >
                <FlipHorizontal size={18} />
              </button>
              <button
                onClick={flipSelectedV}
                disabled={!isMounted || selectedIds.size === 0}
                className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                title="Flip Vertical"
              >
                <FlipVertical size={18} />
              </button>
            </div>

            <div className="w-px h-8 bg-gray-300" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scale
              </span>
              <button
                onClick={() => scaleSelected(0.8)}
                disabled={!isMounted || selectedIds.size === 0}
                className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                title="Scale Down"
              >
                <ZoomOut size={18} />
              </button>
              <button
                onClick={() => scaleSelected(1.25)}
                disabled={!isMounted || selectedIds.size === 0}
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
                disabled={!isMounted || selectedIds.size === 0}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors flex items-center gap-1"
              >
                Duplicate
              </button>
              <button
                onClick={deleteSelected}
                disabled={!isMounted || selectedIds.size === 0}
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