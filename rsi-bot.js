'use strict';

const db = require('./util/database');
const sql = require('./query');
const fs = require('fs');
const async = require('async');
const ccxt = require('ccxt');

const exchangesConfig = require('./config/exchangesConfig.json');
const slackConfig = require('./config/slack-config.json');

const RSI_TERM = 14; // 14 RSI
const RSI05M = 5;
const RSI15M = 15;
const RSI30M = 30;
const RSI60M = 60;
const orderAmount = 0.0002;

const rsi = (period) => {
  async.waterfall(
    [
      (callback) => {
        getPrice(period, callback);
      },
      (result, callback) => {
        selectPriceByPeriod(result, period, callback);
      },
      (data, callback) => {
        getRSI(data, callback);
      },
      (rsi, callback) => {
        if(period === 60 && 70 < rsi.RSI) {
          order('sell', rsi.lastPrice);
        } else if(period === 60 && rsi.RSI < 30) {
          order('buy', rsi.lastPrice);
        }
        callback(null, rsi);
      },
      (rsi, callback) => {
        insertRSI(rsi, period, callback);
      }
    ],
    (error, result) => {
      if(error) {
        const msg = `rsi() error: ${error}`;
        log(msg);
        return;
      } else {
        console.log(result);
      }
    }
  )
};

console.log(`rsi-bot startd`);
rsi(RSI05M); setInterval(rsi, 1000 * 60 * RSI05M, RSI05M); // 5분
rsi(RSI15M); setInterval(rsi, 1000 * 60 * RSI15M, RSI15M); // 15분
rsi(RSI30M); setInterval(rsi, 1000 * 60 * RSI30M, RSI30M); // 30분
rsi(RSI60M); setInterval(rsi, 1000 * 60 * RSI60M, RSI60M); // 60분

function insertRSI(rsi, period, callback) {
  db.insert({
    query: sql.insertRSI,
    params: {
      rsi: rsi.RSI,
      price: rsi.lastPrice,
      period      
    }
    },
    (error, result) => {
      if(error) {
        const msg = `insert error: ${error}`;
        callback(msg);
      } else {
        console.log(result);
        callback(null, result);
      }
    }
  )
};

function getPrice(period, callback) {
  db.select(
    {
      query: sql.selectPrices,
      params: {
        period: (RSI_TERM + 1) * period   // 데이터 개수는 RSI Term + 1 개가 필요함
      }
    },
    (error, result) => {
      if(error) {
        const msg = `select error: ${error}`;
        callback(msg);
      } else if (result.length < (RSI_TERM + 1) * period) {
        const msg = `not enough data: peride(${period}), data length(${result.length})`;
        callback(msg);
      }else {  
        callback(error, result);
      }
    }
  )
};

function selectPriceByPeriod(data, period, callback) {
  let validData = [];
  for(var i=0; i<data.length; i+=period) {
    validData.push(data[i].price);
  }  
  callback(null, validData);
};


function getRSI(data, callback) {
  let RSI = {
    U: 0,
    D: 0,
    AU: 0,
    AD: 0,
    RS: 0,
    RSI: 0
  };
  
  for(var i=0; i<data.length-1; i++) {
    const tmp = data[i] - data[i+1];
    if(tmp < 0)
      RSI.D += tmp; 
    else 
      RSI.U += tmp;
  }

  RSI.AU = RSI.U / RSI_TERM;
  RSI.AD = Math.abs(RSI.D) / RSI_TERM;
  RSI.RS = RSI.AU / RSI.AD;
  RSI.RSI = RSI.AU / (RSI.AU + RSI.AD);
  RSI.RSI = parseFloat((RSI.RSI * 100).toFixed(2));
  RSI.lastPrice = data[data.length-1];

  callback(null, RSI);
}

async function order(order, price) {
  const upbit = new ccxt['upbit'];
  upbit.apiKey = exchangesConfig.apiKey;
  upbit.secret = exchangesConfig.secret;
  upbit.options['createMarketBuyOrderRequiresPrice'] = true;

  const orderTran = await upbit.createOrder('BTC/KRW', 'market', order, orderAmount, price);
  console.log(orderTran);
  const resMsg = `거래단가: ${price}\n 거래금액: ${orderTran.info.price}\n 수수료: ${orderTran.info.reserved_fee}`;
  sendSlackMsg(resMsg);
};

function sendSlackMsg(msg) {
  var request = require('request');
  var options = {
    'method': 'POST',
    'url': `${slackConfig.baseUrl}/${slackConfig.token}`,
    'headers': {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"channel":"#upbit-rsi","text":msg,"username":"upbit-rsi","icon_emoji":":ghost:"})
  };

  request(options, function (error, response) { 
    if (error) throw new Error(error);
    console.log(response.body);
  });
}

/**
 * **********************************************************************
 *  UTILS
 * **********************************************************************
 */

function log(msg) {
  var msg = `${msg}\n<br>`;
  fs.appendFile('rsi-bot.log', msg, 'utf8', (error, data) => {});
}