
// import messaging from "@react-native-firebase/messaging";
// import { PermissionsAndroid, Platform } from "react-native";

// export const requestUserPermission = async () => {
//   if (Platform.OS == "android" && Platform.Version >= 33) {
//     const granted = PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
//     );
//     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//       console.log("permissions granted::")
//     } else {
//       console.log("permissions denied::")};
//   } else {
//     const authStatus = await messaging().requestPermission();
//     const enabled =
//       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//       authStatus === messaging.AuthorizationStatus.PROVISIONAL;
//       console.log("Authorization status:", authStatus);
//   }
// };
// const getFCMToken = async () => {
//   try {
//     await messaging().registerDeviceForRemoteMessages();
//     const token = await messaging().getToken();
//     console.log("token:::::::", token);
//   } catch (error) {
//     console.log("❌ Error getting FCM token:", error);
//   }
// };
