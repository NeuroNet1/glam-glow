import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Color } from "../Color/Color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { url } from "../api/Myurl";
import Visa from "../Images/visa.png";
import Master from "../Images/master.png";
import Button from "../Button_Component/Buttons";
import { confirmPayment } from "@stripe/stripe-react-native";

//Helpers
import { ShowToast, Loader } from "../Helpers";

const SubscriptionDetails = (params) => {
  const ID = params?.route?.params?.data;
  const [cards, setCards] = useState([]);
  const [cardList, setCardList] = useState([]);
  const [showModal1, setShowModal1] = useState(false);
  const [token, setToken] = useState("");
  const [subscriptionData, setSubscriptionData] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  useEffect(() => {
    gettoken();
  }, []);

  useEffect(() => {
    if (token && subscriptionData) {
      listCustomerCard(token);
    }
  }, [token, subscriptionData]);

  const gettoken = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");
      if (session !== null) {
        const tokenSession = JSON.parse(session).data;
        setToken(tokenSession?.token);
        getMembershipdata(tokenSession?.token);
      }
    } catch (error) {
      console.log("gettoken error....", error);
    }
  };
  // Format the date as "dd-mm-yyyy =========== >
  const displaDate = (dateElement) => {
    const date = new Date(dateElement); // Replace this with your date object
    // Format the date as "dd-mm-yyyy"
    const formattedDate = date.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return formattedDate;
  };

  // Cancel Alert for Subscription cancel =========== >
  const verifyCancel = () =>
    Alert.alert(
      "Subscription Cancel",
      "Are you sure you want to cancel your subscription?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            cancelSubscription();
          },
        },
      ]
    );

  // Cancel Membership Details =========== >
  const getMembershipdata = (sessionID) => {
    setLoading(true);
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${sessionID}`);
    const formData = new FormData();
    formData.append("membership_id", ID);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formData,
      redirect: "follow",
    };
    fetch(`${url}getMembershipdata`, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        const newData = JSON.parse(result);
        if (newData.error === false) {
          setSubscriptionData(newData?.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.log("error", error);
      });
  };
  // change card Details =========== >
  const changeCard = (card_id) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);
    const formData = new FormData();
    formData.append("subscription_id", subscriptionData?.subscription_id);
    formData.append("membership_id", subscriptionData?.id);
    formData.append("card_id", card_id);
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formData,
      redirect: "follow",
    };
    fetch(`${url}changeSubscriptionPaymentMethod`, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        const newData = JSON.parse(result);
        if (newData.error === false) {
          setShowModal1(false);
          ShowToast(newData?.msg);
          getMembershipdata(token);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };
  // Cancel Subscription =========== >
  const cancelSubscription = () => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);
    const formData = new FormData();
    formData.append("subscription_id", subscriptionData?.subscription_id);
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formData,
      redirect: "follow",
    };
    fetch(`${url}cancelSubscriptionpayment`, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        const newData = JSON.parse(result);
        if (newData.error === false) {
          getMembershipdata(token);
          ShowToast(newData?.msg);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };
  // list customer card Details =========== >
  const listCustomerCard = (sessionID) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${sessionID}`);
    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    fetch(`${url}clistCustomerCard`, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        const newData = JSON.parse(result);
        const defaultCards = newData?.data.filter(
          (card) => card?.id === subscriptionData?.subscription?.cust_card_id
        );
        setCards(defaultCards);
        setCardList(newData?.data);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };
  // Cancel update Subscription Payment Details =========== >
  const updateSubscriptionPayment = async () => {
    try {
      setLoading(true);
      var myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);
      const formData = new FormData();
      formData.append(
        "payment_id",
        subscriptionData?.failed_payment?.payment_intent
      );
      formData.append(
        "payment_intent",
        subscriptionData?.failed_payment?.client_secret
      );
      formData.append("card_id", subscriptionData?.subscription?.cust_card_id);
      formData.append("subs_id", subscriptionData?.subscription_id);
      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formData,
        redirect: "follow",
      };
      const response = await fetch(
        `${url}updateSubscriptionPayment`,
        requestOptions
      );
      const result = await response.text();
      const newData = JSON.parse(result);

      if (newData.error === false) {
        if (newData?.requires_action === true) {
          const clientSecret = newData?.client_secret;
          await confirmPayment(clientSecret).then((result) => {
            if (result?.paymentIntent?.status === "Succeeded") {
              statusUpdate();
              setLoading(false);
            } else if (result.error) {
              ShowToast(result.error.code);
              setLoading(false);
            }
          });
        } else {
          setLoading(false);
          statusUpdate();
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log("error", error);
    }
  };
  const statusUpdate = async () => {
    try {
      setLoading(true);
      var myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);
      const formData = new FormData();
      formData.append(
        "payment_id",
        subscriptionData?.failed_payment?.payment_intent
      );
      formData.append(
        "payment_intent",
        subscriptionData?.failed_payment?.client_secret
      );
      formData.append("subs_id", subscriptionData?.subscription_id);
      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formData,
        redirect: "follow",
      };
      const response = await fetch(
        `${url}updateSubscriptionPayment`,
        requestOptions
      );
      const result = await response.text();
      const newData = JSON.parse(result);
      if (newData.error === false) {
        setLoading(false);
        getMembershipdata(token);
        ShowToast(newData.msg);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };
  const retryPayment = async () => {
    try {
      setLoading(true);
      const newData = subscriptionData?.failed_payment?.client_secret;
      await confirmPayment(newData).then((result) => {
        if (result?.paymentIntent?.status === "Succeeded") {
          statusUpdate(result?.paymentIntent?.id);
          setIsSelected(false);
          setLoading(false);
        } else if (result.error) {
          setLoading(false);
          setIsSelected(true);
        }
      });
    } catch (error) {
      setLoading(false);
      console.log("Error in useEffect:", error);
    }
  };

  if (loading) {
    return <Loader />;
  }
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.container10}>
        <View style={styles.mainview}>
          <View
            style={{
              backgroundColor: "#0573BB",
              padding: 6,
              width: 60,
              height: 60,
              borderRadius: 60 / 2,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              style={styles.profileimage}
              source={require("../Images/membership.png")}
            />
          </View>
          <View style={{ justifyContent: "center", marginStart: 20 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#000000",
              }}
            >
              {subscriptionData?.package_title}
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#1049CE",
              }}
            >
              €{subscriptionData?.price}
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "400",
                color: "#848485",
              }}
            >
              Purchase date - {displaDate(subscriptionData?.created_date)}
            </Text>
          </View>
        </View>
        {subscriptionData && subscriptionData?.classes.length > 0 ? (
          <View>
            <Text style={[styles.txt1, { marginVertical: 6, fontSize: 14 }]}>
              Included services
            </Text>
            <Text style={styles.TextColor1}>
              {"[ "}
              {subscriptionData?.classes}
              {" ]"}
            </Text>
          </View>
        ) : null}
        <Text style={[styles.txt1, { marginVertical: 10, fontSize: 14 }]}>
          Membership Details
        </Text>
        {subscriptionData?.frequency && (
          <View style={styles.detailsContainer}>
            <Text style={styles.TextColor}>Plan Duration</Text>
            <Text style={styles.TextColor1}>{subscriptionData?.frequency}</Text>
          </View>
        )}
        <View style={styles.detailsContainer}>
          <Text style={styles.TextColor}>Assigned Members</Text>
          <Text style={styles.TextColor1}>
            {subscriptionData?.assigned_names}
          </Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.TextColor}>Status</Text>
          <Text
            style={[
              styles.TextColor1,
              {
                color:
                  subscriptionData?.status === "active" ? "#1049CE" : "#ff0000",
              },
            ]}
          >
            {subscriptionData?.status}
          </Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.TextColor}>Price Group</Text>
          <Text style={styles.TextColor1}>
            {subscriptionData?.price_group}
            {" ("}
            {subscriptionData?.occupant_count}
            {"Person)"}
          </Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.TextColor}>Package Type</Text>
          <Text style={styles.TextColor1}>
            {subscriptionData?.subscription_id > 0 ? "Subscription" : "Fixed"}
          </Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.TextColor}>Start Date</Text>
          <Text style={styles.TextColor1}>
            {displaDate(subscriptionData?.start_date)}
          </Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.TextColor}>Expiry Date</Text>
          <Text style={styles.TextColor1}>
            {displaDate(subscriptionData?.expiry_date)}
          </Text>
        </View>
      </View>
      {subscriptionData?.subscription_id > 0 ? (
        <View style={styles.container10}>
          <Text style={[styles.txt1, { marginVertical: 10, fontSize: 14 }]}>
            Payment Details
          </Text>
          <View style={styles.detailsContainer}>
            <Text style={styles.TextColor}>Frequency</Text>
            <Text style={styles.TextColor1}>
              {subscriptionData?.subscription?.frequency}
            </Text>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.TextColor}>Start Date</Text>
            <Text style={styles.TextColor1}>
              {displaDate(subscriptionData?.start_date)}
            </Text>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.TextColor}>Expiry Date</Text>
            <Text style={styles.TextColor1}>
              {displaDate(subscriptionData?.expiry_date)}
            </Text>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.TextColor}>Next Due Date</Text>
            <Text style={styles.TextColor1}>
              {displaDate(subscriptionData?.subscription?.next_run_date)}
            </Text>
          </View>
          {cards && cards.length > 0 ? (
            <View style={{ backgroundColor: Color.white }}>
              <Text style={[styles.txt1, { fontSize: 14 }]}>
                {"Card Details"}
              </Text>
              {cards.map((card, index) => (
                <View key={index} style={styles.container}>
                  <View style={styles.imgContainer}>
                    <Image
                      source={card?.brand === "visa" ? Visa : Master}
                      style={styles.img}
                    />
                  </View>
                  <View style={styles.expiryContainer}>
                    <View style={{ justifyContent: "center" }}>
                      <Text style={styles.text}>
                        ************{card?.card_number}
                      </Text>
                      <Text style={styles.text}>Expiry Date</Text>
                      <Text style={styles.text}>
                        {card?.month}/{card?.year}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.editContainer}>
                    <MaterialIcons
                      name="more-vert"
                      onPress={() => {}}
                      size={25}
                      style={{ marginTop: 10, color: Color.blue }}
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      <>
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
                    // setdob('');
                  }}
                  style={styles.close}
                >
                  <MaterialIcons name="close" size={25} color={Color.black} />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {cardList.map((card, index) => (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.4}
                    onPress={() => {
                      changeCard(card?.id);
                    }}
                    style={styles.container}
                  >
                    <View style={styles.imgContainer}>
                      <Image
                        source={card?.brand === "visa" ? Visa : Master}
                        style={styles.img}
                      />
                    </View>
                    <View style={styles.expiryContainer}>
                      <View style={{ justifyContent: "center" }}>
                        <Text style={styles.text}>
                          ************{card?.card_number}
                        </Text>
                        <Text style={styles.text}>Expiry Date</Text>
                        <Text style={styles.text}>
                          {card?.month}/{card?.year}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </>

      {subscriptionData?.subscription_id > 0 &&
        subscriptionData?.subscription?.status !== "cancelled" && (
          <View style={{ flexDirection: "row", marginVertical: 10 }}>
            <Button
              onPress={() => {
                verifyCancel();
              }}
              label={"Cancel Subscription"}
              color={Color.white}
              fontS={18}
              fontW={"700"}
              marginHorizontal={20}
              padding={10}
              borderRadius={10}
            />
            <Button
              onPress={() => {
                setShowModal1(true);
              }}
              label={"Change Card"}
              color={Color.white}
              fontS={18}
              fontW={"700"}
              marginHorizontal={20}
              padding={10}
              borderRadius={10}
            />
          </View>
        )}
      {subscriptionData?.subscription_id > 0 &&
        subscriptionData?.subscription?.status != "cancelled" &&
        subscriptionData?.failed_payment != null && (
          <View style={{ marginVertical: 15 }}>
            <Button
              onPress={() => {
                if (isSelected === false) {
                  retryPayment();
                } else {
                  updateSubscriptionPayment();
                }
              }}
              label={"Retry Payment"}
              color={Color.white}
              fontS={18}
              fontW={"700"}
              marginHorizontal={20}
              padding={10}
              borderRadius={10}
            />
          </View>
        )}
    </ScrollView>
  );
};

export default SubscriptionDetails;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    // paddingHorizontal: 20,
  },
  text: {
    color: "#555454",
    fontWeight: "600",
    fontSize: 12,
  },
  containerTxt: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  txtContainer: {
    width: "25%",
    justifyContent: "center",
  },
  txt: { fontSize: 11, fontWeight: "600", color: "#535353" },
  txt1: { fontSize: 12, fontWeight: "600", color: "#000000" },
  mainview: {
    backgroundColor: "#EAF7FF",
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
    borderWidth: 0.2,
    borderColor: Color.grey,
    flexDirection: "row",
  },
  profileimage: {
    width: 40,
    height: 40,
    padding: 10,
    marginVertical: 4,
    tintColor: "#ffffff",
  },
  TextColor: {
    fontSize: 14,
    fontWeight: "400",
    color: "#535353",
  },
  TextColor1: {
    fontSize: 14,
    fontWeight: "400",
    color: "#000000",
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
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
  imgContainer: {
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
  img: { height: "80%", width: "80%", resizeMode: "contain" },
  expiryContainer: {
    flex: 1,
    flexDirection: "row",
    paddingStart: 10,
  },
  editContainer: {
    flex: 1 / 5,
    justifyContent: "center",
    alignItems: "center",
  },
  container10: {
    backgroundColor: "#ffffff",
    marginHorizontal: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    elevation: 10,
    marginTop: 10,
  },
  modal: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#00000056",
    padding: 16,
  },
});
