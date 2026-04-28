import { StyleSheet, Text, View, TouchableOpacity, Modal } from "react-native";
import React, { useState } from "react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

//All components
import { BackGroundColorBtn } from "../../UtilityData/staticData.js";
import { Color } from "../../Color/Color";
import { formatTime } from "../../CommonComponent";
import ResponsiveText from "../../component/Responsive/ResponsiveText.jsx";

const ClassesList = ({ item, index, onCancel, status }) => {
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false);

  const colorBtn = BackGroundColorBtn[index % BackGroundColorBtn.length];

  const timeSlot = new Date(item?.item?.time_slot); // session start time
  const now = new Date();
  const canDelete = timeSlot?.getTime() - now.getTime() > 2 * 60 * 60 * 1000;

  const checkDelete =
    status == "Upcoming" && canDelete && item?.item?.is_credit_done == 0;

  const isUnpaidClass =
    status == "Upcoming" &&
    item?.item?.paid_amt == 0 &&
    (item?.item?.type == "Class" ||
      item?.item?.type == "PAYG" ||
      item?.item?.type == "PT");

  const handleConfirm = () => {
    setModalVisible(false);
    onCancel(item?.item);
  };
  return (
    <View
      style={[
        styles.mainview,
        { backgroundColor: status == "Upcoming" ? "#fff" : "#F0F0F0" },
      ]}
    >
      <View style={[styles.time_slot, { borderRightColor: colorBtn.color }]}>
        <ResponsiveText size="regular" style={styles.text}>
          {formatTime(item?.item?.time_slot)}
        </ResponsiveText>
      </View>
      <View style={styles.slotDetails}>
        <View
          style={{
            width: "68%",
            paddingStart: 5,
          }}
        >
          <ResponsiveText
            size="medium"
            style={styles.textMedium}
            textAlign={"left"}
          >
            {item?.item?.title}
          </ResponsiveText>
          <ResponsiveText
            size="small"
            style={styles.textMedium}
            textAlign={"left"}
          >
            Assigned :{item?.item?.assigned_names}{" "}
          </ResponsiveText>
          {item?.item?.paid_amt && (
            <ResponsiveText
              size="small"
              style={styles.textMedium}
              textAlign={"left"}
            >
              Paid :{" "}
              <ResponsiveText fontWeight="600" color="#0044cc">
                {`€ ${item?.item?.paid_amt}`}
              </ResponsiveText>
            </ResponsiveText>
          )}
        </View>
        <View
          style={{
            flexDirection: "row",
            width: "30%",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("InvoiceDetails", {
                data: item?.item?.booking_id,
              });
            }}
            style={{
              alignItems: "flex-end",
            }}
          >
            <MaterialIcons
              name="visibility"
              style={{
                fontSize: 25,
                color: "#0A3ECB",
                //   alignSelf: 'flex-start',
              }}
            />
          </TouchableOpacity>
          {(checkDelete || isUnpaidClass) && (
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{ alignItems: "flex-end", marginLeft: 10 }}
            >
              <MaterialIcons name="delete" size={25} color="red" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Modal
        visible={isModalVisible}
        onRequestClose={() => {
          setModalVisible(!isModalVisible);
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.1)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={styles.modalcontainer}>
            <MaterialIcons
              name="report"
              size={80}
              color={Color.wheat}
              style={{ textAlign: "center" }}
            />
            <Text
              style={[
                styles.text1,
                {
                  fontSize: 20,
                },
              ]}
            >
              Are you sure ?
            </Text>
            <Text style={[styles.text1, { fontSize: 14 }]}>
              If you cancel your booking at least 2 hours before the scheduled
              time, you will receive a credit note as compensation. Otherwise,
              There is no compensation!
            </Text>
            <View style={styles.modalbuttonview}>
              <TouchableOpacity
                style={styles.buttonview}
                onPress={handleConfirm}
              >
                <Text style={[styles.text1, { color: Color.white }]}>
                  {"Cancel Booking"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.buttonview, { backgroundColor: Color.gray }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.text1, { color: Color.white }]}>
                  {"Cancel"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ClassesList;

const styles = StyleSheet.create({
  mainview: {
    height: 95,
    width: "100%",
    flexDirection: "row",
    padding: 2,
    paddingTop: 10,
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
  text1: {
    marginHorizontal: 10,
    marginVertical: 5,
    fontSize: 16,
    fontWeight: "600",
    color: Color.gray,
    textAlign: "center",
  },

  modalcontainer: {
    alignSelf: "center",
    flex: 1 / 3,
    backgroundColor: Color.white,
    padding: 10,
    borderRadius: 8,
  },

  modalbuttonview: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  buttonview: {
    height: 50,
    width: "40%",
    alignSelf: "center",
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Color.red,
    borderRadius: 8,
  },
});
