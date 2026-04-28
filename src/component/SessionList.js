import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import LinearGradient from "react-native-linear-gradient";

//All components
import {
  BackGroundColor,
  BackGroundColorBtn,
} from "../UtilityData/staticData.js";
import { Color } from "../Color/Color";
import { formatTime } from "../Helpers/momentFormatter.jsx";
import ResponsiveText from "./ResponsiveText.jsx";

const SessionList = ({ item, filterPrice }) => {
  const color = BackGroundColor[item.index % BackGroundColor.length];
  const colorBtn = BackGroundColorBtn[item.index % BackGroundColorBtn.length];

  return (
    <View style={styles.mainview}>
      <View style={[styles.time_slot, { borderRightColor: colorBtn.color }]}>
        <ResponsiveText size="regular" style={styles.text}>
          {formatTime(item?.item?.time_slot)}
        </ResponsiveText>
      </View>
      {/* <View
        style={{
          width: 4,
          height: 70,
          backgroundColor: colorBtn.color,
        }}
      /> */}
      <View style={styles.slotDetails}>
        <View
          style={{
            width: "58%",
            paddingStart: 5,
          }}
        >
          <ResponsiveText
            size="medium"
            style={styles.textMedium}
            textAlign={"left"}
          >
            {item?.item?.class_name}
          </ResponsiveText>
          <ResponsiveText
            size="small"
            style={styles.textMedium}
            textAlign={"left"}
          >
            Duration : {item.item.session_duration}min class
          </ResponsiveText>
          {item.item.waiting >= 1 ? null : (
            <ResponsiveText
              size="small"
              style={styles.textMedium}
              textAlign={"left"}
            >
              Availability :{" "}
              <ResponsiveText fontWeight="600" color="#0044cc">
                {item.item.total_booked}/{item.item.total_limit}
              </ResponsiveText>
            </ResponsiveText>
          )}
          {item.item.waiting >= 1 ? (
            <ResponsiveText
              size="small"
              style={styles.textMedium}
              textAlign={"left"}
            >
              Waiting -
              <ResponsiveText color="#0044cc">
                {item.item.waiting}
              </ResponsiveText>
            </ResponsiveText>
          ) : null}
        </View>
        {item?.item?.is_booking_available == true && (
          <View
            style={{
              width: "40%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {new Date(item?.item?.time_slot) > new Date() ? (
              <>
                {item.item.total_limit <= item.item.total_booked ? (
                  <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={() => {
                      filterPrice(item?.item);
                    }}
                    style={[
                      styles.Btn,
                      {
                        borderWidth: 1,
                        borderColor: "#0044cc",
                      },
                    ]}
                  >
                    <ResponsiveText
                      fontSize="medium"
                      color={"#0044cc"}
                      style={styles.buttontext}
                    >
                      Join Waitlist
                    </ResponsiveText>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={() => {
                      filterPrice(item?.item);
                    }}
                  >
                    <LinearGradient colors={Color.button} style={styles.Btn}>
                      <ResponsiveText
                        fontSize="medium"
                        color={"#ffffff"}
                        style={styles.buttontext}
                      >
                        Book Now
                      </ResponsiveText>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <ResponsiveText size="regular" fontWeight="600" color="#EE0000">
                {"Booking Closed"}
              </ResponsiveText>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default SessionList;

const styles = StyleSheet.create({
  mainview: {
    height: 87,
    width: "100%",
    flexDirection: "row",
    padding: 2,
    marginBottom: 10,
    marginTop: 5,
    borderBottomWidth: 0.2,
    borderBottomColor: "grey",
  },
  time_slot: {
    alignItems: "center",
    width: "20%",
    borderRightWidth: 3,
    marginBottom: 10,
  },
  slotDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  text: {
    color: Color.black,
    fontWeight: "700",
  },
  textMedium: {
    color: Color.black,
    fontWeight: "400",
  },
  Btn: {
    height: 46,
    width: 110,
    borderRadius: 25,
    justifyContent: "center",
  },
  buttontext: {
    textAlign: "center",
    fontWeight: "400",
  },
});
