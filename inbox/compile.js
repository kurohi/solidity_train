const path = require('path');
const fs = require('fs');
const solc = require('solc');

const inbox_path = path.resolve(__dirname, 'contracts', 'Inbox.sol');
const source = fs.readFileSync(inbox_path, 'utf8');

module.exports = solc.compile(source,1).contracts[':Inbox'];
