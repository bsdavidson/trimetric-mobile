import React, {Component} from "react";
import {
  Image,
  PixelRatio,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {connect} from "react-redux";

import layersIcon from "./assets/layers.png";
import {updateLayerVisibility} from "./actions";

const OPTIONS = [
  {label: "Route Lines", key: "routeShapes"},
  {label: "Stops", key: "stops"},
  {label: "Buses", key: "buses"},
  {label: "Trains", key: "trains"},
  {label: "Vehicle Labels", key: "vehicleLabels"},
  {label: "3D Buildings", key: "buildings"}
];

const OPTION_MARGIN = 20;
const OPTION_WIDTH = 170;
const CONTAINER_PADDING = 15;
const MIN_SCREEN_HEIGHT = 400;

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
    if (!this.props.display) {
      return null;
    }
    if (!this.state.visible) {
      return (
        <TouchableOpacity
          onPress={this.handleTogglePress}
          style={[styles.button, {bottom: this.props.bottom}]}>
          <Image style={styles.buttonIcon} source={layersIcon} />
        </TouchableOpacity>
      );
    }
    const {height} = this.props.dimensions.screen;
    const columns = height < MIN_SCREEN_HEIGHT ? 2 : 1;
    const width = CONTAINER_PADDING + (OPTION_WIDTH + OPTION_MARGIN) * columns;

    return (
      <View style={[styles.container, {width}]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={this.handleTogglePress}>
          <Text style={styles.closeButtonIcon}>&#x00D7;</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Visible Features</Text>
        <View style={styles.optionContainer}>
          {OPTIONS.map((o, i) => (
            <View key={i} style={styles.option}>
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
    selectedItemsViewHeight: state.selectedItemsViewHeight,
    layerVisibility: state.layerVisibility,
    dimensions: state.dimensions
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
    maxHeight: "100%",
    padding: CONTAINER_PADDING,
    paddingRight: 0,
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
    marginRight: 0,
    padding: 5,
    paddingRight: 0,
    position: "absolute",
    right: -8,
    zIndex: 90
  },
  buttonIcon: {
    height: 66,
    opacity: 0.6,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 66
  },
  title: {
    color: "#AAAAAA",
    fontSize: 14
  },
  option: {
    alignItems: "center",
    flexDirection: "row",
    marginRight: OPTION_MARGIN,
    marginTop: 10,
    width: OPTION_WIDTH
  },
  optionContainer: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  optionTitle: {
    color: "#666667",
    flex: 1
  },
  optionSwitch: {},
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
