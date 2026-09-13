import PropTypes from 'prop-types';
import { cloneElement } from 'react';

import { useTheme } from '@mui/material/styles';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import MuiAppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Link as RouterLink } from 'react-router-dom';

import Logo from 'ui-component/Logo';

function ElevationScroll({ children, window }) {
  const theme = useTheme();
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 0, target: window });
  return cloneElement(children, {
    elevation: trigger ? 1 : 0,
    style: { backgroundColor: theme.vars.palette.background.default, color: theme.vars.palette.text.dark }
  });
}

export default function AppBar({ ...others }) {
  return (
    <ElevationScroll {...others}>
      <MuiAppBar>
        <Container>
          <Toolbar sx={{ py: 2.5, px: '0 !important' }}>
            <Typography component={RouterLink} to="/" sx={{ flexGrow: 1, textAlign: 'left' }}>
              <Logo />
            </Typography>
            <Stack direction="row" sx={{ gap: 2.5, display: { xs: 'none', sm: 'flex' } }}>
              <Button color="inherit" component={RouterLink} to="/tickets">Chamados</Button>
            </Stack>
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
              <Button color="inherit" component={RouterLink} to="/tickets">Chamados</Button>
            </Box>
          </Toolbar>
        </Container>
      </MuiAppBar>
    </ElevationScroll>
  );
}

ElevationScroll.propTypes = { children: PropTypes.node, window: PropTypes.any };
