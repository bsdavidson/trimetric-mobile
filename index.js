import {AppRegistry} from "react-native";
import React, {Component} from "react";
import {Provider} from "react-redux";

import App from "./App";
import {DataService} from "./data";
import {store} from "./store";

const dataService = new DataService(store);
dataService.start();

function AppWithStore() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

AppRegistry.registerComponent("trimetric_mobile", () => AppWithStore);
