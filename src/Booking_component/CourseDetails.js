import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  Platform,
  SafeAreaView,
} from "react-native";

// All packages
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FastImage from "react-native-fast-image";
import { Dropdown } from "react-native-element-dropdown";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";

// api and base url
import { url, Asseturl } from "../api/Myurl";

import Buttons from "../Button_Component/Buttons";

// Helpers
import { ShowToast, Loader } from "../Helpers";

import { addToCartItem } from "../ReduxToolKit/AddCartSlice.js";

import { Color } from "../Color/Color";

const CourseDetails = (params) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cartItem?.cartItems);
  let handleCheck = false;
  const Data = params?.route?.params?.data;

  const [Center_Id, setCenter_Id] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [batchSessionData, setBatchSessionData] = useState("");
  const [token, setToken] = useState("");
  const [familyList, setFamilyList] = useState("");
  const [selectdFaimaly, setSelectdFaimaly] = useState("");
  const [price, setPrice] = useState("");

  const dateString = Data?.start_batch_booking;
  const timeString = Data?.start_booking_time;

  // Combine date and time into a single string
  const combinedDateTime = `${dateString}T${timeString}`;

  // Create a Date object from the combined date and time
  const currentBatchTime = new Date(combinedDateTime);

  // Compare the combined date and time with the current date and time
  const isDisabled = currentBatchTime <= new Date();

  useEffect(() => {
    const checkLogin = async (isSelected) => {
      try {
        const session = await AsyncStorage.getItem("user_session");
        if (session !== undefined && session !== null) {
          const sessionID = JSON.parse(session)?.data;
          setToken(sessionID?.token);
          getcenterid();
        } else {
          navigation.navigate("Login");
        }
      } catch (error) {
        // There was an error on the native side
      }
    };
    checkLogin();
    calculatePrice();
  }, [isFocused]);
  const calculatePrice = () => {
    if (Data.upfront_installments > 0) {
      let calculate = Data.price * Data.upfront_installments;
      setPrice(calculate);
    }
  };
  const getcenterid = async () => {
    try {
      const centerid = await AsyncStorage.getItem("Centerdata");
      const centerId = JSON.parse(centerid);
      setCenter_Id(centerId);
      publicListBatchSession(centerId?.id);
    } catch (error) {
      console.log("centerId error....");
    }
  };
  // get user Family List use for  members id to booking privateCourseBooking
  const privateGetFamilyList = async () => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);
    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    try {
      const response = await fetch(
        `${url}privateGetFamilyList`,
        requestOptions
      );
      if (response.ok) {
        const data = await response.json();
        setFamilyList(data.data);
        setShowModal(true);
      } else if (response.status === 401) {
        ShowToast("Your token is expired");
        navigation.navigate("Login");
        setShowModal(false);
      } else {
        console.log("Error in else:", response);
      }
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  const checkAge = () => {
    const dob = new Date(selectdFaimaly.dob);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < dob.getDate())
    ) {
      age--;
    }
    if (age < Data?.min_age) {
      ShowToast(
        `The selected member must be at least ${Data?.min_age} years old to enroll in this course.`
      );
      return false;
    }
    return true;
  };

  const product = Data.upfront_installments * Data.price;
  const handleCheckOut = async (handleCheck) => {
    if (!selectdFaimaly) {
      return ShowToast("Please select a member");
    }
    const newItem = {
      id: Data.batch_id,
      type: "Course",
      price: product,
      qty: 1,
      title: Data?.title,
      name: [selectdFaimaly?.name],
      Date: `${Data.start_date}`,
      Time: `${Data?.start_time}`,
      total_session: Data.total_session,
      session_duration: Data?.session_duration,
      amount: product,
      discountPrice: 0,
      member_id: [selectdFaimaly.id],
      assigned_to: [selectdFaimaly?.barcode],
    };

    const alreadyExists = cartItems.some(
      (item) =>
        item.member_id == selectdFaimaly.id &&
        item.id == Data.batch_id &&
        item.title == Data?.title &&
        item.type == "Course"
    );
    if (alreadyExists) {
      ShowToast("This member has already been added to the cart.");
    } else {
      dispatch(addToCartItem(newItem));
      if (handleCheck == true) {
        setShowModal(false);
        setSelectdFaimaly("");
        ShowToast("Item Added  Successfully !");
      } else {
        navigation.navigate("Cart");
        setShowModal(false);
        setSelectdFaimaly("");
        ShowToast("Item Added  Successfully !");
      }
    }
  };
  const publicListBatchSession = async (value) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${url}publicListBatchSession/${value}/${Data?.batch_id}`,
        {
          method: "GET",
          redirect: "follow",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setBatchSessionData(data?.data);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };
  const formatTimeslotDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
      date
    );
    const time = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    const [month, day, year] = formattedDate.split(/\s+/); // Split by whitespace
    return `${day} ${month}, ${year} ${time}`;
  };

  const renderSession = (item) => {
    return (
      <View style={styles.mainview}>
        <View>
          <Text style={styles.text}>
            {formatTimeslotDate(item.item.time_slot)}
          </Text>
          <Text
            style={[
              styles.text,
              {
                fontSize: 16,
                fontWeight: "700",
              },
            ]}
          >
            Duration:{" "}
            <MaterialIcons name="watch-later" style={styles.cardicon} />{" "}
            {item.item.session_duration} minutes
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return <Loader />;
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Color.white }}>
      <View
        style={{ flex: 1, backgroundColor: Color.white, marginHorizontal: 20 }}
      >
        <View style={{ marginBottom: 6 }}>
          <FlatList
            data={batchSessionData}
            keyExtractor={(item, index) => `${item.id}_${index}`}
            showsVerticalScrollIndicator={false}
            renderItem={renderSession}
            ListHeaderComponent={
              <>
                <View
                  style={{
                    marginVertical: 20,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <MaterialIcons
                    onPress={() => navigation.goBack()}
                    name={
                      Platform.OS === "ios" ? "arrow-back-ios" : "arrow-back"
                    }
                    size={25}
                    style={{
                      color: Platform.OS === "ios" ? "#2C66DC" : "black",
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: Color.black,
                      marginRight: 15,
                    }}
                  >
                    {Data.title}
                  </Text>
                  <View />
                </View>
                <View style={{ height: 250 }}>
                  <FastImage
                    source={
                      Data.img === null
                        ? {
                            uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREsW7pOAwEMlyNRZi6atxdltDlT43r2oGdsg&usqp=CAU",
                          }
                        : { uri: `${Asseturl}${Data.img}` }
                    }
                    resizeMode={FastImage.resizeMode.cover}
                    style={{
                      height: "100%",
                      width: "100%",
                      resizeMode: "contain",
                    }}
                  />
                </View>
                <View style={{ marginVertical: 15 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "400",
                      color: Color.gray,
                    }}
                  >
                    {Data.description}
                  </Text>
                </View>
                <View style={{ marginVertical: 5 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "400",
                      color: Color.gray,
                    }}
                  >
                    Total Session -{" "}
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "400",
                        color: Color.black,
                      }}
                    >
                      {Data.total_session} sessions per batch
                    </Text>
                  </Text>
                </View>
                <View style={{ marginVertical: 5 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "400",
                      color: Color.gray,
                    }}
                  >
                    Price -{" "}
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "400",
                        color: Color.black,
                      }}
                    >
                      € {Data.price} per person
                    </Text>
                  </Text>
                </View>
                {Data && Data.upfront_installments > 0 ? (
                  <>
                    <View style={{ marginVertical: 5 }}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "400",
                          color: Color.gray,
                        }}
                      >
                        Upfront Count -{" "}
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "400",
                            color: Color.black,
                          }}
                        >
                          {Data.upfront_installments}
                        </Text>
                      </Text>
                    </View>
                    <View style={{ marginVertical: 5 }}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "400",
                          color: Color.gray,
                        }}
                      >
                        Total Upfront -{" "}
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "400",
                            color: Color.black,
                          }}
                        >
                          {Data.upfront_installments} x {Data.price}
                        </Text>
                      </Text>
                    </View>
                    <View style={{ marginVertical: 5 }}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "400",
                          color: Color.gray,
                        }}
                      >
                        Total Price -{" "}
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "400",
                            color: Color.black,
                          }}
                        >
                          € {product}
                        </Text>
                      </Text>
                    </View>
                  </>
                ) : null}
                <View style={{ marginVertical: 5 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "400",
                      color: Color.gray,
                    }}
                  >
                    Availability -{" "}
                    <MaterialIcons name="person" style={styles.cardicon} />{" "}
                    {Data.enrolled} /{" "}
                    <MaterialIcons name="person" style={styles.cardicon} />{" "}
                    {Data.total_limit}
                  </Text>
                </View>
                {!isDisabled && (
                  <View style={{ marginVertical: 5 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "400",
                        color: Color.red,
                      }}
                    >
                      {`Booking is not available for this batch. Start Date for booking is ${Data?.start_batch_booking} and Time ${Data?.start_booking_time}`}
                    </Text>
                  </View>
                )}

                <Buttons
                  label={"Enroll Now"}
                  onPress={() => {
                    if (!isDisabled) {
                      ShowToast(
                        `Booking is not available for this batch. Start Date for booking is ${Data?.start_batch_booking} and Time ${Data?.start_booking_time}`
                      );
                    } else {
                      privateGetFamilyList();
                    }
                  }}
                  color={Color.white}
                  fontS={22}
                  fontW={"700"}
                  padding={10}
                  marginTop={20}
                  borderRadius={10}
                />
              </>
            }
          />
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={showModal}
          onRequestClose={() => {
            setShowModal(!showModal);
          }}
        >
          <View style={styles.modal}>
            <View
              style={{
                backgroundColor: Color.white,
                borderRadius: 10,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setShowModal(false);
                  setSelectdFaimaly("");
                }}
                style={styles.close}
              >
                <MaterialIcons name="close" size={25} color={Color.black} />
              </TouchableOpacity>
              <View style={styles.Header1}>
                <Text
                  style={{ fontSize: 15, fontWeight: "600", color: "#000000" }}
                >
                  Book Now
                </Text>
              </View>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                itemContainerStyle={{ backgroundColor: "#ffffff" }}
                itemTextStyle={styles.itemTextStyle}
                activeColor={"#FFF2C2"}
                data={familyList}
                maxHeight={300}
                labelField="name"
                valueField="id"
                placeholder={"Choose member"}
                value={selectdFaimaly}
                onChange={(item) => {
                  setSelectdFaimaly(item);
                }}
              />
              <View
                style={{
                  flexDirection: "row",
                  margin: 20,
                  justifyContent: "space-evenly",
                }}
              >
                <Buttons
                  onPress={(isSelected) => {
                    if (checkAge()) {
                      handleCheckOut((handleCheck = true));
                    }
                  }}
                  label={"Add To Cart"}
                  color={Color.white}
                  fontS={18}
                  fontW={"700"}
                  marginHorizontal={20}
                  padding={10}
                  borderRadius={10}
                />
                <Buttons
                  onPress={(isSelected) => {
                    if (checkAge()) {
                      handleCheckOut((handleCheck = false));
                    }
                  }}
                  label={"Book Now"}
                  color={Color.white}
                  fontS={18}
                  fontW={"700"}
                  marginHorizontal={20}
                  padding={10}
                  borderRadius={10}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};
export default CourseDetails;
const styles = StyleSheet.create({
  mainview: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 10,
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#11B8DD",
  },
  text: {
    color: Color.white,
    fontWeight: "600",
    fontSize: 13,
    padding: 2,
  },
  modal: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#00000099",
    padding: 16,
  },
  close: {
    alignItems: "flex-end",
    paddingEnd: 10,
    paddingTop: 10,
  },
  Header1: {
    alignItems: "center",
    paddingEnd: 10,
    paddingBottom: 20,
  },
  dropdown: {
    height: 45,
    marginHorizontal: 25,
    borderWidth: 1,
    borderColor: "#c3c3c3",
    padding: 5,
    borderRadius: 5,
  },
  placeholderStyle: {
    fontSize: 15,
    color: Color.black,
  },
  selectedTextStyle: {
    fontSize: 15,
    color: Color.black,
  },
  itemTextStyle: {
    fontSize: 15,
    color: Color.black, // Text color for dropdown items
  },
  headerCart: {
    marginRight: 15,
    // marginVertical: 10,
    borderRadius: 10,
    padding: 4,
  },
  font: {
    fontSize: 14,
    fontWeight: "bold",
    color: Color.white,
  },
});
