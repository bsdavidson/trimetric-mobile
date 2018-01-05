// @ts-check
import React, {Component} from "react";
import {connect} from "react-redux";
import {AsyncStorage} from "react-native";
import Moment from "moment";

import {
  setConnectingStatusConnected,
  LocationTypes,
  startFetchingArrivals,
  updateArrivals,
  updateRouteShapes,
  updateLocation,
  updateRoutes,
  updateStops,
  updateTotals,
  updateVehicles
} from "./actions";

const UPDATE_TIMEOUT = 10000;

const MESSAGE_TYPE_TO_ACTION = {
  arrivals: updateArrivals,
  routes: updateRoutes,
  route_shapes: updateRouteShapes,
  stops: updateStops,
  vehicles: updateVehicles,
  totals: updateTotals
};

const BASE_URL = "http://10.0.0.69:8181";
// const BASE_URL = "http://10.47.109.180:8181";

function buildQuery(params) {
  return Object.keys(params)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");
}

export function setStorageValue(key, value) {
  AsyncStorage.setItem(key, JSON.stringify(value));
}

export function getStorageValue(key) {
  return AsyncStorage.getItem(key).then(v => {
    if (!v) {
      return null;
    }
    return JSON.parse(v);
  });
}

export class DataService extends Component {
  constructor(props) {
    super(props);
    this.store = null;
    this.running = false;
    this.timeoutID = null;
    this.connectTimeout = null;
    this.updateLocalStorage = false;
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedItems !== prevProps.selectedItems) {
      this.update();
      this.props.onSelectedItemsChange();
    }
    if (
      this.updateLocalStorage &&
      this.props.totals &&
      this.props.routeShapes &&
      this.props.totals.stops <= this.props.stops.length &&
      this.props.totals.routes <= this.props.routes.length &&
      this.props.totals.route_shapes <= this.props.routeShapes.length
    ) {
      setStorageValue("last_static_fetch", Moment());
      this.updateLocalStorage = false;
    }
  }

  componentWillMount() {
    this.connect();
  }

  componentWillUnmount() {
    this.running = false;
    clearTimeout(this.timeoutID);
  }

  componentDidMount() {
    this.running = true;
    this.update();
  }

  async connect() {
    let lf = await getStorageValue("last_static_fetch");
    let now = Moment();
    if (!lf || now.isAfter(Moment(lf).add(1, "day"))) {
      this.updateLocalStorage = true;
      this.connectWS(true);
      return;
    }

    this.connectWS(false);
  }

  connectWS(getStatic) {
    const url = `${BASE_URL}/ws`.replace(/^http(s?)/, "ws$1");
    console.log("Connecting to: ", url);

    this.connection = new WebSocket(
      `${url}?${buildQuery({chunkify: false, static: getStatic})}`
    );
    this.connection.onopen = this.props.onConnect();

    this.connection.onclose = e => {
      console.warn("WebSocket Disconnected", e.code, e.reason, e);
      setTimeout(() => {
        this.connect();
      }, 1000);
    };

    this.connection.onmessage = message => {
      try {
        var parsedMsg = JSON.parse(message.data);
      } catch (err) {
        console.warn("WebSocket JSON Error:", err);
        return;
      }
      this.props.onMessage(parsedMsg);
    };

    this.connection.onerror = err => {
      console.warn("WebSocket Error:", err.message, err);
    };
  }

  fetchArrivals(stopIDs) {
    if (!stopIDs || stopIDs.length === 0) {
      throw new Error("stop is required");
    }

    let url = `${BASE_URL}/api/v1/arrivals?${buildQuery({
      stop_ids: stopIDs
    })}`;
    return fetch(url)
      .then(response => response.json())
      .then(arrivals => {
        this.props.onArrivalsUpdate(arrivals);
        return arrivals;
      });
  }

  timeout() {
    clearTimeout(this.timeoutID);
    this.timeoutID = setTimeout(() => {
      this.update();
    }, UPDATE_TIMEOUT);
  }

  getStopListFromSelectedStops() {
    selectedItems = this.props.selectedItems;
    if (!selectedItems) {
      return [];
    }
    let stopIDs = [];
    if (!selectedItems.features) {
      return stopIDs;
    }
    selectedItems.features.forEach(s => {
      if (s.properties.stop_id) {
        stopIDs.push(s.properties.stop_id);
      }
    });
    return stopIDs;
  }

  update() {
    let stopIDs = this.getStopListFromSelectedStops();
    let promises = [];
    if (stopIDs.length > 0) {
      promises.push(this.fetchArrivals(stopIDs));
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

  render() {
    return null;
  }
}

function mapDispatchToProps(dispatch) {
  return {
    onSelectedItemsChange: () => {
      dispatch(startFetchingArrivals());
    },
    onMessage: message => {
      let action = MESSAGE_TYPE_TO_ACTION[message.type];
      console.log("ws message", message.type);
      if (!action) {
        return;
      }
      dispatch(action(message.data));
    },
    onConnect: () => {
      dispatch(setConnectingStatusConnected());
    },
    onArrivalsUpdate: arrivals => {
      dispatch(updateArrivals(arrivals));
    },
    updateStops: stops => {
      dispatch(updateStops(stops));
    },
    updateRoutes: routes => {
      dispatch(updateRoutes(routes));
    },
    updateRouteShapes: routeShapes => {
      dispatch(updateRouteShapes(routeShapes));
    }
  };
}

function mapStateToProps(state) {
  return {
    routes: state.routes,
    routeShapes: state.routeShapes,
    selectedItems: state.selectedItems,
    stops: state.stops,
    totals: state.totals
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataService);
