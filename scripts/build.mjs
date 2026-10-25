import { readFile, writeFile } from 'node:fs/promises';
const source = await readFile(new URL('../src/index.html', import.meta.url), 'utf8');
const output = source.replace('href="./styles.css"', 'href="./src/styles.css"').replace('src="./app.js"', 'src="./src/app.js"');
await writeFile(new URL('../index.html', import.meta.url), output);
console.log('Built root index.html with relative module paths for GitHub Pages.');
