
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Connection = require('tedious').Connection;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var cors = require('cors');
app.use(cors());
var DButilsAzure = require('./DBUtils2');
var fs = require('fs');
var xml2js = require('xml2js');
var cookieParser = require('cookie-parser');
app.use(cookieParser());


//--------------------------------------------------------------------------------------------------------------

var config = {
    userName: 'orShira',
    password: 'baumLevy12',
    server: 'shiraserver.database.windows.net',
    requestTimeout:300000,
    options:{encrypt:true, database:'BicycleStore'}
};

var connection = new Connection(config);
connection.on('connect', function (err) {
    if(err)
    {
        console.error('error connecting: ' + err.stack)
    }
	else
	{
		console.log("Connected Azure");
	}   
})

var port = 5000;
app.listen(port, function () {
    console.log('listening to port: ' + port);
});

//--------------------------------------------------------------------------------------------------------------

app.post('/ShowClient', function (req, res) {
	
	var custname = req.body.Customername;
	var q = 'select Firstname, Lastname, Address, City, Country, Phone, Mail from Customers WHERE Username = \'' +custname+ '\'';
	DButilsAzure.Select(q)    
		.then(function(ans) {
			res.send(ans);
		})
		.catch(function(err){
            res.send(err);
		});
});

//--------------------------------------------------------------------------------------------------------------

app.get('/ShowAllClients', function (req, res) {
	var q = 'select Firstname, Lastname, Address, City, Country, Phone, Mail from Customers';
	DButilsAzure.Select(q)    
		.then(function(ans) {
			res.send(ans);
		})
		.catch(function(err){
            res.send(err);
		});
});

//--------------------------------------------------------------------------------------------------------------

app.post('/AddNewCategory', function (req, res) {
	
	var catname = req.body.Categoryname;	
	var q2 = 'INSERT INTO Categories VALUES (\'' +catname+ '\')' ;
	DButilsAzure.Insert(q2)    
		.then(function(ans) {
			res.send(ans);
		})
		.catch(function(err){
		res.send(err);
	});
});

//--------------------------------------------------------------------------------------------------------------

app.post('/AddNewProduct', function (req, res) {
	
	var catname = req.body.Categoryname;
	var proname = req.body.Productname;
	var inv = req.body.Inventory;
	var detail = req.body.Details;
	var p = req.body.price;
		
	if (!catname || !proname || !p || !inv) {
        res.send("failed to add the Product");
        res.end();
    }
	
	var q1 = 'select CategoryID from Categories where Categoryname = \'' + catname + '\'';
	DButilsAzure.Select(q1)    
		.then(function(ans) {	
			var q2 = 'INSERT INTO Products VALUES (\'' +proname+ '\' , ' +inv+ ', ' +ans[0].CategoryID+ ', GETDATE(), \'\', \'' +detail+ '\', ' +p+ ', null)';
			DButilsAzure.Insert(q2)    
				.then(function(ans) {
					res.send(ans);
				})
				.catch(function(err){
				res.send(err);
			});
		})
		.catch(function(err){
            res.send(err);
		});
});

//--------------------------------------------------------------------------------------------------------------

app.get('/ShowInventory', function (req, res) {
	var q = 'select Productname, Inventory from Products';
	DButilsAzure.Select(q)    
		.then(function(ans) {
			res.send(ans);
		})
		.catch(function(err){
            res.send(err);
		});
});

//--------------------------------------------------------------------------------------------------------------

app.post('/ChangeInventory', function (req, res) {
	var pro = req.body.Productname;
	var inv = req.body.Inventory;
	var q = 'UPDATE Products SET Inventory = ' + inv + ' WHERE Productname = \'' + pro + '\'';
	DButilsAzure.Update(q)    
		.then(function(ans) {
			res.send(ans);
		})
		.catch(function(err){
            res.send(err);
		});		
});

//--------------------------------------------------------------------------------------------------------------

app.post('/ChangeDetails', function (req, res) {
	var pro = req.body.Productname;
	var detail = req.body.Details;
	var q = 'UPDATE Products SET Details = \'' + detail + '\' WHERE Productname = \'' + pro + '\'';
	DButilsAzure.Update(q)    
		.then(function(ans) {
			res.send(ans);
		})
		.catch(function(err){
            res.send(err);
		});	
});

//---------------------------- בכוונה מחיקה על לקוח אחד.. כי אין פונקציה שמוחקת כשיש כמה תנאים ב- where --------------------------------------------

app.post('/DeleteCustomer', function (req, res) {
	var cn = req.body.customername;
	var q1 = 'UPDATE Products SET LastCustomerID = NULL WHERE LastCustomerID = (select CustomerID from Customers where Username = \'' + cn + '\')';
	DButilsAzure.Update(q1)
		.then(function(ans) {
			var q2 = 'UPDATE Orders SET CustomerID = NULL WHERE CustomerID = (select CustomerID from Customers where Username = \'' + cn + '\')';
			DButilsAzure.Update(q2)
				.then(function(ans) {
					var q3 = 'DELETE FROM Customers WHERE CustomerID = (select CustomerID from Customers where Username = \'' + cn + '\')';
					DButilsAzure.Delete(q3)    
						.then(function(ans) {
							res.send(ans);
						})
						.catch(function(err){
							res.send(err);
						});				
				})
				.catch(function(err){
					res.send(err);
				});			
		})
		.catch(function(err){
            res.send(err);
		});
});

//-----------------------------------------------------מחיקה אחת אותה סיבה-----------------------------------------------


app.post('/DeleteProduct', function (req, res) {
	var Pro = req.body.Productname;
	var q = 'DELETE FROM Products WHERE Productname = \'' + Pro + '\'';
	DButilsAzure.Delete(q)    
			.then(function(ans) {
				res.send(ans);
			})
			.catch(function(err){
				res.send(err);
			});
});

//-----------------------------------------------------מחיקה אחת אותה סיבה-----------------------------------------------

app.post('/DeleteCategory', function (req, res) {
	var cat = req.body.Categoryname;
	var q = 'DELETE FROM Categories WHERE Categoryname = \'' + cat + '\'';
	DButilsAzure.Delete(q)    
			.then(function(ans) {
				res.send(ans);
			})
			.catch(function(err){
			res.send(err);
		});
});

//--------------------------------------------------------------------------------------------------------------

app.post('/addEmployee', function (req, res) {
    
    var un = req.body.Username;
	var ps = req.body.Password;
	var fn = req.body.Firsname;
	var ln = req.body.Lastname;
	var ml = req.body.Mail;
	var an = req.body.Answer;
	
	var tmp = true;
	
    if (!un || !ps || !fn || !ln || !an) {
        res.send("failed to add the Customer");
        res.end();
    }
	else {
		var q = 'SELECT * FROM Customers WHERE Username = \'' + un + '\' ';
		console.log('aaaaaaaaaaaaaaa: ' + q);
		DButilsAzure.Select(q)
			.then(function(ans) {
				console.log('ans: ' + ans);
				console.log('length: ' + ans.length);
				
				if (ans.length > 0){
					res.send('UserName all-ready exists');
					res.end();
					tmp = false;
				}
				
				if ( tmp ){
					var sql ='INSERT INTO Employees VALUES (\'' +un+ '\', \'' +ps+ '\', \'' +fn+ '\', \'' +ln+ '\', \'' +ml+ '\', \'' +an+ '\')';
					console.log('bbbbbbbbbbbbbbbb: ' + sql);
					DButilsAzure.Insert(sql)
						.then(function(ans) {
							res.send(ans);
						})
						.catch(function(err){
							res.send(err);
						});
				}
			})
			.catch(function(err){
				res.send(err);
			});		
	}
});

//--------------------------------------------------------------------------------------------------------------

app.post('/DeleteEmployee', function (req, res) {
	var un = req.body.Username;
	var q = 'DELETE FROM Employees WHERE Username = \'' + un + '\'';
	DButilsAzure.Delete(q)    
			.then(function(ans) {
				res.send(ans);
			})
			.catch(function(err){
				res.send(err);
		});
});

//----------------------------------------------------------במידה והיוזר קיים ----------------------------------------------------

app.post('/UserType', function (req, res) {
	var un = req.body.Username;
	var q = 'select EmployeeID from Employees where Username = \'' +un+ '\'';
	DButilsAzure.Select(q)    
			.then(function(ans) {
				if (ans.length != 0)
					res.send('Employee');
				else{
					res.send('Customer');
				}
			})
			.catch(function(err){
			res.send(err);
		});
});

//----------------------------------------------------------------------------------------------------------------

app.get('/ShowAllEmployees', function (req, res) {	

	var q =  'select Username, Firstname, Lastname, Mail from Employees';
	DButilsAzure.Select(q)    
		.then(function(ans) {
			res.send(ans);
		})
		.catch(function(err){
			res.send(err);
		});
	
});

//--------------------------------------------------------------------------------------------------------------

app.post('/GetReport', function (req, res) {
	var date1 = req.body.dateStart;
	var date2 = req.body.dateEnd;
	var q = 'select TotalPrice, Date, ArrivalDate from Orders where Date BETWEEN \'' +date1+ '\' AND \'' +date2+ '\'';
	DButilsAzure.Select(q)    
		.then(function(ans) {
			res.send(ans);
		})
		.catch(function(err){
			res.send(err);
		});
});

//--------------------------------------------------------------------------------------------------------------






