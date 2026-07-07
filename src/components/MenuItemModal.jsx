import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  InputAdornment,
  Paper,
  FormControlLabel,
  Switch,
  Typography,
  Button,
  Avatar,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export default function MenuItemModal({
  open,
  onClose,
  onSave,
  formData,
  setFormData,
  editingItem,
  uploadingImage,
  imageFile,
  handleImageChange,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 1 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, color: "#0f172a" }}>
        {editingItem ? "Edit Menu Item" : "Add New Item"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
          <TextField
            label="Item Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            InputProps={{ sx: { borderRadius: 2 } }}
          />

          <TextField
            label="Base Price"
            type="number"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
              sx: { borderRadius: 2 },
            }}
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            helperText="Leave blank if pricing is size-based (e.g. Pizza)"
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            InputProps={{ sx: { borderRadius: 2 } }}
          />

          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              bgcolor: "#f8fafc",
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isAvailable}
                  onChange={(e) =>
                    setFormData({ ...formData, isAvailable: e.target.checked })
                  }
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" fontWeight="bold" color="#0f172a">
                  Item Available for Ordering
                </Typography>
              }
            />
          </Paper>

          {/* Image Upload Area */}
          <Box
            sx={{
              border: "2px dashed #cbd5e1",
              borderRadius: 3,
              p: 4,
              textAlign: "center",
              bgcolor: "#f8fafc",
              transition: "all 0.2s",
              "&:hover": { borderColor: "#94a3b8", bgcolor: "#f1f5f9" },
            }}
          >
            <input
              accept="image/jpeg, image/png"
              style={{ display: "none" }}
              id="raised-button-file"
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="raised-button-file">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: "bold",
                  color: "#0f172a",
                  borderColor: "#cbd5e1",
                }}
              >
                Upload Image
              </Button>
            </label>
            {imageFile && (
              <Typography
                variant="caption"
                display="block"
                mt={2}
                fontWeight="bold"
                color="#10b981"
              >
                {imageFile.name} selected
              </Typography>
            )}
            {!imageFile && formData.imagePath && (
              <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                <Avatar
                  src={formData.imagePath}
                  variant="rounded"
                  sx={{ width: 80, height: 80, borderRadius: 2, boxShadow: 1 }}
                />
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          sx={{ color: "#64748b", fontWeight: "bold", textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          disabled={uploadingImage}
          sx={{
            borderRadius: 2,
            fontWeight: "bold",
            textTransform: "none",
            boxShadow: "none",
            px: 4,
          }}
        >
          {uploadingImage ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}