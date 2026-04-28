import {
  StyleSheet,
  Image,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Color } from "../Color/Color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { url } from "../api/Myurl";

// app theme
import BuyMembership from "../AppTheme/Images/BuyMembership.jpg";

// Helpers
import { ShowToast, Loader } from "../Helpers";

const Subscription = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  // 👉 initial state
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(Infinity);
  const [loading, setLoading] = useState(false);
  const [canLoadMore, setCanLoadMore] = useState(false);
  const [token, setToken] = useState(null);
  const [data, setData] = useState([]);

  // load token once
  useEffect(() => {
    (async () => {
      try {
        const session = await AsyncStorage.getItem("user_session");
        const { token: t } = JSON.parse(session).data;
        setToken(t);
      } catch (err) {
        console.error("Token load error:", err);
      }
    })();
  }, []);

  // reset & fetch on focus
  useEffect(() => {
    if (token && isFocused) {
      setData([]);
      setPage(1);
      setLastPage(Infinity);
      setCanLoadMore(false);
      fetchPage(1);
    }
  }, [token, isFocused]);

  const fetchPage = async (requestedPage) => {
    if (loading || requestedPage > lastPage) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${url}privateActiveMembershipList?page=${requestedPage}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form‑data",
          },
        }
      );

      if (res.status === 401) {
        ShowToast("Session expired");
        navigation.navigate("Login");
        return;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      const { data: pageData, last_page } = json.data;

      setLastPage(last_page);
      setData((prev) =>
        requestedPage === 1 ? pageData : [...prev, ...pageData]
      );
      setPage(requestedPage + 1);
    } catch (err) {
      console.error("fetchPage error:", err);
      ShowToast("Failed to load memberships");
    } finally {
      setLoading(false);
      // allow pagination only after first load
      setCanLoadMore(true);
    }
  };

  const displayDate = (isoString) => {
    return new Date(isoString).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // initial loader
  if (loading && page === 1) {
    return <Loader />;
  }

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.mainview}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate("SubscriptionDetails", { data: item.id })
        }
      >
        <View style={styles.iconWrapper}>
          <Image
            style={styles.profileimage}
            source={require("../Images/membership.png")}
          />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title}>
            {item.package_title}
            <Text style={styles.subtitle}> / ({item.price_group})</Text>
          </Text>
          <Text style={styles.price}>€{item.price}</Text>
          <Text style={styles.small}>
            start date – {displayDate(item.start_date)}
          </Text>
          <Text style={styles.small}>
            expiry date – {displayDate(item.expiry_date)}
          </Text>
        </View>
        <View style={styles.statusBlock}>
          <Text style={styles.statusLabel}>status</Text>
          <Text
            style={[
              styles.statusValue,
              item.status !== "active" && { color: "#ff0000" },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {data?.length > 0 ? (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          onEndReached={() => {
            if (canLoadMore) {
              setCanLoadMore(false);
              fetchPage(page);
            }
          }}
          onEndReachedThreshold={0.2}
          ListFooterComponent={() =>
            loading ? (
              <ActivityIndicator size="small" color={Color.gradient1} />
            ) : page > lastPage ? (
              <Text style={styles.endText}>No more data</Text>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Image source={BuyMembership} style={{ height: 250, width: 250 }} />
          <Text style={styles.emptyText}>No Active Membership!</Text>
        </View>
      )}
    </View>
  );
};

export default Subscription;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.white,
    flex: 1,
    paddingHorizontal: 20,
  },
  mainview: {
    backgroundColor: "#EAF7FF",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    borderWidth: 0.2,
    borderColor: Color.grey,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 2,
  },
  iconWrapper: {
    backgroundColor: "#0573BB",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  profileimage: {
    width: 40,
    height: 40,
    tintColor: "#fff",
  },
  textBlock: {
    flex: 1,
    marginStart: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "400",
    color: "#848485",
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1049CE",
  },
  small: {
    fontSize: 11,
    fontWeight: "400",
    color: "#848485",
  },
  statusBlock: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1049CE",
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
  emptyText: {
    fontSize: 18,
    fontWeight: "400",
    color: "#c7c7c7",
    textAlign: "center",
    marginTop: 20,
  },
});
