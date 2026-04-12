import type { SxProps, Theme } from '@mui/material/styles';

/** Samma frostade yta som app-header — används för flikar och undersidor. */
export const stickyBarSurfaceSx: SxProps<Theme> = {
  position: 'sticky',
  top: 0,
  zIndex: 10,
  bgcolor: 'rgba(19, 24, 32, 0.72)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderBottom: '1px solid',
  borderColor: 'divider',
};
