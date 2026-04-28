import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Color } from "../Color/Color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { url } from "../api/Myurl";

// app theme
import BuyMembership from "../AppTheme/Images/BuyMembership.jpg";

// Helpers
import { ShowToast, Loader } from "../Helpers";

const History = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [token, setToken] = useState(null);
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(Infinity);
  const [loading, setLoading] = useState(false);

  // 1. Load token once
  useEffect(() => {
    AsyncStorage.getItem("user_session")
      .then((session) => {
        if (!session) throw "no session";
        const { data } = JSON.parse(session);
        setToken(data.token);
      })
      .catch(console.error);
  }, []);

  // 2. When screen is focused AND token is ready, load page 1
  useEffect(() => {
    if (isFocused && token) {
      setHistory([]);
      setPage(1);
      setLastPage(Infinity);
      fetchHistory(1);
    }
  }, [isFocused, token]);

  // 3) Fetch helper: guards and state updates
  const fetchHistory = async (requestedPage) => {
    // Prevent duplicate loads or overshooting pages
    if (loading || requestedPage > lastPage) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${url}privateBookingHistory?page=${requestedPage}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 401) {
        ShowToast("Session expired");
        navigation.replace("Login");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const { data: pageData, last_page } = json.data;

      setLastPage(last_page);
      setHistory((prev) =>
        requestedPage === 1 ? pageData : [...prev, ...pageData]
      );
      setPage(requestedPage + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
  if (loading && page === 1) return <Loader />;

  const renderItemHistory = (item) => {
    return (
      <TouchableOpacity
        key={item?.item?.id}
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => {
          navigation.navigate("InvoiceDetails", { data: item.item.id });
        }}
      >
        <View>
          <Text
            style={[
              styles.text,
              { fontSize: 15, fontWeight: "500", color: "#000000" },
            ]}
          >
            {item.item.customer_name}
          </Text>
          {item.item.invoice_no !== null ? (
            <Text style={styles.text}>
              Inv No -{" "}
              <Text style={{ color: Color.gradient1 }}>
                # {item.item.invoice_no}
              </Text>
            </Text>
          ) : (
            <Text style={styles.text}>
              Inv No - <Text style={{ color: Color.red }}>Pay Later</Text>
            </Text>
          )}
          <Text style={styles.text}>
            Inv Date -{displaDate(item.item.invoice_date)}
          </Text>
        </View>
        <View>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#000000" }}>
            &euro; {item.item.net_amt}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View
      style={{
        backgroundColor: Color.white,
        height: "100%",
        paddingHorizontal: 20,
      }}
    >
      <View>
        {history && history.length > 0 ? (
          <FlatList
            data={history}
            renderItem={renderItemHistory}
            onEndReached={() => fetchHistory(page)}
            onEndReachedThreshold={0.2}
            ListFooterComponent={() =>
              loading ? (
                <ActivityIndicator size="small" color={Color.gradient1} />
              ) : page >= lastPage ? (
                <Text style={{ textAlign: "center" }}>No more data</Text>
              ) : null
            }
            contentContainerStyle={{ paddingBottom: 20 }}
            style={{ marginTop: 10 }}
            keyExtractor={(item) => item?.id.toString()}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          />
        ) : (
          <View
            style={{
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View style={{ marginBottom: 100 }}>
              <Image
                source={BuyMembership}
                style={{ height: 250, width: 250 }}
              />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "400",
                  color: "#c7c7c7",
                  textAlign: "center",
                }}
              >
                History not available !
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default History;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#B4D5EA",
    borderRadius: 5,
    margin: 5,
    padding: 10,
    paddingHorizontal: 20,
    backgroundColor: "#EAF7FF",
  },
  text: {
    color: "#555454",
    fontWeight: "600",
    fontSize: 12,
  },
  showcard: {
    backgroundColor: Color.ghostwhite,
    margin: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Color.black,
  },
  view1: {
    margin: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  showtext: {
    fontSize: 15,
    color: Color.black,
  },
});
