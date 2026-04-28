import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Color } from "../Color/Color";
import Buttons from "../Button_Component/Buttons";
import CartButton from "../Button_Component/CartButton";
import { GiftVoucherModel, CardDefault } from "../component";
import { CartTNCModal } from "../component/CartComponent";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { fetchDataWithToken, sendDataWithToken } from "../api/axiosConfig.js";
import {
  url,
  C_LIST_CUSTOMER_CARD,
  CHECKOUT,
  GET_SETTING,
  GET_CUSTOMER_PROFILE,
  LAST_WEEK_COURSE_BOOKING,
} from "../api/Myurl";

import cartImg from "../Images/cartImg.jpg";
import Visa from "../Images/visa.png";
import Master from "../Images/master.png";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCartItem,
  clearCart,
  updateDiscountPrices,
  setPublishableKey,
} from "../ReduxToolKit/AddCartSlice.js";
import {
  formatTimeSlotDate,
  toDate,
  formatDate,
} from "../Helpers/momentFormatter";
import { confirmPayment, usePlatformPay } from "@stripe/stripe-react-native";

// Helpers
import { ShowToast, Loader } from "../Helpers";

const Cart = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const { isPlatformPaySupported, confirmPlatformPayPayment } =
    usePlatformPay();
  const AllCartData = useSelector((state) => state.cartItem?.cartItems);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [Center, setCenter] = useState("");
  const [cardList, setCardList] = useState("");
  const [defaultCards, setDefaultCards] = useState("");
  const [showModal1, setShowModal1] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visibleTNC, setVisibleTNC] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discountPrice, setDiscountPrice] = useState(0);
  const [totalAmountToPay, setTotalAmountToPay] = useState(0);
  const [totalAmountToPayAgain, setTotalAmountToPayAgain] = useState(0);
  const [voucherAmount, setVoucherAmount] = useState(0);
  const [settingDetails, setSettingDetails] = useState("");
  const [paymentCheck, setPaymentCheck] = useState("");
  const [storeAllGiftVoucher, setStoreAllGiftVoucher] = useState([]);
  const [isApplePaySupported, setIsApplePaySupported] = useState(false);
  const [isGooglePaySupported, setIsGooglePaySupported] = useState(false);

  useEffect(() => {
    gettoken();
    setVoucherAmount(0);
    setStoreAllGiftVoucher([]);
  }, [isFocused]);

  useEffect(() => {
    (async function checkPaymentSupport() {
      try {
        if (Platform.OS === "android") {
          const googlePaySupport = await isPlatformPaySupported({
            googlePay: { testEnv: false }, // Use `false` for live environment
          });
          setIsGooglePaySupported(googlePaySupport);
        } else if (Platform.OS === "ios") {
          const applePaySupport = await isPlatformPaySupported();
          // setIsApplePaySupported(applePaySupport);
        }
      } catch (error) {
        console.log("Error checking payment support:", error);
      }
    })();
  }, []);
  useEffect(() => {
    if (token && AllCartData) {
      getSettingDetails();
    }
  }, [AllCartData, token, isFocused]);

  const getSettingDetails = async () => {
    setLoading(true);
    try {
      const tokens = token;

      // Fetch all course bookings list
      const bookingsListResponse = await fetchDataWithToken(
        LAST_WEEK_COURSE_BOOKING,
        tokens
      );
      const bookingList = bookingsListResponse?.data;

      // Fetch all membership bookings list
      const activeMemberListResponse = await fetchDataWithToken(
        GET_CUSTOMER_PROFILE,
        tokens
      );
      const checkMemberShipStatus = Array.isArray(
        activeMemberListResponse?.data?.membership
      )
        ? activeMemberListResponse?.data?.membership.filter(
            (item) => item.status === "active"
          )
        : [];

      // const checkStatus = checkMemberShipStatus.map(item => item.status);

      // Fetch center settings like child discount and T & C
      const settingsResponse = await fetchDataWithToken(GET_SETTING, tokens);
      const settingDetails = settingsResponse?.data;
      setSettingDetails(settingDetails);

      const discountType = parseInt(settingDetails?.discount_type);
      const discountPer = parseFloat(settingDetails?.discount_percentage);
      const activeMemberShipDis = parseFloat(settingDetails?.active_mem_dis);
      const memberShipDiscountPer = parseFloat(
        settingDetails?.active_mem_value
      );
      // Check if both discountType and discountPer are valid numbers
      if (
        !isNaN(discountType) &&
        !isNaN(discountPer) &&
        !isNaN(activeMemberShipDis) &&
        !isNaN(memberShipDiscountPer)
      ) {
        // Dispatch the combined data
        dispatch(
          updateDiscountPrices({
            discountType,
            discountPer,
            bookingList,
            activeMemberShipDis,
            memberShipDiscountPer,
            checkMemberShipStatus,
          })
        );
      } else if (!isNaN(discountType) && !isNaN(discountPer)) {
        dispatch(
          updateDiscountPrices({
            discountType,
            discountPer,
            bookingList,
          })
        );
      }

      // Calculate the total price if needed
      calculateTotalPrice();
    } catch (error) {
      console.log("Error fetching settings or bookings:", error);
    } finally {
      setLoading(false);
    }
  };
  const gettoken = async () => {
    try {
      const centerid = await AsyncStorage.getItem("Centerdata");
      const centerDetails = JSON.parse(centerid);
      dispatch(setPublishableKey(centerDetails));
      setCenter(centerDetails);
      const session = await AsyncStorage.getItem("user_session");
      if (session !== null) {
        const tokenSession = JSON.parse(session).data;
        setToken(tokenSession?.token);
        listCustomerCard(tokenSession?.token);
      }
    } catch (error) {
      console.log("gettoken error....", error);
    }
  };

  // calculate total cart ------------------------------------------------->
  const calculateTotalPrice = () => {
    let totalPrice = 0;
    let discount = 0;
    let totalAmountToPay = 0;

    AllCartData.forEach((item) => {
      const price = parseFloat(item.price);
      const discountPrice = parseFloat(item.discountPrice);
      const quantity = item.qty;
      totalPrice += price * quantity;
    });
    AllCartData.forEach((item) => {
      if (item.type === "Course") {
        if (item.discountPrice > 0) {
          const price = parseFloat(item.price);
          const discountPrice = parseFloat(item.discountPrice);
          const quantity = item.qty;
          discount += price - discountPrice;
        } else {
          item.discountPrice = 0;
        }
      }
    });
    totalAmountToPay = totalPrice - discount;
    if (voucherAmount != 0 && voucherAmount <= totalAmountToPay) {
      setTotalAmountToPay(totalAmountToPay - voucherAmount);
    } else {
      setTotalAmountToPay(totalAmountToPay);
      setVoucherAmount(0);
      setStoreAllGiftVoucher([]);
    }
    setTotalPrice(totalPrice);
    setDiscountPrice(discount.toFixed(2));
    setTotalAmountToPayAgain(totalAmountToPay);
  };

  //calculate gift  voucher ------------------------------------------------>
  const calculateGiftVoucher = (voucherPayment) => {
    const voucherExist = storeAllGiftVoucher.some(
      (voucher) => voucher?.pay_ref === voucherPayment?.pay_ref
    );

    if (voucherExist) {
      ShowToast("This gift voucher is already added.");
    } else {
      const newTotalVoucher =
        storeAllGiftVoucher.reduce(
          (cal, item) => cal + parseFloat(item.amount),
          0
        ) + parseFloat(voucherPayment.amount);

      if (newTotalVoucher > totalAmountToPayAgain) {
        ShowToast("Gift voucher total exceeds the payable amount.");
      } else {
        setStoreAllGiftVoucher((prev) => {
          const updatedVouchers = [...prev, voucherPayment];

          // Recalculate the remaining amount to pay
          const calculateVoucher = updatedVouchers.reduce(
            (cal, item) => cal + parseFloat(item.amount),
            0
          );
          const calGiftVoucher = totalAmountToPayAgain - calculateVoucher;
          setVoucherAmount(calculateVoucher);
          setTotalAmountToPay(calGiftVoucher);
          setVisible(false);
          return updatedVouchers;
        });
      }
    }
  };

  // check in AllCartData  Course availability
  const CheckoutCourseChecking = AllCartData.filter((item) => {
    return item.type === "Course";
  });

  // pay mode Online
  const AllOnlinePayment = {
    pay_mode: "Online",
    amount: totalAmountToPay,
    pay_ref: "",
  };

  // checkout cart with Card -------------------------------------------------------->
  const CheckoutBookingWithCard = async () => {
    const giftVoucherStatus = [AllOnlinePayment, ...storeAllGiftVoucher];
    const granTotal = discountPrice > 0 ? totalAmountToPay : totalPrice;
    const payable_amount =
      parseFloat(totalAmountToPay) + parseFloat(voucherAmount);

    if (!defaultCards[0] && granTotal !== 0) {
      ShowToast("Please Add Card.");
      return;
    }
    setLoading(true);
    setIsDisabled(true);
    try {
      const cardID = granTotal === 0 ? 0 : defaultCards[0]?.id;
      const tokens = token;
      var formData = new FormData();
      // formData.append('coupon_code', coupan);
      formData.append("cart", JSON.stringify(AllCartData));
      formData.append("card_id", cardID);
      formData.append("payable_amount", payable_amount);
      formData.append("payments", JSON.stringify(giftVoucherStatus));

      const data = await sendDataWithToken(CHECKOUT, tokens, formData);
      if (data?.error === false) {
        if (granTotal > 0) {
          if (data?.data?.payment_details?.requires_action === true) {
            const clientSecret =
              data?.data?.payment_details?.payment_intent?.client_secret;
            setIsDisabled(false);
            setLoading(false);
            await confirmPayment(clientSecret).then((result) => {
              if (result?.paymentIntent?.status === "Succeeded") {
                confirmPaymentStatus(result?.paymentIntent?.id);
              } else if (result.error) {
                //handle failed condition if user cancel
                navigation.navigate("PaymentFailed", {
                  paymentIntent:
                    data?.data?.payment_details?.payment_intent?.id,
                  BookingID: data?.data?.invoice?.id,
                });
              }
            });
          } else {
            navigation.navigate("PaymentSuccess", {
              InvID: data?.data?.invoice?.id,
            });
          }
          cleanupAfterPayment();
        } else {
          navigation.navigate("InvoiceDetails", {
            data: data?.data?.invoice?.id,
          });
          cleanupAfterPayment();
        }
      } else {
        handleCheckoutError(data?.data?.msg);
      }
    } catch (error) {
      handleCheckoutException(error);
    }
  };

  // checkout cart with Google Pay -------------------------------------------------->
  const CheckoutBookingWithGoogle = async () => {
    const giftVoucherStatus = [AllOnlinePayment, ...storeAllGiftVoucher];
    const granTotal = discountPrice > 0 ? totalAmountToPay : totalPrice;
    const payable_amount =
      parseFloat(totalAmountToPay) + parseFloat(voucherAmount);

    if (!defaultCards[0] && granTotal !== 0) {
      ShowToast("Please Add Card.");
      return;
    }
    setLoading(true);
    setIsDisabled(true);
    try {
      const cardID = granTotal === 0 ? 0 : defaultCards[0]?.id;
      const tokens = token;
      var formData = new FormData();
      // formData.append('coupon_code', coupan);
      formData.append("cart", JSON.stringify(AllCartData));
      formData.append("card_id", cardID);
      formData.append("payable_amount", payable_amount);
      formData.append("payments", JSON.stringify(giftVoucherStatus));

      const data = await sendDataWithToken(CHECKOUT, tokens, formData);

      if (data?.error === false) {
        if (granTotal > 0) {
          if (data?.data?.payment_details?.requires_action === true) {
            const clientSecret =
              data?.data?.payment_details?.payment_intent?.client_secret;
            setIsDisabled(false);
            setLoading(false);
            await confirmPlatformPayPayment(clientSecret, {
              googlePay: {
                testEnv: false,
                merchantCountryCode: "IE",
                currencyCode: "EUR",
              },
            }).then((result) => {
              if (result?.paymentIntent?.status === "Succeeded") {
                confirmPaymentStatus(result?.paymentIntent?.id);
              } else if (result.error) {
                //handle failed condition if user cancel
                navigation.navigate("PaymentFailed", {
                  paymentIntent:
                    data?.data?.payment_details?.payment_intent?.id,
                  BookingID: data?.data?.id,
                });
              }
            });
          } else {
            navigation.navigate("PaymentSuccess", {
              InvID: data?.data?.id,
            });
          }
          cleanupAfterPayment();
        } else {
          navigation.navigate("InvoiceDetails", { data: data?.data?.id });
          cleanupAfterPayment();
        }
      } else {
        handleCheckoutError(data?.msg);
      }
    } catch (error) {
      handleCheckoutException(error);
    }
  };
  // checkout cart with Apple Pay -------------------------------------------------->
  const CheckoutBookingWithApple = async () => {
    const giftVoucherStatus = [AllOnlinePayment, ...storeAllGiftVoucher];
    const granTotal = discountPrice > 0 ? totalAmountToPay : totalPrice;
    const payable_amount =
      parseFloat(totalAmountToPay) + parseFloat(voucherAmount);

    if (!defaultCards[0] && granTotal !== 0) {
      ShowToast("Please Add Card.");
      return;
    }
    setLoading(true);
    setIsDisabled(true);
    try {
      const cardID = granTotal === 0 ? 0 : defaultCards[0]?.id;
      const tokens = token;
      var formData = new FormData();
      // formData.append('coupon_code', coupan);
      formData.append("cart", JSON.stringify(AllCartData));
      formData.append("card_id", cardID);
      formData.append("payable_amount", payable_amount);
      formData.append("payments", JSON.stringify(giftVoucherStatus));
      const data = await sendDataWithToken(CHECKOUT, tokens, formData);

      if (data?.error === false) {
        if (granTotal > 0) {
          if (data?.data?.payment_details?.requires_action === true) {
            const clientSecret =
              data?.data?.payment_details?.payment_intent?.client_secret;
            setIsDisabled(false);
            setLoading(false);
            await confirmPlatformPayPayment(clientSecret, {
              applePay: {
                merchantCountryCode: "IE",
                currencyCode: "EUR",
                cartItems: AllCartData.map((item) => ({
                  ...item,
                  paymentType: "Immediate",
                })),
              },
            }).then((result) => {
              if (result?.paymentIntent?.status === "Succeeded") {
                confirmPaymentStatus(result?.paymentIntent?.id);
              } else if (result.error) {
                //handle failed condition if user cancel
                navigation.navigate("PaymentFailed", {
                  paymentIntent:
                    data?.data?.payment_details?.payment_intent?.id,
                  BookingID: data?.data?.id,
                });
              }
            });
          } else {
            navigation.navigate("PaymentSuccess", {
              InvID: data?.data?.id,
            });
          }
          cleanupAfterPayment();
        } else {
          navigation.navigate("InvoiceDetails", { data: data?.data?.id });
          cleanupAfterPayment();
        }
      } else {
        handleCheckoutError(data?.data?.msg);
      }
    } catch (error) {
      handleCheckoutException(error);
    }
  };

  const handleCheckoutError = (message) => {
    ShowToast(message);
    setIsDisabled(false);
    setLoading(false);
    setVisibleTNC(false);
  };
  const handleCheckoutException = (error) => {
    console.log("handleCheckoutException error::::", error?.response);
    if (error.response && error.response.status === 400) {
      ShowToast(error?.response?.data?.msg);
    }
    if (error.response && error.response.status === 401) {
      ShowToast("Your token is expired");
      navigation.navigate("Login");
    } else {
      console.log("Error:", error);
    }
    resetCheckoutState();
  };

  const cleanupAfterPayment = async () => {
    await AsyncStorage.removeItem("CartData");
    dispatch(clearCart());
    setIsDisabled(false);
    setLoading(false);
    stateGiftVoucherClear();
    setVisibleTNC(false);
  };

  const resetCheckoutState = () => {
    setIsDisabled(false);
    setLoading(false);
    setVisibleTNC(false);
  };

  const navigateToPaymentFailed = (data) => {
    navigation.navigate("PaymentFailed", {
      paymentIntent: data?.data?.payment_details?.payment_intent?.id,
      BookingID: data?.data?.id,
    });
  };
  // update  payment when user buy any course and classes
  const confirmPaymentStatus = async (paymentId) => {
    setLoading(true);
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    var formdata = new FormData();
    formdata.append("payment_id", paymentId);
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };
    try {
      const response = await fetch(`${url}updatePaymentStatus`, requestOptions);
      if (response.ok) {
        const data = await response.json();
        if (data?.error === false) {
          navigation.navigate("PaymentSuccess", {
            InvID: data?.data?.id,
          });
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

  // show  all list customer card
  const listCustomerCard = async (token) => {
    try {
      const tokens = token;
      const newData = await fetchDataWithToken(C_LIST_CUSTOMER_CARD, tokens);
      const validData = newData?.data.filter(
        (card) => card !== undefined && card !== null
      );

      const defaultCards = validData.filter((card) => card.is_default === 1);
      if (defaultCards.length > 0) {
        setDefaultCards(defaultCards);
      } else if (validData.length > 0) {
        setDefaultCards([validData[0]]);
      } else {
        setDefaultCards([]);
      }

      setCardList(validData);
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  // remove item in cart
  const handleRemoveItem = (item) => {
    dispatch(removeFromCartItem(item));
  };

  // clear all state  gift voucher
  const stateGiftVoucherClear = () => {
    setVoucherAmount(0);
    setStoreAllGiftVoucher([]);
    setTotalAmountToPay(totalAmountToPayAgain);
  };
  const allCard = (item) => {
    return (
      <TouchableOpacity
        activeOpacity={0.4}
        onPress={() => {
          setDefaultCards([item?.item]);
          setShowModal1(false);
        }}
        style={styles.container}
      >
        <View style={styles.imgContainer}>
          <Image
            source={item?.item?.brand === "visa" ? Visa : Master}
            style={styles.img}
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
  const renderItemCart = ({ item, index }) => {
    return (
      <View
        key={index.toString()}
        style={[
          styles.renderContainer,
          { paddingHorizontal: 20, paddingVertical: 10 },
        ]}
      >
        <View style={{ alignSelf: "center" }}>
          <Text style={styles.fontTitel}>{item?.title}</Text>
          {item?.discountPrice > 0 ? (
            <View style={{ flexDirection: "row" }}>
              <Text
                style={[
                  styles.fontprice,
                  { textDecorationLine: "line-through", marginRight: 5 },
                ]}
              >
                €{item?.price}
              </Text>
              <Text style={styles.fontprice}>€{item?.discountPrice}</Text>
            </View>
          ) : (
            <Text style={styles.fontprice}>€{item?.price}</Text>
          )}
          {item?.time_slot && (
            <Text style={styles.fontTitel}>
              {formatTimeSlotDate(item?.time_slot)}
            </Text>
          )}
          {item?.Date && (
            <Text style={styles.fontTitel}>
              Starting: {formatDate(item?.Date)}
            </Text>
          )}
          {item?.to_time && item?.Time && (
            <Text style={styles.fontTitel}>
              Time Slot: {item?.Time} to {item?.to_time}
            </Text>
          )}
          {item?.session_duration && (
            <Text style={styles.fontTitel}>
              Duration:{" "}
              <MaterialIcons name="watch-later" style={styles.cardicon} />{" "}
              {item?.session_duration} minutes
            </Text>
          )}
          {item?.total_session && (
            <Text style={styles.fontTitel}>Session: {item?.total_session}</Text>
          )}
          {item && item?.receiver_name && item?.receiver_name?.length > 0 ? (
            <View>
              <Text style={[styles.fontTitel, { fontWeight: "bold" }]}>
                {"Assign To:"}
              </Text>
              <Text style={styles.fontTitel}>{item?.receiver_name}</Text>
            </View>
          ) : null}
          {item && item?.name && item?.name?.length > 0 ? (
            <View>
              <Text style={[styles.fontTitel, { fontWeight: "bold" }]}>
                {"Assign To:"}
              </Text>
              {item?.name?.map((item) => {
                return <Text style={styles.fontTitel}>{item}</Text>;
              })}
            </View>
          ) : null}
        </View>
        <View style={styles.add}>
          <TouchableOpacity
            onPress={() => {
              handleRemoveItem(index);
            }}
          >
            <MaterialIcons name="delete" color={"#cb0a0a"} size={20} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  const renderEmptyCartMessage = (cartData) => {
    // Render the empty cart message when the cartData is empty
    return (
      <View style={styles.replace}>
        <Image source={cartImg} style={{ height: 250, width: 250 }} />
        <Text style={styles.replaceText}>{"Your cart is empty"}</Text>
      </View>
    );
  };
  return (
    <View style={styles.header}>
      <SafeAreaView style={styles.inerContainer}>
        {AllCartData.length === 0 ? (
          renderEmptyCartMessage()
        ) : (
          <FlatList
            data={AllCartData}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItemCart}
            ListHeaderComponent={
              <View
                style={{
                  backgroundColor: Color.white,
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                }}
              >
                <Text style={styles.order}>Your Order</Text>
              </View>
            }
            ListFooterComponent={
              <>
                <View style={[styles.Coupon, { marginTop: 10 }]}>
                  <Text style={styles.fontBold}>Bill Summary</Text>
                  <View style={styles.renderContainer}>
                    <Text style={styles.fontTotal}>
                      Item Total X {AllCartData.length}
                    </Text>
                    <Text
                      style={[
                        styles.fontTotal,
                        {
                          fontWeight: "700",
                        },
                      ]}
                    >
                      €{totalPrice}
                    </Text>
                  </View>
                  <View style={styles.dash} />
                  <View style={styles.renderContainer}>
                    <Text style={styles.Amount}>Total</Text>
                    <Text style={styles.Amount}>€{totalPrice}</Text>
                  </View>
                  <View style={styles.renderContainer}>
                    <Text style={styles.fontTotal}>Discount</Text>
                    <Text
                      style={[
                        styles.fontTotal,
                        {
                          fontWeight: "700",
                        },
                      ]}
                    >
                      €{discountPrice}
                    </Text>
                  </View>
                  <View style={styles.renderContainer}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <View>
                        <Text style={styles.fontTotal}>Gift Voucher</Text>
                      </View>
                      <View>
                        <MaterialIcons
                          name="delete"
                          color={"#cb0a0a"}
                          size={20}
                          onPress={() => {
                            stateGiftVoucherClear();
                          }}
                        />
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.fontTotal,
                        {
                          fontWeight: "700",
                        },
                      ]}
                    >
                      €{voucherAmount === 0 ? "0.00" : voucherAmount}
                    </Text>
                  </View>
                  <>
                    <View style={styles.dash} />
                    <View style={styles.renderContainer}>
                      <Text style={styles.Amount}>Grand Total</Text>
                      <Text style={styles.Amount}>€{totalAmountToPay}</Text>
                    </View>
                  </>
                </View>
                {totalAmountToPay > 0 ? (
                  <>
                    {defaultCards && defaultCards.length > 0 ? (
                      <View style={{ backgroundColor: Color.white }}>
                        <Text style={[styles.fontBold, { marginLeft: 20 }]}>
                          {"Selected Card"}
                        </Text>
                        <FlatList
                          data={defaultCards}
                          renderItem={({ item }) => (
                            <CardDefault
                              item={item}
                              onPress={() => setShowModal1(true)}
                            />
                          )}
                          keyExtractor={(item) => item.id.toString()}
                        />
                      </View>
                    ) : (
                      <View style={{ backgroundColor: Color.white }}>
                        <Buttons
                          label={"Add Card"}
                          fontS={16}
                          fontW={"600"}
                          color={"#FFFFFF"}
                          padding={10}
                          borderRadius={10}
                          marginTop={12}
                          paddingVertical={12}
                          paddingHorizontal={15}
                          marginHorizontal={100}
                          marginVertical={10}
                          onPress={() => {
                            navigation.navigate("Payment_method");
                          }}
                        />
                      </View>
                    )}
                  </>
                ) : null}

                <View style={styles.Coupon}></View>
                {totalAmountToPay > 0 ? (
                  <CartButton
                    label={"Apply Gift Voucher"}
                    fontS={14}
                    fontW={"700"}
                    color={"#FFFFFF"}
                    padding={10}
                    borderRadius={10}
                    marginTop={12}
                    paddingHorizontal={20}
                    marginHorizontal={90}
                    onPress={() => {
                      setVisible(true);
                    }}
                  />
                ) : null}
                <CartButton
                  label={
                    totalAmountToPay > 0
                      ? `Pay with Card € ${totalAmountToPay} `
                      : "Proceed"
                  }
                  fontS={20}
                  fontW={"700"}
                  color={"#FFFFFF"}
                  padding={10}
                  borderRadius={10}
                  marginTop={12}
                  disabled={isDisabled}
                  paddingHorizontal={15}
                  marginHorizontal={10}
                  onPress={() => {
                    if (CheckoutCourseChecking.length > 0) {
                      setPaymentCheck("0");
                      setVisibleTNC(true);
                    } else {
                      CheckoutBookingWithCard();
                    }
                  }}
                />
                {totalAmountToPay > 0 ? (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {Platform.OS !== "ios"
                      ? isGooglePaySupported && (
                          <CartButton
                            label={` € ${totalAmountToPay} `}
                            fontS={14}
                            fontW={"600"}
                            color={Color.royalblue}
                            padding={5}
                            borderRadius={10}
                            borderColor={Color.royalblue}
                            borderWidth={1}
                            marginTop={12}
                            disabled={isDisabled}
                            paddingHorizontal={15}
                            marginHorizontal={5}
                            image={require("../Images/googlePay.png")}
                            imageStyle={{ width: 45, height: 35 }}
                            onPress={() => {
                              if (CheckoutCourseChecking.length > 0) {
                                setPaymentCheck("1");
                                setVisibleTNC(true);
                              } else {
                                CheckoutBookingWithGoogle();
                              }
                            }}
                          />
                        )
                      : // : isApplePaySupported && (
                        //     <CartButton
                        //       label={` € ${totalAmountToPay} `}
                        //       fontS={14}
                        //       fontW={'600'}
                        //       color={'#000'}
                        //       padding={5}
                        //       borderRadius={10}
                        //       borderColor={'#00000'}
                        //       borderWidth={1}
                        //       marginTop={12}
                        //       disabled={isDisabled}
                        //       paddingHorizontal={15}
                        //       marginHorizontal={5}
                        //       image={require('../Images/applePay.png')}
                        //       imageStyle={{width: 45, height: 35}}
                        //       onPress={() => {
                        //         if (CheckoutCourseChecking.length > 0) {
                        //           setPaymentCheck('2');
                        //           setVisibleTNC(true);
                        //         } else {
                        //           CheckoutBookingWithApple();
                        //         }
                        //       }}
                        //     />
                        //   )}
                        null}
                  </View>
                ) : null}
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
                          <MaterialIcons
                            name="close"
                            size={25}
                            color={Color.black}
                          />
                        </TouchableOpacity>
                      </View>
                      <FlatList data={cardList} renderItem={allCard} />
                    </View>
                  </View>
                </Modal>
              </>
            }
          />
        )}
        <GiftVoucherModel
          visible={visible}
          handleBack={() => {
            stateGiftVoucherClear();
            setVisible(false);
          }}
          setStoreAllGiftVoucher={calculateGiftVoucher}
        />

        <CartTNCModal
          visibleTNC={visibleTNC}
          tncText={settingDetails?.course_disclaimer}
          handleBack={() => {
            setVisibleTNC(false);
          }}
          handleProceed={() => {
            if (paymentCheck == 0) {
              CheckoutBookingWithCard();
            } else if (paymentCheck == 1) {
              CheckoutBookingWithGoogle();
            } else if (paymentCheck == 2) {
              CheckoutBookingWithApple();
            }
          }}
        />
      </SafeAreaView>
    </View>
  );
};

export default Cart;

const styles = StyleSheet.create({
  replace: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Color.white,
    // marginTop: -20,
  },
  replaceText: {
    fontSize: 18,
    fontWeight: "400",
    color: "#c7c7c7",
  },
  header: {
    backgroundColor: "#F5F5F5",
    height: "100%",
  },
  inerContainer: {
    backgroundColor: "#F5F5F5",
    // marginVertical: 10,
    borderRadius: 10,
    paddingVertical: 10,
    // paddingHorizontal: 20,
  },
  order: {
    color: Color.black,
    fontWeight: "700",
    fontSize: 14,
  },
  Coupon: {
    backgroundColor: Color.white,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  renderContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
  },
  add: {
    height: 35,
    width: 35,
    // marginVertical: 10,
    // marginLeft: '35%',
    // paddingHorizontal: 5,
    // paddingVertical: 2,
    // flexDirection: 'row',
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#cb0a0a",
    backgroundColor: "#f9dbdb",
  },
  fontTitel: { fontSize: 15, fontWeight: "600", color: "#5A5757" },
  fontprice: { fontSize: 13, color: "#323131", fontWeight: "700" },
  fontBold: {
    marginVertical: 10,
    color: Color.black,
    fontWeight: "600",
    fontSize: 14,
  },
  fontTotal: {
    fontWeight: "600",
    fontSize: 13,
    color: "#424141",
    marginVertical: 5,
  },
  Amount: {
    fontWeight: "700",
    fontSize: 15,
    color: Color.black,
    marginVertical: 5,
  },
  dash: {
    borderColor: Color.black,
    borderWidth: 0.5,
    borderStyle: "dashed",
    marginVertical: 10,
  },
  modal: {
    flex: 1,
    justifyContent: "center",
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
});
