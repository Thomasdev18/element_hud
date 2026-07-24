
const colorNames = {
  AliceBlue: { r: 240, g: 248, b: 255 },
  AntiqueWhite: { r: 250, g: 235, b: 215 },
  Aqua: { r: 0, g: 255, b: 255 },
  Aquamarine: { r: 127, g: 255, b: 212 },
  Azure: { r: 240, g: 255, b: 255 },
  Beige: { r: 245, g: 245, b: 220 },
  Bisque: { r: 255, g: 228, b: 196 },
  Black: { r: 0, g: 0, b: 0 },
  BlanchedAlmond: { r: 255, g: 235, b: 205 },
  Blue: { r: 0, g: 0, b: 255 },
  BlueViolet: { r: 138, g: 43, b: 226 },
  Brown: { r: 165, g: 42, b: 42 },
  BurlyWood: { r: 222, g: 184, b: 135 },
  CadetBlue: { r: 95, g: 158, b: 160 },
  Chartreuse: { r: 127, g: 255, b: 0 },
  Chocolate: { r: 210, g: 105, b: 30 },
  Coral: { r: 255, g: 127, b: 80 },
  CornflowerBlue: { r: 100, g: 149, b: 237 },
  Cornsilk: { r: 255, g: 248, b: 220 },
  Crimson: { r: 220, g: 20, b: 60 },
  Cyan: { r: 0, g: 255, b: 255 },
  DarkBlue: { r: 0, g: 0, b: 139 },
  DarkCyan: { r: 0, g: 139, b: 139 },
  DarkGoldenRod: { r: 184, g: 134, b: 11 },
  DarkGray: { r: 169, g: 169, b: 169 },
  DarkGreen: { r: 0, g: 100, b: 0 },
  DarkKhaki: { r: 189, g: 183, b: 107 },
  DarkMagenta: { r: 139, g: 0, b: 139 },
  DarkOliveGreen: { r: 85, g: 107, b: 47 },
  DarkOrange: { r: 255, g: 140, b: 0 },
  DarkOrchid: { r: 153, g: 50, b: 204 },
  DarkRed: { r: 139, g: 0, b: 0 },
  DarkSalmon: { r: 233, g: 150, b: 122 },
  DarkSeaGreen: { r: 143, g: 188, b: 143 },
  DarkSlateBlue: { r: 72, g: 61, b: 139 },
  DarkSlateGray: { r: 47, g: 79, b: 79 },
  DarkTurquoise: { r: 0, g: 206, b: 209 },
  DarkViolet: { r: 148, g: 0, b: 211 },
  DeepPink: { r: 255, g: 20, b: 147 },
  DeepSkyBlue: { r: 0, g: 191, b: 255 },
  DimGray: { r: 105, g: 105, b: 105 },
  DodgerBlue: { r: 30, g: 144, b: 255 },
  FireBrick: { r: 178, g: 34, b: 34 },
  FloralWhite: { r: 255, g: 250, b: 240 },
  ForestGreen: { r: 34, g: 139, b: 34 },
  Fuchsia: { r: 255, g: 0, b: 255 },
  Gainsboro: { r: 220, g: 220, b: 220 },
  GhostWhite: { r: 248, g: 248, b: 255 },
  Gold: { r: 255, g: 215, b: 0 },
  GoldenRod: { r: 218, g: 165, b: 32 },
  Gray: { r: 128, g: 128, b: 128 },
  Green: { r: 0, g: 128, b: 0 },
  GreenYellow: { r: 173, g: 255, b: 47 },
  HoneyDew: { r: 240, g: 255, b: 240 },
  HotPink: { r: 255, g: 105, b: 180 },
  IndianRed: { r: 205, g: 92, b: 92 },
  Indigo: { r: 75, g: 0, b: 130 },
  Ivory: { r: 255, g: 255, b: 240 },
  Khaki: { r: 240, g: 230, b: 140 },
  Lavender: { r: 230, g: 230, b: 250 },
  LavenderBlush: { r: 255, g: 240, b: 245 },
  LawnGreen: { r: 124, g: 252, b: 0 },
  LemonChiffon: { r: 255, g: 250, b: 205 },
  LightBlue: { r: 173, g: 216, b: 230 },
  LightCoral: { r: 240, g: 128, b: 128 },
  LightCyan: { r: 224, g: 255, b: 255 },
  LightGoldenRodYellow: { r: 250, g: 250, b: 210 },
  LightGray: { r: 211, g: 211, b: 211 },
  LightGreen: { r: 144, g: 238, b: 144 },
  LightPink: { r: 255, g: 182, b: 193 },
  LightSalmon: { r: 255, g: 160, b: 122 },
  LightSeaGreen: { r: 32, g: 178, b: 170 },
  LightSkyBlue: { r: 135, g: 206, b: 250 },
  LightSlateGray: { r: 119, g: 136, b: 153 },
  LightSteelBlue: { r: 176, g: 196, b: 222 },
  LightYellow: { r: 255, g: 255, b: 224 },
  Lime: { r: 0, g: 255, b: 0 },
  LimeGreen: { r: 50, g: 205, b: 50 },
  Linen: { r: 250, g: 240, b: 230 },
  Magenta: { r: 255, g: 0, b: 255 },
  Maroon: { r: 128, g: 0, b: 0 }, // Maroon
  MediumAquaMarine: { r: 102, g: 205, b: 170 },
  MediumBlue: { r: 0, g: 0, b: 205 },
  MediumOrchid: { r: 186, g: 85, b: 211 },
  MediumPurple: { r: 147, g: 112, b: 219 },
  MediumSeaGreen: { r: 60, g: 179, b: 113 },
  MediumSlateBlue: { r: 123, g: 104, b: 238 },
  MediumSpringGreen: { r: 0, g: 250, b: 154 },
  MediumTurquoise: { r: 72, g: 209, b: 204 },
  MediumVioletRed: { r: 199, g: 21, b: 133 },
  MidnightBlue: { r: 25, g: 25, b: 112 },
  MintCream: { r: 245, g: 255, b: 250 },
  MistyRose: { r: 255, g: 228, b: 225 },
  Moccasin: { r: 255, g: 228, b: 181 },
  NavajoWhite: { r: 255, g: 222, b: 173 },
  Navy: { r: 0, g: 0, b: 128 },
  OldLace: { r: 253, g: 245, b: 230 },
  Olive: { r: 128, g: 128, b: 0 },
  OliveDrab: { r: 107, g: 142, b: 35 },
  Orange: { r: 255, g: 165, b: 0 },
  OrangeRed: { r: 255, g: 69, b: 0 },
  Orchid: { r: 218, g: 112, b: 214 },
  PaleGoldenRod: { r: 238, g: 232, b: 170 },
  PaleGreen: { r: 152, g: 251, b: 152 },
  PaleTurquoise: { r: 175, g: 238, b: 238 },
  PaleVioletRed: { r: 219, g: 112, b: 147 },
  PapayaWhip: { r: 255, g: 239, b: 213 },
  PeachPuff: { r: 255, g: 218, b: 185 },
  Peru: { r: 205, g: 133, b: 63 },
  Pink: { r: 255, g: 192, b: 203 },
  Plum: { r: 221, g: 160, b: 221 },
  PowderBlue: { r: 176, g: 224, b: 230 },
  Purple: { r: 128, g: 0, b: 128 },
  RebeccaPurple: { r: 102, g: 51, b: 153 },
  Red: { r: 255, g: 0, b: 0 },
  RosyBrown: { r: 188, g: 143, b: 143 },
  RoyalBlue: { r: 65, g: 105, b: 225 },
  SaddleBrown: { r: 139, g: 69, b: 19 },
  Salmon: { r: 250, g: 128, b: 114 },
  SandyBrown: { r: 244, g: 164, b: 96 },
  SeaGreen: { r: 46, g: 139, b: 87 },
  SeaShell: { r: 255, g: 245, b: 238 },
  Sienna: { r: 160, g: 82, b: 45 },
  Silver: { r: 192, g: 192, b: 192 },
  SkyBlue: { r: 135, g: 206, b: 235 },
  SlateBlue: { r: 106, g: 90, b: 205 },
  SlateGray: { r: 112, g: 128, b: 144 },
  Snow: { r: 255, g: 250, b: 250 },
  SpringGreen: { r: 0, g: 255, b: 127 },
  SteelBlue: { r: 70, g: 130, b: 180 },
  Tan: { r: 210, g: 180, b: 140 },
  Teal: { r: 0, g: 128, b: 128 },
  Thistle: { r: 216, g: 191, b: 216 },
  Tomato: { r: 255, g: 99, b: 71 },
  Turquoise: { r: 64, g: 224, b: 208 },
  Violet: { r: 238, g: 130, b: 238 },
  Wheat: { r: 245, g: 222, b: 179 },
  White: { r: 255, g: 255, b: 255 },
  WhiteSmoke: { r: 245, g: 245, b: 245 },
  Yellow: { r: 255, g: 255, b: 0 },
  YellowGreen: { r: 154, g: 205, b: 50 }
};




function colorWithAlpha(color: string, alpha: number): string {
  const lowerCasedColor = color.toLowerCase() as keyof typeof colorNames;
  
  if (colorNames[lowerCasedColor]) {
    const rgb = colorNames[lowerCasedColor];
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }
  
  // If color is in hex format (#RRGGBB)
  if (/^#([A-Fa-f0-9]{6})$/.test(color)) {
    const hex = color.slice(1);
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  // If color is in rgb format (rgb(r, g, b))
  if (/^rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)$/.test(color)) {
    const result = color.match(/^rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)$/);
    if (result) {
      return `rgba(${result[1]}, ${result[2]}, ${result[3]}, ${alpha})`;
    }
  }
  
  // Default to original color if format is not recognized
  return color;
}

export default colorWithAlpha;
