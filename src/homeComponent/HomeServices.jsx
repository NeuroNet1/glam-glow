import React from "react";
import { TouchableOpacity, View, Text, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Run from "../Images/gym1.png";
import ptIcon from "../Images/pt.png";
import Yoga from "../Images/yoga.png";
import CIcon from "../Images/cIcon.png";
import MemberShip from "../Images/member.png";
import Retail from "../Images/retail.png";
import Sports from "../Images/sports.png";

const HomeServices = (params) => {
  const navigation = useNavigation();
  const { storeModules } = params;

  // NEW UI SERVICE LIST
  const services = [
    {
      key: "class",
      title: "Fitness Classes and Activities",
      sub: "All types of fitness Classes",
      icon: Run,
      screen: "Classes",
      bg: "#E8EEF6",
    },
    {
      key: "membership",
      title: "Buy a Membership",
      sub: "Package for singles, couples & families",
      icon: MemberShip,
      screen: "Membership",
      bg: "#E7F7F6",
    },
    {
      key: "course",
      title: "Book Courses",
      sub: "Swimming lessons",
      icon: Yoga,
      screen: "CourseBooking",
      bg: "#FFF2E6",
    },
    {
      key: "payg",
      title: "PAYG Gym & Pool",
      sub: "Pay as you go book all Services",
      icon: CIcon,
      screen: "PAYG",
      bg: "#FDEBFF",
    },
    {
      key: "pt",
      title: "Personal Training",
      sub: "Book personal training session",
      icon: ptIcon,
      screen: "PT",
      bg: "#FAF8EF",
    },
    {
      key: "venue",
      title: "Book a Venue",
      sub: "Book a tennis court, sports hall, or football pitch",
      icon: Sports,
      screen: "VenueBooking",
      bg: "#EEFBFD",
    },
    {
      key: "gift_voucher",
      title: "Retail & Gift Card",
      sub: "Purchase retail products and digital gift cards",
      icon: Retail,
      screen: "GiftScreen",
      bg: "#F8FDEE",
    },
  ];
  return services
    .filter((s) => storeModules?.includes(s.key))
    .map((item) => (
      <TouchableOpacity
        key={item.key}
        onPress={() => {
          item.key == "gift_voucher"
            ? navigation.navigate(item.screen)
            : navigation.navigate("Bookings", { screen: item.screen });
        }}
        style={[styles.serviceCard, { backgroundColor: item.bg }]}
      >
        <View style={styles.row}>
          {/* ICON CIRCLE */}
          <View colors={item.circle} style={styles.iconCircle}>
            <Image source={item.icon} style={styles.icon} />
          </View>

          {/* TEXT SECTION */}
          <View style={{ flex: 1 }}>
            <Text style={styles.serviceTitle}>{item.title}</Text>
            <Text style={styles.serviceSub}>{item.sub}</Text>
          </View>
        </View>
      </TouchableOpacity>
    ));
};

export default HomeServices;

const styles = StyleSheet.create({
  serviceCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  icon: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  serviceTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
  },
  serviceSub: {
    marginTop: 4,
    fontSize: 13,
    color: "#555",
  },
});
