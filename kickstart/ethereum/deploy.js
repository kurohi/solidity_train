const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const compiled_factory = require('./build/CampaignFactory.json');

const provider = new HDWalletProvider(
    'approve viable broken swim appear tent what peace wedding green pitch bomb',
    'https://rinkeby.infura.io/v3/989e09c90ecb4f68a1c8ab2dc4869bd1'
);
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy from account', accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(compiled_factory.interface))
          .deploy({ data: '0x' + compiled_factory.bytecode })
          .send({ gas: '2000000', from: accounts[0] });

    console.log('Contract deployed to', result.options.address);
};
deploy();
