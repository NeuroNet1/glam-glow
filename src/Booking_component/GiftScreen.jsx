import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation, useIsFocused } from "@react-navigation/native";

import Icon from "../Images/centumIcon.png";
import { Loader, ShowToast } from "../Helpers";
import Buttons from "../Button_Component/Buttons";
import { url } from "../api/Myurl";
import { addToCartItem } from "../ReduxToolKit/AddCartSlice";
import { Colors } from "../AppTheme/color";

const screenWidth = Dimensions.get("window").width;

const GiftScreen = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [voucherList, setVoucherList] = useState([]);
  const [voucher, setVoucher] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    if (isFocused) initLoad();
  }, [isFocused]);

  const initLoad = async () => {
    try {
      const center = await AsyncStorage.getItem("Centerdata");
      const centerId = JSON.parse(center).id;
      // const session = await AsyncStorage.getItem("user_session");
      // const t = JSON.parse(session)?.data;
      loadVoucher(centerId);
    } catch (e) {
      console.log("init error", e);
    }
  };

  const loadVoucher = async (centerId) => {
    setLoading(true);
    try {
      const res = await fetch(`${url}retail/vouchers/${centerId}`);
      const json = await res.json();

      if (!json.error && json.data?.length > 0) {
        setVoucherList(json.data);
      }
    } catch (e) {
      console.log("voucher list error", e);
    }
    setLoading(false);
  };

  // ---------------- VALIDATION ----------------
  const validateName = (value) => /^[A-Za-z ]{3,}$/.test(value.trim());
  const validateEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  useEffect(() => {
    const isValid = voucher && validateName(name) && validateEmail(email);
    setIsFormValid(isValid);
  }, [voucher, name, email]);

  const handleContinue = () => {
    if (!isFormValid) {
      ShowToast("Please fill all fields correctly");
      return;
    }
    addToCart();
  };

  const addToCart = () => {
    dispatch(
      addToCartItem({
        id: voucher?.id,
        type: "gift_voucher",
        price: voucher?.price,
        title: voucher?.name,
        receiver_name: name,
        receiver_email: email,
        message: message,
        qty: 1,
        amount: voucher.price,
      })
    );

    navigation.navigate("Cart");

    setVoucher(null);
    setName("");
    setEmail("");
    setMessage("");
  };

  // ---------------- RENDER VOUCHER ITEM ----------------
  const renderItem = ({ item }) => {
    const selected = voucher?.id === item.id;

    return (
      <TouchableOpacity onPress={() => setVoucher(item)}>
        <LinearGradient
          colors={selected ? Colors.primaryGradiyant : ["#EAF1FF", "#EAF1FF"]}
          style={styles.voucherBox}
        >
          <Text
            style={[
              styles.voucherPrice,
              {
                color: selected ? Colors.white : Colors.black,
              },
            ]}
          >
            €{Math.floor(item.price)}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) return <Loader />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <LinearGradient
            colors={["rgba(12, 55, 166, 0.1)", "rgba(1, 105, 232, 0.1)"]}
            style={styles.card}
          >
            <Text style={styles.cardText}>The Gift card for</Text>
            <Text style={styles.cardText}>
              Everything <Text style={{ color: "#0169E8" }}>Centum X</Text>
            </Text>
            <Image source={Icon} style={styles.cardImage} />
          </LinearGradient>

          {/* Voucher Section */}
          <Text style={styles.label}>Choose Amount</Text>

          <FlatList
            data={voucherList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            scrollEnabled={false}
          />

          {/* Name */}
          <Text style={styles.label}>Enter Name</Text>
          <TextInput
            placeholder="Enter Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          {/* Email */}
          <Text style={styles.label}>Enter Email</Text>
          <TextInput
            placeholder="Enter Email"
            style={styles.input}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {/* Message */}
          <Text style={styles.label}>Message (optional)</Text>
          <TextInput
            placeholder="Type your message here..."
            style={styles.textArea}
            multiline
            value={message}
            onChangeText={setMessage}
          />

          <Buttons
            onPress={handleContinue}
            label="Add to cart"
            color={Colors.white}
            gradientColors={
              isFormValid ? Colors.primaryGradiyant : Colors.secondryGradiyant
            }
            fontS={16}
            fontW={"600"}
            marginTop={10}
            marginHorizontal={20}
            padding={12}
            borderRadius={20}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default GiftScreen;

// ------------------ STYLES ------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: Colors?.white,
  },

  card: {
    height: 170,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    elevation: 6,
    shadowColor: "#0C37A6",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    backgroundColor: Colors?.white,
  },

  cardText: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },

  cardImage: {
    width: 110,
    height: 70,
    marginTop: 10,
  },

  label: {
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
    fontSize: 15,
  },

  voucherBox: {
    width: screenWidth * 0.4,
    height: 65,
    borderWidth: 1,
    borderColor: "#00000030",
    borderRadius: 8,
    backgroundColor: "#EAF1FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  voucherPrice: {
    fontSize: 18,
    fontWeight: "600",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
  },

  textArea: {
    height: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 20,
  },
});
