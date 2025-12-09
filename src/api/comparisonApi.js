// uploadApi.js (or photoApi.js)
import axiosInstance from './axiosInstance';

// Small helper: get a filename from a URL
const getFilenameFromUrl = (url, fallback = 'file.jpg') => {
  if (!url) return fallback;
  const parts = url.split('/');
  const last = parts[parts.length - 1];
  return last || fallback;
};

export const verifyPhoto = async (referenceUrl, providedUrls) => {
  try {
    console.log('verifyPhoto() called with:', { referenceUrl, providedUrls });

    // Always work with an array internally
    const providedList = Array.isArray(providedUrls)
      ? providedUrls
      : [providedUrls];

    // 1️⃣ Fetch the reference image
    const refResponse = await fetch(referenceUrl);
    if (!refResponse.ok) {
      throw new Error(
        `Failed to load reference image: ${refResponse.status} ${refResponse.statusText}`
      );
    }
    const refBlob = await refResponse.blob();

    // 2️⃣ Fetch all provided images
    const providedBlobs = [];
    for (const url of providedList) {
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(
          `Failed to load provided image: ${resp.status} ${resp.statusText}`
        );
      }
      const blob = await resp.blob();
      providedBlobs.push({ url, blob });
    }

    // 3️⃣ Build FormData for backend
    const formData = new FormData();

    // Reference photo field → "reference_photo"
    const refFilename = getFilenameFromUrl(referenceUrl, 'reference.jpg');
    formData.append('reference_photo', refBlob, refFilename);

    // Provided photo(s) field → "file"
    providedBlobs.forEach((item, index) => {
      const filename = getFilenameFromUrl(
        item.url,
        `provided_${index + 1}.jpg`
      );
      formData.append('file', item.blob, filename);
    });

    // 4️⃣ Call Node backend: POST /api/verify-photo
    const res = await axiosInstance.post('/verify-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('verifyPhoto backend response:', res.data);
    return res;
  } catch (err) {
    console.error('Error in verifyPhoto:', err);
    throw err;
  }
};

// comparisonApi.js
export const verifySignature = async (referenceUrl, providedUrls) => {
  try {
    // Normalize providedUrls into an array
    const providedList = Array.isArray(providedUrls)
      ? providedUrls
      : [providedUrls];

    console.log('verifySignature ->', { referenceUrl, providedList });

    // --- Fetch reference file ---
    const refResponse = await fetch(referenceUrl);
    if (!refResponse.ok) {
      throw new Error(
        `Failed to load reference signature: ${refResponse.status} ${refResponse.statusText}`
      );
    }
    const refBlob = await refResponse.blob();
    const refFilename =
      typeof referenceUrl === 'string'
        ? referenceUrl.split('/').pop() || 'reference.jpg'
        : 'reference.jpg';

    const formData = new FormData();
    formData.append('reference_signature', refBlob, refFilename);

    // --- Fetch all provided files ---
    const providedResponses = await Promise.all(
      providedList.map((url) => fetch(url))
    );

    await Promise.all(
      providedResponses.map(async (resp, idx) => {
        if (!resp.ok) {
          throw new Error(
            `Failed to load provided signature: ${resp.status} ${resp.statusText}`
          );
        }

        const provBlob = await resp.blob();
        const url = providedList[idx];

        const provFilename =
          typeof url === 'string' && url.includes('/')
            ? url.split('/').pop()
            : `provided_${idx + 1}.jpg`;

        formData.append('file', provBlob, provFilename);
      })
    );

    const res = await axiosInstance.post('/verify-signature', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return res;
  } catch (error) {
    console.error('Error in verifySignature:', error);
    throw error;
  }
};
