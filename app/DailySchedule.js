import TourSpot from "./TourSpot.js";

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

export default DailySchedule;
