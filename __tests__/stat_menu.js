import "react-native";
import React from "react";
import renderer from "react-test-renderer";

import {StatMenu} from "../stat_menu";

it("renders stat bar", () => {
  const tree = renderer.create(<StatMenu activeVehicles={1} />).toJSON();
  expect(tree).toMatchSnapshot();
});
