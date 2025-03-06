import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { addPlant } from "../database/database";
import { globalStyles, colors } from "../styles/globalStyles";
import { Ionicons } from "@expo/vector-icons";

export default function AddPlantForm() {
  const [name, setName] = useState("");
  const [dateAcquired, setDateAcquired] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [sunlight, setSunlight] = useState("");
  const [soilType, setSoilType] = useState("");
  const [wateringNeeds, setWateringNeeds] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Plant name is required!");
      return;
    }

    const newPlant = {
      name,
      dateAcquired,
      careInstructions,
      sunlight,
      soilType,
      wateringNeeds,
    };

    try {
      await addPlant(newPlant);
      Alert.alert("Success", "Plant added successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Use replace instead of back() to ensure the list screen refreshes
            router.replace("/");
          },
        },
      ]);
    } catch (error) {
      console.error("Error adding plant:", error);
      Alert.alert("Error", "Failed to add plant");
    }
  };

  const handleBack = () => {
    try {
      router.push("/"); // Go back to home page
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="leaf-outline" size={32} color={colors.primary} />
        </View>
        <TouchableOpacity
          style={globalStyles.headerButton}
          onPress={handleBack}
        >
          <Ionicons name="close" size={24} color={colors.grey} />
        </TouchableOpacity>
      </View>

      <Text style={globalStyles.label}>Plant Name</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="Enter plant name"
        value={name}
        onChangeText={setName}
      />

      <Text style={globalStyles.label}>Date Acquired</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="YYYY-MM-DD"
        value={dateAcquired}
        onChangeText={setDateAcquired}
      />

      <Text style={globalStyles.label}>Care Instructions</Text>
      <TextInput
        style={[globalStyles.input, { height: 100, textAlignVertical: "top" }]}
        placeholder="Enter care instructions"
        value={careInstructions}
        onChangeText={setCareInstructions}
        multiline
      />

      <Text style={globalStyles.label}>Sunlight Requirements</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="e.g., Full sun, Partial shade"
        value={sunlight}
        onChangeText={setSunlight}
      />

      <Text style={globalStyles.label}>Soil Type</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="e.g., Well-draining, Sandy"
        value={soilType}
        onChangeText={setSoilType}
      />

      <Text style={globalStyles.label}>Watering Needs</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="e.g., Weekly, When soil is dry"
        value={wateringNeeds}
        onChangeText={setWateringNeeds}
      />

      <TouchableOpacity
        style={[globalStyles.button, { marginTop: 16, marginBottom: 32 }]}
        onPress={handleSubmit}
      >
        <Text style={globalStyles.buttonText}>Add Plant</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  iconContainer: {
    padding: 8,
  },
});
