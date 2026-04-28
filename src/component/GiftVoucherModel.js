import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { Dropdown } from "react-native-element-dropdown";

import { Color } from "../Color/Color.js";
import { fetchDataWithToken, sendDataWithToken } from "../api/axiosConfig.js";
import { GET_GIFT_VOUCHER, C_GIFT_VOUCHER_CHECK } from "../api/Myurl";

import Buttons from "../Button_Component/Buttons";
import CartButton from "../Button_Component/CartButton";
import { ShowToast } from "../component";

const GiftVoucherModel = ({ visible, handleBack, setStoreAllGiftVoucher }) => {
  const isFocused = useIsFocused();

  const [Token, setToken] = useState("");
  const [allVoucher, setAllVoucher] = useState([]);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState(null);
  const [voucherInput, setVoucherInput] = useState("");
  const [availableAmount, setAvailableAmount] = useState(0);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const getToken = async () => {
      try {
        const session = await AsyncStorage.getItem("user_session");
        if (session) {
          const tokenSession = JSON.parse(session).data;
          setToken(tokenSession?.token);
          getGiftVoucher(tokenSession?.token);
        }
      } catch (error) {
        console.log("Error fetching token:", error);
      }
    };
    if (isFocused) {
      getToken();
    }
  }, [isFocused]);

  const getGiftVoucher = async (token) => {
    try {
      const data = await fetchDataWithToken(GET_GIFT_VOUCHER, token);
      if (data?.data) {
        setAllVoucher(data.data);
      }
    } catch (error) {
      console.log("Error fetching gift vouchers:", error);
    }
  };

  // 📌 Auto select dropdown if typed code matches
  const autoSelectVoucher = (text) => {
    setVoucherInput(text);

    const match = allVoucher.find(
      (item) => item.code?.toLowerCase() === text.toLowerCase()
    );

    if (match) {
      setSelectedVoucherCode(match);
    } else {
      setSelectedVoucherCode(null);
    }

    setAvailableAmount(0);
  };

  // 📌 Check Voucher Validity
  const handleGiftVoucher = async () => {
    const codeToCheck = selectedVoucherCode?.code || voucherInput?.trim();

    if (!codeToCheck) {
      ShowToast("Please enter voucher code");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("gift_voucher", codeToCheck);

      const data = await sendDataWithToken(
        C_GIFT_VOUCHER_CHECK,
        Token,
        formData
      );

      if (data?.error) {
        ShowToast("Invalid voucher code");
        setAvailableAmount(0);
        return;
      }

      const bal = data?.data?.disc_value - data?.data?.use_amount;
      setAvailableAmount(bal);

      setSelectedVoucherCode({ code: codeToCheck }); // store final code
    } catch (error) {
      console.log("Error:", error);
    }
  };
  const AllGiftVoucherPayment = {
    pay_mode: "gift_voucher",
    amount: amount,
    pay_ref: selectedVoucherCode?.code,
  };

  const clearState = () => {
    setSelectedVoucherCode(null);
    setVoucherInput("");
    setAvailableAmount(0);
    setAmount(0);
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={{ height: "60%" }}>
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={() => {
                    clearState(), handleBack();
                  }}
                  style={styles.closeButton}
                >
                  <MaterialIcons name="close" size={25} color={Color?.gray} />
                </TouchableOpacity>
              </View>
              <View style={styles.body}>
                <View style={styles.Coupon}>
                  {/* ✅ Manual voucher input */}
                  <Text
                    style={[styles.fontBold, { marginVertical: -1 }]}
                  >{`Enter Gift Voucher`}</Text>
                  <TextInput
                    style={[styles.textInput, { width: "100%" }]}
                    placeholder="Enter Voucher Code"
                    placeholderTextColor={Color.gray}
                    value={voucherInput}
                    onChangeText={autoSelectVoucher}
                  />

                  {/* ✅ Dropdown (optional) */}
                  <Dropdown
                    style={styles.dropdown}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    itemTextStyle={styles.selectedTextStyle}
                    containerStyle={styles.containerStyle}
                    data={allVoucher}
                    search
                    maxHeight={300}
                    labelField="code"
                    valueField="code"
                    placeholder="Select Voucher"
                    value={selectedVoucherCode?.code}
                    searchPlaceholder="Search..."
                    onChange={(item) => {
                      setSelectedVoucherCode(item);
                      setVoucherInput(item.code);
                      setAvailableAmount(0);
                    }}
                  />

                  {/* Check Voucher */}
                  <Buttons
                    label={"Check"}
                    fontS={16}
                    fontW={"600"}
                    color={"#FFFFFF"}
                    padding={10}
                    borderRadius={10}
                    marginTop={12}
                    // paddingVertical={12}
                    // paddingHorizontal={15}
                    onPress={handleGiftVoucher}
                  />

                  {availableAmount > 0 && (
                    <View style={styles.centeredView}>
                      <Text style={styles.fontBold}>
                        {`Voucher Balance Amount: €${availableAmount}`}
                      </Text>
                    </View>
                  )}

                  {/* Amount input */}
                  <TextInput
                    style={[styles.textInput, { width: "100%" }]}
                    placeholder="Enter Payable Amount"
                    placeholderTextColor={Color.gray}
                    value={amount ? amount.toString() : ""}
                    onChangeText={(text) => {
                      if (!isNaN(text)) setAmount(Number(text));
                    }}
                  />
                </View>

                {/* Submit */}
                <CartButton
                  label={"Submit"}
                  fontS={22}
                  fontW={"700"}
                  color={"#FFFFFF"}
                  padding={10}
                  borderRadius={10}
                  marginTop={12}
                  // paddingHorizontal={20}
                  marginHorizontal={10}
                  onPress={() => {
                    if (
                      availableAmount > 0 &&
                      amount > 0 &&
                      Number(amount) <= availableAmount
                    ) {
                      setStoreAllGiftVoucher(AllGiftVoucherPayment);
                      clearState();
                    } else {
                      ShowToast("Please enter valid amount");
                    }
                  }}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#00000040",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    marginTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: Color.white,
  },
  closeButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: "rgba(192, 192, 192, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  body: {
    flex: 1,
    backgroundColor: Color.white,
    padding: 10,
  },
  Coupon: {
    backgroundColor: Color.white,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  textInput: {
    borderRadius: 8,
    backgroundColor: Color.ghostwhite,
    height: 40,
    marginRight: 8,
    fontSize: 16,
    marginVertical: 10,
    borderWidth: 0.5,
    paddingStart: 10,
    color: Color.black,
    borderColor: Color.gray,
  },
  dropdown: {
    height: 45,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#c3c3c3",
    padding: 5,
    borderRadius: 5,
    width: "100%",
  },
  placeholderStyle: {
    fontSize: 15,
    color: Color.gray,
  },
  selectedTextStyle: {
    fontSize: 15,
    color: Color.black,
  },
  containerStyle: {
    backgroundColor: "#ffffff",
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: Color.black,
  },
  centeredView: {
    justifyContent: "center",
    alignItems: "center",
  },
  fontBold: {
    marginVertical: 10,
    color: Color.black,
    fontWeight: "600",
    fontSize: 14,
  },
});

export default GiftVoucherModel;
