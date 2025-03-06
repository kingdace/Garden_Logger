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

export default function AddCareLog() {
  const { id } = useLocalSearchParams();
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

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

  return (
    <ScrollView style={globalStyles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="calendar-outline" size={32} color={colors.primary} />
        </View>
        <TouchableOpacity
          style={globalStyles.headerButton}
          onPress={handleBack}
        >
          <Ionicons name="close" size={24} color={colors.grey} />
        </TouchableOpacity>
      </View>

      <Text style={globalStyles.label}>Care Type *</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="e.g., Watering, Fertilizing, Pruning"
        value={type}
        onChangeText={setType}
      />

      <Text style={globalStyles.label}>Date *</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="YYYY-MM-DD"
        value={date}
        onChangeText={setDate}
      />

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
});
