import {
  StyleSheet,
  SafeAreaView,
  View,
  Image,
  Text,
  FlatList,
} from 'react-native';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import Button from '../../Button_Component/Button';
import React, {useState, useEffect} from 'react';
import {Color} from '../../Color/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {url} from '../../api/Myurl';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Visa from '../../Images/visa.png';
import Master from '../../Images/master.png';
import BlankCart from '../../Images/pay.png';
import LinearGradient from 'react-native-linear-gradient';
// Helpers
import { ShowToast, Loader } from "../../Helpers";

const Payment_method = item => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [TOKEN, setTOKEN] = useState('');
  const [cardList, setCardList] = useState('');
  useEffect(() => {
    checkLogin();
  }, [isFocused]);

  const checkLogin = async isSelected => {
    setLoading(true);
    try {
      const session = await AsyncStorage.getItem('user_session');
      if (session !== undefined && session !== null) {
        const sessionID = JSON.parse(session)?.data;
        setTOKEN(sessionID?.token);
        listCustomerCard(sessionID?.token);
      } else {
        navigation.navigate('Login');
        setLoading(false);
      }
    } catch (error) {
      // There was an error on the native side
    }
  };

  const listCustomerCard = token => {
    var myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };

    fetch(`${url}clistCustomerCard`, requestOptions)
      .then(response => response.text())
      .then(result => {
        setLoading(false);
        const newData = JSON.parse(result);
        setCardList(newData?.data);
      })
      .catch(error => {
        setLoading(false);
        console.log('error', error);
      });
  };

  const deleteCard = id => {
    setLoading(true);
    var myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${TOKEN}`);

    var formdata = new FormData();
    formdata.append('id', id);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow',
    };

    fetch(`${url}cdeleteCard`, requestOptions)
      .then(response => response.text())
      .then(result => {
        const newData = JSON.parse(result);
        listCustomerCard(TOKEN);
        ShowToast(newData.msg);
      })
      .catch(error => {
        setLoading(false);
        console.log('error', error);
      });
  };
  const setDefaultCard = id => {
    setLoading(true);
    var myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${TOKEN}`);

    var formdata = new FormData();
    formdata.append('id', id);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow',
    };

    fetch(`${url}csetDefaultCard`, requestOptions)
      .then(response => response.text())
      .then(result => {
        const newData = JSON.parse(result);
        listCustomerCard(TOKEN);
        ShowToast(newData.msg);
      })
      .catch(error => {
        setLoading(false);
        console.log('error', error);
      });
  };

  if (loading) {
    return <Loader />;
  }
  const renderItem = item => {
    return (
      <View style={styles.container}>
        <View style={styles.imgContainer}>
          <Image
            source={item?.item?.brand === 'visa' ? Visa : Master}
            style={styles.img}
          />
        </View>
        <View style={styles.expiryContainer}>
          <View style={{justifyContent: 'center'}}>
            <Text style={styles.text}>
              ************{item?.item?.card_number}
            </Text>
            <Text style={styles.text}>Expiry Date</Text>
            <Text style={styles.text}>
              {item?.item?.month}/{item?.item?.year}
            </Text>
          </View>
          {item?.item?.is_default === 1 ? (
            <LinearGradient
              colors={Color.button}
              style={{
                height: 25,
                width: '30%',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 6,
                marginStart: 10,
                marginTop: 20,
              }}>
              <Text
                style={{color: Color.white, fontWeight: 'bold', fontSize: 12}}>
                Default
              </Text>
            </LinearGradient>
          ) : null}
        </View>
        <View style={styles.editContainer}>
          <MaterialIcons
            onPress={() => {
              deleteCard(item?.item?.id);
            }}
            name="delete"
            size={25}
            style={{marginBottom: 10, color: Color.red}}
          />
          {item?.item?.is_default === 0 ? (
            <MaterialIcons
              onPress={() => {
                setDefaultCard(item?.item?.id);
              }}
              name="more-vert"
              size={25}
              style={{marginTop: 10, color: Color.blue}}
            />
          ) : (
            <View style={{marginTop: 10, color: Color.blue, height: 25}} />
          )}
        </View>
      </View>
    );
  };
  return (
    <SafeAreaView style={{backgroundColor: Color.white, height: '100%'}}>
      {cardList && cardList.length > 0 ? (
        <FlatList
          data={cardList}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id.toString()}
        />
      ) : (
        <View style={{flex: 1, alignItems: 'center'}}>
          <Image
            source={BlankCart}
            style={{height: '50%', width: '100%', resizeMode: 'contain'}}
          />
        </View>
      )}
      <Button
        label={'Add New Card'}
        onPress={() => {
          navigation.navigate('Add_Card');
        }}
      />
    </SafeAreaView>
  );
};

export default Payment_method;

const styles = StyleSheet.create({
  container: {
    height: 100,
    width: '100%',
    borderBottomWidth: 1,
    borderColor: Color.lightgray,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
  },
  imgContainer: {
    flex: 1 / 3,
    margin: 10,
    borderColor: Color.lightgray,
    backgroundColor: Color.white,
    elevation: 5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  img: {height: '80%', width: '80%', resizeMode: 'contain'},
  expiryContainer: {
    flex: 1,
    flexDirection: 'row',
    // justifyContent: 'center',
    paddingStart: 10,
  },
  editContainer: {
    flex: 1 / 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {color: '#4F4C4C', fontSize: 12, fontWeight: '600'},
});
