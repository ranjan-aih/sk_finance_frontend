import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Box, Stack } from '@mui/material';

export default function Layout() {
  return (
    <Box sx={{ bgcolor: '#f7f7f7', height: '100vh', overflow: 'hidden' }}>
      <Stack direction='row' height='100%'>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Navbar */}
          <Navbar />

          {/* Page Content */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              // p: { xs: 2, sm: 3 },
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
