var duomo = {
  Image: {
    xmlns: "http://schemas.microsoft.com/deepzoom/2008",
    Url: "https://openseadragon.github.io/example-images/duomo/duomo_files/",
    Format: "jpg",
    Overlap: "2",
    TileSize: "256",
    Size: {
      Width: "13920",
      Height: "10200"
    }
  }
};

// Initialize OpenSeadragon viewer
var viewer = OpenSeadragon({
  id: "seadragon-viewer",
  prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
  tileSources: duomo
});

// Setup overlay for D3.js drawing
var overlay = viewer.svgOverlay();
overlay.node().parentNode.style.pointerEvents = 'none';

// Store drawing points
let drawingPoints = [];

// WebSocket connection to Flask
const socket = io("http://localhost:8000", { transports: ["websocket", "polling"] });


// OpenSeadragon viewer dimensions
const IMAGE_WIDTH = 13920;
const IMAGE_HEIGHT = 10200;

let cursor;

const MAX_POINTS = 500;  // Limit number of points drawn

socket.on("coordinates", function (data) {
  if (typeof data.x !== "number" || typeof data.y !== "number") {
    console.error("Invalid data received:", data);
    return;
  }

  function normalizedToViewport(x, y) {
    let bounds = viewer.viewport.getBounds(); // Visible viewport in image coordinates

    let viewportX = bounds.x + x * bounds.width;
    let viewportY = bounds.y + y * bounds.height;

    return new OpenSeadragon.Point(viewportX, viewportY);
  }


  console.log("DATA:", data.x, data.y);

  // Convert to image space
  // let imageX = data.x * IMAGE_WIDTH;
  // let imageY = data.y * IMAGE_HEIGHT;

  // Convert image coordinates to viewport coordinates
  let viewportPoint = normalizedToViewport(data.x, data.y);


  // Remove existing cursor if present
  if (cursor) {
    cursor.remove();
  }

  // Check if we need to start a new drawing path
  if (data.newPath) {
    drawingPoints = []; // Reset the path to start fresh
  }

  if (data.cursor) {
    cursor = d3.select(overlay.node()).append("circle")
      .attr("cx", viewportPoint.x)
      .attr("cy", viewportPoint.y)
      .attr("r", 0.003)  // Slightly larger radius for visibility
      .style("fill", "red")
      .style("opacity", 1);
    return;
  }

  if (drawingPoints.length > 0) {
    let lastPoint = drawingPoints[drawingPoints.length - 1];

    d3.select(overlay.node()).append("line")
      .attr("x1", lastPoint.x)
      .attr("y1", lastPoint.y)
      .attr("x2", viewportPoint.x)
      .attr("y2", viewportPoint.y)
      .style("stroke", "#00ff00")
      .style("stroke-width", 0.003)  // Adjust stroke width
      .style("opacity", 0.8);
  }

  drawingPoints.push({ x: viewportPoint.x, y: viewportPoint.y });

  // Draw a circle at the new point
  d3.select(overlay.node()).append("circle")
    .attr("cx", viewportPoint.x)
    .attr("cy", viewportPoint.y)
    .attr("r", 0.0003)  // Scale based on zoom
    .style("fill", "#00ff00")
    .style("opacity", 0.8);
});

// Event listener to clear drawing on key press "3"
document.addEventListener("keydown", function(event) {
  if (event.key === "3") {
    drawingPoints = [];
    d3.select(overlay.node()).selectAll("*").remove();
    console.log("Canvas cleared");
  }
});
