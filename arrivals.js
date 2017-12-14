import React, {Component} from "react";
import {connect} from "react-redux";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import {selectArrival} from "./actions";
import {getSelectedItem} from "./selectors";

class Arrivals extends Component {
  constructor(props) {
    super(props);

    this.handleArrivalPress = this.handleArrivalPress.bind(this);
    this.renderArrival = this.renderArrival.bind(this);
  }

  handleArrivalPress(arrival) {
    this.props.onArrivalPress(arrival);
  }

  renderArrival(arrival) {
    return (
      <TouchableOpacity
        onPress={() => {
          this.handleArrivalPress(arrival);
        }}>
        <View style={styles.arrivalItem}>
          <View style={{padding: 10}}>
            <Text style={{fontSize: 22}}>{arrival.item.route_id}</Text>
          </View>
          <View>
            <Text style={{fontSize: 18}}>{arrival.item.route_long_name}</Text>
            <Text>StopID: {arrival.item.stop_id}</Text>
            <Text>ArrivalTime: {arrival.item.arrival_time}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    if (!this.props.selectedItem) {
      return null;
    }
    let arrivalsForStop = this.props.arrivals.filter(a => {
      return this.props.selectedItem.item.properties.stop_id === a.stop_id;
    });

    if (
      arrivalsForStop.length === 0 &&
      this.props.selectedStop &&
      this.props.selectedStop.type === "stop"
    ) {
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
    selectedItem: getSelectedItem(state),
    arrivals: state.arrivals,
    selectedItems: state.selectedItems,
    fetchingArrivals: state.fetchingArrivals
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onArrivalPress: arrival => {
      dispatch(selectArrival(arrival));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Arrivals);

const styles = StyleSheet.create({
  arrivalList: {
    flex: 1
  },

  arrivalItem: {
    backgroundColor: "#FFFFFF",
    // justifyContent: "center",
    alignItems: "center",
    height: 100,
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 7,
    minHeight: 100,
    flexDirection: "row",
    flex: 1,
    borderWidth: 1,
    borderColor: "#cccccc"
  }
});
