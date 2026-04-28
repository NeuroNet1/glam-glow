import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  ScrollView,
  SafeAreaView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Color } from "../Color/Color";
import { useNavigation } from "@react-navigation/native";
import Button from "../Button_Component/Button";
import { url } from "../api/Myurl";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Helpers
import { ShowToast, Loader } from "../Helpers";

const Forgotpassword = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [Center_Id, setCenter_Id] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    gettoken();
  }, []);
  const gettoken = async () => {
    try {
      const centerid = await AsyncStorage.getItem("Centerdata");
      setCenter_Id(JSON.parse(centerid).id);
    } catch (error) {
      console.log("login center id  error....", error);
    }
  };
  const forgetPasswordCustomer = async () => {
    setLoading(true);
    try {
      var formdata = new FormData();
      formdata.append("email", email);
      formdata.append("center_id", Center_Id);
      var requestOptions = {
        method: "POST",
        body: formdata,
        redirect: "follow",
      };

      const response = await fetch(
        `${url}forgetPasswordCustomer`,
        requestOptions
      );
      if (response.ok) {
        const data = await response.json();
        if (data.error === false) {
          navigation.navigate("Login");
        }
        ShowToast(data.msg);
      } else {
        console.log("Error:", response.status);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }
  return (
    <SafeAreaView
      style={{
        backgroundColor: Color.white,
        height: "100%",
        paddingHorizontal: 20,
        textAlign: "center",
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ marginVertical: "20%" }}>
          <Image
            style={styles.profileimage}
            source={require("../Images/forgot.jpg")}
          />
        </View>
        {/* <Text style={styles.text}>Forget Your Password</Text> */}
        <Text style={styles.text1}>
          Enter your email and reset your password
        </Text>
        <TextInput
          style={styles.inputfield}
          placeholder="Email"
          placeholderTextColor={Color.black}
          value={email}
          onChangeText={(txt) => setEmail(txt)}
        />
        <Button label={"Submit"} onPress={() => forgetPasswordCustomer()} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Forgotpassword;

const styles = StyleSheet.create({
  profileimage: {
    marginHorizontal: "25%",
    width: "50%",
    height: 150,
  },
  text: {
    marginVertical: 20,
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    color: Color.black,
  },
  text1: {
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    color: Color.black,
  },
  inputfield: {
    backgroundColor: Color.white,
    marginHorizontal: 10,
    marginVertical: 30,
    borderRadius: 5,
    padding: 10,
    color: Color.black,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Color.gray,
  },
});
