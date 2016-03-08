// var router = require('express').Router();
// var aglio = require('aglio');
// var pollRouter = require('../routes/polls');
// var path = require('path');
// var ison = require('../json_api/json_api');
// router.get('/', function(req, res) {
//   res.send('Welcome to Eats-API. Visit /docs for our documentation');
// });
//
// router.use('/polls', pollRouter);
//
// //TODO: Fix routers for everything below this comment.
//
// //Fake endpoint
// router.get('/users', function(req, res) {
//   res.json({
//     name: 'Musse',
//     age: 30
//   });
// });
//
// //----------------------------------------
// router.get('/a', function(req, res) {
//
//   // var main = {
//   //   type: 'poll',
//   //   resource: 'poll',
//   //   data: {
//   //     id: '123123',
//   //     name: 'Ömröstningens namn'
//   //   }
//   // };
//   // jso.setMain(main);
//   // var voteRelation = {
//   //   data: {
//   //     id: 13435343,
//   //     created: '123-123-2-3',
//   //     updated: '123-123-12-323'
//   //   },
//   //   relation: 'votes',
//   //   multiple: true,
//   //   type: 'vote',
//   //   resource: 'votes',
//   //   relationships: [{
//   //     data: {
//   //       id: 123123,
//   //       name: 'användare som lagt röst'
//   //     },
//   //     relation: 'voter',
//   //     multiple: false,
//   //     type: 'user',
//   //     resource: 'users',
//   //   }]
//   // };
//   // var voteRelation2 = {
//   //   data: {
//   //     id: 13,
//   //     created: '123-123-2-3',
//   //     updated: '123-123-12-323'
//   //   },
//   //   relation: 'votes',
//   //   multiple: true,
//   //   type: 'vote',
//   //   resource: 'votes',
//   //   relationships: [{
//   //     data: {
//   //       id: 12,
//   //       name: 'användare som också lagt röst'
//   //     },
//   //     relation: 'voter',
//   //     multiple: false,
//   //     type: 'user',
//   //     resource: 'users',
//   //   }]
//   // };
//   // var voteRelation3 = {
//   //   data: {
//   //     id: 13,
//   //     created: '123-123-2-3',
//   //     updated: '123-123-12-323'
//   //   },
//   //   relation: 'votes',
//   //   multiple: true,
//   //   type: 'vote',
//   //   resource: 'votes',
//   //   relationships: [{
//   //     data: {
//   //       id: 12,
//   //       name: 'användare som också lagt röst'
//   //     },
//   //     relation: 'voter',
//   //     multiple: false,
//   //     type: 'user',
//   //     resource: 'users',
//   //   }]
//   // };
//
//   var main = {
//     type: 'poll',
//     resource: 'poll',
//     data: {
//       id: '1',
//       name: 'Odd Hill, team 2',
//       expires: '2016-02-23T22:49:05Z',
//       created: '2016-02-01T15:20:05Z',
//       allow_new_restaurants: false
//     }
//   };
//   var jso = new ison(main);
//   var creatorRelation = {
//     data: {
//       id: '2',
//       name: 'Per Persson',
//       photo: 'https://imgur.com/erqwfdsco92.jpg',
//       anonymous: false
//     },
//     relation: 'creator',
//     multiple: false,
//     type: 'user',
//     resource: 'users'
//   };
//   var restaurantRelation1 = {
//     data: {
//       id: '10',
//       name: 'Din Restaurang',
//       latitude: 56.1234,
//       longitude: 14.1234,
//       temporary: false
//     },
//     relation: 'restaurants',
//     multiple: true,
//     type: 'restaurant',
//     resource: 'restaurants',
//   };
//   var restaurantRelation2 = {
//     data: {
//       id: '11',
//       name: 'Vår Restaurang',
//       latitude: 56.1234,
//       longitude: 14.1234,
//       temporary: false
//     },
//     relation: 'restaurants',
//     multiple: true,
//     type: 'restaurant',
//     resource: 'restaurants',
//   };
//   var userRelation1 = {
//     data: {
//       id: '4',
//       name: 'Lukas Lukasson',
//       photo: 'https://imgur.com/erqwfdsco92.jpg',
//       anonymous: false
//
//     },
//     relation: 'users',
//     multiple: true,
//     type: 'user',
//     resource: 'users',
//   };
//   var userRelation2 = {
//     data: {
//       id: '5',
//       name: 'Mats Matsson',
//       photo: 'https://imgur.com/erqwfdsco92.jpg',
//       anonymous: true
//
//     },
//     relation: 'users',
//     multiple: true,
//     type: 'user',
//     resource: 'users',
//   };
//   var userRelation3 = {
//     data: {
//       id: '3',
//       name: 'Per Persson',
//       photo: 'https://imgur.com/erqwfdsco92.jpg',
//       anonymous: false
//     },
//     relation: 'users',
//     multiple: true,
//     type: 'user',
//     resource: 'users'
//   };
//   var groupRelation = {
//     data: {
//       id: '111',
//       name: 'Odd hill',
//     },
//     relation: 'group',
//     multiple: false,
//     type: 'group',
//     resource: 'groups'
//   };
//   var voteRelation = {
//     data: {
//       id: '20',
//       created: '123-12-31-23123',
//       updated: '123-12-31-23123',
//     },
//     relation: 'votes',
//     multiple: true,
//     type: 'vote',
//     resource: 'votes',
//     relationships: [{
//       data: {
//         id: '3',
//       },
//       relation: 'user',
//       multiple: false,
//       type: 'user',
//       resource: 'users',
//     }, {
//       data: {
//         id: '7',
//       },
//       relation: 'restaurant',
//       multiple: false,
//       type: 'restaurant',
//       resource: 'restaurants',
//     }, {
//       data: {
//         id: '1',
//       },
//       relation: 'poll',
//       multiple: false,
//       type: 'poll',
//       resource: 'polls',
//     }]
//   };
//   var voteRelation2 = {
//     data: {
//       id: '20',
//       created: '123-12-31-23123',
//       updated: '123-12-31-23123',
//     },
//     relation: 'votes',
//     multiple: true,
//     type: 'vote',
//     resource: 'votes',
//     relationships: [{
//       data: {
//         id: '3',
//       },
//       relation: 'user',
//       multiple: false,
//       type: 'user',
//       resource: 'users',
//     }, {
//       data: {
//         id: '5',
//       },
//       relation: 'restaurant',
//       multiple: false,
//       type: 'restaurant',
//       resource: 'restaurants',
//     }, {
//       data: {
//         id: '1',
//       },
//       relation: 'poll',
//       multiple: false,
//       type: 'poll',
//       resource: 'polls',
//     }]
//   };
//
//   jso.addRelation(creatorRelation);
//   jso.addRelation(restaurantRelation1);
//   jso.addRelation(restaurantRelation2);
//   jso.addRelation(userRelation1);
//   jso.addRelation(userRelation2);
//   jso.addRelation(userRelation3);
//   jso.addRelation(groupRelation);
//   jso.addRelation(voteRelation);
//   res.send(jso);
//   // res.send('<p>Du gick till rooten i API:et och här är env-variabeln MONGO_DB_USER i .env: ' +
//   //   process.env.MONGO_DB_USER + '</p>');
// });
//
// router.get('/docs', function(req, res) {
//   var options = {
//     themeTemplate: path.join(__dirname, '../../public/aglio-theme-olio/templates/', 'index.jade'),
//     locals: {
//       myVariable: 125
//     }
//   };
//
//   aglio.renderFile('./public/docs/README.apib', './public/docs/documentation.html', options,
//     function(err, warnings) {
//       if (err) {
//         return console.log(err);
//       }
//       if (warnings) {
//         //console.log(warnings);
//       }
//       console.log(__dirname);
//       res.sendFile(path.join(__dirname, '../../public/docs', 'documentation.html'));
//     });
// });
//
//
// router.get('/goaldocs', function(req, res) {
//   var options = {
//     themeTemplate: path.join(__dirname, '../../public/aglio-theme-olio/templates/', 'index.jade'),
//     themeVariables: 'default',
//     locals: {
//       myVariable: 125
//     }
//   };
//
//   aglio.renderFile('./public/docs/GOALS.apib', './public/docs/goaldocs.html', options,
//     function(err, warnings) {
//       if (err) {
//         return console.log(err);
//       }
//       if (warnings) {
//         //console.log(warnings);
//       }
//       res.sendFile(path.join(__dirname, '../../public/docs', 'goaldocs.html'));
//     });
// });
//
//
// module.exports = router;
