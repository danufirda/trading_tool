const { dataAset } = require('./helper/function');
const fs = require('fs');
const { DateTime } = require('luxon');

async function main() {
    dataAset(5000);
}

main();