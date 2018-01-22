import "react-native";
import React from "react";
import renderer from "react-test-renderer";

import {Loading} from "../loading";

it("renders loading component", () => {
  const connecting = renderer.create(<Loading />).toJSON();
  expect(connecting).toMatchSnapshot("loading_connecting");

  const connected = renderer.create(<Loading connected={true} />).toJSON();
  expect(connected).toMatchSnapshot("loading_connected");
});
