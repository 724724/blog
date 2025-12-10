import { Link as RouterLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Portal from '@mui/material/Portal';
import HomeOutlinedIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Wallet';
import MusicNoteOutlinedIcon from '@mui/icons-material/Audiotrack';
import { useTheme } from '@mui/material/styles';
import { useMenu } from '../contexts/MenuContext';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';

const NavBar = () => {
  const theme = useTheme();
  const { openMenu } = useMenu();
  const { openPlayer } = useMusicPlayer();

  return (
    <Portal>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          top: 'auto',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: 'min(560px, calc(100% - 32px))', sm: 'auto' },
          borderRadius: '32px',
          boxShadow: theme.shadows[8],
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgba(45, 45, 45, 0.75)'
              : 'rgba(252, 252, 252, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ px: { xs: 1.5, sm: 2 } }}>
          <Box
            sx={{
              width: '100%',
              minWidth: 180,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <IconButton onClick={openMenu} aria-label="메뉴 열기">
              <MenuIcon />
            </IconButton>

            <IconButton component={RouterLink} to="/" aria-label="홈으로 이동">
              <HomeOutlinedIcon />
            </IconButton>
            <IconButton onClick={openPlayer} aria-label="음악 플레이어 열기">
              <MusicNoteOutlinedIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
    </Portal>
  );
};

export default NavBar;
