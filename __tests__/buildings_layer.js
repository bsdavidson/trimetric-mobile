import "react-native";
import React from "react";
import renderer from "react-test-renderer";

import {BuildingsLayer} from "../buildings_layer";

jest.mock("@mapbox/react-native-mapbox-gl");

it("renders buildingsLayer", () => {
  // render null
  const blNull = renderer.create(<BuildingsLayer />).toJSON();
  expect(blNull).toMatchSnapshot("null_buildingsLayer");

  // render non-visible buildings
  let bl = renderer
    .create(<BuildingsLayer layerVisibility={{buildings: false}} />)
    .toJSON();
  expect(bl).toMatchSnapshot("non_visible_buildingsLayer");

  // render visible buildings
  bl = renderer
    .create(<BuildingsLayer layerVisibility={{buildings: true}} />)
    .toJSON();
  expect(bl).toMatchSnapshot("visible_buildingsLayer");
});
