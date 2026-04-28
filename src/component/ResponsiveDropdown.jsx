import React from "react";
import { StyleSheet } from "react-native";
// all package
import { Dropdown } from "react-native-element-dropdown";

// app theme
import {
  scale,
  verticalScale,
  moderateScale,
} from "../AppTheme/scale";
import { Colors } from "../AppTheme/color";
import AllFont from "../AppTheme/AllFont";

const ResponsiveDropdown = ({
  data,
  value,
  onChange,
  placeholder,
  labelField,
  valueField,
}) => {
  return (
    <Dropdown
      style={styles.dropdown}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      itemTextStyle={styles.itemTextStyle}
      itemContainerStyle={styles.itemContainerStyle}
      activeColor={Colors.lightColor2}
      data={data}
      maxHeight={300}
      labelField={labelField}
      valueField={valueField}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};

const styles = StyleSheet.create({
  dropdown: {
    height: 48,
    borderColor: Colors.gray,
    borderWidth: 1,
    marginHorizontal: verticalScale(10),
    marginTop: verticalScale(10),
    borderRadius: moderateScale(4),
    paddingHorizontal: scale(12),
    backgroundColor: Colors.white,
  },
  placeholderStyle: {
    fontSize: 16,
    fontWeight: "400",
    fontFamily: AllFont.regular,
    color: Colors.placeholdergray,
  },
  selectedTextStyle: {
    fontSize: 16,
    fontWeight: "400",
    color: Colors.black,
    fontFamily: AllFont.regular,
  },
  itemTextStyle: {
    fontSize: 16,
    fontWeight: "400",
    color: Colors.black,
    fontFamily: AllFont.regular,
  },
  itemContainerStyle: {
    backgroundColor: Colors.white,
  },
});

export default ResponsiveDropdown;
