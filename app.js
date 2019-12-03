'use strict';

const ccxt = require('ccxt');
const async = require('async');
const express = require('express');
const fs = require('fs');

const exchangesConfig = require('./config/exchangesConfig.json');
const asHtmlTable = require('./as-html-table');
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
    };

    let ordersArray = [];
    ordersArray.push({
        symbol: 'upbit',
        topAskPrice: result[0].asks[0][0],
        topAskAmount: result[0].asks[0][1],
        topBidPrice: result[0].bids[0][0],
        topBidAmount: result[0].bids[0][1],
        maker: markets['upbit'].maker,
        taker: markets['upbit'].taker
      });

      ordersArray.push({
        symbol: 'bithumb',
        topAskPrice: result[1].asks[0][0],
        topAskAmount: result[1].asks[0][1],
        topBidPrice: result[1].bids[0][0],
        topBidAmount: result[1].bids[0][1],
        maker: markets['bithumb'].maker,
        taker: markets['bithumb'].taker
      });

      ordersArray.push({
        symbol: 'coinone',
        topAskPrice: result[2].asks[0][0],
        topAskAmount: result[2].asks[0][1],
        topBidPrice: result[2].bids[0][0],
        topBidAmount: result[2].bids[0][1],
        maker: markets['coinone'].maker,
        taker: markets['coinone'].taker
      });
    
      
      
      
      let tradeTarget = [];
      for(let i = 0; i<ordersArray.length; i++) {
        for(let j = i+1; j<ordersArray.length; j++) {
          let diff = ordersArray[j].topBidPrice - ordersArray[i].topAskPrice;
          console.log(`diff: ${diff}, ${ordersArray[j].symbol} - ${ordersArray[i].symbol}`);
          if(1000 <= diff) {
            let minAmount = Math.min(ordersArray[i].topAskAmount, ordersArray[j].topBidAmount);

            // minAmount 만큼 수량으로 거래 요청
            // requestTrade 1 i거래소에서 매수
            // requestTrade 2 j거래소에서 매도

            let bidResult = ordersArray[j].topBidPrice * minAmount * (1 - ordersArray[j].taker);
            let askResult = ordersArray[i].topAskPrice * minAmount * (1 - ordersArray[i].taker);

            //예상 수익                    
            tradeTarget.push(`거래 시 예상 수익: ${bidResult - askResult}, 시세차: ${diff}, ${ordersArray[j].symbol}매수가(${ordersArray[j].topBidPrice}) - ${ordersArray[i].symbol}매도가(${ordersArray[i].topAskPrice}), 거래량${minAmount}`);
            console.log("##### Traded #####");
            console.log('Result: ', askResult - bidResult);
          }

          diff = ordersArray[i].topBidPrice - ordersArray[j].topAskPrice;
          console.log(`diff: ${diff}, ${ordersArray[i].symbol} - ${ordersArray[j].symbol}`);
          if(1000 <= diff) {
            let minAmount = Math.min(ordersArray[j].topAskAmount, ordersArray[i].topBidAmount);

            // minAmount 만큼 수량으로 거래 요청
            // requestTrade 1 j거래소에서 매수
            // requestTrade 2 i거래소에서 매도

            let askResult = ordersArray[j].topAskPrice * minAmount * (1 - ordersArray[j].taker);
            let bidResult = ordersArray[i].topBidPrice * minAmount * (1 - ordersArray[i].taker);

            tradeTarget.push(`거래 시 예상 수익: ${bidResult - askResult}, 시세차: ${diff}, ${ordersArray[i].symbol}매수가(${ordersArray[i].topBidPrice}) - ${ordersArray[j].symbol}매도가(${ordersArray[j].topAskPrice}), 거래량${minAmount}`)
            console.log("##### Traded #####");
            console.log('Result: ', askResult - bidResult);
            
          }
        }
      }
      // res.json('aaaaaaa');
      console.log("##### response #####");      
      console.log(orders);
      console.log(tradeTarget);
      // res.send(orders);   
      // asHtmlTable(order, (html) => {
      //   res.send(html);
      // });
      let html = `
    <!DOCTYPE html>
<html>
<body>
`;
  let table = `<table border='1'>
                <tr>
                  <th>Exchanges</th>
                  <th>매수가</th>
                  <th>매수량</th>
                  <th>매도가</th>
                  <th>매도량</th>
                  <th>Maker</th>
                  <th>Taker</th>
                </tr>`;
                for(const key in orders) {
                  table += `<tr>                  
                <td>${key}</td>
                <td>${orders[key].topBidPrice}</td>
                <td>${orders[key].topBidAmount}</td>
                <td>${orders[key].topAskPrice}</td>
                <td>${orders[key].topAskAmount}</td>
                <td>${orders[key].taker}</td>
                <td>${orders[key].maker}</td>

              </tr>`;

                }
                
  
  html += table;
  for(const key in tradeTarget) {
    html += `<h6>${tradeTarget[key]}</h6>`;
  }
  html += `</table></body>
  </html>`;
      res.send(html)
      console.log(html);
    }
  )
});

app.get('/upbitbot', (req, res) => {
  console.log('get');
  fs.readFile('./upbitBot.log', 'utf8', function(error, data) { 
    if(error) {
      res.send(error);
    } else {      
      res.send(data);
    }
  });
});

app.get('/bitbot', (req, res) => {
  console.log('get');
  fs.readFile('./bitbot.log', 'utf8', function(error, data) { 
    if(error) {
      res.send(error);
    } else {      
      res.send(data);
    }
  });
});



app.listen(8080, () => {
  console.log(`API Gateway listening on port 8080!`);
});
