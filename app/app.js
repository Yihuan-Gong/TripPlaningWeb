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

addNewPlan();
