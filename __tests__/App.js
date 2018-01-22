import "react-native";
import React from "react";
import renderer from "react-test-renderer";

import {App} from "../App";

jest.mock("@mapbox/react-native-mapbox-gl");
jest.mock("../arrival_shapes_layer", () => "ArrivalShapesLayer");
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
jest.mock("../data", () => "DataService");

it("renders App", () => {
  const app = renderer.create(<App />).toJSON();
  expect(app).toMatchSnapshot("app");
});
