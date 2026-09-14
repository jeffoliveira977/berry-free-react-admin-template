import { Tooltip, Typography, Box, Chip, useTheme } from "@mui/material";
import { tooltipClasses } from "@mui/material/Tooltip";

/**
 * TechnicianAvatars
 *
 * Exibe ate `max` nomes de tecnicos em linha e, se houver mais,
 * um chip "+N" que ao hover mostra os demais num tooltip.
 *
 * Props:
 *   names      {string[]}  lista de nomes dos tecnicos
 *   max        {number}    quantos nomes mostrar antes do chip (padrao: 2)
 *   emptyLabel {string}    texto quando nao ha tecnico
 */
export default function TechnicianAvatars({
  names = [],
  max = 2,
  emptyLabel = "Nao atribuido",
}) {
  const theme = useTheme();

  if (!names || names.length === 0) {
    return (
      <Typography variant="body2" color="text.disabled" sx={{ fontStyle: "italic" }}>
        {emptyLabel}
      </Typography>
    );
  }

  const visible = names.slice(0, max);
  const hidden  = names.slice(max);

  // Cor de fundo do tooltip alinhada ao tema (Dark/Grey)
  const tooltipBg = theme.palette.dark?.main || theme.palette.grey[900];

  const tooltipContent = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, py: 0.25 }}>
      {hidden.map((n) => (
        <Typography 
          key={n} 
          variant="caption" 
          sx={{ lineHeight: 1.7, color: "common.white", fontWeight: 500 }}
        >
          {n}
        </Typography>
      ))}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
      <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.4 }}>
        {visible.join(", ")}
      </Typography>

      {hidden.length > 0 && (
        <Tooltip 
          title={tooltipContent} 
          arrow 
          placement="top"
          slotProps={{
            popper: {
              sx: {
                [`& .${tooltipClasses.tooltip}`]: {
                  bgcolor: tooltipBg,
                  boxShadow: theme.shadows[3],
                  p: 1
                },
                [`& .${tooltipClasses.arrow}`]: {
                  color: tooltipBg
                }
              }
            }
          }}
        >
          <Chip
            label={`+${hidden.length}`}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.7rem",
              fontWeight: 700,
              cursor: "default",
              bgcolor: "action.selected",
              color: "text.primary",
              "& .MuiChip-label": { px: 0.75 },
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
}