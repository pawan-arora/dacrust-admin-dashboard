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
  Chip,
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
  selectedCategory,
}) {
  const isAvailable = formData.isAvailable;

  // Auto-disable Base Price for size-based categories (Pizza, etc.)
  const sizeBasedCategories = ["pizza"];
  const isSizeBasedCategory = sizeBasedCategories.includes(
    selectedCategory?.toLowerCase()
  );
  const disableBasePrice =
    isSizeBasedCategory || (formData.sizes && formData.sizes.length > 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
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

          {/* Base Price - Auto disabled for Pizza / size-based items */}
          <TextField
            label="Base Price"
            type="number"
            fullWidth
            disabled={disableBasePrice}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              sx: { borderRadius: 2 },
            }}
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            helperText={
              disableBasePrice
                ? "This item uses size-based pricing (Small / Medium / Large)"
                : "Leave blank for size-based items (e.g. Pizza)"
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: disableBasePrice ? "#f8fafc" : "inherit",
              },
            }}
          />

          {/* Discount Section */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <TextField
              label="Original Price (if discounted)"
              type="number"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                sx: { borderRadius: 2 },
              }}
              value={formData.originalPrice}
              onChange={(e) =>
                setFormData({ ...formData, originalPrice: e.target.value })
              }
              disabled={!formData.isDiscounted}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isDiscounted}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isDiscounted: e.target.checked,
                      ...(!e.target.checked && { originalPrice: "" }),
                    })
                  }
                  color="primary"
                />
              }
              label="Discounted?"
              sx={{ mt: 1, whiteSpace: "nowrap" }}
            />
          </Box>

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

          {/* Availability Section */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: "1px solid",
              borderColor: isAvailable ? "#86efac" : "#fda4af",
              bgcolor: isAvailable ? "#f0fdf4" : "#fef2f2",
              transition: "all 0.2s ease-in-out",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="body2" fontWeight="bold" color="#0f172a">
                Availability Status
              </Typography>

              <Chip
                label={isAvailable ? "Available" : "Unavailable"}
                size="small"
                color={isAvailable ? "success" : "error"}
                sx={{
                  fontWeight: 700,
                  height: 24,
                  fontSize: "0.75rem",
                }}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={isAvailable}
                  onChange={(e) =>
                    setFormData({ ...formData, isAvailable: e.target.checked })
                  }
                  color={isAvailable ? "success" : "error"}
                />
              }
              label={
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color={isAvailable ? "#166534" : "#9f1239"}
                >
                  {isAvailable
                    ? "Item is available for ordering"
                    : "Item is currently unavailable"}
                </Typography>
              }
            />
          </Paper>

          {/* ✅ Improved Image Upload Section */}
<Box
  sx={{
    border: "2px dashed #cbd5e1",
    borderRadius: 3,
    p: 3,
    textAlign: "center",
    bgcolor: "#f8fafc",
    transition: "all 0.2s",
    "&:hover": { borderColor: "#94a3b8", bgcolor: "#f1f5f9" },
  }}
>
  <input
    accept="image/*"
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
      disabled={uploadingImage}
      sx={{
        borderRadius: 2,
        textTransform: "none",
        fontWeight: "bold",
        color: "#0f172a",
        borderColor: "#cbd5e1",
      }}
    >
      {uploadingImage ? "Uploading..." : "Upload Image"}
    </Button>
  </label>

  {/* Show newly selected image preview */}
  {imageFile && (
    <Box sx={{ mt: 2.5 }}>
      <Avatar
        src={URL.createObjectURL(imageFile)}
        variant="rounded"
        sx={{
          width: 100,
          height: 100,
          mx: "auto",
          borderRadius: 2,
          boxShadow: 2,
          border: "2px solid #e2e8f0",
        }}
      />
      <Typography
        variant="caption"
        display="block"
        mt={1.5}
        fontWeight="bold"
        color="#10b981"
      >
        {imageFile.name}
      </Typography>
    </Box>
  )}

  {/* Show existing image when editing (and no new file selected) */}
  {!imageFile && formData.imagePath && (
    <Box sx={{ mt: 2.5 }}>
      <Avatar
        src={formData.imagePath}
        variant="rounded"
        sx={{
          width: 100,
          height: 100,
          mx: "auto",
          borderRadius: 2,
          boxShadow: 2,
          border: "2px solid #e2e8f0",
        }}
      />
      <Typography
        variant="caption"
        display="block"
        mt={1.5}
        color="text.secondary"
      >
        Current image
      </Typography>
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