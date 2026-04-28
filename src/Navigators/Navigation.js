import React, { useEffect } from "react";

// all package name
import { Linking } from "react-native";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

// all screens for login purpose
import Splash from "../auth_Flow/Splash";
import Login from "../auth_Flow/Login";
import Register from "../auth_Flow/Register";
import AppIntro from "../auth_Flow/AppIntro.js";
import Forgotpassword from "../auth_Flow/Forgotpassword";
import Center from "../auth_Flow/Center";
import ResetPassword from "../Profile/resetPassword";

// all screen for profile page
import PrivacyPolicy from "../Profile/PrivacyPolicy";
import Terms_condition from "../Profile/Terms_condition";
import Call_Support from "../Profile/Call_Support";
import FAQ from "../Profile/Faq";
import PaymentSuccess from "../paymentStatus/paymentSuccess.js";
import PaymentFailed from "../paymentStatus/PaymentFailed.js";
import Family_List from "../Profile/Family_Detailpage/Family_List";
import Add_Family from "../Profile/Family_Detailpage/Add_Family";
import Edit_Family from "../Profile/Family_Detailpage/Edit_Family";
import Familymember_detail from "../Profile/Family_Detailpage/Familymember_detail";
import Payment_method from "../Profile/Payment/Payment_method";
import Add_Card from "../Profile/Payment/Add_Card";
import Edit_Profile from "../Profile/Edit_Profile";
import AllClasses from "../Profile/upcomingClasses/AllClasses";
import Courses from "../Profile/Swimming_Lesson/Courses";
import History from "../History/History";
import TabNavigator from "./TabNavigator";
import QRCode from "../Profile/QRCode";
import Delete_Account from "../Profile/Delete_Account";
// import CourseDetails from '../Booking_component/CourseDetails';
import PurchaseCoursesDetails from "../Profile/Swimming_Lesson/PurchaseCoursesDetails";
import InvoiceDetails from "../History/InvoiceDetails";
import Subscription from "../Subscription/Subscription";
import SubscriptionDetails from "../Subscription/SubscriptionDetails";
import { MembershipCart } from "../component/membershipComponent";
import CustomHeader from "../component/CustomHeader";

import GiftScreen from "../Booking_component/GiftScreen";

const Stack = createStackNavigator();
const Navigation = () => {
  const navigation = useNavigation();
  useEffect(() => {
    const getInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        handleOpenURL({ url });
      }
    };

    const handleOpenURL = (event) => {
      const url = event.url;
      const endpoint = url?.split("://")[1];
      if (endpoint) {
        navigation.navigate(endpoint);
        // console.log('Endpoint:', endpoint); // Should log 'Login'
      }
    };

    getInitialUrl();
    const subscription = Linking.addEventListener("url", handleOpenURL);

    return () => {
      subscription.remove();
    };
  }, [navigation]);

  return (
    <Stack.Navigator
      screenOptions={{
        animationEnabled: false,
      }}
    >
      <Stack.Screen
        name="Splash"
        component={Splash}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Center"
        component={Center}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        options={{
          header: () => <CustomHeader title="Register" />,
        }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          header: () => <CustomHeader title="Login" backTo="Tab" />,
        }}
      />
      <Stack.Screen
        name="AppIntro"
        component={AppIntro}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Forgotpassword"
        component={Forgotpassword}
        options={{
          header: () => <CustomHeader title="Forgot Password" />,
        }}
      />
      <Stack.Screen
        name="MembershipCart"
        component={MembershipCart}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPassword}
        options={{
          header: () => <CustomHeader title="Change Password" />,
        }}
      />
      <Stack.Screen
        name="Tab"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AllClasses"
        component={AllClasses}
        options={{
          header: () => <CustomHeader title="Upcoming Class Booking" />,
        }}
      />
      <Stack.Screen
        name="History"
        component={History}
        options={{
          header: () => <CustomHeader title="History" />,
        }}
      />
      <Stack.Screen
        name="InvoiceDetails"
        component={InvoiceDetails}
        options={{
          header: () => <CustomHeader title="Invoice Details" />,
        }}
      />
      <Stack.Screen
        name="GiftScreen"
        component={GiftScreen}
        options={{
          header: () => <CustomHeader title="Gift Cards" />,
        }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyPolicy}
        options={{
          header: () => <CustomHeader title="Privacy Policy" />,
        }}
      />
      <Stack.Screen
        name="Terms_condition"
        component={Terms_condition}
        options={{
          header: () => <CustomHeader title="Terms and Conditions" />,
        }}
      />
      <Stack.Screen
        name="Call_Support"
        component={Call_Support}
        options={{
          header: () => <CustomHeader title="Call Support" />,
        }}
      />
      <Stack.Screen
        name="Faq"
        component={FAQ}
        options={{
          header: () => <CustomHeader title="FAQ" />,
        }}
      />
      <Stack.Screen
        name="Delete_Account"
        component={Delete_Account}
        options={{
          header: () => <CustomHeader title="Delete Account" />,
        }}
      />
      <Stack.Screen
        name="Family_List"
        component={Family_List}
        options={{
          header: () => <CustomHeader title="Family" />,
        }}
      />
      <Stack.Screen
        name="Add_Family"
        component={Add_Family}
        options={{
          header: () => <CustomHeader title="Add Family" />,
        }}
      />
      <Stack.Screen
        name="Edit_Family"
        component={Edit_Family}
        options={{
          header: () => <CustomHeader title="Edit Family" />,
        }}
      />
      <Stack.Screen
        name="Edit_Profile"
        component={Edit_Profile}
        options={{
          header: () => <CustomHeader title="Edit Profile" />,
        }}
      />
      <Stack.Screen
        name="Familymember_detail"
        component={Familymember_detail}
        options={{
          header: () => <CustomHeader title="Family" />,
        }}
      />
      <Stack.Screen
        name="Payment_method"
        component={Payment_method}
        options={{
          header: () => <CustomHeader title="Card" />,
        }}
      />
      <Stack.Screen
        name="Add_Card"
        component={Add_Card}
        options={{
          header: () => <CustomHeader title="Add Card" />,
        }}
      />
      <Stack.Screen
        name="Courses"
        component={Courses}
        options={{
          header: () => <CustomHeader title="Purchase Courses" />,
        }}
      />
      <Stack.Screen
        name="PurchaseCoursesDetails"
        component={PurchaseCoursesDetails}
        options={{
          header: () => <CustomHeader title="Purchase Courses Details" />,
        }}
      />
      <Stack.Screen
        name="QRCode"
        component={QRCode}
        options={{
          header: () => <CustomHeader title="" />,
        }}
      />
      {/* <Stack.Screen
        name="CourseDetails"
        component={CourseDetails}
        options={{
          headerShown: false,
        }}
      /> */}
      <Stack.Screen
        name="Subscription"
        component={Subscription}
        options={{
          header: () => <CustomHeader title="Membership Subscription" />,
        }}
      />
      <Stack.Screen
        name="SubscriptionDetails"
        component={SubscriptionDetails}
        options={{
          header: () => <CustomHeader title="Membership Details" />,
        }}
      />
      <Stack.Screen
        name="PaymentSuccess"
        component={PaymentSuccess}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PaymentFailed"
        component={PaymentFailed}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default Navigation;
