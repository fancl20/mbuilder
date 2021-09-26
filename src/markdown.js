const marked = require('marked');
const katex = require('katex');
const fm = require('front-matter');
const hljs = require('highlight.js');

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
  },
  renderer(token) {
    return katex.renderToString(token.formula, { displayMode: true })
  }
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
  },
  renderer(token) {
    return katex.renderToString(token.formula, { displayMode: false })
  }
};

marked.use({ extensions: [latexBlock, latexInline] })
marked.setOptions({
  highlight: (code, language) => {
    const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
    return hljs.highlight(validLanguage, code).value;
  },
});

module.exports = (text) => {
  const res = fm(text);
  return {
    metadata: res.attributes,
    html: marked(res.body),
  };
};
