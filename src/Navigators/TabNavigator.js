import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View, Text, LogBox } from "react-native";

// all packages
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

// App Theme
import { Colors } from "../AppTheme/color";
import { normalizeFont } from "../AppTheme/scale";
import AllFont from "../AppTheme/AllFont";
import GradientText from "../AppTheme/gradientText";
import GradienntIcon from "../AppTheme/gradientIcon";
import House from "../AppTheme/Images/home.png";
import HomeFill from "../AppTheme/Images/homefill.png";
import Booking from "../AppTheme/Images/booking.png";
import BookingFill from "../AppTheme/Images/bookingfill.png";
import AccessIcon from "../AppTheme/Images/access.png";
import AccessFill from "../AppTheme/Images/accessfill.png";
import Bag from "../AppTheme/Images/cart.png";
import BagFill from "../AppTheme/Images/cartfill.png";
import User from "../AppTheme/Images/profile.png";
import UserFill from "../AppTheme/Images/profilefill.png";

//all app Screens
import Home from "../BottomTab/Home";
import Access from "../BottomTab/Access";
import Cart from "../Cart/Cart";
import Profile from "../BottomTab/Profile";
import Classes from "../BottomTab/Classes";

//all app components
import Membership from "../Booking_component/Membership";
import CourseBooking from "../Booking_component/CourseBooking";
import CourseDetails from "../Booking_component/CourseDetails";
import PTBooking from "../Booking_component/PT";
import PayGBooking from "../Booking_component/PAYG";
import PoolBooking from "../Booking_component/Pool";
import VenueBooking from "../Booking_component/Venue";
import CustomHeader from "../component/CustomHeader";
import ResponsiveText from "../component/ResponsiveText.jsx";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => {
  const isFocused = useIsFocused();
  const AllCartData = useSelector((state) => state.cartItem?.cartItems);
  const [storeModules, setStoreModules] = useState("");

  useEffect(() => {
    const getCenterData = async () => {
      try {
        const Centerdata = await AsyncStorage.getItem("Centerdata");
        setStoreModules(JSON.parse(Centerdata)?.modules);
      } catch (error) {
        console.log("token error....", error);
      }
    };
    getCenterData();
  }, [isFocused]);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarLabelStyle: {
          fontWeight: "400",
          fontFamily: AllFont.regular,
          fontSize: normalizeFont(12),
          color: Colors.black,
          textAlign: "center",
        },
        tabBarStyle: {
          height: 60,
          paddingHorizontal: 5,
          paddingTop: 5,
          paddingBottom: 5,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={["#fff", "#fff"]}
            style={{
              height: 70,
              bordertopleftradius: 15,
              bordertoprightradius: 15,
            }}
          />
        ),
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
          tabBarLabel: ({ focused }) =>
            focused ? (
              <GradientText text="Home" size="small" />
            ) : (
              <ResponsiveText size="small" fontWeight="400">
                Home
              </ResponsiveText>
            ),
          tabBarIcon: ({ focused }) => (
            <Image source={focused ? HomeFill : House} style={styles.img} />
          ),
        }}
      />
      {/* tab for booking navigator start */}
      <Tab.Screen
        name="Bookings"
        options={{
          header: () => (
            <CustomHeader title="Bookings" showBack={false} hide={false} />
          ),
          tabBarLabel: ({ focused }) =>
            focused ? (
              <GradientText text="Bookings" size="small" />
            ) : (
              <ResponsiveText size="small" fontWeight="400">
                Bookings
              </ResponsiveText>
            ),
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? BookingFill : Booking}
              style={styles.img}
            />
          ),
        }}
      >
        {() => ClassesHandle(storeModules)}
      </Tab.Screen>
      {/* tab for booking navigator end */}
      <Tab.Screen
        name="Access"
        component={Access}
        options={{
          headerShown: false,
          tabBarLabel: ({ focused }) =>
            focused ? (
              <GradientText text="Access" size="small" />
            ) : (
              <ResponsiveText size="small" fontWeight="400">
                Access
              </ResponsiveText>
            ),
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? AccessFill : AccessIcon}
              style={styles.img}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={Cart}
        options={{
          header: () => <CustomHeader title="Cart" showBack={false} />,
          tabBarLabel: ({ focused }) =>
            focused ? (
              <GradientText text="Cart" size="small" />
            ) : (
              <ResponsiveText size="small" fontWeight="400">
                Cart
              </ResponsiveText>
            ),
          tabBarIcon: ({ focused }) => (
            <View style={{ position: "relative" }}>
              {focused ? (
                <GradienntIcon source={BagFill} />
              ) : (
                <Image source={Bag} style={styles.img} />
              )}
              {AllCartData.length > 0 && (
                <View style={styles.badge}>
                  <GradientText text={AllCartData.length} size="smallest" />
                </View>
              )}
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          header: () => <CustomHeader title="Account" showBack={false} />,
          tabBarLabel: ({ focused }) =>
            focused ? (
              <GradientText text="Account" size="small" />
            ) : (
              <ResponsiveText size="small" fontWeight="400">
                Account
              </ResponsiveText>
            ),
          tabBarIcon: ({ focused }) => (
            <Image source={focused ? UserFill : User} style={styles.img} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
const ClassesHandle = (storeModules) => (
  <Stack.Navigator>
    {storeModules.includes("class") && (
      <Stack.Screen
        name="Classes"
        component={Classes}
        options={{ headerShown: false }}
      />
    )}
    {storeModules.includes("payg") && (
      <Stack.Screen
        name="PAYG"
        component={PayGBooking}
        options={{ headerShown: false }}
      />
    )}
    {storeModules.includes("pt") && (
      <Stack.Screen
        name="PT"
        component={PTBooking}
        options={{ headerShown: false }}
      />
    )}
    {storeModules.includes("pool") && (
      <Stack.Screen
        name="PoolBooking"
        component={PoolBooking}
        options={{ headerShown: false }}
      />
    )}

    {storeModules.includes("venue") && (
      <Stack.Screen
        name="VenueBooking"
        component={VenueBooking}
        options={{ headerShown: false }}
      />
    )}
    {storeModules.includes("course") && (
      <>
        <Stack.Screen
          name="CourseBooking"
          component={CourseBooking}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CourseDetails"
          component={CourseDetails}
          options={{ headerShown: false }} // Show header if needed
        />
      </>
    )}
    {storeModules.includes("membership") && (
      <Stack.Screen
        name="Membership"
        component={Membership}
        options={{ headerShown: false }}
      />
    )}
  </Stack.Navigator>
);

export default TabNavigator;
const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    right: -8,
    top: -5,
    backgroundColor: Colors.lightColor,
    borderRadius: 25 / 2,
    width: 25,
    height: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#0044cc",
    fontSize: 14,
    fontWeight: "bold",
  },
  img: { height: 24, width: 24, resizeMode: "contain" },
});
