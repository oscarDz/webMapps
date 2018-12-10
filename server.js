var express = require('express');
var cors = require('cors');
//var axios = require('axios');
const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyBzCG2KiGWaMgOWkP4X9uuh8cQaBfceYkM',
  Promise: Promise
});
var app = express();
var mongojs = require('mongojs');
var db = mongojs('servicio', ['lugares']);
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
var router = express.Router();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(cors());

app.post('/api/lugares', function (req, res) {
  db.lugares.insert(req.body,function(err, doc) {
    console.log("insertado",doc);
    var resp = "";
    if (err) { 
      resp =  {'status':0,'error':err}
    }else{
      resp = {'status':1,'total':doc.length}
    }
    res.json(resp);
  });
});

app.get('/api/lugares', function (req, res) {
  console.log('I received a GET request');

  db.lugares.find(function (err, docs) {
    console.log(docs);
    res.json(docs);
  });
});

app.get('/api/coord/:location', function (req, res) {
  
  console.time("consulta");
  //console.log(req.params.location);
  var location = req.params.location;
  var resp = "";
  //var location= ["centenario 119, CP 03660, Benito Juares, cmdx"];
  googleMapsClient.geocode({address: location})
  .asPromise()
  .then((response) => {
    if (response.status = 200) {
      var lat = response.json.results[0].geometry.location.lat;
      var lng = response.json.results[0].geometry.location.lng; 
      var type = response.json.results[0].geometry.location_type;
      resp = {'status':1,'lat':lat,'lng':lng,'tipo':type}
    }else{
      resp = {'status':0,'mensaje':'error al obtener coordenadas'}
    }
   // console.log("resp ",resp);

    res.json(resp);
  })
  .catch((err) => {
    console.log(err);
    resp = {'status':0,'mensaje':'error en la conexión'}
    res.json(resp);
  });
  console.timeEnd("consulta");
});


/*
app.get('/lugares', function (req, res) {
  console.log('I received a GET request');

  db.contactlist.find(function (err, docs) {
    console.log(docs);
    res.json(docs);
  });
});*/


/*
app.delete('/contactlist/:id', function (req, res) {
  var id = req.params.id;
  console.log(id);
  db.contactlist.remove({_id: mongojs.ObjectId(id)}, function (err, doc) {
    res.json(doc);
  });
});*/
/*
app.get('/contactlist/:id', function (req, res) {
  var id = req.params.id;
  console.log(id);
  db.contactlist.findOne({_id: mongojs.ObjectId(id)}, function (err, doc) {
    res.json(doc);
  });
});*/
/*
app.put('/contactlist/:id', function (req, res) {
  var id = req.params.id;
  console.log(req.body.name);
  db.contactlist.findAndModify({
    query: {_id: mongojs.ObjectId(id)},
    update: {$set: {name: req.body.name, email: req.body.email, number: req.body.number}},
    new: true}, function (err, doc) {
      res.json(doc);
    }
  );
});*/

app.listen(3000);
console.log("Server running on port 3000");