const fs = require('fs');
const path = require('path');

function scanFiles(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(scanFiles(full));
    } else if (full.endsWith('.js')) {
      results.push(full);
    }
  });
  return results;
}

const files = scanFiles('./assets');

// 1. Read capability policy
const policyCode = fs.readFileSync('./assets/core/capability-policy.js', 'utf8');
const policyLines = policyCode.split('\n');
let currentDomain = '';
const policy = {};

policyLines.forEach(l => {
  const domMatch = l.match(/'([^']+)'\s*:\s*Object\.freeze\(\[/);
  if (domMatch) {
    currentDomain = domMatch[1];
    policy[currentDomain] = [];
  }
  if (currentDomain) {
    const items = l.match(/'([^']+)'/g);
    if (items) {
      items.forEach(it => {
        const cleaned = it.replace(/'/g, '');
        if (cleaned !== currentDomain && !policy[currentDomain].includes(cleaned)) {
          policy[currentDomain].push(cleaned);
        }
      });
    }
  }
});

// 2. Check each domain file to see if all policy capabilities exist in the corresponding domain file
console.log('=== Checking Domain File Implementations ===');
const domainFileMap = {
  'ai-domain': './assets/core/ai-domain.js',
  'chapter-domain': './assets/core/chapter-domain.js',
  'dictionary-domain': './assets/core/dictionary-domain.js',
  'narrative-domain': './assets/core/narrative-domain.js',
  'school-domain': './assets/core/school-domain.js',
  'workspace-domain': './assets/core/workspace-domain.js',
  'project-domain': './assets/core/project-domain.js',
  'runtime-domain': './assets/core/runtime-domain.js',
  'settings-domain': './assets/core/settings-domain.js',
  'story-domain': './assets/core/story-domain.js'
};

for (const [dom, fns] of Object.entries(policy)) {
  const filePath = domainFileMap[dom];
  if (!filePath || !fs.existsSync(filePath)) {
    console.error(`[DOMAIN FILE MISSING] ${dom} -> ${filePath}`);
    continue;
  }
  const code = fs.readFileSync(filePath, 'utf8');
  fns.forEach(fn => {
    if (!code.includes(fn)) {
      console.warn(`[CAPABILITY NOT IN DOMAIN FILE] ${dom}.${fn} not found in ${filePath}`);
    }
  });
}

// 3. Check getFn bindings in workspace-assets-export.js
console.log('\n=== Checking getFn calls in workspace-assets-export.js ===');
const waeCode = fs.readFileSync('./assets/core/workspace-assets-export.js', 'utf8');
const getFnMatches = waeCode.matchAll(/const\s+([a-zA-Z0-9_$]+)\s*=\s*getFn\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
const waeGetFns = [];
for (const m of getFnMatches) {
  waeGetFns.push({ varName: m[1], fnName: m[2] });
}

waeGetFns.forEach(item => {
  // Search where fnName is defined or registered across all files
  let foundInFiles = [];
  files.forEach(f => {
    const code = fs.readFileSync(f, 'utf8');
    if (
      code.includes(`function ${item.fnName}`) ||
      code.includes(`${item.fnName}:`) ||
      code.includes(`window.${item.fnName}`) ||
      code.includes(`const ${item.fnName}`) ||
      code.includes(`let ${item.fnName}`)
    ) {
      foundInFiles.push(f);
    }
  });
  if (foundInFiles.length === 0) {
    console.warn(`[getFn UNBOUND] ${item.fnName} (assigned to ${item.varName}) not defined anywhere!`);
  }
});

// 4. Check event bindings in workspace-assets-export.js and long-novel-control.js
console.log('\n=== Checking UI Onclick / Event Bindings ===');
const uiFiles = ['./assets/core/workspace-assets-export.js', './assets/core/long-novel-control.js', './assets/app-legacy.js'];
uiFiles.forEach(uf => {
  if (!fs.existsSync(uf)) return;
  const code = fs.readFileSync(uf, 'utf8');
  const onclickMatches = code.matchAll(/\.onclick\s*=\s*(?:\(\)\s*=>\s*\{?|function\s*\(\)\s*\{?|\b([a-zA-Z0-9_$]+)\b)/g);
  // Check inline calls inside onclick or event listeners
  const callMatches = code.matchAll(/([a-zA-Z0-9_$]+)\s*\([^)]*\)/g);
});

// 5. Check TellMeLegacyDomains registrations across all core/ domain files
console.log('\n=== Checking TellMeLegacyDomains Registrations ===');
files.forEach(f => {
  const code = fs.readFileSync(f, 'utf8');
  if (code.includes('TellMeLegacyDomains')) {
    const regMatches = code.matchAll(/TellMeLegacyDomains(?:\?\.|\[)['"]([^'"]+)['"](?:\]\s*=\s*|\s*\?\.)/g);
    for (const rm of regMatches) {
      // console.log(`${f} accesses TellMeLegacyDomains['${rm[1]}']`);
    }
  }
});

console.log('\nCheck complete.');
