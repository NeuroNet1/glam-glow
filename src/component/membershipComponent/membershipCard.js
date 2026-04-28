import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Color } from "../../Color/Color";
import Buttons from "../../Button_Component/Buttons";

const membershipCard = ({ item, onPress }) => {
  return (
    <View style={styles.mainview}>
      <View>
        <Text style={[styles.text, { fontSize: 13, fontWeight: "700" }]}>
          {item?.title}
        </Text>
        <Text style={[styles.text, { fontSize: 11, fontWeight: "600" }]}>
          ({item?.pricing[0]?.price_group})
        </Text>
        <Text
          style={[
            styles.text,
            { fontSize: 11, fontWeight: "400", color: "#848485" },
          ]}
        >
          {item?.description}
        </Text>
        <Buttons
          onPress={() => onPress(item)}
          label={"Buy Now"}
          color={Color.white}
          fontS={12}
          fontW={"700"}
          marginHorizontal={20}
          padding={10}
          marginTop={6}
          borderRadius={10}
        />
      </View>
    </View>
  );
};

export default membershipCard;

const styles = StyleSheet.create({
  mainview: {
    width: "48%",
    // height: 250,
    margin: 4,
    borderRadius: 10,
    borderTopWidth: 4,
    borderTopColor: Color.gradient1,
    borderWidth: 1,
    borderColor: Color.gradient1,
    backgroundColor: Color.white,
    padding: 10,
  },
  text: {
    textAlign: "center",
    fontWeight: "bold",
    color: Color.black,
  },
});
