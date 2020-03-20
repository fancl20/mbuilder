const marked = require('marked');
const katex = require('katex');
const fm = require('front-matter');

function mathsExpression(rawExpr) {
  if (rawExpr.match(/^\$\$[\s\S]*\$\$$/)) {
    const expr = rawExpr.substr(2, rawExpr.length - 4);
    return katex.renderToString(expr, { displayMode: true });
  } if (rawExpr.match(/^\$[\s\S]*\$$/)) {
    const expr = rawExpr.substr(1, rawExpr.length - 2);
    return katex.renderToString(expr, { isplayMode: false });
  }
  return null;
}

class Renderer extends marked.Renderer {
  code(code, lang, escaped) {
    if (!lang) {
      const math = mathsExpression(code);
      if (math) {
        return math;
      }
    }
    super.code(code, lang, escaped)
  }
  codespan(text) {
    const math = mathsExpression(text);
    if (math) {
      return math;
    }
    return super.codespan(text);
  }
}
const renderer = new Renderer();

module.exports = (text) => {
  const res = fm(text);
  return {
    metadata: res.attributes,
    html: marked(res.body, { renderer }),
  };
};
