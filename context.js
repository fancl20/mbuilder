const fs = require('fs');
const path = require('path');

const gr = require('./generator');

class Context {
  constructor(obj) {
    Object.assign(this, obj);
  }

  static async build(rawInputBase, rawOutputBase) {
    const obj = Object();
    const inputBase = path.resolve(rawInputBase);
    obj.inputBase = inputBase;
    obj.inputContents = path.join(inputBase, 'contents');
    obj.inputTemplates = path.join(inputBase, 'templates');
    obj.inputAssets = path.join(inputBase, 'assets');

    const outputBase = path.resolve(rawOutputBase);
    obj.outputBase = outputBase;
    obj.outputContents = path.join(outputBase, 'contents');
    obj.outputAssets = path.join(outputBase, 'assets');

    const dirs = fs.opendirSync(obj.inputContents);
    const pageTemplatePath = path.join(obj.inputTemplates, 'page.html');
    obj.renderPage = await gr.loadPageTemplate(pageTemplatePath);
    obj.renderNavigator = await gr.generateNavigatorRenderer(dirs);

    return new Context(obj);
  }

  async renderFile(file, category, outputFile) {
    let output = outputFile;
    if (!output.endsWith('.html')) {
      output += '.html';
    }
    const navigator = this.renderNavigator(category);
    const inputFilePath = path.join(this.inputContents, file);
    const [content, metadata] = await gr.generateMarkdownRenderer(inputFilePath);
    const outputFilePath = path.join(this.outputContents, output);
    const f = fs.createWriteStream(outputFilePath);
    this.renderPage(navigator, content, f);
    metadata.url = path.join('/contents', output);
    return metadata;
  }

  async renderIndex(metadatas, category) {
    const navigator = this.renderNavigator(category);
    const content = await gr.generateIndexRenderer(metadatas);
    const outputFilePath = path.join(this.outputContents, `${category}.html`);
    const f = fs.createWriteStream(outputFilePath);
    this.renderPage(navigator, content, f);
  }
}
module.exports = Context;
