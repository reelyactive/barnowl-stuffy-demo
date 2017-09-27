/**
 * Copyright reelyActive 2017
 * We believe in an open Internet of Things
 */

const barnowl = require('barnowl');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');


const HTTP_PORT = 3000;


var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
var middleware = new barnowl();

// Express web server initialisation
app.use(express.static('web'));
server.listen(HTTP_PORT, function () {
  console.log('Browse to localhost:' + HTTP_PORT + ' for the web demo');
});

// Expect a minimal starter kit (USB)
middleware.bind( { protocol: 'serial', path: 'auto' } );

// Handle a BLE decoding
middleware.on('visibilityEvent', function(tiraid) {
  var hasData = (tiraid.identifier.hasOwnProperty('advData') &&
                 tiraid.identifier.advData.hasOwnProperty('serviceData'));

  if(hasData) {
    var serviceData = tiraid.identifier.advData.serviceData;
    var isAccelerometer = (serviceData.hasOwnProperty('minew') &&
                           (serviceData.minew.productModel === 3));

    if(isAccelerometer) {
      var id = tiraid.identifier.value;
      var data = calculatePitchAndRoll(serviceData.minew.accelerationX,
                                       serviceData.minew.accelerationY,
                                       serviceData.minew.accelerationZ);
      io.emit('acceleration', { id: tiraid.identifier.value, readings: data });
    }
  }
});


// Calculate pitch and roll from the given acceleration
function calculatePitchAndRoll(accelerationX, accelerationY, accelerationZ) {
  return {
    roll: calculateOrientationAngle(accelerationX),
    pitch: calculateOrientationAngle(accelerationY)
  };
}


// Calculate the orientation angle from the acceleration in the given axis.
function calculateOrientationAngle(acceleration) {
  return ((Math.acos(acceleration) * 2 / Math.PI) - 1);
}

