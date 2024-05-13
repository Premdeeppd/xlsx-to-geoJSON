const xlsx = require("xlsx");
const fs = require("fs");
const { point, featureCollection } = require("@turf/helpers");

// Read the Excel file
const workbook = xlsx.readFile("data/port_geo_location.xlsx");
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert the worksheet to JSON
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

// Skip the header row and convert each row to a GeoJSON feature
const features = data
  .slice(1)
  .map(([shipName, lat, lng, headingTo, timestamp]) => {
    lat = parseFloat(lat);
    lng = parseFloat(lng);

    // Check if lat and lng are valid numbers
    if (isNaN(lat) || isNaN(lng)) {
      console.error(`Invalid coordinates for ship ${shipName}: ${lat}, ${lng}`);
      return null;
    }

    return point([lng, lat], {
      name: shipName,
      heading_to: headingTo,
      timestamp: timestamp,
    });
  });

// Combine all features into a feature collection
const geojson = featureCollection(features);

// Write the GeoJSON data to a file
fs.writeFileSync("data/port_location.json", JSON.stringify(geojson));
