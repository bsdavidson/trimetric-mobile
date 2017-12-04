import {createStore, combineReducers} from "redux";
// import {douglasPeucker} from "./helpers/geom.js";
import {
  LocationTypes,
  UPDATE_ARRIVALS,
  UPDATE_LINES,
  UPDATE_LOCATION,
  UPDATE_ROUTES,
  UPDATE_STOPS,
  UPDATE_VEHICLES
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
  let expiredTimestamp = new Date().getTime() / 1000 - 300;

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

function lineData(state = {type: "FeatureCollection", features: []}, action) {
  switch (action.type) {
    case UPDATE_LINES: {
      let featureIndexes = {};
      let features = state.features.slice();

      features.forEach((f, i) => {
        featureIndexes[f.properties.color] = i;
      });

      action.lineData.forEach(s => {
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
              color: "#" + s.color
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

function stops(state = [], action) {
  switch (action.type) {
    case UPDATE_STOPS:
      return state.concat(action.stops);

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
  lineData,
  locationClicked,
  routes,
  stops,
  vehicles
});

export const store = createStore(
  reducer,
  window.devToolsExtension && window.devToolsExtension()
);