import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Stack,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PaymentIcon from "@mui/icons-material/Payment";
import PersonIcon from "@mui/icons-material/Person";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import NoteIcon from "@mui/icons-material/StickyNote2";
import EmailIcon from "@mui/icons-material/Email";

const formatTimestamp = (ts) => {
  if (!ts) return "—";
  try {
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleString("en-NZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

export default function OrderDetailsModal({
  open,
  order,
  onClose,
  onMarkComplete,
}) {
  if (!order) return null;

  const isPaid = order.status === "PAID";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: "#0f172a",
          color: "white",
          py: 2,
          pr: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={800}>
            #{order.orderId || order.id?.substring(0, 8)}
          </Typography>
          <Chip
            label={order.status}
            size="small"
            sx={{
              mt: 0.5,
              height: 22,
              fontWeight: 700,
              bgcolor: isPaid ? "#f59e0b" : "#10b981",
              color: "white",
            }}
          />
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Top info grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2.5,
              mb: 3,
            }}
          >
            {/* Customer – now includes email */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <PersonIcon sx={{ color: "#64748b", fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={700} color="#64748b">
                  CUSTOMER
                </Typography>
              </Stack>
              <Typography variant="body1" fontWeight={700}>
                {order.customerName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order.customerPhone || "—"}
              </Typography>
              {order.customerEmail && (
                <Stack direction="row" spacing={0.5} alignItems="center" mt={0.5}>
                  <EmailIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                  <Typography variant="body2" color="text.secondary">
                    {order.customerEmail}
                  </Typography>
                </Stack>
              )}
              <Chip
                label={order.orderType || "Pickup"}
                size="small"
                sx={{
                  mt: 1,
                  height: 22,
                  fontWeight: 600,
                  bgcolor: "#fff7ed",
                  color: "#ea580c",
                }}
              />
            </Paper>

            {/* Schedule */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <AccessTimeIcon sx={{ color: "#64748b", fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={700} color="#64748b">
                  EXPECTED
                </Typography>
              </Stack>
              <Typography variant="body1" fontWeight={700}>
                {order.scheduledTime || "ASAP"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Created {formatTimestamp(order.createdAt)}
              </Typography>
            </Paper>
          </Box>

          {/* Payment */}
          <Paper
            variant="outlined"
            sx={{ p: 2, borderRadius: 2, mb: 3, bgcolor: "#f8fafc" }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
              <PaymentIcon sx={{ color: "#64748b", fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight={700} color="#64748b">
                PAYMENT
              </Typography>
            </Stack>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="h6" fontWeight={800} color="#0f172a">
                  ${Number(order.totalAmount || 0).toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Method
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {order.intendedPaymentMethod ||
                    order.paymentProvider ||
                    "—"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Paid at
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatTimestamp(order.paidAt)}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Order Note */}
          {order.orderNote && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                mb: 3,
                borderColor: "#fecaca",
                bgcolor: "#fef2f2",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <NoteIcon sx={{ color: "#b91c1c", fontSize: 20 }} />
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color="#b91c1c"
                >
                  ORDER NOTE
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                sx={{ whiteSpace: "pre-wrap", color: "#7f1d1d" }}
              >
                {order.orderNote}
              </Typography>
            </Paper>
          )}

          {/* Items */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
              <RestaurantMenuIcon sx={{ color: "#64748b", fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight={700} color="#64748b">
                ITEMS ({order.items?.length || 0})
              </Typography>
            </Stack>

            <Stack spacing={1}>
              {order.items?.map((item, idx) => (
                <Paper
                  key={idx}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      <Box
                        component="span"
                        sx={{ color: "#ea580c", mr: 0.8 }}
                      >
                        {item.quantity}×
                      </Box>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {[item.selectedSize, item.selectedSpice]
                        .filter(Boolean)
                        .join(" • ") || "Standard"}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700}>
                    ${Number(item.totalPrice || 0).toFixed(2)}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: "#f8fafc" }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Close
        </Button>
        {isPaid && (
          <Button
            variant="contained"
            color="success"
            disableElevation
            onClick={() => {
              onMarkComplete(order.id);
              onClose();
            }}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
          >
            Mark as Complete
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}