import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

// App Theme
import { Colors } from "../AppTheme/color";
import {
  scale,
  verticalScale,
  moderateScale,
} from "../AppTheme/scale";

const CustomTextInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  editable = true,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  labelStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={[styles.input, inputStyle]}
        placeholderTextColor="#999"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: verticalScale(8),
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: verticalScale(4),
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: moderateScale(6),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(12),
    fontSize: 16,
    color: "#000",
    backgroundColor: "#fff",
  },
});

export default CustomTextInput;
