import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Colors } from "../AppTheme/color";

import At from "../AppTheme/Images/at.png";
import Headphone from "../AppTheme/Images/headphone.png";


const Call_Support = () => {
  const [center, setCenter] = useState();
  useEffect(() => {
    const gettoken = async () => {
      try {
        const centerid = await AsyncStorage.getItem("Centerdata");
        const centerDetails = JSON.parse(centerid);
        setCenter(centerDetails);
      } catch (error) {
        console.log("token error....");
      }
    };
    gettoken();
  }, []);
  return (
    <ScrollView style={{ backgroundColor: Colors.white, height: "100%" }}>
      <SafeAreaView>
        <View
          style={{
            marginTop: 40,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={styles.icon}>
            <Image source={Headphone} style={{ height: 50, width: 50 }} />
          </View>
          <Text style={styles.text}>Call on toll free number</Text>
          <Text
            style={[
              styles.text,
              { fontSize: 20, fontWeight: "500", color: Colors.black },
            ]}
          >
            {center?.phone}
          </Text>
        </View>
        <View
          style={{
            marginTop: 40,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={styles.icon}>
            <Image source={At} style={{ height: 50, width: 50 }} />
          </View>
          <Text style={styles.text}>Send us an e-mail</Text>
          <Text
            style={[
              styles.text,
              { fontSize: 20, fontWeight: "500", color: Colors.black },
            ]}
          >
            {center?.email}
          </Text>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default Call_Support;

const styles = StyleSheet.create({
  icon: {
    backgroundColor: "#f7f7ff",
    borderRadius: 100 / 2,
    width: 100,
    height: 100,
    padding: 10,
    marginHorizontal: "35%",
    marginVertical: "5%",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "500",
    color: "#8E8E8E",
    margin: 2,
  },
});
