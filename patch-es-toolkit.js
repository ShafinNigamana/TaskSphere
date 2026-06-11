const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, 'node_modules/.pnpm/es-toolkit@1.47.0/node_modules/es-toolkit/dist');

if (!fs.existsSync(baseDir)) {
  console.error(`Base directory does not exist: ${baseDir}`);
  process.exit(1);
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

console.log(`Scanning and patching files in ${baseDir}...`);

let patchedCount = 0;

walkDir(baseDir, filePath => {
  if (path.extname(filePath) === '.js') {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // We want to match require_ followed by a name, but not require_estoolkit_
      // Using regex: require_(?!estoolkit_)([a-zA-Z0-9_]+)
      const regex = /\brequire_(?!estoolkit_)([a-zA-Z0-9_]+)\b/g;
      
      if (regex.test(content)) {
        // Reset regex index and replace
        let newContent = content.replace(regex, 'require_estoolkit_$1');
        fs.writeFileSync(filePath, newContent, 'utf8');
        patchedCount++;
      }
    } catch (err) {
      console.error(`Error processing file ${filePath}:`, err);
    }
  }
});

console.log(`Finished patching. Total files modified: ${patchedCount}`);
