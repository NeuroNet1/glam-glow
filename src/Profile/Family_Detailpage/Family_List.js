import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Color} from '../../Color/Color';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {url} from '../../api/Myurl';
import {familyListText, familyList} from '../../UtilityData/staticData';
import Bin from '../../Images/bin.png';
import Edit from '../../Images/edit.png';
import FamilyIcon from '../../Images/profileAdd.jpg';

// Helpers
import { ShowToast, Loader } from "../../Helpers";

const Family_List = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [TOKEN, setTOKEN] = useState('');
  const [Data, setData] = useState([]);
  useEffect(() => {
    const gettoken = async () => {
      try {
        const session = await AsyncStorage.getItem('user_session');
        if (session !== null) {
          const tokenSession = JSON.parse(session).data;
          setTOKEN(tokenSession);
          Familylistpapi(tokenSession);
        }
      } catch (error) {
        console.log('family list get token error....');
      }
    };
    gettoken();
  }, [isFocused]);
  // membership api
  const Familylistpapi = TOKEN => {
    setLoading(true);
    fetch(`${url}privateGetFamilyList`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + TOKEN.token,
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        if (response.status === 401) {
          ShowToast('Your token is expired');
          navigation.navigate('Login');
          setLoading(false);
        } else if (response.ok) {
          return response.text();
        } else {
          throw new Error('Network response was not ok');
        }
      })
      .then(result => {
        const newData = JSON.parse(result).data;
        const AllData = newData.filter(item => item.id !== TOKEN.id);
        setData(AllData);
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        console.log('family list error.....', error);
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
  // delete family list api

  const privateDeleteCustomer = id => {
    var formdata = new FormData();
    formdata.append('id', id);
    fetch(`${url}privateDeleteCustomer`, {
      method: 'POST',
      body: formdata,
      headers: {
        Authorization: 'Bearer ' + TOKEN.token,
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => response.text())
      .then(result => {
        Familylistpapi(TOKEN);
      })
      .catch(error => console.log('Delete error.....', error));
  };
  const handleProductPress = item => {
    privateDeleteCustomer(item.id);
  };

  const renderFamilyList = item => {
    const startingAlphabet = item.item.name.charAt(0);
    const color = familyList[item.index % familyList.length];
    const Textcolor = familyListText[item.index % familyListText.length];
    return (
      <View style={styles.viewstyle}>
        <View style={[styles.profileimage, {backgroundColor: color}]}>
          <Text style={{fontSize: 25, fontWeight: '600', color: Textcolor}}>
            {startingAlphabet}
          </Text>
        </View>
        <View style={styles.textview}>
          <Text style={styles.text1}>{item.item.name}</Text>
          {item.item.contact_no === null ? (
            ''
          ) : (
            <Text style={styles.text2}>Mobile No - {item.item.contact_no}</Text>
          )}
          {item.item.dob && (
            <Text style={styles.text2}>DOB - {displaDate(item.item.dob)}</Text>
          )}
          {item?.item?.gender == 'undefined' ||
            (item?.item?.gender === null ? (
              ''
            ) : (
              <Text style={styles.text2}>Gender - {item.item.gender}</Text>
            ))}
          {item.item.email === null ? (
            ''
          ) : (
            <Text style={styles.text2}>Email - {item.item.email}</Text>
          )}
        </View>
        <View style={styles.iconview}>
          {/* <TouchableOpacity
            onPress={() =>
              navigation.navigate('Familymember_detail', item.item)
            }>
            <Image source={Eye} style={[styles.icon, {tintColor: '#11AD04'}]} />
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Edit_Family', item.item)}>
            <Image
              source={Edit}
              style={[styles.icon, {tintColor: '#E2BE01', marginHorizontal: 6}]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            key={item.item.id}
            onPress={() => handleProductPress(item.item)}>
            <Image source={Bin} style={[styles.icon, {tintColor: '#FF3131'}]} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return <Loader />;
  }
  return (
    <SafeAreaView
      style={{
        backgroundColor: Color.white,
        height: '100%',
        paddingHorizontal: 20,
      }}>
      {Data && Data?.length !== 0 ? (
        <FlatList
          data={Data}
          keyExtractor={item => item.id}
          renderItem={renderFamilyList}
        />
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View style={{marginBottom: 100}}>
            <FastImage
              source={FamilyIcon}
              resizeMode={FastImage.resizeMode.cover}
              style={{height: 250, width: 250}}
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: '400',
                color: '#c7c7c7',
                textAlign: 'center',
              }}>
              No family member added !
            </Text>
          </View>
        </View>
      )}
      <TouchableOpacity>
        <MaterialIcons
          onPress={() => navigation.navigate('Add_Family')}
          name="add"
          style={styles.addbutton}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Family_List;

const styles = StyleSheet.create({
  viewstyle: {
    backgroundColor: Color.white,
    padding: 10,
    marginTop: 10,
    borderBottomWidth: 1,
    borderColor: Color.lavender,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileimage: {
    borderRadius: 65 / 2,
    width: 65,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  textview: {
    // margin: 5,
  },
  iconview: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addbutton: {
    bottom: 40,
    right: 15,
    position: 'absolute',
    fontWeight: 'bold',
    backgroundColor: '#0572C1',
    padding: 20,
    fontSize: 40,
    color: Color.white,
    borderRadius: 40,
    overflow: 'hidden',
  },
  text1: {
    fontSize: 15,
    fontWeight: '700',
    color: Color.black,
  },
  text2: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B8A8A',
  },
  icon: {
    height: 25,
    width: 25,
  },
});
