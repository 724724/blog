import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import YouTubeAudio from '../songs/YouTubeAudio';
import Slider from '@mui/material/Slider';

const NowPlayingDrawer = () => {
  const {
    isPlayerOpen,
    isPlaying,
    currentTrack,
    closePlayer,
    togglePlay,
    playNext,
    playPrevious,
    play,
  } = useMusicPlayer();

  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const playerHandleRef = React.useRef<{ getCurrentTime: () => number; getDuration: () => number; seekTo: (s: number) => void } | null>(null);
  const isScrubbingRef = React.useRef(false);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      const h = playerHandleRef.current;
      if (!h) return;
      const d = h.getDuration();
      const t = h.getCurrentTime();
      if (Number.isFinite(d)) setDuration(d);
      if (!isScrubbingRef.current && Number.isFinite(t)) setCurrentTime(t);
    }, 250);
    return () => window.clearInterval(id);
  }, []);

  const handleSeek = (_: Event, value: number | number[]) => {
    const v = Array.isArray(value) ? value[0] : value;
    setCurrentTime(v);
    playerHandleRef.current?.seekTo(v);
  };

  const formatTime = (sec: number) => {
    if (!Number.isFinite(sec)) return '0:00';
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, '0')}`;
  };

  const formatArtist = (name: string) => {
    if (!name) return name;
    return name.replace(/\s*-\s*Topic\s*$/i, '').trim();
  };

  return (
    <Drawer
      anchor="bottom"
      open={isPlayerOpen}
      onClose={closePlayer}
      ModalProps={{
        keepMounted: true,
        disableScrollLock: true,
      }}
      sx={{
        '& .MuiDrawer-paper': (theme) => ({
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgba(24, 24, 24, 0.75)'
              : 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 -16px 50px rgba(0,0,0,0.5)'
              : '0 -20px 60px rgba(0,0,0,0.15)',
          p: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }),
      }}
    >
      {currentTrack?.url && (
        <YouTubeAudio
          url={currentTrack.url}
          playing={isPlaying}
          onReady={(h) => {
            playerHandleRef.current = h;
            setDuration(h.getDuration());
          }}
          onEnded={() => {
            // ALWAYS Repeat One: restart the same track
            playerHandleRef.current?.seekTo(0);
            play();
          }}
        />
      )}
      <Box
        onClick={closePlayer}
        sx={(theme) => ({
          width: 40,
          height: 5,
          backgroundColor: theme.palette.divider,
          borderRadius: 3,
          position: 'absolute',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: 'pointer',
        })}
      />
      {currentTrack ? (
        <>
            <Box
            component="img"
            src={currentTrack.albumArt}
            alt={`${currentTrack.title} album artwork`}
            onClick={() => { if (currentTrack?.url) window.open(currentTrack.url, '_blank', 'noopener,noreferrer'); }}
            sx={{
                width: 200,
                height: 200,
                borderRadius: 3,
                boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
                transition: 'all 0.3s ease-in-out',
                transform: isPlaying ? 'scale(1)' : 'scale(0.97)',
                cursor: 'pointer',
                '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 20px 48px rgba(0,0,0,0.3)',
                }
            }}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: '100%', maxWidth: 720 }}>
            <Typography variant="h6" component="div" noWrap>
                <strong>{currentTrack.title}</strong>
            </Typography>
            <Typography variant="body1" color="text.secondary" noWrap>
                {formatArtist(currentTrack.artist)}
            </Typography>

            <Box sx={{ width: '100%', px: 2, mt: 2 }}>
                <Slider
                size="small"
                min={0}
                max={Math.max(1, Math.floor(duration))}
                value={Math.min(Math.floor(currentTime), Math.floor(duration) || 1)}
                onChange={handleSeek}
                onChangeCommitted={() => { isScrubbingRef.current = false; }}
                onMouseDown={() => { isScrubbingRef.current = true; }}
                onTouchStart={() => { isScrubbingRef.current = true; }}
                aria-label="progress"
                sx={(theme) => ({
                    height: 8,
                    color: theme.palette.primary.main,
                    borderRadius: 999,
                    '& .MuiSlider-track': {
                    border: 'none',
                    borderRadius: 999,
                    backgroundColor: theme.palette.primary.main,
                    },
                    '& .MuiSlider-rail': {
                    opacity: 1,
                    borderRadius: 999,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)',
                    },
                    '& .MuiSlider-thumb': {
                    width: 0,
                    height: 0,
                    display: 'none',
                    boxShadow: 'none',
                    },
                })}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption">{formatTime(currentTime)}</Typography>
                <Typography variant="caption">{formatTime(duration)}</Typography>
                </Box>
            </Box>

            <Box
                sx={{
                display: 'flex', // Flexbox for centering
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4, // Spacing between buttons
                mt: 2,
                width: '100%',
                px: 1,
                }}
            >
                <IconButton aria-label="Previous" onClick={playPrevious}>
                <SkipPreviousIcon sx={{ fontSize: 30 }} />
                </IconButton>

                <IconButton aria-label="Play/Pause" onClick={togglePlay}>
                {isPlaying ? (
                    <PauseIcon sx={{ fontSize: 40 }} />
                ) : (
                    <PlayArrowIcon sx={{ fontSize: 40 }} />
                )}
                </IconButton>

                <IconButton aria-label="Next" onClick={playNext}>
                <SkipNextIcon sx={{ fontSize: 30 }} />
                </IconButton>
            </Box>
            </Box>
        </>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>No songs to play</Typography>
        </Box>
      )}
    </Drawer>
  );
};

export default NowPlayingDrawer;