
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

var config = {
    userName: 'orShira',
    password: 'baumLevy12',
    server: 'shiraserver.database.windows.net',
    requestTimeout:300000,
    options:{encrypt:true, database:'BicycleStore'}
};

var connection;

//----------------------------------------------------------------------------------------------------------------------
exports.Select = function(query) {
    return new Promise(function(resolve,reject) {
        connection = new Connection(config);
        var ans = [];
        var properties = [];
        connection.on('connect', function(err) {
            if (err) {
                console.error('error connecting: ' + err.message);
                reject(err);
            }
            console.log('connection on');
            var dbReq = new Request(query, function (err, rowCount) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
            });

            dbReq.on('columnMetadata', function (columns) {
                columns.forEach(function (column) {
                    if (column.colName != null)
                        properties.push(column.colName);
                });
            });
			
            dbReq.on('row', function (row) {
                var item = {};
                for (i=0; i<row.length; i++) {
                    item[properties[i]] = row[i].value;
                }
                ans.push(item);
            });

            dbReq.on('requestCompleted', function () {
                console.log('request Completed: '+ dbReq.rowCount + ' row(s) returned');
                console.log(ans);
                connection.close();
                resolve(ans);

            });
            connection.execSql(dbReq);
        });
    });
};

//----------------------------------------------------------------------------------------------------------------------

exports.Insert = function(query) {
    return new Promise(function(resolve,reject) {
	
        connection = new Connection(config);
        connection.on('connect', function(err) {
            if (err) {
                console.error('error connecting: ' + err.message);
                reject(err);
            }
            console.log('connection on');
			
			var dbReq = new Request(query, function (err, rowCount) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
            });
			
            dbReq.on('requestCompleted', function () {
                connection.close();
                resolve(true);
            });
            connection.execSql(dbReq);
        });
    });
};

//----------------------------------------------------------------------------------------------------------------------

exports.Update = function(query) {
    return new Promise(function(resolve,reject) {
	
        connection = new Connection(config);
        connection.on('connect', function(err) {
            if (err) {
                console.error('error connecting: ' + err.message);
                reject(err);
            }
            console.log('connection on');
			
			var dbReq = new Request(query, function (err, rowCount) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
            });
			
            dbReq.on('requestCompleted', function () {
                connection.close();
                resolve(true);
            });
            connection.execSql(dbReq);
        });
    });
};

//----------------------------------------------------------------------------------------------------------------------

exports.Delete = function(query) {
    return new Promise(function(resolve,reject) {
	
        connection = new Connection(config);
        connection.on('connect', function(err) {
            if (err) {
                console.error('error connecting: ' + err.message);
                reject(err);
            }
            console.log('connection on');
			
			var dbReq = new Request(query, function (err, rowCount) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
            });
			
            dbReq.on('requestCompleted', function () {
                connection.close();
                resolve(true);
            });
            connection.execSql(dbReq);
        });
    });
};

//----------------------------------------------------------------------------------------------------------------------

