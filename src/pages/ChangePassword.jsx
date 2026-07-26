import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill both fields");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;

      if (!user) {
        setError("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      // 1. Update password in Firebase Auth
      await updatePassword(user, newPassword);

      // 2. Mark that password has been changed
      await updateDoc(doc(db, "admin", user.uid), {
        mustChangePassword: false,
      });

      localStorage.setItem("isLoggedIn", "true");
      navigate("/");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/requires-recent-login") {
        setError("Please login again before changing password");
        navigate("/login");
      } else {
        setError("Failed to update password. Please try again.");
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
        bgcolor: "#f8fafc",
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
        <LockResetIcon sx={{ fontSize: 48, color: "#ea580c", mb: 2 }} />

        <Typography variant="h5" fontWeight={800} gutterBottom>
          Change Password
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={4}>
          You must set a new password before continuing
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          sx={{ mb: 2.5 }}
          InputProps={{ sx: { borderRadius: 2 } }}
        />

        <TextField
          fullWidth
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{ mb: 4 }}
          InputProps={{ sx: { borderRadius: 2 } }}
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleChangePassword}
          disabled={loading}
          sx={{
            py: 1.5,
            borderRadius: 2,
            fontWeight: 700,
            textTransform: "none",
            bgcolor: "#ea580c",
            "&:hover": { bgcolor: "#c2410c" },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Update Password"
          )}
        </Button>
      </Paper>
    </Box>
  );
}