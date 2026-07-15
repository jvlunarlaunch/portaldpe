// Ofusca os chunks JS do próprio app após `next build`, evitando o runtime do
// Turbopack/Next (arquivos com "turbopack" no nome) para não quebrar o
// carregamento de módulos.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';
import JavaScriptObfuscator from 'javascript-obfuscator';

const OUT_DIR = join(process.cwd(), 'out');

const obfuscatorOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: false,
  debugProtectionInterval: 0,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,
  selfDefending: false,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 10,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayCallsTransformThreshold: 0.75,
  stringArrayEncoding: ['base64'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false,
};

function findJsFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...findJsFiles(fullPath));
    } else if (entry.endsWith('.js') && !entry.includes('turbopack')) {
      results.push(fullPath);
    }
  }
  return results;
}

function main() {
  const chunksDir = join(OUT_DIR, '_next', 'static', 'chunks');
  let files;
  try {
    files = findJsFiles(chunksDir);
  } catch (err) {
    console.warn(`Diretório de chunks não encontrado (${chunksDir}), pulando ofuscação.`);
    return;
  }

  console.log(`Ofuscando ${files.length} arquivo(s) JS em ${chunksDir}...`);

  for (const file of files) {
    const code = readFileSync(file, 'utf8');
    try {
      const result = JavaScriptObfuscator.obfuscate(code, obfuscatorOptions).getObfuscatedCode();
      writeFileSync(file, result, 'utf8');
    } catch (err) {
      console.error(`Falha ao ofuscar ${file}:`, err.message);
      process.exitCode = 1;
    }
  }

  console.log('Ofuscação concluída.');
}

main();
