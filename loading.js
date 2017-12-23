import React, {Component} from "react";
import {View, Text, ActivityIndicator, StyleSheet} from "react-native";
import {getVehiclePoints, getStopPoints} from "./selectors";
import {connect} from "react-redux";

import {setLoadingStatusLoaded} from "./actions";

class Loading extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  componentDidUpdate() {
    if (!this.state.loading) {
      return;
    }
    if (!this.props.totals) {
      return;
    }
    if (this.props.stopPoints.features.length < this.props.totals.stops) {
      return;
    }
    if (this.props.vehiclePoints.features.length < this.props.totals.vehicles) {
      return;
    }
    if (
      !this.props.routeShapes ||
      this.props.routeShapes.length < this.props.totals.route_shapes
    ) {
      return;
    }

    this.props.onLoadComplete();
    this.setState({
      loading: false
    });
  }

  render() {
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
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "row"
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
    totals: state.totals,
    routeShapes: state.routeShapes,
    stopPoints: getStopPoints(state),
    vehiclePoints: getVehiclePoints(state)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Loading);
