import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Avatar,
  IconButton,
  CircularProgress,
  Card,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import MenuItemModal from "../../components/MenuItemModal";
import AddCategoryModal from "../../components/AddCategoryModal";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";

export default function MenuManagementTab() {
  const [categories, setCategories] = useState([]);
  const [menuData, setMenuData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // used to trigger reload

  // Menu Item Modal
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    imagePath: "",
    isAvailable: true,
    isDiscounted: false,
    sizes: [],
  });
  const [imageFile, setImageFile] = useState(null);

  // Category Modal
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isActive, setIsActive] = useState(true);

  // Delete Category Confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // ========== LOAD DATA ==========
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setLoading(true);

        const catSnap = await getDocs(collection(db, "categories"));
        const catList = catSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        catList.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setCategories(catList);

        const menuSnap = await getDocs(collection(db, "menu"));
        const menuObj = {};
        menuSnap.docs.forEach((doc) => {
          menuObj[doc.id] = doc.data();
        });
        setMenuData(menuObj);

        if (catList.length > 0) {
          setSelectedCategory((prev) =>
            prev ? prev : catList[0].name.toLowerCase()
          );
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMenuData();
  }, [refreshKey]);

  // Helper to refresh data
  const refreshData = () => setRefreshKey((prev) => prev + 1);

  // ========== MENU ITEM FUNCTIONS ==========
  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || "",
        description: item.description || "",
        price: item.price != null ? String(item.price) : "",
        originalPrice:
          item.originalPrice != null ? String(item.originalPrice) : "",
        imagePath: item.imagePath || "",
        isAvailable: item.isAvailable ?? true,
        isDiscounted: item.isDiscounted ?? false,
        sizes: item.sizes || [],
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        imagePath: "",
        isAvailable: true,
        isDiscounted: false,
        sizes: [],
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
    if (!formData.name || !selectedCategory) return;

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
        imagePath: finalImageUrl,
        isAvailable: formData.isAvailable,
        isDiscounted: formData.isDiscounted,
        menuId:
          editingItem?.menuId ||
          formData.name.toLowerCase().replace(/\s+/g, "_"),
      };

      if (formData.price !== "") {
        newItemData.price = Number(formData.price);
      }

      if (formData.originalPrice !== "") {
        newItemData.originalPrice = Number(formData.originalPrice);
      } else if (newItemData.originalPrice && !formData.isDiscounted) {
        delete newItemData.originalPrice;
      }

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

      refreshData();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving menu item:", error);
    }
    setUploadingImage(false);
  };

  // ========== CATEGORY FUNCTIONS ==========
  const handleSaveCategory = async () => {
    if (!categoryName.trim()) return;

    setSavingCategory(true);
    try {
      const cleanName = categoryName.trim();
      const docId = cleanName.toLowerCase().replace(/\s+/g, "_");

      if (editingCategory) {
        // Edit existing category
        await updateDoc(doc(db, "categories", editingCategory.id), {
          name: cleanName,
          isActive: isActive,
        });
      } else {
        // Add new category
        const newSortOrder = categories.length + 1;

        await addDoc(collection(db, "categories"), {
          name: cleanName,
          sortOrder: newSortOrder,
          isActive: isActive,
        });

        // Create matching document in menu collection
        await setDoc(doc(db, "menu", docId), {
          variants: [],
        });
      }

      setCategoryName("");
      setIsActive(true);
      setEditingCategory(null);
      setOpenCategoryModal(false);
      refreshData();
    } catch (error) {
      console.error("Error saving category:", error);
    }
    setSavingCategory(false);
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setIsActive(cat.isActive ?? true);
    setOpenCategoryModal(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteDoc(doc(db, "categories", categoryToDelete.id));

      setDeleteDialogOpen(false);
      setCategoryToDelete(null);

      if (selectedCategory === categoryToDelete.name.toLowerCase()) {
        setSelectedCategory(null);
      }

      refreshData();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const currentCategoryData =
    menuData[selectedCategory?.toLowerCase()]?.variants || [];

  return (
    <Box sx={{ flexGrow: 1, textAlign: "left" }}>
      {/* HEADER */}
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
            sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}
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
          onClick={() => {
            setEditingCategory(null);
            setCategoryName("");
            setIsActive(true);
            setOpenCategoryModal(true);
          }}
          sx={{
            borderRadius: 2,
            fontWeight: "bold",
            textTransform: "none",
            boxShadow: "none",
          }}
        >
          New Category
        </Button>
      </Box>

      {/* MAIN LAYOUT */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
          alignItems: "flex-start",
        }}
      >
        {/* SIDEBAR - Categories */}
        <Box sx={{ width: { xs: "100%", md: "250px" }, flexShrink: 0 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid #e2e8f0",
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
                const isSelected =
                  selectedCategory === cat.name.toLowerCase();
                return (
                  <ListItemButton
                    key={cat.id}
                    selected={isSelected}
                    onClick={() =>
                      setSelectedCategory(cat.name.toLowerCase())
                    }
                    sx={{
                      borderRadius: 2,
                      py: 1.2,
                      pr: 1,
                      "&.Mui-selected": {
                        bgcolor: "#f1f5f9",
                        color: "#0f172a",
                      },
                      color: "#64748b",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <ListItemText
                      primary={cat.name}
                      primaryTypographyProps={{
                        fontWeight: isSelected ? 800 : 600,
                        fontSize: "0.95rem",
                        color: cat.isActive === false ? "#94a3b8" : "inherit",
                        fontStyle:
                          cat.isActive === false ? "italic" : "normal",
                      }}
                    />
                    <Box
                      sx={{ display: "flex", gap: 0.5 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleEditCategory(cat)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setCategoryToDelete(cat);
                          setDeleteDialogOpen(true);
                        }}
                        sx={{ color: "#ef4444" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItemButton>
                );
              })}
            </List>
          </Paper>
        </Box>

        {/* RIGHT SIDE - Items */}
        <Box
          sx={{
            flexGrow: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 250px)",
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
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
                    <RestaurantMenuIcon
                      sx={{ color: "#3b82f6", fontSize: 22 }}
                    />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: "#0f172a",
                      textTransform: "capitalize",
                    }}
                  >
                    {selectedCategory || "Select a category"}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenModal()}
                  disabled={!selectedCategory}
                  sx={{
                    borderRadius: 2,
                    fontWeight: "bold",
                    textTransform: "none",
                    borderWidth: "2px",
                  }}
                >
                  Add Item
                </Button>
              </Box>

              <Box
                sx={{
                  flexGrow: 1,
                  overflowY: "auto",
                  pr: 1.5,
                  pb: 4,
                }}
              >
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
                    <Typography color="#64748b">
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
                      }}
                    >
                      <Avatar
                        variant="rounded"
                        src={item.imagePath}
                        sx={{ width: 100, height: 100, borderRadius: 2 }}
                      >
                        <RestaurantMenuIcon
                          sx={{ color: "#cbd5e1", fontSize: 40 }}
                        />
                      </Avatar>

                      <Box sx={{ flexGrow: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 800, fontSize: "1.1rem" }}
                          >
                            {item.name}
                          </Typography>
                          {!item.isAvailable && (
                            <Chip
                              label="Unavailable"
                              size="small"
                              color="error"
                            />
                          )}
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{ color: "#64748b", mb: 1.5 }}
                        >
                          {item.description}
                        </Typography>

                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {item.price ? (
                            <Chip
                              label={`$${Number(item.price).toFixed(2)}`}
                              size="small"
                              sx={{
                                bgcolor: "#ecfdf5",
                                color: "#047857",
                                fontWeight: 700,
                              }}
                            />
                          ) : item.sizes ? (
                            item.sizes.map((s) => (
                              <Chip
                                key={s.name}
                                label={`${s.name} $${Number(s.price).toFixed(2)}`}
                                size="small"
                                sx={{
                                  bgcolor: "#ecfdf5",
                                  color: "#047857",
                                  fontWeight: 700,
                                }}
                              />
                            ))
                          ) : null}
                        </Box>
                      </Box>

                      <IconButton onClick={() => handleOpenModal(item)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Card>
                  ))
                )}
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* MODALS */}
      <MenuItemModal
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSaveItem}
        formData={formData}
        setFormData={setFormData}
        editingItem={editingItem}
        uploadingImage={uploadingImage}
        imageFile={imageFile}
        handleImageChange={handleImageChange}
        selectedCategory={selectedCategory}
      />

      <AddCategoryModal
        open={openCategoryModal}
        onClose={() => {
          setOpenCategoryModal(false);
          setCategoryName("");
          setIsActive(true);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        categoryName={categoryName}
        setCategoryName={setCategoryName}
        isActive={isActive}
        setIsActive={setIsActive}
        saving={savingCategory}
        isEditing={Boolean(editingCategory)}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Category?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{categoryToDelete?.name}</strong>? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteCategory}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}