// components/ResponsiveText.js

import React from "react";
import { Text, StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";

// Font sizes
const fontSizes = {
  small: moderateScale(12),
  regular: moderateScale(14),
  medium: moderateScale(16),
  large: moderateScale(20),
};

const ResponsiveText = ({
  children,
  size = "regular",
  color,
  fontWeight = "normal",
  textAlign = "center",
  numberOfLines = 1,
  style,
  ...props
}) => {
  return (
    <Text
      style={[
        styles.text,
        {
          fontSize: fontSizes[size],
          color: color,
          fontWeight,
          textAlign,
        },
        style,
      ]}
      numberOfLines={numberOfLines}
      ellipsizeMode="tail"
      allowFontScaling={false}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    flexShrink: 1, // Allow text to shrink within its container
    overflow: "hidden", // Hide overflowing text
  },
});

export default ResponsiveText;
