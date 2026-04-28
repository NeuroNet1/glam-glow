import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Color} from '../../Color/Color';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Dropdown} from 'react-native-element-dropdown';
import Button from '../../Button_Component/Button';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {country} from '../../UtilityData/staticData';
import {url} from '../../api/Myurl';

// Helpers
import { ShowToast,Loader } from "../../Helpers";

const Add_Family = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [Token, setToken] = useState();
  const [familyID, setFamilyID] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contact_no, setcontact_no] = useState('');
  const [fobNumber, setFobNumber] = useState('');
  const [email, setemail] = useState('');
  const [dob, setdob] = useState('');
  const [address, setaddress] = useState('');
  const [city, setcity] = useState('');
  const [eir_code, seteir_code] = useState('');
  const [gender, setgender] = useState('');
  const [category, setCategory] = useState('');
  const [is_manager, setIs_Manager] = useState({id: 0, manager: 'NO'});
  const [emg_contact_no, setemg_Contact_no] = useState('');
  const [value, setValue] = useState('');
  const [Countryname, setCountryname] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    gettoken();
  }, []);
  const gettoken = async () => {
    try {
      const session = await AsyncStorage.getItem('user_session');
      if (session !== null) {
        const tokenSession = JSON.parse(session).data;
        setFamilyID(tokenSession?.family_id);
        setToken(tokenSession?.token);
        setValue(tokenSession);
      }
    } catch (error) {
      console.log('token error....');
    }
  };
  useEffect(() => {
    handaleDetails();
  }, [value]);
  const handaleDetails = () => {
    setcity(value?.city);
    const filteredData = country.filter(
      item => item.country === value?.country,
    );
    filteredData.map(item => setCountryname(item));
  };
  // date picker
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
  const handaleQuestion = item => {
    setIs_Manager(item);
    if (item?.manager === 'No') {
      setVisible(false);
    } else {
      setVisible(true);
    }
  };
  // API FOR Add Family PAGE

  const save_record = () => {
    if (!name) {
      ShowToast('First name is required');
      return true;
    }
    if (!lastName) {
      ShowToast('Last name is required');
      return true;
    }
    if (!dob) {
      ShowToast('dob is required');
      return true;
    }
    if (!email) {
      if (is_manager.manager === 'Yes') {
        ShowToast('Email is required');
        return true;
      }
    }
    setLoading(true);
    var formdata = new FormData();
    formdata.append('firstname', name);
    formdata.append('lastname', lastName);
    formdata.append('email', email);
    formdata.append('fob_number', fobNumber);
    formdata.append('contact_no', contact_no);
    formdata.append('gender', gender?.gender);
    formdata.append('dob', dob);
    formdata.append('category', category?.member);
    formdata.append('address', address);
    formdata.append('is_manager', is_manager?.id);
    formdata.append('city', city);
    formdata.append('country', Countryname.country);
    formdata.append('eir_code', eir_code);
    formdata.append('emergency_contact_no', emg_contact_no);
    formdata.append('family_id', familyID);
    fetch(`${url}privateAddFamily`, {
      method: 'POST',
      body: formdata,
      headers: {
        Authorization: 'Bearer ' + Token,
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => response.text())
      .then(result => {
        const newData = JSON.parse(result);
        if (newData.error === false) {
          navigation.navigate('Family_List');
          setdob('');
          setName('');
          setLastName('');
          setcontact_no('');
          setemail('');
          setaddress('');
          setcity('');
          setCountryname('');
          seteir_code('');
          setemg_Contact_no('');
          setgender('');
          setIs_Manager('');
        }
        ShowToast(newData.msg);
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
      });
  };

  const displaDate = dateElement => {
    const date = new Date(dateElement); // Replace this with your date object

    // Format the date as "dd-mm-yyyy"
    const formattedDate = date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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
        height: '100%',
        paddingHorizontal: 10,
      }}>
      <SafeAreaView>
        <View style={{backgroundColor: Color.white, height: '100%'}}>
          <View style={{marginBottom: 6, marginTop: 10}}>
            <Text style={styles.RadioButtonHeader}>{'First name *'}</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={Color.gray}
              value={name}
              onChangeText={name => setName(name)}
              placeholder="Enter first name *"
            />
          </View>
          <View style={{marginBottom: 6, marginTop: 10}}>
            <Text style={styles.RadioButtonHeader}>{'Last name *'}</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={Color.gray}
              value={lastName}
              onChangeText={name => setLastName(name)}
              placeholder="Enter last name *"
            />
          </View>
          <View style={{marginBottom: 6}}>
            <Text style={styles.RadioButtonHeader}>{'DOB *'}</Text>
            <View
              style={[
                styles.input,
                {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: 0,
                },
              ]}>
              <TextInput
                style={styles.inputwidth}
                keyboardType="numeric"
                placeholderTextColor={Color.gray}
                value={dob === '' ? dob : displaDate(dob)}
                onChangeText={dob => setdob(dob)}
                placeholder="dd-mm-yyyy"
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
          </View>

          <View style={{marginBottom: 6}}>
            <Text style={styles.RadioButtonHeader}>
              Is the person an adult ?
            </Text>
            <Dropdown
              style={styles.dropdown}
              data={[
                {id: 0, manager: 'No'},
                {id: 1, manager: 'Yes'},
              ]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              itemContainerStyle={{backgroundColor: '#ffffff'}}
              itemTextStyle={styles.itemTextStyle} 
              activeColor={'#FFF2C2'}
              labelField="manager"
              maxHeight={200}
              valueField="id"
              placeholder={'Member Type'}
              value={is_manager}
              onChange={item => {
                handaleQuestion(item);
              }}
            />
          </View>
          <View style={{marginBottom: 6, marginTop: 10}}>
            <Text style={styles.RadioButtonHeader}>{'FOB Number'}</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={Color.gray}
              value={fobNumber}
              onChangeText={name => setFobNumber(name)}
              placeholder="FOB Number"
            />
          </View>
          {visible === true && (
            <>
              <View style={{marginBottom: 6}}>
                <Text style={styles.RadioButtonHeader}>{'Mobile Number'}</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholderTextColor={Color.gray}
                  maxLength={15}
                  value={contact_no}
                  onChangeText={contact_no => setcontact_no(contact_no)}
                  placeholder="Mobile Number"
                />
              </View>
              <View style={{marginBottom: 6}}>
                <Text style={styles.RadioButtonHeader}>{'Email *'}</Text>
                <TextInput
                  style={styles.input}
                  placeholderTextColor={Color.gray}
                  value={email}
                  onChangeText={email => setemail(email)}
                  placeholder="Email Address *"
                />
              </View>
              <View style={{marginBottom: 6}}>
                <Text style={styles.RadioButtonHeader}>{'Address'}</Text>
                <TextInput
                  style={styles.input}
                  placeholderTextColor={Color.gray}
                  value={address}
                  onChangeText={address => setaddress(address)}
                  placeholder="Address"
                />
              </View>
              <View style={{flexDirection: 'row', marginBottom: 6}}>
                <View style={{width: '50%'}}>
                  <Text style={styles.RadioButtonHeader}>City</Text>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor={Color.gray}
                    value={city}
                    onChangeText={city => setcity(city)}
                    placeholder="City"
                  />
                </View>
                <View style={{width: '50%'}}>
                  <Text style={styles.RadioButtonHeader}>Eircode</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="default"
                    maxLength={15}
                    placeholderTextColor={Color.gray}
                    value={eir_code}
                    onChangeText={eir_code => seteir_code(eir_code)}
                    placeholder="Eircode"
                  />
                </View>
              </View>
              <View style={{marginBottom: 6}}>
                <Text style={styles.RadioButtonHeader}>Select Country</Text>
                <Dropdown
                  style={styles.dropdown}
                  data={country}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  itemContainerStyle={{backgroundColor: '#ffffff'}}
                  itemTextStyle={styles.itemTextStyle} 
                  activeColor={'#FFF2C2'}
                  labelField="country"
                  maxHeight={200}
                  valueField="id"
                  placeholder={'Select Country...'}
                  value={Countryname}
                  onChange={item => {
                    // setValue(item.id);
                    setCountryname(item);
                  }}
                />
              </View>
              <View style={{marginBottom: 6}}>
                <Text style={styles.RadioButtonHeader}>Emergency Number</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  maxLength={10}
                  placeholderTextColor={Color.gray}
                  value={emg_contact_no}
                  onChangeText={emg_contact_no =>
                    setemg_Contact_no(emg_contact_no)
                  }
                  placeholder="Emergency contact No."
                />
              </View>
              <View style={{marginBottom: 6}}>
                <Text style={styles.RadioButtonHeader}>Gender</Text>
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
              <View style={{marginBottom: 6}}>
                <Text style={styles.RadioButtonHeader}>Member</Text>
                <Dropdown
                  style={styles.dropdown}
                  data={[
                    {id: 1, member: 'Family'},
                    {id: 2, member: 'Guest'},
                  ]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  itemContainerStyle={{backgroundColor: '#ffffff'}}
                  itemTextStyle={styles.itemTextStyle} 
                  activeColor={'#FFF2C2'}
                  labelField="member"
                  maxHeight={200}
                  valueField="id"
                  placeholder={'Member'}
                  value={category}
                  onChange={item => {
                    setCategory(item);
                  }}
                />
              </View>
            </>
          )}
          <Button label={'Add Family'} onPress={save_record} />
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default Add_Family;

const styles = StyleSheet.create({
  input: {
    marginHorizontal: 10,
    marginVertical: 5,
    height: 40,
    borderRadius: 5,
    color: Color.black,
    backgroundColor: Color.white,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Color.lightgray,
    paddingStart: 10,
  },
  inputwidth: {
    width: '90%',
    color:Color.black,
  },
  radiobtntext: {
    margin: 3,
    color: Color.black,
    fontSize: 13,
    fontWeight: '600',
  },
  icon: {
    color: Color.black,
    fontSize: 25,
    marginVertical: 5,
    marginHorizontal: 5,
  },
  buttonStyle: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 5,
    marginVertical: 10,
    width: 250,
  },
  chooseimageview: {
    flexDirection: 'row',
    margin: 10,
    justifyContent: 'space-evenly',
  },
  chooseimage: {
    backgroundColor: Color.lightgrey,
    padding: 10,
    borderWidth: 1,
    borderColor: Color.grey,
    margin: 5,
  },
  chooseimagetext: {
    color: Color.black,
    fontWeight: 'bold',
    fontSize: 15,
  },
  imagetext: {
    margin: 5,
    fontSize: 12,
    width: '60%',
    color: Color.black,
    fontWeight: 'bold',
  },
  companyview: {
    flexDirection: 'row',
  },
  dropdown: {
    height:45,
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
    color: Color.black,  // Text color for dropdown items
  },
  RadioButtonHeader: {
    marginHorizontal: 10,
    fontWeight: '500',
    fontSize: 14,
    color: Color.black,
  },
});
