export const props = {
  filter: ["!=", "non_existing_attribute", "1"],
  vehiclePoints: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          type: "vehicle",
          icon: "tram",
          vehicle_id: "101",
          route_id: "200",
          stop_id: "7601",
          bearing: 272
        },
        geometry: {type: "Point", coordinates: [-122.67175, 45.526817]}
      },
      {
        type: "Feature",
        properties: {
          type: "vehicle",
          icon: "tram",
          vehicle_id: "536",
          route_id: "200",
          stop_id: "8372",
          bearing: 298
        },
        geometry: {type: "Point", coordinates: [-122.579895, 45.534035]}
      },
      {
        type: "Feature",
        properties: {
          type: "vehicle",
          icon: "tram",
          vehicle_id: "537",
          route_id: "200",
          stop_id: "8347",
          bearing: 165
        },
        geometry: {type: "Point", coordinates: [-122.563545, 45.53022]}
      },
      {
        type: "Feature",
        properties: {
          type: "vehicle",
          icon: "tram",
          vehicle_id: "538",
          route_id: "90",
          stop_id: "10579",
          bearing: 145
        },
        geometry: {type: "Point", coordinates: [-122.59301, 45.58756]}
      }
    ]
  },
  labelsVisible: true
};

export const vehicles = [
  {
    trip: {trip_id: "7918797", route_id: "200"},
    vehicle: {id: "101", label: "Green Line to Clackamas"},
    position: {
      lat: 45.50887,
      lng: -122.68386,
      bearing: 347,
      odometer: 0,
      speed: 0
    },
    current_stop_sequence: 1,
    stop_id: "13140",
    current_status: 1,
    timestamp: 1516746492,
    congestion_level: 0,
    occupancy_status: 0,
    route_type: 0
  },

  {
    trip: {trip_id: "7919096", route_id: "200"},
    vehicle: {id: "537", label: "Green Line to City Ctr"},
    position: {
      lat: 45.435745,
      lng: -122.56782,
      bearing: 350,
      odometer: 0,
      speed: 0
    },
    current_stop_sequence: 1,
    stop_id: "13132",
    current_status: 1,
    timestamp: 1516746481,
    congestion_level: 0,
    occupancy_status: 0,
    route_type: 0
  },

  {
    trip: {trip_id: "7914971", route_id: "90"},
    vehicle: {id: "538", label: "Red Line to Beaverton"},
    position: {
      lat: 45.53185,
      lng: -122.56438,
      bearing: 292,
      odometer: 0,
      speed: 0
    },
    current_stop_sequence: 7,
    stop_id: "8371",
    current_status: 2,
    timestamp: 1516746477,
    congestion_level: 0,
    occupancy_status: 0,
    route_type: 0
  }
];
