const fs = require("fs");
const path = require('path');

const public = path.join(__dirname, '../docs');
console.log('INFO: removing directory ' + public);
fs.rm(public, { recursive: true, force: true }, () => null);
