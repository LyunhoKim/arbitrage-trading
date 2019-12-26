'use strict';

const express = require('express');
const fs = require('fs');
const app = express();
const db = require('./util/database');
const sql = require('./query');

app.get('/rsi', (req, res) => {
  db.select({
    query: sql.selectRSI,
    params: {
      period: req.query.p
    }
  },
  (error, result) => {
    console.log(typeof result);
    if(error) {
      res.send(error);
    } else {
      // Object.keys(result).forEach(function(key) {
      //   var row = result[key];
      //   console.log(key);
      // });

      // res.send('ssss');

      // let rsi = "";
      // const json = JSON.parse(result);
      for(var val in result) {        
        let json = JSON.parse(val);
        console.log(json);

        // rsi += `${val['rsi'].name},${val['timestamp']}\n</br>`
      }
      res.send('aaaa');
    }
  })
});

app.listen(8080, () => {
  console.log(`API Gateway listening on port 8080!`);
});
