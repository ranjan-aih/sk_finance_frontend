import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Avatar,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FolderIcon from '@mui/icons-material/Folder';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';

import {
  uploadFile,
  getRecentUploads,
  API_BASE_URL,
  deleteUpload,
} from '../api/uploadApi';

// Build full URL from backend response
const buildFileUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE_URL}${cleanUrl}`;
};

const isImageFile = (file) => {
  if (!file) return false;
  if (file.type) return file.type.startsWith('image/');
  const ext = file.name.split('.').pop().toLowerCase();
  return ['jpg', 'jpeg', 'png'].includes(ext);
};

const Upload = () => {
  const [fileType, setFileType] = useState('photo');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingRef, setUploadingRef] = useState(false);
  const [uploadingProv, setUploadingProv] = useState(false);
  const [error, setError] = useState(null);

  const referenceInputRef = useRef(null);
  const providedInputRef = useRef(null);

  // Pending selection (preview before upload)
  const [pendingRefFile, setPendingRefFile] = useState(null);
  const [pendingRefPreview, setPendingRefPreview] = useState(null);
  const [pendingProvFile, setPendingProvFile] = useState(null);
  const [pendingProvPreview, setPendingProvPreview] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const uploading = uploadingRef || uploadingProv;

  // ===== POPUP MENU =====
  const handleMenuOpen = (event, file) => {
    event.stopPropagation(); // prevent row click
    setAnchorEl(event.currentTarget);
    setSelectedFile(file);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFile(null);
  };

  const handleDownload = () => {
    if (selectedFile?.url) {
      const fullUrl = buildFileUrl(selectedFile.url);
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = selectedFile.name || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    handleMenuClose();
  };

  // const handleDelete = () => {
  //   // UI-only delete for now
  //   if (!selectedFile) return;
  //   setFiles((prev) => prev.filter((f) => f.url !== selectedFile.url));
  //   handleMenuClose();
  // };

  // ===== UTILS =====

  const handleDelete = async () => {
    if (!selectedFile) return;

    // try to read id and type in a robust way
    const fileId = selectedFile.id || selectedFile._id;
    const fileType = selectedFile.type; // should be 'photo' or 'signature'

    if (!fileId || !fileType) {
      console.warn('Selected file is missing id or type', selectedFile);
      setError('Cannot delete this file – missing id or type from server.');
      handleMenuClose();
      return;
    }

    try {
      // Call backend: deletes from Mongo + temp folder based on type
      await deleteUpload(fileId, fileType);

      // Update UI list (remove from state)
      setFiles((prev) =>
        prev.filter((f) => f.id !== fileId && f._id !== fileId)
      );
    } catch (err) {
      console.error('Delete failed:', err);
      setError(
        `Failed to delete file: ${err.response?.data?.message || err.message}`
      );
    } finally {
      handleMenuClose();
    }
  };

  const getAcceptedFormats = () => {
    return '.jpeg,.jpg,.png,.pdf';
  };

  const getSupportText = () => {
    return 'Only .jpeg, .jpg, .png, .pdf format supported';
  };

  const getFileIcon = (name = '') => {
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <PictureAsPdfIcon color='primary' />;
    if (['jpg', 'jpeg', 'png'].includes(ext))
      return <ImageIcon color='primary' />;
    if (['ppt', 'pptx'].includes(ext))
      return <InsertDriveFileIcon color='primary' />;
    if (['zip', 'rar'].includes(ext)) return <FolderIcon color='primary' />;
    return <InsertDriveFileIcon color='primary' />;
  };

  // ===== FETCH RECENT FROM BACKEND =====
  const refreshRecent = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getRecentUploads();

      if (!res?.data?.success) {
        setError('Server returned an error');
        setFiles([]);
        return;
      }

      const { files: allFiles = [] } = res.data;

      const mapped = allFiles.map((f) => {
        const id = f._id || f.id;
        const type = f.type || f.fileType || 'photo';

        return {
          id,
          name: f.name || 'Unnamed',
          time: f.uploadedAt
            ? new Date(f.uploadedAt).toLocaleString()
            : 'Recently',
          size: f.size ? `${(f.size / 1024).toFixed(1)} KB` : 'Unknown',
          icon: getFileIcon(f.name),
          url: f.url,
          slot: f.slot,
          type,
        };
      });

      setFiles(mapped);
    } catch (err) {
      console.error('Error fetching recent uploads:', err);
      setError(`Failed to load files: ${err.message}`);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // ===== INITIAL LOAD =====
  useEffect(() => {
    refreshRecent();
  }, []);

  // ===== UPLOAD HANDLING =====
  const uploadSingleFile = async (file, slot) => {
    if (!file) return;

    // choose which slot is uploading
    const setSlotUploading =
      slot === 'reference' ? setUploadingRef : setUploadingProv;

    try {
      setSlotUploading(true);
      setError(null);

      // artificial delay to show "lazy loading" for some time
      await new Promise((resolve) => setTimeout(resolve, 800));

      const response = await uploadFile(file, fileType, slot);
      console.log(`Upload successful (${slot}):`, response?.data);

      await refreshRecent();
    } catch (err) {
      console.error('Upload failed:', err);
      setError(`Upload failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setSlotUploading(false);

      // clear pending and preview for that slot
      if (slot === 'reference') {
        setPendingRefFile(null);
        setPendingRefPreview(null);
      } else {
        setPendingProvFile(null);
        setPendingProvPreview(null);
      }
    }
  };

  const handleFileSelect = (e, slot) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (slot === 'reference') {
      setPendingRefFile(file);
      setPendingRefPreview(
        isImageFile(file) ? URL.createObjectURL(file) : null
      );
      uploadSingleFile(file, 'reference'); // auto-upload
    } else {
      setPendingProvFile(file);
      setPendingProvPreview(
        isImageFile(file) ? URL.createObjectURL(file) : null
      );
      uploadSingleFile(file, 'provided'); // auto-upload
    }

    e.target.value = '';
  };

  const handleDrop = (e, slot) => {
    e.preventDefault();
    if (uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (slot === 'reference') {
      setPendingRefFile(file);
      setPendingRefPreview(
        isImageFile(file) ? URL.createObjectURL(file) : null
      );
      uploadSingleFile(file, 'reference');
    } else {
      setPendingProvFile(file);
      setPendingProvPreview(
        isImageFile(file) ? URL.createObjectURL(file) : null
      );
      uploadSingleFile(file, 'provided');
    }
  };

  const preventDefaults = (e) => e.preventDefault();

  // ===== SPLIT LISTS =====
  const referenceList = files.filter((f) => f.slot === 'reference');
  const providedList = files.filter((f) => f.slot === 'provided');

  // ===== OPEN IN NEW TAB =====
  const handleOpenInNewTab = (file) => {
    const fullUrl = buildFileUrl(file.url);
    if (!fullUrl) return;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className='mb-6 w-full px-3 sm:px-4'>
      {/* Title */}
      <div className='text-center mb-2'>
        <Typography sx={{ fontWeight: 600, fontSize: '24px' }}>
          Upload
        </Typography>
      </div>

      {/* TYPE + UPLOAD BOXES */}
      <div className='mt-4 w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-md p-4 md:p-6'>
        {/* Type selector */}
        <div className='mb-4'>
          <Typography sx={{ fontSize: '20px', fontWeight: 600 }}>
            Select and Upload File
          </Typography>

          <RadioGroup
            row
            value={fileType}
            onChange={(e) => {
              setFileType(e.target.value);
              setPendingRefFile(null);
              setPendingRefPreview(null);
              setPendingProvFile(null);
              setPendingProvPreview(null);
            }}
            sx={{ mt: 1 }}
          >
            <FormControlLabel value='photo' control={<Radio />} label='Photo' />
            <FormControlLabel
              value='signature'
              control={<Radio />}
              label='Signature'
            />
          </RadioGroup>
        </div>

        {/* Upload boxes */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Reference upload */}
          <div>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>
              Upload Reference {fileType === 'photo' ? 'Image' : 'Signature'}
            </Typography>

            <div
              className={`border-2 border-dashed border-gray-200 rounded-2xl min-h-[200px] flex flex-col items-center justify-center p-4 transition ${
                uploadingRef ? 'cursor-default' : 'cursor-pointer'
              } hover:bg-gray-50`}
              style={{ opacity: uploadingRef ? 0.8 : 1 }}
              onClick={() =>
                !uploadingRef && referenceInputRef.current?.click()
              }
              onDrop={(e) => !uploadingRef && handleDrop(e, 'reference')}
              onDragOver={preventDefaults}
            >
              {/* If file selected -> show preview + uploading state */}
              {pendingRefFile ? (
                <div className='flex flex-col items-center'>
                  {pendingRefPreview && isImageFile(pendingRefFile) && (
                    <div className='mb-2 border border-gray-200 rounded-lg overflow-hidden inline-block'>
                      <img
                        src={pendingRefPreview}
                        alt='Reference preview'
                        className='max-w-[200px] max-h-[140px] object-contain block'
                      />
                    </div>
                  )}
                  <p className='text-xs font-semibold mb-1 text-gray-700 text-center'>
                    {pendingRefFile.name}
                  </p>
                  {uploadingRef && (
                    <div className='flex flex-col items-center mt-1 gap-1'>
                      <CircularProgress size={24} />
                      <p className='text-xs text-gray-500'>Uploading...</p>
                    </div>
                  )}
                </div>
              ) : uploadingRef ? (
                <div className='flex flex-col items-center gap-2'>
                  <CircularProgress size={45} />
                  <p className='text-sm text-gray-600'>Uploading...</p>
                </div>
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 45, color: '#777' }} />
                  <p className='mt-1 text-base text-gray-700 font-medium text-center'>
                    Click or drag file to this area to upload
                  </p>
                  <p className='mt-1 text-xs text-gray-400 text-center'>
                    {getSupportText()}
                  </p>
                </>
              )}

              <input
                type='file'
                hidden
                ref={referenceInputRef}
                accept={getAcceptedFormats()}
                onChange={(e) => handleFileSelect(e, 'reference')}
                disabled={uploadingRef}
              />
            </div>
          </div>

          {/* Provided upload */}
          <div>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>
              Upload Provided {fileType === 'photo' ? 'Image' : 'Signature'}
            </Typography>

            <div
              className={`border-2 border-dashed border-gray-200 rounded-2xl min-h-[200px] flex flex-col items-center justify-center p-4 transition ${
                uploadingProv ? 'cursor-default' : 'cursor-pointer'
              } hover:bg-gray-50`}
              style={{ opacity: uploadingProv ? 0.8 : 1 }}
              onClick={() =>
                !uploadingProv && providedInputRef.current?.click()
              }
              onDrop={(e) => !uploadingProv && handleDrop(e, 'provided')}
              onDragOver={preventDefaults}
            >
              {pendingProvFile ? (
                <div className='flex flex-col items-center'>
                  {pendingProvPreview && isImageFile(pendingProvFile) && (
                    <div className='mb-2 border border-gray-200 rounded-lg overflow-hidden inline-block'>
                      <img
                        src={pendingProvPreview}
                        alt='Provided preview'
                        className='max-w-[200px] max-h-[140px] object-contain block'
                      />
                    </div>
                  )}
                  <p className='text-xs font-semibold mb-1 text-gray-700 text-center'>
                    {pendingProvFile.name}
                  </p>
                  {uploadingProv && (
                    <div className='flex flex-col items-center mt-1 gap-1'>
                      <CircularProgress size={24} />
                      <p className='text-xs text-gray-500'>Uploading...</p>
                    </div>
                  )}
                </div>
              ) : uploadingProv ? (
                <div className='flex flex-col items-center gap-2'>
                  <CircularProgress size={45} />
                  <p className='text-sm text-gray-600'>Uploading...</p>
                </div>
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 45, color: '#777' }} />
                  <p className='mt-1 text-base text-gray-700 font-medium text-center'>
                    Click or drag file to this area to upload
                  </p>
                  <p className='mt-1 text-xs text-gray-400 text-center'>
                    {getSupportText()}
                  </p>
                </>
              )}

              <input
                type='file'
                hidden
                ref={providedInputRef}
                accept={getAcceptedFormats()}
                onChange={(e) => handleFileSelect(e, 'provided')}
                disabled={uploadingProv}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className='my-4 max-w-4xl mx-auto'>
          <Alert severity='error' onClose={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

      {/* RECENT UPLOADS */}
      <div className='mt-4 w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-md p-4 h-[60vh] overflow-y-auto'>
        {/* Header row */}
        <div className='flex flex-wrap items-center justify-between mb-3 gap-4'>
          <div className='flex-1 text-center'>
            <Button
              sx={{
                backgroundColor: '#F6F7FB',
                color: '#3B3E9F',
                textTransform: 'none',
                px: 4,
                py: 1,
                fontSize: '16px',
                borderRadius: '30px',
              }}
            >
              Recent Uploads ({files.length})
            </Button>
          </div>
          <IconButton onClick={refreshRecent} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </div>

        {/* Loading / Empty */}
        {loading && (
          <div className='text-center py-8'>
            <CircularProgress />
            <p className='mt-2 text-sm text-gray-500'>Loading files...</p>
          </div>
        )}

        {!loading && files.length === 0 && (
          <p className='text-center text-sm text-gray-500 py-8'>
            No files uploaded yet. Upload some files to see them here.
          </p>
        )}

        {/* Lists */}
        {!loading && files.length > 0 && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Reference list */}
            <div>
              <p className='font-semibold text-sm mb-2 text-gray-700'>
                Reference ({referenceList.length})
              </p>

              {referenceList.length === 0 && (
                <p className='text-xs text-gray-400 italic'>
                  No reference files yet. Upload using the left box above.
                </p>
              )}

              {referenceList.map((file, index) => (
                <div
                  key={`ref-${index}`}
                  className='flex items-center justify-between px-3 py-2 mb-1 border-b border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer'
                  onClick={() => handleOpenInNewTab(file)}
                >
                  <div className='flex items-center gap-3'>
                    <Avatar
                      sx={{
                        backgroundColor: '#F4F5F7',
                        color: '#6A5ACD',
                        width: 40,
                        height: 40,
                      }}
                    >
                      {file.icon}
                    </Avatar>

                    <div>
                      <div className='flex items-center gap-2'>
                        <p className='text-sm font-semibold text-gray-800'>
                          {file.name.length > 25
                            ? file.name.slice(0, 25) + '...'
                            : file.name}
                        </p>

                        {/* Type chip: Photo / Signature */}
                        <Chip
                          label={
                            file.type === 'signature' ? 'Signature' : 'Photo'
                          }
                          size='small'
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            backgroundColor:
                              file.type === 'signature' ? '#ffe0b2' : '#bbdefb',
                            color:
                              file.type === 'signature' ? '#e65100' : '#0d47a1',
                          }}
                        />
                      </div>

                      <p className='text-xs text-gray-500'>{file.time}</p>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    {/* <span className='text-[11px] text-gray-500'>
                      {file.size}
                    </span> */}
                    <IconButton
                      size='small'
                      onClick={(e) => handleMenuOpen(e, file)}
                    >
                      <MoreVertIcon fontSize='small' />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>

            {/* Provided list */}
            <div>
              <p className='font-semibold text-sm mb-2 text-gray-700'>
                Provided ({providedList.length})
              </p>

              {providedList.length === 0 && (
                <p className='text-xs text-gray-400 italic'>
                  No provided files yet. Upload using the right box above.
                </p>
              )}

              {providedList.map((file, index) => (
                <div
                  key={`prov-${index}`}
                  className='flex items-center justify-between px-3 py-2 mb-1 border-b border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer'
                  onClick={() => handleOpenInNewTab(file)}
                >
                  <div className='flex items-center gap-3'>
                    <Avatar
                      sx={{
                        backgroundColor: '#F4F5F7',
                        color: '#6A5ACD',
                        width: 40,
                        height: 40,
                      }}
                    >
                      {file.icon}
                    </Avatar>

                    <div>
                      <div className='flex items-center gap-2'>
                        <p className='text-sm font-semibold text-gray-800'>
                          {file.name.length > 25
                            ? file.name.slice(0, 25) + '...'
                            : file.name}
                        </p>

                        <Chip
                          label={
                            file.type === 'signature' ? 'Signature' : 'Photo'
                          }
                          size='small'
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            backgroundColor:
                              file.type === 'signature' ? '#ffe0b2' : '#c8e6c9',
                            color:
                              file.type === 'signature' ? '#e65100' : '#1b5e20',
                          }}
                        />
                      </div>

                      <p className='text-xs text-gray-500'>{file.time}</p>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    {/* <span className='text-[11px] text-gray-500'>
                      {file.size}
                    </span> */}
                    <IconButton
                      size='small'
                      onClick={(e) => handleMenuOpen(e, file)}
                    >
                      <MoreVertIcon fontSize='small' />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* POPUP MENU */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <List sx={{ minWidth: '150px' }}>
          <ListItem disablePadding>
            <ListItemButton onClick={handleDownload}>
              <ListItemIcon>
                <DownloadIcon color='primary' />
              </ListItemIcon>
              <ListItemText primary='Download' />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={handleDelete}>
              <ListItemIcon>
                <DeleteIcon color='error' />
              </ListItemIcon>
              <ListItemText primary='Delete' />
            </ListItemButton>
          </ListItem>
        </List>
      </Popover>
    </div>
  );
};

export default Upload;
