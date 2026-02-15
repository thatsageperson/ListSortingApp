import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const serverBuildPath = resolve(process.cwd(), 'build/server/assets/server-build.js');

const serverBuild = await readFile(serverBuildPath, 'utf8');
const importsServerEntryChunk = /from\s*["']\.\/index-[^"']+\.js["']/.test(serverBuild);

if (importsServerEntryChunk) {
  console.error(
    [
      'Detected a server build cycle risk:',
      '- `build/server/assets/server-build.js` imports `./index-*.js`.',
      '- This can trigger Node unsettled top-level await warnings and restart loops.',
      'Fix by removing server-entry imports from route modules (prefer client-only dynamic imports).',
    ].join('\n')
  );
  process.exit(1);
}

console.log('OK: no server-build -> server-entry chunk import cycle detected.');
