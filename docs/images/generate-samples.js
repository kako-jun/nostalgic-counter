// Node.js script to generate sample counter images
const fs = require('fs');
const path = require('path');

// Simplified version matching the main SVG generator style
const generateCounterSVG = (options) => {
  const { value, type, style, digits } = options;
  const paddedValue = value.toString().padStart(digits, '0');
  
  const styles = {
    classic: {
      backgroundColor: '#000000',
      textColor: '#00ff00',
      fontFamily: 'monospace',
      fontSize: '16',
      border: '#333333'
    },
    modern: {
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14',
      border: '#666666'
    },
    retro: {
      backgroundColor: '#800080',
      textColor: '#ffff00',
      fontFamily: 'Courier New, Liberation Mono, DejaVu Sans Mono, monospace',
      fontSize: '18',
      border: '#ff00ff'
    }
  };
  
  const currentStyle = styles[style] || styles.classic;
  const width = digits * 12 + 20;
  const height = 30;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect x="0" y="0" width="${width}" height="${height}" fill="${currentStyle.backgroundColor}" stroke="${currentStyle.border}" stroke-width="1"/>
  <text x="${width / 2}" y="17" font-family="${currentStyle.fontFamily}" font-size="${currentStyle.fontSize}" fill="${currentStyle.textColor}" text-anchor="middle" font-weight="bold" dominant-baseline="middle">
    ${paddedValue}
  </text>
</svg>`;
};

// Generate sample images
const samples = [
  { value: 42, style: 'classic', file: 'classic-total.svg' },
  { value: 1234, style: 'modern', file: 'modern-today.svg' },
  { value: 789, style: 'retro', file: 'retro-week.svg' },
  { value: 123456, style: 'classic', file: 'classic-large.svg' },
  { value: 7, style: 'modern', file: 'modern-small.svg' },
  { value: 999, style: 'retro', file: 'retro-medium.svg' },
];

samples.forEach(sample => {
  const svg = generateCounterSVG({
    value: sample.value,
    type: 'total',
    style: sample.style,
    digits: 6
  });
  
  fs.writeFileSync(
    path.join(__dirname, sample.file),
    svg,
    'utf8'
  );
  console.log(`Generated ${sample.file}`);
});

console.log('All sample images generated!');