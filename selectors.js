import Moment from "moment";

import {createSelector} from "reselect";
import {ROUTE_TYPE_ICONS} from "./constants";

export function parseColor(hex) {
  if (hex[0] === "#") {
    hex = hex.slice(1);
  }
  if (!hex) {
    return [0, 0, 0, 192];
  }
  let color = parseInt(hex, 16);
  return [(color >> 16) & 255, (color >> 8) & 255, color & 255, 255];
}

export function filterArrivalsForStop(stopID, arrivals) {
  return arrivals.filter(a => {
    return stopID === a.stop_id;
  });
}

function getArrivals(state) {
  return state.arrivals;
}

function getFollowing(state) {
  return state.following;
}

function getRouteTypeIcon(routeType) {
  return ROUTE_TYPE_ICONS[routeType] || "bus";
}

function getRouteShapes(state) {
  return state.routeShapes;
}

function getSelectedArrival(state) {
  return state.selectedArrival;
}

function getSelectedItems(state) {
  return state.selectedItems.features;
}

function getSelectedItemIndex(state) {
  return state.selectedItemIndex;
}

function getStops(state) {
  return state.stops;
}

function getVehicles(state) {
  return state.vehicles;
}

export const getRouteShapeFeatures = createSelector(
  getRouteShapes,
  routeShapes => {
    if (!routeShapes) {
      return {type: "FeatureCollection", features: []};
    }
    let featureIndexes = {};
    let features = [];

    routeShapes.forEach(s => {
      if (!s) {
        return;
      }
      let idx = featureIndexes[s.color];
      if (idx === undefined) {
        idx = features.length;
        featureIndexes[s.color] = idx;
        features.push({
          type: "Feature",
          properties: {
            color: "#" + s.color,
            route_id: s.route_id
          },
          geometry: {
            type: "MultiLineString",
            coordinates: []
          }
        });
      }
      features[idx].geometry.coordinates.push(
        s.points.map(p => {
          return [p.lng, p.lat];
        })
      );
    });

    return {type: "FeatureCollection", features: features};
  }
);

export const getSelectedItemsInfo = createSelector(
  getStops,
  getVehicles,
  getSelectedItems,
  getArrivals,
  getFollowing,
  (stops, vehicles, items, arrivals, following) => {
    if (items.length === 0) {
      return [];
    }

    let itemsInfo = [];
    items.forEach(item => {
      switch (item.properties.type) {
        case "vehicle":
          for (let i = 0; i < vehicles.length; i++) {
            if (vehicles[i].vehicle.id == item.properties.vehicle_id) {
              itemsInfo.push({type: "vehicle", vehicle: vehicles[i]});
              break;
            }
          }
          break;
        case "stop":
          for (let i = 0; i < stops.length; i++) {
            if (stops[i].id === item.properties.stop_id) {
              itemsInfo.push({
                type: "stop",
                stop: stops[i],
                arrivals: filterArrivalsForStop(stops[i].id, arrivals)
              });
              break;
            }
          }
          break;
        default:
          throw new Error(`unknown item type: ${item.properties.type}`);
      }
    });
    return itemsInfo;
  }
);

export const getSelectedItem = createSelector(
  getSelectedItems,
  getSelectedItemIndex,
  (selectedItems, idx) => {
    let item = selectedItems[idx];
    if (!item) {
      return null;
    }

    switch (item.properties.type) {
      case "vehicle":
        return {
          type: "vehicle",
          position: item.geometry.coordinates,
          item: item
        };
      case "stop":
        return {
          type: "stop",
          position: item.geometry.coordinates,
          item: item
        };
      default:
        break;
    }
    return null;
  }
);

export const getStopPoints = createSelector(getStops, stops => {
  let collection = {
    type: "FeatureCollection",
    features: []
  };
  if (!stops) {
    return;
  }
  collection.features = stops.map(s => {
    if (!s) {
      return;
    }
    return {
      type: "Feature",
      properties: {
        type: "stop",
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

export const getStopInfoFromSelectedItem = createSelector(
  getSelectedItems,
  getSelectedItemIndex,
  getStops,
  getVehicles, // Added to force update when data for selected vehicle changes
  (selectedItems, idx, stops, vehicles) => {
    let item = selectedItems[idx];
    if (!item) {
      return null;
    }
    let stopID = item.properties.stop_id;

    if (item.properties.type === "vehicle") {
      for (let i = 0; i < vehicles.length; i++) {
        if (vehicles[i].vehicle.id === item.properties.vehicle_id) {
          stopID = vehicles[i].stop_id;
          break;
        }
      }
    }

    for (let i = 0; i < stops.length; i++) {
      if (stops[i].id === stopID) {
        return stops[i];
      }
    }
  }
);

export const getVehicleInfoFromSelectedItem = createSelector(
  getSelectedItems,
  getSelectedItemIndex,
  getVehicles,
  (selectedItems, idx, vehicles) => {
    let item = selectedItems[idx];
    if (!item) {
      return null;
    }
    for (let i = 0; i < vehicles.length; i++) {
      if (vehicles[i].vehicle.id === item.properties.vehicle_id) {
        return vehicles[i];
      }
    }
  }
);

export const getVehicleInfoFromArrival = createSelector(
  getVehicles,
  getSelectedArrival,
  (vehicles, arrival) => {
    if (!arrival || !arrival.item || !arrival.item.vehicle_id) {
      return null;
    }
    for (let i = 0; i < vehicles.length; i++) {
      if (vehicles[i].vehicle.id === arrival.item.vehicle_id) {
        return vehicles[i];
      }
    }
  }
);

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
        bearing: v.position.bearing,
        icon: getRouteTypeIcon(v.route_type),
        route_id: v.trip.route_id || "",
        stop_id: v.stop_id,
        type: "vehicle",
        vehicle_id: v.vehicle.id
      },
      geometry: {
        coordinates: [v.position.lng, v.position.lat],
        type: "Point"
      }
    };
  });
  return collection;
});
