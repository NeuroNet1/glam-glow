import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

// All packages
import { Provider, useSelector } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { StripeProvider } from "@stripe/stripe-react-native";
import NetInfo from "@react-native-community/netinfo";
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

// App Theme
import { Colors } from "./src/AppTheme/color";

// redux store
import store from "./src/ReduxToolKit/Store";

// Navigation starting poinnts
import Navigation from "./src/Navigators/Navigation";
import NetworkCheck from "./src/NetworkHandel/NetworkCheck";
import GradientStatusBar from "./src/component/GradientStatusBar.jsx";

const MainApp = () => {
  const centerData = useSelector((state) => state.cartItem?.publishableKey);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <GradientStatusBar />
      <SafeAreaView style={styles.appView}>
        <StripeProvider
          publishableKey={centerData?.stripe_pk}
          merchantIdentifier="merchant.customer.centumx.com">
          <NavigationContainer>
            {isConnected ? <Navigation /> : <NetworkCheck />}
          </NavigationContainer>
        </StripeProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};


const App = () => (
  <Provider store={store}>
    <MainApp />
  </Provider>
);

const styles = StyleSheet.create({
  appView: {
    backgroundColor: Colors.white,
    height: "100%",
  },
});

export default App;