import {AppRegistry, View, Text} from "react-native";
import {PersistGate} from "redux-persist/es/integration/react";
import React, {Component} from "react";
import {Provider} from "react-redux";

import App from "./App";
import {store, persistor} from "./store";

function AppWithStore() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View style={{flex: 1, alignItems: "center"}}>
            <Text style={{marginTop: 40}}>Hydrating</Text>
          </View>
        }
        onBeforeLift={() => {
          console.log("Before the gate is lifted");
        }}
        persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  );
}

AppRegistry.registerComponent("trimetric_mobile", () => AppWithStore);
