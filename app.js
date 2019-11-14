'use strict';

const ccxt = require('ccxt');
const async = require('async');
const express = require('express');

const exchangesConfig = require('./config/exchangesConfig.json');
// const pairs = require('pairs.json');
const pair = 'BTC/KRW';


let exchanges = {};
let markets = [];
const app = express();

// asks 매도
// bids 매수

app.get('/', 
async (req, res) => {  

  // 마켓 정보 조회
  for (let exchange of exchangesConfig) {    
    exchanges[exchange.id] = new ccxt[exchange.id](exchange.info);
    markets[exchange.id] = (await exchanges[exchange.id].loadMarkets(pair))[pair];
    // console.log('#####################################', markets);   
  }

  // 각 거래소 별 오더북 조회
  async.parallel(
    [
      (callback) => {
        exchanges['upbit'].fetchOrderBook(pair).then(function (orderbook) {
          callback(null, orderbook);
        });
      },
      (callback) => {
        exchanges['bithumb'].fetchOrderBook(pair).then(function (orderbook) {
          callback(null, orderbook);
        });
      },
      (callback) => {
        exchanges['coinone'].fetchOrderBook(pair).then(function (orderbook) {
          callback(null, orderbook);
        });
      },
    ],
    (error, result) => {
      console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
      // console.log('result: ', result);
      if(error) {
        console.log('error:', error);
        return;
      }     
      

      let orders = {
        upbit: {
          topAskPrice: result[0].asks[0][0],
          topAskAmount: result[0].asks[0][1],
          topBidPrice: result[0].bids[0][0],
          topBidAmount: result[0].bids[0][1],
          maker: markets['upbit'].maker,
          taker: markets['upbit'].taker
        },

        bithumb: {
          topAskPrice: result[1].asks[0][0],
          topAskAmount: result[1].asks[0][1],
          topBidPrice: result[1].bids[0][0],
          topBidAmount: result[1].bids[0][1],
          maker: markets['bithumb'].maker,
          taker: markets['bithumb'].taker
        },

        coinone: {
          topAskPrice: result[2].asks[0][0],
          topAskAmount: result[2].asks[0][1],
          topBidPrice: result[2].bids[0][0],
          topBidAmount: result[2].bids[0][1],
          maker: markets['coinone'].maker,
          taker: markets['coinone'].taker
        }
    }
      // console.log(orders);
      // res.send(orders);
      res.json(orders);
      console.log(orders);
      // res.json(`@@@@@@@@@@@@@@@@@@@@@@@@`);

      for(let i = 0; i<orders.length; i++) {
        for(let j = i+1; j<orders.length; j++) {
          let diff = orders[i].topAskPrice - orders[j].topBidPrice;
          if(1000 < diff) {
            let minAmount = Math.min(orders[i].topAskAmount, orders[j].topBidAmount);

            // minAmount 만큼 수량으로 거래 요청
            // requestTrade 1 i거래소에서 매수
            // requestTrade 2 j거래소에서 매도

            let askResult = orders[i].topAskPrice * minAmount * (1 - orders[i].taker);
            let bidResult = orders[j].topBidPrice * minAmount * (1 - orders[j].taker);

            console.log("##### Traded #####");
            console.log('Result: ', askResult - bidResult);
          }

          diff = orders[j].topAskPrice - orders[i].topBidPrice;
          if(1000 < diff) {
            let minAmount = Math.min(orders[j].topAskAmount, orders[i].topBidAmount);

            // minAmount 만큼 수량으로 거래 요청
            // requestTrade 1 j거래소에서 매수
            // requestTrade 2 i거래소에서 매도

            let askResult = orders[j].topAskPrice * minAmount * (1 - orders[j].taker);
            let bidResult = orders[i].topBidPrice * minAmount * (1 - orders[i].taker);

            console.log("##### Traded #####");
            console.log('Result: ', askResult - bidResult);
            
          }
        }
      }
      // res.json('aaaaaaa');
      console.log("##### response #####");
      // res.json(orders);
      

    }
  )
}
);


app.listen(8080, () => {
  console.log(`API Gateway listening on port 8080!`);
});
