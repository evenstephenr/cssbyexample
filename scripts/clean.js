const fs = require("fs");
const path = require('path');

const public = path.join(__dirname, '../public');
console.log('INFO: removing directory ' + public);
fs.rm(public, { recursive: true, force: true }, () => null);
