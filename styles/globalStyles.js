import { StyleSheet, Platform } from "react-native";

export const colors = {
  // Primary Colors
  primary: "#2E8B57", // Sea Green - Main brand color
  secondary: "#3CB371", // Medium Sea Green - Secondary brand color
  accent: "#98FB98", // Pale Green - Accent color
  warm: "#F0E68C", // Khaki - Warm accent
  warmLight: "#FFE4B5", // Moccasin - Light warm accent

  // Extended Palette
  primaryDark: "#1F603C", // Darker green for contrast
  primaryLight: "#4EAB77", // Lighter green for highlights
  surface: "#FFFFFF", // White
  background: "#F8FFF8", // Very light green tint for background

  // Text Colors
  text: "#1A332A", // Dark green-grey for text
  textSecondary: "#4D6B5D", // Medium green-grey for secondary text
  textLight: "#FFFFFF", // White text

  // Utility Colors
  border: "#BCE3C9", // Light green border
  success: "#2E8B57", // Same as primary
  danger: "#E67C73", // Soft red with green undertone
  warning: "#FFD700", // Gold
  disabled: "#A7C4B5", // Muted green

  // Additional Accents
  moss: "#6B8E23", // Olive Drab - for variety
  sage: "#9DC183", // Sage Green - for subtle accents
  forest: "#228B22", // Forest Green - for emphasis

  shadow: Platform.OS === "ios" ? "#1F603C" : "#1F603C",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: spacing.sm,
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: "600",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  outlineButtonText: {
    color: colors.primary,
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerButton: {
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.accent + "20", // 20% opacity
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.accent,
  },
  badgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.md,
  },
  // New styles for plant-specific elements
  plantCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  plantIcon: {
    backgroundColor: colors.accent + "30", // 30% opacity
    padding: spacing.sm,
    borderRadius: 8,
  },
  careLogCard: {
    backgroundColor: colors.warmLight + "40", // 40% opacity
    borderRadius: 8,
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  wateringBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  sunlightBadge: {
    backgroundColor: colors.warm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
});
