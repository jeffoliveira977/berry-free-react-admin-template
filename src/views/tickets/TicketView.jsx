import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  Typography,
  TextField,
  Menu,
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
  IconMessage,
  IconUser,
  IconBuilding,
  IconTag,
  IconInfoCircle,
  IconFileDescription,
  IconSend
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
  PRIORITY_CONFIG,
  STATUS_CONFIG
} from 'ui-component/tickets/TicketBadges';

// ==============================|| STATUS ||============================== //

// Valid transitions from each status
const STATUS_TRANSITIONS = {
  ABERTO: ['EM_ATENDIMENTO', 'CANCELADO'],
  EM_ATENDIMENTO: ['RESOLVIDO', 'CANCELADO', 'ABERTO'],
  RESOLVIDO: ['FECHADO', 'EM_ATENDIMENTO'],
  FECHADO: ['ABERTO'],
  CANCELADO: []
};

// Statuses that require a reason
const STATUSES_REQUIRING_REASON = ['FECHADO', 'CANCELADO'];

// Statuses that close the ticket
const CLOSED_STATUSES = ['FECHADO', 'CANCELADO'];

// ==============================|| COMPONENT ||============================== //

const TicketView = () => {
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
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
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
  // LOAD COMMENTS
  // ============================================================

  useEffect(() => {
    if (!id) return;

    getTicketComments(id)
      .then((response) =>
        setComments(
          Array.isArray(response)
            ? response
            : response?.data || []
        )
      )
      .catch(() =>
        setCommentError(
          'Não foi possível carregar o histórico deste chamado.'
        )
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

      setComments((current) => [
        ...current,
        createdComment
      ]);

      setComment('');
    } catch (err) {
      setCommentError(
        err.message ||
        'Não foi possível adicionar o comentário.'
      );
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

  const availableTransitions =
    STATUS_TRANSITIONS[status] || [];

  const isTicketClosed =
    CLOSED_STATUSES.includes(status);

  const requestStatusChange = (newStatus) => {
    setStatusMenuAnchor(null);
    setPendingStatus(newStatus);
    setStatusReasonInput('');
    setStatusError(null);

    if (
      STATUSES_REQUIRING_REASON.includes(newStatus)
    ) {
      setReasonDialogOpen(true);
    } else {
      applyStatusChange(newStatus, null);
    }
  };

  const applyStatusChange = async (
    newStatus,
    reason
  ) => {
    try {
      setStatusLoading(true);
      setStatusError(null);

      await changeTicketStatus(
        id,
        newStatus,
        reason
      );

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
    pendingStatus &&
    STATUSES_REQUIRING_REASON.includes(
      pendingStatus
    );

  const reasonTooShort =
    isClosingAction &&
    statusReasonInput.trim().length === 0;

  // ============================================================
  // PRIORITY CHANGE
  // ============================================================

  const handlePriorityChange = async (
    newPriority
  ) => {
    if (newPriority === priority) return;

    try {
      setPriorityLoading(true);
      setPriorityError(null);

      await changeTicketPriority(
        id,
        newPriority
      );

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
  // ERROR
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
            startIcon={
              <IconArrowLeft size="1.1rem" />
            }
            onClick={() =>
              navigate('/tickets')
            }
          >
            Voltar para chamados
          </Button>
        </Stack>
      </MainCard>
    );
  }

  // ============================================================
  // TICKET NOT FOUND
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
            Não foi encontrado nenhum chamado
            com o ID #{id}.
          </Typography>

          <Button
            variant="outlined"
            startIcon={
              <IconArrowLeft size="1.1rem" />
            }
            onClick={() =>
              navigate('/tickets')
            }
          >
            Voltar para chamados
          </Button>
        </Stack>
      </MainCard>
    );
  }

  // ============================================================
  // DATA
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

  const technicianNames =
    ticket.technicianNames?.length
      ? ticket.technicianNames.join(', ')
      : technicianName;

  const priority =
    ticket.priority || 'MEDIA';

  // ============================================================
  // TEMPLATE
  // ============================================================

  return (
    <>
      {/* ========================================================
          HEADER
      ======================================================== */}

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h2">
          Visualizar{' '}
          {ticket.title ||
            `Chamado #${id}`}
        </Typography>

        <Stack
          direction="row"
          spacing={1.5}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={
              <IconMessage size="1.1rem" />
            }
            onClick={() =>
              document
                .getElementById(
                  'ticket-comments'
                )
                ?.scrollIntoView({
                  behavior: 'smooth'
                })
            }
            disabled={isTicketClosed}
          >
            Responder
          </Button>

          <AnimateButton>
            <Button
              variant="contained"
              color="primary"
              startIcon={
                <IconEdit size="1.1rem" />
              }
              onClick={() =>
                navigate(
                  `/tickets/${ticket.id}/edit`
                )
              }
              disabled={isTicketClosed}
            >
              Editar Chamado
            </Button>
          </AnimateButton>
        </Stack>
      </Stack>

      {isTicketClosed && (
        <Alert
          severity={
            status === 'CANCELADO'
              ? 'error'
              : 'info'
          }
          sx={{ mb: 3 }}
        >
          Este chamado está{' '}
          {status === 'CANCELADO'
            ? 'cancelado'
            : 'fechado'}
          {ticket.statusChangedAt
            ? ` desde ${new Date(
              ticket.statusChangedAt
            ).toLocaleString(
              'pt-BR'
            )}`
            : ''}
          .
          {ticket.statusReason
            ? ` Motivo: ${ticket.statusReason}`
            : ''}
        </Alert>
      )}

      {/* ========================================================
          CONTENT
      ======================================================== */}

      <Grid
        container
        spacing={3}
      >
        {/* ======================================================
            INFORMATION
        ====================================================== */}

        <Grid
          size={{
            xs: 12,
            md: 8
          }}
        >
          <MainCard
            title={
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
              >
                <IconFileDescription
                  size="1.3rem"
                />

                <Typography variant="h4">
                  Informações do Chamado
                </Typography>
              </Stack>
            }
          >
            <Stack spacing={3}>
              {/* REQUESTER */}

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

              {/* DESCRIPTION */}

              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 1 }}
                >
                  Descrição do Problema
                </Typography>

                <Box
                  onClick={
                    handleDescriptionClick
                  }
                  sx={{
                    typography: 'body1',
                    color: 'text.secondary',

                    '& p': {
                      marginTop: 0,
                      marginBottom: 1
                    },

                    '& img': {
                      display: 'block',
                      maxWidth: '100%',
                      maxHeight: 400,
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      borderRadius: 1,
                      cursor: 'zoom-in',
                      transition:
                        'opacity 0.2s ease',

                      '&:hover': {
                        opacity: 0.85
                      }
                    }
                  }}
                  dangerouslySetInnerHTML={{
                    __html:
                      toAbsoluteImageUrls(
                        ticket.description ||
                        '-'
                      )
                  }}
                />
              </Box>
            </Stack>
          </MainCard>
        </Grid>

        {/* ======================================================
            CLASSIFICATION
        ====================================================== */}

        <Grid
          size={{
            xs: 12,
            md: 4
          }}
        >
          <MainCard
            title={
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
              >
                <IconInfoCircle
                  size="1.3rem"
                />

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

                <TextField
                  select
                  fullWidth
                  size="small"
                  value={status}
                  onChange={(event) =>
                    requestStatusChange(
                      event.target.value
                    )
                  }
                  disabled={
                    statusLoading ||
                    availableTransitions.length ===
                    0
                  }
                  SelectProps={{
                    renderValue: (value) => (
                      <StatusBadge
                        status={value}
                      />
                    )
                  }}
                >
                  <MenuItem
                    value={status}
                    disabled
                  >
                    <StatusBadge
                      status={status}
                    />
                  </MenuItem>

                  {availableTransitions.map(
                    (s) => (
                      <MenuItem
                        key={s}
                        value={s}
                      >
                        <StatusBadge
                          status={s}
                        />
                      </MenuItem>
                    )
                  )}
                </TextField>
              </Box>

              {/* PRIORITY */}

              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 1 }}
                >
                  Prioridade
                </Typography>

                <TextField
                  select
                  fullWidth
                  size="small"
                  value={priority}
                  onChange={(event) =>
                    handlePriorityChange(
                      event.target.value
                    )
                  }
                  disabled={
                    priorityLoading ||
                    isTicketClosed
                  }
                  SelectProps={{
                    renderValue: (value) => (
                      <PriorityBadge
                        priority={value}
                      />
                    )
                  }}
                >
                  {Object.keys(
                    PRIORITY_CONFIG
                  ).map((p) => (
                    <MenuItem
                      key={p}
                      value={p}
                    >
                      <PriorityBadge
                        priority={p}
                      />
                    </MenuItem>
                  ))}
                </TextField>

                {priorityError && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{
                      display: 'block',
                      mt: 0.5
                    }}
                  >
                    {priorityError}
                  </Typography>
                )}
              </Box>

              {/* DEPARTMENT */}

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

              {/* CATEGORY */}

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

              {/* TECHNICIAN */}

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
                    {technicianNames}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>

      {/* ========================================================
          COMMENTS
      ======================================================== */}

      <MainCard
        id="ticket-comments"
        title="Histórico e interação"
        sx={{ mt: 3 }}
      >
        <Stack spacing={2}>
          {comments.length === 0 && (
            <Typography color="text.secondary">
              Nenhum comentário ainda.
            </Typography>
          )}

          {comments.map((item) => (
            <Box
              key={item.id}
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor:
                  'background.default'
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                spacing={2}
              >
                <Typography variant="subtitle2">
                  {item.authorName ||
                    'Usuário'}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {item.createdAt
                    ? new Date(
                      item.createdAt
                    ).toLocaleString(
                      'pt-BR'
                    )
                    : ''}
                </Typography>
              </Stack>

              <Typography
                sx={{
                  mt: 0.5,
                  whiteSpace: 'pre-wrap'
                }}
              >
                {item.content}
              </Typography>
            </Box>
          ))}

          {commentError && (
            <Typography color="error">
              {commentError}
            </Typography>
          )}

          {isTicketClosed ? (
            <Alert severity="info">
              Este chamado está{' '}
              {status === 'CANCELADO'
                ? 'cancelado'
                : 'fechado'}{' '}
              — não é possível adicionar
              novas mensagens.
            </Alert>
          ) : (
            <Stack
              direction={{
                xs: 'column',
                sm: 'row'
              }}
              spacing={1}
            >
              <TextField
                fullWidth
                multiline
                minRows={2}
                value={comment}
                onChange={(event) =>
                  setComment(
                    event.target.value
                  )
                }
                placeholder="Escreva uma mensagem para os participantes do chamado..."
                disabled={commentLoading}
              />

              <Button
                variant="contained"
                onClick={handleAddComment}
                disabled={
                  !comment.trim() ||
                  commentLoading
                }
                startIcon={
                  <IconSend size="1.1rem" />
                }
                sx={{
                  minWidth: {
                    sm: 130
                  }
                }}
              >
                Enviar
              </Button>
            </Stack>
          )}
        </Stack>
      </MainCard>

      {/* ========================================================
          IMAGE PREVIEW DIALOG
      ======================================================== */}

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

      {/* ========================================================
          STATUS REASON DIALOG
      ======================================================== */}

      <Dialog
        open={reasonDialogOpen}
        onClose={() =>
          !statusLoading &&
          setReasonDialogOpen(false)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {pendingStatus === 'CANCELADO'
            ? 'Cancelar chamado'
            : 'Fechar chamado'}
        </DialogTitle>

        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Informe o motivo — isso fica
            registrado no chamado.
          </Typography>

          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            value={statusReasonInput}
            onChange={(event) =>
              setStatusReasonInput(
                event.target.value
              )
            }
            placeholder="Ex: Problema resolvido após reinstalação do driver."
            disabled={statusLoading}
          />

          {statusError && (
            <Alert
              severity="error"
              sx={{ mt: 2 }}
            >
              {statusError}
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setReasonDialogOpen(false)
            }
            disabled={statusLoading}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            color={
              pendingStatus === 'CANCELADO'
                ? 'error'
                : 'primary'
            }
            disabled={
              reasonTooShort ||
              statusLoading
            }
            onClick={() =>
              applyStatusChange(
                pendingStatus,
                statusReasonInput.trim()
              )
            }
          >
            {statusLoading
              ? 'Salvando...'
              : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TicketView;