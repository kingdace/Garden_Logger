import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles, colors } from "../styles/globalStyles";

export function CareTipsCard({ type, tip, icon }) {
  return (
    <View
      style={[globalStyles.card, { backgroundColor: colors.warmLight + "40" }]}
    >
      <View style={globalStyles.row}>
        <View style={globalStyles.plantIcon}>
          <Ionicons name={icon} size={24} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[globalStyles.subtitle, { color: colors.primary }]}>
            {type}
          </Text>
          <Text style={{ color: colors.textSecondary }}>{tip}</Text>
        </View>
      </View>
    </View>
  );
}
