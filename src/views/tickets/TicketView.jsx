import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  Typography
} from '@mui/material';

import MainCard from 'ui-component/cards/MainCard';
import AnimateButton from 'ui-component/extended/AnimateButton';

import {
  IconArrowLeft,
  IconEdit,
  IconMessage,
  IconUser,
  IconBuilding,
  IconTag,
  IconInfoCircle,
  IconFileDescription
} from '@tabler/icons-react';

import { getTicketById } from 'services/ticketService';


// ==============================|| STATUS ||============================== //

const STATUS_LABELS = {
  ABERTO: 'Aberto',
  EM_ATENDIMENTO: 'Em Atendimento',
  RESOLVIDO: 'Resolvido',
  FECHADO: 'Fechado',
  CANCELADO: 'Cancelado'
};

const STATUS_COLORS = {
  ABERTO: 'info',
  EM_ATENDIMENTO: 'warning',
  RESOLVIDO: 'success',
  FECHADO: 'secondary',
  CANCELADO: 'error'
};


// ==============================|| PRIORIDADE ||============================== //

const PRIORITY_LABELS = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  URGENTE: 'Urgente'
};

const PRIORITY_COLORS = {
  BAIXA: 'success',
  MEDIA: 'info',
  ALTA: 'warning',
  URGENTE: 'error'
};


// ==============================|| COMPONENTE ||============================== //

const TicketView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================================
  // CARREGAR CHAMADO
  // ============================================================

  useEffect(() => {
    const loadTicket = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('========== VISUALIZAR CHAMADO ==========');
        console.log('ID:', id);

        const response = await getTicketById(id);

        console.log('RESPOSTA:', response);
        console.log('DADOS:', response?.data);

        setTicket(response?.data ?? response);

      } catch (err) {
        console.error('========== ERRO AO CARREGAR CHAMADO ==========');
        console.error(err);
        console.error('STATUS:', err?.response?.status);
        console.error('DATA:', err?.response?.data);

        setError(
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Não foi possível carregar o chamado.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadTicket();
    }
  }, [id]);


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <MainCard title="Chamados">
        <Stack
          alignItems="center"
          justifyContent="center"
          spacing={2}
          sx={{ minHeight: 300 }}
        >
          <Typography variant="h4">
            Carregando chamado...
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Chamado #{id}
          </Typography>
        </Stack>
      </MainCard>
    );
  }


  // ============================================================
  // ERRO
  // ============================================================

  if (error) {
    return (
      <MainCard title="Chamados">
        <Stack
          alignItems="center"
          justifyContent="center"
          spacing={2}
          sx={{ minHeight: 300 }}
        >
          <Typography
            variant="h4"
            color="error"
          >
            Erro ao carregar chamado
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
          >
            {error}
          </Typography>

          <Button
            variant="outlined"
            startIcon={<IconArrowLeft size="1.1rem" />}
            onClick={() => navigate('/tickets')}
          >
            Voltar para chamados
          </Button>
        </Stack>
      </MainCard>
    );
  }


  // ============================================================
  // CHAMADO NÃO ENCONTRADO
  // ============================================================

  if (!ticket) {
    return (
      <MainCard title="Chamados">
        <Stack
          alignItems="center"
          justifyContent="center"
          spacing={2}
          sx={{ minHeight: 300 }}
        >
          <Typography variant="h4">
            Chamado não encontrado
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
          >
            Não foi encontrado nenhum chamado com o ID #{id}.
          </Typography>

          <Button
            variant="outlined"
            startIcon={<IconArrowLeft size="1.1rem" />}
            onClick={() => navigate('/tickets')}
          >
            Voltar para chamados
          </Button>
        </Stack>
      </MainCard>
    );
  }


  // ============================================================
  // DADOS
  // ============================================================

  const requester =
    ticket.requester ||
    ticket.solicitante ||
    null;

  const department =
    ticket.department ||
    ticket.setor ||
    null;

  const category =
    ticket.category ||
    ticket.categoria ||
    null;

  const technician =
    ticket.assignedTechnician ||
    ticket.technician ||
    ticket.tecnicoResponsavel ||
    null;


  const requesterName =
    requester?.name ||
    requester?.nome ||
    ticket.requesterName ||
    ticket.requesterNome ||
    '-';


  const departmentName =
    department?.name ||
    department?.nome ||
    ticket.departmentName ||
    ticket.departmentNome ||
    '-';


  const categoryName =
    category?.name ||
    category?.nome ||
    ticket.categoryName ||
    ticket.categoryNome ||
    '-';


  const technicianName =
    technician?.name ||
    technician?.nome ||
    ticket.assignedTechnicianName ||
    ticket.technicianName ||
    '-';


  const status = ticket.status || 'ABERTO';
  const priority = ticket.priority || 'MEDIA';


  // ============================================================
  // TEMPLATE
  // ============================================================

  return (
    <>
      {/* ========================================================
          CABEÇALHO
      ======================================================== */}

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >

        <Typography variant="h2">
          Visualizar {ticket.title || `Chamado #${id}`}
        </Typography>


        <Stack
          direction="row"
          spacing={1.5}
        >

          <Button
            variant="contained"
            color="primary"
            startIcon={<IconMessage size="1.1rem" />}
          >
            Responder
          </Button>


          <AnimateButton>

            <Button
              variant="contained"
              color="primary"
              startIcon={<IconEdit size="1.1rem" />}
              onClick={() =>
                navigate(`/tickets/${ticket.id}/edit`)
              }
            >
              Editar Chamado
            </Button>

          </AnimateButton>

        </Stack>

      </Stack>


      {/* ========================================================
          CONTEÚDO
      ======================================================== */}

      <Grid container spacing={3}>

        {/* ======================================================
            INFORMAÇÕES
        ====================================================== */}

        <Grid size={{ xs: 12, md: 8 }}>

          <MainCard
            title={
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
              >

                <IconFileDescription size="1.3rem" />

                <Typography variant="h4">
                  Informações do Chamado
                </Typography>

              </Stack>
            }
          >

            <Stack spacing={3}>

              {/* SOLICITANTE */}

              <Box>

                <Typography
                  variant="subtitle1"
                  sx={{ mb: 0.5 }}
                >
                  Solicitante
                </Typography>

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >

                  <IconUser
                    size="1.1rem"
                    stroke={1.5}
                  />

                  <Typography variant="body1">
                    {requesterName}
                  </Typography>

                </Stack>

              </Box>


              {/* TÍTULO */}

              <Box>

                <Typography
                  variant="subtitle1"
                  sx={{ mb: 0.5 }}
                >
                  Título do Chamado
                </Typography>

                <Typography
                  variant="h4"
                  fontWeight={600}
                >
                  {ticket.title || '-'}
                </Typography>

              </Box>


              {/* DESCRIÇÃO */}

              <Box>

                <Typography
                  variant="subtitle1"
                  sx={{ mb: 1 }}
                >
                  Descrição do Problema
                </Typography>

                <Box
                  sx={{
                    typography: 'body1',
                    color: 'text.secondary',

                    '& p': {
                      marginTop: 0,
                      marginBottom: 1
                    },

                    '& img': {
                      maxWidth: '100%',
                      height: 'auto'
                    }
                  }}
                  dangerouslySetInnerHTML={{
                    __html: ticket.description || '-'
                  }}
                />

              </Box>

            </Stack>

          </MainCard>

        </Grid>


        {/* ======================================================
            CLASSIFICAÇÃO
        ====================================================== */}

        <Grid size={{ xs: 12, md: 4 }}>

          <MainCard
            title={
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
              >

                <IconInfoCircle size="1.3rem" />

                <Typography variant="h4">
                  Classificação
                </Typography>

              </Stack>
            }
          >

            <Stack spacing={3}>

              {/* STATUS */}

              <Box>

                <Typography
                  variant="subtitle1"
                  sx={{ mb: 1 }}
                >
                  Status
                </Typography>

                <Chip
                  label={
                    STATUS_LABELS[status] || status
                  }
                  color={
                    STATUS_COLORS[status] || 'default'
                  }
                  size="small"
                />

              </Box>


              {/* PRIORIDADE */}

              <Box>

                <Typography
                  variant="subtitle1"
                  sx={{ mb: 1 }}
                >
                  Prioridade
                </Typography>

                <Chip
                  label={
                    PRIORITY_LABELS[priority] || priority
                  }
                  color={
                    PRIORITY_COLORS[priority] || 'default'
                  }
                  size="small"
                />

              </Box>


              {/* SETOR */}

              <Box>

                <Typography
                  variant="subtitle1"
                  sx={{ mb: 0.5 }}
                >
                  Setor Responsável
                </Typography>

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >

                  <IconBuilding
                    size="1.1rem"
                    stroke={1.5}
                  />

                  <Typography variant="body1">
                    {departmentName}
                  </Typography>

                </Stack>

              </Box>


              {/* CATEGORIA */}

              <Box>

                <Typography
                  variant="subtitle1"
                  sx={{ mb: 0.5 }}
                >
                  Categoria
                </Typography>

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >

                  <IconTag
                    size="1.1rem"
                    stroke={1.5}
                  />

                  <Typography variant="body1">
                    {categoryName}
                  </Typography>

                </Stack>

              </Box>


              {/* TÉCNICO */}

              <Box>

                <Typography
                  variant="subtitle1"
                  sx={{ mb: 0.5 }}
                >
                  Técnico Responsável
                </Typography>

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >

                  <IconUser
                    size="1.1rem"
                    stroke={1.5}
                  />

                  <Typography variant="body1">
                    {technicianName}
                  </Typography>

                </Stack>

              </Box>

            </Stack>

          </MainCard>

        </Grid>

      </Grid>
    </>
  );
};

export default TicketView;