import { Grid, Box, Typography, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Card } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MenuPerformanceTab({ topProducts, limit, setLimit }) {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Menu Velocity Distribution</Typography>
          <Box display="flex" gap={1} alignItems="center">
            <Typography variant="body2" color="textSecondary">Showing top:</Typography>
            <Button size="small" variant={limit === 2 ? "contained" : "outlined"} onClick={() => setLimit(2)}>2</Button>
            <Button size="small" variant={limit === 5 ? "contained" : "outlined"} onClick={() => setLimit(5)}>5</Button>
            <Button size="small" variant={limit === 10 ? "contained" : "outlined"} onClick={() => setLimit(10)}>10</Button>
          </Box>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <TableContainer component={Paper} elevation={0} style={{ border: '1px solid #e5e7eb' }}>
              <Table>
                <TableHead style={{ backgroundColor: '#f9fafb' }}>
                  <TableRow>
                    <TableCell style={{ fontWeight: 'bold' }}>Item Name</TableCell>
                    <TableCell align="right" style={{ fontWeight: 'bold' }}>Units Sold</TableCell>
                    <TableCell align="right" style={{ fontWeight: 'bold' }}>Gross Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProducts.slice(0, limit).map((product, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell style={{ fontWeight: '500' }}>{product.name}</TableCell>
                      <TableCell align="right">{product.quantity}</TableCell>
                      <TableCell align="right" style={{ color: '#2563eb', fontWeight: 'bold' }}>${product.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Card elevation={0} style={{ border: '1px solid #e5e7eb', padding: '16px', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts.slice(0, limit)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis label={{ value: 'Units Sold', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}