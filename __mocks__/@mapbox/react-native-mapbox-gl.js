export function setAccessToken() {}

export default {
  setAccessToken,
  StyleSheet: {
    create: styles => styles,
    identity: value => {
      return 123;
    },
    camera: obj => {
      return "camera_value";
    }
  },
  StyleURL: {
    Light: {}
  },
  ShapeSource: "ShapeSource",
  SymbolLayer: "SymbolLayer",
  LineLayer: "LineLayer",
  CircleLayer: "CircleLayer",
  VectorSource: "VectorSource",
  FillExtrusionLayer: "FillExtrusionLayer",
  MapView: "MapView",
  CameraModes: {
    Flight: 1
  },
  InterpolationMode: {
    Linear: 1
  }
};
