import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles, colors, spacing } from "../styles/globalStyles";
import { LineChart } from "react-native-chart-kit";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { formatDate } from "../utils/dateUtils";
import { validateNumber } from "../utils/validation";

export function GrowthTracker({ growth = [], onAddGrowth, plantId }) {
  const [showModal, setShowModal] = useState(false);
  const [measurement, setMeasurement] = useState("");
  const [unit, setUnit] = useState("cm");
  const [notes, setNotes] = useState("");

  const units = [
    { label: "cm", value: "cm" },
    { label: "in", value: "in" },
  ];

  const handleAddMeasurement = async () => {
    if (!validateNumber(measurement, 0, 1000)) {
      Alert.alert("Invalid Input", "Please enter a valid measurement (0-1000)");
      return;
    }

    try {
      const value = parseFloat(measurement);
      const heightInCm = unit === "in" ? value * 2.54 : value;

      await onAddGrowth({
        plantId,
        height: heightInCm,
        date: new Date().toISOString().split("T")[0],
        notes,
      });

      // Reset form
      setShowModal(false);
      setMeasurement("");
      setNotes("");
      setUnit("cm");
    } catch (error) {
      Alert.alert("Error", "Failed to add growth record");
    }
  };

  const getGrowthTrend = () => {
    if (growth.length < 2) return null;
    const lastTwo = growth.slice(-2);
    const diff = lastTwo[1].height - lastTwo[0].height;
    return {
      trend: diff > 0 ? "up" : diff < 0 ? "down" : "stable",
      value: Math.abs(diff).toFixed(1),
    };
  };

  const trend = getGrowthTrend();

  // Chart data preparation
  const chartData =
    growth.length > 1
      ? {
          labels: growth.map((g) => g.date.slice(5)),
          datasets: [
            {
              data: growth.map((g) => g.height),
              color: () => colors.primary,
              strokeWidth: 2,
            },
          ],
        }
      : null;

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(46, 139, 87, ${opacity})`, // Sea Green color
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: colors.primary,
    },
  };

  const handleTakePhoto = async () => {
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

      if (!result.canceled && result.assets[0].uri) {
        // Create a unique filename
        const filename = `plant_${plantId}_${Date.now()}.jpg`;
        const newPath = `${FileSystem.documentDirectory}photos/${filename}`;

        // Ensure directory exists
        await FileSystem.makeDirectoryAsync(
          `${FileSystem.documentDirectory}photos`,
          { intermediates: true }
        );

        // Copy the file to app storage
        await FileSystem.copyAsync({
          from: result.assets[0].uri,
          to: newPath,
        });

        // Save to database
        await addPhoto(plantId, newPath);

        // Refresh the plant details
        if (onPhotoAdded) {
          onPhotoAdded();
        }
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "thriving":
        return colors.success;
      case "stable":
        return colors.warning;
      case "declining":
        return colors.danger;
      default:
        return colors.grey;
    }
  };

  const renderGrowthList = () => {
    const sortedGrowth = [...growth].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    return (
      <ScrollView style={styles.listContainer}>
        {sortedGrowth.map((record, index) => (
          <View key={record.id || index} style={styles.growthRecord}>
            <View style={styles.recordHeader}>
              <Text style={styles.date}>{formatDate(record.date)}</Text>
              <Text style={styles.measurement}>
                {record.height.toFixed(1)} cm
              </Text>
            </View>
            {record.notes && <Text style={styles.notes}>{record.notes}</Text>}
            {index < sortedGrowth.length - 1 && (
              <View style={styles.growthDiff}>
                <Ionicons
                  name={
                    record.height > sortedGrowth[index + 1].height
                      ? "trending-up"
                      : "trending-down"
                  }
                  size={16}
                  color={
                    record.height > sortedGrowth[index + 1].height
                      ? colors.success
                      : colors.danger
                  }
                />
                <Text
                  style={[
                    styles.diffText,
                    {
                      color:
                        record.height > sortedGrowth[index + 1].height
                          ? colors.success
                          : colors.danger,
                    },
                  ]}
                >
                  {Math.abs(
                    record.height - sortedGrowth[index + 1].height
                  ).toFixed(1)}{" "}
                  cm
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={globalStyles.subtitle}>Growth History</Text>
        {trend && (
          <View style={[styles.trendBadge, styles[`trend${trend.trend}`]]}>
            <Ionicons
              name={`trending-${trend.trend}`}
              size={16}
              color={colors.surface}
            />
            <Text style={styles.trendText}>{trend.value} cm</Text>
          </View>
        )}
      </View>

      {growth.length > 0 ? (
        renderGrowthList()
      ) : (
        <View style={styles.emptyState}>
          <Ionicons
            name="leaf-outline"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>No growth measurements yet</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={24} color={colors.surface} />
        <Text style={styles.buttonText}>Add Measurement</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Growth Measurement</Text>

            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter measurement"
                value={measurement}
                onChangeText={setMeasurement}
                keyboardType="numeric"
              />
              <View style={styles.unitSelector}>
                {units.map((unitOption) => (
                  <TouchableOpacity
                    key={unitOption.value}
                    style={[
                      styles.unitButton,
                      unit === unitOption.value && styles.selectedUnit,
                    ]}
                    onPress={() => setUnit(unitOption.value)}
                  >
                    <Text
                      style={[
                        styles.unitText,
                        unit === unitOption.value && styles.selectedUnitText,
                      ]}
                    >
                      {unitOption.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Add notes (optional)"
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowModal(false);
                  setMeasurement("");
                  setNotes("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAddMeasurement}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    gap: spacing.xs,
  },
  trendup: {
    backgroundColor: colors.success,
  },
  trenddown: {
    backgroundColor: colors.danger,
  },
  trendstable: {
    backgroundColor: colors.primary,
  },
  trendText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "600",
  },
  chartContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  chart: {
    marginVertical: spacing.xs,
    borderRadius: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontSize: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: colors.text,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.grey,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    color: colors.text,
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
  },
  unitSelector: {
    flexDirection: "row",
    marginLeft: 8,
  },
  unitButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedUnit: {
    backgroundColor: colors.primary,
  },
  unitText: {
    color: colors.text,
  },
  selectedUnitText: {
    color: colors.surface,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  listContainer: {
    maxHeight: 300,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.sm,
  },
  growthRecord: {
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },
  measurement: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
  },
  notes: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: 14,
  },
  growthDiff: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  diffText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
