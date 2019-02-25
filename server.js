var express = require('express');
//origenes desconocidos
var cors = require('cors');
/*
* configuracion de api de google
*/
const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyBzCG2KiGWaMgOWkP4X9uuh8cQaBfceYkM',
  Promise: Promise
});
var app = express();
//configurar driver mongoDB
var mongojs = require('mongojs');
//BD , Colleccion
var db = mongojs('servicio', ['lugares']);
//limite en MB de json request
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
var router = express.Router();


const rateLimit = require("express-rate-limit");
app.enable("trust proxy"); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50000
});
 
// only apply to requests that begin with /api/
app.use("/api/", apiLimiter);

//contenido estatico
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(cors());

//inserta los lugares que se obtuvieron del excel
app.post('/api/lugares', function (req, res) {
  var arrLugares = [];
  for(var i=0 ;i<req.body.length;i++){
    var row = { "NOM_CORTO_PRESTATARIO": req.body[i].NOM_CORTO_PRESTATARIO,
      "NOM_LARGO_PRESTATARIO": req.body[i].NOM_LARGO_PRESTATARIO,
      DIRECCION:{
        "CALLE": req.body[i].CALLE,
        "NUM_EXT": req.body[i].NUM_EXT,
        "NOM_COLONIA": req.body[i].NOM_COLONIA,
        "CP": req.body[i].CP,
        "NOM_MUNICIPIO": req.body[i].NOM_MUNICIPIO,
        "NOM_EDO": req.body[i].NOM_EDO,
        "COORDENADAS": { "lat": req.body[i].COORDENADAS.lat, "lng": req.body[i].COORDENADAS.lng, "tipo": req.body[i].COORDENADAS.tipo }
      },
      RESPONSABLE:{
        "NOM_TRATAMIENTO_RESPONSABLE": req.body[i].NOM_TRATAMIENTO_RESPONSABLE,
        "NOMBRE_RESPONSABLE": req.body[i].NOMBRE_RESPONSABLE,
        "APATERNO_RESPONSABLE": req.body[i].APATERNO_RESPONSABLE,
        "AMATERNO_RESPONSABLE": req.body[i].AMATERNO_RESPONSABLE,
        "CARGO_RESPONSABLE": req.body[i].CARGO_RESPONSABLE
      },
      "PROGRAMA_ACADEMICO": req.body[i].PROGRAMA_ACADEMICO,
      
    };
    arrLugares.push(row);
  }
  db.lugares.insert(arrLugares,function(err, doc) {
    console.log("insertado",doc);
    var resp = "";
    if (err) { 
      resp =  {'status':0,'error':err};
    }else{
      resp = {'status':1,'total':doc.length};
    }
    res.json(resp);
  });
});

//busca todo en la DB
app.post('/api/lugaresApp', function (req, res) {
  db.lugares.find(function (err, docs) {
    console.log(docs);
    res.json(docs);
  });
});

//busqueda por Nombre largo
app.post('/api/buscaLugares', function (req, res) {
 
 var rgx = req.body.nombre
 console.log(rgx);
  db.lugares.find({"NOM_LARGO_PRESTATARIO" : {$regex :  new RegExp(rgx)}},function (err, docs) {
    console.log(docs);
    res.json(docs);
  });
});

//tipo de busqueda
app.post('/api/typesearch', function (req, res) {
 
 var rgx = req.body.nombre
 console.log(rgx);
  db.lugares.find({"NOM_LARGO_PRESTATARIO" : {$regex :  new RegExp(rgx)}},function (err, docs) {
    console.log(docs);
    res.json(docs);
  });
});

//obtiene coordenadas
app.post('/api/coord', function (req, res) {
  
  //console.time("consulta");
  console.log(req.body);
  var location = req.body.location;
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
 // console.timeEnd("consulta");
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
console.log("http://localhost:3000");