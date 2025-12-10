export interface LoadedSong {
  id: number;
  title: string;
  artist: string;
  albumArt: string;
  url: string;
  provider: 'youtube';
}

type SongJson = { url?: string; urls?: string[] } | string[];

// Import parsed JSON values directly
const songModules = import.meta.glob('./*.json', { eager: true, import: 'default' }) as Record<string, SongJson>;

function ensureArray(input: SongJson): string[] {
  if (Array.isArray(input)) return input as string[];
  if (input && typeof input === 'object') {
    const obj = input as { url?: string; urls?: string[] };
    if (obj.url) return [obj.url];
    if (Array.isArray(obj.urls)) return obj.urls;
  }
  return [];
}

export async function fetchYoutubeMeta(url: string): Promise<{ title: string; artist: string; thumbnail: string }> {
  // Use noembed to avoid CORS issues and get metadata + thumbnail
  const endpoint = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error('Failed to fetch oEmbed');
  const data = (await res.json()) as any;
  return {
    title: data.title ?? url,
    artist: data.author_name ?? 'Unknown Artist',
    thumbnail: data.thumbnail_url ?? '',
  };
}

export async function loadSongs(): Promise<LoadedSong[]> {
  const urls: string[] = Object.values(songModules).flatMap(ensureArray);
  const uniqueUrls = Array.from(new Set(urls));
  const results: LoadedSong[] = [];
  let idCounter = 1;
  for (const url of uniqueUrls) {
    try {
      const meta = await fetchYoutubeMeta(url);
      results.push({
        id: idCounter++,
        title: meta.title,
        artist: meta.artist,
        albumArt: meta.thumbnail,
        url,
        provider: 'youtube',
      });
    } catch {
      results.push({
        id: idCounter++,
        title: url,
        artist: 'Unknown Artist',
        albumArt: '',
        url,
        provider: 'youtube',
      });
    }
  }
  return results;
}


