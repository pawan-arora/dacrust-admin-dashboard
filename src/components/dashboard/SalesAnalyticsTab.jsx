import { Grid, Card, CardContent, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SalesAnalyticsTab({ totalSales, chartData, premiumCustomers }) {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={4}>
        <Card elevation={0} style={{ border: '1px solid #e5e7eb', height: '100%', display: 'flex', alignItems: 'center' }}>
          <CardContent style={{ width: '100%', textAlign: 'center' }}>
            <Typography color="textSecondary" variant="subtitle1" gutterBottom>Gross Total Income</Typography>
            <Typography variant="h2" style={{ fontWeight: 'bold', color: '#111827' }}>
              ${totalSales.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={8}>
        <Card elevation={0} style={{ border: '1px solid #e5e7eb', height: '320px', padding: '16px' }}>
          <Typography variant="h6" gutterBottom style={{ fontSize: '1rem' }}>Revenue Flow Timeline</Typography>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip />
              <Line type="monotone" dataKey="Sales" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom style={{ color: '#374151' }}>Top Premium Spenders</Typography>
        <TableContainer component={Paper} elevation={0} style={{ border: '1px solid #e5e7eb' }}>
          <Table>
            <TableHead style={{ backgroundColor: '#f9fafb' }}>
              <TableRow>
                <TableCell style={{ fontWeight: 'bold' }}>Rank</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell align="right" style={{ fontWeight: 'bold' }}>Visits</TableCell>
                <TableCell align="right" style={{ fontWeight: 'bold' }}>Contribution</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {premiumCustomers.slice(0, 5).map((cust, idx) => (
                <TableRow key={cust.email} hover>
                  <TableCell>#{idx + 1}</TableCell>
                  <TableCell style={{ fontWeight: '500' }}>{cust.name}</TableCell>
                  <TableCell>{cust.email}</TableCell>
                  <TableCell align="right">{cust.orderCount}</TableCell>
                  <TableCell align="right" style={{ color: '#10b981', fontWeight: 'bold' }}>${cust.totalSpent.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
}