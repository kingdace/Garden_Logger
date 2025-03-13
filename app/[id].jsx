import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
  Modal,
  TextInput,
  StyleSheet,
  Image,
} from "react-native";
import {
  useLocalSearchParams,
  router,
  useNavigation,
  useFocusEffect,
} from "expo-router";
import {
  getPlantById,
  getLogsByPlantId,
  deletePlant,
  getGrowthByPlantId,
  addGrowthRecord,
  addPhoto,
  getPhotosByPlantId,
} from "../database/database";
import { globalStyles, colors, spacing } from "../styles/globalStyles";
import { Ionicons } from "@expo/vector-icons";
import { CareTipsCard } from "../components/CareTipsCard";
import { PlantStats } from "../components/PlantStats";
import { Loading } from "../components/Loading";
import { formatDate } from "../utils/dateUtils";
import { CareLogItem } from "../components/CareLogItem";
import { GrowthTracker } from "../components/GrowthTracker";
import * as Notifications from "expo-notifications";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { ReminderModal } from "../components/ReminderModal";

export default function PlantDetail() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [plant, setPlant] = useState(null);
  const [logs, setLogs] = useState([]);
  const [growth, setGrowth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [reminderDays, setReminderDays] = useState("7");
  const [reminderScheduled, setReminderScheduled] = useState(false);
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderInfo, setReminderInfo] = useState(null);
  const [sections, setSections] = useState({
    details: true,
    growth: true,
    photos: true,
    care: true,
  });

  useEffect(() => {
    fetchData();
    checkExistingReminder();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      const [plantData, logsData, growthData, photosData] = await Promise.all([
        getPlantById(id),
        getLogsByPlantId(id),
        getGrowthByPlantId(id),
        getPhotosByPlantId(id),
      ]);
      setPlant(plantData);
      setLogs(logsData);
      setGrowth(growthData);
      setPhotos(photosData.map((photo) => photo.uri));
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load plant data");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my plant: ${plant.name}\n\nCare Instructions:\n${plant.careInstructions}`,
        title: `My Plant: ${plant.name}`,
      });
    } catch (error) {
      console.error("Error sharing plant:", error);
    }
  };

  const getDaysOwned = () => {
    if (!plant.dateAcquired) return "N/A";
    const acquired = new Date(plant.dateAcquired);
    const today = new Date();
    const diffTime = Math.abs(today - acquired);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays.toString();
  };

  const getLastWatered = () => {
    const wateringLogs = logs.filter((log) =>
      log.type.toLowerCase().includes("water")
    );
    if (wateringLogs.length === 0) return "Never";
    const lastLog = wateringLogs[wateringLogs.length - 1];
    return lastLog.date;
  };

  const handleDelete = () => {
    Alert.alert("Delete Plant", "Are you sure you want to delete this plant?", [
      { text: "Cancel", style: "cancel" }, // Cancel button
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePlant(id); // Delete the plant
            Alert.alert("Success", "Plant deleted successfully!", [
              {
                text: "OK",
                onPress: () => router.push("/"), // Navigate back to the home screen
              },
            ]);
          } catch (error) {
            console.error("Error deleting plant:", error);
            Alert.alert(
              "Error",
              "Failed to delete the plant. Please try again."
            );
          }
        },
      },
    ]);
  };

  const handleBack = () => {
    router.back();
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Camera permission is required");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;

        // Save photo to local filesystem
        const filename = `plant_${id}_${Date.now()}.jpg`;
        const newUri = `${FileSystem.documentDirectory}photos/${filename}`;

        // Ensure directory exists
        await FileSystem.makeDirectoryAsync(
          `${FileSystem.documentDirectory}photos`,
          { intermediates: true }
        );

        // Copy the file
        await FileSystem.copyAsync({
          from: uri,
          to: newUri,
        });

        // Save to database
        await addPhoto(id, newUri);

        // Refresh data
        fetchData();
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to save photo");
    }
  };

  const checkExistingReminder = async () => {
    try {
      const reminder = await AsyncStorage.getItem(`reminder_${id}`);
      if (reminder) {
        const reminderData = JSON.parse(reminder);
        setReminderInfo(reminderData);
        setReminderScheduled(true);
      } else {
        setReminderInfo(null);
        setReminderScheduled(false);
      }
    } catch (error) {
      console.error("Error checking reminder:", error);
    }
  };

  const handleReminderPress = () => {
    setShowReminderModal(true);
  };

  const handleReminderModalClose = async (reminderSet = false) => {
    setShowReminderModal(false);
    if (reminderSet) {
      await checkExistingReminder();
    }
  };

  const handleAddGrowth = async (newGrowth) => {
    try {
      await addGrowthRecord(newGrowth);
      // Refresh the growth data after adding new record
      const updatedGrowth = await getGrowthByPlantId(id);
      setGrowth(updatedGrowth);
    } catch (error) {
      console.error("Error adding growth record:", error);
      throw error; // Re-throw to be handled by the GrowthTracker component
    }
  };

  if (loading) return <Loading />;
  if (!plant) return null;

  return (
    <ScrollView style={globalStyles.container}>
      <View style={[globalStyles.row, { justifyContent: "center" }]}>
        <Text style={globalStyles.title}>{plant.name}</Text>
      </View>

      <PlantStats
        daysOwned={getDaysOwned()}
        totalLogs={logs.length}
        lastWatered={getLastWatered()}
      />

      <TouchableOpacity
        style={[
          globalStyles.button,
          { marginVertical: 16 },
          reminderScheduled && { backgroundColor: colors.primary },
        ]}
        onPress={handleReminderPress}
      >
        <Ionicons
          name={reminderScheduled ? "notifications" : "notifications-outline"}
          size={20}
          color={colors.surface}
        />
        <Text style={globalStyles.buttonText}>
          {reminderScheduled ? "Manage Reminder" : "Set Watering Reminder"}
        </Text>
      </TouchableOpacity>

      {reminderInfo && (
        <View style={styles.reminderInfo}>
          <Text style={styles.reminderInfoText}>
            Reminder set for every {reminderInfo.interval}{" "}
            {reminderInfo.timeUnit} at{" "}
            {new Date(reminderInfo.time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <Text style={styles.reminderNextText}>
            Next reminder:{" "}
            {new Date(reminderInfo.nextNotification).toLocaleDateString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      )}

      <GrowthTracker
        growth={growth}
        onAddGrowth={handleAddGrowth}
        plantId={id}
      />

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() =>
            setSections((prev) => ({
              ...prev,
              details: !prev.details,
            }))
          }
        >
          <Text style={styles.sectionTitle}>Plant Details</Text>
          <Ionicons
            name={sections.details ? "chevron-up" : "chevron-down"}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>

        {sections.details && (
          <>
            <View style={globalStyles.row}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={globalStyles.label}>Acquired on:</Text>
              <Text>{formatDate(plant.dateAcquired)}</Text>
            </View>

            <View style={globalStyles.divider} />

            <View style={globalStyles.row}>
              <Ionicons name="sunny-outline" size={20} color={colors.primary} />
              <Text style={globalStyles.label}>Sunlight:</Text>
              <Text>{plant.sunlight || "Not set"}</Text>
            </View>

            <View style={globalStyles.divider} />

            <View style={globalStyles.row}>
              <Ionicons name="water-outline" size={20} color={colors.primary} />
              <Text style={globalStyles.label}>Watering Needs:</Text>
              <Text>{plant.wateringNeeds || "Not set"}</Text>
            </View>

            <View style={globalStyles.divider} />

            <View style={globalStyles.row}>
              <Ionicons
                name="flower-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={globalStyles.label}>Soil Type:</Text>
              <Text>{plant.soilType || "Not set"}</Text>
            </View>
          </>
        )}
      </View>

      <CareTipsCard
        type="Care Instructions"
        tip={plant.careInstructions || "No care instructions provided"}
        icon="leaf-outline"
      />

      <View style={styles.photoSection}>
        <Text style={globalStyles.subtitle}>Photo Gallery</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {photos.map((photo, index) => (
            <Image
              key={index}
              source={{ uri: photo }}
              style={styles.photoThumbnail}
              resizeMode="cover"
            />
          ))}
          <TouchableOpacity style={styles.addPhotoButton} onPress={takePhoto}>
            <Ionicons name="camera" size={24} color={colors.primary} />
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View
        style={[
          globalStyles.row,
          { justifyContent: "space-between", marginTop: 16 },
        ]}
      >
        <TouchableOpacity
          style={[globalStyles.button, { flex: 1, marginRight: 8 }]}
          onPress={() =>
            router.push({
              pathname: "/edit/[id]",
              params: { id },
            })
          }
        >
          <Ionicons name="create-outline" size={20} color={colors.surface} />
          <Text style={globalStyles.buttonText}>Edit Plant</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            globalStyles.button,
            globalStyles.dangerButton,
            { flex: 1, marginLeft: 8 },
          ]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color={colors.surface} />
          <Text style={globalStyles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Text style={[globalStyles.title, { marginTop: 24 }]}>Care History</Text>

      <TouchableOpacity
        style={[globalStyles.button, { marginBottom: 16 }]}
        onPress={() =>
          router.push({
            pathname: "/addlog/[id]",
            params: { id },
          })
        }
      >
        <Ionicons name="add-circle-outline" size={20} color={colors.surface} />
        <Text style={globalStyles.buttonText}>Add Care Log</Text>
      </TouchableOpacity>

      <View style={{ marginBottom: 35 }}>
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CareLogItem log={item} />}
          scrollEnabled={false}
        />
      </View>

      <ReminderModal
        visible={showReminderModal}
        onClose={handleReminderModalClose}
        plantId={id}
        plantName={plant?.name}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.surface,
    flex: 1,
    textAlign: "center",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginTop: -20,
    marginHorizontal: spacing.md,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  reminderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary + "20",
    padding: spacing.md,
    borderRadius: 12,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  activeReminder: {
    backgroundColor: colors.primary,
  },
  reminderButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
  reminderInfo: {
    backgroundColor: colors.primary + "10",
    padding: spacing.md,
    borderRadius: 12,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  reminderInfoText: {
    color: colors.primary,
    fontSize: 14,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing.sm,
  },
  detailItem: {
    width: "50%",
    padding: spacing.sm,
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  detailValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
    marginTop: 2,
  },
  photoGallery: {
    marginTop: spacing.sm,
  },
  photoThumbnail: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  addPhotoButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary + "10",
  },
  addLogButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  actionButtons: {
    flexDirection: "row",
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "600",
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginVertical: spacing.md,
  },
  photoSection: {
    marginTop: 16,
    padding: 16,
  },
  reminderNextText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
});
