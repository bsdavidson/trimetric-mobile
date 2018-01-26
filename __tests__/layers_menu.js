import "react-native";
import React from "react";
import renderer from "react-test-renderer";

import {LayersMenu} from "../layers_menu";
import {
  bottom,
  dimensions,
  display,
  layerVisibility,
  selectedItemsViewHeight
} from "../__fixtures__/layers_menu";

it("renders layers menu", () => {
  // If the bottom menu view Height is over 150px, do
  // not render the layers menu.
  const nullLayersMenu = renderer
    .create(
      <LayersMenu
        bottom={bottom}
        dimensions={dimensions}
        display={display}
        layerVisibility={layerVisibility}
        openState={false}
        selectedItemsViewHeight={200}
      />
    )
    .toJSON();
  expect(layersMenuClosed).toMatchSnapshot("null_layers_menu");

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
