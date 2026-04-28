// PoolBooking.js
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

// icons & libs
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import { useDispatch } from "react-redux";
import LinearGradient from "react-native-linear-gradient";
import moment from "moment";

// Components
import Buttons from "../Button_Component/Buttons";
import { PriceCard } from "../component";
import CalendarStrip from "../component/Calender/CalendarStrip";
import { url } from "../api/Myurl";
import BookingBtn from "./Booking";
import { addToCartItem } from "../ReduxToolKit/AddCartSlice";

// Helpers
import { ShowToast, Loader } from "../Helpers";
import { Color } from "../Color/Color";

const PoolBooking = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  const [Center_Id, setCenter_Id] = useState("");
  const [token, setToken] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);

  const [poolList, setPoolList] = useState([]);
  const [selectedPool, setSelectedPool] = useState(null);

  const [currentDate, setCurrentDate] = useState("");
  const [calendarData, setCalendarData] = useState(null);

  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [priceList, setPriceList] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(null);

  const [familyList, setFamilyList] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [barcodes, setBarcodes] = useState([]);

  // ---------------- Init Load -------------------
  useEffect(() => {
    if (isFocused) initLoad();
  }, [isFocused]);

  const initLoad = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");
      const t = JSON.parse(session)?.data;
      setToken(t);

      const center = await AsyncStorage.getItem("Centerdata");
      const cid = JSON.parse(center)?.id;
      setCenter_Id(cid);

      const today = moment().format("YYYY-MM-DD");
      setCurrentDate(today);

      loadPools(cid);
      loadFamilyList(t?.token);
    } catch (e) {
      console.log("init error", e);
    }
  };

  // =============== FETCH POOLS ===============
  const loadPools = async (centerId) => {
    setLoading(true);
    try {
      const res = await fetch(`${url}pools/${centerId}`);
      const json = await res.json();

      if (!json.error && json.data?.length > 0) {
        setPoolList(json.data);
        setSelectedPool(json.data[0]);
        loadPoolCalendar(json.data[0].id, centerId, currentDate);
      }
    } catch (e) {
      console.log("pool list error", e);
    }
    setLoading(false);
  };

  // =============== FETCH CALENDAR ===============
  const loadPoolCalendar = async (pool_id, center_id, date) => {
    setLoading1(true);
    try {
      let f = new FormData();
      f.append("id", pool_id);
      f.append("center_id", center_id);
      f.append("date", date);

      const res = await fetch(`${url}pools/calendar`, {
        method: "POST",
        body: f,
      });
      const json = await res.json();

      if (!json.error) {
        setCalendarData(json.data);
        setPriceList(json.data?.prices || []);
        generateTimeSlots(json.data, selectedPool, date);
      }
    } catch (e) {
      console.log("calendar error", e);
    }
    setLoading1(false);
  };

  // =============== GENERATE TIME SLOTS ===============
  const generateTimeSlots = (poolData, pool, date) => {
    if (!pool?.open_time || !pool?.close_time) {
      setSlots([]);
      return;
    }

    const today = moment().startOf("day");
    const selectedDay = moment(date, "YYYY-MM-DD").startOf("day");

    // ------------------------------------
    // 1) PREVIEW DAYS CHECK
    // ------------------------------------
    const preview = Number(pool.preview_days) || 0;
    const maxPreviewDate = today.clone().add(preview, "days");

    if (selectedDay.isAfter(maxPreviewDate, "day")) {
      setSlots([]);
      return;
    }

    // ------------------------------------
    // 2) WEEK DAYS CHECK
    // ------------------------------------
    let allowedDays = [];
    try {
      allowedDays = JSON.parse(pool.week_days);
    } catch {}

    const dayName = selectedDay.format("dddd");

    if (!allowedDays.includes(dayName)) {
      setSlots([]);
      return;
    }

    // ------------------------------------
    // 4) GENERATE TIME SLOTS
    // ------------------------------------
    const fmt = "HH:mm";
    const duration = 60;
    const slotsArr = [];

    let cur = moment(pool.open_time, fmt);
    const end = moment(pool.close_time, fmt);

    const reserved = new Set();

    if (Array.isArray(poolData?.calendar)) {
      poolData.calendar.forEach((ev) => {
        if (!ev.from_time || !ev.to_time) return;
        if (ev.ref_id !== 0 && ev.ref_id !== "0") return;

        const f = moment(ev.from_time, ["HH:mm", "HH:mm:ss", "hh:mm A"]).format(
          "HH:mm"
        );
        const t = moment(ev.to_time, ["HH:mm", "HH:mm:ss", "hh:mm A"]).format(
          "HH:mm"
        );

        reserved.add(`${f}|${t}`);
      });
    }

    while (cur.clone().add(duration, "minutes").isSameOrBefore(end)) {
      const next = cur.clone().add(duration, "minutes");

      const keyFrom = cur.format("HH:mm");
      const keyTo = next.format("HH:mm");

      // Convert to moment objects for comparison
      const slotStart = moment(keyFrom, "HH:mm");
      const now = moment();

      let isPast = false;

      // Disable past slots ONLY if selected day == today
      if (selectedDay.isSame(today, "day")) {
        if (slotStart.isBefore(now)) {
          isPast = true;
        }
      }

      // Check if slot is reserved
      const isReserved = reserved.has(`${keyFrom}|${keyTo}`);

      slotsArr.push({
        from: cur.format("hh:mm A"),
        to: next.format("hh:mm A"),
        disabled: isPast || isReserved, // 🔥 disable past OR reserved
        _from24: keyFrom,
        _to24: keyTo,
        pool_id: pool.id,
      });

      cur = next;
    }

    setSlots(slotsArr);
  };

  // =============== SLOT SELECT ===============
  const selectSlot = (slot) => {
    if (
      selectedSlot &&
      selectedSlot._from24 === slot._from24 &&
      selectedSlot._to24 === slot._to24
    ) {
      setSelectedSlot(null);
    } else {
      setSelectedSlot(slot);
    }
  };

  // =============== FAMILY LIST ===============
  const loadFamilyList = (token) => {
    fetch(`${url}privateGetFamilyList`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((r) => r.text())
      .then((t) => setFamilyList(JSON.parse(t)?.data || []))
      .catch((e) => console.log("family list err", e));
  };

  // ============= MEMBER SELECT HANDLER =============
  const handleMemberChange = (ids) => {
    const selected = familyList.filter((u) => ids.includes(u.id));
    setSelectedMembers(selected);
    setBarcodes(selected.map((u) => u.barcode));
  };

  // =============== GET CUSTOMER PROFILE ===============
  const getCustomerProfile = () => {
    if (!selectedPrice) return ShowToast("Please select price");
    if (selectedMembers.length === 0) return ShowToast("Please select member");

    if (selectedMembers.length !== selectedPrice.occupants) {
      ShowToast(`Please select ${selectedPrice.occupants} members`);
      return;
    }

    if (calendarData) {
      const available = calendarData.total_limit - calendarData.total_booked;

      if (selectedPrice.occupants > available) {
        ShowToast(`Only ${available} seats available`);
        return;
      }
    }

    fetch(`${url}getCustomerProfile`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token?.token,
        "Content-Type": "multipart/form-data",
      },
    })
      .then((res) => {
        if (res.status === 401) {
          ShowToast("Your token is expired");
          navigation.navigate("Login");
          return null;
        }
        return res.text();
      })
      .then((result) => {
        if (!result) return;

        const profileData = JSON.parse(result)?.data;
        const membership = profileData?.membership || [];

        let allMembersActive = true;

        selectedMembers.forEach((m) => {
          const barcode = m.barcode;

          const valid = membership.some((mem) => {
            const assigned = mem.assigned_users?.split(",") || [];
            return (
              assigned.includes(barcode) &&
              mem.status === "active" &&
              mem.pool_ids.includes(selectedPrice.pool_id) &&
              mem.occupant_count >= selectedPrice.occupants &&
              mem.expiry_date >= currentDate
            );
          });

          if (!valid) allMembersActive = false;
        });

        if (!allMembersActive) {
          addToCart(); // Paid booking
        } else {
          const freePrice = {
            ...selectedPrice,
            price: "0.00",
            assigned_to: barcodes,
          };
          addToCart(freePrice);
        }
      })
      .catch((err) => console.log("profile error:", err));
  };

  // =============== ADD TO CART ===============
  const addToCart = (overridePrice = null) => {
    const price = overridePrice || selectedPrice;
    if (!price) {
      ShowToast("Select a price group");
      return;
    }

    const cartObj = {
      id: selectedPool.id,
      type: "Pool",
      price_group: price.price_group,
      price_group_id: price?.id,
      price: price.price,
      occupants: price.occupants,
      qty: 1,
      discountPrice: 0,
      title: selectedPool.name,
      name: selectedMembers.map((x) => x.name),
      Date: currentDate,
      Time: selectedSlot?.from,
      to_time: selectedSlot?.to,
      amount: price.price,
      assigned_to: barcodes,
    };
    dispatch(addToCartItem(cartObj));
    navigation.navigate("Cart");

    setShowModal(false);
    setSelectedPrice(null);
    setSelectedMembers([]);
  };

  if (loading) return <Loader />;

  return (
    <SafeAreaView style={{ backgroundColor: Color.white, height: "100%" }}>
      <BookingBtn defaultModule="pool" />

      {/* POOL DROPDOWN */}
      <Dropdown
        style={styles.dropdown1}
        labelField="name"
        valueField="id"
        data={poolList}
        value={selectedPool?.id}
        placeholder="Select Pool"
        onChange={(item) => {
          setSelectedPool(item);
          loadPoolCalendar(item.id, Center_Id, currentDate);
          setSelectedSlot(null);
        }}
      />

      {/* CALENDAR */}
      <CalendarStrip
        handlePress={(date) => {
          setCurrentDate(date);
          loadPoolCalendar(selectedPool?.id, Center_Id, date);
          setSelectedSlot(null);
        }}
      />

      <View style={{ marginHorizontal: 10, height: "73%" }}>
        {loading1 ? (
          <ActivityIndicator size="large" color={Color.blue} />
        ) : (
          <View style={{ flex: 1, marginBottom: 40 }}>
            <Text style={styles.title}>Booking Time</Text>
            {/* IF NO SLOTS SHOW MESSAGE */}
            {slots.length === 0 && !loading1 && (
              <View
                style={{
                  alignItems: "center",
                  marginTop: 30,
                }}
              >
                <Text style={{ fontSize: 16, color: "#777" }}>
                  No slots available for this date
                </Text>
              </View>
            )}
            <FlatList
              data={slots || []}
              numColumns={2}
              keyExtractor={(item) => item._from24 + item._to24}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected =
                  selectedSlot?._from24 === item._from24 &&
                  selectedSlot._to24 === item._to24;
                return (
                  <TouchableOpacity
                    onPress={() => selectSlot(item)}
                    disabled={item?.disabled}
                    style={{ flex: 1 }}
                  >
                    {isSelected ? (
                      <LinearGradient
                        colors={["#00259a", "#016ae7"]}
                        style={[styles.timeSlotButton, styles.selectedSlot]}
                      >
                        <Text style={[styles.timeSlotText, { color: "#fff" }]}>
                          {item.from} - {item.to}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <View
                        style={[
                          styles.timeSlotButton,
                          {
                            borderColor: item?.disabled ? "#535353" : "#0946BA",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.timeSlotText,
                            {
                              color: item?.disabled ? "#535353" : "#0946BA",
                            },
                          ]}
                        >
                          {item.from} - {item.to}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
              ListFooterComponent={() => {
                if (slots.length === 0) return null;

                const today = moment().startOf("day");
                const selected = moment(currentDate, "YYYY-MM-DD").startOf(
                  "day"
                );
                const maxAdvance = today
                  .clone()
                  .add(selectedPool.advance_booking_days, "days");

                if (selected.isAfter(maxAdvance, "day")) return null;
                return (
                  <Buttons
                    onPress={() => {
                      if (!selectedSlot) {
                        ShowToast("Please select a time slot");
                        return;
                      }
                      setShowModal(true);
                    }}
                    label="Continue"
                    color={Color.white}
                    gradientColors={
                      selectedSlot ? Color.button : ["#363636", "#535353"]
                    }
                    fontS={16}
                    fontW={"600"}
                    marginTop={10}
                    marginHorizontal={20}
                    padding={12}
                    borderRadius={20}
                  />
                );
              }}
            />
          </View>
        )}
      </View>

      {/* PRICE MODAL */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.close}
              onPress={() => {
                setShowModal(false);
                setSelectedPrice(null);
                setSelectedMembers([]);
              }}
            >
              <MaterialIcons name="close" size={24} />
            </TouchableOpacity>

            <FlatList
              data={priceList}
              numColumns={2}
              keyExtractor={(item) => item.price_group.toString()}
              renderItem={({ item }) => (
                <PriceCard
                  item={{ item }}
                  priceDetails={selectedPrice}
                  onPressCard={() => setSelectedPrice(item)}
                />
              )}
            />

            {/* MEMBER LIST */}
            <MultiSelect
              style={[styles.dropdown, { marginTop: 20, margin: 10 }]}
              data={familyList}
              labelField="name"
              valueField="id"
              placeholder={"Select Member"}
              value={selectedMembers.map((m) => m.id)}
              maxSelect={selectedPrice?.occupants || 0}
              onChange={handleMemberChange}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              selectedStyle={styles.selectedStyle}
              itemContainerStyle={{ backgroundColor: "#ffffff" }}
              itemTextStyle={styles.itemTextStyle}
              activeColor={"#FFF2C2"}
              maxHeight={200}
            />

            <Buttons
              onPress={getCustomerProfile}
              label="Book Now"
              color={Color.white}
              fontS={18}
              fontW={"700"}
              marginHorizontal={20}
              padding={10}
              borderRadius={10}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PoolBooking;

// ---------------- Styles -------------------
const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 10,
  },
  dropdown1: {
    margin: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
  },
  timeSlotButton: {
    flex: 1,
    padding: 15,
    margin: 8,
    borderRadius: 25,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0946BA",
  },
  selectedSlot: {
    borderWidth: 0,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#0946BA",
  },
  modal: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: Color.white,
    padding: 10,
    height: "70%",
    borderRadius: 15,
  },
  close: {
    alignSelf: "flex-end",
    padding: 5,
  },
  dropdown: {
    margin: 20,
    borderWidth: 1,
    borderColor: Color.black,
    height: 45,
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

  itemTextStyle: {
    fontSize: 15,
    color: Color.black, // Text color for dropdown items
  },
});
