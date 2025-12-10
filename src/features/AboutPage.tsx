import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import InstagramIcon from '@mui/icons-material/Instagram';
import GitHubIcon from '@mui/icons-material/GitHub';
import profileImage from '../assets/profile.jpeg';

export default function AboutPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "calc(100vh - 220px)", // Adjust for header/footer space to center visually
        px: 4,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isMobile ? 4 : 6, // Slightly reduced gap
          maxWidth: 900,
          // Shift visual center to the left on desktop by adding padding to the right
          pr: isMobile ? 0 : 8, 
        }}
      >
        {/* Profile Image (Left) */}
        <Box
          component="img"
          src={profileImage}
          alt="Sejun Lee"
          sx={{
            width: isMobile ? 200 : 280,
            height: isMobile ? 200 : 280,
            borderRadius: '50%',
            objectFit: 'cover',
            boxShadow: theme.palette.mode === 'dark' 
                ? '0 8px 32px rgba(0,0,0,0.5)' 
                : '0 8px 32px rgba(0,0,0,0.1)',
          }}
        />

        {/* Text Info (Right) */}
        <Box sx={{ 
            textAlign: isMobile ? 'center' : 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
        }}>
          <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            이세준
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 500, mb: 2 }}>
            Sejun Lee
          </Typography>

          {/* Social Icons */}
          <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: isMobile ? 'center' : 'flex-start' 
          }}>
            <IconButton 
                onClick={() => handleLink('https://www.instagram.com/sejunleee/')}
                sx={{ 
                    color: 'text.primary',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.1)', color: '#E1306C' } // Instagram Brand Color on hover
                }}
                aria-label="Instagram"
            >
              <InstagramIcon sx={{ fontSize: 32 }} />
            </IconButton>
            <IconButton 
                onClick={() => handleLink('https://github.com/724724')}
                sx={{ 
                    color: 'text.primary',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.1)', color: '#6e5494' } // GitHub purple on hover
                }}
                aria-label="GitHub"
            >
              <GitHubIcon sx={{ fontSize: 32 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
