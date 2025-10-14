let port; // Serial Communication port
let connectBtn;

let sensorVal, circleSize,circleOpacity;

function setup() {
  createCanvas(windowWidth, windowHeight);
  port = createSerial(); // creates the Serial Port

  // Connection helpers
  connectBtn = createButton("Connect to Arduino");
  connectBtn.position(20, 20);
  connectBtn.mousePressed(connectBtnClick);
}

function draw() {
  background(0);

  fill(255,0,0,circleOpacity);
  stroke(255, 255, 255);
  strokeWeight(100);
  ellipse(width / 2, height / 2, circleSize);
  

  // Receive data from Arduino
  if (port.opened()) {
    sensorVal = port.readUntil("\n");
    // Only log data that has information, not empty signals
    if (sensorVal[0]) {
      console.log(sensorVal);
      // Update circle's size with sensor's data
      // Reduce delay() value in Ardiuno to get smoother changes
      circleSize = map(sensorVal, 0, 1023, 10, 1000); // example size range
      circleOpacity = map(sensorVal, 0, 1023, 0, 255); // opacity range 0–255

    }
  }
}

// DO NOT REMOVE THIS FUNCTION
function connectBtnClick(e) {
  // If port is not already open, open on click,
  // otherwise close the port
  if (!port.opened()) {
    port.open(9600); // opens port with Baud Rate of 9600
    e.target.innerHTML = "Disconnect Arduino";
    e.target.classList.add("connected");
  } else {
    port.close();
    e.target.innerHTML = "Connect to Arduino";
    e.target.classList.remove("connected");
  }
}
