addNewPlan();

function addNewPlan() {
  let initFrom = document.querySelector(".init-form");
  let schedule = document.querySelector(".schedule");

  // Before user fill in the init form, daily schedule is hidden
  schedule.style.display = "none";

  initFrom.addEventListener("submit", (event) => {
    event.preventDefault();

    let departDate = initFrom.querySelector("#departure-date").value; //string
    let tripName = initFrom.querySelector("#trip-name").value; //string

    // After the init form filled, replace the init form with schedule
    initFrom.style.display = "none";
    schedule.style.display = "block";

    // Mark the date on day bar according to init form
    let day1Btn = document.querySelector(".day1");
    day1Btn.children["date"].textContent = departDate.slice(-5);
  });
}

function addSchedule(newSpot) {
  // TourSpot newSpot
  let dailySchedule = document.querySelector("div.daily-schedule");
  let timeAndSpot = document.createElement("div");
  timeAndSpot.classList.add("time-and-tourist-spot");
  timeAndSpot.classList.add(`id-${newSpot.id}`);

  if (newSpot.id == 1) {
    timeAndSpot.classList.add("start-or-end");
    timeAndSpot.innerHTML = `<img class="place" src="../icon/place2.png" alt="place-marker" />
    <div class="time">
      <p class="start-or-end-time">${newSpot.startTime}</p>
      <p class="action">出發</p>
    </div>

    <div class="tourist-spot">
      <p class="spot">${newSpot.name}</p>
    </div>`;
  } else {
    timeAndSpot.classList.add("traveling");
    timeAndSpot.innerHTML = `<img class="place" src="../icon/place2.png" alt="place-marker" />
    <div class="time">
      <p class="start-time">${newSpot.startTime}</p>
      <p class="to">-</p>
      <p class="end-time">${newSpot.endTime}</p>
    </div>

    <div class="tourist-spot">
      <p class="spot">${newSpot.name}</p>
      <p class="stay-time">停留${newSpot.duration}</p>
      <p class="cost">花費0</p>
    </div>`;
  }

  dailySchedule.appendChild(timeAndSpot);
}

class TourSpot {
  name;
  pos;
  startTime;
  endTime;
  duration;
  cost;
  id;

  constructor(name, pos, id) {
    this.name = name;
    this.pos = pos;
    this.id = id;
  }

  calculateEndTime() {
    this.endTime = this.startTime + this.duration;
  }
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

  function searchAndAddPlace() {
    /*
     * searchPlace()的部分程式碼來自於 Google LLC 的部分原始碼，根據 Apache-2.0 授權
     * Copyright 2019 Google LLC. All Rights Reserved.
     * SPDX-License-Identifier: Apache-2.0
     */

    // INITIALIZATION
    let infowindowContent = document.querySelector("#infowindow-content");
    const infowindow = new google.maps.InfoWindow();
    infowindow.setContent(infowindowContent);

    const marker = new google.maps.Marker({
      map,
      anchorPoint: new google.maps.Point(0, -29),
    });

    // SEARCH PHASE
    let spotPos, spotName;
    autocomplete.addListener("place_changed", () => {
      // Reset infowindow
      infowindowContent.querySelector("#add-place").style.display = "none";
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
      infowindowContent.querySelector("#add-place").style.display = "block";
      infowindowContent.children["place-name"].textContent = place.name;
      infowindowContent.children["place-address"].textContent =
        place.formatted_address;
      infowindow.open(map, marker);

      spotPos = place.geometry.location;
      spotName = place.name;
    });

    // INFO WINDOW PHASE
    let addPlaceBtn = infowindowContent.querySelector("#add-place");
    let added = infowindowContent.querySelector("#added");
    let addPlaceForm = document.querySelector(".add-place-form");
    let conformAddBtn = addPlaceForm.querySelector(".conform-add");
    let fillInStartTime = addPlaceForm.querySelector(".fill-in-start-time");
    let fillInDuration = addPlaceForm.querySelector(".fill-in-duration");

    addPlaceBtn.addEventListener("click", (event) => {
      addPlaceBtn.style.display = "none";

      // Determine if it is the first spot
      let first = places.length == 0;

      // Open the add place form
      conformAddBtn.style.display = "block";
      if (first) {
        fillInStartTime.style.display = "block";
      } else {
        fillInDuration.style.display = "block";
      }
    });

    // *******
    // ADD PHASE
    // 重要：按下加入行程之後的四個動作
    // 1. "加入行程"按鈕 -> "已加入"
    // 2. 標示新加入的景點
    // 3. 顯示上一個景點到新加入景點的路線
    // 4. 在schedule生成新景點的板塊
    // *******
    addPlaceForm.addEventListener("submit", (event) => {
      event.preventDefault();

      // Creat a new tour spot object
      let newSpot = new TourSpot(spotName, spotPos, places.length + 1);

      // Push that new object to array
      places.push(newSpot);
      console.log(places);

      // Mark the added new spot
      let newSpotMarker = new google.maps.Marker({
        map: map,
        label: places.length.toString(),
        icon: "http://maps.google.com/mapfiles/ms/icons/red.png", // 紅色標記
      });
      newSpotMarker.setPosition(newSpot.pos);

      if (places.length >= 2) {
        // Calculate and display the route from prev spot to the new added spot
        current = places[places.length - 1];
        prev = places[places.length - 2];
        calculateAndDisplayRoute(prev.pos, current.pos, "#FF0000");

        // Assign start time of new spot from the end time of previous spot
        newSpot.startTime = prev.endTime;
      }

      // Generate the time schedule on the left
      let first = places.length == 1;
      getTimeInfo(newSpot, addPlaceForm, first);
      addSchedule(newSpot, first);

      // Close the add place form
      conformAddBtn.style.display = "none";
      fillInStartTime.style.display = "none";
      fillInDuration.style.display = "none";

      // Finished
      added.style.display = "block"; // 已加入
    });
  }

  function getTimeInfo(newSpot, addPlaceForm, first) {
    // Determine the end time
    if (first) {
      // Read the start time
      let startTime = addPlaceForm.querySelector("#start-time").value;
      newSpot.startTime = startTime;
      newSpot.endTime = startTime;
      newSpot.duration = "0小時0分鐘";
    } else {
      //  Read the start time
      let startTime = newSpot.startTime;

      // Read the duration
      let durationHr = addPlaceForm.querySelector("#duration-hr");
      let durationMin = addPlaceForm.querySelector("#duration-min");

      // Transform startTime into Date object
      let startDateTime = new Date();
      let [hours, minutes] = startTime.split(":");
      startDateTime.setHours(parseInt(hours));
      startDateTime.setMinutes(parseInt(minutes));

      // Calculate endDateTime: Date object
      let endDateTime = new Date(
        startDateTime.getTime() +
          durationHr.value * 3600000 +
          durationMin.value * 60000
      );

      // Convert Date object to endTime
      let endTimeHr = endDateTime.getHours();
      let endTimeMin = endDateTime.getMinutes();
      let endTime = `${endTimeHr.toString().padStart(2, "0")}:${endTimeMin
        .toString()
        .padStart(2, "0")}`;

      // Write the endTime to new spot
      newSpot.endTime = endTime;
      newSpot.duration = `${durationHr.value}小時${durationMin.value}分鐘`;
    }
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
