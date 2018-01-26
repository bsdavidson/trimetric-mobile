export const stopPoints = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {type: "stop", stop_id: "13990"},
      geometry: {type: "Point", coordinates: [-122.398702, 45.552013]}
    },
    {
      type: "Feature",
      properties: {type: "stop", stop_id: "13991"},
      geometry: {type: "Point", coordinates: [-122.407683, 45.55363]}
    }
  ]
};

export const stops = [
  {
    id: "2",
    code: "2",
    name: "A Ave & Chandler",
    desc: "Eastbound stop in Lake Oswego (Stop ID 2)",
    lat: 45.420609,
    lng: -122.675671,
    zone_id: "B",
    url: "http://trimet.org/#tracker/stop/2",
    location_type: 0,
    parent_station: "",
    direction: "East",
    position: "Nearside",
    wheelchair_boarding: 0,
    distance: 0
  },
  {
    id: "landmark-2560",
    code: "",
    name: "SE Park Ave MAX Station",
    desc: "",
    lat: 45.430735,
    lng: -122.635065,
    zone_id: "",
    url: "",
    location_type: 1,
    parent_station: "",
    direction: "",
    position: "",
    wheelchair_boarding: 0,
    distance: 0
  }
];
