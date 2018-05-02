var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://broker.mqttdashboard.com');
var User    = require('mongoose').model('User');
var Beacon    = require('mongoose').model('Beacon');
var {ObjectID} = require('mongodb');

client.on('connect', function () {
  console.log('successfully connected to the broker!');
  client.subscribe("/users/#");
});

client.on('message', function (topic, message) {
  // message is Buffer
  let id = new ObjectID(topic.toString().substr(7, 24));
  const t = message.toString();
  Beacon.findOne({topic: t}).then((beacon) => {
    const {uuid} = beacon;
    User.findOne({_id: id}).then(
      (user) => {
        user.favorieTopics.push(uuid);
        user.save().then(
          () => console.log('succeeeeeed!!')
        )
      }
    )
  });

  console.log("id", id);
  console.log('topic', t)
});





//  // Packest from the Estimote family (Telemetry, Connectivity, etc.) are
//  // broadcast as Service Data (per "§ 1.11. The Service Data - 16 bit UUID" from
//  // the BLE spec), with the Service UUID 'fe9a'.
//  var ESTIMOTE_SERVICE_UUID = 'fe9a';
//  var currentlocationID = "";
//  // Once you obtain the "Estimote" Service Data, here's how to check if it's
//  // a Telemetry packet, and if so, how to parse it.
//  function parseEstimoteTelemetryPacket(data) { // data is a 0-indexed byte array/buffer
      
//      // byte 0, lower 4 bits => frame type, for Telemetry it's always 2 (i.e., 0b0010)
//      var frameType = data.readUInt8(0) & 0b00001111;
//      var ESTIMOTE_FRAME_TYPE_TELEMETRY = 2;
//      if (frameType != ESTIMOTE_FRAME_TYPE_TELEMETRY) {
//          return;
//      }

//      // byte 0, upper 4 bits => Telemetry protocol version ("0", "1", "2", etc.)
//      var protocolVersion = (data.readUInt8(0) & 0b11110000) >> 4;
//      // this parser only understands version up to 2
//      // (but at the time of this commit, there's no 3 or higher anyway :wink:)
//      if (protocolVersion > 2) {
//          return;
//      }

//      // bytes 1, 2, 3, 4, 5, 6, 7, 8 => first half of the identifier of the beacon
//      var shortIdentifier = data.toString('hex', 1, 9);

//      // byte 9, lower 2 bits => Telemetry subframe type
//      // to fit all the telemetry data, we currently use two packets, "A" (i.e., "0")
//      // and "B" (i.e., "1")
//      var subFrameType = data.readUInt8(9) & 0b00000011;

//      var ESTIMOTE_TELEMETRY_SUBFRAME_A = 0;
//      var ESTIMOTE_TELEMETRY_SUBFRAME_B = 1;

//      // ****************
//      // * SUBFRAME "A" *
//      // ****************
//      if (subFrameType == ESTIMOTE_TELEMETRY_SUBFRAME_A) {


//          var errors;
//          if (protocolVersion == 2) {
//              // in protocol version "2"
//              // byte 15, bits 2 & 3
//              // bit 2 => firmware error
//              // bit 3 => clock error (likely, in beacons without Real-Time Clock, e.g.,
//              //                      Proximity Beacons, the internal clock is out of sync)
//              errors = {
//                  hasFirmwareError: ((data.readUInt8(15) & 0b00000100) >> 2) == 1,
//                  hasClockError: ((data.readUInt8(15) & 0b00001000) >> 3) == 1
//              };
//          } else if (protocolVersion == 1) {
//              // in protocol version "1"
//              // byte 16, lower 2 bits
//              // bit 0 => firmware error
//              // bit 1 => clock error
//              errors = {
//                  hasFirmwareError: (data.readUInt8(16) & 0b00000001) == 1,
//                  hasClockError: ((data.readUInt8(16) & 0b00000010) >> 1) == 1
//              };
//          } else if (protocolVersion == 0) {
//              // in protocol version "0", error codes are in subframe "B" instead
//          }

//          // ***** ATMOSPHERIC PRESSURE


//          return {
//              shortIdentifier,
//              frameType: 'Estimote Telemetry',
//              subFrameType: 'A',
//              protocolVersion,
//              errors
//          };

//          // ****************
//          // * SUBFRAME "B" *
//          // ****************
//      } else if (subFrameType == ESTIMOTE_TELEMETRY_SUBFRAME_B) {


//          var batteryVoltage =
//              (data.readUInt8(18) << 6) |
//              ((data.readUInt8(17) & 0b11111100) >> 2);
//          if (batteryVoltage == 0b11111111111111) {
//              batteryVoltage = undefined;
//          }

//          // ***** ERROR CODES
//          // byte 19, lower 2 bits
//          // see subframe A documentation of the error codes
//          // starting in protocol version 1, error codes were moved to subframe A,
//          // thus, you will only find them in subframe B in Telemetry protocol ver 0
//          var errors;
//          if (protocolVersion == 0) {
//              errors = {
//                  hasFirmwareError: (data.readUInt8(19) & 0b00000001) == 1,
//                  hasClockError: ((data.readUInt8(19) & 0b00000010) >> 1) == 1
//              };
//          }

//          // ***** BATTERY LEVEL
//          // byte 19 => battery level, between 0% and 100%
//          // if all bits are set to 1, it means it hasn't been measured yet
//          // added in protocol version 1
//          var batteryLevel;
//          if (protocolVersion >= 1) {
//              batteryLevel = data.readUInt8(19);
//              if (batteryLevel == 0b11111111) {
//                  batteryLevel = undefined;
//              }
//          }

//          return {
//              shortIdentifier,
//              frameType: 'Estimote Telemetry',
//              subFrameType: 'B',
//              protocolVersion,
//              batteryVoltage,
//              batteryLevel,
//              errors
//          };
//      }
//  }

//  // example how to scan & parse Estimote Telemetry packets with noble

//  var noble = require('noble'); //the function of noble is to discover bluetooth devices 

//  noble.on('stateChange', function(state) {


//      console.log('state has changed', state);
//      if (state == 'poweredOn') {
//          var serviceUUIDs = [ESTIMOTE_SERVICE_UUID]; // Estimote Service
//          var allowDuplicates = false;
//          noble.startScanning(serviceUUIDs, allowDuplicates, function(error) { //noble starts scanning for bluetooth devices 
//              if (error) {
//                  console.log('error starting scanning', error);
//              } else {
//                  console.log('started scanning');
//              }
//          });
//      }




//  });

//  noble.on('discover', function(peripheral) { //on discovering device, this function is exectued
//      var data = peripheral.advertisement.serviceData.find(function(el) {

//          return el.uuid == ESTIMOTE_SERVICE_UUID;

//      }).data; //noble retrieved the data contained in device 
     
//      var telemetryPacket = parseEstimoteTelemetryPacket(data); //the data is parsed here to determine if device is a beacon 
//      if (telemetryPacket) { //if it is a telemetry packet, we search the ids of the three beacons used in our projects 
//          if ((telemetryPacket.shortIdentifier == "2a2b6970f193188c") || (telemetryPacket.shortIdentifier == "8d24a5cdb702ff90") || (telemetryPacket.shortIdentifier == "7587d73366199923")) {
//              currentlocationID = telemetryPacket.shortIdentifier; //if the user is close to any one of the beacons, the location is will be update
//              telemetryPacket.rssi = peripheral.rssi 
//              client.publish('my/topic',  JSON.stringify(telemetryPacket));
//             console.log('hey')
//          }


//      }
//  });
