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
import { useLocalSearchParams, router } from "expo-router";
import { addLog } from "../../database/database";
import { globalStyles, colors } from "../../styles/globalStyles";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function AddCareLog() {
  const { id } = useLocalSearchParams();
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async () => {
    if (!type.trim()) {
      Alert.alert("Error", "Care type is required!");
      return;
    }

    if (!date.trim()) {
      Alert.alert("Error", "Date is required!");
      return;
    }

    const newLog = {
      plantId: id,
      type,
      date,
      notes,
    };

    try {
      await addLog(newLog);
      Alert.alert("Success", "Care log added successfully!");
      router.replace(`/${id}`);
    } catch (error) {
      console.error("Error adding care log:", error);
      Alert.alert("Error", "Failed to add care log");
    }
  };

  const handleBack = () => {
    router.replace(`/${id}`);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setDate(formattedDate);
    }
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={[styles.header, { justifyContent: "center" }]}>
        <View style={styles.iconContainer}>
          <Ionicons name="calendar-outline" size={32} color={colors.primary} />
        </View>
      </View>

      <Text style={globalStyles.label}>Care Type *</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="e.g., Watering, Fertilizing, Pruning"
        value={type}
        onChangeText={setType}
      />

      <Text style={globalStyles.label}>Date *</Text>
      <View style={styles.dateInputContainer}>
        <TextInput
          style={[globalStyles.input, styles.dateInput]}
          placeholder="YYYY-MM-DD"
          value={date}
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
          value={date ? new Date(date) : new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <Text style={globalStyles.label}>Notes</Text>
      <TextInput
        style={[globalStyles.input, { height: 100, textAlignVertical: "top" }]}
        placeholder="Enter any additional notes"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <TouchableOpacity
        style={[globalStyles.button, { marginTop: 16, marginBottom: 32 }]}
        onPress={handleSubmit}
      >
        <Text style={globalStyles.buttonText}>Add Care Log</Text>
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
