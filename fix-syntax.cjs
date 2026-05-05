const fs = require('fs');
let c = fs.readFileSync('admin.js', 'utf-8');

// Replace \` with `
c = c.replace(/\\`/g, '`');

// Replace \$ with $
c = c.replace(/\\\$/g, '$');

fs.writeFileSync('admin.js', c);
console.log('Fixed admin.js syntax');
