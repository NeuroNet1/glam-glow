import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Modal,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FastImage from "react-native-fast-image";
import { Color } from "../Color/Color";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { url, Asseturl } from "../api/Myurl";
import { MyWebView } from "../component";
import swimming from "../Images/swimming.png";
import familyGroup from "../Images/familyGroup.png";
import cardMemberShip from "../Images/cardMemberShip.png";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import DeviceInfo from "react-native-device-info";
import { useDispatch } from "react-redux";
import { clearCart } from "../ReduxToolKit/AddCartSlice.js";

//Helpers
import { ShowToast, Loader } from "../Helpers";

const Profile = () => {
  const currentVersion = DeviceInfo.getVersion();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [data, setDate] = useState("");
  const [TOKEN, setTOKEN] = useState("");
  const [Center_Id, setCenter_Id] = useState("");
  const [selectOption, setSelectOption] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    checkLogin();
  }, [isFocused]);
  const checkLogin = async (isSelected) => {
    setLoading(true);
    try {
      const centerid = await AsyncStorage.getItem("Centerdata");
      const centerDetails = JSON.parse(centerid);
      setCenter_Id(centerDetails);
      const session = await AsyncStorage.getItem("user_session");
      if (session !== undefined && session !== null) {
        const sessionID = JSON.parse(session)?.data;
        setTOKEN(sessionID?.token);
        getCustomerProfile(sessionID?.token);
        setLoading(false);
      } else {
        navigation.navigate("Login");
        setLoading(false);
      }
    } catch (error) {
      // There was an error on the native side
    }
  };
  // this is get image in gallery
  const onImageLibraryPress = () => {
    const options = {
      mediaType: "photo",
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.errorCode) {
        console.log("ImagePicker Error code: ", response);
      } else if (response.errorMessage) {
        console.log("ImagePicker Error Message: ", response.errorMessage);
      } else {
        // You can display the image using either data...
        const source = {
          uri: response.assets[0].uri,
        };
        UploadImage(response);
        // or a reference to the platform specific asset location
      }
    });
  };

  // this is get Image in capture camera
  const onImageCameraPress = () => {
    const options = {
      mediaType: "photo",
      maxWidth: 1000,
      maxHeight: 1000,
      quality: 0.8,
    };
    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.errorCode) {
        console.log("ImagePicker Error code: ", response.errorCode);
      } else if (response.errorMessage) {
        console.log("ImagePicker Error Message: ", response.errorMessage);
      } else {
        // You can display the image using either data...
        const source = {
          uri: response.assets[0].uri,
        };
        UploadImage(response);
        // or a reference to the platform specific asset location
      }
    });
  };
  const UploadImage = (value) => {
    setLoading(true);
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "multipart/form-data");
    myHeaders.append("Authorization", `Bearer ${TOKEN}`);

    var formdata = new FormData();
    formdata.append("image", {
      uri:
        Platform.OS === "android"
          ? value.assets[0].uri
          : value.assets[0].uri.replace("file://", ""),
      type: value.assets[0].type,
      name: value.assets[0].fileName,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };
    fetch(`${url}cuploadProfileImage`, requestOptions)
      .then((response) => {
        if (response.status === 401) {
          ShowToast("Your token is expired");
          navigation.navigate("Login");
          setLoading(false);
        } else if (response.ok) {
          return response.text();
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .then((result) => {
        const newData = JSON.parse(result);
        if (newData.error === false) {
          setSelectOption(false);
          getCustomerProfile(TOKEN);
        }
        setLoading(false);
        ShowToast(newData.msg);
      })
      .catch((error) => {
        setLoading(false);
        console.log("error", error);
      });
  };

  const getCustomerProfile = (value) => {
    setLoading(true);
    fetch(`${url}getCustomerProfile`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + value,
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => {
        if (response.status === 401) {
          ShowToast("Your token is expired");
          navigation.navigate("Login");
          setLoading(false);
        } else if (response.ok) {
          return response.text();
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .then((result) => {
        setDate(JSON.parse(result).data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
      });
  };
  const Logout = async () => {
    setLoading(true);
    fetch(`${url}privateLogout`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + TOKEN,
        "Content-Type": "multipart/form-data",
      },
    })
      .then(async (response) => {
        if (response.status === 401) {
          // Handle the 401 Unauthorized error here
          // For example, you can log the error, show an error message to the user, or perform a logout action.
          ShowToast("Your token is expired");
          navigation.navigate("Login");
          setLoading(false);
          // You can also redirect to a login screen or perform any other desired action.
        } else if (response.ok) {
          return response.text();
        }
      })
      .then(async (result) => {
        const newData = JSON.parse(result);
        setLoading(false);
        if (newData.error === false) {
          navigation.navigate("Login");
          dispatch(clearCart());
          await AsyncStorage.removeItem("user_session");
        }
        ShowToast(newData.msg);
      })
      .catch((error) => {
        setLoading(false);
      });
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
  if (loading) {
    return <Loader />;
  }
  if (visible) {
    return <MyWebView visible={visible} handleBack={() => setVisible(false)} />;
  }
  return (
    <ScrollView
      style={{
        backgroundColor: Color.whitesmoke,
        height: "100%",
        paddingHorizontal: 20,
      }}
    >
      <SafeAreaView>
        <View style={styles.profileview}>
          <View style={{ flexDirection: "column", marginTop: 10 }}>
            <View style={{ flexDirection: "row" }}>
              <Text
                style={{ color: Color.black, fontWeight: "700", fontSize: 16 }}
              >
                {data?.name}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Edit_Profile")}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 0,
                  borderRadius: 4,
                  marginHorizontal: 15,
                  marginVertical: 5,
                  backgroundColor: Color.antiquewhite,
                  borderWidth: 1,
                  borderColor: Color.red,
                }}
              >
                <Text
                  style={{ color: Color.red, fontWeight: "bold", fontSize: 10 }}
                >
                  Edit
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={[styles.texts, { margin: 0, color: "#6B6A6A" }]}>
                {data?.email}
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={[styles.texts, { margin: 0 }]}>
                {data?.contact_no}
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={[styles.texts, { margin: 0 }]}>
                {displaDate(data?.dob)}
              </Text>
            </View>
          </View>
          <View style={styles.profileimage_qrcode}>
            <TouchableOpacity
              disabled={!!data?.img}
              onPress={() => {
                setSelectOption(true);
              }}
            >
              <FastImage
                source={
                  data?.img
                    ? { uri: `${Asseturl}${data?.img}` }
                    : require("../Images/ProfileImage.png")
                }
                style={styles.profileimage}
                resizeMode={FastImage.resizeMode.cover}
              />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => navigation.navigate("Access")}
            >
              <MaterialIcons
                name="qr-code-2"
                style={styles.qrcodeicon}
                size={30}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text
          style={{ textAlign: "justify", fontSize: 12, color: Color.brown }}
        >
          {
            "Note: You can upload your profile picture only once. Please ensure you select the correct image before submitting."
          }
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            // margin: 5,
          }}
        >
          <TouchableOpacity
            style={styles.cards}
            // onPress={() => navigation.navigate('Payment_method', storedata)}
            onPress={() => navigation.navigate("Subscription")}
          >
            <Image
              source={cardMemberShip}
              style={[styles.icons, { height: 30, width: 30 }]}
            />
            <Text
              style={[
                styles.texts,
                { textAlign: "center", paddingHorizontal: 2 },
              ]}
            >
              Membership
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cards}
            onPress={() => navigation.navigate("Family_List")}
          >
            <Image
              source={familyGroup}
              style={[styles.icons, { height: 30, width: 30 }]}
            />
            <Text style={[styles.texts, { textAlign: "center" }]}>Family</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Courses")}
            style={styles.cards}
          >
            <Image
              source={swimming}
              style={[styles.icons, { height: 30, width: 30 }]}
            />
            <Text style={[styles.texts, { textAlign: "center" }]}>
              Swimming lesson
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            marginVertical: 10,
            borderRadius: 5,
            backgroundColor: Color.whitesmoke,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => navigation.navigate("AllClasses")}
            style={styles.cardPolicy}
          >
            <View style={{ flexDirection: "row" }}>
              <MaterialIcons name="history" style={styles.materialIcon} />
              <Text style={styles.textPolicy}>Upcoming Bookings</Text>
            </View>
            <MaterialIcons
              name="arrow-forward-ios"
              style={[styles.icons, { fontSize: 20, margin: 14 }]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => navigation.navigate("Payment_method")}
            style={styles.cardPolicy}
          >
            <View style={{ flexDirection: "row" }}>
              <Image
                source={cardMemberShip}
                style={{
                  height: 20,
                  width: 20,
                  margin: 14,
                  tintColor: "#1D1CE5",
                  alignSelf: "center",
                }}
              />
              {/* <MaterialIcons name="history" style={styles.materialIcon} /> */}
              <Text style={styles.textPolicy}>Payment Method</Text>
            </View>
            <MaterialIcons
              name="arrow-forward-ios"
              style={[styles.icons, { fontSize: 20, margin: 14 }]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => navigation.navigate("History")}
            style={styles.cardPolicy}
          >
            <View style={{ flexDirection: "row" }}>
              <MaterialIcons name="history" style={styles.materialIcon} />
              <Text style={styles.textPolicy}>Booking History</Text>
            </View>
            <MaterialIcons
              name="arrow-forward-ios"
              style={[styles.icons, { fontSize: 20, margin: 14 }]}
            />
          </TouchableOpacity>
          {Center_Id?.privacy_url && (
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => Linking.openURL(Center_Id?.privacy_url)}
              style={styles.cardPolicy}
            >
              <View
                style={{
                  flexDirection: "row",
                }}
              >
                <MaterialIcons name="privacy-tip" style={styles.materialIcon} />
                <Text style={styles.textPolicy}>Privacy Policy</Text>
              </View>
              <MaterialIcons
                name="arrow-forward-ios"
                style={[styles.icons, { fontSize: 20, margin: 14 }]}
              />
            </TouchableOpacity>
          )}
          {Center_Id?.tnc_url && (
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => Linking.openURL(Center_Id?.tnc_url)}
              style={styles.cardPolicy}
            >
              <View
                style={{
                  flexDirection: "row",
                }}
              >
                <MaterialIcons name="file-copy" style={styles.materialIcon} />
                <Text style={styles.textPolicy}>Terms of use</Text>
              </View>
              <MaterialIcons
                name="arrow-forward-ios"
                style={[styles.icons, { fontSize: 20, margin: 14 }]}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => navigation.navigate("Call_Support")}
            style={styles.cardPolicy}
          >
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <MaterialIcons name="headset-mic" style={styles.materialIcon} />
              <Text style={styles.textPolicy}>Call support</Text>
            </View>
            <MaterialIcons
              name="arrow-forward-ios"
              style={[styles.icons, { fontSize: 20, margin: 14 }]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => navigation.navigate("Faq")}
            style={styles.cardPolicy}
          >
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <MaterialIcons name="shield" style={styles.materialIcon} />
              <Text style={styles.textPolicy}>FAQ</Text>
            </View>
            <MaterialIcons
              name="arrow-forward-ios"
              style={[styles.icons, { fontSize: 20, margin: 14 }]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={
              () => setVisible(true)
              // navigation.navigate('MyWebView', {
              //   url: 'https://userguide.appcoralleisure.ie/',
              // })
            }
            style={styles.cardPolicy}
          >
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <MaterialIcons name="book" style={styles.materialIcon} />
              <Text style={styles.textPolicy}>User Guide</Text>
            </View>
            <MaterialIcons
              name="arrow-forward-ios"
              style={[styles.icons, { fontSize: 20, margin: 14 }]}
            />
          </TouchableOpacity>
          {Center_Id?.healthtnc_url && (
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => Linking.openURL(Center_Id?.healthtnc_url)}
              style={styles.cardPolicy}
            >
              <View
                style={{
                  flexDirection: "row",
                }}
              >
                <MaterialIcons
                  name="medical-services"
                  style={styles.materialIcon}
                />
                <Text style={styles.textPolicy}>Health Policy</Text>
              </View>
              <MaterialIcons
                name="arrow-forward-ios"
                style={[styles.icons, { fontSize: 20, margin: 14 }]}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => navigation.navigate("ResetPassword")}
            style={styles.cardPolicy}
          >
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <MaterialIcons name="lock" style={styles.materialIcon} />
              <Text style={styles.textPolicy}>Change Password</Text>
            </View>
            <MaterialIcons
              name="arrow-forward-ios"
              style={[styles.icons, { fontSize: 20, margin: 14 }]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={Logout}
            style={styles.cardPolicy}
          >
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <MaterialIcons name="logout" style={styles.materialIcon} />
              <Text style={styles.textPolicy}>Logout</Text>
            </View>
            <MaterialIcons
              name="arrow-forward-ios"
              style={[styles.icons, { fontSize: 20, margin: 14 }]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => navigation.navigate("Delete_Account")}
            style={styles.cardPolicy}
          >
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <MaterialIcons name="person-remove" style={styles.materialIcon} />
              <Text style={styles.textPolicy}> Request Delete Account</Text>
            </View>
            <MaterialIcons
              name="arrow-forward-ios"
              style={[styles.icons, { fontSize: 20, margin: 14 }]}
            />
          </TouchableOpacity>
        </View>
        <Text
          style={[
            styles.texts,
            { textAlign: "center", fontSize: 12, marginBottom: 10 },
          ]}
        >
          Version {currentVersion}
        </Text>
        <Modal
          animationType="slide"
          transparent={true}
          visible={selectOption}
          onRequestClose={() => {
            setSelectOption(!selectOption);
          }}
        >
          <View style={styles.modal}>
            <TouchableOpacity
              style={[styles.Button, { marginBottom: 1 }]}
              onPress={() => onImageCameraPress()}
            >
              <Text style={styles.modalText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.Button}
              onPress={() => onImageLibraryPress()}
            >
              <Text style={styles.modalText}>Choose Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.Button,
                { marginVertical: 4, backgroundColor: Color.white },
              ]}
              onPress={() => setSelectOption(false)}
            >
              <Text style={styles.modalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </SafeAreaView>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  profileview: {
    flexDirection: "row",
    backgroundColor: Color.white,
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    justifyContent: "space-between",
  },
  profileicon: {
    color: Color.black,
    fontSize: 15,
    margin: 3,
  },
  profileimage: {
    borderRadius: 50,
    width: 100,
    height: 100,
    borderColor: Color.white,
  },
  qrcodeicon: {
    position: "absolute",
    top: -30,
    left: 50,
    backgroundColor: Color.white,
    textAlign: "center",
    alignSelf: "center",
    color: Color.black,
    padding: 5,
    height: 40,
    width: 40,
    borderRadius: 40 / 2,
    overflow: "hidden",
  },
  profileimage_qrcode: {
    // backgroundColor: 'orange',
  },
  texts: {
    color: "#6B6A6A",
    fontSize: 12,
    marginBottom: 5,
    fontWeight: "600",
  },
  icons: {
    alignSelf: "center",
    // color: Color.gradient1,
  },
  cards: {
    width: "32%",
    marginHorizontal: 2,
    marginTop: 10,
    paddingHorizontal: 2,
    paddingVertical: 20,
    backgroundColor: Color.white,
    borderRadius: 10,
  },
  cardPolicy: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 10,
    marginTop: 6,
  },
  textPolicy: {
    marginHorizontal: 20,
    fontWeight: "600",
    fontSize: 12,
    color: "#5C5B5B",
    alignSelf: "center",
  },

  modal: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#00000066",
    padding: 16,
    alignItems: "center",
  },
  Button: {
    backgroundColor: Color.antiquewhite,
    paddingVertical: 15,
    borderRadius: 10,
    width: 370,
    justifyContent: "center",
    alignItems: "center",
  },
  materialIcon: {
    fontSize: 20,
    margin: 14,
    color: "#1D1CE5",
    alignSelf: "center",
  },
  modalText: { fontSize: 14, color: Color.black, fontWeight: "600" },
});
