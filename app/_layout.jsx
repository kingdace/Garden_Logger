import { Stack } from "expo-router";
import { useEffect } from "react";
import { initializeDatabase } from "../database/database";

export default function Layout() {
  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <Stack screenOptions={{ headerBackVisible: false }}>
      <Stack.Screen
        name="index"
        options={{
          title: "My Plants",
          headerShown: true, // Hide header for home screen
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: "Add Plant",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Plant Details",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: "Edit Plant",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="addlog/[id]"
        options={{
          title: "Add Care Log",
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
