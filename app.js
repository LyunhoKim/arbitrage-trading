'use strict';

const ccxt = require('ccxt');
const async = require('async');

const exchangesConfig = require('./config/exchangesConfig.json');
// const pairs = require('pairs.json');
const pair = 'BTC/KRW';


let exchanges = {};

(() => {
    console.log("########################test");
    console.log(exchangesConfig);
})();

(async () => {
    for (let exchange of exchangesConfig) {
        
        console.log(exchange.id);
        exchanges[exchange.id] = new ccxt[exchange.id](exchange.info);

        let markets = await exchanges[exchange.id].loadMarkets (pair);
        console.log('#####################################', markets[pair]);


        // let orderBook = await exchanges[exchange.id].fetchOrderBook(pair);
        // console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$', orderBook);

    }
}) ();

const getOrderBook = (exchange, pair, callback) => {
    return exchange.fetchOrderBook(pair);
}

function generateGettingOrderBookTask() {
    let task = [];
    for(let exchange of exchanges) {
        task.push(getOrderBook(exchange, pair));
    }
    return task;
}




(() => { 
    console.log(exchanges);

// 오더북 로딩 (병렬)
    async.parallel(
        [
            (callback) => {
                const orderbook = exchanges['upbit'].fetchOrderBook('BTC/KRW');
                if(orderbook)
                    callback(null, orderbook);
                else
                    callback('fetch orderbook error');
            },
            (callback) => {
                const orderbook = exchanges['bithumb'].fetchOrderBook('BTC/KRW');
                if(orderbook)
                    callback(null, orderbook);
                else
                    callback('fetch orderbook error');
            },
        ],
        (error, result) => {
            console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
            console.log(result);
        }
    );

// 조건 검사
// 

// 거래 요청 (병렬)

}) ();




// const ccxt = require('ccxt');

// (async () => {
//     const upbit = new ccxt.upbit()
//     await upbit.loadMarkets()
//     // const orderBook = await fetchLOrderBook('BTC/KRW');
//     console.log(upbit.id, upbit.markets['BTC/KRW']);
//     // upbit.fetchL2OrderBook
    
// }) ();