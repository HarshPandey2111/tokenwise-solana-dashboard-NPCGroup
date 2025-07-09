import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [buysVsSells, setBuysVsSells] = useState<{ tx_type: string; count: string }[]>([]);
  const [protocolUsage, setProtocolUsage] = useState<{ protocol: string; count: string }[]>([]);

  useEffect(() => {
    axios.get('/api/insights/buys-vs-sells').then(res => setBuysVsSells(res.data));
    axios.get('/api/insights/protocol-usage').then(res => setProtocolUsage(res.data));
  }, []);

  const buysVsSellsData = {
    labels: buysVsSells.map(d => d.tx_type),
    datasets: [
      {
        data: buysVsSells.map(d => Number(d.count)),
        backgroundColor: ['#36A2EB', '#FF6384'],
        borderWidth: 1,
      },
    ],
  };

  const protocolUsageData = {
    labels: protocolUsage.map(d => d.protocol),
    datasets: [
      {
        data: protocolUsage.map(d => Number(d.count)),
        backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384', '#4BC0C0', '#9966FF'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: 32 }}>
      <Typography variant="h3" gutterBottom>
        TokenWise Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper style={{ padding: 16 }}>
            <Typography variant="h6">Buys vs Sells</Typography>
            <Pie data={buysVsSellsData} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper style={{ padding: 16 }}>
            <Typography variant="h6">Protocol Usage</Typography>
            <Pie data={protocolUsageData} />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper style={{ padding: 16 }}>
            <Typography variant="h6">Transactions Over Time</Typography>
            {/* Line chart here */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper style={{ padding: 16 }}>
            <Typography variant="h6">Most Active Wallets</Typography>
            {/* Bar chart or table here */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper style={{ padding: 16 }}>
            <Typography variant="h6">Top Wallets</Typography>
            {/* Table here */}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;