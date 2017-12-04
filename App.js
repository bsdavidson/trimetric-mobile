/**
 * @flow
 */
import React, {Component} from "react";
import Config from "react-native-config";
import {Platform, StyleSheet, Text, View} from "react-native";
import {connect} from "react-redux";
import Mapbox from "@mapbox/react-native-mapbox-gl";
import {feature} from "@turf/helpers";

import {getVehiclePoints, getStopPoints} from "./selectors";
import {setTimeout} from "core-js/library/web/timers";

Mapbox.setAccessToken(Config.MAPBOX_ACCESS_TOKEN);

// This is the first layer ID containing labels from MapBox's light style.
// All Trimetric layers should appear beneath this. The JavaScript SDK allows
// this to be queried dynamically using map.getStyle().layers, but the react native
// map doesn't seem to expose that.
const MIN_LABEL_LAYER_ID = "road-label-small";

export class App extends Component<{}> {
  constructor(props) {
    super(props);

    this.mapRef = null;
    this.state = {
      zoomLevel: 0,
      pressedPoints: {type: "FeatureCollection", features: []}
    };

    this.timeout = null;
    this.handleMapRef = this.handleMapRef.bind(this);
    this.handlePress = this.handlePress.bind(this);
    this.handleRegionDidChange = this.handleRegionDidChange.bind(this);
  }

  handleRegionDidChange(event) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.setState({
        zoomLevel: event.properties.zoomLevel
      });
    }, 100);
  }

  handleMapRef(map) {
    this.mapRef = map;
  }

  async handlePress(e) {
    const {screenPointX, screenPointY} = e.properties;
    console.log(screenPointX, screenPointY);
    let collection = await this.mapRef.queryRenderedFeaturesAtPoint(
      [screenPointX, screenPointY],
      null,
      ["stops_symbol_fill", "stops_point_fill"]
    );
    this.setState({
      pressedPoints: {
        type: "FeatureCollection",
        features: collection.features.map(f => ({
          type: "Feature",
          properties: {stop_id: f.properties.stop_id},
          geometry: f.geometry
        }))
      }
    });
  }

  render() {
    return (
      <View style={styles.map}>
        <Mapbox.MapView
          styleURL={Mapbox.StyleURL.Light}
          zoomLevel={13}
          centerCoordinate={[-122.6865, 45.508]}
          onRegionDidChange={this.handleRegionDidChange}
          onPress={this.handlePress}
          ref={this.handleMapRef}
          style={styles.map}>
          {/* <Mapbox.VectorSource>
            <Mapbox.FillExtrusionLayer
              id="poopy_butthole"
              sourceID="composite"
              sourceLayerID="building"
              filter={["==", "extrude", "true"]}
              minZoomLevel={15}
              style={mapStyles.building}
            />
          </Mapbox.VectorSource> */}

          <Mapbox.ShapeSource
            id="route_shapes_source"
            shape={this.props.lineData}>
            <Mapbox.LineLayer
              id="route_shapes_layer"
              belowLayerID={MIN_LABEL_LAYER_ID}
              style={mapStyles.routeShapesLayer}
            />
          </Mapbox.ShapeSource>

          <Mapbox.ShapeSource
            id="stop_symbols_source"
            shape={this.props.stopPoints}
            images={{
              assets: ["stop"]
            }}>
            <Mapbox.SymbolLayer
              id="stop_symbols_layer"
              minZoomLevel={13}
              belowLayerID={MIN_LABEL_LAYER_ID}
              style={mapStyles.stopSymbolsLayer}
            />
          </Mapbox.ShapeSource>

          <Mapbox.ShapeSource
            id="stop_points_source"
            shape={this.props.stopPoints}>
            <Mapbox.CircleLayer
              id="stop_points_layer"
              maxZoomLevel={13}
              belowLayerID={MIN_LABEL_LAYER_ID}
              style={mapStyles.stopPointsLayer}
            />
          </Mapbox.ShapeSource>

          <Mapbox.ShapeSource
            id="vehicle_symbols_source"
            images={{
              assets: ["bus", "tram"]
            }}
            shape={this.props.vehiclePoints}>
            <Mapbox.SymbolLayer
              id="vehicle_symbols_layer"
              style={mapStyles.vehicleSymbolsLayer}
              belowLayerID={MIN_LABEL_LAYER_ID}
            />
          </Mapbox.ShapeSource>
          <Mapbox.ShapeSource
            id="vehicle_points_source"
            shape={this.props.vehiclePoints}>
            <Mapbox.CircleLayer
              id="vehicle_points_layer"
              maxZoomLevel={13}
              style={mapStyles.vehiclePointsLayer}
              belowLayerID={MIN_LABEL_LAYER_ID}
            />
          </Mapbox.ShapeSource>

          <Mapbox.ShapeSource
            id="pressed_points_source"
            shape={this.state.pressedPoints}>
            <Mapbox.CircleLayer
              id="pressed_points_layer"
              style={mapStyles.pressedPointsLayer}
              belowLayerID={MIN_LABEL_LAYER_ID}
            />
          </Mapbox.ShapeSource>
        </Mapbox.MapView>
      </View>
    );
  }
}

const mapStyles = Mapbox.StyleSheet.create({
  stopPointsLayer: {
    circleColor: "#555555",
    circleOpacity: 0.8,
    circleRadius: Mapbox.StyleSheet.camera(
      {
        0: 0,
        9: 1,
        10: 1.2,
        13: 3
      },
      Mapbox.InterpolationMode.Linear
    )
  },
  stopSymbolsLayer: {
    iconImage: "marker-15",
    iconAllowOverlap: true,

    iconSize: Mapbox.StyleSheet.camera(
      {
        13: 0.5,
        18: 1.5
      },
      Mapbox.InterpolationMode.Linear
    )
  },
  vehicleSymbolsLayer: {
    iconImage: "{icon}",
    iconAllowOverlap: true,
    iconOpacity: 1,
    textField: "{route_id}",
    textOffset: [0, -1],
    textHaloColor: "#FFFFFF",
    textHaloWidth: 3,
    iconSize: Mapbox.StyleSheet.camera(
      {
        0: 0,
        9: 0.04,
        13: 0.1,
        18: 0.3
      },
      Mapbox.InterpolationMode.Linear
    )
  },
  vehiclePointsLayer: {
    circleColor: Mapbox.StyleSheet.source(
      {
        0: "#FF00FF",
        3: "#FF000F"
      },
      "routeType",
      Mapbox.InterpolationMode.Categorical
    ),
    circleOpacity: 0.0,
    circleRadius: Mapbox.StyleSheet.camera(
      {
        0: 0,
        9: 2,
        10: 2.4,
        13: 6
      },
      Mapbox.InterpolationMode.Linear
    )
  },
  routeShapesLayer: {
    lineColor: Mapbox.StyleSheet.identity("color"),
    lineOpacity: 1,
    lineWidth: 3
  },
  building: {
    fillExtrusionOpacity: 1,
    fillExtrusionHeight: Mapbox.StyleSheet.identity("height"),

    fillExtrusionBase: Mapbox.StyleSheet.identity("min_height"),
    fillExtrusionColor: "#FFFFFF"
  },
  pressedPointsLayer: {
    circleColor: "rgba(0,0,0,0)",
    circleStrokeWidth: 2,
    circleStrokeOpacity: 0.5,
    circleStrokeColor: "#00FFFF",
    circleTranslate: {x: 1.5, y: 0},
    circleRadius: 14
  }
});

const styles = StyleSheet.create({
  map: {
    flex: 1
  }
});

function mapStateToProps(state) {
  return {
    lineData: state.lineData,
    stopPoints: getStopPoints(state),
    vehiclePoints: getVehiclePoints(state)
  };
}

export default connect(mapStateToProps)(App);
