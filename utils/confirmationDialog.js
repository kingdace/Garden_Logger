export const showConfirmDialog = (title, message, onConfirm) => {
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => resolve(false),
        },
        {
          text: "Confirm",
          style: "destructive",
          onPress: () => {
            onConfirm();
            resolve(true);
          },
        },
      ],
      { cancelable: true }
    );
  });
};
