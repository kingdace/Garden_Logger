// database.js
import AsyncStorage from "@react-native-async-storage/async-storage";

// Add this function
export const debugStorage = async () => {
  try {
    const plants = await AsyncStorage.getItem("plants");
    const photos = await AsyncStorage.getItem("photos");
    console.log("DEBUG - Raw plants data:", plants);
    console.log("DEBUG - Parsed plants data:", JSON.parse(plants));
    console.log("DEBUG - Raw photos data:", photos);
    console.log("DEBUG - Parsed photos data:", JSON.parse(photos));
  } catch (error) {
    console.error("Debug error:", error);
  }
};

// Initialize the database
export const initializeDatabase = async () => {
  await debugStorage();
  try {
    const items = ["plants", "logs", "growth", "photos"];
    for (const item of items) {
      const data = await AsyncStorage.getItem(item);
      if (!data) {
        await AsyncStorage.setItem(item, JSON.stringify([]));
      }
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

// Get all plants
export const getPlants = async () => {
  try {
    const plants = await AsyncStorage.getItem("plants");
    const parsedPlants = JSON.parse(plants);
    console.log("Retrieved plants from storage:", parsedPlants);
    return parsedPlants || [];
  } catch (error) {
    console.error("Error getting plants:", error);
    return [];
  }
};

// Get a single plant by ID
export const getPlantById = async (id) => {
  const plants = await getPlants();
  return plants.find((plant) => plant.id === id);
};

// Add a new plant
export const addPlant = async (plant) => {
  try {
    const plants = await getPlants();
    const newPlant = {
      id: Date.now().toString(),
      ...plant,
    };
    const updatedPlants = [...plants, newPlant];
    await AsyncStorage.setItem("plants", JSON.stringify(updatedPlants));
    return newPlant;
  } catch (error) {
    console.error("Error adding plant:", error);
    throw error;
  }
};

// Update a plant
export const updatePlant = async (id, updatedData) => {
  try {
    const plants = await getPlants();
    const plantIndex = plants.findIndex((plant) => plant.id === id);

    if (plantIndex !== -1) {
      plants[plantIndex] = {
        ...plants[plantIndex],
        ...updatedData,
        id,
      };
      await AsyncStorage.setItem("plants", JSON.stringify(plants));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error updating plant:", error);
    throw error;
  }
};

// Delete a plant
export const deletePlant = async (id) => {
  try {
    const plants = await getPlants();
    const updatedPlants = plants.filter((plant) => plant.id !== id);
    await AsyncStorage.setItem("plants", JSON.stringify(updatedPlants));

    // Also delete associated photos
    const photos = await getPhotosByPlantId(id);
    if (photos.length > 0) {
      const allPhotos = await getAllPhotos();
      const updatedPhotos = allPhotos.filter((photo) => photo.plantId !== id);
      await AsyncStorage.setItem("photos", JSON.stringify(updatedPhotos));
    }

    return updatedPlants.length !== plants.length;
  } catch (error) {
    console.error("Error deleting plant:", error);
    throw error;
  }
};

// Get logs for a plant
export const getLogsByPlantId = async (plantId) => {
  try {
    const logs = await AsyncStorage.getItem("logs");
    const parsedLogs = JSON.parse(logs) || [];
    return parsedLogs.filter((log) => log.plantId === plantId);
  } catch (error) {
    console.error("Error getting logs:", error);
    return [];
  }
};

// Add a new log
export const addLog = async (log) => {
  try {
    const logs = await AsyncStorage.getItem("logs");
    const parsedLogs = JSON.parse(logs) || [];
    const newLog = { id: Date.now().toString(), ...log };
    parsedLogs.push(newLog);
    await AsyncStorage.setItem("logs", JSON.stringify(parsedLogs));
    return newLog;
  } catch (error) {
    console.error("Error adding log:", error);
    throw error;
  }
};

// Get growth records for a plant
export const getGrowthByPlantId = async (plantId) => {
  try {
    const growth = await AsyncStorage.getItem("growth");
    const parsedGrowth = JSON.parse(growth) || [];
    return parsedGrowth.filter((g) => g.plantId === plantId);
  } catch (error) {
    console.error("Error getting growth records:", error);
    return [];
  }
};

// Add a growth record
export const addGrowthRecord = async (record) => {
  try {
    const growth = await AsyncStorage.getItem("growth");
    const parsedGrowth = JSON.parse(growth) || [];
    const newRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      ...record,
    };
    parsedGrowth.push(newRecord);
    await AsyncStorage.setItem("growth", JSON.stringify(parsedGrowth));
    return newRecord;
  } catch (error) {
    console.error("Error adding growth record:", error);
    throw error;
  }
};

// Get all photos
const getAllPhotos = async () => {
  try {
    const photos = await AsyncStorage.getItem("photos");
    return JSON.parse(photos) || [];
  } catch (error) {
    console.error("Error getting all photos:", error);
    return [];
  }
};

// Add a photo
export const addPhoto = async (plantId, uri) => {
  try {
    const photos = await getAllPhotos();
    const newPhoto = {
      id: Date.now().toString(),
      plantId,
      uri,
      timestamp: new Date().toISOString(),
    };
    photos.push(newPhoto);
    await AsyncStorage.setItem("photos", JSON.stringify(photos));
    return newPhoto;
  } catch (error) {
    console.error("Error adding photo:", error);
    throw error;
  }
};

// Get photos for a plant
export const getPhotosByPlantId = async (plantId) => {
  try {
    const photos = await getAllPhotos();
    return photos
      .filter((photo) => photo.plantId === plantId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error("Error getting photos:", error);
    return [];
  }
};
