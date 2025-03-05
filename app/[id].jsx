import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  TouchableOpacity,
  ScrollView,
  Share,
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
} from "../database/database";
import { globalStyles, colors } from "../styles/globalStyles";
import { Ionicons } from "@expo/vector-icons";
import { CareTipsCard } from "../components/CareTipsCard";
import { PlantStats } from "../components/PlantStats";
import { Loading } from "../components/Loading";
import { formatDate } from "../utils/dateUtils";
import { CareLogItem } from "../components/CareLogItem";
import { GrowthTracker } from "../components/GrowthTracker";

export default function PlantDetail() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [plant, setPlant] = useState(null);
  const [logs, setLogs] = useState([]);
  const [growth, setGrowth] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      const [plantData, logsData, growthData] = await Promise.all([
        getPlantById(id),
        getLogsByPlantId(id),
        getGrowthByPlantId(id),
      ]);
      setPlant(plantData);
      setLogs(logsData);
      setGrowth(growthData);
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
                onPress: () => router.replace("/"), // Navigate back to the home screen
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
    router.replace("/");
  };

  const handleAddGrowth = () => {
    Alert.prompt(
      "Add Growth Record",
      "Enter plant height in centimeters",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add",
          onPress: async (height) => {
            if (height) {
              const record = {
                plantId: id,
                height: parseInt(height),
                status:
                  height > (growth[growth.length - 1]?.height || 0)
                    ? "thriving"
                    : "stable",
                notes: `Height recorded: ${height}cm`,
              };
              await addGrowthRecord(record);
              fetchData();
            }
          },
        },
      ],
      "plain-text"
    );
  };

  if (loading) return <Loading />;
  if (!plant) return null;

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.row}>
        <TouchableOpacity
          style={globalStyles.headerButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={globalStyles.title}>{plant.name}</Text>
        </View>
        <TouchableOpacity
          style={globalStyles.headerButton}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <PlantStats
        daysOwned={getDaysOwned()}
        totalLogs={logs.length}
        lastWatered={getLastWatered()}
      />

      <GrowthTracker growth={growth} onAddGrowth={handleAddGrowth} />

      <View style={globalStyles.card}>
        <Text style={globalStyles.subtitle}>Plant Details</Text>
        <View style={globalStyles.row}>
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
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
          <Ionicons name="flower-outline" size={20} color={colors.primary} />
          <Text style={globalStyles.label}>Soil Type:</Text>
          <Text>{plant.soilType || "Not set"}</Text>
        </View>
      </View>

      <CareTipsCard
        type="Care Instructions"
        tip={plant.careInstructions || "No care instructions provided"}
        icon="leaf-outline"
      />

      <View
        style={[
          globalStyles.row,
          { justifyContent: "space-between", marginTop: 16 },
        ]}
      >
        <TouchableOpacity
          style={[globalStyles.button, { flex: 1, marginRight: 8 }]}
          onPress={() => router.push(`/edit/${id}`)}
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
        onPress={() => router.push(`/addlog/${id}`)}
      >
        <Ionicons name="add-circle-outline" size={20} color={colors.surface} />
        <Text style={globalStyles.buttonText}>Add Care Log</Text>
      </TouchableOpacity>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CareLogItem log={item} />}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}
