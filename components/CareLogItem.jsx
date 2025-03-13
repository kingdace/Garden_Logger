import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles, colors } from "../styles/globalStyles";
import { formatDate } from "../utils/dateUtils";

export function CareLogItem({ log }) {
  const getTypeIcon = (type) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("water")) return "water";
    if (lowerType.includes("fertiliz")) return "nutrition";
    if (lowerType.includes("prun")) return "cut";
    if (lowerType.includes("repot")) return "flower";
    return "leaf";
  };

  const getTypeColor = (type) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("water")) return colors.primary;
    if (lowerType.includes("fertiliz")) return colors.success;
    if (lowerType.includes("prun")) return colors.warning;
    if (lowerType.includes("repot")) return colors.danger;
    return colors.grey;
  };

  return (
    <View
      style={[
        globalStyles.careLogCard,
        { borderLeftColor: getTypeColor(log.type), borderLeftWidth: 4 },
      ]}
    >
      <View style={globalStyles.row}>
        <Ionicons
          name={getTypeIcon(log.type)}
          size={20}
          color={getTypeColor(log.type)}
        />
        <Text style={[globalStyles.label, { color: getTypeColor(log.type) }]}>
          {log.type}
        </Text>
      </View>
      <Text style={{ color: colors.textSecondary }}>
        Date: {formatDate(log.date)}
      </Text>
      <Text style={{ marginTop: 8 }}>{log.notes}</Text>
    </View>
  );
}
