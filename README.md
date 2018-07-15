# central-server
A Node.js Restful api for central server that communicates to drones.

!!!Important note!!!: all the drones or servers from drone-api should be running in order to execute this application correctly.

Assumptions on how the central server contacts with drones to get their real time location:
This server acts as a proxy between front end and drone. Once front end ask for drone locations, server gets all drones for a client's
project. The information retrieved has UID, apiEndpoint, authKey etc of all drones.

Using this information server contact drones 1 by 1 and retrieve their location in coordinates. Once all drones have responded, server
makes a bundle out of the information and send it back to dashboard.

Server's authKey is stored in config whereas in real time it would allow only 'tokenized' requests from front end.

Server gets drone information from config but in real time it would be a DB api. to simulate fetching resouce from a 3rd party, Promises
are used at appropriate places.

Implementation:
This application creates a server to simulate a central server.

1) config.js is an important file that provides predefined information like 
a- auth Key of this server's api.
b- device details per clients' Project.
c- device's UID, endpoint, authKey

2) Server.js starts the server.

3) app.js listenes to requests and verify it. Then it simulates calling drone's API's to get their location.

***********************************************************************************************************************

To run:

1) cd into the project
2) npm install
3) npm start
4) npm test (to build but make sure to test after starting this server and all drone servers because test is dependent on 'live' api and not using a "mock" api.)
5) server can be tested as localhost:3000/getAllDevices/999 with "authorization" header should be set to 'server_key' where 999 is clients' projectID. (see config.)

To build Docker image:
1) cd into project
2) docker build -t <project>
3) docker images to see all images
4) docker run -p to run image