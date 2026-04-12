import type { Theme } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';

/** Frostad topprad — färger från CSS-variabler (byter med data-color-scheme). */
export const stickyBarSurfaceSx: SystemStyleObject<Theme> = {
  position: 'sticky',
  top: 0,
  zIndex: 10,
  bgcolor: 'var(--app-chrome-bg)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  borderBottom: '1px solid',
  borderColor: 'var(--app-chrome-border)',
};

/**
 * Samma yta som stickyBarSurfaceSx men utan sticky — använd i flexkolumner där
 * en barn-lista har egen scroll (sticky + trasig höjdkedja ger “knäpp” layout).
 */
export const staticBarSurfaceSx: SystemStyleObject<Theme> = {
  flexShrink: 0,
  bgcolor: 'var(--app-chrome-bg)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  borderBottom: '1px solid',
  borderColor: 'var(--app-chrome-border)',
};

/** Outlined TextField — tydlig text/etikett/kant i mörkt läge (MUI default kan bli nästan osynlig). */
export const formFieldReadableSx: SystemStyleObject<Theme> = {
  '& .MuiOutlinedInput-root': {
    color: 'text.primary',
  },
  '& .MuiInputLabel-root': {
    color: 'text.secondary',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: 'primary.main',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'divider',
  },
  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'primary.light',
  },
  '& .MuiOutlinedInput-input::placeholder': {
    opacity: 1,
    color: 'text.secondary',
  },
};
