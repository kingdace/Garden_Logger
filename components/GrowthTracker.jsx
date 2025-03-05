import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles, colors } from "../styles/globalStyles";

export function GrowthTracker({ growth, onAddGrowth }) {
  const getGrowthStatus = (status) => {
    switch (status) {
      case "thriving":
        return { icon: "trending-up", color: colors.success };
      case "stable":
        return { icon: "remove", color: colors.primary };
      case "struggling":
        return { icon: "trending-down", color: colors.danger };
      default:
        return { icon: "help", color: colors.grey };
    }
  };

  const lastRecord =
    growth && growth.length > 0 ? growth[growth.length - 1] : null;
  const status = getGrowthStatus(lastRecord?.status || "unknown");

  return (
    <View style={globalStyles.card}>
      <View style={[globalStyles.row, { justifyContent: "space-between" }]}>
        <Text style={globalStyles.subtitle}>Growth Tracker</Text>
        <TouchableOpacity
          style={globalStyles.headerButton}
          onPress={onAddGrowth}
        >
          <Ionicons
            name="add-circle-outline"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={[globalStyles.row, { marginTop: 12 }]}>
        <View
          style={[
            globalStyles.plantIcon,
            { backgroundColor: status.color + "20" },
          ]}
        >
          <Ionicons name={status.icon} size={24} color={status.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: status.color, fontWeight: "600" }}>
            {lastRecord?.status || "No growth data yet"}
          </Text>
          {lastRecord && (
            <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
              Height: {lastRecord.height}cm • {lastRecord.date}
            </Text>
          )}
        </View>
      </View>

      {lastRecord?.notes && (
        <Text style={{ marginTop: 8, color: colors.textSecondary }}>
          Notes: {lastRecord.notes}
        </Text>
      )}
    </View>
  );
}
