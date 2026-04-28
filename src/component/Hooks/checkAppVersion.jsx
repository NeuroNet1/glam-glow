import { Alert, Linking, Platform } from "react-native";

const compareVersions = (versionA, versionB) => {
  if (!versionA || !versionB) return 0;

  const partsA = versionA.split(".").map((part) => parseInt(part, 10));
  const partsB = versionB.split(".").map((part) => parseInt(part, 10));

  for (let i = 0; i < 3; i++) {
    if ((partsA[i] || 0) < (partsB[i] || 0)) return -1;
    if ((partsA[i] || 0) > (partsB[i] || 0)) return 1;
  }

  return 0;
};

export const checkAppVersion = (centerData, currentVersion) => {
  if (!centerData) return;

  if (Platform.OS === "android") {
    if (compareVersions(currentVersion, centerData?.android_version) < 0) {
      Alert.alert("Update Required", "You need to update the app now.", [
        {
          text: "Update",
          onPress: () => {
            Linking.openURL(centerData?.android_url).catch((err) =>
              console.log("Error opening URL: ", err)
            );
          },
        },
      ]);
    } else {
      console.log("App is up to date on Android");
    }
  } else if (Platform.OS === "ios") {
    if (compareVersions(currentVersion, centerData?.ios_version) < 0) {
      Alert.alert("Update Required", "You need to update the app now.", [
        {
          text: "Update",
          onPress: () => {
            Linking.openURL(centerData?.ios_url).catch((err) =>
              console.log("Error opening URL: ", err)
            );
          },
        },
      ]);
    } else {
      console.log("App is up to date on iOS");
    }
  }
};
