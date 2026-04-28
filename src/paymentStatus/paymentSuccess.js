import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { confirmPayment } from "@stripe/stripe-react-native";
import Button from "../Button_Component/Buttons";
import { Color } from "../Color/Color";
import success from "../Images/successimage.png";
import { useNavigation } from "@react-navigation/native";
const PaymentSuccess = (props) => {
  const navigation = useNavigation();
  const cartId = props?.route?.params?.InvID;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <View
        style={{
          flex: 1 / 1.6,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={success}
          style={{ height: "40%", width: "80%", resizeMode: "contain" }}
        />
      </View>
      <View style={{ marginVertical: 40 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", textAlign: "center", color:'#000000' }}>
          {"Your payment is success"}
        </Text>
      </View>
      <Button
        onPress={() => {
          if (cartId) {
            navigation.replace("InvoiceDetails", { data: cartId });
          }
        }}
        label={"OK"}
        color={Color.white}
        fontS={18}
        fontW={"700"}
        marginHorizontal={20}
        padding={10}
        borderRadius={10}
      />
    </SafeAreaView>
  );
};

export default PaymentSuccess;

const styles = StyleSheet.create({});
