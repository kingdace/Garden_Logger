import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { addPlant } from "../database/database";
import { globalStyles, colors } from "../styles/globalStyles";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function AddPlantForm() {
  const [name, setName] = useState("");
  const [dateAcquired, setDateAcquired] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [careInstructions, setCareInstructions] = useState("");
  const [sunlight, setSunlight] = useState("");
  const [soilType, setSoilType] = useState("");
  const [wateringNeeds, setWateringNeeds] = useState("");

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setDateAcquired(formattedDate);
    }
  };

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
      <View style={[styles.header, { justifyContent: "center" }]}>
        <View style={styles.iconContainer}>
          <Ionicons name="leaf-outline" size={32} color={colors.primary} />
        </View>
      </View>

      <Text style={globalStyles.label}>Plant Name</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="Enter plant name"
        value={name}
        onChangeText={setName}
      />

      <Text style={globalStyles.label}>Date Acquired</Text>
      <View style={styles.dateInputContainer}>
        <TextInput
          style={[globalStyles.input, styles.dateInput]}
          placeholder="YYYY-MM-DD"
          value={dateAcquired}
          editable={false}
        />
        <TouchableOpacity
          style={styles.calendarButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar" size={24} color={colors.grey} />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={dateAcquired ? new Date(dateAcquired) : new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

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
  dateInputContainer: {
    position: "relative",
  },
  dateInput: {
    paddingRight: 40, // Make room for the icon
  },
  calendarButton: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: [{ translateY: -12 }], // Half of the icon size to center it
    padding: 0,
  },
});
