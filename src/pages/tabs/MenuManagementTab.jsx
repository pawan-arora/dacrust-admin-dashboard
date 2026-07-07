import { useState, useEffect, useCallback } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import MenuItemModal from "../../components/MenuItemModal"; // Adjust path if needed
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";

export default function MenuManagementTab() {
  const [categories, setCategories] = useState([]);
  const [menuData, setMenuData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
      
      {/* HEADER SECTION */}
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

      {/* CORE LAYOUT */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
          alignItems: "flex-start",
        }}
      >
        {/* LEFT COLUMN: Sidebar */}
        <Box sx={{ width: { xs: "100%", md: "250px" }, flexShrink: 0 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              bgcolor: "#ffffff",
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
            <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
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
                      "&.Mui-selected": { bgcolor: "#f1f5f9", color: "#0f172a" },
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
        </Box>

        {/* 🌟 RIGHT COLUMN: Fixed Height with Internal Scroll */}
        <Box
          sx={{
            flexGrow: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            // Restrict the right side to the height of the screen minus the header space
            height: "calc(100vh - 250px)", 
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* FIXED CATEGORY HEADER: Stays at the top while cards scroll below */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                  flexShrink: 0, // Prevents the header from squishing
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

              {/* 🌟 SCROLLABLE CARDS CONTAINER */}
              <Box
                sx={{
                  flexGrow: 1,
                  overflowY: "auto", // Enables vertical scrolling
                  pr: 1.5, // Padding on the right so the scrollbar doesn't touch the cards
                  pb: 4,
                  // Custom, sleek scrollbar styling
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#cbd5e1",
                    borderRadius: "10px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: "#94a3b8",
                  },
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
                        alignItems: "flex-start",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          borderColor: "#cbd5e1",
                          boxShadow:
                            "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
                        },
                      }}
                    >
                      <Avatar
                        variant="rounded"
                        src={item.imagePath}
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: 2,
                          boxShadow: "0 2px 4px rgb(0 0 0 / 0.1)",
                          bgcolor: "#f1f5f9",
                          mt: 0.5,
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
            </>
          )}
        </Box>
      </Box>

      {/* EDIT / ADD MODAL */}
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
      />
    </Box>
  );
}