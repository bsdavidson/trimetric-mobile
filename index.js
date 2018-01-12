import {AppRegistry, View, Text} from "react-native";
import {PersistGate} from "redux-persist/es/integration/react";
import React, {Component} from "react";
import {Provider} from "react-redux";

import Intro from "./intro";
import App from "./App";
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
