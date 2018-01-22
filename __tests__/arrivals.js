import "react-native";
import React from "react";
import renderer from "react-test-renderer";

import {Arrivals} from "../arrivals";
import {arrivals, selectedItem} from "../__fixtures__/arrivals";

jest.mock("../helpers");

it("renders arrivals component", () => {
  const nullArrivals = renderer.create(<Arrivals />).toJSON();
  expect(nullArrivals).toMatchSnapshot("null");

  const arr = renderer
    .create(<Arrivals arrivals={arrivals} selectedItem={selectedItem} />)
    .toJSON();
  expect(arr).toMatchSnapshot("arrivals");
});
