// Include the Express module
var express = require('express');
var path = require("path");
var http = require("http");
var bodyParser = require('body-parser');
var fs = require('fs');

//multipart
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var mysql = require('mysql');

// Create an instance of Express
var app = express();

app.set('port',process.env.PORT||3000);
app.set('views',__dirname+'/views');
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'web')));
app.use(bodyParser({limit: '50mb'}));
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var userData;

var conn = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'sqc901229',
    database:'test',
    port: 3306
});
conn.connect();

app.get('/',function(req,res){
	res.send("Hello Main Page");
});

//get employee list
app.get('/employee',function(req,res){
	var getQuery = "SELECT e.*, (case when e.managerid is null then '' " +
	" else (select CONCAT(m.fname,' ',m.lname) from test.employee m where m.id = e.managerid) end ) as managername, " +
	"(select count(id) from test.employee r where e.id = r.managerid) as report " +
	" FROM test.employee e ";
	conn.query(getQuery, function(err, rows) {
		if (err) console.log(err);
		res.send(rows);
	});
});

app.delete('/employee/:id',function(req,res){
	var deleteid = req.params.id;
	var deleteQuery = "delete from test.employee where id =" + deleteid;
	conn.query(deleteQuery, function(err, rows) {
		if (err) console.log(err);
		res.send('delete id:'+ deleteid + ' success!');
	});
});

// get employee by id
app.get('/employee/:id',function(req,res){
	var id = req.param('id');
	var getQuery = "SELECT e.*, (case when e.managerid is null then '' " +
	" else (select CONCAT(m.fname,' ',m.lname) from test.employee m where m.id = e.managerid) end ) as managername, " +
	"(select count(id) from test.employee r where e.id = r.managerid) as report " +
	" FROM test.employee e where e.id = " + id;
	conn.query(getQuery, function(err, rows) {
		if (err) console.log(err);
		res.send(rows);
	});
});

// manager get report from
app.get('/getReport/:id',function(req,res){
	var id = req.param('id');
	var getQuery = "SELECT e.*, (case when e.managerid is null then '' " +
	" else (select CONCAT(m.fname,' ',m.lname) from test.employee m where m.id = e.managerid) end ) as managername, " +
	"(select count(id) from test.employee r where e.id = r.managerid) as report " +
	" FROM test.employee e where e.managerid = " + id;
	conn.query(getQuery, function(err, rows) {
		if (err) console.log(err);
		res.send(rows);
	});
});

// add new employee
app.post('/employee', function(req,res){
	var imgpath = 'images/id'+req.body.id+'.jpg';
	var insertQuery = " INSERT INTO test.employee (id, fname,lname,age,sex,phone,email,department, title, managerid, imgpath) " +
						"VALUES ('" + req.body.id + "', '" + req.body.fname + "', '" + req.body.lname + "', " + req.body.age + ", '" + req.body.sex + "', '" + req.body.phone + "', '" + req.body.email + 
						"', '" + req.body.department + "', '" + req.body.title + "' , '" + req.body.managerid + "', '" + imgpath + "') ";
	conn.query(insertQuery, function(err, rows) {
		if (err) console.log(err);
		res.send('Create new User success!');
	});
});

// add new employee with image
app.post('/createwithimg', multipartMiddleware, function(req,res){
//	console.log(req.body);
//	console.log(req.files);
	var image =  req.files.file;
    var newImageLocation = path.join(__dirname, 'web/images', 'id'+req.body.id+'.jpg');
    console.log(newImageLocation);
    fs.readFile(image.path, function(err, data) {
        fs.writeFile(newImageLocation, data);
    });
	var imgpath = 'images/id'+req.body.id+'.jpg';
	var insertQuery = " INSERT INTO test.employee (id, fname,lname,age,sex,phone,email,department, title, managerid, imgpath) " +
						"VALUES ('" + req.body.id + "', '" + req.body.fname + "', '" + req.body.lname + "', " + req.body.age + ", '" + req.body.sex + "', '" + req.body.phone + "', '" + req.body.email + 
						"', '" + req.body.department + "', '" + req.body.title + "' , '" + req.body.managerid + "', '" + imgpath + "') ";
	conn.query(insertQuery, function(err, rows) {
		if (err) console.log(err);
		res.send('Create new User success!');
	});
});

//update user
app.put('/employee/:id', function(req, res){
	var id = req.param('id');
	var updateQuery = " Update test.employee set fname = '"+ req.body.fname +"', lname = '"+ req.body.lname +"', age = '"+ req.body.age +"', sex = '"+ req.body.sex +"', phone = '"+ req.body.phone + 
						"', email = '"+ req.body.email +"', department = '"+ req.body.department +"', title = '"+ req.body.title +"', managerid = '"+ req.body.managerid +"' where id =" + id;
	conn.query(updateQuery, function(err, rows) {
		if (err) console.log(err);
		res.send('Edit employee success!');
	});
});

//upload image
app.post('/upload/:id', multipartMiddleware, function(req, res) {
	var maxid = req.param('id');
	var image =  req.files.img;
    var newImageLocation = path.join(__dirname, 'web/images', 'id'+maxid+'.jpg');
    console.log(newImageLocation);
    fs.readFile(image.path, function(err, data) {
        fs.writeFile(newImageLocation, data, function(err) {
            res.json(200, {
                src: 'images/' + image.name,
                size: image.size
            });
        });
    });
});

//edit form, get manager list
app.get('/manager/:id',function(req,res){
	var id = req.param('id');
	var getQuery = "SELECT e.*, (case when e.managerid is null then '' " +
	" else (select CONCAT(m.fname,' ',m.lname) from test.employee m where m.id = e.managerid) end ) as managername, " +
	"(select count(id) from test.employee r where e.id = r.managerid) as report " +
	" FROM test.employee e where (e.managerid != " + id + " and e.id != " + id + " ) or e.managerid is null";
	conn.query(getQuery, function(err, rows) {
		if (err) console.log(err);
		res.send(rows);
	});
});


app.get('/tableOperation/:id', function(req,res){
	var id = req.param('id');
	var selectQuery = 'SELECT * FROM test.userdata where id =' + id;
	conn.query(selectQuery, function(err, rows) {
		if (err) console.log(err);
		res.send(rows[0]);
	});
});

app.put('/tableOperation/:id', function(req,res){
	var id = req.params.id;
	var updateQuery = "update test.userdata set Age = "+ req.body.Age +", Sex = '"+ req.body.Sex +"', Major='"+ req.body.Major +"' where id =" + id;
	conn.query(updateQuery, function(err, rows) {
		if (err) console.log(err);
		res.send('Update id:'+ id + ' success!');
	});
});

app.delete('/tableOperation/:id',function(req,res){
	var deleteid = req.params.id;
	var deleteQuery = "delete from test.userdata where id =" + deleteid;
	conn.query(deleteQuery, function(err, rows) {
		if (err) console.log(err);
		res.send('delete id:'+ deleteid + ' success!');
	});
});

app.get('/tableOperation',function(req,res){
	conn.query('SELECT * FROM test.userdata', function(err, rows) {
		if (err) console.log(err);
		res.send(rows);
	});
});


var server = http.createServer(app).listen(app.get('port'),function(){
	console.log('Express server listening on port '+ app.get('port'));
});
