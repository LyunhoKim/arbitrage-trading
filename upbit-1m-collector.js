'use strict';

const ccxt = require('ccxt');
const fs = require('fs');
const database = require('./util/database');
const query = require('./query');

let upbit;
let upbitInfo = {
  id: 'upbit',
  info: {
    apiKey: "aaa",
    secret: "bbb",
    enableRateLimit: true
  }
};
let btc1m = [];
const bitTicker = () => {
  upbit.fetchTicker('BTC/KRW').then((ticker) => {
    btc1m.unshift(ticker ? ticker.last : 0);
    database.insert(
      {
        query: query.insert1mPrice,
        params: {
          exchange: 'upbit',
          pair: 'BTC',
          price:  ticker.last,
          bidAmount: 0,
          askAmount: 0,
          bidPrice: 0,
          askPrice: 0,
        }
      },
      (error, result) => {
        if(error) {
          const l = `${getTimeStamp()},${error}`;
          log(l);
          return;
        } else {}
      }
    )
  });  
};


/**************************************************
 *                    Starter
 **************************************************/
(async function getMarketInfo() {

  log(`${getTimeStamp()} - collector started`);  
  // 마켓 정보 조회
  upbit = new ccxt[upbitInfo.id]();

  setInterval(bitTicker, 1000 * 60);
}) ();



// ******************** utils *************************
function log(msg, filename = 'upbit-1m-collector.log') {
  var msg = `${msg}\n<br>`;  
  fs.appendFile(filename, msg, 'utf8', (error, data) => {});  
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