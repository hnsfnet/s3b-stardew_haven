const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('CWD:', process.cwd());

try {
  const result = execSync('where npm 2>nul || echo no-npm', { encoding: 'utf-8' });
  console.log('npm via where:', result.trim());
} catch (e) {
  console.log('no npm in path');
}

try {
  console.log('npm root:', execSync('npm root -g 2>nul || echo fail', { encoding: 'utf-8' }).trim());
} catch (e) {
  console.log('npm root failed');
}

fs.writeFileSync(path.join(process.cwd(), '.trae-node-info.txt'), JSON.stringify({
  version: process.version,
  platform: process.platform,
  cwd: process.cwd(),
  envPATH: process.env.PATH
}, null, 2));
