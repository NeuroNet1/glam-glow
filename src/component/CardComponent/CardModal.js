// CardModal.js

import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Color } from '../Color/Color';
import { useSelector } from 'react-redux';
import Visa from '../Images/visa.png';
import Master from '../Images/master.png';

const CardModal = ({ showModal, setShowModal, cardList, onSelectCard }) => {
  const allCard = (item) => {
    return (
      <TouchableOpacity
        activeOpacity={0.4}
        onPress={() => {
          onSelectCard(item?.item);
          setShowModal(false);
        }}
        style={styles.container}>
        <View style={styles.imgContainer}>
          <Image
            source={item?.item?.brand === 'visa' ? Visa : Master}
            style={styles.img}
          />
        </View>
        <View style={styles.expiryContainer}>
          <View style={{ justifyContent: 'center' }}>
            <Text style={styles.text}>
              ************{item?.item?.card_number}
            </Text>
            <Text style={styles.text}>Expiry Date</Text>
            <Text style={styles.text}>
              {item?.item?.month}/{item?.item?.year}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      transparent={true}
      visible={showModal}
      onRequestClose={() => {
        setShowModal(false);
      }}>
      <View style={styles.modal}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Select Card</Text>
            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
              }}
              style={styles.closeButton}>
              <MaterialIcons name="close" size={25} color={Color.black} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={cardList}
            renderItem={allCard}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000056',
  },
  modalContainer: {
    backgroundColor: Color.white,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Color.black,
  },
  closeButton: {
    padding: 5,
  },
  container: {
    height: 100,
    width: '100%',
    borderBottomWidth: 1,
    borderTopWidth: 1,
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
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  img: {
    height: '80%',
    width: '80%',
    resizeMode: 'contain',
  },
  expiryContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingStart: 10,
  },
  editContainer: {
    flex: 1 / 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    color: Color.black,
  },
});

export default CardModal;
