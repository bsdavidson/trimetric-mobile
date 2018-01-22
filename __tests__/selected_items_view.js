import "react-native";
import React from "react";
import renderer from "react-test-renderer";

import {SelectedItemsView} from "../selected_items_view";
import {
  following,
  selectedArrival,
  selectedArrivalVehicleInfo,
  selectedItem,
  selectedItemIndex,
  selectedItemVehicle,
  selectedStopInfo,
  selectedVehicleInfo,
  stopData,
  vehicleData
} from "../__fixtures__/selected_items_view";
import {Arrivals} from "../arrivals";

jest.mock("Animated");
jest.mock("../helpers");
jest.mock("../arrivals", () => {
  return "Arrivals";
});

it("renders a selected stop", () => {
  const selectedStop = renderer
    .create(
      <SelectedItemsView
        data={stopData}
        following={following}
        onResize={value => {}}
        selectedArrival={null}
        selectedArrivalVehicleInfo={null}
        selectedItem={selectedItem}
        selectedItemIndex={selectedItemIndex}
        selectedVehicleStopInfo={selectedStopInfo}
      />
    )
    .toJSON();
  expect(selectedStop).toMatchSnapshot("selected_stop");
});

it("renders a selected vehicle", () => {
  const selectedVehicle = renderer
    .create(
      <SelectedItemsView
        data={vehicleData}
        following={following}
        onResize={value => {}}
        selectedArrival={null}
        selectedArrivalVehicleInfo={null}
        selectedItem={selectedItemVehicle}
        selectedItemIndex={selectedItemIndex}
        selectedVehicleStopInfo={selectedVehicleInfo}
      />
    )
    .toJSON();
  expect(selectedVehicle).toMatchSnapshot("selected_vehicle");
});
