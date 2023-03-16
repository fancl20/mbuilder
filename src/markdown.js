import { marked } from 'marked';

// Rendering $$..$$ and $..$ as Latex
import * as katex from 'katex';

// Rendering local image to base64 uri
import * as fs from 'fs';
import * as mime from 'mime-types';
import * as path from 'path';

// Rendering code highlight
import * as hljs from 'highlight.js';

// Export rendering function
import * as fm from 'front-matter';

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

marked.setOptions({
  highlight: (code, language) => {
    const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
    return hljs.highlight(validLanguage, code).value;
  },
});

export function markdown(text, cwd) {
  const res = fm.default(text);
  return {
    metadata: res.attributes,
    html: marked(res.body, { cwd }),
  };
}
export default markdown;
