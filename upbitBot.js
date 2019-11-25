'use strict';

const ccxt = require('ccxt');
const async = require('async');
const fs = require('fs');


const upbitInfo = {
  id: "upbit",
  info: {
      apiKey: "aaa",
      secret: "bbb",
      enableRateLimit: true
  }
};


// const pairs = require('pairs.json');
const pair = 'BTC/KRW';


let upbit;
let KRWMarkets;
let BTCMarkets;


// asks 매도
// bids 매수



// const main = async () => {
//   // 각 거래소 별 오더북 조회
//   async.parallel(
//     [
//       (callback) => {
//         exchanges['upbit'].fetchOrderBook(pair).then(function (orderbook) {
//           callback(null, orderbook);
//         });
//       },      
//     ],
//     (error, result) => {
//       console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
//       // console.log('result: ', result);
//       if(error) {
//         console.log('error:', error);
//         return;
//       }     
      

//       let orders = {
//         upbit: {
//           topAskPrice: result[0].asks[0][0],
//           topAskAmount: result[0].asks[0][1],
//           topBidPrice: result[0].bids[0][0],
//           topBidAmount: result[0].bids[0][1],
//           maker: markets['upbit'].maker,
//           taker: markets['upbit'].taker
//         },

//         bithumb: {
//           topAskPrice: result[1].asks[0][0],
//           topAskAmount: result[1].asks[0][1],
//           topBidPrice: result[1].bids[0][0],
//           topBidAmount: result[1].bids[0][1],
//           maker: markets['bithumb'].maker,
//           taker: markets['bithumb'].taker
//         },

//         coinone: {
//           topAskPrice: result[2].asks[0][0],
//           topAskAmount: result[2].asks[0][1],
//           topBidPrice: result[2].bids[0][0],
//           topBidAmount: result[2].bids[0][1],
//           maker: markets['coinone'].maker,
//           taker: markets['coinone'].taker
//         }
//     };

//     let ordersArray = [];
//     ordersArray.push({
//         symbol: 'upbit',
//         topAskPrice: result[0].asks[0][0],
//         topAskAmount: result[0].asks[0][1],
//         topBidPrice: result[0].bids[0][0],
//         topBidAmount: result[0].bids[0][1],
//         maker: markets['upbit'].maker,
//         taker: markets['upbit'].taker
//       });

//       ordersArray.push({
//         symbol: 'bithumb',
//         topAskPrice: result[1].asks[0][0],
//         topAskAmount: result[1].asks[0][1],
//         topBidPrice: result[1].bids[0][0],
//         topBidAmount: result[1].bids[0][1],
//         maker: markets['bithumb'].maker,
//         taker: markets['bithumb'].taker
//       });

//       ordersArray.push({
//         symbol: 'coinone',
//         topAskPrice: result[2].asks[0][0],
//         topAskAmount: result[2].asks[0][1],
//         topBidPrice: result[2].bids[0][0],
//         topBidAmount: result[2].bids[0][1],
//         maker: markets['coinone'].maker,
//         taker: markets['coinone'].taker
//       });
    
      
      
      
//       let tradeTarget = [];
//       for(let i = 0; i<ordersArray.length; i++) {
//         for(let j = i+1; j<ordersArray.length; j++) {
//           let diff = ordersArray[j].topBidPrice - ordersArray[i].topAskPrice;
//           console.log(`diff: ${diff}, ${ordersArray[j].symbol} - ${ordersArray[i].symbol}`);
//           if(2000 <= diff) {
//             let minAmount = Math.min(ordersArray[i].topAskAmount, ordersArray[j].topBidAmount);

//             // minAmount 만큼 수량으로 거래 요청
//             // requestTrade 1 i거래소에서 매수
//             // requestTrade 2 j거래소에서 매도

//             let bidResult = ordersArray[j].topBidPrice * minAmount * (1 - ordersArray[j].taker); // 수수료반영된 매도 원화금액
//             let askedFee = ordersArray[i].topAskPrice * minAmount * ordersArray[i].taker; // 매수한 후 수수료

//             //예상 수익                    
//             tradeTarget.push(`${getTimeStamp()}, 예상수익:${(bidResult - askedFee).toFixed(3)},\t 시세차:${diff}, ${ordersArray[j].symbol}매수가:${ordersArray[j].topBidPrice}, ${ordersArray[i].symbol}매도가:${ordersArray[i].topAskPrice}, 거래량:${minAmount}<br>`);
//             console.log("##### Traded #####");
//             console.log('Result: ', bidResult - askedFee);
//           }

//           diff = ordersArray[i].topBidPrice - ordersArray[j].topAskPrice;
//           console.log(`diff: ${diff}, ${ordersArray[i].symbol} - ${ordersArray[j].symbol}`);
//           if(2000 <= diff) {
//             let minAmount = Math.min(ordersArray[j].topAskAmount, ordersArray[i].topBidAmount);

//             // minAmount 만큼 수량으로 거래 요청
//             // requestTrade 1 j거래소에서 매수
//             // requestTrade 2 i거래소에서 매도

//             let askFee = ordersArray[j].topAskPrice * minAmount * ordersArray[j].taker;
//             let bidResult = ordersArray[i].topBidPrice * minAmount * (1 - ordersArray[i].taker);

//             tradeTarget.push(`${getTimeStamp()}, 예상수익:${(bidResult - askFee).toFixed(3)},\t 시세차:${diff}, ${ordersArray[i].symbol}매수가:${ordersArray[i].topBidPrice}, ${ordersArray[j].symbol}매도가:${ordersArray[j].topAskPrice}, 거래량:${minAmount}<br>`)
//             console.log("##### Traded #####");
//             console.log('Result: ', bidResult - askFee);
            
//           }
//         }
//       }
//       // res.json('aaaaaaa');
//       console.log("##### response #####");      
//       console.log(orders);
//       console.log(tradeTarget);
      
//       for(let i=0; i<tradeTarget.length; i++) {
//         fs.appendFile('trigger-log.log', tradeTarget[i], 'utf8', (error, data) => {
//           if(error)
//             console.log(`file writing error`);
//           else
//           console.log(`file writing success`);
//         });
//       }
      
//     }
//   )

//   setTimeout(main, 10000);
// };

(async function getMarketInfo() {
  // 마켓 정보 조회

  upbit = new ccxt[upbitInfo.id](upbitInfo.info);
  let markets = await upbit.loadMarkets();
  markets = Object.values(markets);
  KRWMarkets = markets.filter(pair => pair.symbol.includes("/KRW"));
  BTCMarkets = markets.filter(pair => pair.symbol.includes("/BTC"));

  console.log('#####################################', KRWMarkets); 
  console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$', BTCMarkets); 

  // setTimeout(main, 5000);
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


