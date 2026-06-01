import fs from 'node:fs/promises';
import path from 'node:path';

async function loadHtml(): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    'src/app/(landings)/bukku/landing.html',
  );
  return fs.readFile(filePath, 'utf-8');
}

export async function GET() {
  const html = await loadHtml();

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=120, stale-while-revalidate=300',
    },
  });
}
