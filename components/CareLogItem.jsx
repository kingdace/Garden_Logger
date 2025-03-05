import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles, colors } from "../styles/globalStyles";
import { formatDate } from "../utils/dateUtils";

export function CareLogItem({ log }) {
  return (
    <View style={globalStyles.careLogCard}>
      <View style={globalStyles.row}>
        <Ionicons
          name={log.type.toLowerCase().includes("water") ? "water" : "leaf"}
          size={20}
          color={colors.primary}
        />
        <Text style={globalStyles.label}>{log.type}</Text>
      </View>
      <Text style={{ color: colors.textSecondary }}>
        Date: {formatDate(log.date)}
      </Text>
      <Text style={{ marginTop: 8 }}>{log.notes}</Text>
    </View>
  );
}
