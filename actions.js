export const UPDATE_ARRIVALS = "UPDATE_ARRIVALS";
export const UPDATE_LINES = "UPDATE_LINES";
export const UPDATE_LOCATION = "UPDATE_LOCATION";
export const UPDATE_ROUTES = "UPDATE_ROUTES";
export const UPDATE_STOPS = "UPDATE_STOPS";
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

export function updateLines(lineData) {
  return {
    type: UPDATE_LINES,
    lineData
  };
}

export function updateStops(stops) {
  return {
    type: UPDATE_STOPS,
    stops
  };
}

export function updateVehicles(vehicles) {
  return {
    type: UPDATE_VEHICLES,
    vehicles
  };
}
