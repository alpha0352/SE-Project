const mysql = require('mysql');

var connection = mysql.createConnection({
	host : 'localhost',
	database : 'project',
	user : 'root',
	password : 'PasswordHere'
});

connection.connect(function(error){
	if(error)
	{
		throw error;
	}
	else
	{
		console.log('MySQL Database is connected Successfully');
	}
});

module.exports = connection;

