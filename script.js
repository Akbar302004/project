var map = L.map("map").fitWorld();
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

function getTrafficData(lat, lon) {
  fetch(
    `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lon}&unit=KMPH&key=r38nYPBoiPQeAbDw7KKflYy9ebJXNw6O`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data && data.flowSegmentData) {
        let congestion =
          data.flowSegmentData.currentSpeed < 20
            ? "High"
            : data.flowSegmentData.currentSpeed < 40
            ? "Medium"
            : "Low";
        let color =
          congestion === "High"
            ? "red"
            : congestion === "Medium"
            ? "orange"
            : "green";

        L.circle([lat, lon], {
          color: color,
          fillColor: color,
          fillOpacity: 0.5,
          radius: 500,
        })
          .addTo(map)
          .bindPopup(`Traffic: ${congestion}`);

        document.getElementById(
          "traffic-info"
        ).innerHTML = `Traffic at (${lat.toFixed(4)}, ${lon.toFixed(
          4
        )}): ${congestion}`;
      }
    })
    .catch((error) => console.error("Error fetching traffic data:", error));
}

function searchLocation() {
  let location = document.getElementById("search-box").value;
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        let lat = parseFloat(data[0].lat);
        let lon = parseFloat(data[0].lon);
        map.setView([lat, lon], 13);
        L.marker([lat, lon])
          .addTo(map)
          .bindPopup(`Searched Location: ${location}`)
          .openPopup();
        getTrafficData(lat, lon);
      } else {
        alert("Location not found");
      }
    })
    .catch((error) => console.error("Error fetching location:", error));
}

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        let userLat = position.coords.latitude;
        let userLon = position.coords.longitude;
        map.setView([userLat, userLon], 13);
        L.marker([userLat, userLon])
          .addTo(map)
          .bindPopup("You are here")
          .openPopup();
        getTrafficData(userLat, userLon);
      },
      () => {
        alert("Geolocation permission denied. Using default location.");
        map.setView([40.7128, -74.006], 13);
      }
    );
  } else {
    alert("Geolocation is not supported by your browser");
    map.setView([40.7128, -74.006], 13);
  }
}

getUserLocation();
