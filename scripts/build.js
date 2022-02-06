const fs = require('fs');
const path = require('path');
const { Templater, Dora } = require('../templater');
const { ROUTES } = require('../config');

// ensure public directory exists
const public = path.join(__dirname, '../public');
if (!fs.existsSync(public)) {
  fs.mkdirSync(public);
}

function logAndCreate(content, filename) {
  const filepath = path.join(public, `${filename}.html`);
  if (fs.existsSync(filepath)) {
    console.log('INFO: file already exists ' + filepath);
  } else {
    console.log('INFO: creating file ' + filepath);
    fs.writeFileSync(filepath, content);
  }
}

ROUTES.map((page) => {
  const filePath = `./views/${page}.tmpl`
  if (Dora.find(filePath)) {
    Templater(filePath, { title: page, view: page }, (_, content) => logAndCreate(content, page));
  }
});

// filepath needs to be relative to the templater
Templater('./views/index.tmpl', { title: 'home', view: 'index' }, (_, content) => logAndCreate(content, 'index'));
Templater('./views/404.tmpl', { title: 'Page not found' }, (_, content) => logAndCreate(content, '404'));
