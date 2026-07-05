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
        <Grid item xs={12} md={3}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              minHeight: "280px", // Slightly taller for a more premium feel
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
        </Grid>

        {/* Revenue Flow Chart */}
        <Grid item xs={12} md={9} sx={{ display: "flex", flexDirection: "column" }}>
          {" "}
          {/* or md={8} depending on your preference */}
          <Card
            elevation={0}
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: 3,
              height: "380px", // Card has fixed height
              p: 3,
              display: "flex",
              flexDirection: "column",
              width: "100%",
              flexGrow: 1, // Allows the card to grow and fill available space
              overflow: "hidden", // Prevents overflow issues in flex containers
            }}
          >
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

            {/* The Parent Container: Must be position: "relative" */}
            <Box
              sx={{ position: "relative", width: "100%", flexGrow: 1, mt: 1 }}
            >
              {/* 🌟 THE FIX: Absolute positioning forces exact pixel boundaries for Recharts */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "area" ? (
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                        dy={10}
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
                        fillOpacity={1}
                        fill="url(#colorSales)"
                      />
                    </AreaChart>
                  ) : (
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                        dy={10}
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
                        barSize={40}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </Box>
            </Box>
          </Card>
        </Grid>
        {/* ========================================== */}
        {/* BOTTOM ROW: PREMIUM SPENDERS LEADERBOARD   */}
        {/* ========================================== */}

        <Grid item xs={12}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-end"
            mb={2}
            pl={1}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <WorkspacePremiumIcon
                sx={{ color: "#f59e0b", fontSize: "1.8rem" }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "800",
                  color: "#0f172a",
                  letterSpacing: "-0.5px",
                }}
              >
                Customer Leaderboard
              </Typography>
            </Box>

            {/* 🌟 NEW: Dynamic User Select Control */}
            <FormControl
              size="small"
              sx={{ minWidth: 140 }}
              className="no-print"
            >
              <Select
                value={leaderboardLimit}
                onChange={(e) => setLeaderboardLimit(e.target.value)}
                displayEmpty
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                  fontWeight: "bold",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e2e8f0",
                  },
                }}
              >
                <MenuItem value={5}>Top 5 Users</MenuItem>
                <MenuItem value={10}>Top 10 Users</MenuItem>
                <MenuItem value={50}>Top 50 Users</MenuItem>
                <MenuItem value="all">View All Users</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Paper
            elevation={0}
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: 3,
              overflow: "hidden",
              width: "100%",
            }}
          >
            {/* 🌟 ENLARGED: Increased maxHeight so the table visually fills the bottom of the screen */}
            <TableContainer sx={{ maxHeight: 600, overflowY: "auto" }}>
              <Table stickyHeader sx={{ width: "100%", minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        bgcolor: "#f8fafc",
                        fontWeight: "bold",
                        color: "#64748b",
                        width: "80px",
                        py: 2,
                      }}
                    >
                      Rank
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: "#f8fafc",
                        fontWeight: "bold",
                        color: "#64748b",
                        py: 2,
                      }}
                    >
                      Customer Name
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: "#f8fafc",
                        fontWeight: "bold",
                        color: "#64748b",
                        py: 2,
                      }}
                    >
                      Email Contact
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: "#f8fafc",
                        fontWeight: "bold",
                        color: "#64748b",
                        py: 2,
                      }}
                    >
                      Total Visits
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: "#f8fafc",
                        fontWeight: "bold",
                        color: "#64748b",
                        py: 2,
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
                        colSpan={5}
                        align="center"
                        sx={{ py: 8, color: "#94a3b8" }}
                      >
                        No customer data found for this period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleCustomers.map((cust, idx) => {
                      const isTopThree = idx < 3;
                      const rankColors = ["#fbbf24", "#94a3b8", "#b45309"];

                      return (
                        <TableRow
                          key={cust.email}
                          hover
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell sx={{ py: 2.5 }}>
                            {isTopThree ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  bgcolor: rankColors[idx],
                                  color: "white",
                                  fontWeight: "bold",
                                  fontSize: "0.9rem",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                }}
                              >
                                {idx + 1}
                              </Box>
                            ) : (
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: "bold",
                                  color: "#94a3b8",
                                  ml: 1.5,
                                }}
                              >
                                #{idx + 1}
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar
                                sx={{
                                  width: 36,
                                  height: 36,
                                  bgcolor: "#f1f5f9",
                                  color: "#475569",
                                  fontWeight: "bold",
                                }}
                              >
                                {cust.name.charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: "700", color: "#1e293b" }}
                              >
                                {cust.name}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell sx={{ color: "#64748b" }}>
                            {cust.email}
                          </TableCell>

                          <TableCell align="right">
                            <Chip
                              label={`${cust.orderCount} Orders`}
                              sx={{
                                bgcolor: "#f8fafc",
                                color: "#475569",
                                fontWeight: "bold",
                                borderRadius: 1.5,
                                border: "1px solid #e2e8f0",
                              }}
                            />
                          </TableCell>

                          <TableCell
                            align="right"
                            sx={{
                              color: "#10b981",
                              fontWeight: "900",
                              fontSize: "1.1rem",
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
