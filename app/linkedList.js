class TourSpot {
  // Datas
  name;
  pos;
  mark;
  startTime;
  endTime;
  duration;
  cost;
  id; // id start from 1
  directionsService;

  // Link
  prev;
  next;
  route;
  routeLine;
  trafficTime;

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
        // return [this.route, this.trafficTime];
      })
      .catch((e) => {
        window.alert("Directions request failed");
        // return [null, null];
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

  getStartTime() {
    // Should be this.prev.endTime + this.prev.trafficTime
    // But let's do some simpification for now
    this.startTime = this.prev.endTime;
  }
}

class DailySchedule {
  head;
  tail;
  length;

  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  isEmpty() {
    return this.length === 0;
  }

  getNode(index) {
    // Return the pointer of the node at the specific index
    if (index > this.length) {
      return null;
    } else {
      let current = this.head;
      for (let i = 1; i < index; i++) {
        current = current.next;
      }
      return current;
    }
  }

  append(name, pos) {
    /*  ***********************************
      INPUT:
      string name: Name of the new tourist spot
      googleMapPositionObj pos: Position of the new tourist spot

      FUNCTIONS:
      Append a new tourist spot at the end of the schedule.
      ***********************************************/

    let newSpot = new TourSpot(name, pos, this.length + 1);
    if (this.isEmpty()) {
      this.head = newSpot;
      this.tail = newSpot;
    } else {
      // Update the tail pointer
      this.tail.next = newSpot;
      newSpot.prev = this.tail;
      this.tail = newSpot;
    }
    this.length += 1;
  }

  pop() {
    if (!this.head) return undefined;

    let current = this.tail;
    if (this.length === 1) {
      this.head = null;
      this.tail = null;
    } else {
      this.tail = current.prev;
      this.tail.next = null;
      current.prev = null;
    }
    this.length -= 1;
  }

  remove(index) {
    /*  ***********************************
      INPUT:
      int index: Index of the spot you want to remove.

      FUNCTIONS:
      Remove the spot (including the marker) at the index you specified.
      ***********************************************/

    if (index > this.length || index < 1) return undefined;

    let current = this.getNode(index);

    // Remove the mark
    current.mark.removeMark();

    if (current === this.head) {
      // Remove the head node
      this.head = this.head.next;
      this.head.prev = null;
      current.next = null;
    } else {
      current.prev.next = current.next;
      current.next.prev = current.prev;
      current.next = null;
      current.prev = null;
    }
    this.length -= 1;
  }
}

export { TourSpot, DailySchedule };
