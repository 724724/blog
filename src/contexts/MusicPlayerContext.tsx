import { createContext, useState, useContext, useMemo, useEffect, type ReactNode } from 'react';
import { loadSongs, type LoadedSong } from '../songs/loadSongs';

type Track = LoadedSong;

// fallback mock when no songs available
const fallbackTracks: Track[] = [];

interface MusicPlayerContextType {
  isPlayerOpen: boolean;
  isPlaying: boolean;
  tracks: Track[];
  currentTrack: Track | null;
  currentIndex: number;
  queueIndex: number;
  queueLastIndex: number;
  queueFirstIndex: number;
  queueOrder: number[];
  openPlayer: () => void;
  closePlayer: () => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  selectTrack: (index: number) => void;
  setPlaylist: (newTracks: Track[]) => void;
  isShuffling: boolean;
  toggleShuffle: () => void;
  repeatMode: 'off' | 'all' | 'one';
  cycleRepeatMode: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};

export const MusicPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState<Track[]>(fallbackTracks);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [shuffleOrder, setShuffleOrder] = useState<number[] | null>(null);
  const [shuffleIndex, setShuffleIndex] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const loaded = await loadSongs();
        if (mounted && loaded.length > 0) {
          setTracks(loaded);
          setCurrentTrackIndex(0);
        }
      } catch {
        // ignore and keep fallback
      }
    })();
    return () => { mounted = false; };
  }, []);

  const openPlayer = () => setIsPlayerOpen(true);
  const closePlayer = () => setIsPlayerOpen(false);
  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const togglePlay = () => setIsPlaying((p) => !p);

  // legacy random picker removed; using deterministic shuffle queue

  const generateShuffleOrder = (start: number, length: number): number[] => {
    const indices = Array.from({ length }, (_, i) => i).filter((i) => i !== start);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return [start, ...indices];
  };

  const playNext = () => {
    setCurrentTrackIndex((prevIndex) => {
      if (!tracks.length) return 0;
      if (isShuffling && shuffleOrder) {
        const nextPos = shuffleIndex + 1;
        if (nextPos < shuffleOrder.length) {
          setShuffleIndex(nextPos);
          return shuffleOrder[nextPos];
        }
        if (repeatMode === 'all') {
          setShuffleIndex(0);
          return shuffleOrder[0];
        }
        // no movement when repeat off at the end
        return prevIndex;
      }
      const next = prevIndex + 1;
      if (next < tracks.length) return next;
      return repeatMode === 'all' ? 0 : prevIndex;
    });
  };

  const playPrevious = () => {
    setCurrentTrackIndex((prevIndex) => {
      if (!tracks.length) return 0;
      if (isShuffling && shuffleOrder) {
        const prevPos = shuffleIndex - 1;
        if (prevPos >= 0) {
          setShuffleIndex(prevPos);
          return shuffleOrder[prevPos];
        }
        if (repeatMode === 'all') {
          const last = shuffleOrder.length - 1;
          setShuffleIndex(last);
          return shuffleOrder[last];
        }
        return prevIndex;
      }
      const prev = prevIndex - 1;
      if (prev >= 0) return prev;
      return repeatMode === 'all' ? tracks.length - 1 : prevIndex;
    });
  };

  const selectTrack = (index: number) => {
    if (!tracks.length) return;
    const safe = ((index % tracks.length) + tracks.length) % tracks.length;
    setCurrentTrackIndex(safe);
    if (isShuffling) {
      if (shuffleOrder) {
        const pos = shuffleOrder.indexOf(safe);
        if (pos !== -1) setShuffleIndex(pos);
        else {
          const order = generateShuffleOrder(safe, tracks.length);
          setShuffleOrder(order);
          setShuffleIndex(0);
        }
      } else {
        const order = generateShuffleOrder(safe, tracks.length);
        setShuffleOrder(order);
        setShuffleIndex(0);
      }
    }
  };

  const setPlaylist = (newTracks: Track[]) => {
    setTracks(newTracks);
    setCurrentTrackIndex(0);
    // Reset shuffle state to logical defaults
    setShuffleOrder(null); 
    setShuffleIndex(0);
    setIsShuffling(false);
  };

  const toggleShuffle = () => {
    setIsShuffling((s) => {
      const next = !s;
      if (next) {
        const order = generateShuffleOrder(currentTrackIndex, tracks.length);
        setShuffleOrder(order);
        setShuffleIndex(0);
      } else {
        setShuffleOrder(null);
        setShuffleIndex(0);
      }
      return next;
    });
  };
  const cycleRepeatMode = () => setRepeatMode((m) => (m === 'off' ? 'all' : m === 'all' ? 'one' : 'off'));

  const currentTrack = useMemo(() => (tracks.length ? tracks[currentTrackIndex] : null), [tracks, currentTrackIndex]);
  const queueIndex = isShuffling && shuffleOrder ? shuffleIndex : currentTrackIndex;
  const queueArray = isShuffling && shuffleOrder ? shuffleOrder : Array.from({ length: tracks.length }, (_, i) => i);
  const queueLastIndex = queueArray.length - 1;
  const queueFirstIndex = queueArray.length > 0 ? queueArray[0] : 0;

  const value = {
    isPlayerOpen,
    isPlaying,
    tracks,
    currentTrack,
    currentIndex: currentTrackIndex,
    queueFirstIndex,
    queueOrder: queueArray,
    queueIndex,
    queueLastIndex,
    openPlayer,
    closePlayer,
    play,
    pause,
    togglePlay,
    playNext,
    playPrevious,
    selectTrack,
    setPlaylist,
    isShuffling,
    toggleShuffle,
    repeatMode,
    cycleRepeatMode,
  };

  return <MusicPlayerContext.Provider value={value}>{children}</MusicPlayerContext.Provider>;
};