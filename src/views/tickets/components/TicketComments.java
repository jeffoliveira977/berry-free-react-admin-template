import React from 'react';
import { Box, Stack, Typography, TextField, Button, Alert, Chip } from '@mui/material';
import { IconMessage, IconSend } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';

const AVATAR_COLORS = [
  '#5C6BC0', '#26A69A', '#EF6C00', '#8E24AA',
  '#00897B', '#3949AB', '#D81B60', '#6D4C41'
];

const stringToColor = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (name = '') =>
  name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || '?';

const TicketComments = ({
  comments,
  comment,
  onCommentChange,
  onSubmit,
  commentLoading,
  commentError,
  isTicketClosed,
  status
}) => {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <MainCard
      id="ticket-comments"
      title={
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconMessage size="1.3rem" />
          <Typography variant="h4">Histórico e interação</Typography>
          {comments.length > 0 && (
            <Chip label={comments.length} size="small" sx={{ height: 20, fontSize: '0.75rem' }} />
          )}
        </Stack>
      }
      sx={{ mt: 3 }}
      contentSX={{ p: 0 }}
    >
      <Box
        sx={{
          maxHeight: 480,
          overflowY: 'auto',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': { backgroundColor: 'divider', borderRadius: 3 }
        }}
      >
        {comments.length === 0 && !commentError && (
          <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ py: 5, opacity: 0.7 }}>
            <IconMessage size="2rem" stroke={1.2} />
            <Typography color="text.secondary" variant="body2">
              Nenhuma mensagem por aqui ainda.
            </Typography>
            {!isTicketClosed && (
              <Typography color="text.secondary" variant="caption">
                Escreva a primeira mensagem abaixo.
              </Typography>
            )}
          </Stack>
        )}

        {comments.map((item) => {
          const authorName = item.authorName || 'Usuário';

          return (
            <Stack key={item.id} direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: stringToColor(authorName),
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                {getInitials(authorName)}
              </Box>

              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  bgcolor: 'background.default',
                  borderRadius: 2,
                  px: 2,
                  py: 1.25
                }}
              >
                <Stack direction="row" alignItems="baseline" justifyContent="space-between" spacing={2}>
                  <Typography variant="subtitle2" noWrap>
                    {authorName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : ''}
                  </Typography>
                </Stack>

                <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {item.content}
                </Typography>
              </Box>
            </Stack>
          );
        })}

        {commentError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {commentError}
          </Alert>
        )}
      </Box>

      <Box sx={{ px: 3, py: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
        {isTicketClosed ? (
          <Alert severity="info">
            Este chamado está {status === 'CANCELADO' ? 'cancelado' : 'fechado'} — não é possível
            adicionar novas mensagens.
          </Alert>
        ) : (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-end">
            <TextField
              fullWidth
              multiline
              minRows={1}
              maxRows={6}
              value={comment}
              onChange={(event) => onCommentChange(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreva uma mensagem para os participantes do chamado..."
              disabled={commentLoading}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.default' }
              }}
            />

            <Button
              variant="contained"
              onClick={onSubmit}
              disabled={!comment.trim() || commentLoading}
              startIcon={<IconSend size="1.1rem" />}
              sx={{ minWidth: { sm: 130 }, height: 40 }}
            >
              {commentLoading ? 'Enviando...' : 'Enviar'}
            </Button>
          </Stack>
        )}
      </Box>
    </MainCard>
  );
};

export default TicketComments;