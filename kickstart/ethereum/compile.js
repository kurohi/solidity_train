const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

const build_path = path.resolve(__dirname, 'build');
fs.removeSync(build_path);

const campaign_contract_path = path.resolve(__dirname, 'contracts', 'campaign.sol');
const source = fs.readFileSync(campaign_contract_path, 'utf-8');

const output = solc.compile(source, 1).contracts;

fs.ensureDirSync(build_path);

for (let contract in output) {
	fs.outputJsonSync(
		path.resolve(build_path, contract.replace(':','')+'.json'),
		output[contract]
	);
}
