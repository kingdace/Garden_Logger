import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Animated,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { getPlants } from "../database/database";
import { colors } from "../styles/globalStyles";
import { Ionicons } from "@expo/vector-icons";
import { EmptyState } from "../components/EmptyState";

export default function PlantList() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollY = new Animated.Value(0);

  const fetchPlants = async () => {
    try {
      const plantsData = await getPlants();
      setPlants(plantsData || []);
    } catch (error) {
      console.error("Error:", error);
      setPlants([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPlants();
    }, [])
  );

  const renderHeader = () => {
    const translateY = scrollY.interpolate({
      inputRange: [0, 120],
      outputRange: [0, -60],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Garden Logger</Text>
            <Text style={styles.headerSubtitle}>
              {plants.length} {plants.length === 1 ? "plant" : "plants"} in your
              garden
            </Text>
          </View>
          <Pressable style={styles.searchButton}>
            <Ionicons name="search-outline" size={24} color={colors.surface} />
          </Pressable>
        </View>
      </Animated.View>
    );
  };

  const renderPlantCard = ({ item }) => (
    <Pressable
      style={({ pressed }) => [
        styles.plantCard,
        pressed && styles.plantCardPressed,
      ]}
      onPress={() => router.push(`/${item.id}`)}
    >
      <View style={styles.plantIconContainer}>
        <Ionicons name="leaf" size={24} color={colors.surface} />
      </View>
      <View style={styles.plantInfo}>
        <Text style={styles.plantName}>{item.name}</Text>
        <Text style={styles.plantDate}>
          Added: {item.dateAcquired || "Date not set"}
        </Text>

        <View style={styles.tagsContainer}>
          {item.wateringNeeds && (
            <View style={styles.tag}>
              <Ionicons name="water" size={14} color={colors.surface} />
              <Text style={styles.tagText}>{item.wateringNeeds}</Text>
            </View>
          )}
          {item.sunlight && (
            <View style={styles.tag}>
              <Ionicons name="sunny" size={14} color={colors.surface} />
              <Text style={styles.tagText}>{item.sunlight}</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.primary} />
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.FlatList
        data={plants}
        renderItem={renderPlantCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <EmptyState
              icon="leaf"
              message="No plants yet. Start growing your garden!"
            />
          </View>
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      />
      <Pressable
        style={({ pressed }) => [
          styles.addButton,
          pressed && styles.addButtonPressed,
        ]}
        onPress={() => router.push("/add")}
      >
        <Ionicons name="add" size={32} color={colors.surface} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 20,
    paddingBottom: 24,
    marginBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.surface,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.surface + "E6",
  },
  searchButton: {
    padding: 8,
    backgroundColor: colors.surface + "33",
    borderRadius: 12,
  },
  listContent: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 80,
  },
  plantCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  plantCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  plantIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface + "33",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.surface,
    marginBottom: 4,
  },
  plantDate: {
    fontSize: 14,
    color: colors.surface + "CC",
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface + "33",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    color: colors.surface,
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  addButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateContainer: {
    marginTop: 32,
  },
});
