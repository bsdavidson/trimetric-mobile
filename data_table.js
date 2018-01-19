import React, {Component} from "react";
import Moment from "moment";
import {connect} from "react-redux";
import {StyleSheet, Text, View, FlatList, Button} from "react-native";

function mapStateToProps(state) {
  return {
    vehicles: state.vehicles
  };
}

function keyExtractor(item, index) {
  return String(item.vehicle.id);
}

class DataTable extends Component {
  constructor(porps) {
    super(porps);
    this.updateCounts = {};
    this.renderItem = this.renderItem.bind(this);
  }

  renderItem(item) {
    if (!item.item.vehicle) {
      return;
    }
    if (!this.updateCounts[item.item.vehicle.id]) {
      this.updateCounts[item.item.vehicle.id] = {
        count: 1,
        timestamp: item.item.timestamp
      };
    } else {
      if (
        this.updateCounts[item.item.vehicle.id].timestamp !==
        item.item.timestamp
      ) {
        this.updateCounts[item.item.vehicle.id].count += 1;
        this.updateCounts[item.item.vehicle.id].timestamp = item.item.timestamp;
      }
    }
    return (
      <View>
        <Text>
          {Moment.unix(item.item.timestamp).valueOf()} - {item.item.vehicle.id}{" "}
          - {item.item.vehicle.label}:{
            this.updateCounts[item.item.vehicle.id].count
          }
        </Text>
      </View>
    );
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.vehicles === nextProps.vehicles) {
      return false;
    }
    return true;
  }

  render() {
    let vehicles = this.props.vehicles.slice();

    vehicles.sort((a, b) => {
      let diff = b.timestamp - a.timestamp;
      if (diff !== 0) {
        return diff;
      }
      if (b.vehicle.id > a.vehicle.id) {
        return 1;
      } else if (b.vehicle.id < a.vehicle.id) {
        return -1;
      }
      return 0;
    });
    return (
      <View>
        <View style={styles.bar}>
          <Text>Vehicle Count: {vehicles.length}</Text>
        </View>
        <FlatList
          data={vehicles}
          renderItem={this.renderItem}
          keyExtractor={keyExtractor}
        />
      </View>
    );
  }
}

export default connect(mapStateToProps)(DataTable);

const styles = StyleSheet.create({
  bar: {
    padding: 10,
    borderWidth: 2,
    marginTop: 30
  }
});
