import { StyleSheet, SafeAreaView, Switch, View, Text } from "react-native";
import React, { useState, useEffect } from "react";
import { Color } from "../../Color/Color";
import {
  useStripe,
  CardField,
  StripeProvider,
} from "@stripe/stripe-react-native";
import { useDispatch } from "react-redux";
import Button from "../../Button_Component/Button";
import { url } from "../../api/Myurl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { setPublishableKey } from "../../ReduxToolKit/AddCartSlice.js";

// Helpers
import { ShowToast, Loader } from "../../Helpers";

const Add_Card = () => {
  const navigation = useNavigation();
  const { createToken } = useStripe();
  const dispatch = useDispatch();
  const [cardInfo, setCardInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [TOKEN, setTOKEN] = useState("");
  const [isEnabled, setIsEnabled] = useState(0);
  const [center, setCenter] = useState(""); // Set your default or initial value
  const toggleSwitch = () =>
    setIsEnabled((previousState) => (previousState === 1 ? 0 : 1));

  useEffect(() => {
    checkLogin();
  }, []);
  const checkLogin = async (isSelected) => {
    setLoading(true);
    try {
      const session = await AsyncStorage.getItem("user_session");
      if (session !== undefined && session !== null) {
        const sessionID = JSON.parse(session)?.data;
        setTOKEN(sessionID?.token);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      // There was an error on the native side
    }
  };

  useEffect(() => {
    const getCenterData = async () => {
      setLoading(true);
      try {
        const centerId = await AsyncStorage.getItem("Centerdata");
        if (centerId) {
          setLoading(false);
          const centerDetails = JSON.parse(centerId);
          dispatch(setPublishableKey(centerDetails));
          setCenter(centerDetails?.stripe_pk);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.log("Error retrieving center data from AsyncStorage:", error);
      } finally {
        setLoading(false); // Set loading to false in both success and error cases
      }
    };

    getCenterData();
  }, []);

  const fetchCardDetails = (cardDetails) => {
    if (cardDetails.complete) {
      setCardInfo(cardDetails);
    } else {
      setCardInfo(null);
    }
  };
  const createStripeToken = async () => {
    if (cardInfo) {
      try {
        const resToken = await createToken({ ...cardInfo, type: "Card" });
        if (resToken?.token?.id) {
          saveCard(resToken?.token?.id);
        } else {
          ShowToast(resToken?.error?.message);
        }
      } catch (error) {
        console.log("error::::::::", error);
      }
    }
  };
  const saveCard = (data) => {
    setLoading(true);
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${TOKEN}`);

    var formdata = new FormData();
    formdata.append("token", data);
    formdata.append("is_default", isEnabled);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    fetch(`${url}csaveCard`, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        const newData = JSON.parse(result);
        ShowToast(newData?.msg);
        setLoading(false);
        if (newData?.error === false) {
          navigation.navigate("Payment_method");
        }
      })
      .catch((error) => {
        setLoading(false);
        console.log("error", error);
      });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StripeProvider publishableKey={center}>
        <CardField
          postalCodeEnabled={false}
          placeholders={{
            number: "4242 4242 4242 4242",
          }}
          cardStyle={{
            backgroundColor: "#FFFFFF",
            textColor: "#000000",
            placeholderColor: "#888888",
          }}
          style={{
            width: "100%",
            height: 50,
            marginVertical: 30,
          }}
          onCardChange={(cardDetails) => {
            fetchCardDetails(cardDetails);
          }}
          onFocus={(focusedField) => {
            console.log("focusField", focusedField);
          }}
        />
      </StripeProvider>
      <View
        style={{
          // flexDirection: 'row',
          marginHorizontal: 20,
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <Text style={styles.cardText}>Set Card Default</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isEnabled ? "#0A3ECB" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled === 1}
          style={styles.switch}
        />
      </View>
      <Button
        label={"Add New Card"}
        onPress={() => {
          createStripeToken();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.white,
    height: "100%",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  switch: {
    transform: [{ scale: 1 }], // Adjust the size by changing the scale
    marginVertical: 10,
  },
  cardText: { fontSize: 14, fontWeight: "600", color: Color.black },
});

export default Add_Card;
