import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
} from "react-native";
import { confirmPayment } from "@stripe/stripe-react-native";
import React, { useEffect, useState } from "react";
import { Color } from "../Color/Color";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  url,
  PRIVATE_UPCOMING_BOOKING,
  CANCEL_INVOICE,
  GET_FAILED_SUBSCRIPTION_PAYMENT,
  C_LIST_CUSTOMER_CARD,
  UPDATE_PAYMENT_STATUS,
  PUBLIC_GET_CENTER_DETAILS,
} from "../api/Myurl";
import Visa from "../Images/visa.png";
import Master from "../Images/master.png";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import DeviceInfo from "react-native-device-info";
import { fetchDataWithToken } from "../api/axiosConfig.js";
import { setPublishableKey } from "../ReduxToolKit/AddCartSlice.js";
import { showAlert, hideAlert } from "../ReduxToolKit/AlertSlice.jsx";
import Banner from "../homeComponent/banner.jsx";
import PendingMembershipPayment from "../homeComponent/pendingMembershipPayment.jsx";
import PendingCoursePayment from "../homeComponent/pendingCoursePayment.jsx";
import UpcomingBookingItem from "../homeComponent/upcomingBookingList.jsx";
import { PaymentCheckAlertBox } from "../paymentCheck/paymentCheckAlertBox.js";
import { AlertModal } from "../component/ModalScreen/AlertModal.jsx";

// Helpers
import { Loader } from "../Helpers";
import HomeServices from "../homeComponent/HomeServices";
import { checkAppVersion } from "../component/Hooks/checkAppVersion";
import useHandleBackPress from "../component/Hooks/useBackHandler";

const Home = () => {
  useHandleBackPress();
  const currentVersion = DeviceInfo.getVersion();

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const [TOKEN, setTOKEN] = useState();
  const [loading, setLoading] = useState(false);
  const [upcomingList, setUpcomingList] = useState("");
  const [update, setUpdate] = useState("");
  const [pendingPaymentMembership, setPendingPaymentMembership] = useState("");
  const [pendingPaymentCourse, setPendingPaymentCourse] = useState("");
  const [pendingPayment, setPendingPayment] = useState("");
  const [cardList, setCardList] = useState("");
  const [defaultCards, setDefaultCards] = useState("");
  const [showModal1, setShowModal1] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const centerData = await AsyncStorage.getItem("Centerdata");
        const sessionData = await AsyncStorage.getItem("user_session");

        if (centerData) {
          const center = JSON.parse(centerData);
          publicGetCenterDetails(center?.id);
        }

        if (sessionData) {
          const userSession = JSON.parse(sessionData);
          setTOKEN(userSession?.data?.token);
        }
      } catch (error) {
        console.log("Initialization error:", error);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    checkAppVersion(update, currentVersion);
  }, [update]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (!TOKEN) return;
    privateUpcomingBooking();
    if (isFocused) {
      getfailedSubscriptionPayment();
    }
  }, [TOKEN, isFocused]);

  const cancelInvoice = async (item) => {
    const FormData = require("form-data");
    let data = new FormData();
    data.append("invoice_id", item);

    try {
      const response = await fetch(`${url}${CANCEL_INVOICE}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}` },
        redirect: "follow",
        body: data,
      });
      if (response.ok) {
        const data = await response.json();
        getfailedSubscriptionPayment();
      } else if (response.status === 401) {
        console.log("response::::::", response);
      }
    } catch (error) {
      console.log("error;:;::", error);
    }
  };

  // public get center details
  const publicGetCenterDetails = async (Id) => {
    try {
      const tokens = null;
      const newData = await fetchDataWithToken(
        `${PUBLIC_GET_CENTER_DETAILS}/${Id}`,
        tokens
      );
      setUpdate(newData?.data || {});
      dispatch(setPublishableKey(newData?.data));
    } catch (error) {
      console.log("error:::::::", error);
    }
  };

  const privateUpcomingBooking = async () => {
    setLoading(true);
    try {
      const tokens = TOKEN;
      const newData = await fetchDataWithToken(
        PRIVATE_UPCOMING_BOOKING,
        tokens
      );
      setUpcomingList(newData.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const getfailedSubscriptionPayment = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${url}${GET_FAILED_SUBSCRIPTION_PAYMENT}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}` },
      });

      if (!response.ok) {
        setLoading(false);
        setTimeLeft(0);
        return;
      }

      const data = await response.json();
      setPendingPayment(data?.pending_data || []);

      const failedMembership =
        data?.data?.filter((m) => m?.subs_type === "membership") || [];

      const failedCourse =
        data?.data?.filter((m) => m?.subs_type === "course") || [];

      setPendingPaymentMembership(failedMembership);
      setPendingPaymentCourse(failedCourse);

      // Only fetch cards if there are pending payments
      if (data?.pending_data?.length > 0) {
        await listCustomerCard();
        setTimeLeft(10 * 60);
        dispatch(showAlert());
      } else {
        dispatch(hideAlert());
        setTimeLeft(0);
      }

      setLoading(false);
    } catch (error) {
      console.log("Failed Payment Fetch Error:", error);
      setTimeLeft(0);
      setLoading(false);
    }
  };

  const listCustomerCard = async () => {
    try {
      const response = await fetch(`${url}${C_LIST_CUSTOMER_CARD}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${TOKEN}` },
      });

      const result = await response.json();
      const defaultList = result?.data?.filter((c) => c.is_default === 1);

      setDefaultCards(defaultList.length ? defaultList : result.data);
      setCardList(result.data);
    } catch (err) {
      console.log("Card Fetch Error:", err);
    }
  };

  const updatePaymentStatus = async (payment_intent) => {
    setLoading(true);
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${TOKEN}`);

    var formdata = new FormData();
    formdata.append("payment_id", payment_intent);
    formdata.append("card_id", defaultCards[0].id);
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };
    try {
      const response = await fetch(
        `${url}${UPDATE_PAYMENT_STATUS}`,
        requestOptions
      );
      const data = await response.json();
      setLoading(false);
      if (data?.error === false) {
        if (data?.requires_action === true) {
          const newData = data?.client_secret;
          await confirmPayment(newData).then((result) => {
            if (result?.paymentIntent?.status === "Succeeded") {
              confirmPaymentStatus(result?.paymentIntent?.id);
            } else if (result.error) {
              setLoading(false);
            }
          });
        } else {
          dispatch(hideAlert());
          setLoading(false);
          navigation.navigate("PaymentSuccess", {
            InvID: data?.data?.id,
          });
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log("Error:", error.message);
    }
  };
  const confirmPaymentStatus = async (paymentId) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${TOKEN}`);

    var formdata = new FormData();
    formdata.append("payment_id", paymentId);
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };
    try {
      const response = await fetch(
        `${url}${UPDATE_PAYMENT_STATUS}`,
        requestOptions
      );
      if (response.ok) {
        const data = await response.json();
        dispatch(hideAlert());
        if (data?.error === false) {
          navigation.navigate("PaymentSuccess", {
            InvID: data?.data?.id,
          });
          setLoading(false);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log("Error:", error.message);
    }
  };

  const allCard = (item) => {
    return (
      <TouchableOpacity
        activeOpacity={0.4}
        onPress={() => {
          setDefaultCards([item?.item]);
          dispatch(showAlert());
          setShowModal1(false);
        }}
        style={styles.container}
      >
        <View style={styles.imgContainer2}>
          <Image
            source={item?.item?.brand === "visa" ? Visa : Master}
            style={styles.img2}
          />
        </View>
        <View style={styles.expiryContainer}>
          <View style={{ justifyContent: "center" }}>
            <Text
              style={{
                color: Color.black,
              }}
            >
              ************{item?.item?.card_number}
            </Text>
            <Text
              style={{
                color: Color.black,
              }}
            >
              Expiry Date
            </Text>
            <Text
              style={{
                color: Color.black,
              }}
            >
              {item?.item?.month}/{item?.item?.year}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <Loader />;
  }
  return (
    <SafeAreaView style={styles.containerMain}>
      <FlatList
        data={upcomingList}
        renderItem={({ item }) => <UpcomingBookingItem item={item} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {update?.setting_status == "active" && (
              <AlertModal announcementMsg={update?.announcement_msg} />
            )}
            <Banner />
            <View style={{ paddingHorizontal: 22 }}>
              {pendingPaymentMembership.length > 0 && (
                <PendingMembershipPayment
                  pendingPaymentMembership={pendingPaymentMembership}
                />
              )}
              {pendingPaymentCourse.length > 0 && (
                <PendingCoursePayment
                  pendingPaymentCourse={pendingPaymentCourse}
                />
              )}
              <Text style={styles.txtHeader}>Services</Text>
              {update && update?.modules && (
                <HomeServices storeModules={update?.modules} />
              )}
              {upcomingList && upcomingList.length > 0 ? (
                <Text style={styles.txtHeader}>Upcoming Bookings</Text>
              ) : null}
            </View>
          </>
        }
      />

      <Modal
        // animationType="slide"
        transparent={true}
        visible={showModal1}
        onRequestClose={() => {
          setShowModal1(!showModal1);
        }}
      >
        <View style={styles.modal}>
          <View
            style={{
              backgroundColor: Color.white,
              borderRadius: 10,
              height: "80%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginHorizontal: 8,
                marginVertical: 10,
                borderBottomWidth: 1,
              }}
            >
              <View style={styles.close} />
              <Text
                style={[
                  styles.TextStyle,
                  {
                    fontSize: 14,
                    color: Color.black,
                  },
                ]}
              >
                {"Select Card"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowModal1(false);
                  dispatch(showAlert());
                  // setdob('');
                }}
                style={styles.close}
              >
                <MaterialIcons name="close" size={25} color={Color.black} />
              </TouchableOpacity>
            </View>
            <FlatList data={cardList} renderItem={allCard} />
          </View>
        </View>
      </Modal>
      <PaymentCheckAlertBox
        pendingPayment={pendingPayment}
        handleCancel={cancelInvoice}
        defaultCards={defaultCards}
        cardList={cardList}
        timeLeft={timeLeft}
        showAllCard={() => {
          setShowModal1(true);
          dispatch(hideAlert());
        }}
        handlePay={updatePaymentStatus}
      />
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  containerMain: {
    backgroundColor: Color.white,
    flex: 1,
  },
  txtHeader: {
    color: Color.black,
    padding: 5,
    fontWeight: "700",
    fontSize: 16,
  },
  imgContainer: {
    height: 55,
    width: 55,
    borderRadius: 55 / 2,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginStart: 20,
  },
  modal: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#00000056",
    padding: 16,
  },
  container: {
    height: 100,
    width: "100%",
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: Color.lightgray,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
  },
  imgContainer2: {
    flex: 1 / 3,
    margin: 10,
    borderColor: Color.lightgray,
    backgroundColor: Color.white,
    elevation: 5,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  img2: { height: "80%", width: "80%", resizeMode: "contain" },
  expiryContainer: {
    flex: 1,
    flexDirection: "row",
    paddingStart: 10,
  },
});
