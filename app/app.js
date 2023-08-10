function addNewPlan() {
  let initFrom = document.querySelector("form");

  initFrom.addEventListener("submit", (event) => {
    event.preventDefault();

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

  // 初始化search box
  const input = document.getElementById("pac-input");
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // 初始化autocomplete: 自動填入和搜尋功能
  const autocomplete = new google.maps.places.Autocomplete(input, {
    fields: ["formatted_address", "geometry", "name"], // place detail basic ($17/1000 request)
    strictBounds: false, // 可搜尋地圖視窗顯示外的地點
    types: ["establishment"],
  });

  // 初始化方向服務物件
  const directionsService = new google.maps.DirectionsService();

  // 初始化裝入所有行程景點的容器
  let places = [];

  // 主程式：搜尋景點與加入景點功能
  searchAndAddPlace();

  // // 計算路徑
  // calculateAndDisplayRoute(pos1, pos2, "#FF0000");
  // calculateAndDisplayRoute(pos2, pos3, "#0000FF");

  function searchAndAddPlace() {
    /*
     * searchPlace()的部分程式碼來自於 Google LLC 的部分原始碼，根據 Apache-2.0 授權
     * Copyright 2019 Google LLC. All Rights Reserved.
     * SPDX-License-Identifier: Apache-2.0
     */

    let newSpotPos;
    const infowindow = new google.maps.InfoWindow();
    const infowindowContent = document.getElementById("infowindow-content");

    infowindow.setContent(infowindowContent);

    const marker = new google.maps.Marker({
      map,
      anchorPoint: new google.maps.Point(0, -29),
    });

    autocomplete.addListener("place_changed", () => {
      // Reset infowindow
      infowindowContent.querySelector("#add-place").style.display = "block";
      infowindowContent.querySelector("#added").style.display = "none";
      infowindow.close();

      // Reset search marker
      marker.setVisible(false);

      const place = autocomplete.getPlace();

      if (!place.geometry || !place.geometry.location) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
      }

      marker.setPosition(place.geometry.location);
      marker.setVisible(true);
      infowindowContent.children["place-name"].textContent = place.name;
      infowindowContent.children["place-address"].textContent =
        place.formatted_address;
      infowindow.open(map, marker);

      newSpotPos = place.geometry.location;
    });

    // *******
    // 重要：按下加入行程之後的四個動作
    // 1. "加入行程"按鈕 -> "已加入"
    // 2. 標示新加入的景點
    // 3. 顯示上一個景點到新加入景點的路線
    // 4. 在schedule生成新景點的板塊
    // *******
    let addPlaceBtn = document.querySelector("#add-place");
    let added = document.querySelector("#added");
    addPlaceBtn.addEventListener("click", (event) => {
      // Notify: Change the 加入行程 button to 已加入
      addPlaceBtn.style.display = "none";
      added.style.display = "block";

      // Add new tour spot
      places.push(newSpotPos);
      console.log(places);

      // Mark the added new spot
      let newSpotMarker = new google.maps.Marker({
        map: map,
        label: places.length.toString(),
        icon: "http://maps.google.com/mapfiles/ms/icons/red.png", // 紅色標記
      });
      newSpotMarker.setPosition(newSpotPos);

      // Calculate and display the route from prev spot to the new added spot
      if (places.length >= 2) {
        start = places[places.length - 1];
        end = places[places.length - 2];
        calculateAndDisplayRoute(start, end, "#FF0000");
      }
    });
  }

  function calculateAndDisplayRoute(start, end, color) {
    directionsService
      .route({
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode["DRIVING"],
      })
      .then((response) => {
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
