class TourSpot {
  // Datas
  name;
  pos;
  mark;
  startTime; // {int value (mins), string text (hh:mm)}
  endTime; // {int value (mins), string text (hh:mm)}
  duration; // {int value (mins), string text (h時mm分)}
  cost;
  id; // id start from 1
  directionsService;
  schedulePlat;

  // Link
  prev;
  next;
  route;
  routeLine;
  trafficTime; // {int value (secs), string text (m 分鐘)}

  constructor(name, pos, id) {
    this.name = name;
    this.pos = pos;
    this.id = id;
    this.next = null;
    this.prev = null;
    this.directionsService = new google.maps.DirectionsService();
  }

  newMark(map) {
    this.mark = new google.maps.Marker({
      map: map,
      label: this.id.toString(),
      icon: "http://maps.google.com/mapfiles/ms/icons/red.png", // 紅色標記
    });
    this.mark.setPosition(this.pos);
  }

  removeMark() {
    if (this.mark !== undefined) {
      this.mark.setVisible(false);
    }
  }

  calRouteAndTrafficTime() {
    // If the spot is the last spot of the schedule, skip calculation
    if (this.next === null) {
      this.route = null;
      return;
    }

    let start = this;
    let end = this.next;

    return this.directionsService
      .route({
        origin: start.pos,
        destination: end.pos,
        travelMode: google.maps.TravelMode["DRIVING"],
      })
      .then((response) => {
        // 將route從response裡面讀出來
        this.route = response.routes[0].overview_path;
        this.trafficTime = response.routes[0].legs[0].duration;

        // trafficTime資料格式如下：
        // trafficTime.text = "7 分鐘"
        // trafficTime.value = 402

        console.log(response);
      })
      .catch((e) => {
        window.alert("Directions request failed");
      });
  }

  displayRoute(map) {
    if (this.route == null) {
      console.log("No route");
      return;
    }

    // 根據讀取的route，產生一個新的路徑圖
    let polyline = new google.maps.Polyline({
      path: this.route,
      geodesic: true,
      strokeColor: "#FF0000", // Red
      strokeOpacity: 0.8,
      strokeWeight: 4,
    });

    // 將剛剛產生的路徑圖加到地圖上
    polyline.setMap(map);

    this.routeLine = polyline;
  }

  undisplayRoute() {
    if (this.routeLine != undefined) {
      this.routeLine.setMap(null);
    }
  }

  updateStartTime(addPlaceForm) {
    if (this.id === 1) {
      // Get the start time from the form
      let timeText = addPlaceForm.querySelector("#start-time").value; // string
      let timeValue = this.timeTextToValue(timeText);
      this.startTime = {
        value: timeValue,
        text: timeText,
      };
      return;
    }

    // Should be this.prev.endTime + this.prev.trafficTime
    // But let's do some simpification for now
    this.startTime = this.prev.endTime;

    console.log(this.startTime);
  }

  updateDuration(addPlaceForm) {
    if (this.id === 1) {
      this.duration = {
        value: 0,
        text: "0時0分",
      };
      return;
    }

    let durationHr = addPlaceForm.querySelector("#duration-hr").value; // string
    let durationMin = addPlaceForm.querySelector("#duration-min").value; // string

    this.duration = {
      value: parseInt(durationHr) * 60 + parseInt(durationMin),
      text: `${durationHr}時${durationMin}分`,
    };

    console.log(this.duration);
  }

  updateEndTime(addPlaceForm) {
    if (this.id === 1) {
      this.endTime = this.startTime;
      return;
    }

    let endTimeValue = this.startTime.value + this.duration.value;
    let endTimeText = this.timeValueToText(endTimeValue);

    this.endTime = {
      value: endTimeValue,
      text: endTimeText,
    };

    console.log(this.endTime);
  }

  timeTextToValue(timeText) {
    let [hours, minutes] = timeText.split(":"); // string hours, string minutes
    return parseInt(hours) * 60 + parseInt(minutes);
  }

  timeValueToText(timeValue, format = "hh:mm") {
    let minutes = timeValue % 60;
    let hours = (timeValue - minutes) / 60;

    if (format === "hh:mm") {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
    } else {
      return `${hours}時${minutes}分`;
    }
  }

  addSchedulePlate() {
    // TourSpot newSpot
    let dailyScheduleIndication = document.querySelector("div.daily-schedule");
    let schedulePlate = document.createElement("div");
    schedulePlate.classList.add("time-and-tourist-spot");
    schedulePlate.classList.add(`id-${this.id}`);

    if (this.id === 1) {
      schedulePlate.classList.add("start-or-end");
      schedulePlate.innerHTML = `<img class="place" src="../icon/place2.png" alt="place-marker" />
      <div class="time">
        <p class="start-or-end-time">${this.startTime.text}</p>
        <p class="action">出發</p>
      </div>
  
      <div class="tourist-spot">
        <p class="spot">${this.name}</p>
      </div>`;
    } else {
      schedulePlate.classList.add("traveling");
      schedulePlate.innerHTML = `<img class="place" src="../icon/place2.png" alt="place-marker" />
      <div class="time">
        <p class="start-time">${this.startTime.text}</p>
        <p class="to">-</p>
        <p class="end-time">${this.endTime.text}</p>
      </div>
  
      <div class="tourist-spot">
        <p class="spot">${this.name}</p>
        <p class="stay-time">停留${this.duration.text}</p>
        <p class="cost">花費0</p>
      </div>`;
    }

    // Add remove buttom and drag buttom
    schedulePlate.innerHTML += `<div class="remove-btn">
      <i class="bi bi-trash"></i>
    </div>

    <div class="drag-btn">
      <i class="bi bi-arrows-move"></i>
    </div>`;

    dailyScheduleIndication.appendChild(schedulePlate);
    this.schedulePlat = schedulePlate;

    // Add event listener to remove and drag buttom
    // let removeBtn = schedulePlate.querySelector(".remove-btn");
    // let dragBtn = schedulePlate.querySelector(".drag-btn");
    // removeBtn.addEventListener("click", () => {
    //   this.removeSchedulePlate();
    // });
  }

  // removeSchedulePlate() {
  //   if (!this.schedulePlat) return;
  //   this.schedulePlat.remove();
  // }
}

export default TourSpot;
