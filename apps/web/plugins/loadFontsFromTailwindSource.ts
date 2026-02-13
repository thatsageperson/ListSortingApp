import { kebabCase, startCase, toLower } from 'lodash';
import type { HtmlTagDescriptor, PluginOption } from 'vite';
import fs from 'node:fs';
import fg from 'fast-glob';

// Add font entries as needed, e.g. ['inter', 'Inter']
const GOOGLE_FONTS = new Map<string, string>();

// all combinations of font weights and styles
// @see https://developers.google.com/fonts/docs/css2#api_url_specification
const styleString =
  '0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900';

/** Returns the Google Fonts CSS2 URL for a font family with all weights/styles. */
const getFontURL = (font: string) => {
  return `https://fonts.googleapis.com/css2?${`family=${font.replaceAll(' ', '+')}:ital,wght@${styleString}`}&display=block`;
};

const fontBlacklist = new Set([
  'sans',
  'serif',
  'mono',
  'thin',
  'extralight',
  'light',
  'normal',
  'medium',
  'semibold',
  'bold',
  'extrabold',
  'bolder',
  'black',
]);

/** Extracts font-* Tailwind class names from source code and maps them to Google Font names. */
const extractFonts = (code: string) => {
  // Regular expression to match class names starting with "font-" that appear
  // inside class attributes
  const [fontRegex1, fontRegex2] = [/\bfont-(?:\w*)(?:-\w*)*\b/g, /\bfont\-\[(?:[^\]]+)\]/g];

  // Find all class attributes
  const fontsUsed = new Set<string>();

  // For each class attribute, extract the "font-" prefixed classes
  const fontMatches = code.match(fontRegex1) ?? [];
  for (const fontClass of fontMatches) {
    if (!fontBlacklist.has(fontClass)) {
      fontsUsed.add(fontClass.replace('font-', ''));
    }
  }
  const familyMatches = code.match(fontRegex2) ?? [];
  for (const family of familyMatches) {
    // Extract the font name from the match
    const fontName = family
      .replaceAll('font-[', '')
      .replaceAll(']', '')
      .replaceAll(/['"]/g, '')
      .replaceAll(/_/g, ' ');
    if (!fontBlacklist.has(fontName)) {
      fontsUsed.add(fontName.toLowerCase().replaceAll(' ', '-'));
    }
  }

  const fonts = [...fontsUsed]
    .map((f) => GOOGLE_FONTS.get(f) ?? null)
    .filter((f): f is string => f !== null);
  return fonts.sort((a, b) => a.localeCompare(b));
};

const EMPTY_LOAD_FONTS = `
  export function LoadFonts() { return null; }
  export default LoadFonts;
`;

/** Vite plugin that discovers font-* usage in source and injects Google Font links via virtual:load-fonts.jsx. */
export function loadFontsFromTailwindSource(): PluginOption {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasNoFonts = GOOGLE_FONTS.size === 0;

  // In production or when no fonts are configured, skip scanning entirely
  // but still provide the virtual module so imports don't break.
  if (isProduction || hasNoFonts) {
    return {
      name: 'load-fonts-noop',
      resolveId(id) {
        if (id === 'virtual:load-fonts.jsx') return id;
      },
      load(id) {
        if (id === 'virtual:load-fonts.jsx') return EMPTY_LOAD_FONTS;
      },
    };
  }

  // Store collected font names
  const collectedFonts = new Set<string>();

  // File-level cache with modification time tracking
  const fileCache = new Map<string, {
    fonts: string[];
    mtimeMs: number;
  }>();

  /** Clears the collected fonts set and cache. */
  const reset = () => {
    collectedFonts.clear();
    fileCache.clear();
  };

  /** Rebuilds collectedFonts from fileCache. */
  const rebuildCollectedFonts = () => {
    collectedFonts.clear();
    for (const { fonts } of fileCache.values()) {
      for (const font of fonts) {
        collectedFonts.add(font);
      }
    }
  };

  // Scans src/**/*.{js,ts,jsx,tsx} and adds discovered fonts to collectedFonts.
  // Uses file cache to avoid re-scanning unchanged files.
  const collectFonts = async () => {
    const files = await fg('src/**/*.{js,ts,jsx,tsx}');
    const allFonts = await Promise.all(
      files.map(async (file) => {
        try {
          const stat = await fs.promises.stat(file);
          const cached = fileCache.get(file);

          // Return cached fonts if file hasn't been modified
          if (cached && cached.mtimeMs === stat.mtimeMs) {
            return cached.fonts;
          }

          // Read and extract fonts from file
          const code = await fs.promises.readFile(file, 'utf-8');
          const fonts = extractFonts(code);

          // Update cache
          fileCache.set(file, {
            fonts,
            mtimeMs: stat.mtimeMs,
          });

          return fonts;
        } catch (error) {
          // File might have been deleted, remove from cache
          fileCache.delete(file);
          return [];
        }
      })
    );
    for (const font of allFonts.flat()) {
      collectedFonts.add(font);
    }
  };

  return [
    {
      name: 'load-fonts-from-tailwind-source',
      enforce: 'pre',
      async buildStart() {
        reset();
        await collectFonts();
      },
      async transform(code, id) {
        if (!/\.([cm]?[jt]sx)$/.test(id)) {
          return null;
        }
        const fonts = extractFonts(code);

        // Update cache for this file
        try {
          const stat = await fs.promises.stat(id);
          fileCache.set(id, {
            fonts,
            mtimeMs: stat.mtimeMs,
          });
        } catch {
          // If stat fails, still extract fonts but don't cache
        }

        for (const font of fonts) {
          collectedFonts.add(font);
        }
        return null;
      },
    },
    {
      name: 'add-fonts-to-root',
      enforce: 'post',
      resolveId(id) {
        if (id === 'virtual:load-fonts.jsx') return id;
      },
      load(id) {
        if (id === 'virtual:load-fonts.jsx') {
          const code = `
      export function LoadFonts() {
        return (
          <>
            ${[...collectedFonts]
              .map((font) => {
                return `<link rel="stylesheet" href="${getFontURL(font)}" />`;
              })
              .join('\n')}
          </>
        );
      }
      export default LoadFonts;
    `;
          return code;
        }
      },
      async handleHotUpdate({ file, server, modules }) {
        // Only process relevant file types
        if (!/\.([cm]?[jt]sx)$/.test(file)) {
          return;
        }

        const fontsBefore = new Set(collectedFonts);

        // Only process the changed file, not all files
        try {
          const code = await fs.promises.readFile(file, 'utf-8');
          const stat = await fs.promises.stat(file);
          const fonts = extractFonts(code);

          // Update cache for this specific file
          fileCache.set(file, {
            fonts,
            mtimeMs: stat.mtimeMs,
          });

          // Rebuild collected fonts from cache
          rebuildCollectedFonts();
        } catch (error) {
          // If file was deleted, remove from cache and rebuild
          fileCache.delete(file);
          rebuildCollectedFonts();
        }

        const fontsAfter = new Set(collectedFonts);

        // Only reload if font set actually changed
        if (
          fontsBefore.size === fontsAfter.size &&
          [...fontsBefore].every((f) => fontsAfter.has(f))
        ) {
          return;
        }

        const virtualModuleId = 'virtual:load-fonts.jsx';
        const mod = server.moduleGraph.getModuleById(virtualModuleId);
        if (!mod) {
          return;
        }
        server.reloadModule(mod);
        server.ws.send({
          type: 'custom',
          event: 'update-font-links',
          data: [...fontsAfter].map((font) => getFontURL(font)),
        });
      },
    },
  ];
}
