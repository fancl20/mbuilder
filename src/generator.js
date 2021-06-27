const fs = require('fs');
const path = require('path');
const RewritingStream = require('parse5-html-rewriting-stream');

const markdown = require('./markdown');

module.exports = {
  async loadPageTemplate(filePath) {
    const isDivID = (id, tag) => tag.tagName === 'div'
      && tag.attrs.find((attr) => attr.name === 'id' && attr.value === id);
    const page = fs.readFileSync(filePath, { encoding: 'utf8' });
    return (navigator, content, output) => {
      const rewriter = new RewritingStream();
      rewriter.on('startTag', (tag) => {
        rewriter.emitStartTag(tag);
        if (isDivID('navigator', tag)) {
          navigator(rewriter);
        }
        if (isDivID('content', tag)) {
          content(rewriter);
        }
      });
      rewriter.pipe(output);
      rewriter.write(page);
    };
  },
  async generateNavigatorRenderer(pages) {
    const names = [];
    for await (const file of pages) {
      names.push(path.basename(file.name, path.extname(file.name)));
    }
    names.sort();
    return (current) => (rewriter) => {
      rewriter.emitStartTag({ tagName: 'ul', attrs: [] });
      for (const name of names) {
        const url = `/contents/${escape(name)}.html`;
        const attrs = [{ name: 'href', value: url }];
        if (name === current) {
          attrs.push({ name: 'class', value: 'navigator-link-active' });
        }
        rewriter.emitStartTag({ tagName: 'li', attrs: [] });
        rewriter.emitStartTag({ tagName: 'a', attrs });
        rewriter.emitText({ text: name.replace(/^\d+-/, '') });
        rewriter.emitEndTag({ tagName: 'a' });
        rewriter.emitEndTag({ tagName: 'li' });
      }
      rewriter.emitEndTag({ tagName: 'ul' });
    };
  },
  async generateMarkdownRenderer(filePath) {
    const md = fs.readFileSync(filePath, { encoding: 'utf8' });
    const res = markdown(md);
    return [
      (rewriter) => { rewriter.emitRaw(res.html); },
      res.metadata,
    ];
  },
  async generateIndexRenderer(metadatas) {
    metadatas.sort((a, b) => -a.url.localeCompare(b.url));
    return (rewriter) => {
      rewriter.emitStartTag({
        tagName: 'ul',
        attrs: [{ name: 'id', value: 'pages-index' }],
      });
      for (const metadata of metadatas) {
        rewriter.emitStartTag({ tagName: 'li', attrs: [] });

        // Title
        rewriter.emitStartTag({
          tagName: 'div', attrs: [{ name: 'id', value: 'pages-index-title' }],
        });
        rewriter.emitStartTag({
          tagName: 'a', attrs: [{ name: 'href', value: metadata.url }],
        });
        rewriter.emitText({ text: metadata.title });
        rewriter.emitEndTag({ tagName: 'a' });
        rewriter.emitEndTag({ tagName: 'div' });
        // Date
        rewriter.emitStartTag({
          tagName: 'div', attrs: [{ name: 'id', value: 'pages-index-date' }],
        });
        rewriter.emitText({ text: metadata.date.toISOString().substring(0, 10) });
        rewriter.emitEndTag({ tagName: 'div' });
        // Authors
        rewriter.emitStartTag({
          tagName: 'div', attrs: [{ name: 'id', value: 'pages-index-authors' }],
        });
        rewriter.emitText({ text: metadata.authors.join(', ') });
        rewriter.emitEndTag({ tagName: 'div' });

        rewriter.emitEndTag({ tagName: 'li' });
      }
      rewriter.emitEndTag({ tagName: 'ul' });
    };
  },
};
