import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  CircularProgress,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import pizzaBg from "../assets/background_pizza.png"; // optional

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);

    // Temporary fake login (no real authentication yet)
    setTimeout(() => {
      localStorage.setItem("isLoggedIn", "true");
      setLoading(false);
      navigate("/"); // Redirect to dashboard
    }, 800);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url(${pizzaBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 5,
          borderRadius: 4,
          textAlign: "center",
          border: "1px solid #e2e8f0",
        }}
      >
        <Avatar
          sx={{
            bgcolor: "#ea580c",
            width: 64,
            height: 64,
            mx: "auto",
            mb: 2,
          }}
        >
          <LockOutlinedIcon fontSize="large" />
        </Avatar>

        <Typography variant="h5" fontWeight={800} gutterBottom>
          Admin Login
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={4}>
          Da Crust Management Console
        </Typography>

        <TextField
          fullWidth
          label="Email"
          defaultValue="admin@dacrust.co.nz"
          sx={{ mb: 2.5 }}
          InputProps={{ sx: { borderRadius: 2 } }}
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          defaultValue="password"
          sx={{ mb: 4 }}
          InputProps={{ sx: { borderRadius: 2 } }}
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleLogin}
          disabled={loading}
          sx={{
            py: 1.5,
            borderRadius: 2,
            fontWeight: 700,
            textTransform: "none",
            fontSize: "1rem",
            bgcolor: "#ea580c",
            "&:hover": { bgcolor: "#c2410c" },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Login"
          )}
        </Button>
      </Paper>
    </Box>
  );
}