import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles, colors } from "../styles/globalStyles";

export function EmptyState({ icon, message }) {
  return (
    <View style={globalStyles.emptyState}>
      <Ionicons name={icon} size={64} color={colors.greyLight} />
      <Text style={globalStyles.emptyStateText}>{message}</Text>
    </View>
  );
}
