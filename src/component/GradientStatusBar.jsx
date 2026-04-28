import React from "react";
import { StatusBar, Platform, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../AppTheme/color";

const GradientStatusBar = () => {
  const insets = useSafeAreaInsets();

  const statusBarHeight =
    Platform.OS === "android" ? StatusBar.currentHeight : insets.top;
  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <LinearGradient
        colors={Colors.primaryGradiyant}
        start={{ x: 0.25, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.statusBarBackground, { height: statusBarHeight }]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  statusBarBackground: {
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1000,
  },
});

export default GradientStatusBar;
