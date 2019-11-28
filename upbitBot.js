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
    async.parallel(
      [
        (callback) => {
          upbit.fetchOrderBook(symbols[idx].krw, 1).then(function (orderbook) {
            callback(null, orderbook);
          });
        },
        (callback) => {
          upbit.fetchOrderBook(symbols[idx].btc, 1).then(function (orderbook) {
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
        symbols[idx].bitcoinTicker = bitcoin;
        symbols[idx].krwOrder = {
          topAskPrice: result[0].asks[0][0],
          topAskAmount: result[0].asks[0][1],
          topBidPrice: result[0].bids[0][0],
          topBidAmount: result[0].bids[0][1]
        }
        symbols[idx].btcOrder = {
          topAskPrice: result[1].asks[0][0],
          topAskPriceKrw: result[1].asks[0][0] * symbols[idx].bitcoinTicker,
          topAskAmount: result[1].asks[0][1],
          topBidPrice: result[1].bids[0][0],
          topBidPriceKrw: result[1].bids[0][0] * symbols[idx].bitcoinTicker,
          topBidAmount: result[1].bids[0][1]
        }
        // console.log(symbols[idx]);

        let diff = symbols[idx].btcOrder.topBidPriceKrw - symbols[idx].krwOrder.topAskPrice;
        if(0 < diff) {
          let minAmount = Math.min(symbols[idx].btcOrder.topBidAmount, symbols[idx].krwOrder.topAskAmount);
          let profit = diff * minAmount - symbols[idx].btcOrder.topBidPriceKrw * minAmount * symbols[idx].btcTaker
                                        - symbols[idx].krwOrder.topAskPrice * minAmount * symbols[idx].krwTaker;
          if(1 < profit ) {
            let result = `[${getTimeStamp()}] KRW->BTC ${symbols[idx].base}: ${profit.toFixed(1)}원\n`; 
            console.log(result);
            fs.appendFile('trigger-log.log', result, 'utf8', (error, data) => {
              if(error)
                console.log(`file writing error`);
              else
              console.log(`file writing success`);
            });
          }
        }
        diff = symbols[idx].krwOrder.topBidPrice - symbols[idx].btcOrder.topAskPriceKrw;
        if(0 < diff) {
          let minAmount = Math.min(symbols[idx].krwOrder.topBidAmount, symbols[idx].btcOrder.topAskAmount);
          let profit = diff * minAmount - symbols[idx].krwOrder.topBidPrice * minAmount * symbols[idx].krwTaker
                                        - symbols[idx].btcOrder.topAskPriceKrw * minAmount * symbols[idx].btcTaker;
          if(1 < profit ) {
            let result = `[${getTimeStamp()}] BTC->KRW ${symbols[idx].base}: ${profit.toFixed(1)}원\n`; 
            console.log(result);
            fs.appendFile('trigger-log.log', result, 'utf8', (error, data) => {
              if(error)
                console.log(`file writing error`);
              else
              console.log(`file writing success`);
            });
          }
        }
        
        setTimeout(main, 1000);        
      }      
    )  
  // }
  // async.parallel(
  //   [
  //     (callback) => {
  //       upbit.fetchOrderBook().then(function (orderbook) {
  //         callback(null, orderbook);
  //       });
  //     }
  //   ],
  //   (error, result) => {
  //     console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
  //     // console.log('result: ', result);
  //     if(error) {
  //       console.log('error:', error);
  //       return;
  //     }     
  //     console.log(result);
  //   }
  // );
      

  //     let orders = {
  //       upbit: {
  //         topAskPrice: result[0].asks[0][0],
  //         topAskAmount: result[0].asks[0][1],
  //         topBidPrice: result[0].bids[0][0],
  //         topBidAmount: result[0].bids[0][1],
  //         maker: markets['upbit'].maker,
  //         taker: markets['upbit'].taker
  //       },

  //       bithumb: {
  //         topAskPrice: result[1].asks[0][0],
  //         topAskAmount: result[1].asks[0][1],
  //         topBidPrice: result[1].bids[0][0],
  //         topBidAmount: result[1].bids[0][1],
  //         maker: markets['bithumb'].maker,
  //         taker: 0.0003
  //         // taker: markets['bithumb'].taker
  //       },

  //       coinone: {
  //         topAskPrice: result[2].asks[0][0],
  //         topAskAmount: result[2].asks[0][1],
  //         topBidPrice: result[2].bids[0][0],
  //         topBidAmount: result[2].bids[0][1],
  //         maker: markets['coinone'].maker,
  //         taker: markets['coinone'].taker
  //       }
  //   };

  //   let ordersArray = [];
  //   ordersArray.push({
  //       symbol: 'upbit',
  //       topAskPrice: result[0].asks[0][0],
  //       topAskAmount: result[0].asks[0][1],
  //       topBidPrice: result[0].bids[0][0],
  //       topBidAmount: result[0].bids[0][1],
  //       maker: markets['upbit'].maker,
  //       taker: markets['upbit'].taker
  //     });

  //     ordersArray.push({
  //       symbol: 'bithumb',
  //       topAskPrice: result[1].asks[0][0],
  //       topAskAmount: result[1].asks[0][1],
  //       topBidPrice: result[1].bids[0][0],
  //       topBidAmount: result[1].bids[0][1],
  //       maker: markets['bithumb'].maker,
  //       taker: markets['bithumb'].taker
  //     });

  //     ordersArray.push({
  //       symbol: 'coinone',
  //       topAskPrice: result[2].asks[0][0],
  //       topAskAmount: result[2].asks[0][1],
  //       topBidPrice: result[2].bids[0][0],
  //       topBidAmount: result[2].bids[0][1],
  //       maker: markets['coinone'].maker,
  //       taker: markets['coinone'].taker
  //     });
    
      
      
      
  //     let tradeTarget = [];
  //     for(let i = 0; i<ordersArray.length; i++) {
  //       for(let j = i+1; j<ordersArray.length; j++) {
  //         let diff = ordersArray[j].topBidPrice - ordersArray[i].topAskPrice;
  //         console.log(`diff: ${diff}, ${ordersArray[j].symbol} - ${ordersArray[i].symbol}`);
  //         if(2000 <= diff) {
  //           // let minAmount = Math.min(ordersArray[i].topAskAmount, ordersArray[j].topBidAmount);
  //           let minAmount = 0.01;

  //           // minAmount 만큼 수량으로 거래 요청
  //           // requestTrade 1 i거래소에서 매수
  //           // requestTrade 2 j거래소에서 매도            

  //           let bidTranFee = ordersArray[j].topBidPrice * minAmount * ordersArray[j].taker;
  //           let askTranFee = ordersArray[i].topAskPrice * minAmount * ordersArray[i].taker;

  //           const projectionProfit = (diff * minAmount - bidTranFee - askTranFee).toFixed(3);
  //           const profitString = projectionProfit > 0 ? `<font color="red">${projectionProfit}</font>` : projectionProfit;
  //           //예상 수익                    
  //           tradeTarget.push(`${getTimeStamp()}, 예상수익:${profitString},\t 시세차:${diff}, ${ordersArray[j].symbol}매수가:${ordersArray[j].topBidPrice}, ${ordersArray[i].symbol}매도가:${ordersArray[i].topAskPrice}, 거래량:${minAmount}<br>`);
  //           // console.log("##### Traded #####");
  //           // console.log('Result: ', askResult - bidResult);
  //         }

  //         diff = ordersArray[i].topBidPrice - ordersArray[j].topAskPrice;
  //         console.log(`diff: ${diff}, ${ordersArray[i].symbol} - ${ordersArray[j].symbol}`);
  //         if(2000 <= diff) {
  //           // let minAmount = Math.min(ordersArray[j].topAskAmount, ordersArray[i].topBidAmount);
  //           let minAmount = 0.01;

  //           // minAmount 만큼 수량으로 거래 요청
  //           // requestTrade 1 j거래소에서 매수
  //           // requestTrade 2 i거래소에서 매도

  //           let askTranFee = ordersArray[j].topAskPrice * minAmount * ordersArray[j].taker;
  //           let bidTranFee = ordersArray[i].topBidPrice * minAmount * ordersArray[i].taker;

  //           const projectionProfit = (diff * minAmount - bidTranFee - askTranFee).toFixed(3);
  //           const profitString = projectionProfit > 0 ? `<font color="red">${projectionProfit}</font>` : projectionProfit;

  //           tradeTarget.push(`${getTimeStamp()}, 예상수익:${profitString},\t 시세차:${diff}, ${ordersArray[i].symbol}매수가:${ordersArray[i].topBidPrice}, ${ordersArray[j].symbol}매도가:${ordersArray[j].topAskPrice}, 거래량:${minAmount}<br>`)
  //           // console.log("##### Traded #####");
  //           // console.log('Result: ', askResult - bidResult);
            
  //         }
  //       }
  //     }
  //     // res.json('aaaaaaa');
  //     console.log("##### response #####");      
  //     console.log(orders);
  //     console.log(tradeTarget);
      
  //     for(let i=0; i<tradeTarget.length; i++) {
  //       fs.appendFile('trigger-log.log', tradeTarget[i], 'utf8', (error, data) => {
  //         if(error)
  //           console.log(`file writing error`);
  //         else
  //         console.log(`file writing success`);
  //       });
  //     }
      
  //   }
  // )

  // setTimeout(main, 10000);
};

(async function getMarketInfo() {

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


