// src/views/tickets/TicketView.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  useTheme,
  Box,
  Button,
  Grid,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';

import MainCard from 'ui-component/cards/MainCard';
import AnimateButton from 'ui-component/extended/AnimateButton';

import {
  IconArrowLeft,
  IconEdit,
  IconBuilding,
  IconTag,
  IconFileDescription,
  IconUser
} from '@tabler/icons-react';

import {
  addTicketComment,
  changeTicketPriority,
  changeTicketStatus,
  getTicketById,
  getTicketComments
} from 'services/ticketService';

import { toAbsoluteImageUrls } from 'utils/ticketImages';

import {
  PriorityBadge,
  StatusBadge,
  PRIORITY_CONFIG
} from 'ui-component/tickets/TicketBadges';
import TechnicianAvatars from 'ui-component/tickets/TechnicianAvatars';

import TicketComments from './components/TicketComments';

// ==============================|| STATUS ||============================== //

const STATUS_TRANSITIONS = {
  ABERTO: ['EM_ANDAMENTO', 'CANCELADO'],
  EM_ANDAMENTO: ['RESOLVIDO', 'CANCELADO', 'ABERTO'],
  RESOLVIDO: ['FECHADO', 'EM_ANDAMENTO'],
  FECHADO: ['ABERTO'],
  CANCELADO: []
};

const STATUSES_REQUIRING_REASON = ['FECHADO', 'CANCELADO'];
const CLOSED_STATUSES = ['FECHADO', 'CANCELADO'];

// ==============================|| COMPONENT ||============================== //

const TicketView = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState(null);

  // ---- image preview ----
  const [selectedImage, setSelectedImage] = useState(null);

  // ---- status change ----
  const [pendingStatus, setPendingStatus] = useState(null);
  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [statusReasonInput, setStatusReasonInput] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);

  // ---- priority change ----
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [priorityError, setPriorityError] = useState(null);

  // ============================================================
  // LOAD TICKET
  // ============================================================

  useEffect(() => {
    const loadTicket = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getTicketById(id);

        setTicket(response?.data ?? response);
      } catch (err) {
        console.error(err);

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
  // LOAD COMMENTS
  // ============================================================

  useEffect(() => {
    if (!id) return;

    getTicketComments(id)
      .then((response) =>
        setComments(Array.isArray(response) ? response : response?.data || [])
      )
      .catch(() =>
        setCommentError('Não foi possível carregar o histórico deste chamado.')
      );
  }, [id]);

  // ============================================================
  // ADD COMMENT
  // ============================================================

  const handleAddComment = async () => {
    const content = comment.trim();

    if (!content || commentLoading) return;

    try {
      setCommentLoading(true);
      setCommentError(null);

      const response = await addTicketComment(id, content);
      const createdComment = response?.data || response;

      setComments((current) => [...current, createdComment]);

      setComment('');
    } catch (err) {
      setCommentError(err.message || 'Não foi possível adicionar o comentário.');
    } finally {
      setCommentLoading(false);
    }
  };

  // ============================================================
  // IMAGE PREVIEW
  // ============================================================

  const handleDescriptionClick = (event) => {
    const image = event.target.closest('img');

    if (!image) return;

    setSelectedImage(image.src);
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  // ============================================================
  // STATUS CHANGE
  // ============================================================

  const status = ticket?.status || 'ABERTO';

  const availableTransitions = STATUS_TRANSITIONS[status] || [];

  const isTicketClosed = CLOSED_STATUSES.includes(status);

  const requestStatusChange = (newStatus) => {
    setPendingStatus(newStatus);
    setStatusReasonInput('');
    setStatusError(null);

    if (STATUSES_REQUIRING_REASON.includes(newStatus)) {
      setReasonDialogOpen(true);
    } else {
      applyStatusChange(newStatus, null);
    }
  };

  const applyStatusChange = async (newStatus, reason) => {
    try {
      setStatusLoading(true);
      setStatusError(null);

      await changeTicketStatus(id, newStatus, reason);

      setTicket((prev) => ({
        ...prev,
        status: newStatus,
        statusReason: reason,
        statusChangedAt: new Date().toISOString()
      }));

      setReasonDialogOpen(false);
      setPendingStatus(null);
    } catch (err) {
      setStatusError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Não foi possível alterar o status do chamado.'
      );
    } finally {
      setStatusLoading(false);
    }
  };

  const isClosingAction =
    pendingStatus && STATUSES_REQUIRING_REASON.includes(pendingStatus);

  const reasonTooShort =
    isClosingAction && statusReasonInput.trim().length === 0;

  // ============================================================
  // PRIORITY CHANGE
  // ============================================================

  const priority = ticket?.priority || 'MEDIA';

  const handlePriorityChange = async (newPriority) => {
    if (newPriority === priority) return;

    try {
      setPriorityLoading(true);
      setPriorityError(null);

      await changeTicketPriority(id, newPriority);

      setTicket((prev) => ({
        ...prev,
        priority: newPriority
      }));
    } catch (err) {
      setPriorityError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Não foi possível alterar a prioridade.'
      );
    } finally {
      setPriorityLoading(false);
    }
  };

  // ============================================================
  // LOADING / ERROR STATES
  // ============================================================

  if (loading) {
    return (
      <MainCard title="Chamados">
        <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ minHeight: 300 }}>
          <Typography variant="h4">Carregando chamado...</Typography>
          <Typography variant="body2" color="text.secondary">
            Chamado #{id}
          </Typography>
        </Stack>
      </MainCard>
    );
  }

  if (error) {
    return (
      <MainCard title="Chamados">
        <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ minHeight: 300 }}>
          <Typography variant="h4" color="error">
            Erro ao carregar chamado
          </Typography>
          <Typography variant="body1" color="text.secondary">
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

  if (!ticket) {
    return (
      <MainCard title="Chamados">
        <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ minHeight: 300 }}>
          <Typography variant="h4">Chamado não encontrado</Typography>
          <Typography variant="body1" color="text.secondary">
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

  const requesterName = ticket?.requesterName || ticket?.requester?.name || '-';
  const departmentName = ticket?.departmentName || ticket?.department?.name || '-';
  const categoryName = ticket?.categoryName || '-';

  const techNames =
    ticket?.technicianNames && ticket.technicianNames.length > 0
      ? ticket.technicianNames
      : ticket?.technicianName
      ? [ticket.technicianName]
      : [];

  const formatDateTime = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleString('pt-BR') : '-';

  return (
    <>
      {/* HEADER */}
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="h2">
              {ticket.title || `Chamado #${id}`}
            </Typography>
          </Stack>

          <AnimateButton>
            <Button
              variant="contained"
              color="primary"
              startIcon={<IconEdit size="1.1rem" />}
              onClick={() => navigate(`/tickets/${ticket.id}/edit`)}
              disabled={isTicketClosed}
            >
              Editar Chamado
            </Button>
          </AnimateButton>
        </Stack>
      </Stack>

      {isTicketClosed && (
        <Alert
          severity={status === 'CANCELADO' ? 'error' : 'info'}
          sx={{ mb: 3 }}
        >
          Este chamado está {status === 'CANCELADO' ? 'cancelado' : 'fechado'}
          {ticket.statusChangedAt
            ? ` desde ${new Date(ticket.statusChangedAt).toLocaleString('pt-BR')}`
            : ''}
          .
          {ticket.statusReason ? ` Motivo: ${ticket.statusReason}` : ''}
        </Alert>
      )}

      {/* CONTENT */}
      <Grid container spacing={3}>
        {/* INFORMAÇÕES PRINCIPAIS */}
        <Grid size={{ xs: 12, md: 9 }}>
          <MainCard
            title={
              <Stack direction="row" alignItems="center" spacing={1}>
                <IconFileDescription size="1.3rem" />
                <Typography variant="h4">Informações do Chamado</Typography>
              </Stack>
            }
          >
            {/* DESCRIÇÃO DO PROBLEMA */}
            <Box
              onClick={handleDescriptionClick}
              sx={{
                typography: 'body1',
                color: 'text.secondary',
                '& p': { marginTop: 0, marginBottom: 1 },
                '& img': {
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: 250, // Tamanho reduzido para a imagem na tela principal
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  borderRadius: 1,
                  cursor: 'zoom-in',
                  transition: 'opacity 0.2s ease',
                  '&:hover': { opacity: 0.85 }
                }
              }}
              dangerouslySetInnerHTML={{
                __html: toAbsoluteImageUrls(ticket.description || '-')
              }}
            />
          </MainCard>
          {/* COMENTÁRIOS */}
      <TicketComments
        comments={comments}
        comment={comment}
        onCommentChange={setComment}
        onSubmit={handleAddComment}
        commentLoading={commentLoading}
        commentError={commentError}
        isTicketClosed={isTicketClosed}
        status={status}
      />

        </Grid>

        {/* COLUNA DIREITA - CLASSIFICAÇÃO */}
        <Grid size={{ xs: 12, md: 3 }}>
          <MainCard
            title={
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <IconTag size="1.4rem" style={{ color: 'var(--mui-palette-primary-main)' }} />
                <Typography variant="h4">Classificação</Typography>
              </Stack>
            }
          >
            <Grid container spacing={2.5}>
              {/* PRIORIDADE */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  select
                  fullWidth
                  label={
                    <span>
                      Prioridade <span style={{ color: theme.palette.error.main }}>*</span>
                    </span>
                  }
                  value={priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  disabled={priorityLoading || isTicketClosed}
                  SelectProps={{
                    renderValue: (value) => <PriorityBadge priority={value} />
                  }}
                  sx={{
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }
                  }}
                >
                  {Object.keys(PRIORITY_CONFIG).map((pKey) => (
                    <MenuItem key={pKey} value={pKey}>
                      <PriorityBadge priority={pKey} />
                    </MenuItem>
                  ))}
                </TextField>
                {priorityError && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {priorityError}
                  </Typography>
                )}
              </Grid>

              {/* STATUS */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  select
                  fullWidth
                  label={
                    <span>
                      Status <span style={{ color: theme.palette.error.main }}>*</span>
                    </span>
                  }
                  value={status}
                  onChange={(e) => requestStatusChange(e.target.value)}
                  disabled={statusLoading || availableTransitions.length === 0}
                  SelectProps={{
                    renderValue: (value) => <StatusBadge status={value} />
                  }}
                  sx={{
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }
                  }}
                >
                  <MenuItem value={status} disabled>
                    <StatusBadge status={status} />
                  </MenuItem>

                  {availableTransitions.map((nextStatus) => (
                    <MenuItem key={nextStatus} value={nextStatus}>
                      <StatusBadge status={nextStatus} />
                    </MenuItem>
                  ))}
                </TextField>
                {statusError && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {statusError}
                  </Typography>
                )}
              </Grid>

              {/* SOLICITANTE */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Solicitante
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconUser size="1.2rem" />
                  <Typography variant="body1">{requesterName}</Typography>
                </Stack>
              </Grid>

              {/* SETOR RESPONSÁVEL */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Setor Responsável
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconBuilding size="1.2rem" />
                  <Typography variant="body1">{departmentName}</Typography>
                </Stack>
              </Grid>

              {/* CATEGORIA */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Categoria
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconTag size="1.2rem" />
                  <Typography variant="body1">{categoryName}</Typography>
                </Stack>
              </Grid>

              {/* TÉCNICO RESPONSÁVEL */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Técnico Responsável
                </Typography>
                <TechnicianAvatars
                  names={techNames}
                  max={1}
                  size={28}
                  emptyLabel="Não atribuído"
                />
              </Grid>

              {/* DATAS */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Aberto em
                </Typography>
                <Typography variant="body2">{formatDateTime(ticket.createdAt)}</Typography>
              </Grid>

              {ticket.updatedAt && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Última atualização
                  </Typography>
                  <Typography variant="body2">{formatDateTime(ticket.updatedAt)}</Typography>
                </Grid>
              )}
            </Grid>
          </MainCard>
          
        </Grid>
      </Grid>

                               
      {/* IMAGE PREVIEW DIALOG */}
      <Dialog
        open={Boolean(selectedImage)}
        onClose={handleCloseImage}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent
          sx={{
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default'
          }}
        >
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="Imagem do chamado"
              sx={{
                display: 'block',
                maxWidth: '100%',
                maxHeight: '85vh',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: 1
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* STATUS REASON DIALOG */}
      <Dialog
        open={reasonDialogOpen}
        onClose={() => !statusLoading && setReasonDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {pendingStatus === 'CANCELADO' ? 'Cancelar chamado' : 'Fechar chamado'}
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Informe o motivo — isso fica registrado no chamado.
          </Typography>

          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            value={statusReasonInput}
            onChange={(event) => setStatusReasonInput(event.target.value)}
            placeholder="Ex: Problema resolvido após reinstalação do driver."
            disabled={statusLoading}
          />

          {statusError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {statusError}
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setReasonDialogOpen(false)}
            disabled={statusLoading}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            color={pendingStatus === 'CANCELADO' ? 'error' : 'primary'}
            disabled={reasonTooShort || statusLoading}
            onClick={() =>
              applyStatusChange(pendingStatus, statusReasonInput.trim())
            }
          >
            {statusLoading ? 'Salvando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TicketView;