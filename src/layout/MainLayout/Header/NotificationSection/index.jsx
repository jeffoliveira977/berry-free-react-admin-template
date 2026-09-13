import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IconBell } from '@tabler/icons-react';

import { getNotifications, markNotificationAsRead } from 'services/notificationService';

export default function NotificationSection() {
  const theme = useTheme();
  const navigate = useNavigate();
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(Array.isArray(response) ? response : response?.data || []);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 30000);

    let socket;
    let reconnectTimer;
    let reconnectAttempt = 0;
    let disposed = false;

    const connectRealtime = () => {
      if (disposed) return;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const websocketUrl = `${apiUrl.replace(/^http/, 'ws')}/api/ws/notifications`;
      socket = new WebSocket(websocketUrl);

      socket.onopen = () => {
        reconnectAttempt = 0;
      };

      socket.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          if (!notification?.id) return;
          setNotifications((current) => [notification, ...current.filter((item) => item.id !== notification.id)]);
        } catch {
          // O polling continua sendo a fonte de recuperação caso um evento inválido chegue.
        }
      };

      socket.onclose = () => {
        if (disposed) return;
        const delay = Math.min(30000, 1000 * 2 ** reconnectAttempt);
        reconnectAttempt += 1;
        reconnectTimer = window.setTimeout(connectRealtime, delay);
      };

      socket.onerror = () => socket.close();
    };

    connectRealtime();

    return () => {
      disposed = true;
      window.clearInterval(interval);
      window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const openNotification = async (notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id).catch(() => {});
      setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read: true } : item));
    }
    setOpen(false);
    if (notification.ticketId) navigate(`/tickets/${notification.ticketId}`);
  };

  return (
    <>
      <Box sx={{ ml: 2 }}>
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <Avatar
            ref={anchorRef}
            variant="rounded"
            onClick={() => setOpen((current) => !current)}
            sx={{
              ...theme.typography.commonAvatar,
              ...theme.typography.mediumAvatar,
              cursor: 'pointer',
              color: theme.vars.palette.warning.dark,
              background: theme.vars.palette.warning.light
            }}
          >
            <IconBell stroke={1.5} size="20px" />
          </Avatar>
        </Badge>
      </Box>
      <Popper open={open} anchorEl={anchorRef.current} placement="bottom-end" sx={{ zIndex: 1300 }}>
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Paper sx={{ width: 360, maxWidth: 'calc(100vw - 32px)', mt: 2 }} elevation={8}>
            <Stack direction="row" justifyContent="space-between" sx={{ p: 2 }}>
              <Typography variant="h4">Notificações</Typography>
              <Typography variant="caption" color="text.secondary">{unreadCount} não lidas</Typography>
            </Stack>
            <Divider />
            <Box sx={{ maxHeight: 420, overflowY: 'auto' }}>
              {notifications.length === 0 && <Typography sx={{ p: 3 }} color="text.secondary">Nenhuma notificação.</Typography>}
              {notifications.map((notification) => (
                <Button
                  key={notification.id}
                  fullWidth
                  onClick={() => openNotification(notification)}
                  sx={{ display: 'block', textAlign: 'left', textTransform: 'none', p: 2, bgcolor: notification.read ? 'transparent' : 'action.hover' }}
                >
                  <Typography variant="subtitle2">{notification.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{notification.message}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notification.createdAt ? new Date(notification.createdAt).toLocaleString('pt-BR') : ''}
                  </Typography>
                </Button>
              ))}
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}
