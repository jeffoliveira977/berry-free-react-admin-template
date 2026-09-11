import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Material-UI components
import { useTheme, Box, Button, Grid, Stack, TextField, Typography, MenuItem, Chip, Avatar, Autocomplete, CircularProgress, Alert } from '@mui/material';

// Projeto específico: Componentes do Berry Free
import MainCard from 'ui-component/cards/MainCard';
import AnimateButton from 'ui-component/extended/AnimateButton';

// Ícones (Tabler Icons, padrão do Berry)
import { IconNote, IconTag, IconCheck, IconX } from '@tabler/icons-react';

// Editor de Texto Rico (Rich Text Editor)
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Serviços e Hooks
import { useAuth } from 'hooks/useAuth';
import { createTicket } from 'services/ticketService';
import api from 'utils/api';

const PRIORITY_COLORS = {
  BAIXA: 'success',
  MEDIA: 'warning',
  ALTA: 'error',
  URGENTE: 'error'
};

const PRIORITY_LABELS = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  URGENTE: 'Urgente'
};

// ==============================|| COMPONENTE DE CRIAÇÃO DE CHAMADO ||============================== //

const TicketForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados do formulário
  const [ticketTitle, setTicketTitle] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [priority, setPriority] = useState('MEDIA');
  const [responsibleSector, setResponsibleSector] = useState('');
  const [category, setCategory] = useState('');
  const [technicianId, setTechnicianId] = useState('');

  // Estados de dados e carregamento
  const [sectors, setSectors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loadingSectors, setLoadingSectors] = useState(true);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : categoriesRes?.data || []);
      } catch (err) {
        console.error('Erro ao buscar dados iniciais:', err);
        setError('Erro ao carregar setores e categorias');
      } finally {
        setLoadingSectors(false);
      }
    };

    fetchInitialData();
  }, []);

  // Buscar técnicos quando o ID do setor mudar
  useEffect(() => {
    if (!responsibleSector) {
      setTechnicians([]);
      setTechnicianId('');
      return;
    }

    const fetchTechnicians = async () => {
      try {
        setLoadingTechnicians(true);
        setError(null);
        
        // Garante que o ID do setor seja enviado corretamente como número/string
        const deptId = typeof responsibleSector === 'object' ? responsibleSector.id : responsibleSector;

        // ATENÇÃO: Verifique se a sua baseURL do axios já tem '/api'.
        // Se tiver, mude para: await api.get('/technicians', ...
        const res = await api.get('/api/technicians', {
          params: { departmentId: deptId }
        });

        console.log('Resposta da API Técnicos:', res);

        // Tratamento para garantir que pegamos a lista de técnicos corretamente
        let techData = [];
        if (Array.isArray(res)) {
          techData = res;
        } else if (Array.isArray(res?.data)) {
          techData = res.data;
        }

        setTechnicians(techData);
        setTechnicianId('');
      } catch (err) {
        console.error('Erro ao buscar técnicos por ID do setor:', err);
        setError('Erro ao carregar técnicos do setor');
        setTechnicians([]);
      } finally {
        setLoadingTechnicians(false);
      }
    };

    fetchTechnicians();
  }, [responsibleSector]);

  const isValid = ticketTitle.trim() !== '' && problemDescription.trim() !== '' && priority && category;

  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ script: 'sub' }, { script: 'super' }],
      ['link', 'image'],
      [{ header: '2' }, { header: '3' }],
      [{ align: [] }],
      ['blockquote', 'code-block'],
      [{ list: 'bullet' }, { list: 'ordered' }],
      [{ table: true }],
      ['clean']
    ]
  };

  const handleSectorChange = (value) => {
    setResponsibleSector(value);
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const ticketData = {
        title: ticketTitle,
        description: problemDescription,
        priority,
        category,
        departmentId: responsibleSector
            ? parseInt(responsibleSector)
            : null,
        assignedTechnicianId: technicianId
            ? parseInt(technicianId)
            : null
    };

      const newTicket = await createTicket(ticketData);

      setSuccess(true);
      
      // Redirecionar para a lista de tickets após sucesso
      setTimeout(() => {
        navigate('/tickets');
      }, 1500);
    } catch (err) {
      console.error('Erro ao criar ticket:', err);
      setError(err.message || 'Erro ao criar chamado. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Barra de ações — sem título, o layout do template já exibe "Criar Chamado" no topo da página */}
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
          bgcolor: theme.palette.background.default,
          py: 1
        }}
      >
        <Button variant="outlined" color="secondary" startIcon={<IconX size="1.1rem" />} onClick={() => navigate('/tickets')} disabled={submitting}>
          Cancelar
        </Button>
        <AnimateButton>
          <Button
            variant="contained"
            color="primary"
            startIcon={<IconCheck size="1.1rem" />}
            disabled={!isValid || submitting || loadingSectors}
            onClick={handleSubmit}
          >
            {submitting ? 'Criando...' : 'Criar'}
          </Button>
        </AnimateButton>
      </Stack>

      {/* Mensagens de erro e sucesso */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(false)} sx={{ mb: 2 }}>
          Chamado criado com sucesso! Redirecionando...
        </Alert>
      )}

      {/* Grid Principal (2 colunas) */}
      <Grid container spacing={3}>
        {/* COLUNA ESQUERDA (Maior) - Informações do Chamado */}
        <Grid size={{ xs: 12, md: 8 }}>
          <MainCard
            title={
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <IconNote color={theme.palette.secondary.main} />
                <Typography variant="h4">Informações do Chamado</Typography>
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
                    placeholder="Ex: Erro ao emitir nota fiscal"
                    disabled={submitting}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" component="label" gutterBottom>
                    Descrição do Problema <span style={{ color: theme.palette.error.main }}>*</span>
                  </Typography>
                  <Box sx={{ '& .ql-container': { minHeight: '320px' }, opacity: submitting ? 0.5 : 1, pointerEvents: submitting ? 'none' : 'auto' }}>
                    <ReactQuill
                      theme="snow"
                      value={problemDescription}
                      onChange={setProblemDescription}
                      modules={quillModules}
                      placeholder="Descreva detalhadamente o problema... use o clipe da barra acima para anexar imagens"
                      readOnly={submitting}
                    />
                  </Box>
                </Grid>
              </Grid>
            )}
          </MainCard>
        </Grid>

        {/* COLUNA DIREITA (Menor) - Classificação */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MainCard
            title={
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <IconTag color={theme.palette.secondary.main} />
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
                      renderValue: (value) => (
                        <Chip
                          label={PRIORITY_LABELS[value] || value}
                          color={PRIORITY_COLORS[value]}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      )
                    }}
                  >
                    <MenuItem value="BAIXA">Baixa</MenuItem>
                    <MenuItem value="MEDIA">Média</MenuItem>
                    <MenuItem value="ALTA">Alta</MenuItem>
                    <MenuItem value="URGENTE">Urgente</MenuItem>
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
                    {categories.map((cat) => (
                      <MenuItem key={cat.id || cat} value={cat.id || cat}>
                        {cat.name || cat}
                      </MenuItem>
                    ))}
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
                    onChange={(e) => handleSectorChange(e.target.value)}
                    disabled={submitting || sectors.length === 0}
                    displayEmpty
                    InputLabelProps={{ shrink: true }}
                  >
                    <MenuItem value="">
                      <em style={{ fontStyle: 'normal', color: theme.palette.text.secondary }}>Selecione uma opção</em>
                    </MenuItem>
                    {sectors.map((sector) => (
                      <MenuItem key={sector.id || sector} value={sector.id || sector}>
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
                    value={technicianId}
                    onChange={(e) => setTechnicianId(e.target.value)}
                    displayEmpty
                    disabled={!responsibleSector || submitting || loadingTechnicians}
                    InputLabelProps={{ shrink: true }}
                  >
                    <MenuItem value="">
                      <em style={{ fontStyle: 'normal', color: theme.palette.text.secondary }}>
                        {loadingTechnicians ? 'Carregando...' : responsibleSector ? 'Selecione uma opção' : 'Selecione um setor primeiro'}
                      </em>
                    </MenuItem>
                    {technicians.map((tech) => (
                      <MenuItem key={tech.id || tech} value={tech.id || tech}>
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