/**
 * @flow
 */
import React, {Component} from "react";
import {
  Dimensions,
  PixelRatio,
  Platform,
  StyleSheet,
  Text,
  View
} from "react-native";
import {connect} from "react-redux";

import Mapbox from "@mapbox/react-native-mapbox-gl";
import {bboxPolygon} from "turf";
import {feature, lineString} from "@turf/helpers";

import {selectItemIndex, unfollow, updateSelectedItems} from "./actions";
import ArrivalShapesLayer from "./arrival_shapes_layer";
import BuildingsLayer from "./buildings_layer";
import {BOTTOM_STATS_BAR_HEIGHT, TOUCH_HALF_SIZE} from "./constants";
import DataService from "./data";
import DimensionsListener from "./dimension_listener";
import InfoModal from "./info_modal";
import Intro from "./intro";
import LayersMenu from "./layers_menu";
import RouteShapesLayer from "./route_shapes_layer";
import {MAPBOX_ACCESS_TOKEN} from "./secrets";
import SelectedItemsView from "./selected_items_view";
import SelectedLayer from "./selected_layer";
import {
  getSelectedItem,
  getSelectedItemsInfo,
  getVehicleInfoFromArrival
} from "./selectors";
import StatMenu from "./stat_menu";
import StopsLayer from "./stops_layer";
import VehiclesLayer from "./vehicles_layer";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export class App extends Component {
  state = {
    zoomLevel: 0
  };

  cameraTimeout = null;
  mapRef = null;
  zoomLevelTimeoutID = null;

  constructor(props) {
    super(props);

    this.handleLongPress = this.handleLongPress.bind(this);
    this.handleMapRef = this.handleMapRef.bind(this);
    this.handlePress = this.handlePress.bind(this);
    this.handleRegionDidChange = this.handleRegionDidChange.bind(this);
    this.handleSelectedItemsResize = this.handleSelectedItemsResize.bind(this);
    this.moveCameraToArrival = this.moveCameraToArrival.bind(this);
    this.selectedItemCameraMove = this.selectedItemCameraMove.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.selectedItemCameraMove(nextProps);
    this.selectedArrivalCameraMove(nextProps);
  }

  handleMapRef(map) {
    this.mapRef = map;
  }

  handleRegionDidChange(event) {
    if (event.properties.isUserInteraction && this.props.following) {
      // Set when the user intentially drags the map. In this case, we want to turn
      // off follow mode to prevent the map from snapping back to the selected
      // item.
      this.props.onMoveMap();
    }
    clearTimeout(this.zoomLevelTimeoutID);
    this.zoomLevelTimeoutID = setTimeout(() => {
      this.setState({
        zoomLevel: event.properties.zoomLevel
      });
    }, 100);
  }

  async handlePress(e) {
    const {screenPointX, screenPointY} = e.properties;
    let collection = await this.mapRef.queryRenderedFeaturesInRect(
      [
        screenPointY + TOUCH_HALF_SIZE,
        screenPointX + TOUCH_HALF_SIZE,
        screenPointY - TOUCH_HALF_SIZE,
        screenPointX - TOUCH_HALF_SIZE
      ],
      null,
      ["stop_symbols_layer", "vehicle_symbols_layer"]
    );

    this.props.onSelectItems({
      type: "FeatureCollection",
      features: collection.features.map(f => ({
        type: "Feature",
        properties: f.properties,
        geometry: f.geometry
      }))
    });
  }

  async handleLongPress(e) {
    await this.mapRef.setCamera({
      bounds: {
        ne: [-122.67752, 45.515785],
        sw: [-122.6775214, 45.5209311],
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
        paddingBottom: 0
      },
      duration: 600,
      mode: Mapbox.CameraModes.Flight
    });
  }

  // Handles camera positioning when the selected items menu is opened/closed
  handleSelectedItemsResize() {
    if (
      !this.mapRef ||
      !this.props.selectedItem ||
      !this.props.selectedItem.position ||
      !this.props.following
    ) {
      return;
    }

    if (this.cameraTimeout) {
      clearTimeout(this.cameraTimeout);
    }

    this.cameraTimeout = setTimeout(() => {
      if (this.props.selectedArrivalVehicleInfo) {
        // We are currently looking at an arrival, so we want to move the
        // camera to encompass both the vehicle (pos1) and the destination
        // stop (pos2).
        let pos1 = [
          this.props.selectedArrivalVehicleInfo.position.lng,
          this.props.selectedArrivalVehicleInfo.position.lat
        ];
        let pos2 = this.props.selectedItem.position;
        this.moveCameraToArrival(pos1, pos2);
        return;
      }

      this.mapRef.setCamera({
        centerCoordinate: this.props.selectedItem.position,
        zoom: 16,
        duration: 600
      });
    }, Platform.OS === "ios" ? 100 : 0);
  }

  render() {
    const mapInsetBottom = Math.max(
      Platform.OS === "android"
        ? Math.floor(
            PixelRatio.getPixelSizeForLayoutSize(
              this.props.selectedItemsViewHeight
            )
          )
        : this.props.selectedItemsViewHeight,
      BOTTOM_STATS_BAR_HEIGHT
    );
    let map = null;
    if (this.props.loaded) {
      map = (
        <Mapbox.MapView
          centerCoordinate={[-122.6865, 45.508]}
          contentInset={[0, 0, mapInsetBottom, 0]}
          onLongPress={this.handleLongPress}
          onPress={this.handlePress}
          onRegionDidChange={this.handleRegionDidChange}
          ref={this.handleMapRef}
          styleURL={Mapbox.StyleURL.Light}
          style={[
            styles.map,
            {
              // I'm setting the Width and Height here instead of using Flex
              // to help mitigate a Mapbox bug when rotating the device. It
              // helps, but isn't a fix as the bug can still occcur. Therefore
              // in the release build, I disable landscape mode but will leave
              // this here in case there is a need later.
              height: Math.max(this.props.dimensions.screen.height, 300),
              maxHeight: Math.max(this.props.dimensions.screen.height, 300),
              maxWidth: Math.max(this.props.dimensions.screen.width, 300),
              width: Math.max(this.props.dimensions.screen.width, 300)
            }
          ]}
          zoomLevel={13}>
          <BuildingsLayer />
          <RouteShapesLayer />
          <ArrivalShapesLayer />
          <StopsLayer />
          <VehiclesLayer />
          <SelectedLayer />
        </Mapbox.MapView>
      );
    }
    return (
      <View style={styles.container}>
        <DataService />
        {map}
        <StatMenu />
        <LayersMenu />
        {this.props.selectedItemsInfo.length > 0 ? (
          <SelectedItemsView onResize={this.handleSelectedItemsResize} />
        ) : null}
        <InfoModal />
        <DimensionsListener />
        <Intro />
      </View>
    );
  }

  selectedItemCameraMove(nextProps) {
    if (
      nextProps.selectedArrival ||
      !nextProps.following ||
      !nextProps.selectedItem ||
      !nextProps.selectedItem.position
    ) {
      return false;
    }

    if (
      this.props.following &&
      nextProps.following && // If we were not following, but changed to following,
      // we want to ignore the fact that the item didn't change since this would
      // indicate that we dragged away from an item but then reselected it.
      (this.props.selectedItem === nextProps.selectedItem ||
        (this.props.selectedItem &&
          this.props.selectedItem.position[0] ===
            nextProps.selectedItem.position[0] &&
          this.props.selectedItem.position[1] ===
            nextProps.selectedItem.position[1] &&
          this.props.selectedItemsViewHeight ===
            nextProps.selectedItemsViewHeight))
    ) {
      return;
    }

    this.mapRef.setCamera({
      centerCoordinate: nextProps.selectedItem.position,
      zoom: 16,
      duration: 600
    });

    return true;
  }

  moveCameraToArrival(pos1, pos2) {
    let ne = [Math.max(pos1[0], pos2[0]), Math.max(pos1[1], pos2[1])];
    let sw = [Math.min(pos1[0], pos2[0]), Math.min(pos1[1], pos2[1])];

    // Android has a bug with the content inset that causes setting the camera
    // to a bounds to get pushed off screen. The workaround involes adding a
    // a stop point to reset the view to center after it sets the zoom.
    // This bug should be fixed in react-native-mapbox v6.0.3
    if (Platform.OS === "android") {
      this.mapRef.setCamera({
        stops: [
          {
            bounds: {
              ne: ne,
              sw: sw,
              paddingLeft: 80,
              paddingRight: 80,
              paddingTop: 80,
              paddingBottom: 80
            },
            duration: 1,
            mode: Mapbox.CameraModes.Flight
          },
          {
            centerCoordinate: [(ne[0] + sw[0]) / 2, (ne[1] + sw[1]) / 2],
            duration: 1
          }
        ]
      });
    } else {
      this.mapRef.setCamera({
        bounds: {
          ne: ne,
          sw: sw,
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 20,
          paddingBottom: 20
        },
        duration: 600,
        mode: Mapbox.CameraModes.Flight
      });
    }

    return true;
  }

  selectedArrivalCameraMove(nextProps) {
    if (
      !nextProps.selectedArrival ||
      !nextProps.following ||
      !nextProps.selectedArrivalVehicleInfo ||
      !nextProps.selectedItem
    ) {
      return false;
    }

    if (
      this.props.following &&
      nextProps.following && // If we were not following, but changed to following,
      // we want to ignore the fact that the item didn't change since this would
      // indicate that we dragged away from an item but then reselected it.
      (this.props.selectedArrivalVehicleInfo &&
        this.props.selectedArrivalVehicleInfo.position.lng ===
          nextProps.selectedArrivalVehicleInfo.position.lng)
    ) {
      return false;
    }

    let pos1 = [
      nextProps.selectedArrivalVehicleInfo.position.lng,
      nextProps.selectedArrivalVehicleInfo.position.lat
    ];
    let pos2 = nextProps.selectedItem.position;
    if (!pos1 || !pos2) {
      return false;
    }
    this.moveCameraToArrival(pos1, pos2);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    flex: 0,
    left: 0,
    position: "absolute",
    top: 0
  }
});

function mapDispatchToProps(dispatch) {
  return {
    onSelectItems: items => {
      dispatch(updateSelectedItems(items));
    },
    onMoveMap: () => {
      dispatch(unfollow());
    }
  };
}

function mapStateToProps(state) {
  return {
    dimensions: state.dimensions,
    following: state.following,
    loaded: state.loaded,
    selectedArrival: state.selectedArrival,
    selectedArrivalVehicleInfo: getVehicleInfoFromArrival(state),
    selectedItem: getSelectedItem(state),
    selectedItemsInfo: getSelectedItemsInfo(state),
    selectedItemsViewHeight: state.selectedItemsViewHeight
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
