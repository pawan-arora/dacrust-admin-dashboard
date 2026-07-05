import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Avatar,
  IconButton,
  CircularProgress,
  Switch,
  FormControlLabel,
  Card,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";

import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";

export default function MenuManagementTab() {
  const [categories, setCategories] = useState([]);
  const [menuData, setMenuData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    imagePath: "",
    isAvailable: true,
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchMenuData = useCallback(async () => {
    try {
      const catSnap = await getDocs(collection(db, "categories"));
      const catList = catSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      catList.sort((a, b) => a.sortOrder - b.sortOrder);
      setCategories(catList);

      const menuSnap = await getDocs(collection(db, "menu"));
      const menuObj = {};
      menuSnap.docs.forEach((doc) => {
        menuObj[doc.id] = doc.data();
      });
      setMenuData(menuObj);

      if (catList.length > 0) {
        setSelectedCategory((prev) => (prev ? prev : catList[0].id.toLowerCase()));
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const initializeMenu = async () => {
      await fetchMenuData();
    };
    initializeMenu();
  }, [fetchMenuData]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || "",
        description: item.description || "",
        price: item.price || "",
        imagePath: item.imagePath || "",
        isAvailable: item.isAvailable ?? true,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        imagePath: "",
        isAvailable: true,
      });
    }
    setImageFile(null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setImageFile(null);
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSaveItem = async () => {
    if (!formData.name) return;

    setUploadingImage(true);
    let finalImageUrl = formData.imagePath;

    try {
      if (imageFile) {
        const folderName = selectedCategory.toLowerCase();
        const storageRef = ref(storage, `${folderName}/${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        finalImageUrl = await getDownloadURL(storageRef);
      }

      const newItemData = {
        ...editingItem,
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        imagePath: finalImageUrl,
        isAvailable: formData.isAvailable,
        menuId:
          editingItem?.menuId ||
          formData.name.toLowerCase().replace(/\s+/g, "_"),
      };

      const categoryDocRef = doc(db, "menu", selectedCategory.toLowerCase());
      const currentCategoryData = menuData[selectedCategory.toLowerCase()] || {
        variants: [],
      };
      let updatedVariants = [...(currentCategoryData.variants || [])];

      if (editingItem) {
        const index = updatedVariants.findIndex(
          (v) => v.menuId === editingItem.menuId
        );
        if (index > -1) updatedVariants[index] = newItemData;
      } else {
        newItemData.sortOrder = updatedVariants.length + 1;
        updatedVariants.push(newItemData);
      }

      await updateDoc(categoryDocRef, { variants: updatedVariants });

      fetchMenuData();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving menu item:", error);
    }
    setUploadingImage(false);
  };

  const currentCategoryData =
    menuData[selectedCategory?.toLowerCase()]?.variants || [];

  return (
    <Box sx={{ flexGrow: 1, textAlign: "left" }}>
      
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
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
            Menu Catalog
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Organize categories, update pricing, and manage item availability.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 2,
            fontWeight: "bold",
            textTransform: "none",
            boxShadow: "none",
            "&:hover": { boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" },
          }}
        >
          New Category
        </Button>
      </Box>

      <Grid container spacing={4} alignItems="flex-start">
        {/* LEFT COLUMN: Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              bgcolor: "#ffffff",
              position: "sticky",
              top: 100,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#94a3b8",
                fontWeight: 800,
                mb: 1.5,
                display: "block",
                textTransform: "uppercase",
                letterSpacing: "1px",
                px: 2,
              }}
            >
              Categories
            </Typography>
            <List
              disablePadding
              sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
            >
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.name.toLowerCase();
                return (
                  <ListItemButton
                    key={cat.id}
                    selected={isSelected}
                    onClick={() => setSelectedCategory(cat.name.toLowerCase())}
                    sx={{
                      borderRadius: 2,
                      py: 1.2,
                      "&.Mui-selected": {
                        bgcolor: "#f1f5f9",
                        color: "#0f172a",
                      },
                      "&:hover": { bgcolor: isSelected ? "#f1f5f9" : "#f8fafc" },
                      color: "#64748b",
                    }}
                  >
                    <ListItemText
                      primary={cat.name}
                      primaryTypographyProps={{
                        fontWeight: isSelected ? 800 : 600,
                        fontSize: "0.95rem",
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Paper>
        </Grid>

        {/* RIGHT COLUMN: Item Cards */}
        <Grid item xs={12} md={9}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#eff6ff",
                      borderRadius: "50%",
                      width: 40,
                      height: 40,
                    }}
                  >
                    <RestaurantMenuIcon sx={{ color: "#3b82f6", fontSize: 22 }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: "#0f172a",
                      textTransform: "capitalize",
                    }}
                  >
                    {selectedCategory}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenModal()}
                  sx={{
                    borderRadius: 2,
                    fontWeight: "bold",
                    textTransform: "none",
                    borderWidth: "2px",
                    color: "#0f172a",
                    borderColor: "#e2e8f0",
                    "&:hover": {
                      borderWidth: "2px",
                      borderColor: "#cbd5e1",
                      bgcolor: "#f8fafc",
                    },
                  }}
                >
                  Add Item
                </Button>
              </Box>

              {currentCategoryData.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 6,
                    textAlign: "center",
                    border: "1px dashed #cbd5e1",
                    borderRadius: 3,
                    bgcolor: "#f8fafc",
                  }}
                >
                  <Typography variant="body1" color="#64748b" fontWeight="500">
                    No items found in this category.
                  </Typography>
                </Paper>
              ) : (
                currentCategoryData.map((item) => (
                  <Card
                    key={item.menuId}
                    elevation={0}
                    sx={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 3,
                      p: 2.5,
                      mb: 2,
                      display: "flex",
                      gap: 3,
                      alignItems: "flex-start", // 🌟 FIX 1: Top-align everything to stop cards from wobbling
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: "#cbd5e1",
                        boxShadow:
                          "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
                      },
                    }}
                  >
                    {/* 🌟 FIX 2: Added a fallback icon and background if the image is missing */}
                    <Avatar
                      variant="rounded"
                      src={item.imagePath}
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: 2,
                        boxShadow: "0 2px 4px rgb(0 0 0 / 0.1)",
                        bgcolor: "#f1f5f9", 
                        mt: 0.5
                      }}
                    >
                       <RestaurantMenuIcon sx={{ color: "#cbd5e1", fontSize: 40 }} />
                    </Avatar>

                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 800,
                            color: "#0f172a",
                            fontSize: "1.1rem",
                          }}
                        >
                          {item.name}
                        </Typography>
                        {!item.isAvailable && (
                          <Chip
                            label="Unavailable"
                            size="small"
                            color="error"
                            sx={{
                              height: 22,
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                            }}
                          />
                        )}
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{
                          color: "#64748b",
                          mb: 1.5,
                          maxWidth: "90%",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.description}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                        {/* 🌟 FIX 3: Single prices are now formatted exactly like the sizes chips */}
                        {item.price ? (
                          <Chip
                            label={`$${item.price.toFixed(2)}`}
                            size="small"
                            sx={{
                              bgcolor: "#ecfdf5",
                              color: "#047857",
                              fontWeight: 700,
                              borderRadius: 1.5,
                            }}
                          />
                        ) : item.sizes ? (
                          item.sizes.map((s) => (
                            <Chip
                              key={s.name}
                              label={`${s.name} $${s.price.toFixed(2)}`}
                              size="small"
                              sx={{
                                bgcolor: "#ecfdf5",
                                color: "#047857",
                                fontWeight: 700,
                                borderRadius: 1.5,
                              }}
                            />
                          ))
                        ) : null}
                      </Box>
                    </Box>

                    {/* 🌟 Top-Right Aligned Edit Button */}
                    <IconButton
                      onClick={() => handleOpenModal(item)}
                      sx={{
                        bgcolor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        color: "#64748b",
                        mt: 0.5,
                        "&:hover": {
                          bgcolor: "#f1f5f9",
                          color: "#0f172a",
                          borderColor: "#cbd5e1",
                        },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Card>
                ))
              )}
            </Box>
          )}
        </Grid>
      </Grid>

      {/* EDIT / ADD MODAL */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
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
            onClick={handleCloseModal}
            sx={{ color: "#64748b", fontWeight: "bold", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveItem}
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
    </Box>
  );
}