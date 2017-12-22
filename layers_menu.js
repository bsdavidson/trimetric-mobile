import React, {Component} from "react";
import {
  StyleSheet,
  Text,
  Image,
  View,
  TouchableOpacity,
  Switch
} from "react-native";
import {connect} from "react-redux";

import layersIcon from "./assets/layers.png";
import {updateLayerVisibility} from "./actions";

const OPTIONS = [
  {label: "Route Lines", key: "routeShapes"},
  {label: "Stops", key: "stops"},
  {label: "Buses", key: "buses"},
  {label: "Trains", key: "trains"},
  {label: "Vehicle Labels", key: "vehicleLabels"}
];

class LayersMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false
    };

    this.handleTogglePress = this.handleTogglePress.bind(this);
  }

  handleTogglePress() {
    this.setState({visible: !this.state.visible});
  }

  render() {
    if (!this.state.visible) {
      return (
        <TouchableOpacity
          onPress={this.handleTogglePress}
          style={styles.button}>
          <Image style={styles.buttonIcon} source={layersIcon} />
        </TouchableOpacity>
      );
    }
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={this.handleTogglePress}>
          <Text style={styles.closeButtonIcon}>&#x00D7;</Text>
        </TouchableOpacity>
        <View style={styles.options}>
          <Text style={styles.optionsTitle}>Visible Features</Text>

          {OPTIONS.map(o => (
            <View style={styles.option}>
              <Text style={styles.optionTitle}>{o.label}</Text>
              <Switch
                value={this.props.layerVisibility[o.key]}
                style={styles.optionSwitch}
                onValueChange={e => {
                  this.props.onUpdateLayerVisibility(o.key, e);
                }}
              />
            </View>
          ))}
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    layerVisibility: state.layerVisibility
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onUpdateLayerVisibility: (layerName, value) => {
      dispatch(updateLayerVisibility(layerName, value));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LayersMenu);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    elevation: 4,
    minHeight: 200,
    minWidth: 200,
    position: "absolute",
    right: 35,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 6,
    top: 45
  },
  button: {
    margin: 5,
    padding: 5,
    position: "absolute",
    right: 0,
    top: 20,
    zIndex: 99
  },
  buttonIcon: {
    elevation: 4,
    height: 86,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 86
  },
  options: {
    flex: 1,
    marginTop: 15,
    marginLeft: 10
  },
  optionsTitle: {
    color: "#AAAAAA",
    fontSize: 14,
    marginBottom: 10
  },
  option: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 8
  },
  optionTitle: {
    color: "#666667",
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  optionSwitch: {
    alignItems: "center",
    justifyContent: "flex-end",
    marginRight: 10
  },
  closeButton: {
    flex: 0,
    position: "absolute",
    right: 0,
    zIndex: 99
  },
  closeButtonIcon: {
    color: "#AAAAAA",
    fontSize: 30,
    fontWeight: "bold",
    lineHeight: 30,
    margin: 5,
    marginRight: 8,
    padding: 2,
    paddingLeft: 6,
    paddingRight: 6
  }
});
