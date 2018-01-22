export const props = {
  visible: true,
  routeShapes: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {color: "#CE0F69", route_id: "194"},
        geometry: {
          type: "MultiLineString",
          coordinates: [
            [
              [-122.680501, 45.53012],
              [-122.681354, 45.530079],
              [-122.681105, 45.530084]
            ]
          ]
        }
      },
      {
        type: "Feature",
        properties: {color: "#84BD00", route_id: "193"},
        geometry: {
          type: "MultiLineString",
          coordinates: [
            [
              [-122.671375, 45.493955],
              [-122.671107, 45.49395],
              [-122.698618, 45.529861],
              [-122.698646, 45.530509],
              [-122.698649, 45.530616]
            ],
            [
              [-122.685036, 45.514564],
              [-122.685257, 45.514157],
              [-122.685323, 45.514034],
              [-122.685339, 45.514005]
            ]
          ]
        }
      }
    ]
  },
  selectedArrival: null
};
