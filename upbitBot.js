'use strict';

const ccxt = require('ccxt');
const async = require('async');
const fs = require('fs');

// ccxt object
let upbit;
let counter = 0;
let bitcoin = 0;
let upbitInfo = {
  id: 'upbit',
  info: {
    apiKey: "aaa",
    secret: "bbb",
    enableRateLimit: true
  }
};

// all symbols
let symbols = [];


const bitTicker = () => {
  upbit.fetchTicker('BTC/KRW').then((ticker) => {
    bitcoin =  ticker ? ticker.last : 0;
  });  
  setTimeout(bitTicker, 2000);
} 


// asks 매도
// bids 매수
const main = async () => {

  const idx = counter % symbols.length;
  let order = symbols[idx];
    async.parallel(
      [
        (callback) => {
          upbit.fetchOrderBook(order.krw, 1).then(function (orderbook) {
            callback(null, orderbook);
          });
        },
        (callback) => {
          upbit.fetchOrderBook(order.btc, 1).then(function (orderbook) {
            callback(null, orderbook);
          });
        }  
      ],
      (error, result) => {
        counter++;
        
        if(error) {
          console.log('error:', error);
          return;
        }
        order.bitcoinTicker = bitcoin;
        order.krwOrder = {
          topAskPrice: result[0].asks[0][0], topAskAmount: result[0].asks[0][1],
          topBidPrice: result[0].bids[0][0], topBidAmount: result[0].bids[0][1]
        }
        order.btcOrder = {
          topAskPrice: result[1].asks[0][0] * order.bitcoinTicker, // btcOrder는 btc 가격 표기가 맞으나 구현 편의상 원화로 표시
          topAskPriceBtc: result[1].asks[0][0],                           // 원래의 btc 가격 표기
          topAskAmount: result[1].asks[0][1],
          topBidPrice: result[1].bids[0][0] * order.bitcoinTicker,
          topBidPriceBtc: result[1].bids[0][0],
          topBidAmount: result[1].bids[0][1]
        }
        
        // console.log(order);
        calcProfit(order.btcOrder, order.krwOrder, order);
        calcProfit(order.krwOrder, order.btcOrder, order);
        
        setTimeout(main, 1000);
      }
    )
};



function calcProfit(bids, asks, order) {
  
  let diff = bids.topBidPrice - asks.topAskPrice;
  let debug = `[${order.base}]bids: ${bids.topBidPrice}, asks: ${asks.topAskPrice}, diff: ${diff}`;
  consoleDebug(debug);
  if(0 < diff) {
    let minAmount = Math.min(bids.topBidAmount, asks.topAskAmount) * 0.5;
    let profit = diff * minAmount - bids.topBidPrice * minAmount * order.taker
                                  - asks.topAskPrice * minAmount * order.taker;
    // consoleDebug(`minAmount: ${minAmount}, profit: ${profit}`);
    if(5.0 <= profit ) {      
      let result = `#${leadingZeros(counter, 8)} [${getTimeStamp()}] KRW->BTC ${order.base}: ${profit.toFixed(1)}원 수량: ${minAmount}\n<br>`;             
      fs.appendFile('trigger-log.log', result, 'utf8', (error, data) => {});
      // consoleDebug(result);
      console.log(result);
      return profit;
    }
  } 
  return 0; 
}

(async function getMarketInfo() {

  consoleDebug('bot started');
  let markets = [];
  // 마켓 정보 조회
  upbit = new ccxt[upbitInfo.id]();
  markets = await upbit.loadMarkets();  
  markets = Object.values(markets);

  // krw, btc 마켓
  let krwMarket = markets.filter(pair => pair.symbol.includes('/KRW'));
  let btcMarket = markets.filter(pair => pair.symbol.includes('/BTC'));

  // krw, btc 공통 마켓만 분리
  for(let i=0; i<krwMarket.length; i++) {
    for(let j=0; j<btcMarket.length; j++) {
      if((krwMarket[i].base) === (btcMarket[j].base)) {
        let symbol = {
          base: krwMarket[i].base,
          krw: krwMarket[i].symbol,
          btc: btcMarket[j].symbol,
          krwTaker: krwMarket[i].taker,
          btcTaker: btcMarket[i].taker          
        }
        symbol.btcOrder = { taker: btcMarket[i].taker };
        symbol.krwOrder = { taker: krwMarket[i].taker };
        symbols.push(symbol);
      }
    }
  }; 
  setTimeout(bitTicker, 0);  
  setTimeout(main, 3000);
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
  console.log('\x1b[36m', msg);
}


