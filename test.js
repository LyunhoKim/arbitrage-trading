'use strict';

const ccxt = require('ccxt');
const exchangesConfig = require('./config/exchangesConfig.json');

(async () => {
  const upbit = new ccxt['upbit'];
  upbit.apiKey = exchangesConfig.test.apiKey;
  upbit.secret = exchangesConfig.test.secret;
  upbit.options['createMarketBuyOrderRequiresPrice'] = false;
  // console.log(upbit.has);
  // console.log(await upbit.fetchBalance());
  // const order = await upbit.createOrder ('BTC/KRW', 'market', 'buy', 0.0001, 8700000);
  const order = await upbit.createOrder ('ETHBTC', 'market', 'buy', 0.01, 0.02011018);
  // const order = await upbit.createMarketBuyOrder('BTC/KRW', 870);
  // const order = await upbit.createMarketBuyOrder('ETH/BTC', 0.01 * 0.02011018);

  console.log(order);
}) ();
