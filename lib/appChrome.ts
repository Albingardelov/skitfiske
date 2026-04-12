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
