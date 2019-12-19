'use strict';

// const ccxt = require('ccxt');
const fs = require('fs');
var request = require('request');

const upbitUrl = `https://api.upbit.com/v1/candles/minutes/5?market=KRW-BTC&count=15`;

const get5MCandle = async (exchange, pair) => {  
  if(exchange === 'upbit') {        
    var options = {
      'method': 'GET',
      'url': `https://api.upbit.com/v1/candles/minutes/5?market=KRW-${pair}&count=15`,
      'headers': {
      }
    };
    await request(options, function (error, response) { 
      if (error) throw new Error(error);
      // console.log(response.body);
      const res = JSON.parse(response.body);
      // console.log(res);
      getRSI(res);
    });    
  }
};

get5MCandle('upbit', 'BTC');

function getRSI(data) {
  let RSI = {
    U: 0,
    D: 0,
    UCounter: 0,
    DCounter: 0,
    AU: 0,
    AD: 0,
    RS: 0,
    RSI: 0
  };
  
  for(var i=0; i<data.length-1; i++) {
    const tmp = data[i].trade_price - data[i+1].trade_price;
    if(tmp < 0) { RSI.D += tmp; RSI.DCounter++; } 
    else { RSI.U += tmp; RSI.UCounter++ }
  }

  let sum = data.reduce( (acc, value) => {
    return acc + value.trade_price;
  }, 0);

  RSI.AU = RSI.U / RSI.UCounter;
  RSI.AD = Math.abs(RSI.D) / RSI.DCounter;
  RSI.RS = RSI.AU / RSI.AD;
  RSI.RSI = RSI.AU / (RSI.AU + RSI.AD);
  RSI.RSI = (RSI.RSI * 100).toFixed(2);


  console.log(sum, RSI);
}



/**
 * **********************************************************************
 *  UTILS
 * **********************************************************************
 */

function log(msg) {
  var msg = `${msg}\n<br>`;
  fs.appendFile('collector.log', msg, 'utf8', (error, data) => {});
}

function getTimeStamp() {
  let d = new Date();
  let s =
    leadingZeros(d.getFullYear(), 4) + '-' +
    leadingZeros(d.getMonth() + 1, 2) + '-' +
    leadingZeros(d.getDate(), 2) + ' ' +

    leadingZeros(d.getHours(), 2) + ':' +
    leadingZeros(d.getMinutes(), 2) + ':' +
    leadingZeros(d.getSeconds(), 2);

  return s;
}

function leadingZeros(n, digits) {
  let zero = '';
  n = n.toString();

  if (n.length < digits) {
    for (let i = 0; i < digits - n.length; i++)
      zero += '0';
  }
  return zero + n;
}