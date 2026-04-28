import React from "react";
import { StyleSheet, TouchableOpacity, Text } from "react-native";
// all package
import LinearGradient from "react-native-linear-gradient";

// app theme
import { Colors } from "../AppTheme/color";
import AllFont from "../AppTheme/AllFont";
import {
  scale,
  verticalScale,
  moderateScale,
  normalizeFont,
} from "../AppTheme/scale";

const ResponsiveButton = ({
  label,
  onPress,
  color = Colors.white,
  fontS = 16,
  fontW = "600",
  padding,
  marginHorizontal = scale(16),
  marginVertical = verticalScale(10),
  borderRadius = moderateScale(90),
  marginTop = verticalScale(0),
  paddingHorizontal,
  paddingVertical,
  height,
  width,
  gradientColors = Colors.primaryGradiyant,
  disabled = false,
}) => { 
  const finalColors = disabled ? Colors.secondryGradiyant : gradientColors;
  return (
    <TouchableOpacity activeOpacity={0.6} onPress={onPress} disabled={disabled}>
      <LinearGradient
        colors={finalColors}
        style={[
          styles.button,
          {
            borderRadius,
            padding,
            marginHorizontal,
            marginVertical,
            marginTop,
            paddingHorizontal,
            paddingVertical,
            height,
            width,
          },
        ]}
      >
        <Text
          style={{
            color: color,
            fontSize: fontS,
            fontWeight: fontW,
            textAlign: "center",
            fontFamily: AllFont.regular
          }}
        >
          {label}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default ResponsiveButton;

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
  },
});
