import "react-native";
import React from "react";
import renderer from "react-test-renderer";

import {StatMenu, mapStateToProps} from "../stat_menu";

it("renders the bottom status bar", () => {
  const tree = renderer.create(<StatMenu activeVehicles={1} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it("has mapStateToProps", () => {
  // Null Value
  let state = mapStateToProps({});
  expect(state).toEqual({activeVehicles: 0});

  state = mapStateToProps({vehicles: [1, 2, 3]});
  expect(state).toEqual({activeVehicles: 3});
});
