import {createSelector} from "reselect";
import Moment from "moment";

// Only tram and bus are used by Trimet
export const ROUTE_TYPE_ICONS = {
  0: "tram",
  1: "subway",
  2: "rail",
  3: "bus",
  4: "ferry",
  5: "cable",
  6: "gondola",
  7: "funicular"
};

export function filterArrivalsForStop(stopID, arrivals) {
  return arrivals.filter(a => {
    return stopID === a.stop_id;
  });
}

function getArrivals(state) {
  return state.arrivals;
}

function getRouteTypeIcon(routeType) {
  return ROUTE_TYPE_ICONS[routeType] || "bus";
}

function getRouteShapes(state) {
  return state.routeShapes;
}

function getVehicles(state) {
  return state.vehicles;
}

function getStops(state) {
  return state.stops;
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

export const getStopInfoFromSelectedItem = createSelector(
  getSelectedItems,
  getSelectedItemIndex,
  getStops,
  (selectedItems, idx, stops) => {
    let item = selectedItems[idx];
    if (!item) {
      return null;
    }
    for (let i = 0; i < stops.length; i++) {
      if (stops[i].id === item.properties.stop_id) {
        return stops[i];
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
        type: "vehicle",
        icon: getRouteTypeIcon(v.route_type),
        vehicle_id: v.vehicle.id,
        route_id: v.trip.route_id || "",
        stop_id: v.stop_id
      },
      geometry: {
        type: "Point",
        coordinates: [v.position.lng, v.position.lat]
      }
    };
  });
  return collection;
});

export const getSelectedItemsInfo = createSelector(
  getStops,
  getVehicles,
  getSelectedItems,
  getArrivals,
  (stops, vehicles, items, arrivals) => {
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
