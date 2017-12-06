// @ts-check

import {
  LocationTypes,
  updateArrivals,
  updateRouteShapes,
  updateLocation,
  updateRoutes,
  updateStops,
  updateVehicles
} from "./actions";

const UPDATE_TIMEOUT = 1000;

const MESSAGE_TYPE_TO_ACTION = {
  arrivals: updateArrivals,
  routes: updateRoutes,
  route_shapes: updateRouteShapes,
  stops: updateStops,
  vehicles: updateVehicles
};

const BASE_URL = "http://10.0.0.68:8181";

function buildQuery(params) {
  return Object.keys(params)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");
}

export class DataService {
  constructor(store) {
    this.store = store;
    this.running = false;
    this.timeoutID = null;
    this.selectedStop = null;

    this.handleStopChange = this.handleStopChange.bind(this);
    this.connect();
  }

  connect() {
    const url = `${BASE_URL}/ws`.replace(/^http(s?)/, "ws$1");
    this.connection = new WebSocket(url + "?chunkify=false");

    this.connection.onopen = () => {
      console.log("WebSocket Connected");
    };

    this.connection.onclose = () => {
      console.warn("WebSocket Disconnected");
    };

    this.connection.onmessage = message => {
      try {
        var parsedMsg = JSON.parse(message.data);
      } catch (err) {
        console.warn("WebSocket JSON Error:", err);
        return;
      }
      this.handleMessage(parsedMsg);
    };
    this.connection.onerror = err => {
      console.warn("WebSocket Error:", err);
    };
  }

  fetchArrivals(stop) {
    if (!stop) {
      throw new Error("stop is required");
    }

    let url = `${BASE_URL}/api/v1/arrivals?${buildQuery({stop_ids: stop.id})}`;
    return fetch(url)
      .then(response => response.json())
      .then(arrivals => {
        this.store.dispatch(updateArrivals(arrivals));
        return arrivals;
      });
  }

  handleMessage(message) {
    let action = MESSAGE_TYPE_TO_ACTION[message.type];
    if (!action) {
      return;
    }
    this.store.dispatch(action(message.data));
  }

  handleStopChange(stop) {
    if (!stop) {
      this.selectedStop = null;
      return;
    }
    this.selectedStop = stop;
    this.store.dispatch(
      updateLocation(LocationTypes.STOP, stop.id, stop.lat, stop.lng, false)
    );
  }

  start() {
    this.running = true;
    this.update();
  }

  stop() {
    this.running = false;
    clearTimeout(this.timeoutID);
  }

  timeout() {
    clearTimeout(this.timeoutID);
    this.timeoutID = setTimeout(() => {
      this.update();
    }, UPDATE_TIMEOUT);
  }

  update() {
    let promises = [];
    if (this.selectedStop) {
      promises.push(this.fetchArrivals(this.selectedStop));
    }
    return Promise.all(promises)
      .then(results => {
        this.timeout();
        let [arrivals] = results;
        return {arrivals: arrivals || []};
      })
      .catch(err => {
        this.timeout();
        throw err;
      });
  }
}
