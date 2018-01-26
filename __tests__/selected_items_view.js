import "react-native";
import React from "react";
import renderer from "react-test-renderer";

import {Arrivals} from "../arrivals";
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
  selectedItemsInfo,
  vehicleData
} from "../__fixtures__/selected_items_view";

jest.mock("Animated");
jest.mock("../helpers");
jest.mock("../arrivals", () => {
  return "Arrivals";
});

it("renders a selected stop", () => {
  const selectedStop = renderer
    .create(
      <SelectedItemsView
        arrival={null}
        arrivalVehicleInfo={null}
        following={following}
        item={selectedItem}
        itemIndex={selectedItemIndex}
        itemsInfo={selectedItemsInfo}
        onResize={value => {}}
        vehicleStopInfo={selectedStopInfo}
      />
    )
    .toJSON();
  expect(selectedStop).toMatchSnapshot("selected_stop");
});

it("renders a selected vehicle", () => {
  const selectedVehicle = renderer
    .create(
      <SelectedItemsView
        arrival={null}
        arrivalVehicleInfo={null}
        following={following}
        item={selectedItemVehicle}
        itemIndex={selectedItemIndex}
        itemsInfo={vehicleData}
        onResize={value => {}}
        vehicleStopInfo={selectedVehicleInfo}
      />
    )
    .toJSON();
  expect(selectedVehicle).toMatchSnapshot("selected_vehicle");
});
