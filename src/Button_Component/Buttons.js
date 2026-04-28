import { StyleSheet, TouchableOpacity, Text } from "react-native";
import React from "react";
import LinearGradient from "react-native-linear-gradient";
import { Color } from "../Color/Color";

const Buttons = ({
  bg,
  label,
  onPress,
  color,
  fontS,
  fontW,
  padding,
  marginHorizontal,
  marginVertical,
  borderRadius,
  marginTop,
  paddingHorizontal,
  paddingVertical,
  height,
  width,
  gradientColors,
}) => {
  const appliedColors = gradientColors || Color.button;

  return (
    <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
      <LinearGradient
        colors={appliedColors}
        style={{
          borderRadius: borderRadius,
          padding: padding,
          marginHorizontal: marginHorizontal,
          marginVertical: marginVertical,
          marginTop: marginTop,
          paddingHorizontal: paddingHorizontal,
          paddingVertical: paddingVertical,
          height: height,
          width: width,
        }}
      >
        <Text
          style={{
            color: color,
            fontSize: fontS,
            fontWeight: fontW,
            textAlign: "center",
          }}
        >
          {label}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};
export default Buttons;

const styles = StyleSheet.create({});
