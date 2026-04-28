import {
  StyleSheet,
  SafeAreaView,
  Image,
  View,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";

// all packages
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNRestart from "react-native-restart";

// api and axiosConfig
import { fetchDataWithToken } from "../api/axiosConfig.js";
import { GET_CENTER_LIST, PUBLIC_GET_CENTER_DETAILS } from "../api/Myurl";

// App Theme
import { Colors } from "../AppTheme/color.jsx";
import { verticalScale, scale } from "../AppTheme/scale.jsx";

// all component
import ResponsiveText from "../component/ResponsiveText.jsx";
import ResponsiveDropdown from "../component/ResponsiveDropdown.jsx";
import ResponsiveButton from "../component/responsiveButton.jsx";

// Helpers
import { Loader } from "../Helpers";
import useHandleBackPress from "../component/Hooks/useBackHandler.jsx";

const Center = () => {
  useHandleBackPress();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [listData, setListData] = useState([]);
  const [selectCenterList, setSelectCenterList] = useState("");
  const [showDemo, setShowDemo] = useState(false);
  const [disable, setDisable] = useState(true);
  const [storeCenter, setStoreCenter] = useState("");

  // get all center list
  useEffect(() => {
    const getCenterList = async () => {
      setLoading(true);
      try {
        const tokens = null;
        const data = showDemo
          ? await fetchDataWithToken(GET_CENTER_LIST + "?test=1", tokens)
          : await fetchDataWithToken(GET_CENTER_LIST, tokens);

        setListData(data.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    getCenterList();
  }, [showDemo]);

  // public get center details
  const publicGetCenterDetails = async (Id) => {
    try {
      const tokens = null;
      const newData = await fetchDataWithToken(
        `${PUBLIC_GET_CENTER_DETAILS}/${Id}`,
        tokens
      );
      const data = newData?.data;
      setStoreCenter(data);
    } catch (error) {
      console.log("error:::::::", error);
    }
  };

  // handale  selection
  const handleDropdownChange = () => {
    if (selectCenterList && storeCenter) {
      try {
        if (AsyncStorage.getItem("Centerdata")) {
          AsyncStorage.setItem("Centerdata", JSON.stringify(storeCenter));
          RNRestart.restart();
        } else {
          AsyncStorage.setItem("Centerdata", JSON.stringify(storeCenter));
          navigation.navigate("Tab");
        }
      } catch (error) {
        console.log("Center async error>>>>>>>>>>>", error);
      }
    }
  };

  // use loader
  if (loading) {
    return <Loader />;
  }
  return (
    <SafeAreaView
      style={{
        backgroundColor: Colors.white,
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <View>
        <TouchableOpacity
          style={{
            marginTop: verticalScale(80),
            justifyContent: "center",
            alignItems: "center",
          }}
          activeOpacity={1}
          delayLongPress={5000}
          onLongPress={() => {
            setShowDemo(true);
          }}
        >
          <Image
            source={require("../AppTheme/Images/logoRound.png")}
            style={styles.image}
          />
        </TouchableOpacity>
        <View
          style={{
            marginVertical: verticalScale(8),
          }}
        >
          <ResponsiveText size="large" fontWeight="700" color={Colors.black}>
            Choose your center
          </ResponsiveText>
        </View>
        <ResponsiveDropdown
          data={listData}
          value={selectCenterList}
          onChange={(item) => {
            publicGetCenterDetails(item?.id);
            setSelectCenterList(item);
            setDisable(false);
          }}
          placeholder="Choose Your Center"
          labelField="center_name"
          valueField="id"
        />
      </View>
      <ResponsiveButton
        label="Next"
        onPress={() => handleDropdownChange()}
        color={Colors.white}
        fontS={16}
        width={scale(320)}
        height={48}
        disabled={disable}
      />
    </SafeAreaView>
  );
};

export default Center;

const styles = StyleSheet.create({
  image: {
    height: 80,
    width: 64,
    resizeMode: "contain",
    alignSelf: "center",
  },
});
