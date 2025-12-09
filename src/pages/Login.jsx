// import { useState } from 'react';
// import { TextField, Button, Box, Alert, CircularProgress } from '@mui/material';
// import FormControl from '@mui/material/FormControl';
// import InputLabel from '@mui/material/InputLabel';
// import OutlinedInput from '@mui/material/OutlinedInput';
// import InputAdornment from '@mui/material/InputAdornment';
// import IconButton from '@mui/material/IconButton';
// import Visibility from '@mui/icons-material/Visibility';
// import VisibilityOff from '@mui/icons-material/VisibilityOff';

// import { loginApi } from '../api/authApi';
// import { useNavigate } from 'react-router';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   authStart,
//   loginSuccess,
//   authFailure,
//   clearError,
// } from '../redux/slices/authSlices';

// const Login = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });
//   const [showPassword, setShowPassword] = useState(false);

//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   // Get loading and error state from Redux
//   const { loading, error } = useSelector((state) => state.auth);

//   const handleShowPassword = () => {
//     setShowPassword((show) => !show);
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//     // Clear error when user starts typing
//     if (error) {
//       dispatch(clearError());
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Dispatch authStart to show loading state
//     dispatch(authStart());

//     try {
//       // Call login API - Backend will set httpOnly cookie
//       const response = await loginApi(formData);

//       console.log('Login Response:', response);

//       if (response.success) {
//         // Dispatch loginSuccess with ONLY user data
//         // Token is in httpOnly cookie (not accessible to JavaScript)
//         dispatch(loginSuccess(response.user));

//         // Navigate to home page
//         navigate('/upload');

//         // Reset form
//         setFormData({ email: '', password: '' });
//       } else {
//         dispatch(authFailure(response.message || 'Login failed'));
//       }
//     } catch (err) {
//       console.error('Login Error:', err);

//       // Extract error message from response
//       const errorMessage =
//         err.response?.data?.message ||
//         err.message ||
//         'Something went wrong. Please try again.';

//       dispatch(authFailure(errorMessage));
//     }
//   };

//   return (
//     <div className='flex justify-center items-center bg-white min-h-screen'>
//       <form
//         onSubmit={handleSubmit}
//         className='p-20 rounded-xl border border-[#ededed] shadow-lg'
//       >
//         <h1 className='text-3xl font-albert font-medium text-black text-center mb-6'>
//           Login
//         </h1>

//         <Box className='flex flex-col gap-4 w-80'>
//           <TextField
//             label='Email'
//             name='email'
//             type='email'
//             variant='outlined'
//             fullWidth
//             value={formData.email}
//             onChange={handleChange}
//             required
//             disabled={loading}
//           />

//           <FormControl variant='outlined' fullWidth required>
//             <InputLabel>Password</InputLabel>
//             <OutlinedInput
//               name='password'
//               type={showPassword ? 'text' : 'password'}
//               value={formData.password}
//               onChange={handleChange}
//               disabled={loading}
//               endAdornment={
//                 <InputAdornment position='end'>
//                   <IconButton onClick={handleShowPassword} edge='end'>
//                     {showPassword ? <VisibilityOff /> : <Visibility />}
//                   </IconButton>
//                 </InputAdornment>
//               }
//               label='Password'
//             />
//           </FormControl>

//           <Button
//             type='submit'
//             variant='contained'
//             fullWidth
//             size='large'
//             disabled={loading}
//           >
//             {loading ? <CircularProgress size={24} color='inherit' /> : 'Login'}
//           </Button>

//           {/* Show error message if exists */}
//           {error && (
//             <Alert severity='error' onClose={() => dispatch(clearError())}>
//               {error}
//             </Alert>
//           )}
//         </Box>
//       </form>
//     </div>
//   );
// };

// export default Login;

import { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Fade,
  Paper,
  Typography,
  InputAdornment,
  IconButton,
  Container,
} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

import aihLogo from '../assets/ai-horizon.iologo.png';

import { loginApi } from '../api/authApi';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
  authStart,
  loginSuccess,
  authFailure,
  clearError,
} from '../redux/slices/authSlices';

// Custom styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  borderRadius: 24,
  background: 'linear-gradient(145deg, #ffffff 0%, #fafafa 100%)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #6d83f2 0%, #4a61d4 100%)',
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
  },
}));

const GlassCard = styled('div')(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  padding: theme.spacing(4),
  border: '1px solid rgba(255, 255, 255, 0.9)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(250, 250, 250, 0.95)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#8a93b8',
      },
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#6d83f2',
        borderWidth: 2,
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: '#6c757d',
    fontWeight: 500,
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5),
  background: 'linear-gradient(90deg, #6d83f2 0%, #4a61d4 100%)',
  color: 'white',
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  letterSpacing: '0.5px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(90deg, #5a73e6 0%, #3a51c4 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(109, 131, 242, 0.3)',
  },
  '&:disabled': {
    background: '#e0e0e0',
    transform: 'none',
    boxShadow: 'none',
  },
}));

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get loading and error state from Redux
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    // Clear any existing errors on mount
    dispatch(clearError());
  }, [dispatch]);

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Clear error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Dispatch authStart to show loading state
    dispatch(authStart());

    try {
      // Call login API - Backend will set httpOnly cookie
      const response = await loginApi(formData);

      console.log('Login Response:', response);

      if (response.success) {
        // Dispatch loginSuccess with ONLY user data
        // Token is in httpOnly cookie (not accessible to JavaScript)
        dispatch(loginSuccess(response.user));

        // Navigate to home page
        navigate('/upload');

        // Reset form
        setFormData({ email: '', password: '' });
      } else {
        dispatch(authFailure(response.message || 'Login failed'));
      }
    } catch (err) {
      console.error('Login Error:', err);

      // Extract error message from response
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Something went wrong. Please try again.';

      dispatch(authFailure(errorMessage));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(109, 131, 242, 0.08) 0%, rgba(109, 131, 242, 0) 70%)',
          top: '-10%',
          right: '-10%',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(74, 97, 212, 0.05) 0%, rgba(74, 97, 212, 0) 70%)',
          bottom: '-10%',
          left: '-5%',
        },
      }}
    >
      <Container maxWidth='sm'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <StyledPaper elevation={0}>
            {/* Logo placeholder - You can replace this with your company logo */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 4,
              }}
            >
              <GlassCard>
                <Typography
                  variant='h4'
                  sx={{
                    fontWeight: 700,
                    background:
                      'linear-gradient(90deg, #6d83f2 0%, #4a61d4 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textAlign: 'center',
                  }}
                >
                  <img src={aihLogo} alt='logo' />
                </Typography>
              </GlassCard>
            </Box>

            <Typography
              variant='h3'
              sx={{
                textAlign: 'center',
                mb: 1,
                fontWeight: 700,
                color: '#2d3748',
                fontSize: { xs: '2rem', sm: '2.5rem' },
              }}
            >
              Welcome Back
            </Typography>

            <Typography
              variant='body1'
              sx={{
                textAlign: 'center',
                mb: 5,
                color: '#718096',
                fontSize: '1.1rem',
              }}
            >
              Sign in to continue to your account
            </Typography>

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <StyledTextField
                    label='Email Address'
                    name='email'
                    type='email'
                    variant='outlined'
                    fullWidth
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={handleBlur}
                    required
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <EmailOutlined
                            sx={{
                              color:
                                focusedField === 'email'
                                  ? '#6d83f2'
                                  : '#a0aec0',
                              transition: 'color 0.3s ease',
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </motion.div>

                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <FormControl variant='outlined' fullWidth required>
                    <InputLabel sx={{ color: '#6c757d', fontWeight: 500 }}>
                      Password
                    </InputLabel>
                    <OutlinedInput
                      name='password'
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => handleFocus('password')}
                      onBlur={handleBlur}
                      disabled={loading}
                      label='Password'
                      sx={{
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover': {
                          backgroundColor: 'rgba(250, 250, 250, 0.95)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8a93b8',
                          },
                        },
                        '&.Mui-focused': {
                          backgroundColor: '#ffffff',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#6d83f2',
                            borderWidth: 2,
                          },
                        },
                      }}
                      startAdornment={
                        <InputAdornment position='start'>
                          <LockOutlined
                            sx={{
                              color:
                                focusedField === 'password'
                                  ? '#6d83f2'
                                  : '#a0aec0',
                              transition: 'color 0.3s ease',
                            }}
                          />
                        </InputAdornment>
                      }
                      endAdornment={
                        <InputAdornment position='end'>
                          <IconButton
                            onClick={handleShowPassword}
                            edge='end'
                            sx={{
                              color: '#a0aec0',
                              '&:hover': { color: '#6d83f2' },
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert
                        severity='error'
                        onClose={() => dispatch(clearError())}
                        sx={{
                          borderRadius: 2,
                          border: '1px solid #fed7d7',
                          backgroundColor: '#fff5f5',
                          '& .MuiAlert-icon': {
                            color: '#f56565',
                          },
                        }}
                      >
                        {error}
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <SubmitButton
                    type='submit'
                    variant='contained'
                    fullWidth
                    size='large'
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} color='inherit' />
                    ) : (
                      'Sign In'
                    )}
                  </SubmitButton>
                </motion.div>

                {/* <Typography
                  variant="body2"
                  sx={{
                    textAlign: 'center',
                    color: '#a0aec0',
                    mt: 2,
                    fontSize: '0.875rem',
                  }}
                >
                  Need help? Contact support
                </Typography> */}
              </Box>
            </form>
          </StyledPaper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;
