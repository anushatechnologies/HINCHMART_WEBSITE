const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walk(filepath, callback);
    } else if (filepath.endsWith('.ts') || filepath.endsWith('.tsx') || filepath.endsWith('.js') || filepath.endsWith('.jsx')) {
      callback(filepath);
    }
  }
}

const srcDir = path.join(__dirname, 'src');
let replacedCount = 0;

walk(srcDir, (filepath) => {
  let content = fs.readFileSync(filepath, 'utf8');
  let original = content;

  // Pattern 1: const API = 'http://localhost:5000/api/vendors';
  content = content.replace(/const API = ['"]http:\/\/localhost:5000\/api\/vendors['"];/g, "const API = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/vendors`;");

  // Pattern 2: const API = 'http://localhost:5000/api';
  content = content.replace(/const API = ['"]http:\/\/localhost:5000\/api['"];/g, "const API = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api`;");

  // Pattern 3: const API = 'http://localhost:5000';
  content = content.replace(/const API = ['"]http:\/\/localhost:5000['"];/g, "const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';");

  // Pattern 4: fetch('http://localhost:5000/
  content = content.replace(/fetch\(['"`]http:\/\/localhost:5000([^'"`]*)['"`]/g, (match, path) => {
    return `fetch(\`\${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}${path}\``;
  });

  // Pattern 5: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}`
  content = content.replace(/process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*['"]http:\/\/localhost:5000['"]/g, "process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'");

  if (content !== original) {
    fs.writeFileSync(filepath, content, 'utf8');
    replacedCount++;
    console.log(`Updated: ${path.relative(__dirname, filepath)}`);
  }
});

console.log(`\n✅ Refactored ${replacedCount} files in hinchmart-web!`);
