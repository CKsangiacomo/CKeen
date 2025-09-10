const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../dieter/icons/svg');

let processed = 0;
fs.readdirSync(dir).forEach(file => {
  if (!file.endsWith('.svg')) return;
  const p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf8');

  // Pass 1: replace any explicit fill with currentColor
  content = content.replace(/fill="[^"]*"/g, 'fill="currentColor"');

  // Pass 2: if no fill attribute anywhere, add to root <svg>
  if (!/fill=/.test(content)) {
    content = content.replace(/<svg([^>]*)>/, '<svg$1 fill="currentColor">');
  }

  fs.writeFileSync(p, content);
  processed++;
});

console.log(`Processed ${processed} SVG files in ${dir}`);


