function addNewPlan() {
  let initFrom = document.querySelector("form");

  initFrom.addEventListener("submit", (e) => {
    e.preventDefault();

    let departDate = initFrom.querySelector("#departure-date").value; //string
    let tripName = initFrom.querySelector("#trip-name").value; //string

    console.log("Departure date: " + departDate);
    console.log("Trip name: " + tripName);

    initFrom.style.display = "none";
  });
}

// Initialize and add the map
// function initMap() {
//   let uluru = { lat: -25.344, lng: 131.036 };
//   let map = new google.maps.Map(document.getElementById("map"), {
//     zoom: 4,
//     center: uluru,
//   });
//   let marker = new google.maps.Marker({ position: uluru, map: map });
// }

function initMap() {
  const directionsRenderer = new google.maps.DirectionsRenderer();
  const directionsService = new google.maps.DirectionsService();
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 7,
    center: { lat: 25.046, lng: 121.517 },
    disableDefaultUI: true,
  });

  // 顯示路徑在地圖上
  directionsRenderer.setMap(map);

  // 逐行顯示經過道路
  // directionsRenderer.setPanel(document.getElementById("sidebar"));

  calculateAndDisplayRoute(directionsService, directionsRenderer);
}

function calculateAndDisplayRoute(directionsService, directionsRenderer) {
  const start = { lat: 25.046, lng: 121.517 }; // 台北車站
  const end = { lat: 25.033, lng: 121.564 }; // 台北101
  const selectedMode = "DRIVING";

  directionsService
    .route({
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode[selectedMode],
    })
    .then((response) => {
      directionsRenderer.setDirections(response);
    })
    .catch((e) => window.alert("Directions request failed"));
}

addNewPlan();
