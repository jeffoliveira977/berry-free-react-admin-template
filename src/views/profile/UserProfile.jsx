import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MainCard from 'ui-component/cards/MainCard';
import { IconCamera, IconDeviceFloppy, IconLock } from '@tabler/icons-react';
import { useAuth } from 'hooks/useAuth';
import { changeMyPassword, getMyProfile, getUserProfile, updateMyProfile, uploadAvatar } from 'services/profileService';
import { toAbsoluteUrl } from 'utils/ticketImages';

const emptyForm = { name: '', username: '', position: '', bio: '', phone: '', location: '', website: '', avatarUrl: '' };

function initials(name) {
  return (name || 'Usuário')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function UserProfile() {
  const { id } = useParams();
  const { user, setUser } = useAuth();
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const isOwnProfile = !id;
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [tab, setTab] = useState(0);

  const avatarSrc = useMemo(() => toAbsoluteUrl(profile?.avatarUrl), [profile?.avatarUrl]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = isOwnProfile ? await getMyProfile() : await getUserProfile(id);
        const data = response?.data || response;
        setProfile(data);
        setForm({
          name: data.name || '',
          username: data.username || '',
          position: data.position || '',
          bio: data.bio || '',
          phone: data.phone || '',
          location: data.location || '',
          website: data.website || '',
          avatarUrl: data.avatarUrl || ''
        });
      } catch (error) {
        setMessage({ severity: 'error', text: error.message || 'Não foi possível carregar o perfil.' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isOwnProfile]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      setMessage({ severity: 'error', text: 'Informe seu nome antes de salvar.' });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
      const response = await updateMyProfile(form);
      const data = response?.data || response;
      setProfile(data);
      setForm((current) => ({ ...current, ...data }));
      setUser({ ...user, name: data.name, email: data.email, role: data.role, avatar: data.avatarUrl });
      setMessage({ severity: 'success', text: 'Perfil atualizado com sucesso.' });
    } catch (error) {
      setMessage({ severity: 'error', text: error.message || 'Não foi possível salvar o perfil.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async () => {
    try {
      setPasswordMessage(null);
      await changeMyPassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      setPasswordMessage({ severity: 'success', text: 'Senha alterada com sucesso.' });
    } catch (error) {
      setPasswordMessage({ severity: 'error', text: error.message || 'Não foi possível alterar a senha.' });
    }
  };

  const handleAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const response = await uploadAvatar(file);
      const url = response?.url || response?.data?.url;
      setForm((current) => ({ ...current, avatarUrl: url }));
      setProfile((current) => ({ ...current, avatarUrl: url }));
      await updateMyProfile({ avatarUrl: url });
      setUser({ ...user, avatar: url });
      setMessage({ severity: 'success', text: 'Avatar atualizado.' });
    } catch (error) {
      setMessage({ severity: 'error', text: error.message || 'Não foi possível enviar o avatar.' });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  if (loading) return <MainCard title="Perfil"><Typography>Carregando perfil...</Typography></MainCard>;
  if (!profile) return <MainCard title="Perfil"><Typography>Perfil não encontrado.</Typography></MainCard>;

  return (
    <Stack spacing={2.5}>
      {message && <Alert severity={message.severity}>{message.text}</Alert>}

      {/* Header: plain, left-aligned — no banner, no chips */}
      <MainCard>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ xs: 'center', sm: 'center' }}>
          <Box
            component={isOwnProfile ? 'button' : 'div'}
            type={isOwnProfile ? 'button' : undefined}
            onClick={isOwnProfile && !uploading ? () => fileInputRef.current?.click() : undefined}
            aria-label={isOwnProfile ? 'Trocar foto de perfil' : undefined}
            sx={{
              position: 'relative',
              width: 72,
              height: 72,
              borderRadius: '50%',
              p: 0,
              border: 0,
              background: 'none',
              cursor: isOwnProfile ? (uploading ? 'default' : 'pointer') : 'default',
              flexShrink: 0,
              '&:hover .avatar-overlay': isOwnProfile ? { opacity: 1 } : undefined
            }}
          >
            <Avatar
              src={avatarSrc || undefined}
              sx={{ width: 72, height: 72, fontSize: 26, fontWeight: 600, bgcolor: theme.palette.primary.main }}
            >
              {!avatarSrc && initials(profile.name)}
            </Avatar>

            {isOwnProfile && (
              <Box
                className="avatar-overlay"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0, 0, 0, 0.55)',
                  color: '#fff',
                  opacity: uploading ? 1 : 0,
                  transition: 'opacity 0.15s ease-in-out'
                }}
              >
                {uploading ? (
                  <Typography variant="caption">Enviando...</Typography>
                ) : (
                  <IconCamera size={20} />
                )}
              </Box>
            )}

            {isOwnProfile && (
              <input
                ref={fileInputRef}
                hidden
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={handleAvatar}
              />
            )}
          </Box>

          <Stack spacing={0.25} sx={{ textAlign: { xs: 'center', sm: 'left' }, flex: 1 }}>
            <Typography variant="h3">{profile.name}</Typography>
            <Typography color="text.secondary">
              {[profile.position || profile.role?.replaceAll('_', ' '), profile.departmentName].filter(Boolean).join(' — ')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profile.email}
            </Typography>
          </Stack>
        </Stack>
      </MainCard>

      {isOwnProfile ? (
        <MainCard sx={{ p: 0 }} content={false}>
          <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ px: 2.5, minHeight: 44 }}>
            <Tab label="Perfil" sx={{ minHeight: 44 }} />
            <Tab label="Segurança" sx={{ minHeight: 44 }} />
          </Tabs>
          <Divider />

          <Box sx={{ p: 2.5 }}>
            {tab === 0 && (
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Nome"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    error={!form.name.trim()}
                    helperText={!form.name.trim() ? 'Campo obrigatório' : ' '}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Usuário"
                    value={form.username}
                    onChange={(event) => setForm({ ...form, username: event.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Cargo"
                    value={form.position}
                    onChange={(event) => setForm({ ...form, position: event.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Localização"
                    value={form.location}
                    onChange={(event) => setForm({ ...form, location: event.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Site"
                    value={form.website}
                    onChange={(event) => setForm({ ...form, website: event.target.value })}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 0.5 }} />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label="Bio"
                    placeholder="Conte um pouco sobre você para os demais usuários."
                    value={form.bio}
                    onChange={(event) => setForm({ ...form, bio: event.target.value })}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Stack direction="row" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      disabled={saving || !form.name.trim()}
                      startIcon={<IconDeviceFloppy size={17} />}
                    >
                      {saving ? 'Salvando...' : 'Salvar alterações'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            )}

            {tab === 1 && (
              <Stack spacing={2} sx={{ maxWidth: 420 }}>
                <Typography variant="body2" color="text.secondary">
                  Use uma senha exclusiva com pelo menos 8 caracteres.
                </Typography>
                {passwordMessage && <Alert severity={passwordMessage.severity}>{passwordMessage.text}</Alert>}
                <TextField
                  type="password"
                  label="Senha atual"
                  value={passwords.currentPassword}
                  onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })}
                />
                <TextField
                  type="password"
                  label="Nova senha"
                  value={passwords.newPassword}
                  onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })}
                />
                <Stack direction="row">
                  <Button
                    variant="contained"
                    onClick={handlePassword}
                    disabled={!passwords.currentPassword || passwords.newPassword.length < 8}
                    startIcon={<IconLock size={17} />}
                  >
                    Alterar senha
                  </Button>
                </Stack>
              </Stack>
            )}
          </Box>
        </MainCard>
      ) : (
        <MainCard title="Sobre">
          <Typography sx={{ whiteSpace: 'pre-wrap' }} color={profile.bio ? 'text.primary' : 'text.secondary'}>
            {profile.bio || 'Este usuário ainda não adicionou uma bio.'}
          </Typography>
          {(profile.phone || profile.location || profile.website) && (
            <>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={0.75}>
                {profile.phone && <Typography variant="body2">{profile.phone}</Typography>}
                {profile.location && <Typography variant="body2">{profile.location}</Typography>}
                {profile.website && <Typography variant="body2">{profile.website}</Typography>}
              </Stack>
            </>
          )}
        </MainCard>
      )}
    </Stack>
  );
}