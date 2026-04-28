// components/ResponsiveText.js

import React from "react";
import { Text, StyleSheet } from "react-native";
import AllFont from "../AppTheme/AllFont";
import { normalizeFont } from "../AppTheme/scale";

// Font sizes
const fontSizes = {
  smallest: 10,
  small: 12,
  regular: 14,
  medium: 16,
  semilarge: 20,
  large: 22,
};

const ResponsiveText = ({
  children,
  size = "regular",
  color,
  fontWeight = "normal",
  textAlign = "center",
  fontFamily = "regular",
  numberOfLines,
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
          fontFamily: AllFont[fontFamily],
        },
        style,
      ]}
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    // Add base style here if needed
  },
});

export default ResponsiveText;
