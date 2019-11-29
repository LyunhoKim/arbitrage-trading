'use strict';

const ccxt = require('ccxt');

(async () => {
  const upbit = new ccxt['upbit'];
  upbit.apiKey = '';
  upbit.secret = '';
  console.log(upbit.has);
  // console.log(await upbit.fetchBalance());
}) ();
