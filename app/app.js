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

function initMap() {
  // 初始化地圖
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: { lat: 25.046, lng: 121.517 },
    disableDefaultUI: true,
  });

  // 給定景點
  let pos1 = { lat: 25.046, lng: 121.517 }; // 台北車站
  let pos2 = { lat: 25.033, lng: 121.564 }; // 台北101
  let pos3 = { lat: 25.033, lng: 121.57 }; // 象山捷運站

  // 依序標示景點
  let marker1 = new google.maps.Marker({
    position: pos1,
    map: map,
    label: "1",
    icon: "http://maps.google.com/mapfiles/ms/icons/red.png", // 紅色標記
  });
  let marker2 = new google.maps.Marker({
    position: pos2,
    map: map,
    label: "2",
    color: "#0000FF",
    icon: "http://maps.google.com/mapfiles/ms/icons/blue.png", // 藍色標記
  });
  let marker3 = new google.maps.Marker({
    position: pos3,
    map: map,
    label: "3",
    icon: "http://maps.google.com/mapfiles/ms/icons/green.png", // 綠色標記
  });

  // 創建方向服務物件和路徑顯示圖層
  // const directionsRenderer = new google.maps.DirectionsRenderer();
  const directionsService = new google.maps.DirectionsService();
  // directionsRenderer.setMap(map); // 將路徑畫在地圖上
  // directionsRenderer.setPanel(document.getElementById("sidebar"));    // 逐行顯示經過道路

  // 計算路徑
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
        // 將地圖自動調整到剛好把route放進去的大小
        // directionsRenderer.setDirections(response);

        // 將route從response裡面讀出來
        let route = response.routes[0].overview_path;

        // 根據讀取的route，產生一個新的路徑圖
        let polyline = new google.maps.Polyline({
          path: route,
          geodesic: true,
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 4,
        });

        // 將剛剛產生的路徑圖加到地圖上
        polyline.setMap(map);
      })
      .catch((e) => window.alert("Directions request failed"));
  }
}

addNewPlan();
