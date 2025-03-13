import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getPlantById, updatePlant } from "../../database/database";
import { globalStyles, colors } from "../../styles/globalStyles";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function EditPlantForm() {
  const { id } = useLocalSearchParams();
  const [name, setName] = useState("");
  const [dateAcquired, setDateAcquired] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [sunlight, setSunlight] = useState("");
  const [soilType, setSoilType] = useState("");
  const [wateringNeeds, setWateringNeeds] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchPlant = async () => {
      try {
        const plant = await getPlantById(id);
        if (plant) {
          setName(plant.name);
          setDateAcquired(plant.dateAcquired || "");
          setCareInstructions(plant.careInstructions || "");
          setSunlight(plant.sunlight || "");
          setSoilType(plant.soilType || "");
          setWateringNeeds(plant.wateringNeeds || "");
        }
      } catch (error) {
        console.error("Error fetching plant:", error);
        Alert.alert("Error", "Failed to load plant data");
      }
    };

    fetchPlant();
  }, [id]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Plant name is required!");
      return;
    }

    try {
      const updatedPlant = {
        name,
        dateAcquired,
        careInstructions,
        sunlight,
        soilType,
        wateringNeeds,
      };

      await updatePlant(id, updatedPlant);
      Alert.alert("Success", "Plant updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            router.replace("/");
          },
        },
      ]);
    } catch (error) {
      console.error("Error updating plant:", error);
      Alert.alert("Error", "Failed to update plant");
    }
  };

  const handleBack = () => {
    router.replace(`/${id}`);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setDateAcquired(formattedDate);
    }
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={[styles.header, { justifyContent: "center" }]}>
        <View style={styles.iconContainer}>
          <Ionicons name="create-outline" size={32} color={colors.primary} />
        </View>
      </View>

      <Text style={globalStyles.label}>Plant Name *</Text>
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
        <Text style={globalStyles.buttonText}>Save Changes</Text>
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
