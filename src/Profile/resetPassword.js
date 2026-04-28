import {StyleSheet, Text, View, TextInput, Image} from 'react-native';
import React, {useState, useEffect} from 'react';
import {Color} from '../Color/Color';
import {useNavigation} from '@react-navigation/native';
import Button from '../Button_Component/Button';
import {url} from '../api/Myurl';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helpers
import { ShowToast, Loader } from "../Helpers";

const ResetPassword = () => {
  const navigation = useNavigation();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [TOKEN, setTOKEN] = useState();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    gettoken();
  }, []);
  const gettoken = async () => {
    try {
      const session = await AsyncStorage.getItem('user_session');
      if (session !== null) {
        const tokenSession = JSON.parse(session).data;
        setTOKEN(tokenSession?.token);
      }
    } catch (error) {
      console.log('token error....', error);
    }
  };
  const forgetPasswordCustomer = async () => {
    if (!newPassword || newPassword.length < 6) {
      ShowToast('Please enter a password with more than 6 digits');
      return;
    }
    setLoading(true);
    try {
      var formdata = new FormData();
      formdata.append('old_password', oldPassword);
      formdata.append('new_password', newPassword); 

      var requestOptions = {
        headers: {Authorization: `Bearer ${TOKEN}`},
        method: 'POST',
        body: formdata,
        redirect: 'follow',
      };

      const response = await fetch(
        `${url}privateChangePassword`,
        requestOptions,
      );
      if (response.ok) {
        const data = await response.json();
        if (data.error === false) {
          navigation.goBack();
        }
        ShowToast(data.msg);
      } else {
        console.log('Error:', response.status, response);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }
  return (
    <View
      style={{
        backgroundColor: Color.white,
        height: '100%',
        paddingHorizontal: 20,
      }}>
      {/* <Text style={styles.text}>Reset Password</Text> */}
      <Image
        style={styles.profileimage}
        source={require('../Images/resetpassword.jpg')}
      />
      <Text style={styles.text}>Change Your Password</Text>
      <Text style={styles.text1}>Old Password</Text>
      <TextInput
        style={styles.inputfield}
        placeholder="Old Password"
        placeholderTextColor={Color.gray}
        value={oldPassword}
        onChangeText={txt => setOldPassword(txt)}
      />
      <Text style={styles.text1}>New Password</Text>
      <TextInput
        style={styles.inputfield}
        placeholder="New Password"
        placeholderTextColor={Color.gray}
        value={newPassword}
        onChangeText={txt => setNewPassword(txt)}
      />
      <Button label={'Submit'} onPress={() => forgetPasswordCustomer()} />
    </View>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  profileimage: {
    marginHorizontal: '25%',
    width: '50%',
    height: 250,
  },
  text: {
    marginVertical: 20,
    fontSize: 25,
    fontWeight: '600',
    textAlign: 'center',
    color: Color.black,
  },
  text1: {
    fontSize: 14,
    fontWeight: '600',
    marginStart: 10,
    // textAlign: 'center',
    color: Color.black,
  },
  inputfield: {
    backgroundColor: Color.white,
    marginHorizontal: 10,
    marginVertical: 15,
    borderRadius: 5,
    padding: 10,
    color: Color.black,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Color.gray,
  },
});
