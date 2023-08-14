import TourSpot from "./TourSpot.js";
import DailySchedule from "./DailySchedule.js";

addNewPlan();
window.initMap = initMap;

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

function initMap() {
  // *********************
  // INITIALIZATION PHASE
  // *********************
  const MAP_CENTER = { lat: 25.046, lng: 121.517 };
  const DEFAULT_ZOOM = 13;

  // 初始化地圖
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: DEFAULT_ZOOM,
    center: MAP_CENTER,
    disableDefaultUI: true,
  });

  // 初始化search box
  const input = document.getElementById("pac-input");
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // 初始化autocomplete: 自動填入和搜尋功能
  const autocomplete = new google.maps.places.Autocomplete(input, {
    // place detail basic ($17/1000 request)
    fields: ["formatted_address", "geometry", "name"],

    // strictBounds:
    // False:可搜尋地圖視窗顯示外的地點
    // True: 不可搜尋
    strictBounds: false,

    types: ["establishment"],
  });

  // 初始化裝入所有行程景點的容器
  let dailySchedule = new DailySchedule();

  /*************************************************
   * SEARCH PHASE

   * SEARCH PHASE的部分程式碼來自於 Google LLC 的部分原始碼，根據 Apache-2.0 授權
   * Copyright 2019 Google LLC. All Rights Reserved.
   * SPDX-License-Identifier: Apache-2.0
   * ****************************************************/
  let infowindowContent = document.querySelector("#infowindow-content");
  const infowindow = new google.maps.InfoWindow();
  infowindow.setContent(infowindowContent);
  const marker = new google.maps.Marker({
    map,
    anchorPoint: new google.maps.Point(0, -29),
  });
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

  // *****************
  // INFO WINDOW PHASE
  // *****************
  let addPlaceBtn = infowindowContent.querySelector("#add-place");
  let added = infowindowContent.querySelector("#added");
  let addPlaceForm = document.querySelector(".add-place-form");
  let conformAddBtn = addPlaceForm.querySelector(".conform-add");
  let fillInStartTime = addPlaceForm.querySelector(".fill-in-start-time");
  let fillInDuration = addPlaceForm.querySelector(".fill-in-duration");

  addPlaceBtn.addEventListener("click", (event) => {
    addPlaceBtn.style.display = "none";

    // Determine if it is the first spot
    let first = dailySchedule.length == 0;

    // Open the add place form
    conformAddBtn.style.display = "block";
    if (first) {
      fillInStartTime.style.display = "block";
    } else {
      fillInDuration.style.display = "block";
    }
  });

  // *****************************
  // ADD PHASE
  // *****************************
  addPlaceForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Add a new spot
    dailySchedule.append(spotName, spotPos);

    // Disaplay the newly add spot
    dailySchedule.tail.newMark(map);

    if (dailySchedule.length >= 2) {
      // Calculate the route
      await dailySchedule.tail.prev.calRouteAndTrafficTime();

      // Display the route
      dailySchedule.tail.prev.displayRoute(map);
    }

    // Generate the time schedule on the left
    dailySchedule.tail.updateStartTime(addPlaceForm);
    dailySchedule.tail.updateDuration(addPlaceForm);
    dailySchedule.tail.updateEndTime(addPlaceForm);
    dailySchedule.tail.addSchedulePlate();

    // Close the add place form
    conformAddBtn.style.display = "none";
    fillInStartTime.style.display = "none";
    fillInDuration.style.display = "none";

    // Finished
    added.style.display = "block"; // 已加入
  });
}
