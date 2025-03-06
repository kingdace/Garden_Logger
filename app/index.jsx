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
  Modal,
  TextInput,
  TouchableOpacity,
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
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPlants, setFilteredPlants] = useState([]);

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

  const filterPlants = (query) => {
    const searchTerm = query.toLowerCase();
    return plants.filter(
      (plant) =>
        plant.name.toLowerCase().includes(searchTerm) ||
        plant.wateringNeeds?.toLowerCase().includes(searchTerm) ||
        plant.sunlight?.toLowerCase().includes(searchTerm) ||
        plant.soilType?.toLowerCase().includes(searchTerm)
    );
  };

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
              {(searchQuery ? filteredPlants : plants).length}{" "}
              {(searchQuery ? filteredPlants : plants).length === 1
                ? "plant"
                : "plants"}{" "}
              in your garden
            </Text>
          </View>
          <Pressable
            style={styles.searchButton}
            onPress={() => setIsSearchVisible(true)}
          >
            <Ionicons name="search-outline" size={24} color={colors.surface} />
          </Pressable>
        </View>
      </Animated.View>
    );
  };

  const renderSearchResult = (plant, searchTerm) => {
    const highlightMatches = (text, term) => {
      if (!text) return null;
      const parts = text.split(new RegExp(`(${term})`, "gi"));
      return (
        <Text>
          {parts.map((part, i) =>
            part.toLowerCase() === term.toLowerCase() ? (
              <Text
                key={i}
                style={{
                  backgroundColor: colors.primary + "40",
                  color: colors.primary,
                }}
              >
                {part}
              </Text>
            ) : (
              <Text key={i}>{part}</Text>
            )
          )}
        </Text>
      );
    };

    const matches = [];

    if (plant.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      matches.push({
        label: "Name",
        value: plant.name,
      });
    }
    if (plant.wateringNeeds?.toLowerCase().includes(searchTerm.toLowerCase())) {
      matches.push({
        label: "Watering",
        value: plant.wateringNeeds,
      });
    }
    if (plant.sunlight?.toLowerCase().includes(searchTerm.toLowerCase())) {
      matches.push({
        label: "Sunlight",
        value: plant.sunlight,
      });
    }
    if (plant.soilType?.toLowerCase().includes(searchTerm.toLowerCase())) {
      matches.push({
        label: "Soil",
        value: plant.soilType,
      });
    }

    return (
      <TouchableOpacity
        style={styles.searchResultItem}
        onPress={() => {
          router.push(`/${plant.id}`);
          setIsSearchVisible(false);
          setSearchQuery("");
          setFilteredPlants([]);
        }}
      >
        <View style={styles.searchResultIcon}>
          <Ionicons name="leaf" size={24} color={colors.primary} />
        </View>
        <View style={styles.searchResultContent}>
          <Text style={styles.searchResultTitle}>{plant.name}</Text>
          {matches.map((match, index) => (
            <View key={index} style={styles.searchMatch}>
              <Text style={styles.searchMatchLabel}>{match.label}: </Text>
              {highlightMatches(match.value, searchTerm)}
            </View>
          ))}
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.grey} />
      </TouchableOpacity>
    );
  };

  const renderSearchModal = () => (
    <Modal
      visible={isSearchVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setIsSearchVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.searchModalContent}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color={colors.grey}
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search plants..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setFilteredPlants(filterPlants(text));
              }}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSearchQuery("");
                  setFilteredPlants([]);
                }}
              >
                <Ionicons name="close-circle" size={20} color={colors.grey} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {searchQuery.length > 0 && (
          <FlatList
            data={filteredPlants}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderSearchResult(item, searchQuery)}
            style={styles.searchResults}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>No plants found</Text>
              </View>
            }
          />
        )}
      </View>
    </Modal>
  );

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
      {renderSearchModal()}
      <Animated.FlatList
        data={searchQuery ? filteredPlants : plants}
        renderItem={renderPlantCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <EmptyState
              icon="leaf"
              message={
                searchQuery
                  ? "No plants match your search"
                  : "No plants yet. Start growing your garden!"
              }
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
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  searchModalContent: {
    backgroundColor: colors.surface + "F0",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey + "33",
    backdropFilter: "blur(10px)",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background + "F0",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.surface + "F0",
    borderBottomWidth: 1,
    borderBottomColor: colors.grey + "20",
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
  },
  searchResultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  searchMatch: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  searchMatchLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  searchResults: {
    backgroundColor: "transparent",
  },
  noResults: {
    padding: 16,
    alignItems: "center",
    backgroundColor: colors.surface + "F0",
    margin: 8,
    borderRadius: 12,
  },
  noResultsText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
});
