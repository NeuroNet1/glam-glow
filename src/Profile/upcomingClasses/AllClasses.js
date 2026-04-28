import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SectionList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";

import { url, CREDIT_CLASS_BOOKING } from "../../api/Myurl";
import { Color } from "../../Color/Color";
import Loader from "../../Helpers/Loader";
import ClassesList from "./ClassesList.jsx";
import { getDateLabel } from "../../CommonComponent";
// import ResponsiveText from "../../component/Responsive/ResponsiveText";

const AllClasses = () => {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [Token, setToken] = useState();
  const [dataList, setDataList] = useState([]);
  const [page, setPage] = useState();
  const [lastPage, setLastPage] = useState(Infinity);
  const [status, setStatus] = useState("Upcoming");

  useEffect(() => {
    const getToken = async () => {
      try {
        const session = await AsyncStorage.getItem("user_session");
        if (session !== null) {
          const tokenSession = JSON.parse(session).data;
          setToken(tokenSession?.token);
        }
      } catch (error) {
        console.log("token error....");
      }
    };
    getToken();
  }, []);
  useEffect(() => {
    if (isFocused && Token && status) {
      setDataList([]);
      setPage(1);
      setLastPage(Infinity);
      fetchClasses();
    }
  }, [isFocused, Token, status]);

  const fetchClasses = async (pageNumber = 1) => {
    // Prevent duplicate calls or out-of-bounds
    if (loading || pageNumber > lastPage) return;

    let endPoint =
      status === "Upcoming"
        ? "new_getClassList"
        : status === "Past"
        ? "old_getClassList"
        : "";

    setLoading(true);
    try {
      const response = await fetch(`${url}${endPoint}?page=${pageNumber}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${Token}` },
      });

      if (!response.ok) throw new Error(`Status ${response.status}`);

      const { data } = await response.json();
      // Update lastPage from API
      setLastPage(data.last_page);

      // Append or reset items
      setDataList((prev) =>
        pageNumber === 1 ? data.data : [...prev, ...data.data]
      );

      // Prepare next page
      setPage(pageNumber + 1);
    } catch (err) {
      console.error("fetchClasses error:", err);
    } finally {
      setLoading(false);
    }
  };

  const cancelClasses = async (booking) => {
    setLoading(true);
    try {
      const FormData = require("form-data");
      let data = new FormData();
      data.append("invoice_id", booking?.booking_id);
      data.append("id", booking?.id);
      data.append("payable_amt", booking?.total_amount);
      data.append(
        "payments",
        JSON.stringify([
          {
            pay_mode: "gift_voucher",
            amount: booking?.total_amount,
          },
        ])
      );

      const response = await fetch(`${url}${CREDIT_CLASS_BOOKING}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${Token}` },
        redirect: "follow",
        body: data,
      });
      if (response.ok) {
        const data = await response.json();
        fetchClasses();
      } else {
        console.log("Response Status:", response.status);
        setLoading(false);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setLoading(false);
    } finally {
      setModalVisible(false);
    }
  };

  const groupBookingsByDate = (bookings) => {
    const grouped = {};

    bookings.forEach((booking, index) => {
      const label = getDateLabel(booking.time_slot);
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push({ item: booking, index });
    });

    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  };

  if (loading && page === 1) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      {/* TABS */}
      <View style={styles.tabContainer}>
        {["Upcoming", "Past"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setStatus(tab)}
            activeOpacity={0.7}
          >
            <Text
              size="medium"
              style={[styles.tabText, status === tab && styles.tabTextActive]}
            >
              {tab + " Bookings"}
            </Text>
            <View
              style={[
                styles.tabUnderline,
                status === tab && styles.tabUnderlineActive,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
      {dataList && dataList.length > 0 ? (
        <SectionList
          sections={groupBookingsByDate(dataList)}
          keyExtractor={(item, index) => item.item?.id?.toString() + index}
          renderItem={({ item, index }) => (
            <ClassesList
              item={item}
              status={status}
              onCancel={(booking) => {
                cancelClasses(booking);
              }}
              index={index}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          onEndReached={() => fetchClasses(page)}
          onEndReachedThreshold={0.2}
          ListFooterComponent={() =>
            loading && (
              <ActivityIndicator size="small" color={Color.gradient1} />
            )
          }
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          windowSize={5}
          maxToRenderPerBatch={10}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
        />
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={styles.sectionHeader}>
            {status == "Upcoming"
              ? "No upcoming bookings !"
              : "No past bookings"}
          </Text>
        </View>
      )}
    </View>
  );
};
export default AllClasses;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  tabText: {
    fontWeight: "600",
    color: "#000",
  },
  tabTextActive: {
    color: "#0C37A6",
  },
  tabUnderline: {
    height: 2,
    backgroundColor: Color.white,
    marginTop: 4,
  },
  tabUnderlineActive: {
    backgroundColor: "#0C37A6",
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: "#333",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
