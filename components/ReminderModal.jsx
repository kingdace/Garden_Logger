import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, spacing } from "../styles/globalStyles";

export function ReminderModal({ visible, onClose, plantId, plantName }) {
  const [interval, setInterval] = useState("1");
  const [timeUnit, setTimeUnit] = useState("days");
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [existingReminder, setExistingReminder] = useState(null);

  const timeUnits = [
    { label: "Minutes", value: "minutes", min: 1, max: 59 },
    { label: "Hours", value: "hours", min: 1, max: 23 },
    { label: "Days", value: "days", min: 1, max: 31 },
    { label: "Weeks", value: "weeks", min: 1, max: 52 },
  ];

  useEffect(() => {
    checkExistingReminder();
  }, [plantId]);

  const checkExistingReminder = async () => {
    try {
      const reminder = await AsyncStorage.getItem(`reminder_${plantId}`);
      if (reminder) {
        const reminderData = JSON.parse(reminder);
        setInterval(reminderData.interval.toString());
        setTimeUnit(reminderData.timeUnit);
        setSelectedTime(new Date(reminderData.time));
        setExistingReminder(reminderData);
      } else {
        // Reset to default values if no reminder exists
        setInterval("1");
        setTimeUnit("days");
        setSelectedTime(new Date());
        setExistingReminder(null);
      }
    } catch (error) {
      console.error("Error checking reminder:", error);
      // Reset to default values on error
      setInterval("1");
      setTimeUnit("days");
      setSelectedTime(new Date());
      setExistingReminder(null);
    }
  };

  const calculateNextNotification = () => {
    const now = new Date();
    const reminderTime = new Date(selectedTime);
    const nextNotification = new Date(now);

    nextNotification.setHours(reminderTime.getHours());
    nextNotification.setMinutes(reminderTime.getMinutes());

    // If the time has already passed today, schedule for next occurrence
    if (nextNotification < now) {
      switch (timeUnit) {
        case "minutes":
          nextNotification.setMinutes(now.getMinutes() + parseInt(interval));
          break;
        case "hours":
          nextNotification.setHours(now.getHours() + parseInt(interval));
          break;
        case "days":
          nextNotification.setDate(now.getDate() + parseInt(interval));
          break;
        case "weeks":
          nextNotification.setDate(now.getDate() + parseInt(interval) * 7);
          break;
      }
    }

    return nextNotification;
  };

  const scheduleNotification = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("You need to enable notifications to use this feature");
        return;
      }

      // Cancel existing reminder if any
      if (existingReminder?.notificationId) {
        try {
          await Notifications.cancelScheduledNotificationAsync(
            existingReminder.notificationId
          );
        } catch (cancelError) {
          console.log("Error canceling existing notification:", cancelError);
        }
      }

      const nextNotification = calculateNextNotification();

      // Create the trigger based on time unit
      let trigger;
      switch (timeUnit) {
        case "minutes":
          trigger = {
            seconds: parseInt(interval) * 60,
            repeats: true,
          };
          break;
        case "hours":
          trigger = {
            seconds: parseInt(interval) * 60 * 60,
            repeats: true,
          };
          break;
        case "days":
          trigger = {
            hour: selectedTime.getHours(),
            minute: selectedTime.getMinutes(),
            repeats: true,
          };
          break;
        case "weeks":
          trigger = {
            hour: selectedTime.getHours(),
            minute: selectedTime.getMinutes(),
            weekday: nextNotification.getDay() + 1,
            repeats: true,
          };
          break;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Time to water ${plantName}! 💧`,
          body: "Your plant needs some care today.",
          data: { plantId },
        },
        trigger,
      });

      // Save reminder settings with validation
      const reminderData = {
        notificationId,
        interval: parseInt(interval),
        timeUnit,
        time: selectedTime.toISOString(),
        nextNotification: nextNotification.toISOString(),
      };

      // Validate the data before saving
      const validatedData = JSON.stringify(reminderData);
      JSON.parse(validatedData); // This will throw if invalid

      await AsyncStorage.setItem(`reminder_${plantId}`, validatedData);

      onClose(true);
    } catch (error) {
      console.log("Error scheduling notification:", error);
      alert("Failed to set reminder. Please try again.");
    }
  };

  const cancelReminder = async () => {
    try {
      if (existingReminder?.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(
          existingReminder.notificationId
        );
      }
      await AsyncStorage.removeItem(`reminder_${plantId}`);
      onClose(true);
    } catch (error) {
      console.error("Error canceling reminder:", error);
      alert("Failed to cancel reminder");
    }
  };

  const validateInterval = (value) => {
    const unit = timeUnits.find((u) => u.value === timeUnit);
    const num = parseInt(value);
    return !isNaN(num) && num >= unit.min && num <= unit.max;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => onClose()}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {existingReminder ? "Edit Reminder" : "Set Watering Reminder"}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => onClose()}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Enable Reminder</Text>
            <Switch
              value={isEnabled}
              onValueChange={setIsEnabled}
              trackColor={{ false: colors.grey, true: colors.primary }}
            />
          </View>

          {isEnabled && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Repeat every</Text>
                <View style={styles.intervalContainer}>
                  <TextInput
                    style={styles.intervalInput}
                    value={interval}
                    onChangeText={setInterval}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <View style={styles.timeUnitSelector}>
                    {timeUnits.map((unit) => (
                      <TouchableOpacity
                        key={unit.value}
                        style={[
                          styles.unitButton,
                          timeUnit === unit.value && styles.selectedUnit,
                        ]}
                        onPress={() => setTimeUnit(unit.value)}
                      >
                        <Text
                          style={[
                            styles.unitText,
                            timeUnit === unit.value && styles.selectedUnitText,
                          ]}
                        >
                          {unit.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.timeSelector}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.label}>Time of day</Text>
                <Text style={styles.timeText}>
                  {selectedTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  is24Hour={false}
                  onChange={(event, time) => {
                    setShowTimePicker(false);
                    if (time) setSelectedTime(time);
                  }}
                />
              )}
            </>
          )}

          <View style={styles.buttonContainer}>
            {existingReminder && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={cancelReminder}
              >
                <Text style={styles.cancelButtonText}>Delete Reminder</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={scheduleNotification}
              disabled={!isEnabled || !validateInterval(interval)}
            >
              <Text style={styles.saveButtonText}>
                {existingReminder ? "Update" : "Set"} Reminder
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    width: "90%",
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: spacing.sm,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  intervalContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  intervalInput: {
    width: 50,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
  },
  timeUnitSelector: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: spacing.md,
  },
  unitButton: {
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  selectedUnit: {
    backgroundColor: colors.primary,
  },
  unitText: {
    fontSize: 16,
  },
  selectedUnitText: {
    fontWeight: "bold",
  },
  timeSelector: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  button: {
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: colors.error,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.success,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
});
