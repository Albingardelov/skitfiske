import type { Theme } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';

/** Samma frostade yta som app-header — används för flikar och undersidor. */
export const stickyBarSurfaceSx: SystemStyleObject<Theme> = {
  position: 'sticky',
  top: 0,
  zIndex: 10,
  bgcolor: 'rgba(18, 26, 28, 0.76)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderBottom: '1px solid',
  borderColor: 'divider',
};
