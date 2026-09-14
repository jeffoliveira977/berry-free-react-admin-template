import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Material-UI components
import {
  useTheme,
  Box,
  Button,
  Grid,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';

// Componentes específicos de criação de chamados
import MainCard from 'ui-component/cards/MainCard';
import AnimateButton from 'ui-component/extended/AnimateButton';

// Ícones da tela de criação de chamados
import { IconNote, IconTag, IconCheck, IconX } from '@tabler/icons-react';

// Editor de Texto Rico (Rich Text Editor)
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Serviços e Hooks
import { useAuth } from 'hooks/useAuth';
import { createTicket, getTicketById, updateTicket } from 'services/ticketService';
import api from 'utils/api';
import { toAbsoluteImageUrls, toAbsoluteUrl, toRelativeImageUrls } from 'utils/ticketImages';
import { PriorityBadge } from 'ui-component/tickets/TicketBadges';

// ==============================|| COMPONENTE DE CRIAÇÃO/EDIÇÃO DE CHAMADO ||============================== //

const TicketForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditMode = Boolean(id);

  // Estados do formulário
  const [ticketTitle, setTicketTitle] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [priority, setPriority] = useState('MEDIA');
  const [responsibleSector, setResponsibleSector] = useState([]);
  const [category, setCategory] = useState('');
  const [technicianIds, setTechnicianIds] = useState([]);

  // Estados de dados e carregamento
  const [sectors, setSectors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loadingSectors, setLoadingSectors] = useState(true);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const quillRef = useRef(null);

  // Carregar dados do chamado em modo de edição
  useEffect(() => {
    if (!id) return;

    const loadTicket = async () => {
      try {
        const response = await getTicketById(id);
        const ticket = response?.data || response;

        setTicketTitle(ticket.title || '');
        setProblemDescription(toAbsoluteImageUrls(ticket.description || ''));
        setPriority(ticket.priority || 'MEDIA');

        // Usa o categoryId retornado pelo backend (campo Long dedicado)
        setCategory(ticket.categoryId != null ? String(ticket.categoryId) : '');

        setResponsibleSector(ticket.departmentId ? [String(ticket.departmentId)] : []);
        setTechnicianIds((ticket.technicianIds || []).map((technicianId) => String(technicianId)));
      } catch (err) {
        setError(err.message || 'Erro ao carregar o chamado para edição.');
      }
    };

    loadTicket();
  }, [id]);

  // Buscar setores e categorias ao montar o componente
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingSectors(true);

        // Buscar setores
        const sectorsRes = await api.get('/api/departments');
        setSectors(Array.isArray(sectorsRes) ? sectorsRes : sectorsRes?.data || []);

        // Buscar categorias
        const categoriesRes = await api.get('/api/categories');
        const fetchedCategories = Array.isArray(categoriesRes) ? categoriesRes : categoriesRes?.data || [];
        setCategories(fetchedCategories);
      } catch (err) {
        console.error('Erro ao buscar dados iniciais:', err);
        setError('Erro ao carregar setores e categorias');
      } finally {
        setLoadingSectors(false);
      }
    };

    fetchInitialData();
  }, []);

  // Buscar técnicos quando os setores mudarem
  useEffect(() => {
    if (!responsibleSector || responsibleSector.length === 0) {
      setTechnicians([]);
      setTechnicianIds([]);
      return;
    }

    const fetchTechnicians = async () => {
      try {
        setLoadingTechnicians(true);
        setError(null);

        const promises = responsibleSector.map((sectorId) => {
          const deptId = typeof sectorId === 'object' ? sectorId.id : sectorId;
          return api.get('/api/technicians', { params: { departmentId: deptId } });
        });

        const responses = await Promise.all(promises);

        let allTechData = [];
        responses.forEach((res) => {
          let techData = [];
          if (Array.isArray(res)) {
            techData = res;
          } else if (Array.isArray(res?.data)) {
            techData = res.data;
          }
          allTechData = [...allTechData, ...techData];
        });

        const uniqueTechs = Array.from(new Map(allTechData.map((item) => [String(item.id), item])).values());

        setTechnicians(uniqueTechs);
        setTechnicianIds((prev) => prev.filter((id) => uniqueTechs.some((tech) => String(tech.id) === String(id))));
      } catch (err) {
        console.error('Erro ao buscar técnicos:', err);
        setError('Erro ao carregar técnicos dos setores');
        setTechnicians([]);
      } finally {
        setLoadingTechnicians(false);
      }
    };

    fetchTechnicians();
  }, [responsibleSector]);

  const isValid = ticketTitle.trim() !== '' && problemDescription.trim() !== '' && priority && category;

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/png,image/jpeg,image/gif,image/webp');
    input.click();

    input.onchange = async () => {
      const file = input.files && input.files[0];
      if (!file) return;

      const quill = quillRef.current?.getEditor();
      const range = quill?.getSelection(true);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await api.post('/api/uploads/ticket-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const imageUrl = toAbsoluteUrl(response?.url || response?.data?.url);

        if (quill && range && imageUrl) {
          quill.insertEmbed(range.index, 'image', imageUrl, 'user');
          quill.setSelection(range.index + 1);
        }
      } catch (err) {
        console.error('Erro ao enviar imagem:', err);
        setError(err.message || 'Erro ao enviar imagem. Tente novamente.');
      }
    };
  }, []);

  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          ['bold', 'italic', 'underline', 'strike'],
          [{ script: 'sub' }, { script: 'super' }],
          ['link', 'image'],
          [{ header: '2' }, { header: '3' }],
          [{ align: [] }],
          ['blockquote', 'code-block'],
          [{ list: 'bullet' }, { list: 'ordered' }],
          [{ table: true }],
          ['clean']
        ],
        handlers: {
          image: imageHandler
        }
      }
    }),
    [imageHandler]
  );

  const handleSubmit = async () => {
    if (!isValid) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const ticketData = {
        title: ticketTitle,
        description: toRelativeImageUrls(problemDescription),
        priority,
        categoryId: category !== '' ? Number(category) : null,
        departmentIds: responsibleSector.map((id) => Number(id)).filter((id) => Number.isFinite(id)),
        departmentId:
          responsibleSector.length > 0 && Number.isFinite(Number(responsibleSector[0]))
            ? Number(responsibleSector[0])
            : null,
        assignedTechnicianIds: technicianIds
          .map((id) => Number(id))
          .filter((id) => Number.isFinite(id)),
        assignedTechnicianId:
          technicianIds.length > 0 && Number.isFinite(Number(technicianIds[0]))
            ? Number(technicianIds[0])
            : null
      };

      if (isEditMode) {
        await updateTicket(id, ticketData);
      } else {
        await createTicket(ticketData);
      }

      setSuccess(true);

      setTimeout(() => {
        navigate('/tickets');
      }, 1500);
    } catch (err) {
      console.error('Erro ao salvar ticket:', err);
      setError(err.message || 'Erro ao salvar chamado. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        mb={3}
        spacing={1.5}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: 'var(--mui-palette-background-default)',
          py: 1.5,
          px: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<IconX size="1.1rem" />}
          onClick={() => navigate(isEditMode ? `/tickets/${id}` : '/tickets')}
          disabled={submitting}
          sx={{
            borderColor: 'divider',
            color: 'text.primary',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          Cancelar
        </Button>
        <AnimateButton>
          <Button
            variant="contained"
            disableElevation
            startIcon={<IconCheck size="1.1rem" />}
            disabled={!isValid || submitting || loadingSectors}
            onClick={handleSubmit}
            sx={{
              bgcolor: 'primary.main',
              color: '#ffffff',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'primary.dark'
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'action.disabled'
              }
            }}
          >
            {submitting
              ? isEditMode
                ? 'Salvando...'
                : 'Criando...'
              : isEditMode
                ? 'Salvar alterações'
                : 'Criar Chamado'}
          </Button>
        </AnimateButton>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(false)} sx={{ mb: 2 }}>
          {isEditMode ? 'Chamado atualizado com sucesso!' : 'Chamado criado com sucesso!'} Redirecionando...
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <MainCard
            title={
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <IconNote size="1.4rem" style={{ color: 'var(--mui-palette-primary-main)' }} />
                <Typography variant="h4">{isEditMode ? 'Editar Chamado' : 'Informações do Chamado'}</Typography>
              </Stack>
            }
          >
            {loadingSectors ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" component="label" htmlFor="ticketTitle" gutterBottom>
                    Título do Chamado <span style={{ color: theme.palette.error.main }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    id="ticketTitle"
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                    placeholder="Ex: Computador não liga"
                    disabled={submitting}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" component="label" gutterBottom>
                    Descrição do Problema <span style={{ color: theme.palette.error.main }}>*</span>
                  </Typography>
                  <Box
                    sx={{
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: 'transparent',
                      '&:hover': {
                        borderColor: 'text.primary'
                      },
                      '&:focus-within': {
                        borderColor: 'primary.main',
                        boxShadow: (theme) => `0 0 0 1px ${theme.palette.primary.main}`
                      },
                      '& .ql-toolbar, & .ql-container': {
                        border: 'none !important'
                      },           
                      '& .ql-toolbar': {
                        borderBottom: 'none !important',
                        borderColor: 'divider !important',
                        backgroundColor: 'transparent'
                      },
                      '& .ql-editor, & .ProseMirror': {
                        color: 'text.primary',
                        minHeight: '150px'
                      },
                      '& .ql-editor.ql-blank::before': {
                        color: 'text.secondary'
                      },
                      '& .ql-stroke': {
                        stroke: 'var(--mui-palette-text-primary, currentColor) !important'
                      },
                      '& .ql-fill': {
                        fill: 'var(--mui-palette-text-primary, currentColor) !important'
                      },
                      '& .ql-picker': {
                        color: 'text.primary !important'
                      }
                    }}
                  >
                    <ReactQuill
                      ref={quillRef}
                      theme="snow"
                      value={problemDescription}
                      onChange={setProblemDescription}
                      modules={quillModules}
                      placeholder="Descreva detalhadamente o problema..."
                      readOnly={submitting}
                    />
                  </Box>
                </Grid>
              </Grid>
            )}
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <MainCard
            title={
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <IconTag size="1.4rem" style={{ color: 'var(--mui-palette-primary-main)' }} />
                <Typography variant="h4">Classificação</Typography>
              </Stack>
            }
          >
            {loadingSectors ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={40} />
              </Box>
            ) : (
              <Grid container spacing={2}>
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
                    onChange={(e) => setPriority(e.target.value)}
                    disabled={submitting}
                    SelectProps={{
                      renderValue: (value) => <PriorityBadge priority={value} />
                    }}
                  >
                    <MenuItem value="BAIXA"><PriorityBadge priority="BAIXA" /></MenuItem>
                    <MenuItem value="MEDIA"><PriorityBadge priority="MEDIA" /></MenuItem>
                    <MenuItem value="ALTA"><PriorityBadge priority="ALTA" /></MenuItem>
                    <MenuItem value="URGENTE"><PriorityBadge priority="URGENTE" /></MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    select
                    fullWidth
                    label={
                      <span>
                        Categoria <span style={{ color: theme.palette.error.main }}>*</span>
                      </span>
                    }
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={submitting || categories.length === 0}
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em style={{ fontStyle: 'normal', color: theme.palette.text.secondary }}>Selecione uma opção</em>
                    </MenuItem>
                    {categories.map((cat) => {
                      const catValue = typeof cat === 'object' ? cat.id : cat;
                      const catLabel = typeof cat === 'object' ? cat.name || cat.nome : cat;
                      return (
                        <MenuItem key={String(catValue)} value={String(catValue)}>
                          {catLabel}
                        </MenuItem>
                      );
                    })}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" component="label" gutterBottom>
                    Setor Responsável
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    value={responsibleSector}
                    onChange={(e) => {
                      const val = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                      setResponsibleSector([...new Set(val.map(String))]);
                    }}
                    SelectProps={{
                      multiple: true,
                      renderValue: (selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((id) => (
                            <Chip
                              key={String(id)}
                              label={sectors.find((sec) => String(sec.id) === String(id))?.name || id}
                              size="small"
                              onMouseDown={(e) => e.stopPropagation()}
                              onDelete={() => {
                                setResponsibleSector((prev) => prev.filter((s) => String(s) !== String(id)));
                              }}
                            />
                          ))}
                        </Box>
                      )
                    }}
                    disabled={submitting || sectors.length === 0}
                    displayEmpty
                    InputLabelProps={{ shrink: true }}
                  >
                    <MenuItem value="" disabled>
                      <em style={{ fontStyle: 'normal', color: theme.palette.text.secondary }}>Selecione uma opção</em>
                    </MenuItem>
                    {sectors
                      .filter((sector) => !responsibleSector.includes(String(sector.id || sector)))
                      .map((sector) => (
                        <MenuItem key={String(sector.id || sector)} value={String(sector.id || sector)}>
                          {sector.name || sector}
                        </MenuItem>
                      ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" component="label" gutterBottom>
                    Técnico Responsável
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    value={technicianIds}
                    onChange={(e) => {
                      const val = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                      setTechnicianIds([...new Set(val.map(String))]);
                    }}
                    SelectProps={{
                      multiple: true,
                      renderValue: (selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((id) => (
                            <Chip
                              key={String(id)}
                              label={technicians.find((tech) => String(tech.id) === String(id))?.name || id}
                              size="small"
                              onMouseDown={(e) => e.stopPropagation()}
                              onDelete={() => {
                                setTechnicianIds((prev) => prev.filter((t) => String(t) !== String(id)));
                              }}
                            />
                          ))}
                        </Box>
                      )
                    }}
                    disabled={!responsibleSector || submitting || loadingTechnicians}
                    InputLabelProps={{ shrink: true }}
                  >
                    <MenuItem value="" disabled>
                      <em style={{ fontStyle: 'normal', color: theme.palette.text.secondary }}>
                        {loadingTechnicians
                          ? 'Carregando...'
                          : responsibleSector.length > 0
                            ? 'Selecione um ou mais técnicos'
                            : 'Selecione um setor primeiro'}
                      </em>
                    </MenuItem>
                    {technicians
                      .filter((tech) => !technicianIds.includes(String(tech.id || tech)))
                      .map((tech) => (
                        <MenuItem key={String(tech.id || tech)} value={String(tech.id || tech)}>
                          {tech.name || tech}
                        </MenuItem>
                      ))}
                  </TextField>
                </Grid>
              </Grid>
            )}
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default TicketForm;