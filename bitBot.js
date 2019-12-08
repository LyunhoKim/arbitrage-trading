'use strict';

const ccxt = require('ccxt');
const async = require('async');
const fs = require('fs');


const exchangesConfig = require('./config/exchangesConfig.json');
const pair = 'BTC/KRW';
let exchanges = {};
let counter = 0;

const main = async () => {
  // 각 거래소 별 오더북 조회
  async.parallel(
    [
      exchanges['upbit'].getOrders(),
      exchanges['bithumb'].getOrders(),
      exchanges['coinone'].getOrders()   
    ],
    (error, result) => {
      console.log(result);
      if(error) {
        console.log('error:', error);
        return;
      }          

    let ordersArray = [];
    ordersArray.push({
        symbol: 'upbit',
        topAskPrice: result[0].asks[0][0],
        topAskAmount: result[0].asks[0][1],
        topBidPrice: result[0].bids[0][0],
        topBidAmount: result[0].bids[0][1],
        maker: exchanges['upbit'].marketInfo.maker,
        taker: exchanges['upbit'].marketInfo.taker
      });

      ordersArray.push({
        symbol: 'bithumb',
        topAskPrice: result[1].asks[0][0],
        topAskAmount: result[1].asks[0][1],
        topBidPrice: result[1].bids[0][0],
        topBidAmount: result[1].bids[0][1],
        maker: exchanges['bithumb'].marketInfo.maker,
        taker: exchanges['bithumb'].marketInfo.taker
      });

      ordersArray.push({
        symbol: 'coinone',
        topAskPrice: result[2].asks[0][0],
        topAskAmount: result[2].asks[0][1],
        topBidPrice: result[2].bids[0][0],
        topBidAmount: result[2].bids[0][1],
        maker: exchanges['coinone'].marketInfo.maker,
        taker: exchanges['coinone'].marketInfo.taker
      });
    
      let tradeTarget = [];
      for(let i = 0; i<ordersArray.length; i++) {
        for(let j = i+1; j<ordersArray.length; j++) {
          let diff = ordersArray[j].topBidPrice - ordersArray[i].topAskPrice;
          let minAmount = Math.min(ordersArray[i].topAskAmount, ordersArray[j].topBidAmount) * 0.5;
          console.log(`diff: ${diff}, ${ordersArray[j].symbol} - ${ordersArray[i].symbol}`);
          if(2000 <= diff && 0.01 <= minAmount) {            
            minAmount = 0.01;

            let bidFee = ordersArray[j].topBidPrice * minAmount * ordersArray[j].taker; // 수수료반영된 매도 원화금액
            let askFee = ordersArray[i].topAskPrice * minAmount * ordersArray[i].taker; // 매수한 후 수수료

            const profit = (diff * minAmount - bidFee - askFee).toFixed(3);
            if(50 < profit) {
              const profitString = profit > 0 ? `<font color="red">${profit}</font>` : profit;
              tradeTarget.push(`${getTimeStamp()}, 예상수익:${profitString},\t 시세차:${diff}, ${ordersArray[j].symbol}매수가:${ordersArray[j].topBidPrice}, ${ordersArray[i].symbol}매도가:${ordersArray[i].topAskPrice}, 거래량:${minAmount}<br>`);
            }
          }

          diff = ordersArray[i].topBidPrice - ordersArray[j].topAskPrice;
          minAmount = Math.min(ordersArray[j].topAskAmount, ordersArray[i].topBidAmount) * 0.5;
          console.log(`diff: ${diff}, ${ordersArray[i].symbol} - ${ordersArray[j].symbol}`);
          if(2000 <= diff && 0.01 <= minAmount) {
            minAmount = 0.01;

            let askFee = ordersArray[j].topAskPrice * minAmount * ordersArray[j].taker;
            let bidFee = ordersArray[i].topBidPrice * minAmount * ordersArray[i].taker;

            const profit = (diff * minAmount - bidFee - askFee).toFixed(3);
            if(50 < profit) {
              const profitString = profit > 0 ? `<font color="red">${profit}</font>` : profit;
              tradeTarget.push(`${getTimeStamp()}, 예상수익:${profitString},\t 시세차:${diff}, ${ordersArray[i].symbol}매수가:${ordersArray[i].topBidPrice}, ${ordersArray[j].symbol}매도가:${ordersArray[j].topAskPrice}, 거래량:${minAmount}<br>`)
            }
          }
        }
      }
      for(let i=0; i<tradeTarget.length; i++) {
        fs.appendFile('bitBot.log', tradeTarget[i], 'utf8', (error, data) => {});
      }      
    }
  )
  setTimeout(main, 10000);
};

(async function getMarketInfo() {
  // 마켓 정보 조회
  for (let exchange of exchangesConfig) {    
    exchanges[exchange.id] = new ccxt[exchange.id](exchange.info);    
    exchanges[exchange.id].marketInfo = (await exchanges[exchange.id].loadMarkets(pair))[pair];
    exchanges[exchange.id].getOrders = () => {
      return (callback) => {
        exchanges[exchange.id].fetchOrderBook(pair).then(function (orderbook) {
          callback(null, orderbook);
        });
      };
    }
  }
  setTimeout(main, 5000);
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