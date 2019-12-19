'use strict';

const ccxt = require('ccxt');
const fs = require('fs');

const low = 0.2;
const high = 5.0;

let upbit;      // ccxt object
let btcPrice;
let upbitInfo = {
  id: 'upbit',
  info: {
    apiKey: "aaa",
    secret: "bbb",
    enableRateLimit: true
  }
};
let counter = 0;
let lastStatus = {};

const main = async () => {
  const orderbook = await upbit.fetchOrderBook('BTC/KRW', 1);  

  let [topBidPrice] = orderbook.bids[14];
  let [topAskPrice] = orderbook.asks[14];  

  // 매수 오더 수량 합계
  const bids = orderbook.bids.reduce( (accumulator, value) => {
    return accumulator + value[1];
  }, 0).toFixed(8);

  // 매도 오더 수량 합계
  const asks = orderbook.asks.reduce( (accumulator, value) => {
    return accumulator + value[1];
  }, 0).toFixed(8);
  
  const timestamp = getTimeStamp();

  const rate = (bids/asks).toFixed(2);
  if(rate < low && high < lastStatus.rate) {  // 매도세 강세 상황
    let log = `${counter},${timestamp},SELL,${bids},${asks},${rate},${bids+asks},${lastStatus.btcPrice},${topBidPrice},${topAskPrice}\n<br>`;
    fs.appendFile('tran.log', log, 'utf8', (error, data) => {});
  } else if(lastStatus.rate < low && high < rate) {  // 매수세 강세 상황
    let log = `${counter},${timestamp},BUY,${bids},${asks},${rate},${bids+asks},${lastStatus.btcPrice},${topAskPrice},${topBidPrice}\n<br>`;
    fs.appendFile('tran.log', log, 'utf8', (error, data) => {});
  }

  if(rate < low || high < rate) {
    let result = `${counter},${timestamp},${bids},${asks},${rate},${bids+asks},${btcPrice}\n<br>`;             
    fs.appendFile('upbitBot.log', result, 'utf8', (error, data) => {});      
    lastStatus = {
      rate: rate,
      btcPrice: btcPrice
    };
  }
  counter++;
  setTimeout(main, 1000);
}

const bitTicker = () => {
  upbit.fetchTicker('BTC/KRW').then((ticker) => {
    btcPrice =  ticker ? ticker.last : 0;
  });  
  setTimeout(bitTicker, 1500);
} 

(async function getMarketInfo() {

  console.log('bot started');  
  // 마켓 정보 조회
  upbit = new ccxt[upbitInfo.id]();

  let result = `counter,TimeStamp,매수량,매도량,Rate,오더북합,BTC\n<br>`;             
  fs.appendFile('upbitBot.log', result, 'utf8', (error, data) => {});   
  let log = `counter,timestamp,거래,매수량합,매도량합,합계비율,오더북합,btcPrice,topAskPrice,topBidPrice\n<br>`;
  fs.appendFile('tran.log', log, 'utf8', (error, data) => {});  

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