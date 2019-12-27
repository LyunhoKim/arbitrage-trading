'use strict';

const ccxt = require('ccxt');
const exchangesConfig = require('../config/exchangesConfig.json');

(async () => {
  const upbit = new ccxt['upbit'];
  upbit.apiKey = exchangesConfig.apiKey;
  upbit.secret = exchangesConfig.secret;
  upbit.options['createMarketBuyOrderRequiresPrice'] = false;
  // console.log(await upbit.loadMarkets());
  // console.log(await upbit.fetchBalance());
  const order = await upbit.createOrder ('BTC/KRW', 'market', 'buy', 0.0001, 8700000);
  // const order = await upbit.createOrder ('ETHBTC', 'market', 'buy', 0.01, 0.02011018);
  // const order = await upbit.createMarketBuyOrder('BTC/KRW', 870);
  // const order = await upbit.createMarketBuyOrder('ETH/BTC', 0.01 * 0.02011018);

  console.log(order);
}) ();
