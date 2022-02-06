const fs = require('fs');
const { ROUTES } = require('./config');

/** Bob the (.tmpl) builder */
const Bob = {
  class: {
    line: 'codeblock-line',
    caret: 'codetag-caret',
    container: 'codeblock-container',
  },
  tokens: {
    '<': '<span class="codetag-caret">&#60;</span>',
    '>': '<span class="codetag-caret">&#62;</span>',
    '/': '<span class="codetag-caret">&#47;</span>',
    'tab': '&nbsp;&nbsp;',
  },
  /** TODO: simplify spacer logic */
  padLeft (str, symbol) {
    return str;
  },
  translateRow(str) {
    if (str.match(new RegExp('[<].*"{1,}[>].*[<\/].*[>]', 'g'))) {
      let buildStr = '';
      let attr = false;
      let tag = false;
      for (let i = 0; i < str.length; i++) {
        const cur = str.charAt(i);
        if (cur === '/') {
          buildStr += `${Bob.tokens[cur]}`;
        } else if (cur === '<') {
          // edge case, first symbol in row
          if (i !== 0) {
            buildStr += '</span>';
          }
          buildStr += `${Bob.tokens[cur]}`;
          tag = true;
        } else if (cur === '>') {
          buildStr += `${Bob.tokens[cur]}`;
          // edge case, last symbol
          if (i !== (str.length - 1)) {
            buildStr += '<span class="codetag-content">'
          }
          tag = false;
        } else if (cur === ' ' && tag) {
          buildStr += '&nbsp;<span class="codetag-attr">';
        } else if (cur === '=') {
          buildStr += '</span><span class="codetag-content">=</span>'
        } else if (cur === "\"") {
          if (attr) {
            attr = false;
            buildStr += '"</span>';
          } else {
            attr = true;
            buildStr += '<span class="codetag-value">"'
          }
        } else {
          buildStr += cur;
        }
      }
      return buildStr;
    }

    if (str.match(new RegExp('(<.*>).*(<.*>)', 'g'))) {
      let buildStr = '';
      let insideTag = false;
      for (let i = 0; i < str.length; i++) {
        const cur = str.charAt(i);
        if (Bob.tokens[cur]) {
          if (cur === '<') {
            if (insideTag) {
              buildStr += '</span>';
              insideTag = false;
            } else {
              insideTag = true;
            }
          }
          if (cur === '>') {
            if (insideTag) {
              buildStr += '<span class="codetag-content">';
            }
          }
          buildStr += `${Bob.tokens[cur]}`;
        } else {
          buildStr += cur;
        }
      }
      return buildStr;
    }

    if (str.match(new RegExp('(<).*(\/>)', 'g'))) {
      let buildStr = '';
      let attr = false;
      for (let i = 0; i < str.length; i++) {
        const cur = str.charAt(i);
        if (cur !== '/' && Bob.tokens[cur]) {
          buildStr += `${Bob.tokens[cur]}`;
        } else if (cur === ' ' && str.charAt(i + 1) === '/' && str.charAt(i + 2) === '>') {
          // edge case, found end of row
          return buildStr + '</span>&nbsp;' + Bob.tokens['/'] + Bob.tokens['>'];
        } else if (cur === ' ') {
          if (!attr) {
            // first &nbsp;
            attr = true;
            buildStr += '&nbsp;<span class="codetag-attr">';
          } else {
            buildStr += '</span>&nbsp;<span class="codetag-attr">'
          }
        } else if (cur === '=') {
          buildStr += '</span><span class="codetag-content">=</span><span class="codetag-value">'
        } else {
          buildStr += cur;
        }
      }
      return buildStr;
    }

    return '';
  },
  translateTag(str) {
    let buildStr = '';
    for (let i = 0; i < str.length; i++) {
      if (Bob.tokens[str.charAt(i)]) {
        buildStr += `${Bob.tokens[str.charAt(i)]}`;
      } else {
        buildStr += str.charAt(i);
      }
    }
    return buildStr;
  },
  translateComment(str) {
    return str.replaceAll('<', '&#60;').replaceAll('>', '&#62;');
  },
  buildSnippet(tmpl) {
    const lines = tmpl.split('\n').map(l => l.trim());
    let str = `<div class="${Bob.class.container}">\n`
    let tabStep = 0;
    let tokenizedLines = lines.map((l, i) => {
      let buildStr = '';

      // CSS comment
      if (l.match(new RegExp('(\/[*]).*([*]\/)', 'g'))) {
        buildStr += '<span class="codeblock-comment">';
        buildStr += Array(tabStep).fill(Bob.tokens.tab).join('') + l;
        return buildStr + '</span>\n';
      }
      // HTML comment
      if (l.match(new RegExp('(<!--).*(-->)', 'g'))) {
        buildStr += '<span class="codeblock-comment">';
        buildStr += Array(tabStep).fill(Bob.tokens.tab).join('');
        buildStr += Bob.translateComment(l);
        return buildStr + '</span>\n';
      }
      
      // whole row
      if (l.match(new RegExp('(<.*>).*(<.*>)', 'g')) || l.match(new RegExp('(<).*(\/>)', 'g'))) {
        buildStr += '<span class="codeblock-line">';
        buildStr += Array(tabStep).fill(Bob.tokens.tab).join('');
        buildStr += Bob.translateRow(l);
        return buildStr + '</span>\n';
      }

      // close tag
      if (l.match(new RegExp('(<\/.*>)', 'g'))) {
        tabStep--;
        buildStr += '<span class="codeblock-line">';
        buildStr += Array(tabStep).fill(Bob.tokens.tab).join('');
        buildStr += Bob.translateTag(l);
        return buildStr + '</span>\n';
      }

      // open tag
      if (l.match(new RegExp('(<?.*>)', 'g'))) {
        buildStr += '<span class="codeblock-line">';
        buildStr += Array(tabStep).fill(Bob.tokens.tab).join('');
        tabStep++;
        buildStr += Bob.translateTag(l)
        return buildStr + '</span>\n';
      }

      if (l.includes('}')) {
        tabStep--;
      }

      // static content
      buildStr += '<span class="codeblock-text">';
      buildStr += Array(tabStep).fill(Bob.tokens.tab).join('') + l;

      if (l.includes('{')) {
        tabStep++;
      }
      
      return buildStr + '</span>\n';
    });

    str += tokenizedLines.join('');
    str += `</div>\n`;

    return str;
  }
}

/** Dora the (file) explora */
const Dora = {
  find(filePath) {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, {encoding:'utf8', flag:'r'})
    } else {
      return;
    }
  },
  findToken(token, content) {
    const lines = content.split('\n');
    const matches = lines
      .filter((l) => l.match(new RegExp(`(%${token}:.*%)`, 'g')))
      .map((match) => {
        let buildStr = '';
        let matches = [];
        let found = false;
        for (let i = 0; i < match.length; i++) {
          const cur = match.charAt(i);
          if (cur === '%' && !found) {
            found = true;
            buildStr += cur;
          } else if (cur === '%' && found) {
            matches.push(buildStr += cur);
            buildStr = '';
            found = false;
          } else if (found) {
            buildStr += cur;
          }
        }
        return matches;
      })
      .reduce((prev, cur) => prev.concat(cur), []);
    return matches;
  },
  /** should work for all .tmpl files etc. */
  hydrate(content) {
    let hydrated = content.toString();
    Dora.findToken('stylesheet', content).map((target) => {
      const sheetKey = target.replaceAll('%', '').trim().split(':')[1];
      const sheetTmpl = Dora.find(`./stylesheets/${sheetKey}.css`).toString();
      hydrated = hydrated.replace(target, Bob.buildSnippet(sheetTmpl));
    });

    Dora.findToken('snippet', content).map((target) => {
      const snippetKey = target.replaceAll('%', '').trim().split(':')[1];
      const snippetTmpl = Dora.find(`./snippets/${snippetKey}.html`).toString();
      hydrated = hydrated.replace(target, Bob.buildSnippet(snippetTmpl));
    });

    Dora.findToken('next', content).map((target) => {
      const nextKey = target.replaceAll('%', '').trim().split(':')[1];
      const nextTmpl = `<hr />\nNext module: <a href="${nextKey}">${nextKey}</a> | <a href="/">Home</a>`;
      hydrated = hydrated.replace(target, nextTmpl);
    });

    Dora.findToken('highlight', content).map((target) => {
      const value = target.replaceAll('%', '').trim().split(':')[1];
      const highlightTmpl = `<span class="t-highlight">${value}</span>`;
      hydrated = hydrated.replace(target, highlightTmpl);
    });

    return hydrated;
  },
}

/**
 * TODO
 *  - add snippet support for hard links in .tmpl -> [text](url)
 */
const Templater = function (filePath, options, callback) {
  // everything starts with the base template
  const template = Dora.find('./views/base.tmpl');
  // current view (route)
  const view = Dora.find(filePath);
  // ~*magic*~
  const hydrated = Dora.hydrate(view);
  // special case
  if (filePath.includes('404.tmpl')) {
    const rendered = template.toString()
      .replace('%content%', hydrated)
      .replace('%title%', options.title);

    return callback(null, rendered);
  }
  // special case
  if (filePath.includes('index.tmpl')) {
    // TODO: make this another supported template %links:some-json-file% ?
    const generatedList = ROUTES.map((route) => `<li><a href="${route}">${route}</a></li>\n`);
    const nestedContent = hydrated.toString().replace('%routes%', generatedList.join(''));
    const styleSheet = Dora.find(`./stylesheets/${options.view}.css`);

    const rendered = template.toString()
      .replace('%content%', nestedContent)
      .replace('%stylesheet%', styleSheet.toString())
      .replace('%page-title%', '')
      .replace('%title%', options.title);

    return callback(null, rendered);
  }
  // normal views
  const rendered = template.toString()
    .replace('%content%', hydrated)
    .replace('%page-title%', ': ' + options.title)
    .replace('%title%', options.title);

  return callback(null, rendered);
}

module.exports = {
  Templater,
  Dora,
}