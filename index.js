import React, {Component} from "react";
import {AppRegistry, View, Text} from "react-native";
import {Provider} from "react-redux";

import {PersistGate} from "redux-persist/es/integration/react";

import App from "./app";
import Intro from "./intro";
import {store, persistor} from "./store";

function AppWithStore() {
  return (
    <Provider store={store}>
      <PersistGate loading={<Intro skipTips={true} />} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  );
}

AppRegistry.registerComponent("trimetric_mobile", () => AppWithStore);
