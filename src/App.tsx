import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Portal from '@mui/material/Portal';
import { lightTheme, darkTheme } from './assets/theme';
import { MenuProvider, useMenu } from './contexts/MenuContext';
import { MusicPlayerProvider, useMusicPlayer } from './contexts/MusicPlayerContext';
import MenuDrawer from './components/MenuDrawer';
import NowPlayingDrawer from './features/NowPlayingDrawer';

import Header from './components/Header';
import NavBar from './components/NavBar';
import MainPage from './features/MainPage';
import AboutPage from './features/AboutPage';
import PostsPage from './features/PostsPage';
import PostDetailPage from './features/PostDetailPage';

const MainContent = () => {
  const { isMenuOpen } = useMenu();
  const { isPlayerOpen } = useMusicPlayer();
  const isPopupOpen = isMenuOpen || isPlayerOpen;

  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        minHeight: '100vh',
        pt: '100px',
        pb: '120px',
        boxSizing: 'border-box',
        transition: 'opacity 0.2s ease-in-out',
        overflow: 'hidden',
      }}
    >
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/posts/:slug" element={<PostDetailPage />} />
          </Routes>
          {/* Backdrop overlay to blur and dim content without affecting layout or fixed positioning */}
          <Portal>
            <Box
              aria-hidden
              sx={(theme) => ({
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: theme.zIndex.drawer - 1,
                opacity: isPopupOpen ? 1 : 0,
                transition: 'opacity 200ms ease-in-out',
                backdropFilter: isPopupOpen ? 'blur(4px)' : 'none',
                WebkitBackdropFilter: isPopupOpen ? 'blur(4px)' : 'none',
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? (isPopupOpen ? 'rgba(0,0,0,0.35)' : 'transparent')
                    : (isPopupOpen ? 'rgba(255,255,255,0.25)' : 'transparent'),
              })}
            />
          </Portal>
    </Box>
  );
};

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = React.useMemo(
    () => (prefersDarkMode ? darkTheme : lightTheme),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MusicPlayerProvider>
        <MenuProvider>
          <Router>
            <Header />
            <MainContent />
            <NavBar />
            <MenuDrawer />
            <NowPlayingDrawer />
          </Router>
        </MenuProvider>
      </MusicPlayerProvider>
    </ThemeProvider>
  );
}

export default App;
