import "react-native";
import React from "react";
import {LayersMenu} from "../layers_menu";
import {
  bottom,
  dimensions,
  display,
  layerVisibility,
  selectedItemsViewHeight
} from "../__fixtures__/layers_menu";
import renderer from "react-test-renderer";

it("renders layers menu", () => {
  const layersMenuClosed = renderer
    .create(
      <LayersMenu
        bottom={bottom}
        dimensions={dimensions}
        display={display}
        layerVisibility={layerVisibility}
        openState={false}
        selectedItemsViewHeight={selectedItemsViewHeight}
      />
    )
    .toJSON();
  expect(layersMenuClosed).toMatchSnapshot("layers_menu_closed");

  const layersMenuOpen = renderer
    .create(
      <LayersMenu
        bottom={bottom}
        dimensions={dimensions}
        display={display}
        layerVisibility={layerVisibility}
        openState={true}
        selectedItemsViewHeight={selectedItemsViewHeight}
      />
    )
    .toJSON();
  expect(layersMenuOpen).toMatchSnapshot("layers_menu_open");
});
