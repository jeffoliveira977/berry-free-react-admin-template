import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useColorScheme, useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import useConfig from 'hooks/useConfig';
import { useAuth } from 'hooks/useAuth';
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import { IconLogout, IconMoon } from '@tabler/icons-react';

function getInitials(name) {
  return (name || 'Usuário')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function ProfileSection() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, setMode } = useColorScheme();
  const theme = useTheme();

  const {
    state: { borderRadius }
  } = useConfig();

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = user?.name || user?.email || 'Usuário';
  const displayRole = user?.role ? user.role.replaceAll('_', ' ') : 'Usuário';
  const avatarUrl = user?.avatar || user?.avatarUrl || user?.photoUrl || user?.profilePhoto || user?.image;

  const isDarkMode = mode === 'dark';

  const handleThemeChange = () => {
    setMode(isDarkMode ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
      setOpen(false);
    }
  };

  return (
    <>
      <IconButton
  ref={anchorRef}
  onClick={() => setOpen((current) => !current)}
  aria-label="menu do usuário"
  aria-haspopup="true"
  sx={{
    ml: 2,
    p: 0.5,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      transform: 'scale(1.05)'
    }
  }}
>
  <Avatar
    src={avatarUrl || undefined}
    alt={displayName}
    sx={{
      typography: 'mediumAvatar',
      cursor: 'pointer'
    }}
  >
    {!avatarUrl && getInitials(displayName)}
  </Avatar>
</IconButton>

      <Popper
        placement="bottom"
        open={open}
        anchorEl={anchorRef.current}
        transition
        disablePortal
        modifiers={[{ name: 'offset', options: { offset: [0, 14] } }]}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={() => setOpen(false)}>
            <Transitions in={open} {...TransitionProps}>
              <Paper>
                {open && (
                  <MainCard
                    border={false}
                    elevation={16}
                    content={false}
                    boxShadow
                    shadow={theme.shadows[16]}
                  >
                    <Box sx={{ p: 2 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar src={avatarUrl || undefined} alt={displayName}>
                          {!avatarUrl && getInitials(displayName)}
                        </Avatar>

                        <Box>
                          <Typography variant="h4">{displayName}</Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{ textTransform: 'capitalize' }}
                          >
                            {displayRole}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    <Divider />

                    <List
                      sx={{
                        p: 1,
                        minWidth: 280,
                        borderRadius: `${borderRadius}px`
                      }}
                    >
                      <ListItemButton
                        onClick={handleThemeChange}
                        sx={{ borderRadius: `${borderRadius}px` }}
                      >
                        <ListItemIcon>
                          <IconMoon stroke={1.5} size="20px" />
                        </ListItemIcon>

                        <ListItemText primary="Dark" />

                        <Switch
                          checked={isDarkMode}
                          onChange={handleThemeChange}
                          onClick={(event) => event.stopPropagation()}
                        />
                      </ListItemButton>

                      <Divider sx={{ my: 1 }} />

                      <ListItemButton
                        onClick={handleLogout}
                        disabled={loggingOut}
                        sx={{ borderRadius: `${borderRadius}px` }}
                      >
                        <ListItemIcon>
                          <IconLogout stroke={1.5} size="20px" />
                        </ListItemIcon>

                        <ListItemText
                          primary={loggingOut ? 'Saindo...' : 'Sair'}
                        />
                      </ListItemButton>
                    </List>
                  </MainCard>
                )}
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
}