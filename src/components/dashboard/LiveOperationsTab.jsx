import { Grid, Card, Typography, Box, Chip, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function LiveOperationsTab({ pendingOrders, completedOrders, onMarkComplete }) {
  return (
    <Grid container spacing={4}>
      
      {/* Left Column: Active Queue */}
      <Grid item xs={12} md={6}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f59e0b', animation: 'pulse 2s infinite' }} />
          <Typography variant="h6" sx={{ color: '#1f2937', fontWeight: 'bold' }}>
            Active Kitchen Queue ({pendingOrders.length})
          </Typography>
        </Box>

        {pendingOrders.map((order) => (
          <Card 
            key={order.id} 
            elevation={0}
            sx={{ 
              mb: 2, 
              border: '1px solid #e5e7eb', 
              borderLeft: '4px solid #f59e0b',
              borderRadius: 2,
              transition: 'all 0.2s',
              '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderColor: '#d1d5db' }
            }}
          >
            <Box p={2.5}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Order #{order.orderId || order.id.substring(0,6)}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="#111827">
                    {order.customerName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {order.customerPhone}
                  </Typography>
                </Box>
                <Chip 
                  label={order.orderType || 'Pickup'} 
                  size="small" 
                  sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 'bold', borderRadius: 1 }} 
                />
              </Box>

              {order.orderNote && (
                <Box sx={{ bgcolor: '#f9fafb', p: 1.5, borderRadius: 1, mb: 2, border: '1px dashed #d1d5db' }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#4b5563' }}>
                    📝 "{order.orderNote}"
                  </Typography>
                </Box>
              )}

              <Box sx={{ my: 2 }}>
                {order.items?.map((item, idx) => (
                  <Box key={idx} display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" fontWeight="500" color="#374151">
                      <span style={{ color: '#ea580c', fontWeight: 'bold', marginRight: '8px' }}>{item.quantity}x</span> 
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">${item.totalPrice}</Typography>
                  </Box>
                ))}
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} pt={2} sx={{ borderTop: '1px solid #f3f4f6' }}>
                <Typography variant="h6" fontWeight="bold" color="#111827">
                  ${order.totalAmount}
                </Typography>
                <Button 
                  variant="contained" 
                  color="success" 
                  disableElevation 
                  startIcon={<CheckCircleIcon />}
                  onClick={() => onMarkComplete(order.id)}
                  sx={{ borderRadius: 1.5, fontWeight: 'bold' }}
                >
                  Mark Complete
                </Button>
              </Box>
            </Box>
          </Card>
        ))}
        {pendingOrders.length === 0 && (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: 2 }}>
            <Typography color="textSecondary">Kitchen is clear! No active orders.</Typography>
          </Paper>
        )}
      </Grid>

      {/* Right Column: Completed */}
      <Grid item xs={12} md={6}>
        <Typography variant="h6" sx={{ color: '#1f2937', fontWeight: 'bold', mb: 2, pl: 1 }}>
          ✅ Completed Today ({completedOrders.length})
        </Typography>
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
          <Table size="medium">
            <TableHead sx={{ bgcolor: '#f9fafb' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: '#6b7280' }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#6b7280' }}>Customer</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#6b7280' }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {completedOrders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', color: '#6b7280' }}>
                    {order.orderId || order.id.substring(0,5)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '500' }}>{order.customerName}</TableCell>
                  <TableCell align="right" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                    ${order.totalAmount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
}