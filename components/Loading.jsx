import React from "react";
import { View, ActivityIndicator } from "react-native";
import { globalStyles, colors } from "../styles/globalStyles";

export function Loading() {
  return (
    <View style={[globalStyles.container, { justifyContent: "center" }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
