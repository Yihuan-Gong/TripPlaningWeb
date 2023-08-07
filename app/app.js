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
  // 初始化地圖
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 7,
    center: { lat: 25.046, lng: 121.517 },
    disableDefaultUI: true,
  });

  // 創建方向服務物件和路徑顯示圖層
  const directionsRenderer = new google.maps.DirectionsRenderer();
  const directionsService = new google.maps.DirectionsService();
  directionsRenderer.setMap(map); // 將路徑畫在地圖上
  // directionsRenderer.setPanel(document.getElementById("sidebar"));    // 逐行顯示經過道路

  // 計算路徑
  let pos1 = { lat: 25.046, lng: 121.517 }; // 台北車站
  let pos2 = { lat: 25.033, lng: 121.564 }; // 台北101
  let pos3 = "捷運象山站";
  calculateAndDisplayRoute(pos1, pos2, "#FF0000");
  calculateAndDisplayRoute(pos2, pos3, "#0000FF");

  function calculateAndDisplayRoute(start, end, color) {
    directionsService
      .route({
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode["DRIVING"],
      })
      .then((response) => {
        directionsRenderer.setDirections(response);
        let route = response.routes[0].overview_path;
        let polyline = new google.maps.Polyline({
          path: route,
          geodesic: true,
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 4,
        });
        polyline.setMap(map);
      })
      .catch((e) => window.alert("Directions request failed"));
  }
}

addNewPlan();
