import { Typography, Box, Chip, Button, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
//import CircularProgress from '@mui/material/CircularProgress';

// ==========================================
// COMPONENT 1: ACTIVE STREAMING GRID
// ==========================================
const ActiveQueueTable = ({ pendingOrders, onMarkComplete }) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        height: '100%', // Fills the parent column exactly
        display: 'flex', 
        flexDirection: 'column',
        border: '1px solid #e2e8f0', 
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Grid Header */}
      <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f59e0b', animation: 'pulse 2s infinite' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Live Kitchen Queue ({pendingOrders.length})
        </Typography>
      </Box>

      {/* Grid Body (Scrollable) */}
      <TableContainer sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: '#f1f5f9', fontWeight: 'bold', color: '#64748b' }}>Order</TableCell>
              <TableCell sx={{ bgcolor: '#f1f5f9', fontWeight: 'bold', color: '#64748b' }}>Customer</TableCell>
              <TableCell sx={{ bgcolor: '#f1f5f9', fontWeight: 'bold', color: '#64748b' }}>Items</TableCell>
              <TableCell sx={{ bgcolor: '#f1f5f9', fontWeight: 'bold', color: '#64748b', textAlign: 'right' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 8, color: '#94a3b8' }}>
                  No active orders in the stream.
                </TableCell>
              </TableRow>
            ) : (
              pendingOrders.map((order) => (
                <TableRow key={order.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  {/* Order ID & Type */}
                  <TableCell sx={{ verticalAlign: 'top', pt: 2 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#334155' }}>
                      #{order.orderId || order.id.substring(0, 6)}
                    </Typography>
                    <Chip label={order.orderType || 'Pickup'} size="small" sx={{ height: 20, fontSize: '0.65rem', mt: 0.5, bgcolor: '#fff7ed', color: '#ea580c', fontWeight: 'bold' }} />
                  </TableCell>

                  {/* Customer Info */}
                  <TableCell sx={{ verticalAlign: 'top', pt: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#0f172a' }}>{order.customerName}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>{order.customerPhone}</Typography>
                    {order.orderNote && (
                      <Typography variant="caption" sx={{ color: '#b91c1c', fontStyle: 'italic', display: 'block', mt: 0.5 }}>
                        Note: {order.orderNote}
                      </Typography>
                    )}
                  </TableCell>

                  {/* Items List */}
                  <TableCell sx={{ verticalAlign: 'top', pt: 2 }}>
                    {order.items?.map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#ea580c' }}>{item.quantity}x</Typography>
                        <Typography variant="caption" sx={{ color: '#334155' }}>{item.name}</Typography>
                      </Box>
                    ))}
                  </TableCell>

                  {/* Action & Total */}
                  <TableCell sx={{ verticalAlign: 'top', pt: 2, textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontWeight: '900', color: '#0f172a', mb: 1 }}>
                      ${order.totalAmount}
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="success" 
                      disableElevation 
                      size="small"
                      onClick={() => onMarkComplete(order.id)}
                      sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: 1.5 }}
                    >
                      Complete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

// ==========================================
// COMPONENT 2: COMPLETED STREAMING GRID
// ==========================================
const CompletedTodayTable = ({ completedOrders }) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        border: '1px solid #e2e8f0', 
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <CheckCircleIcon sx={{ color: '#10b981', fontSize: '1.2rem' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Completed Log ({completedOrders.length})
        </Typography>
      </Box>

      <TableContainer sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: '#f1f5f9', fontWeight: 'bold', color: '#64748b' }}>Order ID</TableCell>
              <TableCell sx={{ bgcolor: '#f1f5f9', fontWeight: 'bold', color: '#64748b' }}>Customer</TableCell>
              <TableCell sx={{ bgcolor: '#f1f5f9', fontWeight: 'bold', color: '#64748b', textAlign: 'right' }}>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {completedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 8, color: '#94a3b8' }}>
                  No completed orders yet.
                </TableCell>
              </TableRow>
            ) : (
              completedOrders.map((order) => (
                <TableRow key={order.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748b' }}>
                      {order.orderId || order.id.substring(0, 6)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: '600', color: '#334155' }}>
                      {order.customerName}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#10b981' }}>
                      ${order.totalAmount}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

// ==========================================
// MAIN EXPORT: THE PARENT LAYOUT
// ==========================================
export default function LiveOperationsTab({ pendingOrders, completedOrders, onMarkComplete }) {
  return (
    // 🌟 The calc() function calculates the total screen height minus the space the header takes up.
    // This creates a rigid frame that fills the screen without scrolling the whole page.
    <Box sx={{ height: 'calc(100vh - 320px)', minHeight: '500px', display: 'flex', gap: 3, textAlign: 'left' }}>
      
      {/* Left Column: Takes up 60% of the space */}
      <Box sx={{ flex: 6, height: '100%' }}>
        <ActiveQueueTable pendingOrders={pendingOrders} onMarkComplete={onMarkComplete} />
      </Box>

      {/* Right Column: Takes up 40% of the space */}
      <Box sx={{ flex: 4, height: '100%' }}>
        <CompletedTodayTable completedOrders={completedOrders} />
      </Box>

    </Box>
  );
}