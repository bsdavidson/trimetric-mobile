import {persistStore, persistCombineReducers} from "redux-persist";
import FilesystemStorage from "redux-persist-filesystem-storage";
import {createStore, combineReducers} from "redux";
import {Dimensions} from "react-native";

// import {douglasPeucker} from "./helpers/geom.js";
import {
  CLEAR_SELECTION,
  LocationTypes,
  SELECT_ARRIVAL,
  SELECT_ITEM,
  SEEN_INTRO,
  SET_SELECTED_ITEMS_VIEW_HEIGHT,
  START_FETCHING_ARRIVALS,
  TOGGLE_INFO_MODAL_VISIBILITY,
  UPDATE_ARRIVALS,
  UPDATE_CONNECTING_STATUS_CONNECTED,
  UPDATE_CONNECTING_STATUS_DISCONNECTED,
  UPDATE_DIMENSIONS,
  UPDATE_LAST_STATIC_FETCH,
  UPDATE_LAYER_VISIBILITY,
  UPDATE_LOADING_STATUS_LOADED,
  UPDATE_LOCATION,
  UPDATE_ROUTES,
  UPDATE_ROUTE_SHAPES,
  UPDATE_SELECTED_ITEMS,
  UPDATE_STOPS,
  UPDATE_TOTALS,
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
  let expired = 0;
  let newCount = 0;
  let updateCount = 0;
  let expiredTimestamp = Math.round(new Date().getTime() / 1000 - 300);

  let newState;
  if (getTimestampFunc) {
    newState = state.filter(u => {
      return getTimestampFunc && getTimestampFunc(u) > expiredTimestamp;
    });
  } else {
    newState = state.slice();
  }

  if (state.length > newState.length) {
    expired += state.length - newState.length;
  }

  updates.forEach(u => {
    for (let i = 0; i < newState.length; i++) {
      if (isEqualFunc(u, newState[i])) {
        newState[i] = u;
        updateCount++;
        return;
      }
    }
    newCount++;
    newState.push(u);
  });

  if (newCount + updateCount + expired > 0) {
    return newState;
  }
  return state;
}

function arrivals(state = [], action) {
  switch (action.type) {
    case UPDATE_ARRIVALS:
      return action.arrivals;

    default:
      return state;
  }
}

function connected(state = false, action) {
  switch (action.type) {
    case UPDATE_CONNECTING_STATUS_CONNECTED:
      return true;
    case UPDATE_CONNECTING_STATUS_DISCONNECTED:
      return false;
    default:
      return state;
  }
}

const DEFAULT_DIMENSIONS = {
  window: Dimensions.get("window"),
  screen: Dimensions.get("screen")
};

function dimensions(state = DEFAULT_DIMENSIONS, action) {
  switch (action.type) {
    case UPDATE_DIMENSIONS:
      return action.dimensions;
    default:
      return state;
  }
}

const DEFAULT_LAYERS = {
  routeShapes: true,
  buses: true,
  trains: true,
  stops: true,
  vehicleLabels: true,
  buildings: false
};

function lastStaticFetch(state = null, action) {
  switch (action.type) {
    case UPDATE_LAST_STATIC_FETCH:
      return action.lastStaticFetch;
    default:
      return state;
  }
}

function layerVisibility(state = DEFAULT_LAYERS, action) {
  switch (action.type) {
    case UPDATE_LAYER_VISIBILITY:
      return {...state, [action.layerName]: action.visible};
    default:
      return state;
  }
}

function loaded(state = false, action) {
  switch (action.type) {
    case UPDATE_LOADING_STATUS_LOADED:
      return true;
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

function routeShapes(state = null, action) {
  switch (action.type) {
    case UPDATE_ROUTE_SHAPES:
      return action.routeShapes;
    default:
      return state;
  }
}

function infoModalVisible(state = false, action) {
  switch (action.type) {
    case TOGGLE_INFO_MODAL_VISIBILITY:
      return !state;
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
    case CLEAR_SELECTION:
      return DEFAULT_SELECT_ITEM_STATE;
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

function seenIntro(state = false, action) {
  switch (action.type) {
    case SEEN_INTRO:
      return true;
    default:
      return state;
  }
}

function selectedArrival(state = null, action) {
  switch (action.type) {
    case SELECT_ARRIVAL:
      return action.arrival;
    case CLEAR_SELECTION:
      return null;
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
    case CLEAR_SELECTION:
      return null;
    default:
      return state;
  }
}

function selectedItemsViewHeight(state = 0, action) {
  switch (action.type) {
    case SET_SELECTED_ITEMS_VIEW_HEIGHT:
      return action.height;
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

function totals(state = null, action) {
  switch (action.type) {
    case UPDATE_TOTALS:
      return action.totals;
    default:
      return state;
  }
}

function vehicles(state = [], action) {
  switch (action.type) {
    case UPDATE_VEHICLES: {
      return action.vehicles;
      // let newState = mergeUpdates(
      //   state,
      //   action.vehicles,
      //   (a, b) => a.vehicle.id === b.vehicle.id,
      //   v => v.timestamp
      // );
      // return newState;
    }
    default:
      return state;
  }
}

function receivedVehicles(state = false, action) {
  switch (action.type) {
    case UPDATE_VEHICLES:
      return true;
    default:
      return state;
  }
}

const reducers = {
  arrivals,
  connected,
  dimensions,
  fetchingArrivals,
  infoModalVisible,
  lastStaticFetch,
  layerVisibility,
  loaded,
  locationClicked,
  receivedVehicles,
  routeShapes,
  routes,
  seenIntro,
  selectedArrival,
  selectedItemIndex,
  selectedItems,
  selectedItemsViewHeight,
  stops,
  totals,
  vehicles
};

export const reducer = persistCombineReducers(
  {
    key: "root",
    storage: FilesystemStorage,
    whitelist: [
      "lastStaticFetch",
      "layerVisibility",
      "routeShapes",
      "routes",
      "seenIntro",
      "stops",
      "totals"
    ]
  },
  reducers
);
export const store = createStore(reducer);
export const persistor = persistStore(store);
