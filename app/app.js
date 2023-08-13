import { TourSpot, DailySchedule } from "./linkedList.js";

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

function addSchedule(newSpot) {
  // TourSpot newSpot
  let dailyScheduleIndication = document.querySelector("div.daily-schedule");
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

  dailyScheduleIndication.appendChild(timeAndSpot);
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

  // 初始化裝入所有行程景點的容器
  let dailySchedule = new DailySchedule();

  // 主程式：搜尋景點與加入景點功能
  searchAndAddPlace();

  function searchAndAddPlace() {
    // INITIALIZATION
    let infowindowContent = document.querySelector("#infowindow-content");
    const infowindow = new google.maps.InfoWindow();
    infowindow.setContent(infowindowContent);

    const marker = new google.maps.Marker({
      map,
      anchorPoint: new google.maps.Point(0, -29),
    });

    // SEARCH PHASE
    /*
     * SEARCH PHASE的部分程式碼來自於 Google LLC 的部分原始碼，根據 Apache-2.0 授權
     * Copyright 2019 Google LLC. All Rights Reserved.
     * SPDX-License-Identifier: Apache-2.0
     */

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
      let first = dailySchedule.length == 0;

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
    addPlaceForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      // Add a new spot and display it
      dailySchedule.append(spotName, spotPos);
      dailySchedule.tail.newMark(map);

      if (dailySchedule.length >= 2) {
        let prev = dailySchedule.tail.prev;

        // Calculate the route
        await prev.calRouteAndTrafficTime();

        // Display the route
        prev.displayRoute(map);
      }

      // Generate the time schedule on the left
      let first = dailySchedule.length == 1;
      getTimeInfo(dailySchedule.tail, addPlaceForm, first);
      addSchedule(dailySchedule.tail, first);

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

      console.log(newSpot.startTime);
    } else {
      // Calculate the start time
      newSpot.getStartTime();

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
}
