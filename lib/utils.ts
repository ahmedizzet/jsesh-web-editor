import { GlyphInstance, CopyPreset } from '../types/glyph';

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const createTransformString = (
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

export const composeSvgString = (
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