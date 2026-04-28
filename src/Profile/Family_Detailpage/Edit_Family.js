import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Color } from "../../Color/Color";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "../../Button_Component/Button";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { url } from "../../api/Myurl";
import { Dropdown } from "react-native-element-dropdown";

// Helpers
import { ShowToast,Loader } from "../../Helpers";

const Edit_Family = (params) => {
  const navigation = useNavigation();
  const editFamily = params.route.params;
  const genderCheck =
    editFamily.gender == "Male"
      ? { id: 1, gender: "Male" }
      : { id: 2, gender: "Female" };
  const categoryCheck =
    editFamily.category == "Family"
      ? { id: 1, member: "Family" }
      : { id: 2, member: "Guest" };
  const [Token, setToken] = useState();
  const [name, setName] = useState(editFamily.firstname);
  const [lastName, setLastName] = useState(editFamily.lastname);
  const [visible, setVisible] = useState(
    editFamily?.is_manager === 1 ? true : false
  );
  const [contact_no, setContact_no] = useState(
    editFamily.contact_no === "null" ? "" : editFamily.contact_no
  );
  const [emg_contact_no, setemg_Contact_no] = useState(
    editFamily.emergency_contact_no === "null"
      ? ""
      : editFamily.emergency_contact_no
  );
  const [email, setEmail] = useState(
    editFamily.email === "null" ? "" : editFamily.email
  );
  const [dob, setDOB] = useState(
    editFamily.dob === "null" ? "" : editFamily.dob
  );
  const [address, setAddress] = useState(
    editFamily.address === "null" ? "" : editFamily.address
  );
  const [city, setCity] = useState(
    editFamily.city === "null" ? "" : editFamily.city
  );
  const [eir_code, setEir_code] = useState(
    editFamily.eir_code === "null" ? "" : editFamily.eir_code
  );
  const [gender, setGender] = useState(
    editFamily.gender === "null" || editFamily.gender === "undefined"
      ? ""
      : genderCheck
  );
  const [category, setCategory] = useState(
    editFamily.category === "null" || editFamily.category === "undefined"
      ? ""
      : categoryCheck
  );
  const [manager, setManager] = useState(
    editFamily?.is_manager == "1"
      ? { id: 1, manager: "Yes" }
      : { id: 0, manager: "No" }
  );
  const [loading, setLoading] = useState(false);
  // API FOR REGISTER PAGE
  useEffect(() => {
    gettoken();
  }, []);
  const gettoken = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");
      if (session !== null) {
        const tokenSession = JSON.parse(session).data;
        setToken(tokenSession.token);
      }
    } catch (error) {
      console.log("token error....");
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
    const DATE = new Date(date);
    const Reg_Date1 = DATE.toISOString().split("T");
    const Reg_Date2 = Reg_Date1[0].split("-");
    setDOB(Reg_Date2[0] + "-" + Reg_Date2[1] + "-" + Reg_Date2[2]);
    hideDatePicker();
  };

  const handaleQuestion = (item) => {
    setManager(item);
    if (item?.manager === "No") {
      setVisible(false);
    } else {
      setVisible(true);
    }
  };
  const privateUpdateCustomer = async () => {
    if (!name) {
      ShowToast("First name is required");
      return true;
    }
    if (!lastName) {
      ShowToast("Last name is required");
      return true;
    }
    if (!dob) {
      ShowToast("DOB is required");
      return true;
    }

    if (!email) {
      if (manager.manager === "Yes") {
        ShowToast("Email is required");
        return true;
      }
    }
    // if (!email) {
    //   ShowToast('Email is required');
    //   return true;
    // }
    setLoading(true);
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${Token}`);

    var formdata = new FormData();
    formdata.append("firstname", name);
    formdata.append("lastname", lastName);
    formdata.append("email", email);
    formdata.append("id", editFamily.id);
    formdata.append("gender", gender?.gender);
    formdata.append("dob", dob);
    formdata.append("category", category?.member);
    formdata.append("address", address);
    formdata.append("city", city);
    formdata.append("eir_code", eir_code);
    formdata.append("emergency_contact_no", emg_contact_no);
    formdata.append("is_manager", manager?.id);
    formdata.append("contact_no", contact_no);
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    fetch(`${url}privateUpdateCustomer`, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        const newData = JSON.parse(result);
        setLoading(false);
        if (newData.error === false) {
          navigation.navigate("Family_List");
          setName("");
          setEmail("");
          setGender("");
          setDOB("");
          setCategory("");
          setAddress("");
          setEir_code("");
        }
        ShowToast(newData.msg);
      })
      .catch((error) => {
        setLoading(false);
        console.log("error", error);
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
  return (
    <ScrollView
      style={{
        backgroundColor: Color.white,
        height: "100%",
        paddingHorizontal: 10,
      }}
    >
      <View style={{ backgroundColor: Color.white, height: "100%" }}>
        <View style={{ marginBottom: 6, marginTop: 10 }}>
          <Text style={styles.RadioButtonHeader}>{"First name *"}</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={Color.gray}
            value={name}
            onChangeText={(name) => setName(name)}
            placeholder="Enter First name *"
          />
        </View>
        <View style={{ marginBottom: 6, marginTop: 10 }}>
          <Text style={styles.RadioButtonHeader}>{"Last name *"}</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={Color.gray}
            value={lastName}
            onChangeText={(name) => setLastName(name)}
            placeholder="Enter Last name *"
          />
        </View>
        <View style={{ marginBottom: 6 }}>
          <Text style={styles.RadioButtonHeader}>{"DOB *"}</Text>
          <View
            style={[
              styles.input,
              {
                justifyContent: "space-evenly",
                flexDirection: "row",
                padding: 0,
              },
            ]}
          >
            <TextInput
              keyboardType="numeric"
              style={styles.inputwidth}
              placeholderTextColor={Color.gray}
              value={displaDate(dob)}
              onChangeText={(dob) => setDOB(dob)}
              placeholder="dd-mm-yyyy"
            />
            <TouchableOpacity>
              <MaterialIcons
                onPress={showDatePicker}
                name="date-range"
                color={Color.black}
                size={30}
                style={{
                  marginVertical: 5,
                  marginHorizontal: 35,
                  marginRight: "0%",
                }}
              />
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ marginBottom: 6 }}>
          <Text style={styles.RadioButtonHeader}>Is the person an adult ?</Text>
          <Dropdown
            style={styles.dropdown}
            data={[
              { id: 0, manager: "No" },
              { id: 1, manager: "Yes" },
            ]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            itemContainerStyle={{ backgroundColor: "#ffffff" }}
            itemTextStyle={styles.itemTextStyle}
            activeColor={"#FFF2C2"}
            labelField="manager"
            maxHeight={200}
            valueField="id"
            placeholder={"Member Type"}
            value={manager}
            onChange={(item) => {
              handaleQuestion(item);
            }}
          />
        </View>
        {visible === true && (
          <>
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.RadioButtonHeader}>{"Mobile Number"}</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                maxLength={15}
                placeholderTextColor={Color.gray}
                value={contact_no}
                onChangeText={(contact_no) => setContact_no(contact_no)}
                placeholder="Mobile Number"
              />
            </View>
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.RadioButtonHeader}>{"Email *"}</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor={Color.gray}
                value={email}
                onChangeText={(email) => setEmail(email)}
                placeholder="Email Address *"
              />
            </View>
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.RadioButtonHeader}>{"Address"}</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor={Color.gray}
                value={address}
                onChangeText={(address) => setAddress(address)}
                placeholder="Address"
              />
            </View>
            <View style={{ flexDirection: "row", marginBottom: 6 }}>
              <View style={{ width: "50%" }}>
                <Text style={styles.RadioButtonHeader}>City</Text>
                <TextInput
                  style={styles.input}
                  placeholderTextColor={Color.gray}
                  value={city}
                  onChangeText={(city) => setCity(city)}
                  placeholder="City"
                />
              </View>
              <View style={{ width: "50%" }}>
                <Text style={styles.RadioButtonHeader}>Eircode</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="default"
                  placeholderTextColor={Color.gray}
                  value={eir_code}
                  maxLength={15}
                  onChangeText={(eir_code) => setEir_code(eir_code)}
                  placeholder="Eircode"
                />
              </View>
            </View>
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.RadioButtonHeader}>Emergency Number</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                maxLength={10}
                placeholderTextColor={Color.gray}
                value={emg_contact_no}
                onChangeText={(emg_contact_no) =>
                  setemg_Contact_no(emg_contact_no)
                }
                placeholder="Emergency Mobile Number"
              />
            </View>
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.RadioButtonHeader}>Gender</Text>
              <Dropdown
                style={styles.dropdown}
                data={[
                  { id: 1, gender: "Male" },
                  { id: 2, gender: "Female" },
                ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                itemContainerStyle={{ backgroundColor: "#ffffff" }}
                itemTextStyle={styles.itemTextStyle}
                activeColor={"#FFF2C2"}
                labelField="gender"
                maxHeight={200}
                valueField="id"
                placeholder={"Gender"}
                value={gender}
                onChange={(item) => {
                  setGender(item);
                }}
              />
            </View>
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.RadioButtonHeader}>Member</Text>
              <Dropdown
                style={styles.dropdown}
                data={[
                  { id: 1, member: "Family" },
                  { id: 2, member: "Guest" },
                ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                itemContainerStyle={{ backgroundColor: "#ffffff" }}
                itemTextStyle={styles.itemTextStyle}
                activeColor={"#FFF2C2"}
                labelField="member"
                maxHeight={200}
                valueField="id"
                placeholder={"Member"}
                value={category}
                onChange={(item) => {
                  setCategory(item);
                }}
              />
            </View>
          </>
        )}
        <Button label={"Update Family"} onPress={privateUpdateCustomer} />
      </View>
    </ScrollView>
  );
};

export default Edit_Family;

const styles = StyleSheet.create({
  input: {
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 5,
    height: 40,
    color: Color.black,
    backgroundColor: Color.white,
    fontSize: 15,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: Color.gray,
  },
  inputwidth: {
    width: "80%",
    color: Color.black,
  },
  radiobtntext: {
    margin: 5,
    color: Color.black,
    fontSize: 13,
    fontWeight: "600",
  },
  companyview: {
    flexDirection: "row",
  },
  RadioButtonHeader: {
    marginHorizontal: 10,
    fontWeight: "500",
    fontSize: 14,
    color: Color.black,
  },
  dropdown: {
    height: 45,
    borderWidth: 1,
    borderColor: Color.lightgray,
    padding: 5,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  placeholderStyle: {
    fontSize: 15,
    color: Color.gray,
  },
  selectedTextStyle: {
    fontSize: 15,
    color: Color.black,
  },
  itemTextStyle: {
    fontSize: 15,
    color: Color.black, // Text color for dropdown items
  },
});
