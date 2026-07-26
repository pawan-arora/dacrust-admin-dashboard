import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import pizzaBg from "../assets/background_pizza.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Login with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Check if user must change password
      const adminDoc = await getDoc(doc(db, "admin", user.uid));

      if (adminDoc.exists() && adminDoc.data().mustChangePassword === true) {
        // Force password change
        navigate("/change-password");
      } else {
        // Normal login
        localStorage.setItem("isLoggedIn", "true");
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        setError("Invalid email or password");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
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

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2.5 }}
          InputProps={{ sx: { borderRadius: 2 } }}
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 4 }}
          InputProps={{ sx: { borderRadius: 2 } }}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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
          {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
        </Button>
      </Paper>
    </Box>
  );
}