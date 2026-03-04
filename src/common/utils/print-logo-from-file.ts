import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { greenBright, whiteBright } from 'picocolors';

export function printLogoFromFile(fileName: string): void {
  const filePath = join(process.cwd(), fileName);

  if (!existsSync(filePath)) return;

  const rawContent = readFileSync(filePath, 'utf-8').replace(/\xa0/g, ' ');
  const lines = rawContent.split('\n');

  const first = lines.findIndex((l) => l.trim().length > 0);
  const last =
    lines.length - [...lines].reverse().findIndex((l) => l.trim().length > 0);

  if (first === -1) return;
  const contentLines = lines.slice(first, last);

  const minIndent = Math.min(
    ...contentLines
      .filter((l) => l.trim().length > 0)
      .map((l) => l.search(/\S/)),
  );

  contentLines.forEach((line) => {
    let cleanLine = line.slice(minIndent).trimEnd();

    cleanLine = cleanLine
      .replace(/\+/g, String(greenBright('+')))
      .replace(/#/g, String(whiteBright('#')));

    console.log(cleanLine);
  });

  console.log('\n');
}
