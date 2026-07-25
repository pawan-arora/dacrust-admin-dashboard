import {
  Box,
  Typography,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Card,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#10b981", // emerald
  "#8b5cf6", // violet
  "#ef4444", // red
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
  "#ec4899", // pink
  "#6366f1", // indigo
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Paper
        elevation={4}
        sx={{
          p: 1.5,
          borderRadius: 2,
          border: "1px solid #e2e8f0",
          boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
          {data.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {data.quantity} units • {data.percentage}%
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#2563eb", fontWeight: 700, mt: 0.5 }}
        >
          ${data.revenue.toFixed(2)}
        </Typography>
      </Paper>
    );
  }
  return null;
};

export default function MenuPerformanceTab({ topProducts, limit, setLimit }) {
  const pieData = topProducts.slice(0, limit).map((item) => {
    const totalUnits = topProducts
      .slice(0, limit)
      .reduce((sum, p) => sum + p.quantity, 0);

    return {
      name: item.name,
      quantity: item.quantity,
      revenue: item.revenue,
      percentage:
        totalUnits > 0
          ? ((item.quantity / totalUnits) * 100).toFixed(1)
          : 0,
    };
  });

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        mb={4}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.5px",
            }}
          >
            Menu Velocity Distribution
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Top selling items by units sold and revenue
          </Typography>
        </Box>

        <Box display="flex" gap={1} alignItems="center">
          <Typography
            variant="body2"
            sx={{ color: "#64748b", mr: 1, fontWeight: 500 }}
          >
            Showing top:
          </Typography>
          {[2, 5, 10].map((num) => (
            <Button
              key={num}
              size="small"
              variant={limit === num ? "contained" : "outlined"}
              onClick={() => setLimit(num)}
              sx={{
                minWidth: 42,
                height: 34,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: "none",
                boxShadow: limit === num ? "0 4px 12px rgba(245, 158, 11, 0.3)" : "none",
              }}
            >
              {num}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Main Content - Flex Layout */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          width: "100%",
        }}
      >
        {/* ====================== TABLE ====================== */}
        <Box sx={{ flex: 1.4, minWidth: 0 }}>
          <Paper
            elevation={0}
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 4px 20px -2px rgb(0 0 0 / 0.05)",
              height: "100%",
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "#64748b",
                        py: 2,
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Item Name
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        color: "#64748b",
                        py: 2,
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Units Sold
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        color: "#64748b",
                        py: 2,
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Gross Revenue
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProducts.slice(0, limit).length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        align="center"
                        sx={{ py: 8, color: "#94a3b8" }}
                      >
                        No data available for this period
                      </TableCell>
                    </TableRow>
                  ) : (
                    topProducts.slice(0, limit).map((product, idx) => (
                      <TableRow
                        key={idx}
                        hover
                        sx={{
                          "&:last-child td": { borderBottom: 0 },
                          transition: "background-color 0.15s",
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500, py: 2.2 }}>
                          {product.name}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2.2 }}>
                          {product.quantity}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color: "#2563eb",
                            fontWeight: 700,
                            py: 2.2,
                          }}
                        >
                          ${product.revenue.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        {/* ====================== PIE CHART ====================== */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: 3,
              height: "100%",
              minHeight: 420,
              p: 3,
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 20px -2px rgb(0 0 0 / 0.05)",
              background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: "#0f172a",
                mb: 1,
              }}
            >
              Units Sold Share
            </Typography>

            <Box
              sx={{
                flexGrow: 1,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={75}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="quantity"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        style={{
                          filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.1))",
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    iconSize={10}
                    wrapperStyle={{
                      fontSize: "12.5px",
                      paddingTop: "12px",
                      fontWeight: 500,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}