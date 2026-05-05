const fs = require('fs');
const path = require('path');

const dirs = ['ignite', 'oxbar', 'elf-bar', 'lost-mary', 'nikbar', 'placeholders'];

dirs.forEach(d => {
  const dirPath = path.join(__dirname, 'public', 'products', d);
  fs.mkdirSync(dirPath, { recursive: true });
  
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="#0a0a0f"/>
    <rect width="380" height="380" x="10" y="10" fill="none" stroke="#a855f7" stroke-width="2" rx="12" stroke-dasharray="10,10"/>
    <text x="50%" y="50%" font-family="sans-serif" font-size="32" font-weight="bold" fill="#ec4899" text-anchor="middle" dominant-baseline="middle">
      ${d.toUpperCase()}
    </text>
  </svg>`;
  
  const fileName = d === 'placeholders' ? 'generic-product.svg' : 'default.svg';
  fs.writeFileSync(path.join(dirPath, fileName), svgContent);
});

console.log("Placeholders created successfully!");
