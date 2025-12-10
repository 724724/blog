// Markdown loader that imports all md files in src/posts via Vite's import.meta.glob
// Each markdown file must have frontmatter: title, date, thumbnail, excerpt

export interface LoadedPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  thumbnail: string; // resolved URL
  song?: string; // YouTube URL from frontmatter
  slug: string;
  content: string;
}

const modules = import.meta.glob('./*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

function slugify(filePath: string): string {
  const file = filePath.split('/').pop() ?? '';
  return file.replace(/\.md$/i, '');
}

function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/m.exec(raw);
  if (!match) return { data: {}, content: raw };
  const [, fm, body] = match;
  const data: Record<string, string> = {};
  fm.split(/\r?\n/).forEach((line) => {
    const idx = line.indexOf(':');
    if (idx > -1) {
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim().replace(/^"|"$/g, '');
      data[key] = value;
    }
  });
  return { data, content: body };
}

// Statically import known assets referenced in frontmatter so Vite includes them in the bundle
// If you add more assets in frontmatter, import and map them here as needed
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import mainAssetUrl from '../assets/main.jpg?url';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import logoAssetUrl from '../assets/logo.png?url';

function resolveThumbnail(frontmatterPath: string): string {
  const normalized = frontmatterPath.replace(/\\/g, '/');
  if (normalized.endsWith('../assets/main.jpg')) return mainAssetUrl;
  if (normalized.endsWith('../assets/logo.png')) return logoAssetUrl;
  // Fallback: if it's an absolute URL or absolute path under public/
  if (/^https?:\/\//.test(normalized) || normalized.startsWith('/')) return normalized;
  // Otherwise leave empty to avoid broken images
  return '';
}

export function loadPosts(): LoadedPost[] {
  const list: LoadedPost[] = Object.entries(modules).map(([path, raw]) => {
    const { data, content } = parseFrontmatter(raw);
    const thumbPath = data.thumbnail ?? '';
    const resolvedThumb = thumbPath ? resolveThumbnail(thumbPath) : '';
    const slug = slugify(path);
    return {
      id: slug,
      title: data.title ?? slug,
      date: data.date ?? '1970-01-01',
      excerpt: data.excerpt ?? '',
      thumbnail: resolvedThumb,
      song: data.song ?? undefined,
      slug,
      content,
    } satisfies LoadedPost;
  });
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}


