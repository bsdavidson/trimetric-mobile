export const CLEAR_SELECTION = "CLEAR_SELECTION";
export const SELECT_ITEM = "SELECT_ITEM";
export const SELECT_ARRIVAL = "SELECT_ARRIVAL";
export const SET_MAP_VIEW_INSET = "SET_MAP_VIEW_INSET";
export const START_FETCHING_ARRIVALS = "START_FETCHING_ARRIVALS";
export const UPDATE_ARRIVALS = "UPDATE_ARRIVALS";
export const UPDATE_LOCATION = "UPDATE_LOCATION";
export const UPDATE_ROUTES = "UPDATE_ROUTES";
export const UPDATE_ROUTE_SHAPES = "UPDATE_ROUTE_SHAPES";
export const UPDATE_STOPS = "UPDATE_STOPS";
export const UPDATE_SELECTED_ITEMS = "UPDATE_SELECTED_ITEMS";
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

export function selectItemIndex(itemIndex) {
  return {
    type: SELECT_ITEM,
    itemIndex
  };
}

export function setMapViewInset(bottom) {
  return {
    type: SET_MAP_VIEW_INSET,
    bottom
  };
}

export function startFetchingArrivals() {
  return {
    type: START_FETCHING_ARRIVALS
  };
}

export function updateArrivals(arrivals) {
  return {
    type: UPDATE_ARRIVALS,
    arrivals
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
