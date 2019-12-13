'use strict';

const ccxt = require('ccxt');
const fs = require('fs');

// ccxt object
let upbit;
let btcPrice;
let upbitInfo = {
  id: 'upbit',
  info: {
    apiKey: "aaa",
    secret: "bbb",
    enableRateLimit: true
  }
};

const main = async () => {
  const orderbook = await upbit.fetchOrderBook('BTC/KRW', 1);

  const bids = orderbook.bids.reduce( (accumulator, value) => {
    return accumulator + value[1];
  }, 0).toFixed(8);

  const asks = orderbook.asks.reduce( (accumulator, value) => {
    return accumulator + value[1];
  }, 0).toFixed(8);

  const rate = (bids/asks).toFixed(2);
  // if(rate < 0.6 || 1.66 < rate) {    
  let result = `${getTimeStamp()},매수량:${bids},매도량:${asks},Rate:${rate},BTC:${btcPrice}\n<br>`;             
  fs.appendFile('upbitBot.log', result, 'utf8', (error, data) => {});      
  // }

  setTimeout(main, 1000);
}

const bitTicker = () => {
  upbit.fetchTicker('BTC/KRW').then((ticker) => {
    btcPrice =  ticker ? ticker.last : 0;
  });  
  setTimeout(bitTicker, 1500);
} 

(async function getMarketInfo() {

  consoleDebug('bot started');  
  // 마켓 정보 조회
  upbit = new ccxt[upbitInfo.id]();

  let result = `TimeStamp,매수량,매도량,Rate,BTC\n<br>`;             
  fs.appendFile('upbitBot.log', result, 'utf8', (error, data) => {});      

  setTimeout(bitTicker, 0);  
  setTimeout(main, 1000);
}) ();

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

function consoleDebug(msg) {
  // console.log('\x1b[36m', msg);
  console.log(msg);
}


