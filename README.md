# eats-api
This product is a part of the student project (Eats) at Malmö Högskola consisting of 10 students (software engineers and information architects). The goal of Eats project is a prototype web service that allows users to vote for a restaurant for today's lunch or dinner. This will make easier to find a place for lunch in a group and brings extra variety to every day office life.
This an Express/SocketIO-application that functions as a backend API for the [Eats client] (https://github.com/ChooseMeetDine/eats-client) (web app).

### How to start
Clone the repo to your web server folder and make sure you have installed npm on your computer.

Open a terminal window and run:
```
npm install
```
To start a Node server, run:
```
npm start
```
### API Reference

Documentation for API references can be found [here] (http://128.199.48.244:7000/).
If link is broken run the command:
```
npm start
```
and go to the page in your localhost:
```
http://localhost:[yourporthere]/
```

### API Features

The list of implemented functions of the current version can be found [here] (https://github.com/ChooseMeetDine/eats-api/blob/master/CHANGELOG.md) (CHANGELOG.md).

### Tests
The API includes unit test and system tests for end-points which are already implemented or planned to be implemented.

To start test for MacOS please run:
```
npm run test
```
To start test for Windows please run:
```
npm run testw
```

The test data will be set in DB during test running and then cleaned up.
To change testing data update files in folder [testenv] (https://github.com/ChooseMeetDine/eats-api/tree/master/testenv).

### License

All rights to the product belongs to OddHill (Web Design Agency, Malmö) and CMD project group (Malmö Högskola).
