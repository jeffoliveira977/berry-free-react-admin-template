import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Typography,
  CircularProgress,
  Box,
  Alert
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import AddIcon from '@mui/icons-material/Add';

// Serviço API
import { getTickets } from 'services/ticketService'; // Ajuste o caminho da sua API

const getStatusColor = (status) => {
  switch (status) {
    case 'ABERTO':
      return 'error';
    case 'EM_ATENDIMENTO':
    case 'EM_ANDAMENTO':
      return 'warning';
    case 'FECHADO':
    case 'CONCLUIDO':
      return 'success';
    default:
      return 'default';
  }
};

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await getTickets();
      // Se data for um array, usar diretamente, senão verificar se é um objeto com propriedade data/tickets
      setTickets(Array.isArray(data) ? data : data?.data || data?.tickets || []);
    } catch (err) {
      console.error('Erro ao buscar chamados:', err);
      setError(err.message || 'Erro ao carregar a lista de chamados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <MainCard
      title="Gerenciamento de Chamados"
      secondary={
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/tickets/create')}
        >
          Novo Chamado
        </Button>
      }
    >
      {error && (
        <Box mb={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Título</TableCell>
                <TableCell>Prioridade</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Nenhum chamado encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    <TableCell>
                      <Typography variant="subtitle1">#{ticket.id}</Typography>
                    </TableCell>
                    <TableCell>{ticket.title || ticket.titulo}</TableCell>
                    <TableCell>{ticket.priority || ticket.prioridade}</TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.status}
                        color={getStatusColor(ticket.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(ticket.createdAt || ticket.data)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </MainCard>
  );
}