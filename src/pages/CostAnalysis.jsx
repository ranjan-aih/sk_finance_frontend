import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

import {
  Paper,
  CircularProgress,
  Alert,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

import Pagination from '@mui/material/Pagination';

const formatDate = (isoString) => {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleDateString();
};

const formatTime = (isoString) => {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const CostAnalysis = () => {
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);

  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [errorSummary, setErrorSummary] = useState('');
  const [errorLogs, setErrorLogs] = useState('');

  const [expandedRef, setExpandedRef] = useState(null);
  const [expandedProvided, setExpandedProvided] = useState(null);

  // Sort option
  const [sortOption, setSortOption] = useState('latest'); // latest | oldest | highest | lowest

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const ellipsisStyle = {
    maxWidth: '70%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'inline-block',
  };

  const fetchSummary = async () => {
    try {
      setLoadingSummary(true);
      setErrorSummary('');

      const res = await axiosInstance.get('/verifications/cost-summary');
      if (res.data?.success) setSummary(res.data);
      else setErrorSummary(res.data?.message || 'Failed to load cost summary');
    } catch {
      setErrorSummary('Failed to load cost summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      setErrorLogs('');

      const res = await axiosInstance.get('/verifications', {
        params: { page: 1, limit: 50 }, // backend limit (you can change later if needed)
      });

      if (res.data?.success) setLogs(res.data.items || []);
      else setErrorLogs(res.data?.message || 'Failed to load cost entries');
    } catch {
      setErrorLogs('Failed to load cost entries');
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchLogs();
  }, []);

  const overall = summary?.overall || {};
  const byType = summary?.byType || {};

  // Sort logs based on filter
  const sortedLogs = [...logs].sort((a, b) => {
    const aDate = new Date(a.createdAt).getTime();
    const bDate = new Date(b.createdAt).getTime();
    const aCost = a.totalCost ?? 0;
    const bCost = b.totalCost ?? 0;

    switch (sortOption) {
      case 'latest':
        return bDate - aDate; // newest first
      case 'oldest':
        return aDate - bDate; // oldest first
      case 'highest':
        return bCost - aCost; // highest cost first
      case 'lowest':
        return aCost - bCost; // lowest cost first
      default:
        return 0;
    }
  });

  // Reset to page 1 when sort or data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortOption, logs.length]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(sortedLogs.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedLogs = sortedLogs.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div
      className='px-4 md:px-8 py-4 w-full overflow-x-hidden'
      style={{ fontFamily: 'Albert Sans, sans-serif' }}
    >
      <div className='flex items-center justify-center mb-4 flex-wrap gap-3'>
        <h2 className='text-xl md:text-2xl font-semibold text-gray-800'>
          Cost Analysis
        </h2>
      </div>

      {/* Summary Cards */}
      {!loadingSummary && !errorSummary && summary && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-10'>
          {[
            {
              label: 'Total Cost',
              value: (overall.totalCost ?? 0).toFixed(4),
              isCurrency: true,
            },
            {
              label: 'Total Photo Cost',
              value: (byType.photo?.totalCost ?? 0).toFixed(4),
              isCurrency: true,
            },
            {
              label: 'Total Signature Cost',
              value: (byType.signature?.totalCost ?? 0).toFixed(4),
              isCurrency: true,
            },
            {
              label: 'Total Comparisons',
              value: overall.totalRequests ?? 0,
              isCurrency: false,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className='backdrop-blur-xl bg-white/70 border border-gray-200 shadow-md  transition-all rounded-2xl p-6'
            >
              <p className='text-gray-600 text-sm font-medium'>{item.label}</p>
              <p className='text-3xl font-bold mt-3'>
                {item.isCurrency ? `$${item.value}` : item.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <Paper
        className='rounded-xl shadow-md'
        sx={{ width: '100%', overflowX: 'hidden' }}
      >
        <div className='px-4 py-3 border-b border-gray-400 flex items-center justify-between bg-gray-50'>
          <Typography variant='subtitle1' fontWeight={600}>
            Request History
          </Typography>

          {/* Sort Filter */}
          <div className='flex items-center gap-2'>
            <span className='text-xs md:text-sm text-gray-600'>Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className='border border-gray-300 rounded-lg text-xs md:text-sm px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='latest'>Latest</option>
              <option value='oldest'>Oldest</option>
              <option value='highest'>Highest Cost</option>
              <option value='lowest'>Lowest Cost</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loadingLogs && !sortedLogs.length ? (
          <div className='flex items-center justify-center py-8'>
            <CircularProgress size={28} />
          </div>
        ) : null}

        {/* Error */}
        {!loadingLogs && errorLogs && (
          <div className='p-4'>
            <Alert severity='error'>{errorLogs}</Alert>
          </div>
        )}

        {/* Table Data */}
        {!loadingLogs && !errorLogs && (
          <>
            <TableContainer
              sx={{
                maxWidth: '100%',
                overflowX: 'hidden',
              }}
            >
              <Table
                size='small'
                sx={{
                  tableLayout: 'fixed',
                  width: '100%',
                }}
              >
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                    <TableCell>
                      <b>Date</b>
                    </TableCell>
                    <TableCell>
                      <b>Type</b>
                    </TableCell>
                    <TableCell sx={{ width: '26%' }}>
                      <b>Reference</b>
                    </TableCell>
                    <TableCell sx={{ width: '26%' }}>
                      <b>Provided</b>
                    </TableCell>
                    <TableCell sx={{ width: '12%' }}>
                      <b>Cost</b>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedLogs.map((log) => {
                    const providedNames = log.request?.providedFileNames || [];

                    return (
                      <TableRow
                        key={log._id}
                        hover
                        sx={{
                          '&:hover': { backgroundColor: '#f5f7fa' },
                          transition: 'all 0.2s',
                        }}
                      >
                        {/* Date + Time */}
                        <TableCell>
                          <Typography className='font-medium'>
                            {formatDate(log.createdAt)}
                          </Typography>
                          <Typography className='text-xs text-gray-500'>
                            {formatTime(log.createdAt)}
                          </Typography>
                        </TableCell>

                        {/* Type */}
                        <TableCell>
                          <Chip
                            size='small'
                            label={log.type}
                            color={
                              log.type === 'photo'
                                ? 'primary'
                                : log.type === 'signature'
                                ? 'secondary'
                                : 'default'
                            }
                            variant='outlined'
                          />
                        </TableCell>

                        {/* Reference File */}
                        <TableCell
                          onClick={() =>
                            setExpandedRef(
                              expandedRef === log._id ? null : log._id
                            )
                          }
                          style={{ cursor: 'pointer' }}
                          sx={{ wordBreak: 'break-all' }}
                        >
                          {expandedRef === log._id ? (
                            <Typography className='break-all text-sm'>
                              {log.request?.referenceFileName || '-'}
                            </Typography>
                          ) : (
                            <Typography style={ellipsisStyle}>
                              {log.request?.referenceFileName || '-'}
                            </Typography>
                          )}

                          <Typography className='text-xs text-blue-600 underline'>
                            {expandedRef === log._id ? 'Hide' : 'Show'} details
                          </Typography>
                        </TableCell>

                        {/* Provided Files */}
                        <TableCell
                          onClick={() =>
                            setExpandedProvided(
                              expandedProvided === log._id ? null : log._id
                            )
                          }
                          style={{ cursor: 'pointer' }}
                          sx={{ wordBreak: 'break-all' }}
                        >
                          {expandedProvided === log._id ? (
                            <div className='break-all text-sm'>
                              {providedNames.map((file, i) => (
                                <div key={i}>{file}</div>
                              ))}
                            </div>
                          ) : (
                            <Typography style={ellipsisStyle}>
                              {providedNames.length === 0
                                ? '-'
                                : `${providedNames[0]}${
                                    providedNames.length > 1
                                      ? ` + ${providedNames.length - 1} more`
                                      : ''
                                  }`}
                            </Typography>
                          )}

                          <Typography className='text-xs text-blue-600 underline'>
                            {expandedProvided === log._id ? 'Hide' : 'Show'}{' '}
                            details
                          </Typography>
                        </TableCell>

                        {/* COST */}
                        <TableCell>
                          <span className='font-bold text-green-700 text-base'>
                            ${log.totalCost?.toFixed(4) || '0.0000'}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Controls */}
            {sortedLogs.length > 0 && (
              <div className='flex justify-end px-4 py-3'>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  size='small'
                  color='primary'
                  showFirstButton
                  showLastButton
                />
              </div>
            )}
          </>
        )}
      </Paper>
    </div>
  );
};

export default CostAnalysis;
