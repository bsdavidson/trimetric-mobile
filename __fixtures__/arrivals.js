export const selectedStop = {
  type: "stop",
  position: [-122.68931172788143, 45.51957800931885],
  item: {
    type: "Feature",
    properties: {stop_id: "5016", type: "stop"},
    geometry: {
      type: "Point",
      coordinates: [-122.68931172788143, 45.51957800931885]
    }
  }
};

export const selectedItem = {
  type: "stop",
  position: [-122.68931172788143, 45.51957800931885],
  item: {
    type: "Feature",
    properties: {stop_id: "5016", type: "stop"},
    geometry: {
      type: "Point",
      coordinates: [-122.68931172788143, 45.51957800931885]
    }
  }
};

export const arrivals = [
  {
    route_id: "51",
    route_short_name: "51",
    route_long_name: "Vista",
    route_type: 3,
    route_color: "",
    route_text_color: "",
    trip_id: "7908833",
    stop_id: "5016",
    headsign: "Portland",
    arrival_time: "16:22:00",
    departure_time: "16:22:00",
    vehicle_id: null,
    vehicle_label: null,
    vehicle_position: {
      lat: 0,
      lng: 0,
      bearing: 0,
      odometer: 0,
      speed: 0
    },
    date: "2018-01-19T00:00:00Z",
    trip_shape: {
      direction_id: 1,
      route_id: "51",
      color: "",
      points: [
        {lat: 45.493347, lng: -122.70053},
        {lat: 45.493347, lng: -122.700701},
        {lat: 45.516844, lng: -122.678826}
      ],
      trip_id: "7908833"
    }
  },
  {
    route_id: "51",
    route_short_name: "51",
    route_long_name: "Vista",
    route_type: 3,
    route_color: "",
    route_text_color: "",
    trip_id: "7908834",
    stop_id: "5016",
    headsign: "Portland",
    arrival_time: "16:52:00",
    departure_time: "16:52:00",
    vehicle_id: null,
    vehicle_label: null,
    vehicle_position: {
      lat: 0,
      lng: 0,
      bearing: 0,
      odometer: 0,
      speed: 0
    },
    date: "2018-01-19T00:00:00Z",
    trip_shape: {
      direction_id: 1,
      route_id: "51",
      color: "",
      points: [
        {lat: 45.490581, lng: -122.709817},
        {lat: 45.490589, lng: -122.710375},
        {lat: 45.516844, lng: -122.678826}
      ],
      trip_id: "7908834"
    }
  }
];

export const selectedItems = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {stop_id: "5016", type: "stop"},
      geometry: {
        type: "Point",
        coordinates: [-122.68931172788143, 45.51957800931885]
      }
    }
  ]
};
