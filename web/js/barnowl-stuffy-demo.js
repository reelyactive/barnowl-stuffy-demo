/**
 * Copyright reelyActive 2017
 * We believe in an open Internet of Things.
 */


const ANGLE_THRESHOLD = 0.2;


angular.module('barnowl-stuffy-demo', [ 'ui.bootstrap' ])

  // Experience controller
  .controller('ExperienceCtrl', function($scope, $location) {
    var url = $location.protocol() + '://' + $location.host() + ':' +
              $location.port();
    var socket = io.connect(url);

    $scope.state = null;
    $scope.id = 'Waiting for data...';
    $scope.pitch = '-';
    $scope.roll = '-';


    socket.on('acceleration', function(data) {
      updateState(data.readings);
      $scope.id = data.id;
      $scope.pitch = data.readings.pitch.toFixed(4);
      $scope.roll = data.readings.roll.toFixed(4);
      $scope.$apply();
    });


    // Update the state based on the pitch and roll
    function updateState(data) {
      if((Math.abs(data.pitch) < ANGLE_THRESHOLD) &&
         (Math.abs(data.roll) < ANGLE_THRESHOLD)) {
        $scope.state = 'level';
      }
      else if(Math.abs(data.pitch) > Math.abs(data.roll)) {
        if(data.pitch > 0) {
          $scope.state = 'pitchdown';
        }
        else {
          $scope.state = 'pitchup';
        }
      }
      else {
        if(data.roll > 0) {
          $scope.state = 'rollright';
        }
        else {
          $scope.state = 'rollleft';
        }
      }
    }

  });
