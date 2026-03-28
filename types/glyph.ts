export interface GlyphInstance {
  id: string;
  signCode: string;
  name: string;
  svgContent: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  flipH: boolean;
  flipV: boolean;
}

export interface SignDefinition {
  code: string;
  name: string;
  category: string;
  svg?: string;
  width?: number;
  height?: number;
}

export type CopyPreset = 'small' | 'large' | 'wysiwyg';
