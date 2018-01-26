import {Platform, PixelRatio} from "react-native";

export const BOTTOM_STATS_BAR_HEIGHT =
  Platform.OS === "android" ? PixelRatio.getPixelSizeForLayoutSize(40) : 40;

// Setting a filter to match a non-existing attribute effectivly hides all the
// elements in the layer.
export const EXCLUDE_ALL = ["==", "non_existing_attribute", "1"];

// By filtering using a != against a non-existing attrib
// effectivly shows all
export const INCLUDE_ALL = ["!=", "non_existing_attribute", "1"];

// This is the first layer ID containing labels from MapBox's light style.
// All Trimetric layers should appear beneath this. The JavaScript SDK allows
// this to be queried dynamically using map.getStyle().layers, but the react native
// map doesn't seem to expose that.
export const MIN_LABEL_LAYER_ID = "place-city-sm";

// Only tram and bus are used by Trimet
export const ROUTE_TYPE_ICONS = {
  0: "tram",
  1: "subway",
  2: "rail",
  3: "bus",
  4: "ferry",
  5: "cable",
  6: "gondola",
  7: "funicular"
};

export const TOUCH_HALF_SIZE = 10 / 2;
