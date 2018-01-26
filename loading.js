import React, {Component} from "react";
import {View, Text, ActivityIndicator, StyleSheet} from "react-native";
import {connect} from "react-redux";

import {setLoadingStatusLoaded} from "./actions";
import {getVehiclePoints, getStopPoints} from "./selectors";

export class Loading extends Component {
  state = {
    loading: true
  };

  loadingStatus = 0;

  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    if (!this.state.loading || !this.props.totals) {
      return;
    }
    let thingsLoaded =
      this.props.stopPoints.features.length +
      (this.props.routeShapes && this.props.routeShapes.length);
    let totalThingsToLoad =
      this.props.totals.stops + this.props.totals.route_shapes;

    this.loadingStatus = Math.min(
      Math.floor(thingsLoaded / totalThingsToLoad * 100),
      100
    );

    if (this.props.stopPoints.features.length < this.props.totals.stops) {
      return;
    }

    if (
      !this.props.routeShapes ||
      this.props.routeShapes.length < this.props.totals.route_shapes
    ) {
      return;
    }

    // We don't need to wait until all the vehicles are loaded, just
    // until we get the first response.
    if (!this.props.receivedVehicles) {
      return;
    }

    this.props.onLoadComplete();
    this.setState({
      loading: false
    });
  }

  render() {
    if (!this.props.connected) {
      return (
        <View style={styles.container}>
          <ActivityIndicator
            animating={this.state.loading}
            size="small"
            color="#FFFFFF"
          />
          <Text style={[styles.text]}>Connecting to server...</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <ActivityIndicator
          animating={this.state.loading}
          size="small"
          color="#FFFFFF"
        />

        <Text style={[styles.text, {opacity: this.state.loading ? 1 : 0}]}>
          Loading GTFS data...
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    flex: 1,
    flexDirection: "row",
    justifyContent: "center"
  },
  text: {
    color: "#ecf0f1",
    marginLeft: 10
  }
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadComplete: items => {
      dispatch(setLoadingStatusLoaded());
    }
  };
}

function mapStateToProps(state) {
  return {
    connected: state.connected,
    receivedVehicles: state.receivedVehicles,
    routeShapes: state.routeShapes,
    stopPoints: getStopPoints(state),
    totals: state.totals
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Loading);
