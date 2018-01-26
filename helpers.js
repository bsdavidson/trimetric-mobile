import {Dimensions} from "react-native";

import Moment from "moment";

export function parseArrivalTime(date, arrivaltime) {
  let parts = arrivaltime.split(":").map(p => parseInt(p, 10));
  // Time can exceed 24 hours for arrival times
  date = Moment(date.replace(/Z$/, ""));
  date.add(parts[0], "hours");
  date.add(parts[1], "minutes");
  date.add(parts[2], "seconds");
  return date;
}

export function parseTimestamp(timestamp) {
  return Moment.unix(timestamp);
}

export function boxFromBounds(screenPointX, screenPointY, halfSize, mapBounds) {
  // bounds [2][2]float64
  // bounds[0] ne bounds[1]sw
  // bounds[0][0] X lng  width
  // bounds [0][1] Y lat height
  // lat increases to the north
  // lng increases to the east

  let screenWidth = Dimensions.get("window").width;
  let screenHeight = Dimensions.get("window").height;
  let screenMaxY = (screenPointY + halfSize) / screenHeight;
  let screenMaxX = (screenPointX + halfSize) / screenWidth;
  let screenMinY = (screenPointY - halfSize) / screenHeight;
  let screenMinX = (screenPointX - halfSize) / screenWidth;

  let boundsHeight = mapBounds[0][1] - mapBounds[1][1];
  let boundsWidth = mapBounds[0][0] - mapBounds[1][0];

  // create the points that complete a square that indicates the pressed area
  let boundsBox = [[], [], [], [], []];
  // top-left
  boundsBox[0][0] = mapBounds[1][0] + boundsWidth * screenMinX;
  boundsBox[0][1] = mapBounds[0][1] - boundsHeight * screenMinY;
  // top-right
  boundsBox[1][0] = mapBounds[1][0] + boundsWidth * screenMaxX;
  boundsBox[1][1] = mapBounds[0][1] - boundsHeight * screenMinY;
  // bottom-right
  boundsBox[2][0] = mapBounds[1][0] + boundsWidth * screenMaxX;
  boundsBox[2][1] = mapBounds[0][1] - boundsHeight * screenMaxY;
  // bottom-left
  boundsBox[3][0] = mapBounds[1][0] + boundsWidth * screenMinX;
  boundsBox[3][1] = mapBounds[0][1] - boundsHeight * screenMaxY;
  // top-right
  boundsBox[4][0] = mapBounds[1][0] + boundsWidth * screenMinX;
  boundsBox[4][1] = mapBounds[0][1] - boundsHeight * screenMinY;
  return boundsBox;
}
