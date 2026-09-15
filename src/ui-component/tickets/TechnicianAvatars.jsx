import { Tooltip, Typography, Box, Chip, useTheme } from '@mui/material';
import { tooltipClasses } from '@mui/material/Tooltip';
import UserProfileLink from './UserProfileLink';

export default function TechnicianAvatars({
  names = [],
  ids = [],
  max = 2,
  emptyLabel = 'Não atribuído'
}) {
  const theme = useTheme();

  if (!names || names.length === 0) {
    return <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>{emptyLabel}</Typography>;
  }

  const visible = names.slice(0, max);
  const hidden = names.slice(max);
  const tooltipBg = theme.palette.dark?.main || theme.palette.grey[900];

  const linkedName = (name, index, variant = 'body2') => (
    <UserProfileLink id={ids[index]} name={name} variant={variant} />
  );

  const tooltipContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, py: 0.25 }}>
      {hidden.map((name, index) => (
        <span key={`${name}-${index}`} onClick={(event) => event.stopPropagation()}>
          {linkedName(name, index + max, 'caption')}
        </span>
      ))}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
      <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.4 }}>
        {visible.map((name, index) => <span key={`${name}-${index}`}>{index > 0 ? ', ' : ''}{linkedName(name, index)}</span>)}
      </Typography>
      {hidden.length > 0 && (
        <Tooltip
          title={tooltipContent}
          arrow
          placement="top"
          slotProps={{ popper: { sx: {
            [`& .${tooltipClasses.tooltip}`]: { bgcolor: tooltipBg, boxShadow: theme.shadows[3], p: 1 },
            [`& .${tooltipClasses.arrow}`]: { color: tooltipBg }
          } } }}
        >
          <Chip label={`+${hidden.length}`} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', bgcolor: 'action.selected', color: 'text.primary', '& .MuiChip-label': { px: 0.75 } }} />
        </Tooltip>
      )}
    </Box>
  );
}
