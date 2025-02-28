var duomo = {
  Image: {
    xmlns: "http://schemas.microsoft.com/deepzoom/2008",
    Url: "//openseadragon.github.io/example-images/duomo/duomo_files/",
    Format: "jpg",
    Overlap: "2",
    TileSize: "256",
    Size: {
      Width:  "13920",
      Height: "10200"
    }
  }
};

var viewer = OpenSeadragon({
  id: "seadragon-viewer",
  prefixUrl: "//openseadragon.github.io/openseadragon/images/",
  tileSources: duomo
});

viewer.initializeAnnotations();
var overlay = viewer.svgOverlay();
overlay.node().parentNode.style.pointerEvents = 'none';

// Store drawing points
let drawingPoints = [];

// WebSocket connection to Flask
const socket = io("http://localhost:5000"); 

socket.on("connect", () => {
  console.log("Connected to Flask WebSocket");
});

socket.on("update_coordinates", (data) => {
  let normalizedX = data.x / 1280;
  let normalizedY = data.y / 960;

  if (drawingPoints.length > 0) {
    let lastPoint = drawingPoints[drawingPoints.length - 1];

    // Draw a line from last point to new point
    d3.select(overlay.node()).append("line")
      .attr("x1", lastPoint.x)
      .attr("y1", lastPoint.y)
      .attr("x2", normalizedX)
      .attr("y2", normalizedY)
      .style("stroke", "#00ff00") 
      .style("stroke-width", 0.005)
      .style("opacity", 0.8);
  }

  drawingPoints.push({ x: normalizedX, y: normalizedY });

  // Draw a circle at the new point
  d3.select(overlay.node()).append("circle")
    .attr("cx", normalizedX)
    .attr("cy", normalizedY)
    .attr("r", 0.002)
    .style("fill", "#00ff00")
    .style("opacity", 0.8);
});


// // If you like my work, please consider supporting it at https://www.patreon.com/iangilman

// var duomo = {
//   Image: {
//     xmlns: "http://schemas.microsoft.com/deepzoom/2008",
//     Url: "//openseadragon.github.io/example-images/duomo/duomo_files/",
//     Format: "jpg",
//     Overlap: "2",
//     TileSize: "256",
//     Size: {
//       Width:  "13920",
//       Height: "10200"
//     }
//   }
// };

// var viewer = OpenSeadragon({
//   id: "seadragon-viewer",
//   prefixUrl: "//openseadragon.github.io/openseadragon/images/",
//   tileSources: duomo
// });

// viewer.initializeAnnotations();

// var overlay = viewer.svgOverlay();

// overlay.node().parentNode.style.pointerEvents = 'none';

// // var d3Circle = d3.select(overlay.node()).append("circle")
// //   .style('fill', '#f00')
// //   .attr("cx", 0.2)
// //   .attr("cy", 0.2)
// //   .attr("r", 0.02)
// //   .style("opacity", 0.5);

// function generateClusteredAnnotations(clusterCount, pointsPerCluster) {
//   let svgOverlay = d3.select(overlay.node());

//   for (let i = 0; i < clusterCount; i++) {
//     let clusterCenterX = Math.random(); // Random cluster center (normalized)
//     let clusterCenterY = Math.random();

//     let points = [];

//     // Generate points close to the cluster center
//     for (let j = 0; j < pointsPerCluster; j++) {
//       let randomX = clusterCenterX + (Math.random() - 0.5) * 0.1; // Small offset
//       let randomY = clusterCenterY + (Math.random() - 0.5) * 0.1;
//       points.push({ x: randomX, y: randomY });
//     }

//     // Draw circles at the random points (same color for all)
//     points.forEach(point => {
//       svgOverlay.append("circle")
//         .attr("cx", point.x)
//         .attr("cy", point.y)
//         .attr("r", 0.002)
//         .style("fill", "#00ff00") // Same green color for all
//         .style("opacity", 0.8);
//     });

//     // Draw lines connecting the points within the cluster
//     for (let j = 0; j < points.length - 1; j++) {
//       svgOverlay.append("line")
//         .attr("x1", points[j].x)
//         .attr("y1", points[j].y)
//         .attr("x2", points[j + 1].x)
//         .attr("y2", points[j + 1].y)
//         .style("stroke", "#00ff00") // Same green color for all
//         .style("stroke-width", 0.005)
//         .style("opacity", 0.8);
//     }
//   }
// }

// // Generate 5 clusters with 8 points each
// generateClusteredAnnotations(5, 8);