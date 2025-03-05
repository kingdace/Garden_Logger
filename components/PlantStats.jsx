import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles, colors } from "../styles/globalStyles";

export function PlantStats({ daysOwned, totalLogs, lastWatered }) {
  return (
    <View
      style={[
        globalStyles.row,
        { justifyContent: "space-between", padding: 16 },
      ]}
    >
      <View style={{ alignItems: "center" }}>
        <View style={[globalStyles.plantIcon, { marginBottom: 8 }]}>
          <Ionicons name="calendar" size={24} color={colors.primary} />
        </View>
        <Text style={{ color: colors.textSecondary }}>Days Owned</Text>
        <Text style={[globalStyles.subtitle, { marginBottom: 0 }]}>
          {daysOwned}
        </Text>
      </View>

      <View style={{ alignItems: "center" }}>
        <View style={[globalStyles.plantIcon, { marginBottom: 8 }]}>
          <Ionicons name="document-text" size={24} color={colors.primary} />
        </View>
        <Text style={{ color: colors.textSecondary }}>Care Logs</Text>
        <Text style={[globalStyles.subtitle, { marginBottom: 0 }]}>
          {totalLogs}
        </Text>
      </View>

      <View style={{ alignItems: "center" }}>
        <View style={[globalStyles.plantIcon, { marginBottom: 8 }]}>
          <Ionicons name="water" size={24} color={colors.primary} />
        </View>
        <Text style={{ color: colors.textSecondary }}>Last Watered</Text>
        <Text style={[globalStyles.subtitle, { marginBottom: 0 }]}>
          {lastWatered}
        </Text>
      </View>
    </View>
  );
}
