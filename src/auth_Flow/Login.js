import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  View,
  Linking,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";

//all packages
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import DeviceInfo from "react-native-device-info";

// app theme
import { Color } from "../Color/Color";

// all api, url and  axios Config
import { CLOGIN } from "../api/Myurl";
import { sendDataWithToken } from "../api/axiosConfig";

// all component
import Buttons from "../Button_Component/Buttons";

// Helpers
import { ShowToast, Loader } from "../Helpers";

const Login = () => {
  const currentVersion = DeviceInfo.getVersion();
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [firebase_token, setFirebase_token] = useState("");
  const [loading, setLoading] = useState(false);
  const [Center_Id, setCenter_Id] = useState("");
  const [secureTextEntry, setsecureTextEntry] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const getCenterDetails = async () => {
      try {
        const centerId = await AsyncStorage.getItem("Centerdata");
        const centerDetails = JSON.parse(centerId);
        setCenter_Id(centerDetails);
      } catch (error) {
        console.log("login center id  error....", error);
      }
    };
    getCenterDetails();
  }, [isFocused]);

  // API FOR Login PAGE
  let Loginapi = async () => {
    const device = Platform.OS === "ios" ? "ios" : "android";
    if (!email) {
      ShowToast("email is required.");
      return;
    }
    if (!password || password.length < 6) {
      ShowToast("Enter valid is password.");
      return;
    }
    try {
      setLoading(true);
      var formdata = new FormData();
      formdata.append("email", email);
      formdata.append("password", password);
      formdata.append("center_id", Center_Id?.id);
      formdata.append("firebase_token", firebase_token);
      formdata.append("device", device);

      const tokens = null;
      const data = await sendDataWithToken(CLOGIN, tokens, formdata);
      if (data?.error === false) {
        AsyncStorage.setItem("user_session", JSON.stringify(data));
        navigation.navigate("Tab");
      }
      ShowToast(data?.msg);
      setLoading(false);
    } catch (error) {
      console.log("error:::::", error);
      setLoading(false);
    }
  };
  if (loading) {
    return <Loader />;
  }
  return (
    <ScrollView
      style={{
        backgroundColor: Color.white,
        height: "100%",
        paddingHorizontal: 15,
      }}
    >
      <SafeAreaView>
        <View>
          <View style={styles.loginView}>
            <Image
              source={require("../Images/logoRound.png")}
              style={styles.image}
            />
            <Text style={styles.title}>{Center_Id?.center_name}</Text>
            <Text style={styles.text}>Welcome Back</Text>
            <View style={[styles.input, { flexDirection: "row" }]}>
              <MaterialIcons name="email" style={styles.icon} />
              <TextInput
                style={{ width: "90%", color: Color.black }}
                placeholderTextColor={Color.black}
                value={email}
                keyboardType="default"
                // maxLength={10}
                autoCapitalize={"none"}
                onChangeText={(email) => setEmail(email)}
                placeholder="Email"
              />
            </View>
            <View
              style={[
                styles.input,
                {
                  flexDirection: "row",
                  paddingRight: 15,
                },
              ]}
            >
              <MaterialIcons name="lock" style={styles.icon} />
              <TextInput
                style={{ width: "80%", color: Color.black }}
                placeholderTextColor={Color.black}
                placeholder="Password"
                autoCapitalize={"none"}
                value={password}
                onChangeText={(password) => setPassword(password)}
                secureTextEntry={secureTextEntry}
              />
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => {
                  setsecureTextEntry((prev) => !prev);
                }}
              >
                <MaterialIcons
                  name={secureTextEntry ? "visibility" : "visibility-off"}
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                margin: 10,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={styles.forgotpassword}
                onPress={() => navigation.navigate("Forgotpassword")}
              >
                Forgot Password ?
              </Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Center");
                  AsyncStorage.removeItem("user_session");
                  AsyncStorage.removeItem("Centerdata");
                }}
              >
                <Text style={[styles.forgotpassword, { color: "#1D1CE5" }]}>
                  Change Centre
                </Text>
              </TouchableOpacity>
            </View>
            <Buttons
              label={"Sign In"}
              onPress={Loginapi}
              fontS={22}
              fontW={"700"}
              color={"#FFFFFF"}
              borderRadius={10}
              padding={10}
              marginTop={10}
              marginHorizontal={10}
            />
            <Text
              style={{
                textAlign: "center",
                fontWeight: "600",
                fontSize: 15,
                marginTop: "5%",
                color: "#8A8989",
              }}
            >
              Don't have an account?{" "}
              <Text
                style={{ color: "#1D1CE5" }}
                onPress={() => navigation.navigate("Register")}
              >
                Sign Up
              </Text>
            </Text>
          </View>
          <View style={styles.policyHeaders}>
            <Text
              style={{ color: Color.gray, fontSize: 13, fontWeight: "500" }}
            >
              By logging in, you understand and agree to Centum X
            </Text>
            <Text style={{ marginTop: 2 }}>
              <Text
                style={styles.policy}
                onPress={() => {
                  {
                    Center_Id?.tnc_url && Linking.openURL(Center_Id?.tnc_url);
                  }
                }}
              >
                Term & Condition
              </Text>{" "}
              &{" "}
              <Text
                style={styles.policy}
                onPress={() => {
                  Center_Id?.privacy_url &&
                    Linking.openURL(Center_Id?.privacy_url);
                }}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
          <Text
            style={{
              color: Color.gray,
              fontSize: 13,
              fontWeight: "500",
              textAlign: "center",
              marginTop: 10,
            }}
          >
            Version {currentVersion}
          </Text>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default Login;

const styles = StyleSheet.create({
  loginView: {
    backgroundColor: Color.white,
    paddingVertical: "5%",
  },
  image: {
    borderRadius: 70,
    height: 140,
    width: 140,
    resizeMode: "contain",
    alignSelf: "center",
  },

  title: {
    marginHorizontal: 10,
    marginTop: 15,
    marginBottom: 5,
    fontSize: 25,
    textAlign: "center",
    fontWeight: "bold",
    color: "#1D1CE5",
  },
  text: {
    marginHorizontal: 10,
    marginTop: 15,
    marginBottom: 5,
    fontSize: 15,
    fontWeight: "bold",
    color: Color.gray,
  },
  input: {
    backgroundColor: Color.white,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 5,
    color: Color.black,
    fontSize: 15,
    padding: 0,
    borderWidth: 1,
    borderColor: Color.lightgrey,
  },
  forgotpassword: {
    color: "#8F8E8E",
    fontWeight: "600",
    marginVertical: 5,
    fontSize: 14,
  },
  icon: {
    fontSize: 20,
    marginVertical: 10,
    backgroundColor: Color.white,
    color: Color.gray,
    padding: 4,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  policyHeaders: {
    marginTop: 130,
    justifyContent: "center",
    alignItems: "center",
  },
  policy: {
    color: Color.black,
    fontSize: 13,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});
