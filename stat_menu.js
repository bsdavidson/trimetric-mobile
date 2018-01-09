import React, {Component} from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {connect} from "react-redux";

import {toggleInfoModalVisibility} from "./actions";

class StatMenu extends Component {
  constructor(props) {
    super(props);
    this.handleInfoPress = this.handleInfoPress.bind(this);
  }

  handleInfoPress() {
    this.props.onToggleModalVisibility();
  }

  render() {
    return (
      <View style={[styles.container]}>
        <Text style={styles.text}>
          <Text style={{fontWeight: "bold"}}>{this.props.activeVehicles}</Text>{" "}
          active vehicles
        </Text>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={this.handleInfoPress}>
          <Text style={styles.infoButtonIcon}>?</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    activeVehicles: state.vehicles ? state.vehicles.length : 0
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onToggleModalVisibility: visible => {
      dispatch(toggleInfoModalVisibility());
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StatMenu);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#34495e",
    bottom: 0,
    height: 40,
    left: 0,
    position: "absolute",
    right: 0,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    zIndex: 51
  },
  infoButton: {
    flex: 0,
    position: "absolute",
    right: 5,
    zIndex: 99
  },
  infoButtonIcon: {
    color: "#EFEFEF",
    fontFamily: "Allerta Stencil",
    fontSize: 22,
    marginRight: 20,
    marginTop: 4
  },
  text: {
    color: "#ecf0f1",
    fontSize: 16,
    padding: 8,
    paddingLeft: 15
  }
});
