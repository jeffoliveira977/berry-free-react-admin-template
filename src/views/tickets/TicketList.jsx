import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Chip,
  Stack,
  TextField,
  MenuItem,
  InputAdornment,
  Popover,
  Badge,
  Divider,
  TablePagination
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import MainCard from 'ui-component/cards/MainCard';
import AddIcon from '@mui/icons-material/Add';

import {
  IconSearch,
  IconHash,
  IconUsers,
  IconBuilding,
  IconCalendar,
  IconFilterOff,
  IconAdjustmentsHorizontal
} from '@tabler/icons-react';

import { getTickets } from 'services/ticketService';
import { PriorityBadge, StatusBadge, PRIORITY_CONFIG, STATUS_CONFIG } from 'ui-component/tickets/TicketBadges';
import TechnicianAvatars from 'ui-component/tickets/TechnicianAvatars';

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ---- paginação ----
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // ---- filtros ----
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [priorityFilter, setPriorityFilter] = useState('TODAS');
  const [technicianFilter, setTechnicianFilter] = useState('TODOS');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterAnchor, setFilterAnchor] = useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await getTickets(page, rowsPerPage);

      setTickets(data.content || []);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const technicianOptions = useMemo(() => {
    const names = new Set();
    tickets.forEach((ticket) => {
      if (ticket.technicianNames?.length) {
        ticket.technicianNames.forEach((name) => names.add(name));
      } else if (ticket.technicianName) {
        names.add(ticket.technicianName);
      }
    });
    return Array.from(names).sort();
  }, [tickets]);

  // Contagem de filtros ativos
  const activeFilterCount = [
    statusFilter !== 'TODOS',
    priorityFilter !== 'TODAS',
    technicianFilter !== 'TODOS',
    dateFrom !== '',
    dateTo !== ''
  ].filter(Boolean).length;

  const hasActiveFilters = search.trim() !== '' || activeFilterCount > 0;

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('TODOS');
    setPriorityFilter('TODAS');
    setTechnicianFilter('TODOS');
    setDateFrom('');
    setDateTo('');
  };

  const filteredTickets = useMemo(() => {
    const term = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const technicians = ticket.technicianNames?.length
        ? ticket.technicianNames
        : ticket.technicianName
        ? [ticket.technicianName]
        : [];

      if (term) {
        const haystack = [
          `#${ticket.id}`,
          ticket.title || ticket.titulo,
          ticket.requesterName || ticket.openedByName,
          ticket.departmentName || ticket.sectorName,
          ...technicians
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(term)) return false;
      }

      if (statusFilter !== 'TODOS' && ticket.status !== statusFilter) return false;
      if (priorityFilter !== 'TODAS' && (ticket.priority || ticket.prioridade) !== priorityFilter) return false;

      if (technicianFilter !== 'TODOS') {
        if (technicianFilter === 'NAO_ATRIBUIDO') {
          if (technicians.length > 0) return false;
        } else if (!technicians.includes(technicianFilter)) {
          return false;
        }
      }

      const ticketDate = ticket.createdAt || ticket.data;
      if (dateFrom && ticketDate && new Date(ticketDate) < new Date(dateFrom)) return false;
      if (dateTo && ticketDate && new Date(ticketDate) > new Date(`${dateTo}T23:59:59`)) return false;

      return true;
    });
  }, [tickets, search, statusFilter, priorityFilter, technicianFilter, dateFrom, dateTo]);

  return (
    <MainCard content={false}>
      {error && (
        <Box p={3} pb={0}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {/* ======================================================
          BUSCA + FILTROS
      ====================================================== */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1 }}>
            <TextField
              size="small"
              placeholder="Buscar por título, ID, solicitante..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: 320 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} stroke={1.8} />
                  </InputAdornment>
                )
              }}
            />

            <Badge color="primary" badgeContent={activeFilterCount} invisible={activeFilterCount === 0}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<IconAdjustmentsHorizontal size={18} />}
                onClick={(e) => setFilterAnchor(e.currentTarget)}
                sx={{ textTransform: 'none', whiteSpace: 'nowrap', borderColor: 'divider' }}
              >
                Filtros
              </Button>
            </Badge>

            {hasActiveFilters && (
              <Button
                size="small"
                color="inherit"
                startIcon={<IconFilterOff size={16} />}
                onClick={clearFilters}
                sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
              >
                Limpar
              </Button>
            )}
          </Stack>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/tickets/create')}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
          >
            Novo Chamado
          </Button>
        </Stack>

        {hasActiveFilters && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {filteredTickets.length} de {tickets.length} chamados
          </Typography>
        )}

        <Popover
          open={Boolean(filterAnchor)}
          anchorEl={filterAnchor}
          onClose={() => setFilterAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Stack spacing={2} sx={{ p: 2.5, width: 280 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Filtrar chamados
            </Typography>

            <TextField
              select
              fullWidth
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="TODOS">Todos</MenuItem>
              {Object.keys(STATUS_CONFIG).map((s) => (
                <MenuItem key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              size="small"
              label="Prioridade"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <MenuItem value="TODAS">Todas</MenuItem>
              {Object.keys(PRIORITY_CONFIG).map((p) => (
                <MenuItem key={p} value={p}>
                  {PRIORITY_CONFIG[p].label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              size="small"
              label="Técnico"
              value={technicianFilter}
              onChange={(e) => setTechnicianFilter(e.target.value)}
            >
              <MenuItem value="TODOS">Todos</MenuItem>
              <MenuItem value="NAO_ATRIBUIDO">Não atribuído</MenuItem>
              {technicianOptions.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </TextField>

            <Divider />

            <Typography variant="caption" color="text.secondary">
              Período
            </Typography>

            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="De"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Até"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <Button size="small" color="inherit" onClick={clearFilters} sx={{ textTransform: 'none', alignSelf: 'flex-start' }}>
              Limpar todos os filtros
            </Button>
          </Stack>
        </Popover>
      </Box>

      <Divider />

      {/* ======================================================
          TABELA
      ====================================================== */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={240}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table
              sx={{
                minWidth: 650,
                '& .MuiTableCell-root': {
                  borderBottom: (theme) =>
                    `1px solid ${alpha(theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000', 0.06)}`
                }
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? alpha('#FFFFFF', 0.045) : 'grey.100'),
                    '& th': {
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      color: 'text.secondary',
                      letterSpacing: '0.5px',
                      py: 1.8
                    }
                  }}
                >
                  <TableCell width={80}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <IconHash size={14} /> <span>ID</span>
                    </Stack>
                  </TableCell>
                  <TableCell>Título</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <IconBuilding size={14} /> <span>Setor</span>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <IconUsers size={14} /> <span>Técnicos</span>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">Prioridade</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                      <IconCalendar size={14} /> <span>Data</span>
                    </Stack>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        {tickets.length === 0
                          ? 'Nenhum chamado encontrado.'
                          : 'Nenhum chamado corresponde aos filtros aplicados.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => {
                    const techNames = ticket.technicianNames?.length
                      ? ticket.technicianNames
                      : ticket.technicianName
                      ? [ticket.technicianName]
                      : [];

                    return (
                      <TableRow
                        key={ticket.id}
                        hover
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        sx={{
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease',
                          '&:last-child td, &:last-child th': { border: 0 }
                        }}
                      >
                        <TableCell>
                          <Chip
                            label={`#${ticket.id}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.725rem',
                              height: 22,
                              borderColor: 'divider',
                              color: 'text.secondary'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {ticket.title || ticket.titulo || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <StatusBadge status={ticket.status} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {ticket.departmentName || ticket.sectorName || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <TechnicianAvatars
                            names={techNames}
                            ids={ticket.technicianIds || []}
                            max={1}
                            size={28}
                            emptyLabel="Não atribuído"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <PriorityBadge priority={ticket.priority || ticket.prioridade} />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            {formatDate(ticket.createdAt || ticket.data)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ======================================================
              PAGINAÇÃO
          ====================================================== */}

          <Divider />
          
          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Itens por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`
            }
          />
        </>
      )}
    </MainCard>
  );
}
