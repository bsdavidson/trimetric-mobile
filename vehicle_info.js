import React, {Component} from "react";
import Moment from "moment";
import {connect} from "react-redux";
import {Text, View, StyleSheet, TouchableOpacity} from "react-native";
import {selectArrival} from "./actions";
import {
  getSelectedItem,
  getVehicleInfoFromArrival,
  getVehicleInfoFromSelectedItem
} from "./selectors";

class VehicleInfo extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <View />;
  }
}

function mapStateToProps(state) {
  return {
    selectedItem: getSelectedItem(state),
    selectedVehicleInfo: getVehicleInfoFromSelectedItem(state),
    selectedItems: state.selectedItems
  };
}

export default connect(mapStateToProps)(VehicleInfo);

const styles = StyleSheet.create({
  vehicle: {
    flex: 1
  }
});
