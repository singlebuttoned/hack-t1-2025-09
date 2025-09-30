import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type TryCommand = {
  cmd: string;
  args: string[];
};

/**
 * Ensure Chrome (for Testing) is available via @puppeteer/browsers and return its executable path.
 * - Respects CHROME_PATH if provided and exists.
 * - Installs into project-local cache: front/.cache/puppeteer-browsers
 */
export function resolveChromeExecutable(): string {
  const chromePath = process.env.CHROME_PATH;

  if (
    chromePath !== undefined &&
    chromePath !== '' &&
    fs.existsSync(chromePath)
  ) {
    return chromePath;
  }

  // In ESM, __dirname is not defined. Derive it from import.meta.url.
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const cacheDir = path.resolve(
    __dirname,
    '..',
    '.cache',
    'puppeteer-browsers'
  );
  const markerFile = path.join(cacheDir, '.chrome-installed');

  if (!fs.existsSync(cacheDir) || !fs.existsSync(markerFile)) {
    fs.mkdirSync(cacheDir, { recursive: true });

    // Prefer invoking npx directly; fallback to node + npx if available next to node.
    const tryCommands: TryCommand[] = [
      {
        cmd: 'npx',
        args: [
          '@puppeteer/browsers',
          'install',
          'chrome@stable',
          '--path',
          cacheDir,
          '--quiet'
        ]
      },
      {
        cmd: process.execPath,
        args: [
          path.resolve(process.execPath, '..', 'npx'),
          '@puppeteer/browsers',
          'install',
          'chrome@stable',
          '--path',
          cacheDir,
          '--quiet'
        ]
      }
    ];

    const success = tryCommands.some(({ cmd, args }) => {
      const { status } = spawnSync(cmd, args, { stdio: 'inherit' });
      return status === 0;
    });
    if (!success) {
      throw new Error('Failed to install Chrome via @puppeteer/browsers');
    }
    fs.writeFileSync(markerFile, new Date().toISOString());
  }

  const platform = os.platform();
  const candidates: string[] = [];
  const exts = platform === 'win32' ? ['.exe'] : [''];
  const names =
    platform === 'darwin'
      ? ['Google Chrome for Testing', 'Chromium']
      : ['chrome', 'chromium'];

  const collectCandidates = (dir: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (platform === 'darwin' && entry.name.endsWith('.app')) {
          const macExecs = [
            path.join(full, 'Contents', 'MacOS', 'Google Chrome for Testing'),
            path.join(full, 'Contents', 'MacOS', 'Chromium'),
            path.join(full, 'Contents', 'MacOS', 'Google Chrome')
          ];
          for (const p of macExecs) if (fs.existsSync(p)) candidates.push(p);
        }
        collectCandidates(full);
      } else {
        for (const base of names) {
          for (const ext of exts) {
            if (entry.name === base + ext) candidates.push(full);
          }
        }
      }
    }
  };

  collectCandidates(cacheDir);

  const preferred = candidates.sort((a, b) => {
    const score = (p: string) =>
      /Google Chrome for Testing/.test(p)
        ? 3
        : /\/chrome(\.exe)?$/.test(p)
          ? 2
          : 1;
    return score(b) - score(a);
  });

  const found = preferred.find((p) => fs.existsSync(p));

  if (found === undefined) {
    throw new Error(
      'Chrome executable not found after installation in ' + cacheDir
    );
  }
  return found;
}
