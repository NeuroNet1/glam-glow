import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Color } from "../Color/Color";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import CheckBox from "@react-native-community/checkbox";
import Button from "../Button_Component/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { country } from "../UtilityData/staticData";
import { Dropdown } from "react-native-element-dropdown";
import { url } from "../api/Myurl";

// Helpers
import { ShowToast, Loader } from "../Helpers";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [countryID, setCountryID] = useState("");
  const [isUnder16, setIsUnder16] = useState(false);
  const [guardianConsent, setGuardianConsent] = useState(false);
  useEffect(() => {
    gettoken();
  }, []);
  const gettoken = async () => {
    try {
      const centerid = await AsyncStorage.getItem("Centerdata");

      setCenter_Id(JSON.parse(centerid));
    } catch (error) {
      console.log("Register center id  error....", error);
    }
  };
  // date picker
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    const today = new Date();
    const birthDate = new Date(date);
    const age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    const formattedDate = birthDate.toISOString().split("T")[0]; // yyyy-mm-dd
    setdob(formattedDate);
    setIsUnder16(age < 16); // check if age is under 16
    hideDatePicker();
  };
  const navigation = useNavigation();
  // usestate for password secure text entry
  const [secureTextEntry, setsecureTextEntry] = useState(true);
  // use state for input validation
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contact_no, setcontact_no] = useState("");
  const [email, setemail] = useState("");
  const [dob, setdob] = useState("");
  const [address, setaddress] = useState("");
  const [city, setcity] = useState("");
  const [eircode, seteircode] = useState("");
  const [healthtnc_url, setHealthtnc_url] = useState("");
  const [tnc_url, setTnc_url] = useState("");
  const [Center_Id, setCenter_Id] = useState("");
  const [password, setpassword] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  // API FOR REGISTER PAGE
  let Registerapi = () => {
    if (!name || name == "") {
      ShowToast("First name is required.");
      return;
    }
    if (!lastName || lastName == "") {
      ShowToast("Last name is required.");
      return;
    }
    if (!email || email == "") {
      ShowToast("Email is required.");
      return;
    }
    if (!contact_no || contact_no.length < 10) {
      ShowToast("Enter valid contact no.");
      return;
    }
    if (!dob || dob == "") {
      ShowToast("DOB is required.");
      return;
    }
    if (!password || password.length < 6) {
      ShowToast("Enter valid password more than 5 characters.");
      return;
    } else {
      if (!healthtnc_url || healthtnc_url == 0) {
        ShowToast("Accept Health Commitment Statement.");
        return;
      }
      if (isUnder16 && !guardianConsent) {
        ShowToast("Please confirm guardian consent for under-16 member.");
        return;
      }
      if (!tnc_url || tnc_url == 0) {
        ShowToast("Accept terms & conditions and privacy policy .");
        return;
      }
    }
    setLoading(true);
    var formdata = new FormData();
    formdata.append("firstname", name);
    formdata.append("lastname", lastName);
    formdata.append("contact_no", contact_no);
    formdata.append("email", email);
    formdata.append("dob", dob);
    formdata.append("address", address);
    formdata.append("city", city);
    formdata.append("eircode", eircode);
    formdata.append("country", countryID?.country);
    formdata.append("password", password);
    formdata.append("healthtnc_url", healthtnc_url);
    formdata.append("tnc_url", tnc_url);
    formdata.append("center_id", Center_Id?.id);
    formdata.append("emergency_contact_person", emergencyContact);
    fetch(`${url}registerCustomer`, {
      method: "POST",
      body: formdata,
      // headers: myHeaders,
      redirect: "follow",
    })
      .then((response) => response.text())
      .then((result) => {
        var newData = JSON.parse(result);
        if (newData.error === false) {
          navigation.navigate("Login");
          AsyncStorage.setItem("user_session", JSON.stringify(newData.data));
        }
        setLoading(false);
        ShowToast(newData?.msg);
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  if (loading) {
    return <Loader />;
  }
  return (
    <ScrollView
      style={{
        backgroundColor: Color.white,
        height: "100%",
        paddingHorizontal: 10,
      }}
    >
      <View style={{ backgroundColor: Color.white, height: "100%" }}>
        <Image
          source={require("../Images/logoRound.png")}
          style={styles.image}
        />

        {/* <Image
          style={styles.imagestyle}
          source={require('../Images/Register.jpg')}
        /> */}
        <View style={styles.loginView}>
          <Text style={[styles.text, { marginVertical: 10, fontSize: 25 }]}>
            Welcome to {Center_Id?.center_name}
          </Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={Color.gray}
            value={name}
            onChangeText={(name) => setName(name)}
            placeholder="First Name"
          />
          <TextInput
            style={styles.input}
            placeholderTextColor={Color.gray}
            value={lastName}
            onChangeText={(name) => setLastName(name)}
            placeholder="Last Name"
          />
          <TextInput
            style={styles.input}
            placeholderTextColor={Color.gray}
            value={email}
            onChangeText={(email) => setemail(email)}
            placeholder="Email"
          />
          <TextInput
            style={styles.input}
            placeholderTextColor={Color.gray}
            keyboardType="numeric"
            maxLength={15}
            value={contact_no}
            onChangeText={(contact_no) => setcontact_no(contact_no)}
            placeholder="Mobile Number"
          />
          <TextInput
            style={styles.input}
            placeholderTextColor={Color.gray}
            value={address}
            onChangeText={(address) => setaddress(address)}
            placeholder="Address"
          />
          <View>
            <TextInput
              style={styles.input}
              placeholderTextColor={Color.gray}
              value={city}
              onChangeText={(city) => setcity(city)}
              placeholder="City"
            />
          </View>
          <View>
            <TextInput
              style={styles.input}
              placeholderTextColor={Color.gray}
              keyboardType="default"
              maxLength={15}
              value={eircode}
              onChangeText={(eircode) => seteircode(eircode)}
              placeholder="Eircode"
            />
            <View>
              <TextInput
                style={styles.input}
                placeholderTextColor={Color.gray}
                keyboardType="numeric"
                maxLength={10}
                value={emergencyContact}
                onChangeText={(txt) => setEmergencyContact(txt)}
                placeholder="Emergency contact person No."
              />
            </View>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              itemContainerStyle={{ backgroundColor: "#ffffff" }}
              itemTextStyle={styles.itemTextStyle}
              activeColor={"#FFF2C2"}
              data={country}
              maxHeight={300}
              labelField="country"
              valueField="id"
              placeholder={"Select country"}
              value={countryID}
              onChange={(item) => {
                setCountryID(item);
              }}
            />
          </View>
          <View style={styles.dobContainer}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginStart: 10,
              }}
            >
              <Text
                style={{ fontSize: 14, fontWeight: "600", color: Color.gray }}
              >
                {"DOB -"}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.input, { flexDirection: "row" }]}
              onPress={showDatePicker}
            >
              <TextInput
                style={{ width: "70%", color: Color.black }}
                placeholderTextColor={Color.gray}
                value={dob}
                keyboardType="numeric"
                placeholder="yyyy-mm-dd"
                editable={false}
              />
              <MaterialIcons name="date-range" style={styles.icon} />
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
              />
            </TouchableOpacity>
          </View>
          <View style={[styles.input, { flexDirection: "row" }]}>
            <TextInput
              style={styles.textInputField}
              placeholderTextColor={Color.grey}
              placeholder="Password"
              value={password}
              onChangeText={(password) => setpassword(password)}
              secureTextEntry={secureTextEntry}
            />
            <TouchableOpacity
              onPress={() => {
                setsecureTextEntry((prev) => !prev);
              }}
            >
              <MaterialIcons
                name={secureTextEntry ? "visibility" : "visibility-off"}
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
          <View style={{ margin: 10 }}>
            <View style={{ flexDirection: "row" }}>
              <CheckBox
                style={{ marginVertical: 3 }}
                tintColors={"black"}
                value={healthtnc_url}
                onValueChange={(healthtnc_url) =>
                  setHealthtnc_url(healthtnc_url)
                }
              />
              <Text
                style={{
                  margin: 5,
                  fontSize: 11,
                  fontWeight: "400",
                  width: "90%",
                  color: Color.black,
                }}
              >
                I agree to Health Commitment Statment and will ask for assitance
                from an Everyone Active Colleague, for any pieces of Equipment
                that I am unsure how to use.{" "}
                <Text
                  style={{ color: Color.blue, fontSize: 11, fontWeight: "600" }}
                >
                  Health Commitment Statment
                </Text>
                .
              </Text>
            </View>
            {isUnder16 && (
              <View style={{ flexDirection: "row" }}>
                <CheckBox
                  style={{ marginVertical: 3 }}
                  value={guardianConsent}
                  onValueChange={setGuardianConsent}
                />
                <Text
                  style={{
                    margin: 5,
                    fontSize: 11,
                    fontWeight: "400",
                    width: "90%",
                    color: Color.black,
                  }}
                >
                  I confirm that I am the parent/legal guardian of the under-16
                  member, accept responsibility for payments, and consent to
                  being the primary contact for all communications and
                  notifications.
                </Text>
              </View>
            )}
            <View style={{ flexDirection: "row" }}>
              <CheckBox
                style={{ marginVertical: 3 }}
                value={tnc_url}
                tintColors={"black"}
                onValueChange={(tnc_url) => setTnc_url(tnc_url)}
              />
              <Text
                style={{
                  margin: 5,
                  fontSize: 11,
                  fontWeight: "400",
                  width: "90%",
                  color: Color.black,
                }}
              >
                I have read and agree to the
                <Text
                  style={[
                    styles.checkboxtext,
                    {
                      fontSize: 11,
                      fontWeight: "600",
                    },
                  ]}
                  onPress={() => navigation.navigate("Terms_condition")}
                >
                  {" "}
                  terms and conditions
                </Text>{" "}
                and
                <Text
                  style={styles.checkboxtext}
                  onPress={() => navigation.navigate("Privacy")}
                >
                  {" "}
                  privacy policy
                </Text>
                .
              </Text>
            </View>
          </View>
          <Button label={"Register"} onPress={Registerapi} />
          <Text
            style={[
              styles.text,
              {
                fontSize: 15,
                marginTop: "5%",
                textAlign: "center",
              },
            ]}
          >
            Already have an account!{" "}
            <Text
              style={{ color: Color.blue, fontWeight: "bold" }}
              onPress={() => navigation.navigate("Login")}
            >
              Login
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default Register;

const styles = StyleSheet.create({
  loginView: {
    backgroundColor: Color.white,
    paddingVertical: "2%",
  },
  image: {
    height: 85,
    width: 85,
    borderRadius: 85 / 2,
    resizeMode: "contain",
    alignSelf: "center",
  },
  imagestyle: {
    marginHorizontal: "25%",
    width: "50%",
    height: 190,
  },
  text: {
    fontWeight: "bold",
    marginHorizontal: 10,
    color: Color.gradient1,
  },
  input: {
    backgroundColor: Color.white,
    margin: 10,
    borderRadius: 5,
    height: 40,
    color: Color.black,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
    borderWidth: 1,
    paddingStart: 10,
    borderColor: Color.lightgrey,
  },
  icon: {
    fontSize: 18,
    marginVertical: 6,
    backgroundColor: Color.white,
    color: Color.black,
    padding: 4,
    borderRadius: 20,
  },
  checkboxtext: {
    margin: 5,
    width: "90%",
    color: Color.blue,
  },
  dropdown: {
    height: 45,
    margin: 10,
    borderWidth: 1,
    borderColor: Color.gray,
    padding: 2,
    borderRadius: 5,
  },
  placeholderStyle: {
    fontSize: 15,
    color: Color.gray,
    paddingStart: 8,
  },
  selectedTextStyle: {
    fontSize: 15,
    color: Color.black,
  },
  itemTextStyle: {
    fontSize: 15,
    color: Color.black, // Text color for dropdown items
  },
  dobContainer: {
    backgroundColor: Color.white,
    color: Color.black,
    fontSize: 15,
    marginBottom: 2,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  textInputField: {
    width: "90%",
    fontSize: 13,
    fontWeight: "600",
    color: Color.black,
  },
});
