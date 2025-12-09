// import { Box, Avatar, Typography, Stack, IconButton } from '@mui/material';
// import NotificationsIcon from '@mui/icons-material/Notifications';
// import { useSelector, useDispatch } from 'react-redux';

// import { logOut } from '../../redux/slices/authSlices';
// import { logoutApi } from '../../api/authApi';

// export default function Navbar() {
//   return (
//     <Box
//       sx={{
//         width: '100%',
//         px: { xs: 1, sm: 3 },
//         py: 1.5,
//         display: 'flex',
//         justifyContent: 'flex-end',
//         alignItems: 'center',
//         boxSizing: 'border-box',
//       }}
//     >
//       <Stack direction='row' spacing={{ xs: 1, sm: 2 }} alignItems='center'>
//         <IconButton>
//           <NotificationsIcon sx={{ color: '#7d7fcf', fontSize: 26 }} />
//         </IconButton>

//         <Stack direction='row' spacing={1} alignItems='center'>
//           <Avatar src='' alt='User Avatar' sx={{ width: 40, height: 40 }} />
//           <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
//             <Typography sx={{ fontSize: 16, fontWeight: 500 }}>
//               John Doe
//             </Typography>
//             <Typography sx={{ fontSize: 14, color: '#666' }}>
//               john.doe@example.com
//             </Typography>
//           </Box>
//         </Stack>
//       </Stack>
//     </Box>
//   );
// }

import {
  Box,
  Avatar,
  Typography,
  Stack,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { logOut } from '../../redux/slices/authSlices';
import { logoutApi } from '../../api/authApi';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get logged-in user
  const admin = useSelector((state) => state.auth.admin);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    }
    dispatch(logOut());
    navigate('/login');
  };

  return (
    <Box
      sx={{
        width: '100%',
        px: { xs: 1, sm: 3 },
        py: 1.5,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}
    >
      <Stack direction='row' spacing={{ xs: 1, sm: 2 }} alignItems='center'>
        <IconButton>
          <NotificationsIcon sx={{ color: '#7d7fcf', fontSize: 26 }} />
        </IconButton>

        {/* USER SECTION */}
        <Stack
          direction='row'
          spacing={1.5}
          alignItems='center'
          sx={{ cursor: 'pointer' }}
          onClick={handleMenuOpen}
        >
          <Avatar
            src={admin?.profileImage || ''}
            alt='User Avatar'
            sx={{ width: 48, height: 48 }}
          />

          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography sx={{ fontSize: 16, fontWeight: 500 }}>
              {admin?.firstName} {admin?.lastName}
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#666' }}>
              {admin?.email}
            </Typography>
          </Box>
        </Stack>

        {/* DROPDOWN MENU */}
        <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
          <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
          {/* <MenuItem onClick={() => navigate('/change-password')}>
            Change Password
          </MenuItem> */}
          <MenuItem
            onClick={handleLogout}
            sx={{ color: 'red', fontWeight: 600 }}
          >
            Logout
          </MenuItem>
        </Menu>
      </Stack>
    </Box>
  );
}
