import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Color } from "../Color/Color";

const PriceCard = ({ item, onPressCard, priceDetails }) => {
  return (
    <TouchableOpacity
      key={item?.item?.id}
      onPress={onPressCard}
      style={[
        styles.priceCart,
        {
          backgroundColor:
            item?.item?.id === priceDetails?.id ? "#0C86DE" : "#EDF1F4",
        },
      ]}
    >
      {item?.item?.id === priceDetails?.id ? (
        <View style={styles.check}>
          <MaterialIcons name="check" size={25} color={Color.white} />
        </View>
      ) : null}

      <View style={{ alignSelf: "center" }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: item?.item?.id === priceDetails?.id ? "#ffffff" : "#3E3D3D",
          }}
        >
          {item?.item?.price_group}
        </Text>
      </View>

      <View style={{ alignSelf: "center" }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: item?.item?.id === priceDetails?.id ? "#ffffff" : "#3E3D3D",
          }}
        >
          {"( " + item?.item?.occupants + " Person Only)"}
        </Text>
      </View>
      <View style={{ alignSelf: "center" }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "600",
            color: item?.item?.id === priceDetails?.id ? "#ffffff" : "#3E3D3D",
          }}
        >
          €{item?.item?.price}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default PriceCard;

const styles = StyleSheet.create({
  priceCart: {
    margin: 8,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    width: "45%",
    alignSelf: "center",
  },
  check: {
    position: "absolute",
    top: 5,
    right: 5,
  },
});
