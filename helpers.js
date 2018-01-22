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
  return Moment.unix(vehicle.timestamp);
}
