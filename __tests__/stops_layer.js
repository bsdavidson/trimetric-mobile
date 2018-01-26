import "react-native";
import React from "react";
import renderer from "react-test-renderer";

import {mapStateToProps, StopsLayer} from "../stops_layer";
import {stopPoints, stops} from "../__fixtures__/stops_layer.js";

jest.mock("@mapbox/react-native-mapbox-gl");

it("renders StopsLayer", () => {
  const slNull = renderer.create(<StopsLayer />).toJSON();
  expect(slNull).toMatchSnapshot("null_stopsLayer");

  // NonNull
  const sl = renderer.create(<StopsLayer stopPoints={stopPoints} />).toJSON();
  expect(sl).toMatchSnapshot("non_null_stopsLayer");
});

it("has mapStateToProps", () => {
  // Filter nothing
  let state = mapStateToProps({
    layerVisibility: {
      stops: true
    },
    selectedItems: {
      features: []
    },
    stops: []
  });
  expect(state).toEqual({
    filter: ["!=", "non_existing_attribute", "1"],
    stopPoints: {features: [], type: "FeatureCollection"}
  });

  // Filter all stops
  state = mapStateToProps({
    layerVisibility: {
      stops: false
    },
    selectedItems: {
      features: []
    },
    stops: []
  });
  expect(state).toEqual({
    filter: ["==", "non_existing_attribute", "1"],
    stopPoints: {features: [], type: "FeatureCollection"}
  });

  // Filter to specific stop
  state = mapStateToProps({
    selectedArrival: {somethingNotNull: "1"},
    layerVisibility: {
      stops: true
    },
    selectedItems: {
      features: [
        {
          properties: {
            type: "stop",
            stop_id: "2" // First item in stops in fixtures
          },
          geometry: {
            coordinates: [-122.675671, 45.420609]
          }
        }
      ]
    },
    selectedItemIndex: 0,
    stops: stops
  });
  expect(state).toEqual({
    filter: ["==", "stop_id", "2"],
    stopPoints: {
      features: [
        {
          geometry: {coordinates: [-122.675671, 45.420609], type: "Point"},
          properties: {stop_id: "2", type: "stop"},
          type: "Feature"
        },
        {
          geometry: {coordinates: [-122.635065, 45.430735], type: "Point"},
          properties: {stop_id: "landmark-2560", type: "stop"},
          type: "Feature"
        }
      ],
      type: "FeatureCollection"
    }
  });
});
