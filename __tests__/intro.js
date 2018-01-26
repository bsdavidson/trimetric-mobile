import "react-native";
import React from "react";
import renderer from "react-test-renderer";

import {Intro} from "../intro";
import {Loading} from "../loading";

jest.mock("../loading", () => {
  return "Loading";
});

jest.mock("Animated");

it("renders the intro", () => {
  const tree = renderer
    .create(
      <Intro
        dimensions={{window: {width: 400, height: 600}}}
        layerVisibility={{}}
        loaded={false}
        onSeenIntro={() => {}}
        onUpdateLayerVisibility={() => {}}
        seenIntro={false}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
