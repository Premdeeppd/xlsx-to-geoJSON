const xlsx = require("xlsx");
const fs = require("fs");
const { point, featureCollection } = require("@turf/helpers");

// Read the Excel file
const workbook = xlsx.readFile("data/geo_stats_data_7_days.xlsx");
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert the worksheet to JSON
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

// Skip the header row and convert each row to a GeoJSON feature
let shipData = {};
data.slice(1).forEach(([shipName, lat, lng, headingTo, timestamp]) => {
  lat = parseFloat(lat);
  lng = parseFloat(lng);

  // Check if lat and lng are valid numbers
  if (isNaN(lat) || isNaN(lng)) {
    console.error(`Invalid coordinates for ship ${shipName}: ${lat}, ${lng}`);
    return;
  }

  // If the ship data doesn't exist or the current timestamp is later, update the data
  if (
    !shipData[shipName] ||
    new Date(shipData[shipName].timestamp) < new Date(timestamp)
  ) {
    shipData[shipName] = {
      lat,
      lng,
      headingTo,
      timestamp,
    };
  }
});

// Convert the latest ship data to GeoJSON features
const features = Object.entries(shipData).map(
  ([shipName, { lat, lng, headingTo, timestamp }]) => {
    return point([lng, lat], {
      name: shipName,
      heading_to: headingTo,
      timestamp: timestamp,
    });
  }
);

// Combine all features into a feature collection
const geojson = featureCollection(features);

// Write the GeoJSON data to a file
fs.writeFileSync("data/ship_location2.json", JSON.stringify(geojson));
