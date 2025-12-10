import Drawer from '@mui/material/Drawer';
import { useMenu } from '../contexts/MenuContext';
import MenuPage from '../features/MenuPage';

const MenuDrawer = () => {
  const { isMenuOpen, closeMenu } = useMenu();

  return (
    <Drawer
      anchor="bottom"
      open={isMenuOpen}
      onClose={closeMenu}
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
        }),
      }}
    >
      <MenuPage />
    </Drawer>
  );
};

export default MenuDrawer;
