import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
} from '@mui/material';
import logo1 from '../assets/iconsax-receipt-1.svg';
import logo2 from '../assets/iconsax-ticket-star.svg';
import logo3 from '../assets/iconsax-chart.svg';

export default function Dashboard() {
  const rows = [
    {
      id: 1,
      app: 'LA1234567890',
      name: 'Willie Stroker',
      by: 'Sue Flay',
      date: '10th Jan 2010',
      status: 'Approved',
    },
    {
      id: 2,
      app: 'LA1234567890',
      name: 'Moe Lester',
      by: 'Sue Flay',
      date: '10th Jan 2010',
      status: 'Rejected',
    },
    {
      id: 3,
      app: 'LA1234567890',
      name: 'Paige Turner',
      by: 'Sue Flay',
      date: '10th Jan 2010',
      status: 'Action Needed',
    },
    {
      id: 4,
      app: 'LA1234567890',
      name: 'Hugh Jass',
      by: 'Sue Flay',
      date: '10th Jan 2010',
      status: 'Approved',
    },
    {
      id: 5,
      app: 'LA1234567890',
      name: 'Barry Cade / Mary Juana',
      by: 'Sue Flay',
      date: '10th Jan 2010',
      status: 'Approved',
    },
  ];

  const getStatusColor = (status) => {
    if (status === 'Approved') return 'green';
    if (status === 'Rejected') return 'red';
    if (status === 'Action Needed') return '#F4A607';
    return 'black';
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: '20px', md: '24px' },
          fontWeight: 700,
          mb: 2,
        }}
      >
        Welcome {'John Doe'}
      </Typography>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems='stretch'
        justifyContent='space-between'
        gap={2}
        mb={2}
      >
        {[
          { title: 'Matches Today', value: '53,000', icon: logo1 },
          { title: 'Mismatches Today', value: '20', icon: logo2 },
          { title: 'Pending Reviews', value: '100', icon: logo3 },
        ].map((item, index) => (
          <Box
            key={index}
            sx={{
              bgcolor: '#4a4397',
              p: { xs: 2, md: 3 },
              borderRadius: '20px',
              boxShadow: 1,
              width: '100%',
            }}
          >
            <Stack direction='row' alignItems='center' spacing={2}>
              <img src={item.icon} alt='' width={40} />
              <Box>
                <Typography
                  sx={{
                    color: '#f7f7f7',
                    fontSize: { xs: '16px', md: '20px' },
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  sx={{ color: '#fff', fontSize: { xs: '18px', md: '20px' } }}
                >
                  {item.value}
                </Typography>
              </Box>
            </Stack>
          </Box>
        ))}
      </Stack>

      <Paper elevation={3} sx={{ p: { xs: 1, md: 2 }, borderRadius: '12px' }}>
        <TableContainer
          sx={{
            border: 1,
            borderColor: '#E5E5E5',
            borderRadius: '12px',
            overflowX: 'auto',
          }}
        >
          <Table sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#373A8A' }}>
                {[
                  'Sr. No',
                  'Application Number',
                  'Applicant’s Name',
                  'Document submitted by',
                  'Document submitted on',
                  'Status',
                  'Actions',
                ].map((heading) => (
                  <TableCell
                    key={heading}
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {heading}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.app}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.by}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell
                    sx={{ color: getStatusColor(row.status), fontWeight: 600 }}
                  >
                    {row.status}
                  </TableCell>
                  <TableCell sx={{ color: '#373A8A', cursor: 'pointer' }}>
                    View
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            mt: 2,
            display: 'flex',
            justifyContent: { xs: 'center', md: 'flex-end' },
            gap: 2,
          }}
        >
          <Button
            variant='outlined'
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              px: { xs: 2, md: 3 },
            }}
          >
            Previous
          </Button>

          <Button
            variant='contained'
            sx={{
              textTransform: 'none',
              backgroundColor: '#373A8A',
              borderRadius: '8px',
              px: { xs: 3, md: 4 },
              '&:hover': { backgroundColor: '#2C2F7A' },
            }}
          >
            Next
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
