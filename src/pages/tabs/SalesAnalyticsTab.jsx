import { useState } from "react";
import {
  Grid,
  Card,
  Typography,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Avatar,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BarChartIcon from "@mui/icons-material/BarChart";
import TimelineIcon from "@mui/icons-material/Timeline";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import DownloadIcon from "@mui/icons-material/Download";

// Custom styling for the chart tooltip to make it look premium
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={3}
        sx={{ p: 2, borderRadius: 2, border: "1px solid #e2e8f0" }}
      >
        <Typography variant="subtitle2" sx={{ color: "#64748b", mb: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ color: "#0f172a", fontWeight: "bold" }}>
          ${payload[0].value.toFixed(2)}
        </Typography>
      </Paper>
    );
  }
  return null;
};

export default function SalesAnalyticsTab({
  totalSales,
  chartData,
  premiumCustomers,
}) {
  const [chartType, setChartType] = useState("area");
  const [leaderboardLimit, setLeaderboardLimit] = useState(5); // Default to Top 5

  // Slices the array based on the user's dropdown selection
  const visibleCustomers =
    leaderboardLimit === "all"
      ? premiumCustomers
      : premiumCustomers.slice(0, leaderboardLimit);

  // Trigger browser print, which allows the user to Save as PDF
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <Box
      className="analytics-container"
      sx={{ textAlign: "left", width: "100%", flexGrow: 1 }}
    >
      {/* ========================================== */}
      {/* TAB ACTION HEADER                          */}
      {/* ========================================== */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "800",
              color: "#0f172a",
              letterSpacing: "-0.5px",
            }}
          >
            Revenue & Performance
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Detailed breakdown of sales and top customer metrics.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={handleExportPDF}
          sx={{
            borderRadius: 2,
            fontWeight: "bold",
            textTransform: "none",
            borderWidth: "2px",
            "&:hover": { borderWidth: "2px" },
          }}
          // The 'no-print' class ensures the button itself doesn't show up in the PDF!
          className="no-print"
        >
          Export Report
        </Button>
      </Box>

      <Grid container spacing={4} sx={{ width: "100%" }}>
        {/* ========================================== */}
        {/* TOP ROW: METRICS & CHART                   */}
        {/* ========================================== */}

        {/* Total Income Card */}
        {/* TOP ROW: Gross Revenue + Revenue Timeline */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            width: "100%",
            mb: 4,
          }}
        >
          {/* Gross Revenue Card */}
          <Box sx={{ flex: { xs: "1 1 100%", md: "0 0 280px" } }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                minHeight: "280px",
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                p: 4,
                background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: -20,
                  right: -20,
                  width: 140,
                  height: 140,
                  borderRadius: "50%",
                  bgcolor: "#f1f5f9",
                  zIndex: 0,
                }}
              />

              <Box sx={{ position: "relative", zIndex: 1 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <Avatar
                    sx={{
                      bgcolor: "#dcfce7",
                      color: "#15803d",
                      width: 56,
                      height: 56,
                    }}
                  >
                    <TrendingUpIcon fontSize="medium" />
                  </Avatar>
                  <Typography
                    variant="h6"
                    sx={{ color: "#64748b", fontWeight: "700" }}
                  >
                    Gross Revenue
                  </Typography>
                </Box>

                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: "900",
                    color: "#0f172a",
                    letterSpacing: "-2px",
                    fontSize: "3.5rem",
                  }}
                >
                  ${totalSales.toFixed(2)}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#10b981",
                    fontWeight: "bold",
                    mt: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  Based on active reporting period
                </Typography>
              </Box>
            </Card>
          </Box>

          {/* Revenue Timeline Chart */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                height: "380px",
                p: 3,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 900, color: "#0f172a" }}
                >
                  Revenue Timeline
                </Typography>

                <ToggleButtonGroup
                  value={chartType}
                  exclusive
                  onChange={(e, newVal) => newVal && setChartType(newVal)}
                  size="small"
                  sx={{ height: 32 }}
                  className="no-print"
                >
                  <ToggleButton value="area" sx={{ px: 2 }}>
                    <TimelineIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="bar" sx={{ px: 2 }}>
                    <BarChartIcon fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Chart Container - Clean & Reliable */}
              <Box sx={{ flexGrow: 1, width: "100%", minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "area" ? (
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 25, left: 5, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorSales"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#2563eb"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#2563eb"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        tickFormatter={(v) => `$${v}`}
                      />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="Sales"
                        stroke="#2563eb"
                        strokeWidth={3}
                        fill="url(#colorSales)"
                      />
                    </AreaChart>
                  ) : (
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 25, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        tickFormatter={(v) => `$${v}`}
                      />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="Sales"
                        fill="#2563eb"
                        radius={[4, 4, 0, 0]}
                        barSize={45}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </Box>
            </Card>
          </Box>
        </Box>
        {/* ========================================== */}
        {/* BOTTOM ROW: PREMIUM SPENDERS LEADERBOARD   */}
        {/* ========================================== */}

        <Grid item xs={12}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-end"
            mb={2.5}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <WorkspacePremiumIcon
                sx={{ color: "#f59e0b", fontSize: "1.8rem" }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: "#0f172a",
                  letterSpacing: "-0.5px",
                }}
              >
                Customer Leaderboard
              </Typography>
            </Box>

            <FormControl
              size="small"
              sx={{ minWidth: 150 }}
              className="no-print"
            >
              <Select
                value={leaderboardLimit}
                onChange={(e) => setLeaderboardLimit(e.target.value)}
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e2e8f0",
                  },
                }}
              >
                <MenuItem value={5}>Top 5 Customers</MenuItem>
                <MenuItem value={10}>Top 10 Customers</MenuItem>
                <MenuItem value={50}>Top 50 Customers</MenuItem>
                <MenuItem value="all">View All</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Paper
            elevation={0}
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <TableContainer sx={{ maxHeight: 520 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        bgcolor: "#f8fafc",
                        fontWeight: 700,
                        color: "#64748b",
                        width: 70,
                        py: 1.8,
                      }}
                    >
                      Rank
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: "#f8fafc",
                        fontWeight: 700,
                        color: "#64748b",
                        py: 1.8,
                      }}
                    >
                      Customer
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: "#f8fafc",
                        fontWeight: 700,
                        color: "#64748b",
                        py: 1.8,
                      }}
                    >
                      Email
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        bgcolor: "#f8fafc",
                        fontWeight: 700,
                        color: "#64748b",
                        py: 1.8,
                      }}
                    >
                      Orders
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: "#f8fafc",
                        fontWeight: 700,
                        color: "#64748b",
                        py: 1.8,
                      }}
                    >
                      Avg. Order
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: "#f8fafc",
                        fontWeight: 700,
                        color: "#64748b",
                        py: 1.8,
                      }}
                    >
                      Lifetime Value
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {visibleCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={{ py: 8, color: "#94a3b8" }}
                      >
                        No customer data found for this period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleCustomers.map((cust, idx) => {
                      const rank = idx + 1;
                      const avgOrder =
                        cust.orderCount > 0
                          ? cust.totalSpent / cust.orderCount
                          : 0;

                      const getRankStyle = (rank) => {
                        if (rank === 1)
                          return { bgcolor: "#fbbf24", color: "#fff" };
                        if (rank === 2)
                          return { bgcolor: "#94a3b8", color: "#fff" };
                        if (rank === 3)
                          return { bgcolor: "#d97706", color: "#fff" };
                        return { bgcolor: "#f1f5f9", color: "#64748b" };
                      };

                      return (
                        <TableRow
                          key={cust.email}
                          hover
                          sx={{
                            "&:last-child td": { borderBottom: 0 },
                            transition: "background-color 0.15s",
                          }}
                        >
                          {/* Rank */}
                          <TableCell sx={{ py: 2 }}>
                            <Box
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: "0.85rem",
                                ...getRankStyle(rank),
                              }}
                            >
                              {rank}
                            </Box>
                          </TableCell>

                          {/* Customer Name + Avatar */}
                          <TableCell sx={{ py: 2 }}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <Avatar
                                sx={{
                                  width: 34,
                                  height: 34,
                                  bgcolor: "#e2e8f0",
                                  color: "#334155",
                                  fontWeight: 700,
                                  fontSize: "0.9rem",
                                }}
                              >
                                {cust.name?.charAt(0)?.toUpperCase() || "?"}
                              </Avatar>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, color: "#0f172a" }}
                              >
                                {cust.name || "Unknown"}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Email */}
                          <TableCell
                            sx={{
                              py: 2,
                              color: "#64748b",
                              fontSize: "0.875rem",
                            }}
                          >
                            {cust.email}
                          </TableCell>

                          {/* Total Orders */}
                          <TableCell align="center" sx={{ py: 2 }}>
                            <Chip
                              label={cust.orderCount}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                bgcolor: "#f1f5f9",
                                color: "#334155",
                                borderRadius: 1.5,
                                minWidth: 40,
                              }}
                            />
                          </TableCell>

                          {/* Average Order Value */}
                          <TableCell
                            align="right"
                            sx={{ py: 2, color: "#64748b", fontWeight: 500 }}
                          >
                            ${avgOrder.toFixed(2)}
                          </TableCell>

                          {/* Lifetime Value */}
                          <TableCell
                            align="right"
                            sx={{
                              py: 2,
                              color: "#059669",
                              fontWeight: 800,
                              fontSize: "1rem",
                            }}
                          >
                            ${cust.totalSpent.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* 🌟 Add a global print stylesheet to hide non-essential elements when exporting to PDF */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .analytics-container, .analytics-container * {
              visibility: visible;
            }
            .analytics-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
    </Box>
  );
}
