// database.js
import AsyncStorage from "@react-native-async-storage/async-storage";

// Add this function
export const debugStorage = async () => {
  try {
    const plants = await AsyncStorage.getItem("plants");
    console.log("DEBUG - Raw plants data:", plants);
    console.log("DEBUG - Parsed plants data:", JSON.parse(plants));
  } catch (error) {
    console.error("Debug error:", error);
  }
};

// Initialize the database (if needed)
export const initializeDatabase = async () => {
  await debugStorage(); // Add this line
  // Check if the database already exists
  const plants = await AsyncStorage.getItem("plants");
  if (!plants) {
    await AsyncStorage.setItem("plants", JSON.stringify([])); // Initialize with an empty array
  }

  const logs = await AsyncStorage.getItem("logs");
  if (!logs) {
    await AsyncStorage.setItem("logs", JSON.stringify([])); // Initialize with an empty array
  }
};

// Get all plants
export const getPlants = async () => {
  try {
    const plants = await AsyncStorage.getItem("plants");
    const parsedPlants = JSON.parse(plants);
    console.log("Retrieved plants from storage:", parsedPlants); // Add this for debugging
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
    const newPlant = { id: Date.now().toString(), ...plant };
    const updatedPlants = [...plants, newPlant];
    await AsyncStorage.setItem("plants", JSON.stringify(updatedPlants));
    console.log("Added new plant:", newPlant); // Add this for debugging
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
        id, // Ensure we keep the same ID
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
  const plants = await getPlants();
  const updatedPlants = plants.filter((plant) => plant.id !== id);
  await AsyncStorage.setItem("plants", JSON.stringify(updatedPlants));
  return updatedPlants.length !== plants.length; // Return true if a plant was deleted
};

// Get logs for a plant
export const getLogsByPlantId = async (plantId) => {
  const logs = await AsyncStorage.getItem("logs");
  const parsedLogs = JSON.parse(logs) || [];
  return parsedLogs.filter((log) => log.plantId === plantId);
};

// Add a new log
export const addLog = async (log) => {
  const logs = await AsyncStorage.getItem("logs");
  const parsedLogs = JSON.parse(logs) || [];
  const newLog = { id: Date.now().toString(), ...log }; // Use timestamp as ID
  parsedLogs.push(newLog);
  await AsyncStorage.setItem("logs", JSON.stringify(parsedLogs));
  return newLog;
};

// Get growth records for a plant
export const getGrowthByPlantId = async (plantId) => {
  const growth = await AsyncStorage.getItem("growth");
  const parsedGrowth = JSON.parse(growth) || [];
  return parsedGrowth.filter((g) => g.plantId === plantId);
};

// Add a growth record
export const addGrowthRecord = async (record) => {
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
};
