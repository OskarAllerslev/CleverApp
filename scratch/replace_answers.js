import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectDir = path.join(__dirname, '..');

const targets = [
  {
    file: 'src/content/docs/tal-og-algebra/broeker.mdx',
    replacements: [
      { from: 'answer: "$\\\\frac{7}{12}$",', to: 'correctIndex: 0,' },
      { from: 'answer: "$\\\\frac{2}{3}$",', to: 'correctIndex: 1,' },
      { from: 'answer: "$\\\\frac{16}{5}$",', to: 'correctIndex: 2,' }
    ]
  },
  {
    file: 'src/content/docs/tal-og-algebra/ligninger.mdx',
    replacements: [
      { from: 'answer: "$x = 8$",', to: 'correctIndex: 0,' },
      { from: 'answer: "$x > -2$",', to: 'correctIndex: 0,' },
      { from: 'answer: "$x = 4$ eller $x = -5$",', to: 'correctIndex: 0,' }
    ]
  },
  {
    file: 'src/content/docs/tal-og-algebra/potens-og-rod.mdx',
    replacements: [
      { from: 'answer: "$2$",', to: 'correctIndex: 0,' },
      { from: 'answer: "$\\\\frac{1}{3}$",', to: 'correctIndex: 0,' },
      { from: 'answer: "$2\\\\sqrt{3}$",', to: 'correctIndex: 0,' }
    ]
  }
];

targets.forEach(t => {
  const filePath = path.join(projectDir, t.file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  t.replacements.forEach(r => {
    if (!content.includes(r.from)) {
      console.warn(`Warning: Could not find target text in ${t.file}: "${r.from}"`);
    }
    content = content.replace(r.from, r.to);
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully updated ${t.file}`);
  } else {
    console.log(`No changes/no further updates needed for ${t.file}`);
  }
});
