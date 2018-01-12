import React, {Component} from "react";
import Moment from "moment";
import {connect} from "react-redux";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {selectArrival} from "./actions";
import {
  getSelectedItem,
  getVehicleInfoFromArrival,
  filterArrivalsForStop,
  parseColor,
  ROUTE_TYPE_ICONS
} from "./selectors";

import tram from "./assets/tram.png";
import bus from "./assets/bus.png";

export function parseArrivalTime(date, arrivaltime) {
  let parts = arrivaltime.split(":").map(p => parseInt(p, 10));
  // Time can exceed 24 hours for arrival times
  date = Moment(date.replace(/Z$/, ""));
  date.add(parts[0], "hours");
  date.add(parts[1], "minutes");
  date.add(parts[2], "seconds");
  return date;
}

const VEHICLE_IMAGE = {
  0: tram,
  3: bus
};
class Arrivals extends Component {
  constructor(props) {
    super(props);

    this.handleArrivalPress = this.handleArrivalPress.bind(this);
    this.renderArrival = this.renderArrival.bind(this);
  }

  handleArrivalPress(arrival) {
    this.props.onArrivalPress(arrival);
  }

  componentWillUnmount() {
    this.props.onArrivalPress(null);
  }

  renderArrival(arrival) {
    let bgColor = parseColor(
      arrival.item.route_color ? `#${arrival.item.route_color}` : "#cccccc"
    );
    let color = [50, 50, 50, 1];
    bgColor[3] = 0.3;
    let vehicleType =
      ROUTE_TYPE_ICONS[arrival.item.route_type][0].toUpperCase() +
      ROUTE_TYPE_ICONS[arrival.item.route_type].slice(1);

    // Cap the number of upcomping arrivals
    if (arrival.item.nextArrivals.length < 3) {
      arrival.item.nextArrivals[3] = 0;
    } else {
      arrival.item.nextArrivals.length = 3;
    }

    let nextArrivals = (
      <View style={[styles.nextArrivals, {borderColor: `rgba(${bgColor})`}]}>
        {arrival.item.nextArrivals.map((a, i) => {
          if (!arrival.item.nextArrivals[i]) {
            return (
              <View key={i} style={styles.nextArrival}>
                <Text style={styles.nextArrivalTime} />
              </View>
            );
          }
          return (
            <View
              style={[
                styles.nextArrival,
                {
                  // borderLeftWidth: i === 0 ? 0 : 1,
                  // borderColor: `rgba(${bgColor})`
                }
              ]}
              key={i}>
              <Text style={styles.nextArrivalTime}>
                {parseArrivalTime(a.date, a.arrival_time).fromNow(false)}
              </Text>
              <Text style={styles.nextArrivalScheduled}>
                {a.vehicle_id ? null : "(scheduled)"}
              </Text>
            </View>
          );
        })}
      </View>
    );
    return (
      <TouchableOpacity
        onPress={() => {
          this.handleArrivalPress(arrival);
        }}>
        <View
          style={[
            styles.arrivalItem,
            {
              paddingLeft: 0,
              borderColor: `rgba(${bgColor})`
            }
          ]}>
          <View
            style={[
              styles.arrivalItemRouteID,
              {backgroundColor: `rgba(${bgColor})`}
            ]}>
            <Text
              style={[
                styles.arrivalItemRouteIDText,
                {color: `rgba(${color})`}
              ]}>
              {arrival.item.route_id}
            </Text>
            <View style={styles.arrivalItemRouteIDImage}>
              <Image
                style={styles.itemImage}
                source={VEHICLE_IMAGE[arrival.item.route_type]}
              />
            </View>
          </View>

          <View style={styles.arrivalItemSchedule}>
            <Text
              style={[
                styles.arrivalItemScheduleText,
                {
                  backgroundColor: `rgba(${bgColor})`,
                  color: `rgba(${color})`
                }
              ]}>
              {arrival.item.route_long_name}
              {" to "}
              {arrival.item.headsign}
            </Text>
            <Text style={styles.arrivalItemScheduleTime}>
              {arrival.item.vehicle_id
                ? `${vehicleType} arrives`
                : `${vehicleType} scheduled to arrive`}{" "}
              {parseArrivalTime(
                arrival.item.date,
                arrival.item.arrival_time
              ).fromNow()}
            </Text>
            <Text style={[styles.nextArrivalsHeader]}>Future arrivals:</Text>
            {nextArrivals}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    if (!this.props.selectedItem) {
      return null;
    }
    let arrivalsForStop = filterArrivalsForStop(
      this.props.selectedItem.item.properties.stop_id,
      this.props.arrivals
    );

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
              <View style={{flex: 1, alignItems: "center"}}>
                <Text>No upcoming arrivals</Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    let arrivalsMap = {};
    arrivalsForStop.forEach(a => {
      if (!arrivalsMap[a.route_id]) {
        arrivalsMap[a.route_id] = a;
        arrivalsMap[a.route_id].nextArrivals = [];
        return;
      }
      arrivalsMap[a.route_id].nextArrivals.push(a);
    });
    let arrivalsData = Object.keys(arrivalsMap).map(k => {
      return arrivalsMap[k];
    });

    return (
      <View style={styles.arrivalList}>
        <View style={styles.arrivalListTitle}>
          <Text>Upcoming Arrivals</Text>
        </View>
        <FlatList
          style={{paddingTop: 5}}
          data={arrivalsData}
          renderItem={this.renderArrival}
          keyExtractor={(item, index) => String(index)}
        />
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    selectedItem: getSelectedItem(state),
    arrivalVehicle: getVehicleInfoFromArrival(state),
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
  arrivalListTitle: {
    backgroundColor: "#CCCCCC",
    borderRadius: 4,
    marginBottom: 0,
    padding: 5
  },
  arrivalItem: {
    // height: 70,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 0,
    borderColor: "#cccccc",
    borderWidth: 0,
    flex: 1,
    flexDirection: "row",
    marginBottom: 0,
    minHeight: 83,
    padding: 4,
    paddingLeft: 10,
    paddingRight: 0
  },
  arrivalItemRouteID: {
    alignItems: "center",
    borderRadius: 4,
    borderTopRightRadius: 0,
    justifyContent: "center",
    marginRight: 0,
    padding: 0,
    width: 45
  },
  arrivalItemRouteIDText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 1
  },
  arrivalItemRouteIDImage: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center"
  },
  arrivalItemSchedule: {
    alignSelf: "flex-start",
    flex: 1
  },
  arrivalItemScheduleText: {
    fontSize: 14,
    fontWeight: "bold",
    padding: 5
  },
  arrivalItemScheduleTime: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
    marginTop: 5,
    marginBottom: 5
  },
  itemImage: {
    height: 25,
    marginTop: 0,
    padding: 0,
    paddingRight: 10,
    resizeMode: "contain",
    width: 25
  },
  nextArrivals: {
    borderRadius: 2,
    borderWidth: 0,
    flexDirection: "row",
    marginLeft: 4
  },
  nextArrivalsHeader: {
    padding: 3,
    paddingBottom: 0,
    fontSize: 11,
    paddingLeft: 5
  },
  nextArrival: {
    flex: 1,
    opacity: 0.5,
    padding: 2
  },
  nextArrivalTime: {
    color: "#222222",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "left"
  },
  nextArrivalScheduled: {
    color: "#222222",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "left"
  }
});
