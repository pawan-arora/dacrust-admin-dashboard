import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../firebase";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Switch,
  CircularProgress,
  Alert,
  Stack,
  Card,
  CardContent,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import UploadIcon from "@mui/icons-material/CloudUpload";
import StoreIcon from "@mui/icons-material/Store";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import FacebookIcon from "@mui/icons-material/Facebook";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_LABELS = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export default function RestaurantSettingsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [docId, setDocId] = useState(null);

  // Form state
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [logo, setLogo] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [openingHours, setOpeningHours] = useState({});

  // Load current restaurant data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const restRef = collection(db, "restaurant");
        const snap = await getDocs(restRef);

        if (!snap.empty) {
          const docSnap = snap.docs[0];
          const data = docSnap.data();
          setDocId(docSnap.id);

          setName(data.name || "");
          setAbout(data.about || "");
          setLogo(data.logo || "");
          setFacebookUrl(data.facebookUrl || "");
          setPhone(data.contact?.phone || "");
          setEmail(data.contact?.email || "");
          setStreet(data.address?.street || "");
          setCity(data.address?.city || "");
          setPostalCode(data.address?.postalCode || "");
          setCountry(data.address?.country || "New Zealand");

          // Opening hours (keep the DB typo "openingHourse")
          const hours = data.openingHourse || {};
          const normalized = {};
          DAYS.forEach((day) => {
            if (hours[day]) {
              normalized[day] = {
                open: hours[day].open || "16:00",
                close: hours[day].close || "20:00",
                isOpen: true,
              };
            } else {
              normalized[day] = {
                open: "16:00",
                close: "20:00",
                isOpen: false,
              };
            }
          });
          setOpeningHours(normalized);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load restaurant data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleHourChange = (day, field, value) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleLogoUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file || !docId) return;

  setUploadingLogo(true);
  setErrorMsg("");
  setSuccessMsg("");

  try {
    const storage = getStorage();
    const storageRef = ref(storage, `others/logo_${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    // Update React state
    setLogo(downloadURL);

    // Also update Firestore immediately
    await updateDoc(doc(db, "restaurant", docId), {
      logo: downloadURL,
    });

    setSuccessMsg("Logo updated successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  } catch (err) {
    console.error(err);
    setErrorMsg("Failed to upload logo. Please try again.");
  } finally {
    setUploadingLogo(false);
  }
};

  const handleSave = async () => {
    if (!docId) return;

    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      // Build openingHourse object (only include open days)
      const openingHourse = {};
      DAYS.forEach((day) => {
        if (openingHours[day]?.isOpen) {
          openingHourse[day] = {
            open: openingHours[day].open,
            close: openingHours[day].close,
          };
        }
      });

      await updateDoc(doc(db, "restaurant", docId), {
        name: name.trim(),
        about: about.trim(),
        logo,
        facebookUrl: facebookUrl.trim(),
        contact: {
          phone: phone.trim(),
          email: email.trim(),
        },
        address: {
          street: street.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
        },
        openingHourse, // keep the existing field name (typo)
      });

      setSuccessMsg("Restaurant settings updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={400}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      {/* Header */}
      <Box mb={4}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}
        >
          Restaurant Settings
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
          Update your restaurant profile, contact details and opening hours
        </Typography>
      </Box>

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {successMsg}
        </Alert>
      )}
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* ========== BASIC INFO + LOGO ========== */}
        <Card
          elevation={0}
          sx={{ border: "1px solid #e2e8f0", borderRadius: 3 }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={3}>
              <StoreIcon sx={{ color: "#f59e0b" }} />
              <Typography variant="h6" fontWeight={700}>
                Basic Information
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 4,
              }}
            >
              {/* Logo */}
              <Box sx={{ textAlign: "center", minWidth: 180 }}>
                <Avatar
                  src={logo}
                  sx={{
                    width: 120,
                    height: 120,
                    mx: "auto",
                    mb: 2,
                    border: "3px solid #e2e8f0",
                  }}
                />
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={
                    uploadingLogo ? (
                      <CircularProgress size={16} />
                    ) : (
                      <UploadIcon />
                    )
                  }
                  disabled={uploadingLogo}
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  {uploadingLogo ? "Uploading..." : "Change Logo"}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </Button>
              </Box>

              {/* Name + About */}
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Restaurant Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={{ mb: 2.5 }}
                />
                <TextField
                  fullWidth
                  label="About / Description"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  multiline
                  rows={7}
                  helperText="This text appears on your public website"
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* ========== CONTACT & SOCIAL ========== */}
        <Card
          elevation={0}
          sx={{ border: "1px solid #e2e8f0", borderRadius: 3 }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={3}>
              <PhoneIcon sx={{ color: "#3b82f6" }} />
              <Typography variant="h6" fontWeight={700}>
                Contact & Social
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2.5,
              }}
            >
              <TextField
                fullWidth
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+64 22 358 5912"
                InputProps={{
                  startAdornment: (
                    <PhoneIcon sx={{ mr: 1, color: "#94a3b8" }} />
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <EmailIcon sx={{ mr: 1, color: "#94a3b8" }} />
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Facebook Page URL"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                sx={{ gridColumn: { md: "1 / -1" } }}
                InputProps={{
                  startAdornment: (
                    <FacebookIcon sx={{ mr: 1, color: "#94a3b8" }} />
                  ),
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* ========== ADDRESS ========== */}
        <Card
          elevation={0}
          sx={{ border: "1px solid #e2e8f0", borderRadius: 3 }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={3}>
              <LocationOnIcon sx={{ color: "#10b981" }} />
              <Typography variant="h6" fontWeight={700}>
                Address
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr" },
                gap: 2.5,
              }}
            >
              <TextField
                fullWidth
                label="Street Address"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
              <TextField
                fullWidth
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <TextField
                fullWidth
                label="Postal Code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
              <TextField
                fullWidth
                label="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                sx={{ gridColumn: { md: "1 / -1" } }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* ========== OPENING HOURS ========== */}
        <Card
          elevation={0}
          sx={{ border: "1px solid #e2e8f0", borderRadius: 3 }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <AccessTimeIcon sx={{ color: "#8b5cf6" }} />
              <Typography variant="h6" fontWeight={700}>
                Opening Hours
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Toggle a day off if the restaurant is closed. Times use 24-hour
              format.
            </Typography>

            <Stack spacing={1.5}>
              {DAYS.map((day) => {
                const dayData = openingHours[day] || {
                  isOpen: false,
                  open: "16:00",
                  close: "20:00",
                };

                return (
                  <Paper
                    key={day}
                    variant="outlined"
                    sx={{
                      px: 2.5,
                      py: 1.8,
                      borderRadius: 2.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      bgcolor: dayData.isOpen ? "#ffffff" : "#f8fafc",
                      borderColor: dayData.isOpen ? "#e2e8f0" : "#e2e8f0",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {/* Left side - Day + Switch */}
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1.5}
                      minWidth={160}
                    >
                      <Switch
                        checked={dayData.isOpen}
                        onChange={(e) =>
                          handleHourChange(day, "isOpen", e.target.checked)
                        }
                        color="primary"
                        size="medium"
                      />
                      <Typography
                        fontWeight={600}
                        sx={{
                          color: dayData.isOpen ? "#0f172a" : "#94a3b8",
                          minWidth: 90,
                        }}
                      >
                        {DAY_LABELS[day]}
                      </Typography>
                    </Box>

                    {/* Right side - Times or Closed */}
                    {dayData.isOpen ? (
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <TextField
                          type="time"
                          size="small"
                          value={dayData.open}
                          onChange={(e) =>
                            handleHourChange(day, "open", e.target.value)
                          }
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            width: 130,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              bgcolor: "#f8fafc",
                            },
                          }}
                        />
                        <Typography
                          sx={{
                            color: "#94a3b8",
                            fontWeight: 500,
                            px: 0.5,
                          }}
                        >
                          –
                        </Typography>
                        <TextField
                          type="time"
                          size="small"
                          value={dayData.close}
                          onChange={(e) =>
                            handleHourChange(day, "close", e.target.value)
                          }
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            width: 130,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              bgcolor: "#f8fafc",
                            },
                          }}
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          px: 2,
                          py: 0.6,
                          borderRadius: 2,
                          bgcolor: "#f1f5f9",
                          color: "#64748b",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          fontStyle: "italic",
                        }}
                      >
                        Closed
                      </Box>
                    )}
                  </Paper>
                );
              })}
            </Stack>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Box display="flex" justifyContent="flex-end" pt={1}>
          <Button
            variant="contained"
            size="large"
            startIcon={
              saving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            onClick={handleSave}
            disabled={saving}
            sx={{
              px: 4,
              py: 1.4,
              borderRadius: 2,
              fontWeight: 700,
              textTransform: "none",
              fontSize: "1rem",
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
