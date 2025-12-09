import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { verifyAuthApi } from '../../api/authApi';

import {
  loginSuccess,
  setInitialized,
  authFailure,
} from '../../redux/slices/authSlices';

import { CircularProgress, Box } from '@mui/material';

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isInitialized } = useSelector((state) => state.auth);

  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        // Call backend to verify cookie
        const response = await verifyAuthApi();

        if (response.success) {
          // User is authenticated, populate Redux
          dispatch(loginSuccess(response.user));
        } else {
          // Not authenticated
          dispatch(setInitialized());
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        // Cookie invalid/expired
        dispatch(setInitialized());
      }
    };

    verifyAuthentication();
  }, [dispatch]);

  // Show loading screen while verifying authentication
  if (!isInitialized) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='100vh'
      >
        <CircularProgress />
      </Box>
    );
  }

  return children;
};

export default AuthProvider;
