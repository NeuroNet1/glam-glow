import {StyleSheet, Text, View, Image, ScrollView} from 'react-native';
import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Color} from '../../Color/Color';
import LinearGradient from 'react-native-linear-gradient';
import {formatTimeSlotDate} from '../../Helpers/momentFormatter';

const Familymember_detail = item => {
  return (
    <ScrollView style={{backgroundColor: Color.bluecolor, height: '100%'}}>
      <LinearGradient colors={Color.button}>
        <Image
          style={styles.profileimage}
          source={
            item.route.params.img
              ? {uri: item.route.params.img}
              : require('../../Images/ProfileImage.png')
          }
        />
        <View style={styles.nameview}>
          <MaterialIcons name="person" style={styles.icon} />
          <Text style={styles.text}> {item.route.params.name}</Text>
        </View>
        <View style={styles.nameview}>
          <MaterialIcons name="phone" style={styles.icon} />
          <Text style={styles.text}> {item.route.params.contact_no}</Text>
        </View>
        <View style={styles.nameview}>
          <MaterialIcons name="email" style={styles.icon} />
          <Text style={styles.text}> {item.route.params.email}</Text>
        </View>
      </LinearGradient>
      <View style={styles.mainview}>
        <View style={styles.detailview}>
          <Text style={styles.heading}>Club Member Since</Text>
          <Text style={styles.detail}>
            {formatTimeSlotDate(item.route.params.created_date)}
          </Text>
        </View>
        <View style={styles.detailview}>
          <Text style={styles.heading}>Membership Number</Text>
          <Text style={styles.detail}>{item.route.params.barcode}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default Familymember_detail;

const styles = StyleSheet.create({
  profileimage: {
    borderRadius: 150,
    marginVertical: '5%',
    height: 120,
    width: '30%',
    alignSelf: 'center',
    borderWidth: 3,
    borderColor: Color.white,
  },
  nameview: {
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 2,
  },
  text: {
    color: Color.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  icon: {
    fontSize: 24,
    color: Color.white,
  },
  mainview: {
    backgroundColor: Color.white,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: 10,
    paddingTop: 25,
    height: '100%',
    marginBottom: 220,
  },
  detailview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 5,
  },
  heading: {
    margin: 5,
    fontSize: 20,
    color: Color.black,
    fontWeight: 'bold',
  },
  detail: {
    margin: 5,
    fontSize: 18,
    color: Color.black,
    // fontWeight: 'bold',
  },
});
