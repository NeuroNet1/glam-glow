import React, { useEffect, useState } from "react";
import { BackHandler, Platform } from "react-native";
// all package
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Toast from "react-native-simple-toast";

const useHandleBackPress = () => {
  const navigation = useNavigation();
  const [isBackButtonPressed, setIsBackButtonPressed] = useState(false);

  // Prevent default iOS/Android back navigation via navigation
  useEffect(() => {
    const subscription = navigation.addListener("beforeRemove", (e) => {
      if (Platform.OS === "ios") {
        // Optional: add iOS alert or prevent swipe back if needed
        e.preventDefault(); // blocks back gesture
      }
    });

    return subscription;
  }, [navigation]);

  // Handle Android hardware back press
  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        if (!isBackButtonPressed) {
          Toast.show("Press back again to exit", Toast.SHORT);
          setIsBackButtonPressed(true);
          setTimeout(() => setIsBackButtonPressed(false), 2000);
          return true; // prevent exit
        } else {
          BackHandler.exitApp(); // exit app
          return true;
        }
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }, [isBackButtonPressed])
  );
};

export default useHandleBackPress;
