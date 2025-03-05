import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles, colors } from "../styles/globalStyles";
import { formatDate } from "../utils/dateUtils";

export function PlantCard({ plant, onPress }) {
  return (
    <TouchableOpacity style={globalStyles.plantCard} onPress={onPress}>
      <View style={globalStyles.row}>
        <View style={globalStyles.plantIcon}>
          <Ionicons name="leaf" size={24} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={globalStyles.subtitle}>{plant.name}</Text>
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
