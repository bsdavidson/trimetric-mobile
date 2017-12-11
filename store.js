import {createStore, combineReducers} from "redux";
// import {douglasPeucker} from "./helpers/geom.js";
import {
  LocationTypes,
  SELECT_ITEM,
  SET_MAP_VIEW_INSET,
  START_FETCHING_ARRIVALS,
  UPDATE_ARRIVALS,
  UPDATE_LOCATION,
  UPDATE_ROUTES,
  UPDATE_STOPS,
  UPDATE_SELECTED_ITEMS,
  UPDATE_VEHICLES,
  UPDATE_ROUTE_SHAPES
} from "./actions";
import {featureCollection, geometry} from "@turf/helpers";

export const DEFAULT_LOCATION = {
  lat: 45.522236,
  lng: -122.675827,
  gps: false,
  locationType: LocationTypes.HOME
};

function mergeUpdates(state, updates, isEqualFunc, getTimestampFunc) {
  let newState = state.slice();
  let newCount = 0;
  let expired = 0;
  let updateCount = 0;
  let expiredTimestamp = Math.round(new Date().getTime() / 1000 - 300);

  updates.forEach(u => {
    for (let i = 0; i < newState.length; i++) {
      if (isEqualFunc(u, newState[i])) {
        newState[i] = u;
        updateCount++;
        return;
      }

      if (
        getTimestampFunc &&
        getTimestampFunc(newState[i]) < expiredTimestamp
      ) {
        expired++;
        return;
      }
    }
    newCount++;
    newState.push(u);
  });

  return newState;
}

function arrivals(state = [], action) {
  switch (action.type) {
    case UPDATE_ARRIVALS:
      return action.arrivals;
    default:
      return state;
  }
}

function fetchingArrivals(state = false, action) {
  switch (action.type) {
    case START_FETCHING_ARRIVALS:
      return true;
    case UPDATE_ARRIVALS:
      return false;
    default:
      return state;
  }
}

function routeShapes(
  state = {type: "FeatureCollection", features: []},
  action
) {
  switch (action.type) {
    case UPDATE_ROUTE_SHAPES: {
      let featureIndexes = {};
      let features = state.features.slice();

      features.forEach((f, i) => {
        featureIndexes[f.properties.color] = i;
      });

      action.routeShapes.forEach(s => {
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
    default:
      return state;
  }
}

function locationClicked(state = null, action) {
  switch (action.type) {
    case UPDATE_LOCATION:
      return action.locationClick;

    case UPDATE_VEHICLES:
      if (!state) {
        return state;
      }
      for (let i = 0; i < action.vehicles.length; i++) {
        let v = action.vehicles[i];
        if (+state.id !== +v.vehicle.id) {
          continue;
        }

        if (state.lat === v.position.lat && state.lng === v.position.lng) {
          continue;
        }
        return {
          locationType: state.locationType,
          id: state.id,
          lat: v.position.lat,
          lng: v.position.lng,
          following: state.following
        };
      }
      return state;

    default:
      return state;
  }
}

function routes(state = [], action) {
  switch (action.type) {
    case UPDATE_ROUTES:
      return action.routes;
    default:
      return state;
  }
}

const DEFAULT_SELECT_ITEM_STATE = {
  type: "FeatureCollection",
  features: []
};

function selectedItems(state = DEFAULT_SELECT_ITEM_STATE, action) {
  switch (action.type) {
    case UPDATE_SELECTED_ITEMS:
      return action.selectedItems;

    case UPDATE_VEHICLES:
      if (state.features.length === 0) {
        return state;
      }
      let changed = false;

      let newFeatures = state.features.map(si => {
        if (si.properties.type !== "vehicle") {
          // Not a vehicle, not interested
          return si;
        }
        for (let i = 0; i < action.vehicles.length; i++) {
          if (si.properties.vehicle_id === action.vehicles[i].vehicle.id) {
            changed = true;
            si = Object.assign({}, si, {
              geometry: Object.assign({}, si.geometry, {
                coordinates: [
                  action.vehicles[i].position.lng,
                  action.vehicles[i].position.lat
                ]
              })
            });

            break;
          }
        }
        return si;
      });
      if (!changed) {
        return state;
      }

      return {
        type: "FeatureCollection",
        features: newFeatures
      };

    default:
      return state;
  }
}

function selectedItemIndex(state = null, action) {
  switch (action.type) {
    case SELECT_ITEM:
      return action.itemIndex;
    case UPDATE_SELECTED_ITEMS:
      return 0;
    default:
      return state;
  }
}

function mapViewInset(state = [0, 0, 0, 0], action) {
  switch (action.type) {
    case SET_MAP_VIEW_INSET:
      return [0, 0, action.bottom, 0];
    default:
      return state;
  }
}

function stops(state = [], action) {
  switch (action.type) {
    case UPDATE_STOPS:
      return action.stops;

    default:
      return state;
  }
}

function vehicles(state = [], action) {
  switch (action.type) {
    case UPDATE_VEHICLES: {
      let newState = mergeUpdates(
        state,
        action.vehicles,
        (a, b) => a.vehicle.id === b.vehicle.id,
        v => v.timestamp
      );

      return newState;
    }
    default:
      return state;
  }
}

export const reducer = combineReducers({
  arrivals,
  fetchingArrivals,
  locationClicked,
  mapViewInset,
  routeShapes,
  routes,
  selectedItemIndex,
  selectedItems,
  stops,
  vehicles
});

export const store = createStore(
  reducer,
  window.devToolsExtension && window.devToolsExtension()
);
