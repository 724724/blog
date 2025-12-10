import { useEffect, useMemo, useRef, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ListIcon from '@mui/icons-material/Reorder';
import Modal from '@mui/material/Modal';
import CloseIcon from '@mui/icons-material/Close';
import Fade from '@mui/material/Fade';
import Backdrop from '@mui/material/Backdrop';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { loadPosts } from '../posts/loadPosts';
import { parsePostContent } from '../utils/postParser';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import { fetchYoutubeMeta } from '../songs/loadSongs';

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { setPlaylist, play, pause, closePlayer } = useMusicPlayer();
  
  const posts = useMemo(() => loadPosts(), []);
  const index = useMemo(() => posts.findIndex((p) => p.slug === slug), [posts, slug]);
  const post = posts[index];
  
  const newerPost = index > 0 ? posts[index - 1] : undefined;
  const olderPost = index >= 0 && index + 1 < posts.length ? posts[index + 1] : undefined;
  
  const sections = useMemo(() => {
    return post ? parsePostContent(post.content) : [];
  }, [post]);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleOpenImage = (src: string) => {
      setSelectedImage(src);
      setOpenModal(true);
  };

  const handleCloseModal = () => {
      setOpenModal(false);
  };

  useEffect(() => {
    const handleScrollToTop = () => {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      }
    };

    window.addEventListener('blog-scroll-to-top', handleScrollToTop);
    return () => window.removeEventListener('blog-scroll-to-top', handleScrollToTop);
  }, []);

  // Music Auto-Play Logic
  useEffect(() => {
      if (post && post.song) {
          let active = true;
          (async () => {
              try {
                  const meta = await fetchYoutubeMeta(post.song!);
                  if (!active) return;
                  
                  // Construct track object
                  const track = {
                      id: 99999, // Temp ID
                      title: meta.title,
                      artist: meta.artist,
                      albumArt: meta.thumbnail,
                      url: post.song!,
                      provider: 'youtube' as const
                  };

                  setPlaylist([track]);
                  play(); 
              } catch (e) {
                  console.error("Failed to load post song", e);
              }
          })();

          return () => {
              active = false;
              pause();
              setPlaylist([]); // Clear on exit
              closePlayer();
          };
      }
  }, [post, slug]); // Re-run if post changes

  // Keyboard Navigation
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (!containerRef.current) return;
          if (openModal) return; 

          const container = containerRef.current;
          const { scrollTop, scrollLeft, clientHeight, clientWidth } = container;
          
          const isVertical = !isMobile;
          const dimension = isVertical ? clientHeight : clientWidth;
          const currentPos = isVertical ? scrollTop : scrollLeft;
          
          const currentIndex = Math.round(currentPos / dimension);
          let nextIndex = currentIndex;

          switch (e.key) {
              case 'ArrowDown':
              case 'ArrowRight':
                  nextIndex = currentIndex + 1;
                  e.preventDefault(); 
                  break;
              case 'ArrowUp':
              case 'ArrowLeft':
                  nextIndex = currentIndex - 1;
                  e.preventDefault();
                  break;
              default:
                  return;
          }

          if (nextIndex !== currentIndex) {
              container.scrollTo({
                  top: isVertical ? nextIndex * dimension : 0,
                  left: isVertical ? 0 : nextIndex * dimension,
                  behavior: 'smooth'
              });
          }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, openModal]);

  useEffect(() => {
    if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [slug]);

  if (!post) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Post not found</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>We couldn't find this post.</Typography>
        <IconButton component={RouterLink} to="/posts">
            <ListIcon />
        </IconButton>
      </Box>
    );
  }

  // Styles for the square image container
  const squareImageContainerStyle = {
      width: '100%',
      aspectRatio: '1 / 1',
      position: 'relative' as const,
      overflow: 'hidden',
      borderRadius: '24px', // Explicit larger radius
      boxShadow: isMobile ? 'none' : '0 4px 30px rgba(0,0,0,0.1)',
      bgcolor: 'black',
      cursor: 'pointer',
      transition: 'transform 0.2s',
      '&:hover': {
          transform: isMobile ? 'none' : 'scale(1.02)'
      }
  };

  // Vertical alignment adjustment
  const visualContentSx = {
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      scrollSnapAlign: 'start',
      scrollSnapStop: 'always', 
      flexShrink: 0,
      pb: isMobile ? '160px' : '160px', // Add padding for mobile to clear navbar
      pt: 0,  // Remove top padding to allow flex centering to work naturally (shifts up due to pb) 
      boxSizing: 'border-box', 
  };

  // iOS-style Button Sx
  const iOSButtonSx = {
      width: '64px', // Larger touch target
      height: '64px',
      borderRadius: '50%', // Circle
      backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(255,255,255,0.1)' 
          : 'rgba(255,255,255,0.8)',
      backdropFilter: 'blur(10px)',
      boxShadow: theme.palette.mode === 'dark'
          ? '0 4px 12px rgba(0,0,0,0.5)'
          : '0 4px 12px rgba(0,0,0,0.1)',
      border: '1px solid',
      borderColor: theme.palette.mode === 'dark' 
          ? 'rgba(255,255,255,0.1)' 
          : 'rgba(0,0,0,0.05)',
      color: theme.palette.text.primary,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
          transform: 'scale(1.05)',
          backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,0.2)' 
              : 'rgba(255,255,255,0.95)',
      },
      '&:active': {
          transform: 'scale(0.92)' // Feel the press
      },
      '&.Mui-disabled': {
          opacity: 0.3,
          backgroundColor: 'transparent',
          boxShadow: 'none',
          border: '1px solid',
          borderColor: theme.palette.divider
      }
  };

  // Track active index for progress bar
  const [activeIndex, setActiveIndex] = useState(0);
  // Total slides = Intro (1) + Sections (N) + Footer (1)
  const totalSlides = 1 + sections.length + 1; 

  const handleScroll = () => {
      if (containerRef.current) {
          const { scrollTop, scrollLeft, clientHeight, clientWidth } = containerRef.current;
          // Determine if we are scrolling vertically or horizontally based on isMobile
          // But effectively we can just check which dimension is being used for snapping
          const index = isMobile 
            ? Math.round(scrollLeft / clientWidth)
            : Math.round(scrollTop / clientHeight);
          setActiveIndex(index);
      }
  };

  useEffect(() => {
     const container = containerRef.current;
     if (container) {
         container.addEventListener('scroll', handleScroll);
         // Initial set
         handleScroll();
         return () => container.removeEventListener('scroll', handleScroll);
     }
  }, [sections]); // Re-bind if sections change

  // Progress Bar Styles
  const progressTrackSx = {
      position: 'fixed',
      right: '24px', // Spacing from right edge
      top: '50%',
      transform: 'translateY(-50%)', // Center vertically
      width: '4px',
      height: '30vh', // Arbitrary height, sleek look
      borderRadius: '4px',
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      overflow: 'hidden',
      zIndex: 10,
      display: isMobile ? 'none' : 'block' // Hide on mobile
  };

  const progressFillSx = {
      width: '100%',
      // Exclude Intro (index 0) from calculation. 
      // Progress goes from 0% (at intro) to 100% (at footer).
      // Denominator is (Total - 1) because index 0 doesn't "add" to the filled bar initially.
      height: `${(activeIndex / (totalSlides - 1)) * 100}%`,
      backgroundColor: theme.palette.text.primary, // Use text color for contrast
      borderRadius: '4px',
      transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 0 10px rgba(0,0,0,0.2)'
  };

  // Mobile Horizontal Progress Bar
  const mobileProgressTrackSx = {
      position: 'fixed',
      bottom: '100px', // Position above the text/navbar area
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(min(560px, calc(100% - 32px)) / 2)', // Half of the NavBar width
      height: '4px',
      borderRadius: '4px',
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      overflow: 'hidden',
      zIndex: 10,
      display: isMobile ? 'block' : 'none'
  };

  const mobileProgressFillSx = {
      height: '100%',
      width: `${(activeIndex / (totalSlides - 1)) * 100}%`,
      backgroundColor: theme.palette.text.primary,
      borderRadius: '4px',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 0 10px rgba(0,0,0,0.2)'
  };

  return (
    <Box sx={{ 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden', 
      bgcolor: 'background.default',
      display: 'flex',
      flexDirection: 'column',
      overscrollBehavior: 'none', 
    }}>
      
      {/* Vertical Progress Bar (Desktop Only) */}
      {!isMobile && (
          <Box sx={progressTrackSx}>
              <Box sx={progressFillSx} />
          </Box>
      )}

      {/* Horizontal Progress Bar (Mobile Only) */}
      {isMobile && (
          <Box sx={mobileProgressTrackSx}>
              <Box sx={mobileProgressFillSx} />
          </Box>
      )}

      {/* Image Modal */}
      <Modal
        aria-labelledby="image-modal-title"
        aria-describedby="image-modal-description"
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
            sx: { backgroundColor: 'rgba(0, 0, 0, 0.9)' }
          },
        }}
      >
        <Fade in={openModal}>
          <Box
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none',
              p: 2
            }}
          >
             <IconButton
                onClick={handleCloseModal}
                sx={{
                    position: 'absolute',
                    top: 24,
                    right: 24,
                    color: 'white',
                    zIndex: 1
                }}
             >
                 <CloseIcon />
             </IconButton>

             {selectedImage && (
                 <Box
                  component="img"
                  src={selectedImage}
                  alt="Full resolution"
                  sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      borderRadius: 2,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  }}
                 />
             )}
          </Box>
        </Fade>
      </Modal>

      <Box 
        ref={containerRef}
        sx={{ 
          flex: 1, 
          overflowY: isMobile ? 'hidden' : 'auto', 
          overflowX: isMobile ? 'auto' : 'hidden',
          scrollSnapType: isMobile ? 'x mandatory' : 'y mandatory',
          display: 'flex',
          flexDirection: isMobile ? 'row' : 'column',
          scrollBehavior: 'smooth',
          overscrollBehavior: 'none', 
          '&::-webkit-scrollbar': { display: 'none' }, 
          scrollbarWidth: 'none',
      }}>
        
        {/* Intro Section */}
        <Box 
            key="intro-slide"
            sx={visualContentSx}
        >
            <Box sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'center', 
                justifyContent: 'center',
                gap: isMobile ? 2 : 8, // Match content gap
                maxWidth: '100%',
                p: isMobile ? 4 : 4, // Add padding on mobile too
            }}>
                 {/* Thumbnail */}
                 <Box sx={{ 
                     width: isMobile ? 'auto' : '500px', // Auto width to respect aspect ratio with max-height
                     // width: isMobile ? '100%' : '500px', // OLD
                     maxWidth: isMobile ? '100%' : '40vw',
                     maxHeight: isMobile ? '45vh' : 'none', // Constraint height on mobile
                     mx: 'auto', // Centering
                     aspectRatio: '1/1', // Maintain square aspect ratio
                 }}>
                     <Box 
                         sx={{
                            ...squareImageContainerStyle,
                            height: '100%', // Fill the container
                         }}
                         onClick={() => post.thumbnail && handleOpenImage(post.thumbnail)}
                     >
                        {post.thumbnail && (
                             <Box
                              component="img"
                              src={post.thumbnail}
                              referrerPolicy="no-referrer"
                              alt={post.title}
                              sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover', 
                                  objectPosition: 'center'
                              }}
                             />
                        )}
                     </Box>
                 </Box>

                 {/* Title & Date */}
                 <Box sx={{ 
                     width: isMobile ? '100%' : '500px', // Match width
                     maxWidth: isMobile ? '100%' : '40vw',
                     p: isMobile ? 3 : 0,
                     textAlign: 'left' // Set text alignment to left on mobile
                 }}>
                    <Typography variant={isMobile ? "h4" : "h2"} gutterBottom sx={{ fontWeight: 'bold' }}>
                        {post.title}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                         {new Date(post.date).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                    </Typography>
                 </Box>
            </Box>
        </Box>

        {/* Content Pairs */}
        {sections.map((section, index) => {
          if (section.type === 'intro') return null;
          
          return (
             <Box 
              key={`pair-${index}`}
              sx={visualContentSx}
             >
                <Box sx={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: isMobile ? 2 : 8, // Add small gap on mobile for separation
                    maxWidth: '100%',
                    p: isMobile ? 4 : 4, // Add padding on mobile too
                }}>
                    {/* Image Side */ }
                    <Box sx={{ 
                        width: isMobile ? 'auto' : '500px', // Reduce width on mobile
                        maxWidth: isMobile ? '100%' : '40vw',
                        maxHeight: isMobile ? '45vh' : 'none', // Constraint height on mobile
                        mx: 'auto', // Centering
                        aspectRatio: '1/1',
                    }}>
                        <Box 
                            sx={squareImageContainerStyle}
                            onClick={() => section.image && handleOpenImage(section.image.src)}
                        >
                             {section.image && (
                                <Box
                                 component="img"
                                 src={section.image.src}
                                 referrerPolicy="no-referrer"
                                 alt={section.image.alt}
                                 sx={{
                                     width: '100%',
                                     height: '100%',
                                     objectFit: 'cover',
                                     objectPosition: 'center' 
                                 }}
                                />
                            )}
                        </Box>
                    </Box>
                    
                    {/* Text Side */}
                    <Box sx={{ 
                        width: isMobile ? '100%' : '500px', // Match width
                        maxWidth: isMobile ? '100%' : '40vw',
                        // Match image height exactly
                        aspectRatio: isMobile ? 'auto' : '1 / 1',
                        height: isMobile ? 'auto' : 'auto', 
                        maxHeight: isMobile ? '20vh' : 'none', // Strict constraint for mobile text to ensure scroll and no overlap
                        overflowY: 'auto',
                        overflowX: 'hidden', // Strictly prevent horizontal scroll
                        // Hide scrollbar but keep functionality if desired, or custom style
                        '&::-webkit-scrollbar': {  width: '6px' },
                        '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '3px' },
                    }}>
                        <Box sx={{
                            minHeight: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            p: 0, // Remove inner padding so text aligns with image edges
                        }}>
                             <Typography variant="body1" sx={{ 
                                 fontSize: isMobile ? '1rem' : '1.15rem', 
                                 lineHeight: 1.8, 
                                 whiteSpace: 'pre-wrap',
                                 textAlign: isMobile ? 'justify' : 'left', // Justify text on mobile to fill width
                                 wordBreak: 'break-word', // Ensure long words break
                                 overflowWrap: 'anywhere', // Prevent overflow
                             }}>
                                {section.text}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
             </Box>
          );
        })}
        
        {/* Navigation Footer */}
        <Box sx={{ 
            minWidth: '100vw',
            height: '100vh', 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
            flexShrink: 0,
            gap: 6, // Increased gap for bigger buttons
            pb: isMobile ? '160px' : '160px',
            boxSizing: 'border-box',
        }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconButton 
                    component={RouterLink} 
                    to={olderPost ? `/posts/${olderPost.slug}` : '#'}
                    disabled={!olderPost}
                    sx={iOSButtonSx}
                >
                    <ArrowBackIcon sx={{ fontSize: '1.75rem' }} />
                </IconButton>
                
                <IconButton 
                    component={RouterLink} 
                    to="/posts"
                    sx={iOSButtonSx}
                >
                    <ListIcon sx={{ fontSize: '1.75rem' }} />
                </IconButton>
                
                <IconButton 
                    component={RouterLink} 
                    to={newerPost ? `/posts/${newerPost.slug}` : '#'}
                    disabled={!newerPost}
                    sx={iOSButtonSx}
                >
                    <ArrowForwardIcon sx={{ fontSize: '1.75rem' }} />
                </IconButton>
             </Box>
             
             {/* Text labels removed */}
        </Box>
        
      </Box>
    </Box>
  );
}
