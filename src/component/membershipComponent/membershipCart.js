import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Modal,
  Image,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";

import {
  useNavigation,
  useRoute,
  useIsFocused,
} from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { MultiSelect } from "react-native-element-dropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  confirmPayment,
  PlatformPayButton,
  usePlatformPay,
} from "@stripe/stripe-react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { CardDefault, GiftVoucherModel } from "../../component";
import Buttons from "../../Button_Component/Buttons";
import CartButton from "../../Button_Component/CartButton";

import {
  fetchDataWithToken,
  sendDataWithToken,
} from "../../api/axiosConfig.js";
import {
  PRIVATE_GET_FAMILY_LIST,
  C_LIST_CUSTOMER_CARD,
  PRIVATE_MEMBERSHIP_PURCHASE,
  UPDATE_PAYMENT_STATUS,
  url,
  GET_SETTING,
} from "../../api/Myurl.js";

// Helpers
import { ShowToast, Loader } from "../../Helpers";

import { Color } from "../../Color/Color.js";
import Visa from "../../Images/visa.png";
import Master from "../../Images/master.png";
import CalendarFill from "../../Images/calendar.png";

const minimumDate = new Date();
const maximumDate = new Date();
maximumDate.setDate(maximumDate.getDate() + 45);

const MembershipCart = (params) => {
  const data = params?.route?.params?.data;
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { isPlatformPaySupported, confirmPlatformPayPayment } =
    usePlatformPay();

  const [isPressed, setIsPressed] = useState(null);
  const [price, setPrice] = useState("0.00");
  const [priceDetails, setPriceDetails] = useState("");
  const [show, setShow] = useState("");
  const [Center_Id, setCenter_Id] = useState("");
  const [token, setToken] = useState();
  const [Data, setData] = useState([]);
  const [cardList, setCardList] = useState("");
  const [defaultCards, setDefaultCards] = useState("");
  const [value, setValue] = useState("");
  const [valueData, setValueData] = useState("");
  const [showModal1, setShowModal1] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [discountPriceAgain, setDiscountPriceAgain] = useState(0);
  const [totalAmountToPay, setTotalAmountToPay] = useState("0.00");
  const [totalAmountToPayAgain, setTotalAmountToPayAgain] = useState(0);
  const [voucherAmount, setVoucherAmount] = useState(0);
  const [onlineAmount, setOnlineAmount] = useState(null);
  const [statusOnline, setStatusOnline] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [allSettings, setAllSettings] = useState("");
  const [storeAllGiftVoucher, setStoreAllGiftVoucher] = useState([]);
  const [isApplePaySupported, setIsApplePaySupported] = useState(false);
  const [isGooglePaySupported, setIsGooglePaySupported] = useState(false);

  const minimumDate = new Date();
  const maximumDate = new Date();
  maximumDate.setDate(
    maximumDate.getDate() + allSettings?.membership_start_buffer || 45
  );
  // use this  useEffect for get token
  useEffect(() => {
    const getToken = async () => {
      try {
        const session = await AsyncStorage.getItem("user_session");
        const sessionID = JSON.parse(session)?.data;
        setToken(sessionID?.token);
        FamilyListApi(sessionID?.token);
        listCustomerCard(sessionID?.token);
        getSettingDetails(sessionID?.token);
      } catch (error) {
        // There was an error on the native side
      }
    };
    getToken();
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
        console.error("Error checking payment support:", error);
      }
    })();
  }, []);

  //use this function get user member List
  const FamilyListApi = async (value) => {
    try {
      const Token = value;
      const data = await fetchDataWithToken(PRIVATE_GET_FAMILY_LIST, Token);
      setData(data?.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Example: redirect the user to the login page
        ShowToast("Your token is expired");
        navigation.navigate("Login");
      } else {
        // Handle other errors
        console.log("Error:", error);
      }
    }
  };

  const getSettingDetails = async (value) => {
    setLoading(true);
    try {
      const tokens = value;
      const settingsResponse = await fetchDataWithToken(GET_SETTING, tokens);
      const settingDetails = settingsResponse?.data;

      setAllSettings(settingDetails);
    } catch (error) {
      console.error("Error fetching settings or bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  // use this code for show added customer card
  const listCustomerCard = async (value) => {
    try {
      const tokens = value;
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
      console.error("Error fetching data:", error);
    }
  };
  const handleConfirm = (startDate) => {
    const DATE = new Date(startDate);
    const Reg_Date1 = DATE.toISOString().split("T");
    const Reg_Date2 = Reg_Date1[0].split("-");
    setStartDate(Reg_Date2[2] + "-" + Reg_Date2[1] + "-" + Reg_Date2[0]);
    hideDatePicker();
  };
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  // membership booking
  const privateMembershipBooking = async (check) => {
    const giftVoucherStatus = [AllOnlinePayment, ...storeAllGiftVoucher];
    const payable_amount =
      parseFloat(totalAmountToPay) + parseFloat(voucherAmount);
    if (!priceDetails) {
      ShowToast("Please package select price.");
      return;
    } else if (!valueData.length) {
      ShowToast("Please assigned member.");
      return;
    } else if (!defaultCards[0]) {
      ShowToast("Please Add Card.");
      return;
    }
    setLoading(true);
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    var formData = new FormData();
    formData.append("assigned_to", JSON.stringify(valueData));
    formData.append("pkg_id", priceDetails?.package_id);
    formData.append("price_group", priceDetails?.price_group);
    formData.append("payable_amount", payable_amount);
    formData.append("card_id", defaultCards[0]?.id);
    formData.append("payments", JSON.stringify(giftVoucherStatus));
    formData.append("start_date", startDate);
    formData.append("discount", discountPriceAgain);
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formData,
      redirect: "follow",
    };
    try {
      const response = await fetch(
        `${url}privateMembershipPurchase`,
        requestOptions
      );
      const data = await response.json();

      if (response.ok) {
        if (data?.error === false) {
          if (data?.data?.requires_action === true) {
            const clientSecret = data?.data?.payment_intent?.client_secret;
            if (check === 0) {
              await confirmPayment(clientSecret).then((result) => {
                if (result?.paymentIntent?.status === "Succeeded") {
                  confirmPaymentStatus(result?.paymentIntent?.id);
                } else if (result.error) {
                  //handle failed condition if user cancel
                  navigation.replace("PaymentFailed", {
                    paymentIntent: data?.data?.payment_intent?.id,
                    BookingID: data?.data?.payment_intent?.id,
                  });
                }
              });
            } else if (check === 1) {
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
                  navigation.replace("PaymentFailed", {
                    paymentIntent: data?.data?.payment_intent?.id,
                    BookingID: data?.data?.payment_intent?.id,
                  });
                }
              });
            }
            // else if (check === 2) {
            //   await confirmPlatformPayPayment(clientSecret, {
            //     applePay: {
            //       merchantCountryCode: 'IE',
            //       currencyCode: 'EUR',
            //       cartItems: [
            //         {
            //           label: 'Example item name',
            //           amount: payable_amount,
            //           paymentType: 'Immediate',
            //         },
            //       ],
            //     },
            //   }).then(result => {
            //     console.log('applePay ::::::', result);
            //     if (result?.paymentIntent?.status === 'Succeeded') {
            //       confirmPaymentStatus(result?.paymentIntent?.id);
            //     } else if (result.error) {
            //       //handle failed condition if user cancel
            //       navigation.navigate('PaymentFailed', {
            //         paymentIntent:
            //           data?.data?.payment_details?.payment_intent?.id,
            //         BookingID: data?.data?.id,
            //       });
            //     }
            //   });
            // }
          } else {
            navigation.replace("PaymentSuccess", {
              InvID: data?.data?.mst?.id,
            });
          }
          setIsPressed("");
          setValue("");
          setPrice("");
          setTotalAmountToPay("0.00");
          stateGiftVoucherClear();
          setStartDate("");
        } else {
          ShowToast(data?.msg);
        }
      }
    } catch (error) {
      console.log("membership cart error ", error);
    } finally {
      setLoading(false);
    }
  };
  // confirm Payment
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
          navigation.replace("PaymentSuccess", {
            InvID: data?.data?.id,
          });
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  // this handler use for selected costumer get details
  const handleSelectionChange = (selectedIds) => {
    const selectedItems = Data.filter((item) => selectedIds.includes(item.id));
    setValueData(selectedItems);
    setValue(selectedIds);
  };

  // this handler use for calculate upfront installments
  const handleContainerPress = (item) => {
    let price = item?.price;
    let totalCount = price;

    // Calculate totalCount if upfront_installments exist
    if (data?.upfront_installments !== 0) {
      totalCount = price * data?.upfront_installments;
    }

    setPrice(totalCount);
    setTotalAmountToPay(totalCount);
    setTotalAmountToPayAgain(totalCount);

    const active_member = allSettings?.active_member ? "active" : false;
    const new_member = allSettings?.new_member ? "new" : false;

    const isPlatformApplicable =
      allSettings?.applicable_platform !== "0" &&
      ["mobile", "both"].includes(allSettings.applicable_platform);

    if (data?.disc_applicable == 1) {
      if (isPlatformApplicable) {
        const applyDiscount = () => {
          const discount =
            (totalCount * allSettings?.membership_discount_percentage) / 100;
          setDiscountPriceAgain(discount);
          setTotalAmountToPay(totalCount - discount);
          setTotalAmountToPayAgain(totalCount - discount);
        };
        // Check if grace discount applies
        if (allSettings?.grace_discount && active_member) {
          applyDiscount();
        }
        // Check for membership discount type
        else if (
          allSettings?.membership_discount_type &&
          ["all", active_member, new_member].includes(
            allSettings.membership_discount_type
          )
        ) {
          applyDiscount();
        }
        // No discount conditions met
        else {
          console.log("All conditions for discount are false");
        }
      }
    }
    setIsPressed(item?.id);
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

  // this is clear state
  const stateGiftVoucherClear = () => {
    setVoucherAmount(0);
    setStoreAllGiftVoucher([]);
    setTotalAmountToPay(price - discountPriceAgain);
  };

  //this handler  online payment
  const AllOnlinePayment = {
    pay_mode: "Online",
    amount: totalAmountToPay,
    pay_ref: "",
  };
  // this is use for show price card
  const renderPriceCart = ({ item }) => {
    return (
      <TouchableOpacity
        key={item?.item?.id}
        onPress={() => {
          handleContainerPress(item);
          setPriceDetails(item);
          // setValue("");
          // setValueData("");
          setShow(true);
        }}
        style={[
          styles.priceCart,
          {
            backgroundColor: item?.id === isPressed ? "#0C86DE" : "#EDF1F4",
          },
        ]}
      >
        {item?.id === isPressed ? (
          <View style={styles.check}>
            <MaterialIcons name="check" size={25} color={Color.white} />
          </View>
        ) : null}
        <View style={{ alignSelf: "center" }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: item?.id === isPressed ? "#ffffff" : "#3E3D3D",
            }}
          >
            {item?.price_group}
          </Text>
        </View>
        <View style={{ alignSelf: "center" }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: item?.id === isPressed ? "#ffffff" : "#3E3D3D",
            }}
          >
            {"( " + item?.occupant_count + " Person Only)"}
          </Text>
        </View>
        {data?.frequency != null ? (
          <View style={{ alignSelf: "center" }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: item?.id === isPressed ? "#ffffff" : "#3E3D3D",
              }}
            >
              {data?.frequency}
            </Text>
          </View>
        ) : null}
        <View style={{ alignSelf: "center" }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "700",
              color: item?.id === isPressed ? "#ffffff" : "#3E3D3D",
            }}
          >
            €{item?.price}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // this is use for in modal to show  all card
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
            <Text style={styles.text}>
              ************{item?.item?.card_number}
            </Text>
            <Text style={styles.text}>Expiry Date</Text>
            <Text style={styles.text}>
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
    <SafeAreaView style={{ backgroundColor: Color.white, flex: 1 }}>
      <View style={{ backgroundColor: Color.white, flex: 1 }}>
        <View
          style={{
            backgroundColor: Color.white,
            borderRadius: 10,
            height: "100%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              height: 50,
              paddingHorizontal: 10,
              borderBottomWidth: 1,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
                setStartDate("");
              }}
              style={styles.close}
            >
              <MaterialIcons name="arrow-back" size={25} color={Color.black} />
            </TouchableOpacity>
            <Text
              style={[
                styles.TextStyle,
                {
                  fontSize: 14,
                  color: Color.black,
                },
              ]}
            >
              {data?.title}
            </Text>
            <View style={styles.close} />
          </View>
          <View style={{ flex: 1 }}>
            <FlatList
              data={data?.pricing}
              keyExtractor={(item) => item.id}
              numColumns={2}
              renderItem={renderPriceCart}
              ListHeaderComponent={
                <>
                  {data?.classes != null && data?.classes != "" ? (
                    <Text style={styles.TextStyle}>
                      Classes -
                      <Text style={{ color: Color.black }}>
                        {data?.classes}
                      </Text>
                    </Text>
                  ) : null}
                  {data?.venues != null && data?.venues != "" ? (
                    <Text style={styles.TextStyle}>
                      Venues -
                      <Text style={{ color: Color.black }}>{data?.venues}</Text>
                    </Text>
                  ) : null}
                  {data?.pools != null && data?.pools != "" ? (
                    <Text style={styles.TextStyle}>
                      Pools -
                      <Text style={{ color: Color.black }}>{data?.pools}</Text>
                    </Text>
                  ) : null}
                  {data?.frequency != null && data?.frequency != "" ? (
                    <Text style={styles.TextStyle}>
                      Frequency -
                      <Text style={{ color: Color.black }}>
                        {data?.frequency}
                      </Text>
                    </Text>
                  ) : null}
                </>
              }
              ListFooterComponent={
                <>
                  {data?.upfront_installments !== 0 &&
                  data?.upfront_installments != null &&
                  data?.upfront_installments != "" ? (
                    priceDetails?.price != null && priceDetails?.price != "" ? (
                      <Text style={styles.TextStyle}>
                        Total Upfront -
                        <Text style={{ color: Color.black }}>
                          {priceDetails?.price} X{data?.upfront_installments}
                        </Text>
                      </Text>
                    ) : null
                  ) : null}
                  {price > "0.00" ? (
                    <Text style={styles.TextStyle}>
                      Total Price -
                      <Text style={{ color: Color.black }}> €{price}</Text>
                    </Text>
                  ) : null}
                  <View style={[styles.Coupon, { marginTop: 10 }]}>
                    <Text style={styles.fontBold}>Bill Summary</Text>
                    <View style={styles.dash} />
                    <View style={styles.renderContainer}>
                      <Text style={styles.Amount}>Total</Text>
                      {price != null && price != "" ? (
                        <Text style={styles.Amount}> €{price}</Text>
                      ) : null}
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
                        €{voucherAmount === null ? "0.00" : voucherAmount}
                      </Text>
                    </View>
                    {discountPriceAgain != null && discountPriceAgain != "" ? (
                      <View style={styles.renderContainer}>
                        <Text style={styles.Amount}>Discount</Text>
                        <Text style={styles.Amount}>€{discountPriceAgain}</Text>
                      </View>
                    ) : null}
                    <>
                      <View style={styles.dash} />
                      <View style={styles.renderContainer}>
                        <Text style={styles.Amount}>Grand Total</Text>
                        <Text style={styles.Amount}>€{totalAmountToPay}</Text>
                      </View>
                    </>
                  </View>
                  {show === true ? (
                    <TouchableOpacity
                      onPress={showDatePicker}
                      style={[
                        styles.dropdown,
                        {
                          marginTop: 12,
                          margin: 10,
                          flexDirection: "row",
                          paddingVertical: 10,
                          justifyContent: "space-between",
                        },
                      ]}
                    >
                      <Text style={styles.placeholderStyle}>
                        {startDate != ""
                          ? startDate
                          : "Select package start Date"}
                      </Text>
                      <Image
                        source={CalendarFill}
                        style={{ height: 20, width: 20 }}
                      />

                      <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date"
                        minimumDate={minimumDate}
                        maximumDate={maximumDate}
                        onConfirm={handleConfirm}
                        onCancel={hideDatePicker}
                      />
                    </TouchableOpacity>
                  ) : null}
                  {show === true ? (
                    <MultiSelect
                      style={[styles.dropdown, { marginTop: 12, margin: 10 }]}
                      data={Data}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      selectedStyle={styles.selectedStyle}
                      itemContainerStyle={{ backgroundColor: "#ffffff" }}
                      itemTextStyle={styles.itemTextStyle}
                      activeColor={"#FFF2C2"}
                      labelField="name"
                      maxHeight={200}
                      maxSelect={priceDetails?.occupant_count}
                      valueField="id"
                      placeholder={"Choose Member"}
                      value={value}
                      onChange={handleSelectionChange}
                    />
                  ) : null}
                  {defaultCards && defaultCards.length > 0 ? (
                    <View>
                      <Text
                        style={[
                          styles.TextStyle,
                          {
                            fontSize: 14,
                            color: Color.black,
                          },
                        ]}
                      >
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
                          setIsPressed("");
                          setValue("");
                        }}
                      />
                    </View>
                  )}
                  <View
                    style={{
                      marginVertical: 10,
                    }}
                  >
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
                        if (!priceDetails) {
                          ShowToast("Please select price.");
                          return;
                        } else if (!valueData.length) {
                          ShowToast("Please assigned member.");
                          return;
                        } else if (!defaultCards[0]) {
                          ShowToast("Please Add Card.");
                          return;
                        } else if (
                          priceDetails?.occupant_count !== valueData.length
                        ) {
                          ShowToast(
                            `In this price group select ${priceDetails?.occupant_count} person`
                          );
                          return;
                        }
                        setVisible(true);
                      }}
                    />
                    <CartButton
                      onPress={() => {
                        if (!priceDetails) {
                          ShowToast("Please select price.");
                          return;
                        } else if (!startDate) {
                          ShowToast("Please select start date.");
                          return;
                        } else if (!valueData.length) {
                          ShowToast("Please assigned member.");
                          return;
                        } else if (!defaultCards[0]) {
                          ShowToast("Please Add Card.");
                          return;
                        } else if (
                          priceDetails?.occupant_count !== valueData.length
                        ) {
                          ShowToast(
                            `In this price group select ${priceDetails?.occupant_count} person`
                          );
                          return;
                        }
                        const check = 0;
                        privateMembershipBooking(check);
                      }}
                      label={"Proceed to Pay"}
                      marginTop={12}
                      // disabled={isDisabled}
                      color={Color.white}
                      fontS={18}
                      fontW={"700"}
                      marginHorizontal={10}
                      padding={10}
                      borderRadius={10}
                    />
                    {totalAmountToPay > 0 && (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {
                          Platform.OS !== "ios"
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
                                  paddingHorizontal={15}
                                  marginHorizontal={5}
                                  image={require("../../Images/googlePay.png")}
                                  imageStyle={{ width: 45, height: 35 }}
                                  onPress={() => {
                                    if (!priceDetails) {
                                      ShowToast("Please select price.");
                                      return;
                                    } else if (!startDate) {
                                      ShowToast("Please select start date.");
                                      return;
                                    } else if (!valueData.length) {
                                      ShowToast("Please assigned member.");
                                      return;
                                    } else if (!defaultCards[0]) {
                                      ShowToast("Please Add Card.");
                                      return;
                                    } else if (
                                      priceDetails?.occupant_count !==
                                      valueData.length
                                    ) {
                                      ShowToast(
                                        `In this price group select ${priceDetails?.occupant_count} person`
                                      );
                                      return;
                                    }
                                    const check = 1;
                                    privateMembershipBooking(check);
                                  }}
                                />
                              )
                            : null
                          // isApplePaySupported && (
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
                          //       paddingHorizontal={15}
                          //       marginHorizontal={5}
                          //       image={require('../../Images/applePay.png')}
                          //       imageStyle={{width: 45, height: 35}}
                          //       onPress={() => {
                          //         if (!priceDetails) {
                          //           ShowToast('Please select price.');
                          //           return;
                          //         } else if (!startDate) {
                          //           ShowToast('Please select start date.');
                          //           return;
                          //         } else if (!valueData.length) {
                          //           ShowToast('Please assigned member.');
                          //           return;
                          //         } else if (!defaultCards[0]) {
                          //           ShowToast('Please Add Card.');
                          //           return;
                          //         } else if (
                          //           priceDetails?.occupant_count !==
                          //           valueData.length
                          //         ) {
                          //           ShowToast(
                          //             `In this price group select ${priceDetails?.occupant_count} person`,
                          //           );
                          //           return;
                          //         }
                          //         const check = 2;
                          //         privateMembershipBooking(check);
                          //       }}
                          //     />
                          //   )
                        }
                      </View>
                    )}
                  </View>
                </>
              }
            />
          </View>
        </View>
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
              <FlatList data={cardList} renderItem={allCard} />
            </View>
          </View>
        </Modal>
        <GiftVoucherModel
          visible={visible}
          handleBack={() => {
            stateGiftVoucherClear();
            setVisible(false);
          }}
          setStoreAllGiftVoucher={calculateGiftVoucher}
        />
      </View>
    </SafeAreaView>
  );
};

export default MembershipCart;

const styles = StyleSheet.create({
  text: {
    textAlign: "center",
    fontWeight: "bold",
    color: Color.black,
  },
  modal: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#00000056",
    padding: 16,
  },
  priceCart: {
    margin: 8,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    width: "45%",
  },
  check: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  dropdown: {
    height: 45,
    margin: 3,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#c3c3c3",
    padding: 5,
    borderRadius: 5,
  },
  placeholderStyle: {
    fontSize: 15,
    color: Color.gray,
    fontWeight: "bold",
  },
  selectedTextStyle: {
    fontSize: 14,
    color: Color.black,
    fontWeight: "bold",
  },
  itemTextStyle: {
    fontSize: 15,
    color: Color.black, // Text color for dropdown items
  },
  selectedStyle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "white",
    shadowColor: "#000",
    margin: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },
  TextStyle: {
    fontSize: 13,
    fontWeight: "700",
    color: Color.gray,
    textAlign: "center",
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
  Coupon: {
    backgroundColor: Color.white,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  Amount: {
    fontWeight: "700",
    fontSize: 15,
    color: Color.black,
    marginVertical: 5,
  },
  renderContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
  },
  dash: {
    borderColor: Color.black,
    borderWidth: 0.5,
    borderStyle: "dashed",
    marginVertical: 10,
  },
  fontTotal: {
    fontWeight: "600",
    fontSize: 13,
    color: "#424141",
    marginVertical: 5,
  },
  fontBold: {
    marginTop: 10,
    color: Color.black,
    fontWeight: "600",
    fontSize: 14,
  },
  renderContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
  },
});
