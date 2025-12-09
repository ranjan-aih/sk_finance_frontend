import axiosInstance from './axiosInstance';

// Base URL without `/api` – handy for building file URLs in UI
export const API_BASE_URL = axiosInstance.defaults.baseURL.replace(
  /\/api$/,
  ''
);

export const uploadFile = (file, fileType, slot) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('label', file.name);

  // Decide path based on type
  const typePath = fileType === 'signature' ? 'signatures' : 'photos';

  return axiosInstance.post(`/upload/${typePath}/${slot}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getRecentUploads = () => {
  return axiosInstance.get('/uploads/recent');
};

// export const verifySignature = async (referenceUrl, providedUrl) => {
//   try {
//     // Fetch the actual files from the URLs
//     const [refResponse, provResponse] = await Promise.all([
//       fetch(referenceUrl),
//       fetch(providedUrl),
//     ]);

//     const refBlob = await refResponse.blob();
//     const provBlob = await provResponse.blob();

//     // Extract filenames from URLs
//     const refFilename = referenceUrl.split('/').pop() || 'reference.jpg';
//     const provFilename = providedUrl.split('/').pop() || 'provided.jpg';

//     // Create FormData with actual file blobs
//     const formData = new FormData();
//     formData.append('reference_signature', refBlob, refFilename);
//     formData.append('file', provBlob, provFilename);

//     const res = await axiosInstance.post('/verify-signature', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });

//     return res;
//   } catch (error) {
//     console.error('Error in verifySignature:', error);
//     throw error;
//   }
// };

export const deleteUpload = (id, type) => {
  return axiosInstance.delete(`/uploads/${type}/${id}`);
};
