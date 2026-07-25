import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
  Container,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  AppBar,
  Toolbar,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import pizzaBg from "../assets/background_pizza.png";

import LiveOperationsTab from "./tabs/LiveOperationsTab";
import SalesAnalyticsTab from "./tabs/SalesAnalyticsTab";
import MenuPerformanceTab from "./tabs/MenuPerformanceTab";
import MenuManagementTab from "./tabs/MenuManagementTab";
import { getNZDateString } from "../utils/dateUtils";

export default function SalesDashboard() {
  const [activeTab, setActiveTab] = useState(0);

  const [restaurantInfo, setRestaurantInfo] = useState({
    name: "Loading...",
    logo: "",
  });
  const [adminUser] = useState("Pawan Arora");

  const [datePreset, setDatePreset] = useState("today");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [topItemsLimit, setTopItemsLimit] = useState(5);

  // Analytics data (based on createdAt + selected period)
  const [, setAllOrders] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [premiumCustomers, setPremiumCustomers] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live Kitchen data (based on scheduledTimeEpoch + selected period)
  const [livePendingOrders, setLivePendingOrders] = useState([]);
  const [liveCompletedOrders, setLiveCompletedOrders] = useState([]);

  const [scrollY, setScrollY] = useState(0);

  // 1. Fetch static restaurant info once
  useEffect(() => {
    const fetchRestInfo = async () => {
      const restRef = collection(db, "restaurant");
      const restSnap = await getDocs(restRef);
      if (!restSnap.empty) {
        const rData = restSnap.docs[0].data();
        setRestaurantInfo({
          name: rData.name || "Da Crust Pizzeria",
          logo: rData.logo || "",
        });
      }
    };
    fetchRestInfo();
  }, []);

  // ==========================================
  // ANALYTICS DATA (respects Reporting Period - based on createdAt)
  // ==========================================
  const fetchDashboardData = useCallback(() => {
    let start = new Date();
    let end = new Date();

    if (datePreset === "today") {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (datePreset === "yesterday") {
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
    } else if (datePreset === "7days") {
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (datePreset === "custom") {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }

    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("createdAt", ">=", start),
      where("createdAt", "<=", end),
    );

    return onSnapshot(q, (snapshot) => {
      const fetchedOrders = [];
      let sum = 0;
      const customerMap = {};
      const dailySalesMap = {};
      const productMap = {};

      snapshot.forEach((docSnapshot) => {
        const id = docSnapshot.id;
        const data = docSnapshot.data();
        fetchedOrders.push({ id, ...data });

        if (data.status === "PAID" || data.status === "COMPLETED") {
          const amount = data.totalAmount || 0;
          const dateStr = getNZDateString(data.scheduledTimeEpoch);

          if (dateStr === "Unknown") return;

          sum += amount;
          dailySalesMap[dateStr] = (dailySalesMap[dateStr] || 0) + amount;

          if (Array.isArray(data.items)) {
            data.items.forEach((item) => {
              const menuId = item.menuId || "unknown";
              if (!productMap[menuId]) {
                productMap[menuId] = {
                  name: item.name || "Unnamed Item",
                  quantity: 0,
                  revenue: 0,
                };
              }
              productMap[menuId].quantity += item.quantity || 0;
              productMap[menuId].revenue += item.totalPrice || 0;
            });
          }

          const email = data.customerEmail;
          if (email) {
            if (!customerMap[email]) {
              customerMap[email] = {
                name: data.customerName || "Walk-in",
                email: email,
                totalSpent: 0,
                orderCount: 0,
              };
            }
            customerMap[email].totalSpent += amount;
            customerMap[email].orderCount += 1;
          }
        }
      });

      setAllOrders(fetchedOrders);
      setTotalSales(sum);
      setChartData(
        Object.keys(dailySalesMap).map((date) => ({
          name: date,
          Sales: Number(dailySalesMap[date].toFixed(2)),
        })),
      );
      setTopProducts(
        Object.values(productMap).sort((a, b) => b.quantity - a.quantity),
      );
      setPremiumCustomers(
        Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent),
      );

      setLoading(false);
    });
  }, [datePreset, startDate, endDate]);

  // ==========================================
  // LIVE KITCHEN QUEUE (based on EXPECTED date + selected period)
  // ==========================================
  useEffect(() => {
    // Fetch a wider window so advance/past scheduled orders are available
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 45);
    fromDate.setHours(0, 0, 0, 0);

    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("createdAt", ">=", fromDate),
      orderBy("createdAt", "desc"),
      limit(500)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Calculate the selected period range
      let periodStart = new Date();
      let periodEnd = new Date();

      if (datePreset === "today") {
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setHours(23, 59, 59, 999);
      } else if (datePreset === "yesterday") {
        periodStart.setDate(periodStart.getDate() - 1);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setDate(periodEnd.getDate() - 1);
        periodEnd.setHours(23, 59, 59, 999);
      } else if (datePreset === "7days") {
        periodStart.setDate(periodStart.getDate() - 7);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setHours(23, 59, 59, 999);
      } else if (datePreset === "custom") {
        periodStart = new Date(startDate);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(endDate);
        periodEnd.setHours(23, 59, 59, 999);
      }

      const pending = [];
      const completed = [];

      snapshot.forEach((docSnapshot) => {
        const order = { id: docSnapshot.id, ...docSnapshot.data() };

        const scheduledEpoch = order.scheduledTimeEpoch;
        if (!scheduledEpoch) return;

        const scheduledDate = new Date(scheduledEpoch);

        // Only include orders whose EXPECTED date falls inside the selected period
        if (scheduledDate < periodStart || scheduledDate > periodEnd) return;

        if (order.status === "PAID") {
          pending.push(order);
        } else if (order.status === "COMPLETED") {
          completed.push(order);
        }
      });

      // Sort by expected time
      pending.sort((a, b) => (a.scheduledTimeEpoch || 0) - (b.scheduledTimeEpoch || 0));
      completed.sort((a, b) => (b.scheduledTimeEpoch || 0) - (a.scheduledTimeEpoch || 0));

      setLivePendingOrders(pending);
      setLiveCompletedOrders(completed);
    });

    return () => unsubscribe();
  }, [datePreset, startDate, endDate]);

  const handleMarkAsCompleted = async (orderId) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "COMPLETED",
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Analytics listener
  useEffect(() => {
    const unsubscribe = fetchDashboardData();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchDashboardData]);

  const headerOpacity = Math.max(1 - scrollY / 150, 0);
  const parallaxOffset = scrollY * 0.4;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6f8" }}>
      {/* --- SLIVER HEADER --- */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.85), rgba(17, 24, 39, 0.85)), url(${pizzaBg})`,
          backgroundSize: "cover",
          backgroundPosition: `center ${parallaxOffset}px`,
          pt: 2,
          pb: 4,
          overflow: "hidden",
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            opacity: headerOpacity,
            transform: `translateY(${scrollY * 0.2}px)`,
          }}
        >
          <Toolbar disableGutters>
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
                minWidth: 0,
              }}
            >
              {restaurantInfo.logo ? (
                <Avatar
                  src={restaurantInfo.logo}
                  sx={{ width: 56, height: 56, border: "2px solid white" }}
                />
              ) : (
                <CircularProgress size={24} color="inherit" />
              )}
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h5" fontWeight="bold" noWrap>
                  {restaurantInfo.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#9ca3af",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                >
                  Management Console
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexShrink: 0,
                ml: 2,
              }}
            >
              <Avatar sx={{ bgcolor: "#ea580c", width: 36, height: 36 }}>
                {adminUser.charAt(0)}
              </Avatar>
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <Typography variant="body2" fontWeight="bold" lineHeight={1}>
                  {adminUser}
                </Typography>
                <Typography variant="caption" color="#9ca3af">
                  Administrator
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="error"
                endIcon={<LogoutIcon />}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: "bold",
                }}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* --- PINNED TABS --- */}
      <AppBar
        position="sticky"
        color="default"
        elevation={scrollY > 50 ? 4 : 0}
        sx={{
          top: 0,
          zIndex: 1100,
          bgcolor: "white",
          transition: "box-shadow 0.3s ease-in-out",
        }}
      >
        <Container maxWidth="xl">
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              "& .MuiTab-root": {
                fontWeight: "bold",
                fontSize: "1rem",
                textTransform: "none",
                py: 2.5,
              },
            }}
          >
            <Tab label={`Live Operations (${livePendingOrders.length})`} />
            <Tab label="Sales Analytics" />
            <Tab label="Menu Performance" />
            <Tab label="Menu Management" />
          </Tabs>
        </Container>
      </AppBar>

      {/* --- CONTENT AREA --- */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 10 }}>
        {/* Reporting Period - visible on Live Operations + Analytics */}
        {activeTab !== 3 && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 4,
              borderRadius: 2,
              border: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <CalendarMonthIcon sx={{ color: "#64748b" }} />
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", color: "#1e293b" }}
              >
                Reporting Period
              </Typography>
            </Box>

            <Box display="flex" gap={2} alignItems="center">
              <ToggleButtonGroup
                color="primary"
                value={datePreset}
                exclusive
                onChange={(e, newPreset) => {
                  setLoading(true);
                  if (newPreset !== null) setDatePreset(newPreset);
                }}
                size="small"
                sx={{ bgcolor: "white" }}
              >
                <ToggleButton
                  value="today"
                  sx={{ fontWeight: "bold", px: 3, textTransform: "none" }}
                >
                  Today
                </ToggleButton>
                <ToggleButton
                  value="yesterday"
                  sx={{ fontWeight: "bold", px: 3, textTransform: "none" }}
                >
                  Yesterday
                </ToggleButton>
                <ToggleButton
                  value="7days"
                  sx={{ fontWeight: "bold", px: 3, textTransform: "none" }}
                >
                  Last 7 Days
                </ToggleButton>
                <ToggleButton
                  value="custom"
                  sx={{ fontWeight: "bold", px: 3, textTransform: "none" }}
                >
                  Custom Range
                </ToggleButton>
              </ToggleButtonGroup>

              {datePreset === "custom" && (
                <Box display="flex" gap={1}>
                  <TextField
                    type="date"
                    size="small"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    sx={{ bgcolor: "white", width: 140 }}
                  />
                  <TextField
                    type="date"
                    size="small"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    sx={{ bgcolor: "white", width: 140 }}
                  />
                </Box>
              )}
            </Box>
          </Paper>
        )}

        {loading && activeTab !== 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="300px"
          >
            <CircularProgress size={50} thickness={4} />
          </Box>
        ) : (
          <Box>
            {activeTab === 0 && (
              <LiveOperationsTab
                pendingOrders={livePendingOrders}
                completedOrders={liveCompletedOrders}
                onMarkComplete={handleMarkAsCompleted}
              />
            )}
            {activeTab === 1 && (
              <SalesAnalyticsTab
                totalSales={totalSales}
                chartData={chartData}
                premiumCustomers={premiumCustomers}
              />
            )}
            {activeTab === 2 && (
              <MenuPerformanceTab
                topProducts={topProducts}
                limit={topItemsLimit}
                setLimit={setTopItemsLimit}
              />
            )}
            {activeTab === 3 && <MenuManagementTab />}
          </Box>
        )}
      </Container>
    </Box>
  );
}