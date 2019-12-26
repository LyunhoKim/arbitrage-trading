'use strict';

const async = require('async');
const mysql = require('mysql');
const conf = require('../config/db-config');

module.exports.connect = (callback) => { 
  const connection = mysql.createConnection(conf);
  connection.connect((error) => {
    if(error) {      
      console.log(error);
      return callback(`db connect error: ${error.stack}`);
    }
    connection.config.queryFormat = function (query, values) {
      if (!values) return query;
      return query.replace(/\:(\w+)/g, function (txt, key) {
        if (values.hasOwnProperty(key)) {
          return this.escape(values[key]);
        }
        return txt;
      }.bind(this));
    };
    callback(null, connection);
  });  
};

module.exports.close = (connection) => {  
  if (connection !== null) {
    connection.close(
      (error) => {
        if (error) {
          console.log(error);          
        }
      }
    );
  }
};

/*
  dbConnection 파라미터 유무에 따라
  단일 query / 다중 query 함수가 호출됨
*/
module.exports.select = (data, callback) => {
  console.log(data);  
  async.waterfall(
    [
      (callback) => {
        this.connect(callback);
      },
      (connection, callback) => {
        
        connection.query(
        {
          sql: data.query,
          timeout: 10000,
          values: data.params
        },
          (error, result, fields) => {
            if(error) {
              return callback(error);
            } else {              
              callback(null, result, connection);
            }
          }
        );
      },
      (result, connection, callback) => {
        connection.end((error) => {          
          if(error) {
            return callback(error);
          } else {
            callback(null, result);
          }
        });
      }
    ], (error, result) => {      
      if(error) {
        console.log(error);
        callback(error);
      } else {          
        callback(null, result);
      }
    }
  )
};

module.exports.insert = (data, resultCallback) => {
  console.log(data);    
  async.waterfall(
    [
      (callback) => {
        this.connect(callback);
      },
      (connection, callback) => {        
        connection.query(
        {
          sql: data.query,
          timeout: 10000,
          values: data.params
        },
          (error, result, fields) => {
            if(error) {
              return callback(error);
            } else {              
              callback(null, result, connection);
            }
          }
        );
      },
      (result, connection, callback) => {
        connection.end((error) => {          
          if(error) {
            return callback(error);
          } else {
            callback(null, result);
          }
        });
      }
    ], (error, result) => {      
      if(error) {
        console.log(`insert error: ${error}`);          
        resultCallback(error);
      } else {
        console.log(result);        
        resultCallback(null, result);
      }
    }
  )
};


module.exports.commit = (connection) => {};
module.exports.rollback = (connection) => {};
module.exports.update = (data, callback, dbConnection = null) => {};
module.exports.delete = (data, callback, dbConnection = null) => {};
module.exports.runProcedure = (data, resultCallback) => {};