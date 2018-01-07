export const CLEAR_SELECTION = "CLEAR_SELECTION";
export const SELECT_ARRIVAL = "SELECT_ARRIVAL";
export const SELECT_ITEM = "SELECT_ITEM";
export const SEEN_INTRO = "SEEN_INTRO";
export const SET_SELECTED_ITEMS_VIEW_HEIGHT = "SET_SELECTED_ITEMS_VIEW_HEIGHT";
export const START_FETCHING_ARRIVALS = "START_FETCHING_ARRIVALS";
export const TOGGLE_INFO_MODAL_VISIBILITY = "TOGGLE_INFO_MODAL_VISIBILITY";
export const UPDATE_ARRIVALS = "UPDATE_ARRIVALS";
export const UPDATE_CONNECTING_STATUS_CONNECTED =
  "UPDATE_CONNECTING_STATUS_CONNECTED";
export const UPDATE_CONNECTING_STATUS_DISCONNECTED =
  "UPDATE_CONNECTING_STATUS_DISCONNECTED";
export const UPDATE_DIMENSIONS = "UPDATE_DIMENSIONS";
export const UPDATE_LAST_STATIC_FETCH = "UPDATE_LAST_STATIC_FETCH";
export const UPDATE_LAYER_VISIBILITY = "UPDATE_LAYER_VISIBILITY";
export const UPDATE_LOADING_STATUS_LOADED = "UPDATE_LOADING_STATUS_LOADED";
export const UPDATE_LOCATION = "UPDATE_LOCATION";
export const UPDATE_ROUTES = "UPDATE_ROUTES";
export const UPDATE_ROUTE_SHAPES = "UPDATE_ROUTE_SHAPES";
export const UPDATE_SELECTED_ITEMS = "UPDATE_SELECTED_ITEMS";
export const UPDATE_STOPS = "UPDATE_STOPS";
export const UPDATE_TOTALS = "UPDATE_TOTALS";
export const UPDATE_VEHICLES = "UPDATE_VEHICLES";

export const LocationTypes = {
  STOP: "STOP",
  VEHICLE: "VEHICLE"
};

export function clearLocation() {
  return {
    type: UPDATE_LOCATION,
    locationClick: null,
    following: false
  };
}

export function setSeenIntroSeen() {
  return {
    type: SEEN_INTRO
  };
}

export function selectArrival(arrival) {
  return {
    type: SELECT_ARRIVAL,
    arrival
  };
}

export function clearSelection() {
  return {
    type: CLEAR_SELECTION
  };
}

export function setConnectingStatusConnected() {
  return {
    type: UPDATE_CONNECTING_STATUS_CONNECTED
  };
}

export function setConnectingStatusDisconnected() {
  return {
    type: UPDATE_CONNECTING_STATUS_DISCONNECTED
  };
}

export function setLoadingStatusLoaded() {
  return {
    type: UPDATE_LOADING_STATUS_LOADED
  };
}

export function selectItemIndex(itemIndex) {
  return {
    type: SELECT_ITEM,
    itemIndex
  };
}

export function setSelectedItemsViewHeight(height) {
  return {
    type: SET_SELECTED_ITEMS_VIEW_HEIGHT,
    height
  };
}

export function startFetchingArrivals() {
  return {
    type: START_FETCHING_ARRIVALS
  };
}

export function toggleInfoModalVisibility() {
  return {
    type: TOGGLE_INFO_MODAL_VISIBILITY
  };
}

export function updateArrivals(arrivals) {
  return {
    type: UPDATE_ARRIVALS,
    arrivals
  };
}

export function updateDimensions(dimensions) {
  return {
    type: UPDATE_DIMENSIONS,
    dimensions
  };
}

export function updateLastStaticFetch(lastStaticFetch) {
  return {
    type: UPDATE_LAST_STATIC_FETCH,
    lastStaticFetch
  };
}

export function updateLayerVisibility(layerName, visible) {
  return {
    type: UPDATE_LAYER_VISIBILITY,
    layerName,
    visible
  };
}

export function updateLocation(locationType, id, lat, lng, following) {
  return {
    type: UPDATE_LOCATION,
    locationClick: {
      locationType,
      id,
      lat,
      lng,
      following
    }
  };
}

export function updateRoutes(routes) {
  return {
    type: UPDATE_ROUTES,
    routes
  };
}

export function updateRouteShapes(routeShapes) {
  return {
    type: UPDATE_ROUTE_SHAPES,
    routeShapes
  };
}

export function updateStops(stops) {
  return {
    type: UPDATE_STOPS,
    stops
  };
}

export function updateSelectedItems(selectedItems) {
  return {
    type: UPDATE_SELECTED_ITEMS,
    selectedItems
  };
}

export function updateVehicles(vehicles) {
  return {
    type: UPDATE_VEHICLES,
    vehicles
  };
}

export function updateTotals(totals) {
  return {
    type: UPDATE_TOTALS,
    totals
  };
}
