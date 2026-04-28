import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
} from "react-native";
import React, { useState, useEffect } from "react";

import {
  useNavigation,
  useRoute,
  useIsFocused,
} from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";

import { MembershipCard } from "../component/membershipComponent";
import BookingBtn from "./Booking";
import Buttons from "../Button_Component/Buttons";

//Helpers
import { Loader } from "../Helpers";

import { fetchDataWithToken } from "../api/axiosConfig.js";
import { PUBLIC_LIST_MEMBERSHIP_PACKAGE } from "../api/Myurl.js";
import { setPublishableKey } from "../ReduxToolKit/AddCartSlice.js";

import { Color } from "../Color/Color";

const Membership = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const route = useRoute();
  const dispatch = useDispatch();

  const [defaultModule] = useState("membership");
  const [loading, setLoading] = useState(false);
  const [membershipData, setMembershipData] = useState();

  useEffect(() => {
    const centerID = async () => {
      try {
        const centerId = await AsyncStorage.getItem("Centerdata");
        const centerDetails = JSON.parse(centerId);
        dispatch(setPublishableKey(centerDetails));
        publicListMembershipPackage(centerDetails?.id);
      } catch (error) {
        console.log("token error....");
      }
    };
    centerID();
  }, [route, isFocused]);

  const publicListMembershipPackage = async (value) => {
    setLoading(true);
    try {
      const Token = null;
      const data = await fetchDataWithToken(
        `${PUBLIC_LIST_MEMBERSHIP_PACKAGE}/${value}`,
        Token
      );
      setMembershipData(data.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const handlePress = (item) => {
    navigation.navigate("MembershipCart", { data: item });
  };
  return (
    <SafeAreaView style={{ backgroundColor: Color.white, height: "100%" }}>
      <BookingBtn defaultModule={defaultModule} />
      <View
        style={{
          flex: 1,
          margin: 20,
        }}
      >
        {membershipData && membershipData.length > 0 ? (
          <FlatList
            data={membershipData}
            numColumns={2}
            keyExtractor={(item, index) => `${item.id}_${index}`}
            renderItem={({ item }) => (
              <MembershipCard item={item} onPress={handlePress} />
            )}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Text style={styles.noResultsText}>Membership is not available.</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Membership;

const styles = StyleSheet.create({
  noResultsText: {
    fontSize: 14,
    marginTop: 10,
    color: Color.black,
    textAlign: "center",
  },
});
