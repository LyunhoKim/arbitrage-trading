const ccxt = require('ccxt');

(async () => {
    const upbit = new ccxt.upbit()
    await upbit.loadMarkets()
    const orderBook = await fetchLOrderBook('BTC/KRW');
    console.log(upbit.id, orderBook);
    // upbit.fetchL2OrderBook
    
}) ()

// (async () => {
//     const bithumb = new ccxt.bithumb()
//     await bithumb.loadMarkets()
//     console.log(bithumb.id, bithumb.market('BTC/KRW'));

// }) ()