'use strict';

// {
//     upbit: {
//       topAskPrice: 10122000,
//       topAskAmount: 0.001611,
//       topBidPrice: 10114000,
//       topBidAmount: 1.07853875,
//       maker: 0.0005,
//       taker: 0.0005
//     },
//     bithumb: {
//       topAskPrice: 10124000,
//       topAskAmount: 2,
//       topBidPrice: 10115000,
//       topBidAmount: 2.0211,
//       maker: 0.0025,
//       taker: 0.0025
//     },
//     coinone: {
//       topAskPrice: 10123000,
//       topAskAmount: 0.6102,
//       topBidPrice: 10116000,
//       topBidAmount: 0.4369,
//       maker: 0.001,
//       taker: 0.001
//     }
// }


module.exports = (json, callback) => {
  console.log("teste!!!!!!!!!!!!!!!!");
  
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
                for(var element in json) {
                  table += `<tr>
                <td>${element.topBidPrice}</td>
              </tr>`;

                }
  
  html += table;
  html += `</body>
  </html>`;
  // callback(html);
  callback("tetetestsetse");
  

}