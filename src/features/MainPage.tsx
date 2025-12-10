import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { loadPosts } from '../posts/loadPosts';
import { useNavigate } from 'react-router-dom';

export default function MainPage() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const navigate = useNavigate();
  const posts = React.useMemo(() => loadPosts().slice(0, 7), []);
  const total = posts.length;
  const touchStartXRef = React.useRef<number | null>(null);
  const touchStartYRef = React.useRef<number | null>(null);
  const lastWheelTimeRef = React.useRef<number>(0);
  const prevIndexRef = React.useRef<number>(0);
  const goPrev = React.useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);
  const goNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goPrev, goNext]);

  const VISIBLE_RANGE = 3; // how many items to show per side

  const getSignedOffset = (index: number) => {
    const raw = (index - currentIndex + total) % total;
    return raw > total / 2 ? raw - total : raw; // range roughly [-total/2, total/2]
  };

  const getSignedOffsetFor = (index: number, baseIndex: number) => {
    const raw = (index - baseIndex + total) % total;
    return raw > total / 2 ? raw - total : raw;
  };

  React.useEffect(() => {
    prevIndexRef.current = currentIndex;
  }, [currentIndex]);

  const handleWheel = (e: React.WheelEvent) => {
    const now = performance.now();
    if (now - lastWheelTimeRef.current < 350) return;
    const absX = Math.abs(e.deltaX);
    const absY = Math.abs(e.deltaY);
    let horizontalDelta = 0;
    if (absX > absY) {
      horizontalDelta = e.deltaX;
    } else if (e.shiftKey && absY > 0) {
      horizontalDelta = e.deltaY;
    }
    if (Math.abs(horizontalDelta) > 20) {
      lastWheelTimeRef.current = now;
      if (horizontalDelta > 0) {
        goNext();
      } else {
        goPrev();
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartXRef.current = t.clientX;
    touchStartYRef.current = t.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartXRef.current;
    const startY = touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    if (startX == null || startY == null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
      if (dx < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: 2 }}>
      <Box sx={{ position: 'relative', height: { xs: 360, sm: 420, md: 520 }}}>
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            perspective: '1200px',
            transformStyle: 'preserve-3d',
            overflow: 'visible',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
          }}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {posts.map((post, index) => {
            const offset = getSignedOffset(index);
            const abs = Math.abs(offset);
            const hidden = abs > VISIBLE_RANGE;
            const translateX = offset * 180;
            const rotateY = offset === 0 ? 0 : offset < 0 ? 40 : -40;
            const translateZ = offset === 0 ? 140 : Math.max(0, 100 - abs * 60);
            const scale = offset === 0 ? 1 : 0.9 - Math.min(abs, 2) * 0.05;
            const opacity = hidden ? 0 : 1;
            const prevOffset = getSignedOffsetFor(index, prevIndexRef.current);
            const isWrapping = Math.abs(prevOffset) === VISIBLE_RANGE && Math.abs(offset) === VISIBLE_RANGE && prevOffset !== offset;
            const enableTransition = !hidden && !isWrapping;
            const zIndex = 100 - abs;

            return (
              <Box
                key={post.id}
                onClick={() => (index === currentIndex ? navigate(`/posts/${post.slug}`) : setCurrentIndex(index))}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: { xs: 220, sm: 260, md: 320 },
                  height: { xs: 220, sm: 260, md: 320 },
                  transform: `translate(-50%, -50%) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  transformStyle: 'preserve-3d',
                  transition: enableTransition ? 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1), opacity 400ms ease' : 'none',
                  cursor: 'pointer',
                  opacity,
                  zIndex,
                  pointerEvents: hidden ? 'none' : 'auto',
                }}
              >
                {post.thumbnail ? (
                  <Box
                    component="img"
                    src={post.thumbnail}
                    alt={post.title}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: 4,
                      boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
                      backfaceVisibility: 'hidden',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 4,
                      bgcolor: 'action.hover',
                      color: 'text.secondary',
                      fontWeight: 600,
                    }}
                  >
                    No Photo
                  </Box>
                )}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -55,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%',
                    maxWidth: 320,
                    textAlign: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  {offset === 0 && (
                    <Typography
                      variant="subtitle1"
                      noWrap
                      sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {post.title}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Centered pagination dots placed between coverflow and NavBar */}
      <Box
        sx={{
          position: 'fixed',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: 110,
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        {posts.map((_, i) => (
          <Box
            key={i}
            onClick={() => setCurrentIndex(i)}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: i === currentIndex ? 'text.primary' : 'divider',
              cursor: 'pointer',
            }}
          />
        ))}
      </Box>
    </Box>
  );
}