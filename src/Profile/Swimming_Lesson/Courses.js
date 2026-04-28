import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Color } from "../../Color/Color";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { url } from "../../api/Myurl";

// app theme
import BuyMembership from "../../AppTheme/Images/BuyMembership.jpg";

// Helpers
import { ShowToast, Loader } from "../../Helpers";

const Courses = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [purchaseList, setPurchaseList] = useState([]);
  const [page, setPage] = useState();
  const [lastPage, setLastPage] = useState(Infinity);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

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

  // 2. Reload (and reset) whenever token is ready AND screen is focused
  useEffect(() => {
    if (token && isFocused) {
      setPurchaseList([]);
      setPage(1);
      setLastPage(Infinity);
      privatelistPurchaseCourseByCustomer();
    }
  }, [token, isFocused]);

  const privatelistPurchaseCourseByCustomer = async (requestedPage = 1) => {
    if (loading || requestedPage > lastPage) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${url}privatelistPurchaseCourseByCustomer?page=${requestedPage}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (res.status === 401) {
        ShowToast("Session expired");
        navigation.replace("Login");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const { data: newData, last_page } = (await res.json()).data;
      setLastPage(last_page);
      setPurchaseList((prev) =>
        requestedPage === 1 ? newData : [...prev, ...newData]
      );
      setPage(requestedPage + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const displayDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.mainview}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate("PurchaseCoursesDetails", {
            data: item.booking_id,
          })
        }
      >
        <View>
          <Text style={styles.text2}>{item.title}</Text>
          <Text style={styles.text}>
            Start date –{" "}
            <Text style={styles.subtext}>{displayDate(item.start_date)}</Text>
          </Text>
          <Text style={styles.text}>
            Start time – <Text style={styles.subtext}>{item.start_time}</Text>
          </Text>
        </View>
        <View>
          <Text style={styles.text}>€ {item.price}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && page === 1) {
    return <Loader />;
  }
  return (
    <View style={styles.container}>
      {purchaseList.length > 0 ? (
        <FlatList
          data={purchaseList}
          renderItem={renderItem}
          onEndReached={() => privatelistPurchaseCourseByCustomer(page)}
          onEndReachedThreshold={0.2}
          ListFooterComponent={() =>
            loading ? (
              <ActivityIndicator size="small" color={Color.gradient1} />
            ) : page > lastPage ? (
              <Text style={styles.endText}>No more data</Text>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Image source={BuyMembership} style={styles.emptyImage} />
          <Text style={styles.emptyText}>
            You have not purchased any course!
          </Text>
        </View>
      )}
    </View>
  );
};

export default Courses;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.white,
    flex: 1,
    paddingHorizontal: 20,
  },
  mainview: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#B4D5EA",
    borderRadius: 5,
    marginVertical: 5,
    padding: 10,
    backgroundColor: "#EAF7FF",
  },
  text2: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
  },
  subtext: {
    color: "#555",
    fontWeight: "400",
    fontSize: 12,
  },
  endText: {
    textAlign: "center",
    padding: 10,
    color: "#999",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyImage: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "400",
    color: "#c7c7c7",
  },
});
