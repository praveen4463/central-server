/* eslint-env mocha */
//const Console = console;
const assert = require("chai").assert;
const request = require("supertest");
const config = require("../config");
const restApiEndpoint = `http://localhost:${config.apiPort}`;

describe("Central Server API tests:", () => {
	it("Should return 401 without authorization header", (done) => {
		request(restApiEndpoint)
			.get("/getAllDevices/1332")
			.expect(401, done);
	});

	it("Should return 401 with wrong authorization key", (done) => {
		request(restApiEndpoint)
			.get("/getAllDevices/1332")
			.set("authorization", "LPJ3324")
			.expect(401, done);
	});

	it("Should return 200 with authorization header and parameter", (done) => {
		request(restApiEndpoint)
			.get("/getAllDevices/1332")
			.set("authorization", `${config.apiKey}`)
			.expect("content-type", /json/)
			.expect(200, done);
	});

	it("Should return 404 without parameter", (done) => {
		request(restApiEndpoint)
			.get("/getAllDevices")
			.set("authorization", `${config.apiKey}`)
			.expect(404, done);
	});

	it("Should return error with invalid parameter", () => {
		return request(restApiEndpoint)
			.get("/getAllDevices/33211")
			.set("authorization", `${config.apiKey}`)
			.expect("content-type", /json/)
			.expect(200)
			.then(res => {
				assert.isAbove(res.body.error.length, 0);
			});
	});

	it("Should return all available devices with correct parameter", () => {
		const clientProjectID = 999;
		return request(restApiEndpoint)
			.get(`/getAllDevices/${clientProjectID}`)
			.set("authorization", `${config.apiKey}`)
			.expect("content-type", /json/)
			.expect(200)
			.then(res => {
				assert.equal(res.body.devices.length, config.devices.filter(device => device.clientProjectID === clientProjectID).length);
			});
	});
});