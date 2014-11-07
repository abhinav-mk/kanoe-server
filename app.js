
/**
 * Module dependencies
 */

var express = require('express'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  errorHandler = require('error-handler'),
  morgan = require('morgan'),
  routes = require('./routes'),
  api = require('./routes/api'),
  http = require('http'),
  qs = require('querystring'),
  pg = require('pg'),
  q = require('q'),
  path = require('path'),
  formidable = require('formidable'),
    util = require('util')
    fs   = require('fs-extra');
    qt   = require('quickthumb');



var app = module.exports = express();
app.use(bodyParser.urlencoded({
  extended: true
}));

/**
 * Configuration
 */

// all environments
app.use(qt.static(__dirname + '/'));
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(morgan('dev'));app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use( bodyParser.json() );
var env = process.env.NODE_ENV || 'development';
global.accessToken = 404;
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
 });
// development only
if (env === 'development') {
  app.use(express.errorHandler());
}
// production only
if (env === 'production') {
  // TODO
}
// Handling requests
app.post('/login', function(req, res){

	var auth = auth_credentials();
	auth.then(function(data){
	if(data.rows[0].username == req.body.username && data.rows[0].password == req.body.password)
		{
			global.accessToken = getAccessToken();
    		res.send({'accessToken':global.accessToken})
		}
		else res.send({'accessToken':404})
	});
});
app.post('/projects/add', function(req, res){
	if(global.accessToken == req.body.accessToken)
	{
		var addpro = addProject(req.body.title,req.body.description,req.body.participants);
		addpro.then(function(data){
			res.send('success');
		});
	}
	else res.send('failed');
});
app.post('/projects/edit', function(req, res){
	if(global.accessToken == req.body.accessToken)
	{
		var editpro = editProject(req.body.id,req.body.title,req.body.description,req.body.participants);
		editpro.then(function(data){
			res.send('success');
		});
	}
	else res.send('failed');
});
app.get('/projects/get',function(req, res){
	var getallprojects = getProjects();
	getallprojects.then(function(data){
		res.send(data.rows);
	});	
});
app.post('/projects/remove', function(req, res){
	if(global.accessToken == req.body.accessToken)
	{
		var delproject = delProjectById(req.body.id);
		delproject.then(function(data){
			res.send('success');
		});
	}
	else res.send('failed');
});
app.post('/events/add', function(req, res){
	if(global.accessToken == req.body.accessToken)
	{
		var addevent = addEvent(req.body.title,req.body.date,req.body.place,req.body.description,req.body.remarks);
		addevent.then(function(data){
			res.send('success');
		});
	}
	else res.send('failed')
});
app.post('/events/edit', function(req, res){
	if(global.accessToken == req.body.accessToken)
	{
		var editevent = editEvent(req.body.id,req.body.title,req.body.date,req.body.place,req.body.description,req.body.remarks);
		editevent.then(function(data){
			res.send('success');
		});
	}
	else res.send('failed')
});
app.get('/events/get', function(req, res){
	var getallevents = getEvents();
	getallevents.then(function(data){
		res.send(data.rows);
	});
});
app.post('/events/remove', function(req, res){
	if(global.accessToken == req.body.accessToken)
	{
		var delevent = delEventById(req.body.id);
		delevent.then(function(data){
			res.send('success')
		})
	}
	else res.send('failed');
});
app.get('/publications/get', function(req, res){
	var getallpublications = getPublications();
	getallpublications.then(function(data){
		res.send(data.rows);
	});
});
app.post('/publications/add', function(req, res){
	if(global.accessToken == req.body.accessToken)
	{
		var addpublication = addPublication(req.body.author,req.body.coauthors,req.body.area, req.body.date, req.body.description);
		addpublication.then(function(data){
			res.send('success')
		});
	}
	else res.send('failed');
});
app.post('/publications/edit', function(req, res){
	if(global.accessToken == req.body.accessToken)
	{
		var editpublication = editPublication(req.body.id,req.body.author,req.body.coauthors,req.body.area, req.body.date, req.body.description);
		editpublication.then(function(data){
			res.send('success')
		});
	}
	else res.send('failed');
});
app.post('/publications/remove', function(req, res){
	if(global.accessToken == req.body.accessToken)
	{
		var delpublications = delPublicationById(req.body.id);
		delpublications.then(function(data){
			res.send('success')
		});
	}
	else res.send('failed');
});
app.post('/people/add', function (req, res){
    var getid = getPeopleId();
    var accesstoken,name,phno,email,id;
    var temp_path;
    var img_name;
    var file_name;
    getid.then(function(data){
      id = data.rows[0].id+1;
      var form = new formidable.IncomingForm();
      form.parse(req, function(err, fields, files) {
        accesstoken = fields.accessToken;
        name = fields.name;
        phno = fields.phno;
        email = fields.email;
        temp_path = files.upload.path;
        file_name = files.upload.name;
        //res.end(util.inspect({fields: fields, files: files}));
      });
      form.on('end', function(fields, files) {
        if(global.accessToken == accesstoken)
        {
        var addpeople = addPeople(id,name,phno,email);
        addpeople.then(function(d){
        //var temp_path = this.openedFiles[0].path;
        //var file_name = this.openedFiles[0].name;
        //res.end({"temp_path":temp_path,"file_name":file_name});
        var ext = file_name.split(".");
        img_name = id+"."+ext[1];
        var new_location = 'people/';
        fs.copy(temp_path, new_location + img_name, function(err) {  
          if (err) {
            console.error(err);
          } else {
            res.send("success");
          }
        });
        });
        }
        else res.send({"at":accesstoken,"global":global.accessToken});
      });
    });   
});
/**
 * Start Server
 */
 http.createServer(app).listen(app.get('port'), function () {
   console.log('Express server listening on port ' + app.get('port'));
 });

// functions
// generate accesstoken
var getAccessToken = function() {
    return Math.floor(Math.random() * (100000000-10000000) + 1000);
}
// get the username and password
var auth_credentials = function(){
	var deferred = q.defer();
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    	client.query('SELECT * FROM authenticate', function(err, result) {
      		done();
      		if (err)
      		{	
       		 	deferred.reject(err);
       		}
      		else
       		{
       		 	deferred.resolve(result);
       		}
    	});
  	});
  	return deferred.promise;
}	
// add a new project
var addProject = function(title,desc,part){
	var deferred = q.defer();
	var getId = getProjectId();
	getId.then(function(data){
		pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    	client.query("insert into projects values("+(data.rows[0].id+1)+",'"+title+"','"+desc+"','"+part+"');", function(err, result) {
      		done();
      		if (err)
       		{
       		 	deferred.reject(err);
       		}
      		else
       		{
       		 	deferred.resolve('success');
       		}
    	});
  		});
	});
	return deferred.promise;
}
// Edit project
var editProject = function(id,title,desc,part){
	var deferred = q.defer();
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query("update projects set title='"+title+"',description='"+desc+"',participants='"+part+"' where id="+id+";", function(err, result) {
      done();
      	if (err)
       	{
       	 	deferred.reject(err);
       	}
      	else
       	{
       	 	deferred.resolve('success');
       	}
       	});
	});
	return deferred.promise;
}
// get the last project id
var getProjectId = function(){
	var deferred = q.defer();
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    	client.query('select id from projects order by id desc limit 1', function(err, result) {
      		done();
      		if (err)
       		{
       		 	deferred.reject(err);
       		}
      		else
       		{
       		 	deferred.resolve(result);
       		}
    	});
  	});
  	return deferred.promise;
}
// get all the projects
var getProjects = function(){
	var deferred = q.defer();
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    	client.query('SELECT * FROM projects', function(err, result) {
      		done();
      		if (err)
      		{	
       		 	deferred.reject(err);
       		}
      		else
       		{
       		 	deferred.resolve(result);
       		}
    	});
  	});
  	return deferred.promise;
}
// delete a project by id
var delProjectById = function(id){
	var deferred = q.defer();
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		client.query('delete from projects where id='+id+';', function(err, result){
			done();
			if(err)
			{
				deferred.reject(err);
			}
			else
			{
				deferred.resolve(result);
			}
		});
	})
	return deferred.promise;
}
// get the last event id
var getEventId = function(){
	var deferred = q.defer();
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    	client.query('select id from events order by id desc limit 1', function(err, result) {
      		done();
      		if (err)
       		{
       		 	deferred.reject(err);
       		}
      		else
       		{
       		 	deferred.resolve(result);
       		}
    	});
  	});
  	return deferred.promise;
}
// add a new event
var addEvent = function(title,date,place,description,remarks){
	var deferred = q.defer();
	var getId = getEventId();
	getId.then(function(data){
		pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    	client.query("insert into events values("+(data.rows[0].id+1)+",'"+title+"','"+date+"','"+place+"','"+description+"','"+remarks+"');", function(err, result) {
      		done();
      		if (err)
       		{
       		 	deferred.reject(err);
       		}
      		else
       		{
       		 	deferred.resolve('success');
       		}
    	});
  		});
	});
	return deferred.promise;
}
// edit events
var editEvent = function(id,title,date,place,description,remarks){
	var deferred = q.defer();
		pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    	client.query("update events set title='"+title+"',date='"+date+"',place='"+place+"',description='"+description+"',remarks='"+remarks+"' where id="+id+";", function(err, result) {
      		done();
      		if (err)
       		{
       		 	deferred.reject(err);
       		}
      		else
       		{
       		 	deferred.resolve('success');
       		}
    	});
  		});
	return deferred.promise;
}
// get all the events
var getEvents = function(){
	var deferred = q.defer();
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    	client.query('SELECT * FROM events', function(err, result) {
      		done();
      		if (err)
      		{	
       		 	deferred.reject(err);
       		}
      		else
       		{
       		 	deferred.resolve(result);
       		}
    	});
  	});
  	return deferred.promise;
}
// delete an event by id
var delEventById = function(id){
	var deferred = q.defer();
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		client.query('delete from events where id='+id+';', function(err, result){
			done();
			if(err)
			{
				deferred.reject(err);
			}
			else
			{
				deferred.resolve(result);
			}
		});
	})
	return deferred.promise;
}
// get the last publication id
var getPublicationId = function(){
	var deferred = q.defer();
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    	client.query('select id from publications order by id desc limit 1', function(err, result) {
      		done();
      		if (err)
       		{
       		 	deferred.reject(err);
       		}
      		else
       		{
       		 	deferred.resolve(result);
       		}
    	});
  	});
  	return deferred.promise;
}
// add a new publication
var addPublication = function(author,coauthors,area,date,description){
	var deferred = q.defer();
	var getId = getPublicationId();
	getId.then(function(data){
		pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    	client.query("insert into publications values("+(data.rows[0].id+1)+",'"+author+"','"+coauthors+"','"+area+"','"+date+"','"+description+"');", function(err, result) {
      		done();
      		if (err)
       		{
       		 	deferred.reject(err);
       		}
      		else
       		{
       		 	deferred.resolve('success');
       		}
    	});
  		});
	});
	return deferred.promise;
}
// edit Publications
var editPublication = function(id,author,coauthors,area,date,description){
	var deferred = q.defer();
		pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    	client.query("update publications set author='"+author+"',coauthors='"+coauthors+"',area='"+area+"',date='"+date+"',description='"+description+"' where id="+id+";", function(err, result) {
      		done();
      		if (err)
       		{
       		 	deferred.reject(err);
       		}
      		else
       		{
       		 	deferred.resolve('success');
       		}
  		});
	});
	return deferred.promise;
}
// get all the publications
var getPublications = function(){
	var deferred = q.defer();
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    	client.query('SELECT * FROM publications', function(err, result) {
      		done();
      		if (err)
      		{	
       		 	deferred.reject(err);
       		}
      		else
       		{
       		 	deferred.resolve(result);
       		}
    	});
  	});
  	return deferred.promise;
}
// delete an publications by id
var delPublicationById = function(id){
	var deferred = q.defer();
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		client.query('delete from publications where id='+id+';', function(err, result){
			done();
			if(err)
			{
				deferred.reject(err);
			}
			else
			{
				deferred.resolve(result);
			}
		});
	})
	return deferred.promise;
}
var getPeopleId = function(){
  var deferred = q.defer();
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query('select id from people order by id desc limit 1', function(err, result) {
          done();
          if (err)
          {
            deferred.reject(err);
          }
          else
          {
            deferred.resolve(result);
          }
      });
    });
    return deferred.promise;
}
var addPeople = function(id,name,phno,email){
  var deferred = q.defer();
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query("insert into people values("+id+",'"+name+"','"+phno+"','"+email+"');", function(err, result) {
          done();
          if (err)
          {
            deferred.reject(err);
          }
          else
          {
            deferred.resolve(result);
          }
      });
    });
    return deferred.promise;
}