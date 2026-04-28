import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {WebView} from 'react-native-webview';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Color} from '../Color/Color.js';

const MyWebView = ({visible, handleBack}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };
  return (
    <Modal transparent visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 10,
            marginTop: 10,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: Color.white,
          }}>
          <TouchableOpacity
            onPress={handleBack}
            style={{
              height: 40,
              width: 40,
              borderRadius: 40 / 2,
              backgroundColor: 'rgba(192, 192, 192, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <MaterialIcons name="close" size={25} color={Color?.gray} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRefresh}>
            <MaterialIcons name="refresh" size={35} />
          </TouchableOpacity>
        </View>
        <WebView
          key={refreshKey}
          source={{uri: 'https://help.centumx.ie/'}} // Replace this with your desired URL
          style={styles.webview}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00000040',
  },
  webview: {
    flex: 1,
  },
});

export default MyWebView;
