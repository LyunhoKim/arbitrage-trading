'use strict';

const ccxt = require('ccxt');

(async () => {
  const upbit = new ccxt['upbit'];
  upbit.apiKey = 'JZbKMEuTsL0BcbbJeIcAabPu7QcA5CS0MT7lXdYK';
  upbit.secret = 'KVgdCkF2OoeJpWKNYsdZn9poZKUxyLDoy3WFGxjT';
  upbit.options['createMarketBuyOrderRequiresPrice'] = true;
  // console.log(upbit.has);
  // console.log(await upbit.fetchBalance());
  const order = await upbit.createOrder ('BTC/KRW', 'market', 'buy', 0.001, 9000000);
  console.log(order);
}) ();
