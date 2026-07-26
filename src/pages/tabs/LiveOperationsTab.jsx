import { useState } from "react";
import {
  Typography,
  Box,
  Chip,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OrderDetailsModal from "../../components/OrderDetailsModal";

// ==========================================
// COMPONENT 1: ACTIVE STREAMING GRID
// ==========================================
const ActiveQueueTable = ({ pendingOrders, onMarkComplete, onRowClick }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #e2e8f0",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Grid Header */}
      <Box
        sx={{
          bgcolor: "#f8fafc",
          p: 1.5,
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            bgcolor: "#f59e0b",
            animation: "pulse 2s infinite",
          }}
        />
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: "800",
            color: "#0f172a",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Live Kitchen Queue ({pendingOrders.length})
        </Typography>
      </Box>

      {/* Grid Body */}
      <TableContainer sx={{ flexGrow: 1, overflowY: "auto" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: "#f1f5f9", fontWeight: "bold", color: "#64748b" }}>
                Order
              </TableCell>
              <TableCell sx={{ bgcolor: "#f1f5f9", fontWeight: "bold", color: "#64748b" }}>
                Customer
              </TableCell>
              <TableCell sx={{ bgcolor: "#f1f5f9", fontWeight: "bold", color: "#64748b" }}>
                Expected
              </TableCell>
              <TableCell
                sx={{ bgcolor: "#f1f5f9", fontWeight: "bold", color: "#64748b", textAlign: "right" }}
              >
                Total
              </TableCell>
              <TableCell
                sx={{ bgcolor: "#f1f5f9", fontWeight: "bold", color: "#64748b", textAlign: "right" }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8, color: "#94a3b8" }}>
                  No active orders expected today.
                </TableCell>
              </TableRow>
            ) : (
              pendingOrders.map((order) => (
                <TableRow
                  key={order.id}
                  hover
                  onClick={() => onRowClick(order)}
                  sx={{
                    cursor: "pointer",
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  {/* Order ID & Type */}
                  <TableCell sx={{ verticalAlign: "middle" }}>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace", fontWeight: "bold", color: "#334155" }}
                    >
                      #{order.orderId || order.id.substring(0, 6)}
                    </Typography>
                    <Chip
                      label={order.orderType || "Pickup"}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.65rem",
                        mt: 0.5,
                        bgcolor: "#fff7ed",
                        color: "#ea580c",
                        fontWeight: "bold",
                      }}
                    />
                  </TableCell>

                  {/* Customer */}
                  <TableCell sx={{ verticalAlign: "middle" }}>
                    <Typography variant="body2" sx={{ fontWeight: "bold", color: "#0f172a" }}>
                      {order.customerName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      {order.customerPhone}
                    </Typography>
                  </TableCell>

                  {/* Expected Time */}
                  <TableCell sx={{ verticalAlign: "middle" }}>
                    <Typography variant="body2" fontWeight={600} color="#0f172a">
                      {order.scheduledTime || "ASAP"}
                    </Typography>
                  </TableCell>

                  {/* Total */}
                  <TableCell sx={{ verticalAlign: "middle", textAlign: "right" }}>
                    <Typography variant="body2" sx={{ fontWeight: "900", color: "#0f172a" }}>
                      ${Number(order.totalAmount || 0).toFixed(2)}
                    </Typography>
                  </TableCell>

                  {/* Action */}
                  <TableCell sx={{ verticalAlign: "middle", textAlign: "right" }}>
                    <Button
                      variant="contained"
                      color="success"
                      disableElevation
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkComplete(order.id);
                      }}
                      sx={{ textTransform: "none", fontWeight: "bold", borderRadius: 1.5 }}
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
const CompletedTodayTable = ({ completedOrders, onRowClick }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #e2e8f0",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          bgcolor: "#f8fafc",
          p: 1.5,
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <CheckCircleIcon sx={{ color: "#10b981", fontSize: "1.2rem" }} />
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: "800",
            color: "#0f172a",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Completed Log ({completedOrders.length})
        </Typography>
      </Box>

      <TableContainer sx={{ flexGrow: 1, overflowY: "auto" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: "#f1f5f9", fontWeight: "bold", color: "#64748b" }}>
                Order ID
              </TableCell>
              <TableCell sx={{ bgcolor: "#f1f5f9", fontWeight: "bold", color: "#64748b" }}>
                Customer
              </TableCell>
              <TableCell
                sx={{ bgcolor: "#f1f5f9", fontWeight: "bold", color: "#64748b", textAlign: "right" }}
              >
                Total
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {completedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 8, color: "#94a3b8" }}>
                  No completed orders yet.
                </TableCell>
              </TableRow>
            ) : (
              completedOrders.map((order) => (
                <TableRow
                  key={order.id}
                  hover
                  onClick={() => onRowClick(order)}
                  sx={{
                    cursor: "pointer",
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: "monospace", color: "#64748b" }}>
                      {order.orderId || order.id.substring(0, 6)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: "600", color: "#334155" }}>
                      {order.customerName}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: "bold", color: "#10b981" }}>
                      ${Number(order.totalAmount || 0).toFixed(2)}
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
// MAIN EXPORT
// ==========================================
export default function LiveOperationsTab({
  pendingOrders,
  completedOrders,
  onMarkComplete,
}) {
  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <>
      <Box
        sx={{
          height: "calc(100vh - 320px)",
          minHeight: "500px",
          display: "flex",
          gap: 3,
          textAlign: "left",
        }}
      >
        <Box sx={{ flex: 6, height: "100%" }}>
          <ActiveQueueTable
            pendingOrders={pendingOrders}
            onMarkComplete={onMarkComplete}
            onRowClick={setSelectedOrder}
          />
        </Box>

        <Box sx={{ flex: 4, height: "100%" }}>
          <CompletedTodayTable
            completedOrders={completedOrders}
            onRowClick={setSelectedOrder}
          />
        </Box>
      </Box>

      <OrderDetailsModal
        open={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onMarkComplete={onMarkComplete}
      />
    </>
  );
}