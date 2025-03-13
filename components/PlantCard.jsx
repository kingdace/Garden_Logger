import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles, colors } from "../styles/globalStyles";
import { formatDate } from "../utils/dateUtils";
import { useRouter } from "expo-router";

export function PlantCard({ plant, reminder }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={globalStyles.plantCard}
      onPress={() => {
        console.log("Navigating to plant:", plant.id);
        router.push({
          pathname: "/[id]",
          params: { id: plant.id },
        });
      }}
    >
      <View style={globalStyles.row}>
        <View style={globalStyles.plantIcon}>
          <Ionicons name="leaf" size={24} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={[globalStyles.row, { justifyContent: "space-between" }]}>
            <Text style={globalStyles.subtitle}>{plant.name}</Text>
            {reminder?.active && (
              <View style={styles.reminderIndicator}>
                <Ionicons
                  name="notifications"
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.reminderText}>
                  Every {reminder.interval} {reminder.timeUnit}
                </Text>
              </View>
            )}
          </View>
          <View style={globalStyles.row}>
            <Text style={{ color: colors.textSecondary }}>
              Added: {formatDate(plant.dateAcquired)}
            </Text>
          </View>
          <View style={[globalStyles.row, { marginTop: 8 }]}>
            <View style={globalStyles.wateringBadge}>
              <Text style={{ color: colors.text, fontSize: 12 }}>
                {plant.wateringNeeds || "Not set"}
              </Text>
            </View>
            <View style={globalStyles.sunlightBadge}>
              <Text style={{ color: colors.text, fontSize: 12 }}>
                {plant.sunlight || "Not set"}
              </Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  reminderIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reminderText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
  },
});
