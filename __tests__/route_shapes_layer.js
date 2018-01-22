import "react-native";
import React from "react";
import renderer from "react-test-renderer";
import {mapStateToProps, RouteShapesLayer} from "../route_shapes_layer";

import {props} from "../__fixtures__/route_shapes_layer";

jest.mock("@mapbox/react-native-mapbox-gl");

it("renders routeShapesLayer", () => {
  const rslNull = renderer.create(<RouteShapesLayer />).toJSON();
  expect(rslNull).toMatchSnapshot();

  const rsl = renderer
    .create(
      <RouteShapesLayer
        visible={props.visible}
        routeShapes={props.routeShapes}
        selectedArrival={props.selectedArrival}
      />
    )
    .toJSON();
  expect(rsl).toMatchSnapshot();
});

it("has a mapStateToProps", () => {
  let props = mapStateToProps({
    layerVisibility: {
      routeShapes: []
    },
    selectedArrival: null
  });

  expect(props).toEqual({
    visible: true,
    routeShapes: {type: "FeatureCollection", features: []},
    selectedArrival: null
  });

  props = mapStateToProps({
    layerVisibility: {
      routeShapes: []
    },
    selectedArrival: {}
  });

  expect(props).toEqual({
    visible: false,
    routeShapes: {type: "FeatureCollection", features: []},
    selectedArrival: {}
  });
});
