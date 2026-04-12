'use client';

import { useState } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Check, Monitor, Moon, Sun, Palette } from 'lucide-react';
import { useColorMode } from '@/contexts/ColorModeContext';
import type { ColorPreference } from '@/lib/theme/designTokens';

export default function ColorModeMenuButton({
  'aria-label': ariaLabel = 'Välj färgtema',
  sx,
}: {
  'aria-label'?: string;
  sx?: SxProps<Theme>;
}) {
  const { preference, setPreference } = useColorMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  function pick(p: ColorPreference) {
    setPreference(p);
    setAnchorEl(null);
  }

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-label={ariaLabel}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        size="small"
        sx={[{ ml: 'auto' }, ...(sx == null ? [] : Array.isArray(sx) ? sx : [sx])]}
      >
        <Palette size={22} strokeWidth={2} />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => pick('light')} selected={preference === 'light'}>
          <ListItemIcon>
            {preference === 'light' ? <Check size={18} /> : <Sun size={18} />}
          </ListItemIcon>
          <ListItemText>Ljust läge</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => pick('dark')} selected={preference === 'dark'}>
          <ListItemIcon>
            {preference === 'dark' ? <Check size={18} /> : <Moon size={18} />}
          </ListItemIcon>
          <ListItemText>Mörkt läge</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => pick('system')} selected={preference === 'system'}>
          <ListItemIcon>
            {preference === 'system' ? <Check size={18} /> : <Monitor size={18} />}
          </ListItemIcon>
          <ListItemText>Följ system</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
