import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Modal from 'react-native-modal';
import {Color} from '../Color/Color';
import deleteImage from '../Images/deleteaccount.png';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {url} from '../api/Myurl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

// Helpers
import { ShowToast } from "../Helpers/ShowToast";

const Delete_Account = () => {
  const navigation = useNavigation();
  // Add to cart button modal
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalVisible1, setModalVisible1] = useState(false);
  const [loading, setLoading] = useState(false);
  const [TOKEN, setTOKEN] = useState('');

  useEffect(() => {
    checkLogin();
  }, []);
  const checkLogin = async () => {
    try {
      const session = await AsyncStorage.getItem('user_session');
      if (session !== undefined && session !== null) {
        const sessionID = JSON.parse(session)?.data;
        setTOKEN(sessionID?.token);
      }
    } catch (error) {
      // There was an error on the native side
    }
  };

  const deleteAccount = async () => {
    setLoading(true);
    fetch(`${url}deleteAccount`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + TOKEN,
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(async response => response.text())
      .then(async result => {
        const newData = JSON.parse(result);
        setLoading(false);
        if (newData.error === false) {
          // navigation.navigate('Login');
          handle();
          await AsyncStorage.removeItem('user_session');
        }
        ShowToast(newData.msg);
      })
      .catch(error => {
        setLoading(false);
      });
  };
  const handle = () => {
    setModalVisible(false);
    setModalVisible1(true);
  };
  const handaleTOLogin = () => {
    navigation.navigate('Login');
    setModalVisible1(false);
  };

  return (
    <SafeAreaView style={{backgroundColor: Color.white, flex: 1}}>
      <View
        style={{
          height: 200,
          width: '100%',
          marginVertical: 10,
          marginTop: 40,
        }}>
        <Image
          source={deleteImage}
          style={{
            height: '100%',
            width: '55%',
            alignSelf: 'center',
            marginVertical: 10,
            resizeMode: 'contain',
          }}
        />
      </View>
      <View style={{height: 50}} />
      {/* <Text style={styles.textview}>Delete Account</Text> */}
      <Text style={[styles.text1, {textAlign: 'center'}]}>
        When you click this button, your account information will be erased from
        the database permanently. Please be aware that there is no way to
        reverse this action.
      </Text>
      <View style={{height: 50}} />
      <TouchableOpacity
        style={styles.buttonview}
        onPress={() => setModalVisible(true)}>
        <Text style={[styles.text1, {color: Color.white}]}>
          {'Delete Account'}
        </Text>
      </TouchableOpacity>
      <Modal isVisible={isModalVisible}>
        <View style={styles.modalcontainer}>
          <MaterialIcons
            name="cancel"
            size={160}
            color={Color.red}
            style={{textAlign: 'center'}}
          />
          <Text style={[styles.text1, {color: Color.black}]}>
            Are you sure ?
          </Text>
          <Text style={styles.text1}>
            This will permanently delete this account. You can't undo this
            account
          </Text>
          <View style={styles.modalbuttonview}>
            <TouchableOpacity
              style={[
                styles.buttonview,
                {width: '40%', backgroundColor: '#EDEDFD'},
              ]}
              onPress={() => setModalVisible(false)}>
              <Text style={[styles.text1, {color: Color.black}]}>
                {'Cancle'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonview, {width: '40%'}]}
              onPress={() => deleteAccount()}>
              <Text style={[styles.text1, {color: Color.white}]}>
                {'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal isVisible={isModalVisible1}>
        <View style={styles.modalcontainer}>
          <MaterialIcons
            name="check-circle"
            size={160}
            color={Color.green}
            style={{textAlign: 'center'}}
          />
          <Text style={styles.text1}>
            Your account is Successfully Deleted.
          </Text>
          <View style={styles.modalbuttonview}>
            <TouchableOpacity
              style={[
                styles.buttonview,
                {width: '80%', backgroundColor: Color.green},
              ]}
              onPress={() => handaleTOLogin()}>
              <Text style={[styles.text1, {color: Color.white}]}>{'OK'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Delete_Account;

const styles = StyleSheet.create({
  mainview: {
    backgroundColor: 'pink',
  },
  textview: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: Color.black,
  },
  text1: {
    marginHorizontal: 10,
    marginVertical: 5,
    fontSize: 16,
    fontWeight: '600',
    color: Color.darkgrey,
    textAlign: 'center',
  },
  inputfield: {
    borderWidth: 1,
    borderColor: Color.lightgray,
    margin: 10,
    borderRadius: 10,
    padding: 10,
  },
  buttonview: {
    height: 50,
    width: '90%',
    alignSelf: 'center',
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.red,
    borderRadius: 8,
  },
  modalcontainer: {
    backgroundColor: Color.white,
    padding: 10,
    borderRadius: 8,
  },
  modalbuttonview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
