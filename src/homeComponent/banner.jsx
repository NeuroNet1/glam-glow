import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";

import { ImageSlider } from "react-native-image-slider-banner";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useIsFocused } from "@react-navigation/native";

import { Color } from "../Color/Color";

import { fetchDataWithToken } from "../api/axiosConfig.js";
import { GET_BANNERS, Asseturl } from "../api/Myurl";

export default Banner = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [banner, setBanner] = useState([]);
  const [bannerData, setBannerData] = useState([]);

  useEffect(() => {
    const gettoken = async () => {
      try {
        const centerid = await AsyncStorage.getItem("Centerdata");
        getBanners(JSON.parse(centerid).id);
      } catch (error) {
        console.log("token error....", error);
      }
    };
    gettoken();
  }, [isFocused]);

  const getBanners = async (Id) => {
    try {
      const tokens = null;
      const newData = await fetchDataWithToken(`${GET_BANNERS}/${Id}`, tokens);
      const newBanner = newData?.data.map((item) => ({
        img: `${Asseturl}${item.path}`,
      }));
      setBannerData(newData?.data);
      setBanner(newBanner);
    } catch (error) {
      console.log("error::::::::", error);
    }
  };

  const handelBannerClick = (press) => {
    const clickedItem = bannerData[press];
    if (clickedItem) {
      clickedItem.module_type === "class"
        ? navigation.navigate("Bookings", {
            screen: "Classes",
          })
        : clickedItem.module_type === "membership"
        ? navigation.navigate("Bookings", {
            screen: "Membership",
          })
        : clickedItem.module_type === "payg"
        ? navigation.navigate("Bookings", {
            screen: "PAYG",
          })
        : clickedItem.module_type === "pt"
        ? navigation.navigate("Bookings", {
            screen: "PT",
          })
        : clickedItem.module_type === "pool"
        ? navigation.navigate("Bookings", {
            screen: "PoolBooking",
          })
        : clickedItem.module_type === "venue"
        ? navigation.navigate("Bookings", {
            screen: "VenueBooking",
          })
        : clickedItem.module_type === "course"
        ? navigation.navigate("Bookings", {
            screen: "CourseBooking",
          })
        : clickedItem.module_type === "gift_voucher"
        ? navigation.navigate("GiftScreen")
        : null;
    }
  };

  return (
    <View style={{ marginTop: -15 }}>
      {banner && banner.length > 0 ? (
        <ImageSlider
          style={styles.bannerStyle}
          data={banner}
          autoPlay={true}
          timer={6000}
          // localImg
          preview={false}
          onClick={(item, index) => {
            handelBannerClick(index);
          }}
        />
      ) : (
        <View
          style={[
            styles.bannerStyle,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <MaterialIcons
            name="image-not-supported"
            size={45}
            style={{ color: Color.silver }}
          />
          <Text style={[styles.txtHeader, { color: Color.silver }]}>
            {"There is no banner"}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bannerStyle: {
    width: "auto",
    borderRadius: 10,
    height: 200,
  },
  txtHeader: {
    color: Color.black,
    padding: 5,
    fontWeight: "700",
    fontSize: 16,
  },
});
