import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Text,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { Color } from "../../Color/Color.js";

export const AlertModal = ({ announcementMsg }) => {
  return (
    <View style={styles.container}>
      <MaterialIcons
        name="campaign"
        size={35}
        color={Color?.brown}
        style={{
          marginLeft: 10,
          transform: [{ rotate: "-30deg" }],
        }}
      />
      {announcementMsg && <Text style={styles.text}>{announcementMsg}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.white,
    borderRadius: 6,
    marginVertical: 10,
    marginHorizontal: 5,
    borderWidth: 0.5,
    width: "96%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    paddingHorizontal: 15,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    // textAlign: "justify",
    color: Color.black,
    // paddingHorizontal: 10,
    paddingRight: 5,
  },
});
