import React, {Component} from "react";
import {
  StyleSheet,
  Text,
  Image,
  View,
  TouchableOpacity,
  Switch,
  ScrollView
} from "react-native";
import {connect} from "react-redux";
import LayersMenu from "./layers_menu";
import helpIcon from "./assets/layers.png";
import busIcon from "./assets/bus.png";
import stopIcon from "./assets/stop.png";
import {updateLayerVisibility} from "./actions";
import {getVehiclePoints, getSelectedItem} from "./selectors";

class StatMenu extends Component {
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedItem) {
      this.setState({visible: false});
    }
  }

  render() {
    return (
      <View
        style={[
          styles.container,
          {
            height: this.state.visible ? "40%" : 30
          }
        ]}>
        <View style={styles.headerContainer}>
          <Text>
            <Image style={styles.busImage} source={busIcon} />:{" "}
            {this.props.activeVehicles &&
              this.props.activeVehicles.features.length}
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={this.handleTogglePress}>
            {this.state.visible ? (
              <Text style={styles.closeButtonIcon}>&#x00D7;</Text>
            ) : (
              <Text style={styles.menuButtonIcon}>&#9776;</Text>
            )}
          </TouchableOpacity>
        </View>
        <ScrollView style={{marginTop: 20}}>
          <View style={styles.stat}>
            <Text style={styles.statTitle}>Help</Text>
            <View style={{flex: 0, flexDirection: "row", maxWidth: 280}}>
              <Image style={styles.busImage} source={busIcon} />
              <Text style={styles.statText}>Bus Stats</Text>
            </View>
            <View style={{flex: 0, flexDirection: "row"}}>
              <Image style={styles.stopImage} source={stopIcon} />
              <Text style={styles.statText}>Stop Stats</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    layerVisibility: state.layerVisibility,
    activeVehicles: getVehiclePoints(state),
    selectedItem: getSelectedItem(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onUpdateLayerVisibility: (layerName, value) => {
      dispatch(updateLayerVisibility(layerName, value));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StatMenu);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    zIndex: 51
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    zIndex: 50
  },

  stat: {
    flex: 0,
    marginTop: 0,
    marginLeft: 0,
    padding: 10
  },
  statTitle: {
    color: "#AAAAAA",
    fontSize: 19,
    marginBottom: 10,
    marginLeft: 25
  },
  statText: {
    fontSize: 14,
    marginBottom: 15
  },
  busImage: {
    height: 20,
    width: 20,
    margin: 5,
    marginTop: 2
  },
  stopImage: {
    height: 30,
    width: 20,
    margin: 5,
    marginTop: 2
  },
  closeButton: {
    flex: 0,
    position: "absolute",
    right: 0,
    zIndex: 99
  },
  closeButtonIcon: {
    color: "#AAAAAA",
    fontSize: 28,
    fontWeight: "bold",
    lineHeight: 28,
    margin: 0,
    marginRight: 8,
    padding: 0,
    paddingLeft: 6,
    paddingRight: 6
  },
  menuButtonIcon: {
    fontSize: 18,
    marginRight: 16,
    marginTop: 2,
    color: "#888888"
  }
});
