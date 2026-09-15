import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';

export default function UserProfileLink({ id, name, variant = 'body2', color = 'inherit', onClick }) {
  if (!id) return <span>{name}</span>;
  return (
    <Link
      component={RouterLink}
      to={`/users/${id}/profile`}
      variant={variant}
      color={color}
      underline="hover"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      sx={{ cursor: 'pointer', fontWeight: 600 }}
    >
      {name}
    </Link>
  );
}
