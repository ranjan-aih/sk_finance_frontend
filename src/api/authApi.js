import axiosInstance from './axiosInstance';

// Login API call
export const loginApi = async (data) => {
  const res = await axiosInstance.post('/login', data);
  return res.data;
};

// Verify current session
export const verifyAuthApi = async () => {
  const res = await axiosInstance.get('/verify');
  return res.data;
};

// Logout API call - Backend will clear the cookie
export const logoutApi = async () => {
  const res = await axiosInstance.post('/logout');
  return res.data;
};
