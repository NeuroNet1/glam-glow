import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  View,
  Dimensions,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Color } from "../Color/Color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";

const BookingBtn = ({ defaultModule }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [storeModules, setStoreModules] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const getModules = async () => {
      try {
        const centerData = await AsyncStorage.getItem("Centerdata");
        if (centerData) {
          setStoreModules(JSON.parse(centerData).modules || []);
        }
      } catch (error) {
        console.log("Error fetching modules:", error);
      }
    };
    getModules();
  }, [isFocused]);

  const validModules = [
    { key: "class", label: "Classes", screen: "Classes" },
    { key: "payg", label: "PAYG", screen: "PAYG" },
    { key: "pt", label: "Personal Training", screen: "PT" },
    { key: "pool", label: "Pool", screen: "PoolBooking" },
    { key: "venue", label: "Venue", screen: "VenueBooking" },
    { key: "course", label: "Courses", screen: "CourseBooking" },
    { key: "membership", label: "Membership", screen: "Membership" },
  ];

  const filteredModules = validModules.filter((item) =>
    storeModules.includes(item.key)
  );

  // find actual selected index by key
  const selectedIndex = filteredModules.findIndex(
    (item) => item.key === defaultModule
  );

  // auto-scroll to correct position
  useEffect(() => {
    if (scrollRef.current && filteredModules.length > 0 && selectedIndex >= 0) {
      const buttonWidth = 120;
      const screenCenterOffset =
        (Dimensions.get("window").width - buttonWidth) / 2;
      const scrollPosition = Math.max(
        selectedIndex * buttonWidth - screenCenterOffset,
        0
      );
      scrollRef.current.scrollTo({ x: scrollPosition, animated: true });
    }
  }, [selectedIndex, filteredModules]);

  const handlePress = (index, screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={{ height: 60, backgroundColor: Color.white }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          paddingHorizontal: 10,
        }}
      >
        {filteredModules.map((module, index) => {
          const isSelected = index === selectedIndex;
          return (
            <TouchableOpacity
              key={module.key}
              activeOpacity={0.8}
              onPress={() => handlePress(index, module.screen)}
            >
              {isSelected ? (
                <LinearGradient
                  colors={Color.button}
                  style={styles.selectedButton}
                >
                  <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
                    {module.label}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.button}>
                  <Text style={[styles.buttonText, { color: "#7A7979" }]}>
                    {module.label}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default BookingBtn;

const styles = StyleSheet.create({
  button: {
    height: 45,
    margin: 10,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  selectedButton: {
    height: 45,
    margin: 10,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
