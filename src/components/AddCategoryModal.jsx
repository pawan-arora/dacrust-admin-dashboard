import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";

export default function AddCategoryModal({
  open,
  onClose,
  onSave,
  categoryName,
  setCategoryName,
  isActive,
  setIsActive,
  saving,
  isEditing,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 800, color: "#0f172a" }}>
        {isEditing ? "Edit Category" : "Add New Category"}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            autoFocus
            fullWidth
            label="Category Name"
            placeholder="e.g. Pizza, Burgers, Drinks"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSave()}
            InputProps={{ sx: { borderRadius: 2 } }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography fontWeight={600}>
                {isActive ? "Category is Active" : "Category is Inactive"}
              </Typography>
            }
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          sx={{ color: "#64748b", fontWeight: 600, textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={saving || !categoryName.trim()}
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            textTransform: "none",
            px: 3,
          }}
        >
          {saving ? (
            <CircularProgress size={20} color="inherit" />
          ) : isEditing ? (
            "Update"
          ) : (
            "Add Category"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}