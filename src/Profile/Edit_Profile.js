import {
  SafeAreaView,
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Color} from '../Color/Color';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Button from '../Button_Component/Button';
import {url} from '../api/Myurl';
import {Dropdown} from 'react-native-element-dropdown';

// Helpers
import { ShowToast, Loader } from "../Helpers";

const Edit_Profile = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [token, settoken] = useState();
  const [data, setData] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contact_no, setcontact_no] = useState('');
  const [email, setemail] = useState('');
  const [dob, setdob] = useState('');
  const [gender, setgender] = useState('');
  const [category, setCategory] = useState('');
  const [address, setaddress] = useState('');
  const [emergency_contact_no, setemergency_contact_no] = useState('');
  const [city, setcity] = useState('');
  const [eir_code, seteir_code] = useState('');
  const [manager, setManager] = useState(0);
  const [type, settype] = useState('');
  useEffect(() => {
    gettoken();
  }, []);
  const gettoken = async () => {
    try {
      const session = await AsyncStorage.getItem('user_session');
      if (session !== null) {
        const tokenSession = JSON.parse(session).data;
        getCustomerProfile(tokenSession?.token);
        settoken(tokenSession?.token);
      }
    } catch (error) {
      console.log('token error....');
    }
  };

  const getCustomerProfile = value => {
    setLoading(true);
    fetch(`${url}getCustomerProfile`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + value,
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => response.text())
      .then(result => {
        const newData = JSON.parse(result);
        if (newData.error === false) {
          const genderCheck =
            newData?.data?.gender === 'Male'
              ? {id: 1, gender: 'Male'}
              : newData?.data?.gender === 'Female'
              ? {id: 2, gender: 'Female'}
              : {id: 0, gender: ''};
          setName(newData?.data?.firstname);
          setLastName(newData?.data?.lastname);
          setcontact_no(newData?.data?.contact_no);
          setemail(newData.data.email);
          setaddress(newData?.data?.address);
          setcity(newData?.data?.city);
          seteir_code(newData?.data?.eir_code);
          setdob(newData?.data?.dob);
          setemergency_contact_no(newData?.data?.emergency_contact_no);
          setgender(genderCheck);
          setCategory(newData?.data?.category);
          settype(newData?.data?.type);
          setManager(newData?.data?.is_manager);
          setData(newData?.data);
        }
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
      });
  };

  // date picker
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = date => {
    const DATE = new Date(date);
    const Reg_Date1 = DATE.toISOString().split('T');
    const Reg_Date2 = Reg_Date1[0].split('-');
    setdob(Reg_Date2[0] + '-' + Reg_Date2[1] + '-' + Reg_Date2[2]);
    hideDatePicker();
  };
  // edit profile api
  // profile api
  const profileditapi = async () => {
    setLoading(true);
    var myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);

    var formdata = new FormData();
    formdata.append('firstname', name);
    formdata.append('lastname', lastName);
    formdata.append('email', email);
    formdata.append('id', data?.id);
    formdata.append('gender', gender?.gender);
    formdata.append('dob', dob);
    formdata.append('category', category);
    formdata.append('address', address);
    formdata.append('city', city);
    formdata.append('eir_code', eir_code);
    formdata.append('emergency_contact_no', emergency_contact_no);
    // formdata.append('is_manager', manager);
    formdata.append('contact_no', contact_no);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow',
    };

    fetch(`${url}privateUpdateCustomer`, requestOptions)
      .then(response => response.text())
      .then(result => {
        const newData = JSON.parse(result);
        setLoading(false);
        if (newData.error === false) {
          navigation.navigate('Profile');
        }
        ShowToast(newData.msg);
      })
      .catch(error => {
        setLoading(false);
      });
  };

  if (loading) {
    return <Loader />;
  }
  return (
    <ScrollView>
      <SafeAreaView
        style={{
          backgroundColor: Color.white,
          height: '100%',
          paddingHorizontal: 10,
        }}>
        <View>
          <TextInput
            style={[styles.input, {marginTop: 10}]}
            placeholderTextColor={Color.gray}
            value={name}
            onChangeText={name => setName(name)}
            placeholder="Enter first name"
          />
          <TextInput
            style={[styles.input, {marginTop: 10}]}
            placeholderTextColor={Color.gray}
            value={lastName}
            onChangeText={name => setLastName(name)}
            placeholder="Enter last name"
          />
          <TextInput
            style={styles.input}
            maxLength={15}
            placeholderTextColor={Color.gray}
            value={contact_no}
            onChangeText={contact_no => setcontact_no(contact_no)}
            keyboardType="numeric"
            placeholder="Mobile Number"
          />
          <TextInput
            style={styles.input}
            placeholderTextColor={Color.gray}
            value={email}
            onChangeText={email => setemail(email)}
            placeholder="Email Address"
          />
          <TextInput
            style={styles.input}
            placeholderTextColor={Color.gray}
            value={address}
            onChangeText={address => setaddress(address)}
            placeholder="Address"
          />
          <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
            <TextInput
              style={[styles.input, {width: '45%'}]}
              placeholderTextColor={Color.gray}
              value={city}
              onChangeText={city => setcity(city)}
              placeholder="City"
            />
            <TextInput
              style={[styles.input, {width: '45%'}]}
              placeholderTextColor={Color.gray}
              value={eir_code}
              maxLength={15}
              onChangeText={eir_code => seteir_code(eir_code)}
              keyboardType="default"
              placeholder="Eircode"
            />
          </View>
          <View
            style={[
              styles.input,
              {
                flexDirection: 'row',
                justifyContent: 'space-evenly',
              },
            ]}>
            <TextInput
              style={styles.inputwidth}
              placeholderTextColor={Color.gray}
              value={dob}
              onChangeText={dob => setdob(dob)}
              keyboardType="numeric"
              placeholder="Date of Birth"
            />
            <TouchableOpacity>
              <MaterialIcons
                onPress={showDatePicker}
                name="date-range"
                style={styles.icon}
              />
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
              />
            </TouchableOpacity>
          </View>
          {/* <TextInput
            style={styles.input}
            placeholderTextColor={Color.black}
            value={emergency_contact_person}
            onChangeText={emergency_contact_person =>
              setemergency_contact_person(emergency_contact_person)
            }
            placeholder="Emergency Contact Person"
          /> */}
          <TextInput
            style={styles.input}
            placeholderTextColor={Color.gray}
            maxLength={10}
            value={emergency_contact_no}
            onChangeText={emergency_contact_no =>
              setemergency_contact_no(emergency_contact_no)
            }
            keyboardType="numeric"
            placeholder="Emergency Contact Number"
          />
          <View style={{marginBottom: 6}}>
            <Dropdown
              style={styles.dropdown}
              data={[
                {id: 1, gender: 'Male'},
                {id: 2, gender: 'Female'},
              ]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              itemContainerStyle={{backgroundColor: '#ffffff'}}
              itemTextStyle={styles.itemTextStyle}
              activeColor={'#FFF2C2'}
              labelField="gender"
              maxHeight={200}
              valueField="id"
              placeholder={'Gender'}
              value={gender}
              onChange={item => {
                setgender(item);
              }}
            />
          </View>
          <Button label={'Edit Profile'} onPress={profileditapi} />
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default Edit_Profile;

const styles = StyleSheet.create({
  input: {
    backgroundColor: Color.white,
    marginHorizontal: 10,
    marginVertical: 5,
    height: 40,
    borderRadius: 5,
    color: Color.black,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Color.gray,
    paddingStart: 10,
  },
  inputwidth: {
    width: '90%',
    color: Color.black,
  },
  radiobtntext: {
    margin: 5,
    color: Color.black,
    fontSize: 18,
    fontWeight: '600',
  },
  icon: {
    margin: 6,
    fontSize: 25,
    color: Color.balck,
  },
  companyview: {
    flexDirection: 'row',
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
