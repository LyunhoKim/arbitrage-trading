'use strict';

const ccxt = require('ccxt');
const fs = require('fs');

const low = 0.2;
const high = 5.0;

let upbit;      // ccxt object

let upbitInfo = {
  id: 'upbit',
  info: {
    apiKey: "aaa",
    secret: "bbb",
    enableRateLimit: true
  }
};
let btc1m = [];
let counter = 0;
let lastStatus = {};




function getRSI() {
  console.log('getRSI()', btc1m);
  if(btc1m.length < 15) {
    setTimeout(getRSI, 1000 * 5);
    return;
  }     
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
  
  for(var i=0; i<15; i++) {
    const tmp = btc1m[i] - btc1m[i+1];
    if(tmp < 0) { RSI.D += tmp; RSI.DCounter++; } 
    else { RSI.U += tmp; RSI.UCounter++ }
  }

  let sum = btc1m.reduce( (acc, value) => {
    return acc + value;
  }, 0);

  RSI.AU = RSI.U / RSI.UCounter;
  RSI.AD = Math.abs(RSI.D) / RSI.DCounter;
  RSI.RS = RSI.AU / RSI.AD;
  RSI.RSI = RSI.AU / (RSI.AU + RSI.AD);
  RSI.RSI = (RSI.RSI * 100).toFixed(2);

  console.log(sum, RSI);
  const l = `${getTimeStamp()},${RSI.RSI},${btc1m[0]}`;
  log(l);
  // setTimeout(getRSI, 1000 * 5);
  // setTimeout(getRSI, 1000 * 60 * 5); // 5분 RSI
  setTimeout(getRSI, 1000 * 60); // 1분 RSI
}



const bitTicker = () => {
  console.log('bitTicker()', btc1m.length);
  upbit.fetchTicker('BTC/KRW').then((ticker) => {
    btc1m.unshift(ticker ? ticker.last : 0);
  });

  const l = `${getTimeStamp()},${btc1m[0]}`;
  log(l, 'collector-raw.log')
  // setTimeout(bitTicker, 1000);
  setTimeout(bitTicker, 1000 * 60); // 1분 주기 데이터 수집
  if(btc1m.length > 100) btc1m.pop();
};


/**************************************************
 *                    Starter
 **************************************************/
(async function getMarketInfo() {

  log('collector started');  
  // 마켓 정보 조회
  upbit = new ccxt[upbitInfo.id]();

  setTimeout(bitTicker, 0);
  setTimeout(getRSI, 3000);
}) ();



// ******************** utils *************************
function log(msg, filename = 'collector.log') {
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