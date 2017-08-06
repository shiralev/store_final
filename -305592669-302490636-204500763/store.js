
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

app.use(express.static(__dirname + '/public'));
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

//--------------------------------------------------------------------------------------------------------------

app.get('/addCategory/:category', function (req, res) {
		var cat = req.params.category;
		DButilsAzure.Insert('INSERT INTO Categories (Categoryname) VALUES (\''+cat+'\')')
        .then((ans)=>res.send(ans))
        .catch((err)=>res.send(err));	
});

//--------------------------------------------------------------------------------------------------------------

app.post('/addCustomer', function (req, res) {
    
    var un = req.body.Username;
	var ps = req.body.Password;
	var fn = req.body.Firsname;
	var ln = req.body.Lastname;
	var ad = req.body.Address;
	var ct = req.body.City;
	var cr = req.body.Country;
	var ph = req.body.Phone;
	var cl = req.body.Cellular;
	var ml = req.body.Mail;
	var cc = req.body.Creditcard;
	var an = req.body.Answer;
	var categories = req.body.categoriesArray;
	
    if (!un || !ps || !fn || !ln || !ad || !ct || !cr || !ph || !ml || !cc ) {
        res.send("failed to add the Customer");
        res.end();
    }
    else{
		var id = "select SCOPE_IDENTITY() as scopeIdentity;"
		var sql ='INSERT INTO Customers VALUES (\''+un+'\' , \''+ps+'\', \''+fn+'\', \''+ln+'\', \''+ad+'\', \''+ct+'\', \''+cr+'\', \''+ph+'\', \''+cl+'\', \''+ml+'\', \''+cc+'\', \''+an+'\') ';
		DButilsAzure.Select(sql+id)
			.then(function(ans){
				var cusID = ans[0].scopeIdentity;
				var s = 'INSERT INTO CustomersCategories VALUES ';
				for (i = 0; i < categories.length-1; i++) { 
					s += "(" +cusID+ ",\'" +categories[i].Categoryname+ "\'),";
				}
				s += "(" +cusID+ ",\'" +categories[categories.length-1].Categoryname+ "\')";
				return DButilsAzure.Insert(s);
			})
			.then((ans)=> res.send(ans))
			.catch((err)=>res.send(err));
	}
});

//--------------------------------------------------------------------------------------------------------------

app.get('/GetAllCategory', function (req,res) {
    DButilsAzure.Select('SELECT Categoryname FROM Categories')
        .then((ans)=> res.send(ans))
        .catch((err)=>res.send(err));
});

//--------------------------------------------------------------------------------------------------------------

app.post('/Login', function (req,res) {
	var un = req.body.Username;
    var pwd = req.body.Password;
	
	if (!un || !pwd ) {
        res.send( "invalid parameters" );
        res.end();
    }
	else{
		DButilsAzure.Select('SELECT * FROM Customers WHERE Username = \''+un+'\' ')
		 .then(function(ans){
			if(ans.length==0)
				return Promise.reject('Worng User name');
			if(pwd != ans[0].Password)
				return Promise.reject('Worng Password');
			//res.cookie('Cookie9' , 'loginData2', { maxAge: 900000, httpOnly: true, userName: ans[0].CustomerID }).send('Cookie is set');
		 })
		 .then((ans)=> res.send(true))
		 .catch((err)=> res.send(err));
	}
	
});
	
//--------------------------------------------------------------------------------------------------------------

app.post('/RestorePassword', function (req,res) {

	var un = req.body.Username;
    var pwd = req.body.Password;
	var answer = req.body.Answer;
    DButilsAzure.Select('SELECT * FROM Customers WHERE Username = \''+un+'\' AND Answer = \''+answer+'\'')
		 .then(function(ans){
			if(ans.length==0)
				return Promise.reject('Worng Password or Answer');
		 })
		 .then((ans)=> DButilsAzure.Update('UPDATE Customers SET Password = \''+pwd+'\' WHERE Username = \''+un+'\''))
		 .then((ans)=> res.send(true))
		 .catch((err)=> res.send(err));
});

//--------------------------------------------------------------------------------------------------------------

app.get('/cookie',function(req, res){
     //res.cookie('myCookie2' , 'cookie_value').send('Cookie is set');
	 res.cookie('myCookie12' ,'datjkeklk', {expire : new Date() + 9999}).send('Cookie is set');
	 
});


var port = 5000;
app.listen(port, function () {
    console.log('listening to port: ' + port);
});

//----------------------------------------------------------------------------------------------------------------

app.get('/getCountries', function (req,res) {

	var XMLPath = "countries.xml";
	var parser = new xml2js.Parser();
	fs.readFile(XMLPath,function(err,data){
		parser.parseString(data,function(err,result){
			console.log(result);
			res.send(result.Countries.Country);
			
		});
	});
	
});

//----------------------------------------------------------------------------------------------------------------

app.put('/AddToCart', function (req,res) {

	var proName = req.body.Productname;
    DButilsAzure.Select('SELECT * FROM Products WHERE Productname = \''+proName+'\'')
		.then(function(ans){
			if(ans.length==0)
				return Promise.reject('Worng Product name');
		 })
		 .then(function(ans){
			if(ans[0].Inventory==0)
				return Promise.reject('Out of stock');
		 })
		 .then((ans)=> DButilsAzure.Update('UPDATE Products SET Inventory = ' + (ans[0].Inventory-1) + ' WHERE Productname = \''+proName+'\' '))
		 .then((ans)=> res.send(ans))
		 .catch((err)=> res.send(err));	
});

//----------------------------------------------------------------------------------------------------------------

app.put('/RemoveFromCart', function (req,res) {

	var proName = req.body.Productname;
    DButilsAzure.Select('SELECT * FROM Products WHERE Productname = \''+proName+'\'')     
		 .then((ans)=> DButilsAzure.Update('UPDATE Products SET Inventory = ' + (ans[0].Inventory+1) + ' WHERE Productname = \''+proName+'\' '))
		 .then((ans)=> res.send(ans))
		 .catch((err)=> res.send(err));
});

//----------------------------------------------------------------------------------------------------------------

app.post('/Purchase', function (req,res) {

	var Username = req.body.Username;
	var products = req.body.ProductsArray;
	var arrDate = req.body.ArrivalDate;
	var TotPrice = req.body.TotalPrice;
	var today = myDate();
	var custID;
	var sql = "select SCOPE_IDENTITY() as scopeIdentity;"
	
	DButilsAzure.Select('SELECT * FROM Customers WHERE Username = \''+Username+'\'')
		.then(function(ans){
			custID = ans[0].CustomerID;
		 })
		.then((ans)=> DButilsAzure.Select('INSERT INTO Orders VALUES (\''+custID+'\' , \''+TotPrice+'\', \''+today+'\' , \''+arrDate+'\') ' +sql))
		.then(function(ans){
			var orderID = ans[0].scopeIdentity;
			var sql = 'INSERT INTO CustomersOrders VALUES ';
			for (i = 0; i < products.length-1; i++) { 
				sql += "(" +orderID+  ",\'" + products[i].productname + "\'," +products[i].quantity+ ','+ custID +"),";
			}
			sql += "(" +orderID + ",\'" + products[products.length-1].productname + "\'," +products[products.length-1].quantity+ ','+ custID +")";
			return DButilsAzure.Insert(sql);
		 })
		.then((ans)=> res.send(ans))
		.catch((err)=> res.send(err));
	
});

//----------------------------------------------------------------------------------------------------------------

app.get('/GetHistory/:Username', function (req, res) {
    var un = req.params.Username;
	var orderData;
	DButilsAzure.Select('SELECT * FROM customers WHERE Username = \''+un+'\'')  
		.then((ans)=> DButilsAzure.Select('SELECT * FROM Orders WHERE CustomerID = ' + ans[0].CustomerID))	
		.then((ans)=> res.send(ans))
		.catch((err)=> res.send(err));
});

//----------------------------------------------------------------------------------------------------------------

app.get('/GetProducts/:Username', function (req, res) {
    var un = req.params.Username;
	
	DButilsAzure.Select('SELECT * FROM Customers WHERE Username = \''+un+'\'') 
		.then((ans)=> DButilsAzure.Select("SELECT * FROM CustomersOrders WHERE CustomerID = " +ans[0].CustomerID ))	
		.then((ans)=> res.send(ans))
		.catch((err)=> res.send(err));
		 
});

//----------------------------------------------------------------------------------------------------------------

app.get('/clearcookie', function(req,res){
     res.clearCookie('Cookie7').send('Cookie deleted');
});

//----------------------------------------------------------------------------------------------------------------

app.get('/ShowHotProducts', function (req, res) {	
	var q = 'select top 5 * from Products where Inventory < 30';
	DButilsAzure.Select(q)    
		.then(function(ans) {
			res.send(ans);
		})
		.catch(function(err){
            res.send(err);
		});
});

//----------------------------------------------------------------------------------------------------------------

app.get('/ShowNewProducts', function (req, res) {	
	var q = 'select top 5 * from Products where creationDate >= DATEADD(mm, -1, GETDATE()) order by CreationDate DESC';
	DButilsAzure.Select(q)    
		.then(function(ans) {
			res.send(ans);
			})
			.catch(function(err){
				res.send(err);
			});
});

//----------------------------------------------------------------------------------------------------------------

app.post('/ListProduct', function (req, res) {	

	var ct = req.body.Categoryname;
	var q =  'select Productname from products where categoryID = (select categoryID from categories where categoryname = \'' + ct + '\')';
	
	DButilsAzure.Select(q)    
		.then(function(ans) {
			res.send(ans);
		})
		.catch(function(err){
			res.send(err);
		});
});

//----------------------------------------------------------------------------------------------------------------

app.post('/SearchProduct', function (req, res) {	

	var pn = req.body.Productname;
	var q = 'select Productname, Details, price from Products where Productname = \'' + pn + '\'';
	DButilsAzure.Select(q)    
		.then(function(ans) {
			res.send(ans);
		})
		.catch(function(err){
			res.send(err);
		});
	
});

//--------------------------------------------------------------------------------------------------------------

app.get('/GetAllProduct', function (req, res) {	
	var q = 'select * from Products';
	DButilsAzure.Select(q)    
		.then(function(ans) {
			res.send(ans);
			})
			.catch(function(err){
				res.send(err);
			});
});

//--------------------------------------------------------------------------------------------------------------

app.post('/GetFavoriteProducts', function (req, res) {

	var cusName = req.body.Username;
	var q = 'select Productname from Products where CategoryID = (select CategoryID from Categories where Categoryname = (select top 1 Categoryname from CustomersCategories where CustomersID = (select CustomerID from Customers where Username = \'' +cusName+ '\')))';
	DButilsAzure.Select(q)    
		.then(function(ans) {
			res.send(ans);
		})
		.catch(function(err){
			res.send(err);
		});
});

//-----------------------------------------------------------------------------delete---using-GETDATE()------------------

function myDate()
{
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth()+1;
    let yyyy = today.getFullYear();
    if(dd < 10)
        dd = '0' + dd;
    if(mm < 10)
        mm = '0' + mm;
    today = yyyy + '-' + mm + '-' + dd;
    return today;
}

