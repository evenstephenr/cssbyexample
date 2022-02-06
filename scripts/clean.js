const fs = require("fs");
const path = require('path');

const public = path.join(__dirname, '../docs');
const OVERRIDES = [
  'CNAME',
];

console.log('INFO: cleaning directory ' + public);

fs.readdirSync(public).forEach(file => {
  const filepath = path.join(public, file);
  if (!OVERRIDES.includes(file)) {
    console.log('INFO: deleting file', filepath);
    fs.rm(filepath, { force: true }, () => null);
  } else {
    console.log('INFO: preserving file', filepath);
  }
});
