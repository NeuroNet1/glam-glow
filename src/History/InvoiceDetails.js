import { StyleSheet, Text, View, FlatList, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { url } from "../api/Myurl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Color } from "../Color/Color";
import { useIsFocused } from "@react-navigation/native";
import Logo from "../Images/logoRound.png";

// Helpers
import { Loader } from "../Helpers";
import { formatTimeSlotDate } from "../Helpers/momentFormatter";

const InvoiceDetails = (params) => {
  const isFocused = useIsFocused();
  const ID = params?.route?.params?.data;
  const [mesterTabel, setMesterTabel] = useState("");
  const [Center_Id, setCenter_Id] = useState("");
  const [details, setDetails] = useState("");
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileDetails, setProfileDetails] = useState("");
  const [showCreditNotes, setShowCreditNotes] = useState();

  useEffect(() => {
    if (isFocused) {
      gettoken();
    }
  }, [isFocused]);
  const gettoken = async () => {
    try {
      const centerid = await AsyncStorage.getItem("Centerdata");
      setCenter_Id(JSON.parse(centerid));
      const session = await AsyncStorage.getItem("user_session");
      if (session !== null) {
        const tokenSession = JSON.parse(session).data;
        setProfileDetails(tokenSession);
        GetInvoiceDetails(tokenSession?.token);
      }
    } catch (error) {
      console.log("token error....", error);
    }
  };
  const GetInvoiceDetails = (value) => {
    setLoading(true);
    fetch(`${url}privategetInvoiceDetails/${ID}`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + value,
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => response.text())
      .then((result) => {
        const newData = JSON.parse(result).data;
        setLoading(false);
        setDetails(newData?.det);
        setMesterTabel(newData?.mst);
        setPaymentDetails(newData?.payment);
        setShowCreditNotes(newData?.gift_voucher);
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  if (loading) {
    return <Loader />;
  }
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
  const renderItem = (item) => {
    const inputString = item?.item?.particulars;
    const datePattern = /\d{4}-\d{2}-\d{2}/; // Regular expression pattern to match the date (YYYY-MM-DD)
    const timePattern = /\d{2}:\d{2}:\d{2}/; // Regular expression pattern to match the time (HH:mm:ss)
    const wordPattern = /\bTime\b/; // Regular expression pattern to match the word "Time"
    const colonPattern = /:/g;
    const result = inputString
      .replace(datePattern, "") // Remove the date portion
      .replace(timePattern, "") // Remove the time portion
      .replace(wordPattern, "") // Remove the word "Time"
      .replace(colonPattern, ""); // Remove the colon ":"
    return (
      <View style={[styles.containerTxt, { backgroundColor: Color.white }]}>
        <View style={styles.txtContainer}>
          <Text
            style={styles.txt}
          >{`${result} (${item?.item?.item_type})`}</Text>
        </View>
        <View style={styles.txtContainer}>
          <Text style={[styles.txt, { marginStart: 25 }]}>
            {item?.item?.occupant_count}
          </Text>
        </View>
        <View style={styles.txtContainer}>
          <Text style={styles.txt1}>{item?.item?.assigned_names}</Text>
        </View>
        <View style={styles.txtContainer}>
          {item?.item?.time_slot && (
            <Text style={styles.txt1}>
              {formatTimeSlotDate(item?.item?.time_slot)}
            </Text>
          )}
        </View>
      </View>
    );
  };
  const PaymentDetailsRender = (item) => {
    return (
      <View style={[styles.containerTxt, { backgroundColor: Color.white }]}>
        <View style={styles.paymentContainer}>
          <Text style={styles.txt}>{item?.item?.pay_mode}</Text>
        </View>
        <View style={styles.paymentContainer}>
          <Text style={[styles.txt, { marginStart: 25 }]}>
            &euro; {item?.item?.paid_amt}
          </Text>
        </View>
        <View style={styles.paymentContainer}>
          <Text style={styles.txt1}>{item?.item?.pay_ref}</Text>
        </View>
      </View>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: "white", paddingHorizontal: 25 }}>
      <FlatList
        data={details}
        // horizontal
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        ListHeaderComponent={
          <>
            <View style={styles.card}>
              <View style={styles.BilContainer}>
                <Image
                  source={Logo}
                  style={{
                    height: 30,
                    width: 30,
                    borderRadius: 30 / 2,
                    marginBottom: 10,
                  }}
                />
                <Text style={styles.txt2}>{Center_Id?.company_name}</Text>
                <Text style={styles.txt3}>
                  {mesterTabel?.center?.center_name}
                </Text>
                <Text style={styles.txt3}>{mesterTabel?.center?.address}</Text>
                <Text style={styles.txt3}>
                  {mesterTabel?.center?.city}, {mesterTabel?.center?.postcode}
                </Text>
                <Text style={styles.txt3}>{mesterTabel?.center?.email}</Text>
                {mesterTabel?.center?.contact_no && (
                  <Text style={styles.txt3}>
                    {mesterTabel?.center?.phone} /{" "}
                    {mesterTabel?.center?.contact_no}
                  </Text>
                )}
              </View>
              <View style={styles.BilContainer2}>
                <Text style={[styles.txt2, { marginTop: 40 }]}>INVOICE</Text>
                {mesterTabel?.invoice_no !== null ? (
                  <Text style={styles.text}> # {mesterTabel?.invoice_no}</Text>
                ) : (
                  <Text style={styles.text}>
                    INV # - <Text style={{ color: Color.red }}>Unpaid</Text>
                  </Text>
                )}
                <View>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: "#000000",
                      marginTop: 20,
                    }}
                  >
                    &euro; {mesterTabel?.net_amt}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.card}>
              <View style={styles.BilContainer}>
                <Text
                  style={[
                    styles.txt1,
                    {
                      color: "#4A4949",
                    },
                  ]}
                >
                  Bill To
                </Text>
                <Text style={styles.txt2}>{mesterTabel?.name}</Text>
                <Text style={styles.txt3}>
                  {mesterTabel?.address}, {mesterTabel?.city}
                </Text>
                <Text style={styles.txt3}>
                  {mesterTabel?.country}
                  {mesterTabel?.eir_code}
                </Text>
                <Text style={styles.txt3}>{mesterTabel?.email}</Text>

                <Text style={styles.txt3}>{mesterTabel?.contact_no}</Text>
              </View>
              <View style={styles.BilContainer2}>
                <Text style={[styles.txt2, { marginTop: 20 }]}>
                  INVOICE DATE
                </Text>
                <Text style={styles?.text}>
                  {displaDate(mesterTabel?.invoice_date)}
                </Text>
              </View>
            </View>
            <View style={styles.containerTxt}>
              <View style={styles.txtContainer}>
                <Text style={[styles.txt1, { color: Color.white }]}>
                  Service
                </Text>
              </View>
              <View style={styles.txtContainer}>
                <Text style={[styles.txt1, { color: Color.white }]}>
                  Occupants
                </Text>
              </View>
              <View style={styles.txtContainer}>
                <Text style={[styles.txt1, { color: Color.white }]}>
                  Assign member
                </Text>
              </View>
              <View style={styles.txtContainer}>
                <Text style={[styles.txt1, { color: Color.white }]}>
                  Date & Time
                </Text>
              </View>
            </View>
          </>
        }
        ListFooterComponent={
          paymentDetails.length > 0 ? (
            <View style={{ marginBottom: 20 }}>
              <Text style={[styles.txt2, { marginTop: 24 }]}>
                {" "}
                Payments Details
              </Text>
              <FlatList
                data={paymentDetails}
                // horizontal
                renderItem={PaymentDetailsRender}
                ListHeaderComponent={
                  <View style={styles.containerTxt}>
                    <View style={styles.paymentContainer}>
                      <Text style={[styles.txt1, { color: Color.white }]}>
                        Mode
                      </Text>
                    </View>
                    <View style={styles.paymentContainer}>
                      <Text style={[styles.txt1, { color: Color.white }]}>
                        Amount
                      </Text>
                    </View>
                    <View style={styles.paymentContainer}>
                      <Text style={[styles.txt1, { color: Color.white }]}>
                        Ref Id
                      </Text>
                    </View>
                  </View>
                }
                ListFooterComponent={
                  <>
                    {showCreditNotes && (
                      <View
                        style={{
                          height: 140,
                          width: "100%",
                          alignSelf: "center",
                          borderWidth: 0.5,
                          marginTop: 20,
                        }}
                      >
                        <Text style={[styles.txt2, { textAlign: "center" }]}>
                          {showCreditNotes?.is_cn == "0"
                            ? "GIFT VOUCHER"
                            : "CREDIT NOTE"}
                        </Text>
                        <View
                          style={{
                            height: 100,
                            width: "90%",
                            alignSelf: "center",
                            backgroundColor: "#CACACA",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            style={[
                              styles.txt2,
                              {
                                textAlign: "center",
                                borderStyle: "dashed",
                                borderWidth: 1.5,
                                borderRadius: 2,
                                padding: 2,
                                width: "60%",
                                alignSelf: "center",
                                borderColor: "#ffffff",
                              },
                            ]}
                          >
                            {showCreditNotes?.code}
                          </Text>
                          <Text style={[styles.txt1, { textAlign: "center" }]}>
                            {" "}
                            &euro; {showCreditNotes?.disc_value}
                          </Text>
                          <Text style={[styles.txt1, { textAlign: "center" }]}>
                            {showCreditNotes?.end_date}
                          </Text>
                        </View>
                      </View>
                    )}
                  </>
                }
              />
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default InvoiceDetails;

const styles = StyleSheet.create({
  BilContainer: {
    width: "60%",
    marginVertical: 10,
  },
  BilContainer2: {
    width: "40%",
    marginVertical: 10,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  text: {
    color: "#555454",
    fontWeight: "600",
    fontSize: 12,
    marginBottom: 4,
  },
  containerTxt: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 10,
    backgroundColor: "black",
  },
  txtContainer: {
    width: "25%",
    justifyContent: "center",
    paddingHorizontal: 10,
    // alignItems: 'center',
  },
  paymentContainer: {
    width: "33%",
    justifyContent: "center",
    paddingHorizontal: 10,
    // alignItems: 'center',
  },
  txt: { fontSize: 11, fontWeight: "600", color: "#535353", marginTop: 10 },
  txt1: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000000",
    marginVertical: 4,
  },
  txt2: {
    fontSize: 14,
    fontWeight: "600",
    color: Color.black,
    marginBottom: 4,
  },
  txt3: {
    fontSize: 12,
    fontWeight: "600",
    color: "#767272",
    marginBottom: 4,
  },
});
