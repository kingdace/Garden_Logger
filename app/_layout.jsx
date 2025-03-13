import { Stack } from "expo-router";
import { useEffect } from "react";
import { initializeDatabase } from "../database/database";
import * as Notifications from "expo-notifications";
import { Alert } from "react-native";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    const initDB = async () => {
      try {
        await initializeDatabase();
      } catch (error) {
        console.error("Error initializing database:", error);
        Alert.alert(
          "Initialization Error",
          "Failed to initialize the database. Please restart the app."
        );
      }
    };

    initDB();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#2E8B57", // Customize header background color
        },
        headerTintColor: "#FFFFFF", // Customize header text color
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "My Plants",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Plant Details",
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: "Add Plant",
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: "Edit Plant",
        }}
      />
      <Stack.Screen
        name="addlog/[id]"
        options={{
          title: "Add Care Log",
        }}
      />
    </Stack>
  );
}
