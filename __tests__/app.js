import "react-native";
import React from "react";
import renderer from "react-test-renderer";

import {props} from "../__fixtures__/app";
import {App} from "../app";

jest.mock("@mapbox/react-native-mapbox-gl");
jest.mock("../arrival_shapes_layer", () => "ArrivalShapesLayer");
jest.mock("../buildings_layer", () => "BuildingsLayer");
jest.mock("../data", () => "DataService");
jest.mock("../dimension_listener", () => "DimensionsListener");
jest.mock("../info_modal", () => "InfoModal");
jest.mock("../intro", () => "Intro");
jest.mock("../layers_menu", () => "LayersMenu");
jest.mock("../route_shapes_layer", () => "RouteShapesLayer");
jest.mock("../selected_items_view", () => "SelectedItemsView");
jest.mock("../selected_layer", () => "SelectedLayer");
jest.mock("../stat_menu", () => "StatMenu");
jest.mock("../stops_layer", () => "StopsLayer");
jest.mock("../vehicles_layer", () => "VehiclesLayer");

it("renders App", () => {
  // Still loading, Map content should not render
  let app = renderer
    .create(
      <App
        dimensions={props.dimensions}
        following={props.following}
        layerVisibility={props.layerVisibility}
        loaded={false}
        routeShapes={props.routeShapes}
        selectedArrival={props.selectedArrival}
        selectedArrivalVehicleInfo={props.selectedArrivalVehicleInfo}
        selectedItem={props.selectedItem}
        selectedItemsInfo={props.selectedItemsInfo}
        selectedItemsViewHeight={props.selectedItemsViewHeight}
        selectedVehicleInfo={props.selectedVehicleInfo}
        stopPoints={props.stopPoints}
        vehiclePoints={props.vehiclePoints}
      />
    )
    .toJSON();
  expect(app).toMatchSnapshot("not_loaded_app");

  // Data fully loaded, App should fully render
  app = renderer
    .create(
      <App
        dimensions={props.dimensions}
        following={props.following}
        layerVisibility={props.layerVisibility}
        loaded={props.loaded}
        routeShapes={props.routeShapes}
        selectedArrival={props.selectedArrival}
        selectedArrivalVehicleInfo={props.selectedArrivalVehicleInfo}
        selectedItem={props.selectedItem}
        selectedItemsInfo={props.selectedItemsInfo}
        selectedItemsViewHeight={props.selectedItemsViewHeight}
        selectedVehicleInfo={props.selectedVehicleInfo}
        stopPoints={props.stopPoints}
        vehiclePoints={props.vehiclePoints}
      />
    )
    .toJSON();
  expect(app).toMatchSnapshot("loaded_app");

  // Something on the map was selected, App should show bottom menu
  app = renderer
    .create(
      <App
        dimensions={props.dimensions}
        following={props.following}
        layerVisibility={props.layerVisibility}
        loaded={props.loaded}
        routeShapes={props.routeShapes}
        selectedArrival={props.selectedArrival}
        selectedArrivalVehicleInfo={props.selectedArrivalVehicleInfo}
        selectedItem={props.selectedItem}
        selectedItemsInfo={[1, 2, 3]} // simulate selected items
        selectedItemsViewHeight={props.selectedItemsViewHeight}
        selectedVehicleInfo={props.selectedVehicleInfo}
        stopPoints={props.stopPoints}
        vehiclePoints={props.vehiclePoints}
      />
    )
    .toJSON();
  expect(app).toMatchSnapshot("loaded_app_with_selectedItems");
});
