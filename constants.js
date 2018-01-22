import {Platform, PixelRatio} from "react-native";

// This is the first layer ID containing labels from MapBox's light style.
// All Trimetric layers should appear beneath this. The JavaScript SDK allows
// this to be queried dynamically using map.getStyle().layers, but the react native
// map doesn't seem to expose that.
export const MIN_LABEL_LAYER_ID = "place-city-sm";

// Setting a filter to match a non-existing attribute effectivly hides all the
// elements in the layer.
export const EXCLUDE_ALL = ["==", "non_existing_attribute", "1"];

// By filtering using a != against a non-existing attrib
// effectivly shows all
export const INCLUDE_ALL = ["!=", "non_existing_attribute", "1"];

export const BOTTOM_STATS_BAR_HEIGHT =
  Platform.OS === "android" ? PixelRatio.getPixelSizeForLayoutSize(40) : 40;
