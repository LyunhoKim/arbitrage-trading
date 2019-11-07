'use strict';

const ccxt = require('ccxt');
const async = require('async');

const exchangesConfig = require('./config/exchangesConfig.json');
// const pairs = require('pairs.json');
const pair = 'BTC/KRW';


let exchanges = {};

// asks 매도
// bids 매수



(async () => {
  console.log("1111111111111111111111111111111111");
  for (let exchange of exchangesConfig) {

    console.log(exchange.id);
    exchanges[exchange.id] = new ccxt[exchange.id](exchange.info);

    let markets = await exchanges[exchange.id].loadMarkets(pair);
    // console.log('#####################################', markets[pair]);


    // let orderBook = await exchanges[exchange.id].fetchOrderBook(pair);
    // console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$', orderBook);       

  }
  async.parallel(
    [
      (callback) => {
        exchanges['upbit'].fetchOrderBook(pair).then(function (orderbook) {
          console.log(orderbook);
          callback(null, orderbook);
        });
      },
      (callback) => {
        exchanges['bithumb'].fetchOrderBook(pair).then(function (orderbook) {
          // console.log(orderbook);
          callback(null, orderbook);
        });
      },
      (callback) => {
        exchanges['coinone'].fetchOrderBook(pair).then(function (orderbook) {
          // console.log(orderbook);
          callback(null, orderbook);
        });
      },
    ],
    (error, result) => {
      console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
      // console.log('result: ', result);
      console.log('error:', error);

      let orders = [];
      orders['upbit'] = {
        firstAskPrice: result[0].asks[0][0],
        firstAskAmount: result[0].asks[0][1],
        firstBidPrice: result[0].bids[0][0],
        firstBidAmount: result[0].bids[0][1],
      };

      orders['bithumb'] = {
        firstAskPrice: result[1].asks[0][0],
        firstAskAmount: result[1].asks[0][1],
        firstBidPrice: result[1].bids[0][0],
        firstBidAmount: result[1].bids[0][1],
      };

      orders['coinone'] = {
        firstAskPrice: result[2].asks[0][0],
        firstAskAmount: result[2].asks[0][1],
        firstBidPrice: result[2].bids[0][0],
        firstBidAmount: result[2].bids[0][1],
      };


      console.log(orders);

    }
  );
})();


// (() => {
//     async.parallel([
//         function (callback) {
//             callback(null, 'resultA');
//         },

//         function (callback) {
//             callback(null, 'resultB');
//         },

//         function (callback) {
//             callback(null, 'resultC');
//         }
//     ],
//         function (err, results) {
//             if (err) console.log(err);
//             console.log(results)
//             // handle resultC
//         }
//     );
// }) ()



// (() => {
//     // console.log("########################test");

//     console.log("222222222222222222222222222222222");

// })();

// const getOrderBook = (exchange, pair, callback) => {
//     return exchange.fetchOrderBook(pair);
// }

// function generateGettingOrderBookTask() {
//     let task = [];
//     for(let exchange of exchanges) {
//         task.push(getOrderBook(exchange, pair));
//     }
//     return task;
// }




// (() => { 
//     console.log("33333333333333333333333333333333333333");
//     // console.log(exchanges);

// // 오더북 로딩 (병렬)


// // 조건 검사
// // 

// // 거래 요청 (병렬)

// }) ();




// const ccxt = require('ccxt');

// (async () => {
//     const upbit = new ccxt.upbit()
//     await upbit.loadMarkets()
//     // const orderBook = await fetchLOrderBook('BTC/KRW');
//     console.log(upbit.id, upbit.markets['BTC/KRW']);
//     // upbit.fetchL2OrderBook

// }) ();