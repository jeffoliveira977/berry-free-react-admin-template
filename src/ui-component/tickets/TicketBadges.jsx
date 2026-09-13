import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const PRIORITY_CONFIG = {
  BAIXA:   { label: 'Baixa',   color: '#6B7280' },
  MEDIA:   { label: 'Média',   color: '#60A5FA' },
  ALTA:    { label: 'Alta',    color: '#D97706' },
  URGENTE: { label: 'Urgente', color: '#EF4444' } 
};

export const STATUS_CONFIG = {
  ABERTO:         { label: 'Aberto',         color: '#60A5FA' },
  EM_ANDAMENTO:   { label: 'Em Andamento',   color: '#D97706' },
  RESOLVIDO:      { label: 'Resolvido',      color: '#10B981' },
  FECHADO:        { label: 'Fechado',        color: '#6B7280' },
  CANCELADO:      { label: 'Cancelado',      color: '#6B7280' }
};

function DotBadge({ config, fallback }) {
  const { label = fallback || '-', color = '#6B7280' } = config || {};

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1,
        py: 0.3,
        borderRadius: '6px',

        bgcolor: (theme) => (theme.palette.mode === 'dark' ? alpha('#FFFFFF', 0.04) : alpha('#000000', 0.03)),
        border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? alpha('#FFFFFF', 0.08) : alpha('#000000', 0.08)}`,
        color: color,
        fontSize: '0.75rem',
        fontWeight: 500,
        lineHeight: 1.2,
        whiteSpace: 'nowrap'
      }}
    >
      <Box
        component="span"
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: color,
          display: 'inline-block',
          flexShrink: 0
        }}
      />
      {label}
    </Box>
  );
}

export function PriorityBadge({ priority }) {
  return <DotBadge config={PRIORITY_CONFIG[priority]} fallback={priority} />;
}

export function StatusBadge({ status }) {
  return <DotBadge config={STATUS_CONFIG[status]} fallback={status} />;
}