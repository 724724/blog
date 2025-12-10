import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { useTheme } from '@mui/material/styles';
import { useMenu } from '../contexts/MenuContext';

function MenuPage() {
  const theme = useTheme();
  const { closeMenu } = useMenu();

  return (
    <Box sx={{ width: '100%', p: 2, pt: 4 }}>
      <Box
        onClick={closeMenu}
        sx={{
          width: 40,
          height: 5,
          backgroundColor: theme.palette.divider,
          borderRadius: 3,
          position: 'absolute',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: 'pointer',
        }}
      />

      <List>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/about" onClick={closeMenu}>
            <ListItemIcon>
              <InfoOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="About" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/posts" onClick={closeMenu}>
            <ListItemIcon>
              <ArticleOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Posts" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default MenuPage;
