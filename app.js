const express = require("express");
const app = express();
const config = require("./config");
const NodeCache = require("node-cache");
const memCached = new NodeCache({stdTTL: 100, checkperiod: 120});
const request = require("superagent");
const cacheKeyTemplate = "#clientProjectID#_cache";

app.get("/getAllDevices/:projID", (req, res) => {
	const incomingAuthKey = req.get("authorization");
	if(!incomingAuthKey || config.apiKey !== incomingAuthKey) {
		return res.status(401).send({"error": "Auth key invalid or not found."});
	}

	getDeviceDetails(req.params.projID)
		.then(_deviceDetails => {
			if(!_deviceDetails) {
				return res.status(200).send({"error": "no device found"});
			}
			res.status(200).send(_deviceDetails);
		})
		.catch(_err => {
			res.status(500).send({"error": _err});
		});
});

//In real time, all devices in a clients' project will be fetched and then devices will be contacted. config.js will act as DB store for now.
//and in-memory cache will act as memCached.
function getDeviceDetails(clientProjectID) {
	//using Promise to simulate a DB's API or cache call.
	const callCacheOrDBApiAndGetDevices = (cacheKey) => {
		memCached.get(cacheKey, (err, devices) => {
			if(!err && devices && devices.length) {
				return Promise.resolve(devices);
			}
		});
		let devices = config.devices.filter(device => device.clientProjectID === Number(clientProjectID));
		if(devices && devices.length) {
			memCached.set(cacheKey, devices);
		}
		return Promise.resolve(devices);
	};

	//***************************************************************

	const cacheKey = cacheKeyTemplate.replace("#clientProjectID#", clientProjectID);
	return new Promise((resolve, reject) => {
		callCacheOrDBApiAndGetDevices(cacheKey)
			.then(_devices => {
				if(!_devices || !_devices.length) {
					resolve(null);
				}
				let devicesDetail = [];
				_devices.forEach(device => {
					let currentDevice = {};
					currentDevice.deviceUID = device.deviceUID;
					currentDevice.found = true;
					currentDevice.error = null;
					
					request
						.get(`${device.deviceApiEndpoint}/coordinates`)
						.set("authorization", device.deviceAuthKey)
						.set("accept", "json")
						.end((_error, _res) => {
							if(_error) {
								currentDevice.found = false;
								currentDevice.error = _error;
							} else {
								if(_res.body.error) {
									currentDevice.found = false;
									currentDevice.error = _res.body.error;
								} else {
									currentDevice.coordinates = `${_res.body.latitude},${_res.body.longitude}`;	
								}
							}
							devicesDetail.push(currentDevice);
							if(_devices.length === devicesDetail.length) {
								resolve(devicesDetail);	
							}
						});
				});
			})
			.catch(_err => {
				reject(_err);
			});
	});
}

module.exports = app;