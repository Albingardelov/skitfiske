import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function LogbokPage() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
      <Typography variant="h5">Logbok</Typography>
    </Box>
  );
}
