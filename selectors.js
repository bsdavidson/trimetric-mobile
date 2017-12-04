import {createSelector} from "reselect";

// Only tram and bus are used by Trimet
const ROUTE_TYPE_ICONS = {
  0: "tram",
  1: "subway",
  2: "rail",
  3: "bus",
  4: "ferry",
  5: "cable",
  6: "gondola",
  7: "funicular"
};

function getRouteTypeIcon(routeType) {
  return ROUTE_TYPE_ICONS[routeType] || "bus";
}

function getVehicles(state) {
  return state.vehicles;
}

function getStops(state) {
  return state.stops;
}

export const getVehiclePoints = createSelector(getVehicles, vehicles => {
  let collection = {
    type: "FeatureCollection",
    features: []
  };
  collection.features = vehicles.map(v => {
    if (!v) {
      return;
    }

    return {
      type: "Feature",
      properties: {
        icon: getRouteTypeIcon(v.route_type),
        vehicle_id: v.vehicle.id,
        route_id: v.trip.route_id
      },
      geometry: {
        type: "Point",
        coordinates: [v.position.lng, v.position.lat]
      }
    };
  });

  return collection;
});

export const getStopPoints = createSelector(getStops, stops => {
  let collection = {
    type: "FeatureCollection",
    features: []
  };
  collection.features = stops.map(s => {
    if (!s) {
      return;
    }
    return {
      type: "Feature",
      properties: {
        stop_id: s.id
      },
      geometry: {
        type: "Point",
        coordinates: [s.lng, s.lat]
      }
    };
  });

  return collection;
});
