import "react-native";
import React from "react";
import renderer from "react-test-renderer";

import {mapStateToProps, VehiclesLayer} from "../vehicles_layer";
import {props, vehicles} from "../__fixtures__/vehicles_layer.js";

jest.mock("@mapbox/react-native-mapbox-gl");

it("renders VehiclesLayer", () => {
  const vlNull = renderer.create(<VehiclesLayer />).toJSON();
  expect(vlNull).toMatchSnapshot("null_vehiclesLayer");

  const vl = renderer
    .create(
      <VehiclesLayer
        filter={props.filter}
        vehiclePoints={props.vehiclePoints}
        labelsVisible={props.labelsVisible}
      />
    )
    .toJSON();
  expect(vl).toMatchSnapshot("non_null_vehiclesLayer");
});

it("has mapStateToProps", () => {
  // Filter nothing
  let state = mapStateToProps({
    layerVisibility: {vehicleLabels: true, buses: true, trains: true},
    selectedItems: {
      features: []
    },
    vehicles: []
  });
  expect(state).toEqual({
    filter: ["!=", "non_existing_attribute", "1"],
    labelsVisible: true,
    vehiclePoints: {features: [], type: "FeatureCollection"}
  });

  // Filter to vehicleID
  state = mapStateToProps({
    layerVisibility: {vehicleLabels: true, buses: true, trains: true},
    selectedItems: {
      features: [
        {
          properties: {
            type: "vehicle",
            vehicle_id: "101" // matches 1st one in fixture
          },
          geometry: {
            coordinates: [123, 456]
          }
        },
        {
          properties: {
            type: "stop"
          },
          geometry: {
            coordinates: [768, 998]
          }
        }
      ]
    },
    selectedItemIndex: 0,
    vehicles: vehicles
  });
  expect(state).toEqual({
    filter: ["==", "vehicle_id", "101"],
    labelsVisible: true,
    vehiclePoints: {
      features: [
        {
          geometry: {coordinates: [-122.68386, 45.50887], type: "Point"},
          properties: {
            bearing: 347,
            icon: "tram",
            route_id: "200",
            stop_id: "13140",
            type: "vehicle",
            vehicle_id: "101"
          },
          type: "Feature"
        },
        {
          geometry: {coordinates: [-122.56782, 45.435745], type: "Point"},
          properties: {
            bearing: 350,
            icon: "tram",
            route_id: "200",
            stop_id: "13132",
            type: "vehicle",
            vehicle_id: "537"
          },
          type: "Feature"
        },
        {
          geometry: {coordinates: [-122.56438, 45.53185], type: "Point"},
          properties: {
            bearing: 292,
            icon: "tram",
            route_id: "90",
            stop_id: "8371",
            type: "vehicle",
            vehicle_id: "538"
          },
          type: "Feature"
        }
      ],
      type: "FeatureCollection"
    }
  });

  // Filter only buses
  state = mapStateToProps({
    layerVisibility: {vehicleLabels: true, buses: false, trains: true},
    selectedItems: {
      features: []
    },
    selectedItemIndex: 0,
    vehicles: []
  });
  expect(state).toEqual({
    filter: ["!=", "icon", "bus"],
    labelsVisible: true,
    vehiclePoints: {
      features: [],
      type: "FeatureCollection"
    }
  });

  // Filter only trains
  state = mapStateToProps({
    layerVisibility: {vehicleLabels: true, buses: true, trains: false},
    selectedItems: {
      features: []
    },
    selectedItemIndex: 0,
    vehicles: []
  });
  expect(state).toEqual({
    filter: ["!=", "icon", "tram"],
    labelsVisible: true,
    vehiclePoints: {
      features: [],
      type: "FeatureCollection"
    }
  });
});
