const fs = require('fs-extra');
const path = require('path');

async function renderCategory(context, category) {
  const inputPath = path.join(context.inputContents, category);
  const outputPath = path.join(context.outputContents, category);
  fs.mkdirSync(outputPath, { recursive: true });
  const metadatas = [];
  for await (const sub of fs.opendirSync(inputPath)) {
    let file = path.join(category, sub.name);
    if (sub.isDirectory()) {
      file = path.join(file, `${sub.name}.md`);
    }
    const output = path.join(category, path.basename(sub.name, '.md'));
    const metadata = await context.renderFile(file, category, output);
    metadatas.push(metadata);
  }
  context.renderIndex(metadatas, category);
}

async function copyAssets(context) {
  if (fs.existsSync(context.inputAssets)) {
    fs.copy(context.inputAssets, context.outputAssets, { overwrite: true });
  }
  const css = path.join(context.outputAssets, 'css');
  fs.mkdirSync(css, { recursive: true });
  const katexDir = path.dirname(require.resolve('katex'));
  fs.copy(path.join(katexDir, 'katex.min.css'), path.join(css, 'katex.min.css'));
  fs.copy(path.join(katexDir, 'fonts'), path.join(css, 'fonts'));
}

module.exports = async (context) => {
  const dirs = fs.opendirSync(context.inputContents);
  fs.mkdirSync(context.outputContents, { recursive: true });
  for await (const file of dirs) {
    const category = path.basename(file.name, '.md');
    if (file.isDirectory()) {
      const output = path.join(context.outputContents, category);
      fs.mkdirSync(output, { recursive: true });
      renderCategory(context, category);
    } else {
      context.renderFile(file.name, category, category);
    }
  }
  fs.copy(
    path.join(context.inputBase, 'index.html'),
    path.join(context.outputBase, 'index.html')
  );
  copyAssets(context);
};
