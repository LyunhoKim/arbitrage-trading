'use strict';

const fs = require('fs');
const path = require('path');


/*******************************************************************************
 * Define SQL queries
 ******************************************************************************/
const queries = {};

let dir = __dirname;
let files = fs.readdirSync(dir);

files.forEach(file => {
    if(path.extname(file) == '.sql') {
        let keyName = path.basename(file, path.extname(file));
        queries[keyName] = fs.readFileSync(path.join(dir, path.basename(file)), 'utf8');  
    }
});

module.exports = queries;