import "react-native";
import React from "react";
import renderer from "react-test-renderer";

import {SelectedLayer} from "../selected_layer";
import {selectedItem} from "../__fixtures__/selected_items_view";

jest.mock("@mapbox/react-native-mapbox-gl");

it("renders selectedLayer", () => {
  const slNull = renderer.create(<SelectedLayer />).toJSON();
  expect(slNull).toMatchSnapshot();

  const sl = renderer
    .create(<SelectedLayer selectedItem={selectedItem} />)
    .toJSON();
  expect(sl).toMatchSnapshot();
});
