const marked = require('marked');

// Rendering $$..$$ and $..$ as Latex
const katex = require('katex');

const latexBlock = {
  name: 'latexBlock',
  level: 'block',
  start(src) { return src.match(/\${2}\n/)?.index; },
  tokenizer(src) {
    const rule = /^\${2}\n([^]*?)\n\${2}/;
    const match = rule.exec(src);
    if (match) {
      return {
        type: 'latexBlock',
        raw: match[0],
        formula: match[1].trim(),
      };
    }
    return false;
  },
  renderer(token) {
    return katex.renderToString(token.formula, { displayMode: true });
  },
};

const latexInline = {
  name: 'latexInline',
  level: 'inline',
  start(src) { return src.match(/\$/)?.index; },
  tokenizer(src) {
    const rule = /^\$(.*?)\$/;
    const match = rule.exec(src);
    if (match) {
      return {
        type: 'latexInline',
        raw: match[0],
        formula: match[1].trim(),
      };
    }
    return false;
  },
  renderer(token) {
    return katex.renderToString(token.formula, { displayMode: false });
  },
};

marked.use({ extensions: [latexBlock, latexInline] });

// Rendering local image to base64 uri
const fs = require('fs');
const mime = require('mime-types');
const path = require('path');

const renderer = {
  image(href, title, text) {
    let filePath = href;
    if (!path.isAbsolute(filePath)) {
      filePath = path.join(this.options.cwd, filePath);
    }
    if (!fs.existsSync(filePath)) {
      return false;
    }
    const imageMime = mime.lookup(filePath);
    const imageBase64 = fs.readFileSync(filePath, 'base64');
    let out = `<img src="data:${imageMime};base64,${imageBase64}" alt="${text}" `;
    if (title) {
      out += `title="${title}" `;
    }
    out += this.options.xhtml ? '/>' : '>';
    return out;
  },
};

marked.use({ renderer });

// Rendering code highlight
const hljs = require('highlight.js');

marked.setOptions({
  highlight: (code, language) => {
    const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
    return hljs.highlight(validLanguage, code).value;
  },
});

// Export rendering function
const fm = require('front-matter');

module.exports = (text, cwd) => {
  const res = fm(text);
  return {
    metadata: res.attributes,
    html: marked(res.body, { cwd }),
  };
};
