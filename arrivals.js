import React, {Component} from "react";
import {connect} from "react-redux";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator
} from "react-native";

class Arrivals extends Component {
  constructor(props) {
    super(props);

    this.renderArrival = this.renderArrival.bind(this);
  }

  renderArrival(arrival) {
    return (
      <View style={styles.arrivalItem}>
        <Text>Route: {arrival.item.route_id}</Text>
        <Text>Desc: {arrival.item.route_long_name}</Text>
        <Text>StopID: {arrival.item.stop_id}</Text>
        <Text>ArrivalTime: {arrival.item.arrival_time}</Text>
      </View>
    );
  }

  render() {
    let arrivalsForStop = this.props.arrivals.filter(a => {
      return (
        this.props.selectedStop &&
        this.props.selectedStop.stop &&
        this.props.selectedStop.stop.id === a.stop_id
      );
    });
    if (arrivalsForStop.length === 0) {
      return (
        <View style={styles.arrivalList}>
          <View style={styles.arrivalItem}>
            {this.props.fetchingArrivals ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <Text>No upcoming arrivals</Text>
            )}
          </View>
        </View>
      );
    }
    return (
      <FlatList
        style={styles.arrivalList}
        data={arrivalsForStop}
        renderItem={this.renderArrival}
        keyExtractor={(item, index) => String(index)}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    arrivals: state.arrivals,
    selectedItems: state.selectedItems,
    fetchingArrivals: state.fetchingArrivals
  };
}

export default connect(mapStateToProps)(Arrivals);

const styles = StyleSheet.create({
  arrivalList: {
    flex: 1,
    backgroundColor: "#EFEFEF"
  },

  arrivalItem: {
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    height: 100,
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 7,
    minHeight: 100,
    flex: 1,
    borderWidth: 1,
    borderColor: "#cccccc"
  }
});
