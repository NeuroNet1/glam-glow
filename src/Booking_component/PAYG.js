import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Modal,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";

// all packages
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import { useDispatch } from "react-redux";

//app theme
import { Color } from "../Color/Color";

//all components
import Buttons from "../Button_Component/Buttons";
import { SessionList, PriceCard } from "../component";
import CalendarStrip from "../component/Calender/CalendarStrip";
import { url } from "../api/Myurl";
import BookingBtn from "./Booking";
import { addToCartItem } from "../ReduxToolKit/AddCartSlice.js";
// Helpers
import { ShowToast, Loader } from "../Helpers";

const PayGBooking = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const [defaultModule] = useState("payg");
  const [Center_Id, setCenter_Id] = useState("");
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [data, setData] = useState([]);
  const [value, setValue] = useState("");
  const [calenderdata, setCalenderData] = useState([]);
  const [calenderDataPrice, setCalenderDataPrice] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [session_id, setSession_id] = useState("");
  const [priceDetails, setPriceDetails] = useState("");
  const [token, setToken] = useState("");
  const [selectedData, setSelectedData] = useState({ title: "All", id: "0" });
  const [familyData, setFamilyData] = useState([]);
  const [allMember, setAllMember] = useState("");
  const [valueDataID, setValueDataID] = useState("");
  const [barCode, setBarCode] = useState(null);
  const [userName, setUserName] = useState(null);
  useEffect(() => {
    gettoken();
    setSelectedData({ title: "All", id: "0" });
  }, [isFocused]);
  useEffect(() => {
    if (currentDate && value) {
      publicClassSessions();
    }
  }, [currentDate, value]);
  const gettoken = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");
      const token = JSON.parse(session)?.data;
      setToken(token);
      Familylistpapi(token);
      const centerid = await AsyncStorage.getItem("Centerdata");
      setCenter_Id(JSON.parse(centerid).id);
      publicListClasses(JSON.parse(centerid).id);
    } catch (error) {
      console.log("token error....");
    }
  };

  const handleDropdownChange = (item) => {
    var now = new Date();
    var day = ("0" + now.getDate()).slice(-2);
    var month = ("0" + (now.getMonth() + 1)).slice(-2);
    var today = now.getFullYear() + "-" + month + "-" + day;
    setCurrentDate(today);
    setValue(item?.id);
  };
  const getCustomerProfile = () => {
    if (priceDetails === "") {
      ShowToast("Please select price");
      return;
    }
    if (!valueDataID) {
      ShowToast("Please select member");
      return;
    }
    if (priceDetails?.occupants !== allMember.length) {
      ShowToast(`In this price group select ${priceDetails?.occupants} person`);
      return;
    }
    if (
      priceDetails?.occupants >
      session_id?.total_limit - session_id?.total_booked
    ) {
      ShowToast(
        `In this slot only ${
          session_id?.total_limit - session_id?.total_booked
        } seat is available`
      );
      return;
    }
    fetch(`${url}getCustomerProfile`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token?.token,
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => {
        if (response.status === 401) {
          ShowToast("Your token is expired");
          setShowModal(false);
          navigation.navigate("Login");
        } else if (response.ok) {
          return response.text();
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .then((result) => {
        const profileData = JSON.parse(result)?.data;
        const activeMemberShipData = profileData?.membership;
        let activeMember = true;
        if (!valueDataID) {
          ShowToast("Please select member");
          return;
        }

        allMember.forEach((activeData) => {
          const matchingValue = activeMemberShipData.filter((valueBar) => {
            const assignedUsersArray = valueBar.assigned_users.split(",");
            const class_ids = valueBar.class_ids;
            return (
              assignedUsersArray.includes(activeData.barcode) &&
              valueBar.status === "active" &&
              class_ids.includes(priceDetails?.class_id) &&
              valueBar?.occupant_count >= priceDetails?.occupants &&
              valueBar?.expiry_date >= currentDate
            );
          });
          if (matchingValue.length === 0) {
            activeMember = false;
          }
        });
        if (!activeMember) {
          handleCheckOut(priceDetails);
        } else {
          const freePrice = {
            ...priceDetails,
            price: "0.00",
            assigned_to: barCode,
          };
          handleCheckOut(freePrice);
        }
      })
      .catch((error) => {
        console.log("error:::", error);
      });
  };
  const handleSelectionChange = (selectedIds) => {
    if (familyData) {
      const selectedItems = familyData.filter((item) =>
        selectedIds.includes(item.id)
      );
      const barcodes = selectedItems.map((user) => user.barcode);
      const user_Name = selectedItems.map((user) => user.name);
      setUserName(user_Name);
      setBarCode(barcodes);
      setValueDataID(selectedIds);
      setAllMember(selectedItems);
    }
  };
  const Familylistpapi = (value) => {
    fetch(`${url}privateGetFamilyList`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + value?.token,
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => response.text())
      .then((result) => {
        setFamilyData(JSON.parse(result).data);
      })
      .catch((error) => {
        console.log("error:::", error);
      });
  };
  const handleContainerPress = (item) => {
    if (item) {
      setPriceDetails(item);
      setValueDataID("");
    }
  };
  // use api start
  const publicListClasses = async (value) => {
    setLoading(true);
    try {
      const response = await fetch(`${url}publicListPayg/${value}`, {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        const newData = [{ title: "All", id: "0" }, ...data?.data];
        setData(newData);
        setValue("0");
      }
    } catch (error) {
      console.log("error:::", error);
    } finally {
      setLoading(false);
    }
  };
  const publicClassSessions = async () => {
    setLoading1(true);
    try {
      var formdata = new FormData();
      formdata.append("date", currentDate);
      formdata.append("type", "PAYG");
      formdata.append("center_id", Center_Id);
      formdata.append("Class_id", value);

      var requestOptions = {
        method: "POST",
        body: formdata,
        redirect: "follow",
      };

      const response = await fetch(
        `${url}publicClassSessionList`,
        requestOptions
      );

      if (response.ok) {
        const newData = await response.json();
        const intValue = parseInt(value);
        if (intValue === 0) {
          setCalenderData(newData);
          setCalenderDataPrice(newData?.data?.pricing);
        } else {
          const filteredPricing = newData?.data?.pricing.filter(
            (price) => price.class_id === intValue
          );
          // Filter sessions data based on class_id
          const filteredSessions = newData?.data?.sessions.filter(
            (session) => session.class_id === intValue
          );
          const filteredData = {
            data: {
              pricing: filteredPricing,
              sessions: filteredSessions,
            },
            msg: newData.msg,
            error: newData.error,
          };

          setCalenderData(filteredData);
          setCalenderDataPrice(filteredPricing);
        }
      }
      setLoading1(false);
    } catch (error) {
      setLoading1(false);
    }
  };
  const cardToWaitingList = () => {
    if (priceDetails === "") {
      ShowToast("Please select price");
      return;
    }
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token?.token}`);

    var formdata = new FormData();
    formdata.append("id", priceDetails?.class_id);
    formdata.append("section", "PAYG");
    formdata.append("session_id", session_id?.session_id);
    formdata.append("timeslot", session_id.time_slot);
    formdata.append("price", priceDetails?.price);
    formdata.append("occupants", priceDetails?.occupants);
    formdata.append("cust_id", token?.id);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    fetch(`${url}caddToWaitingList`, requestOptions)
      .then((response) => {
        if (response.status === 401) {
          ShowToast("Your token is expired");
          setShowModal(false);
          setPriceDetails("");
          navigation.navigate("Login");
        } else if (response.ok) {
          return response.text();
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .then((result) => {
        const newData = JSON.parse(result);
        if (newData?.error === false) {
          setShowModal(false);
          setPriceDetails("");
        }
        ShowToast(newData?.msg);
      })
      .catch((error) => console.log("error", error));
  };
  // ----------------------------------  use End  ------------------------------------------------
  const handleCheckOut = async (priceDetails1) => {
    dispatch(
      addToCartItem({
        id: priceDetails1?.class_id,
        type: "Class",
        price_group: priceDetails1?.price_group,
        price_group_id: priceDetails1?.id,
        price: priceDetails1?.price,
        occupants: priceDetails1?.occupants,
        qty: 1,
        discountPrice: 0,
        session_id: session_id?.session_id,
        time_slot: session_id.time_slot,
        title: session_id?.class_name,
        name: userName,
        session_duration: session_id?.session_duration,
        amount: priceDetails1.price,
        assigned_to: barCode,
      })
    );
    navigation.navigate("Cart");
    setShowModal(false);
    setAllMember("");
    setValueDataID("");
    setBarCode(null);
    setPriceDetails("");
  };
  const filterPrice = (item) => {
    const filteredSessions = calenderdata?.data?.pricing?.filter(
      (session) => session.class_id === item?.class_id
    );
    setCalenderDataPrice(filteredSessions);
    setSession_id(item);
    setShowModal(true);
  };
  if (loading) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={{ backgroundColor: Color.white, height: "100%" }}>
      <BookingBtn defaultModule={defaultModule} />
      <Dropdown
        style={styles.dropdown1}
        placeholderStyle={styles.placeholderStyle1}
        selectedTextStyle={styles.selectedTextStyle1}
        itemContainerStyle={{ backgroundColor: "#ffffff" }}
        itemTextStyle={styles.itemTextStyle}
        activeColor={"#FFF2C2"}
        data={data}
        maxHeight={300}
        labelField="title"
        valueField="id"
        placeholder={"All"}
        value={selectedData}
        onChange={(item) => {
          setSelectedData(item);
          handleDropdownChange(item);
        }}
      />

      <View>
        <CalendarStrip handlePress={(item) => setCurrentDate(item)} />
      </View>
      <View style={{ marginHorizontal: 10, height: "73%" }}>
        {loading1 ? (
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator
              animating={true}
              color="rgb(6, 180, 215)"
              size="large"
            />
          </View>
        ) : (
          <>
            {calenderdata?.data?.sessions &&
            calenderdata?.data?.sessions.length > 0 ? (
              <FlatList
                data={calenderdata?.data?.sessions}
                keyExtractor={(item, index) => index}
                renderItem={(item) => (
                  <>
                    {new Date(item?.item?.time_slot) > new Date() ? (
                      <SessionList item={item} filterPrice={filterPrice} />
                    ) : null}
                  </>
                )}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
              />
            ) : calenderdata?.error === false ? (
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <Text style={styles.noResultsText}>No Sessions Available</Text>
              </View>
            ) : (
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <Text>{calenderdata?.msg}</Text>
              </View>
            )}
          </>
        )}
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
              height: "62%",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
                setAllMember("");
                setValueDataID("");
                setBarCode(null);
                setPriceDetails("");
              }}
              style={styles.close}
            >
              <MaterialIcons name="close" size={25} color={Color.black} />
            </TouchableOpacity>
            <FlatList
              data={calenderDataPrice}
              keyExtractor={(item) => item.id}
              numColumns={2}
              renderItem={(item) => (
                <PriceCard
                  item={item}
                  onPressCard={() => {
                    if (token !== null && token !== undefined) {
                      if (item?.item) {
                        handleContainerPress(item?.item);
                      }
                    } else {
                      setShowModal(false);
                      navigation.navigate("Login");
                    }
                  }}
                  priceDetails={priceDetails}
                />
              )}
            />
            {session_id?.total_limit <= session_id?.total_booked ? null : (
              <>
                {familyData && (
                  <MultiSelect
                    style={[styles.dropdown, { marginTop: 20, margin: 10 }]}
                    data={familyData}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    selectedStyle={styles.selectedStyle}
                    itemContainerStyle={{ backgroundColor: "#ffffff" }}
                    itemTextStyle={styles.itemTextStyle}
                    activeColor={"#FFF2C2"}
                    labelField="name"
                    maxHeight={200}
                    maxSelect={priceDetails?.occupants}
                    valueField="id"
                    placeholder={"Choose Member"}
                    value={valueDataID}
                    onChange={handleSelectionChange}
                  />
                )}
              </>
            )}
            <View
              style={{
                flexDirection: "row",
                marginVertical: 10,
                justifyContent: "space-evenly",
              }}
            >
              {session_id?.total_limit <= session_id?.total_booked ? (
                <Buttons
                  onPress={() => {
                    cardToWaitingList();
                  }}
                  label={"Join waiting list"}
                  color={Color.white}
                  fontS={18}
                  fontW={"700"}
                  marginHorizontal={20}
                  padding={10}
                  borderRadius={10}
                />
              ) : (
                <Buttons
                  onPress={() => {
                    getCustomerProfile();
                  }}
                  label={"Book Now"}
                  color={Color.white}
                  fontS={18}
                  fontW={"700"}
                  marginHorizontal={20}
                  padding={10}
                  borderRadius={10}
                />
              )}
            </View>
            {session_id?.total_limit <= session_id?.total_booked ? null : (
              <Text
                style={[
                  styles.text,
                  { color: "#333333", textAlign: "center", paddingBottom: 10 },
                ]}
              >
                Active memberships will not incur charges.
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PayGBooking;

const styles = StyleSheet.create({
  dropdown: {
    height: 45,
    margin: 20,
    borderWidth: 1,
    borderColor: Color.black,
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
  icon: {
    marginVertical: 8,
    fontSize: 25,
    color: Color.black,
    marginHorizontal: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#c3c3c3",
    borderRadius: 5,
    borderStyle: "solid",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
    height: 45,
    marginTop: 10,
  },
  inputwidth: {
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
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
  dropdown1: {
    marginHorizontal: 10,
    marginTop: 12,
    width: "92%",
    height: 45,
    borderWidth: 1,
    borderColor: "#c3c3c3",
    padding: 2,
    borderRadius: 5,
    alignSelf: "center",
  },
  placeholderStyle1: {
    fontSize: 15,
    color: Color.black,
    textAlign: "center",
  },
  selectedTextStyle1: {
    fontSize: 15,
    color: Color.black,
    textAlign: "center",
  },
  itemTextStyle: {
    fontSize: 15,
    color: Color.black, // Text color for dropdown items
  },
  selectedStyle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "white",
    shadowColor: "#000",
    margin: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },

  noResultsText: {
    fontSize: 14,
    marginTop: 10,
    color: Color.black,
    textAlign: "center",
  },
});
