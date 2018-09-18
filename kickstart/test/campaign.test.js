const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiled_factory = require('../ethereum/build/CampaignFactory.json');
const compiled_campaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaign_address;
let campaign;

beforeEach(async() => {
    accounts = await web3.eth.getAccounts();
    factory = await new web3.eth.Contract(JSON.parse(compiled_factory.interface))
        .deploy({data: compiled_factory.bytecode})
        .send({from:accounts[0], gas:'1000000'});

    await factory.methods.createCampaign('10','100').send({from: accounts[0], gas:'1000000'});

    //Getting the first element of the array resturned from the function
    [campaign_address] = await factory.methods.getDeployedCampaigns().call();
    campaign = await new web3.eth.Contract(JSON.parse(compiled_campaign.interface), campaign_address);
});

describe('Campaigns', () => {
    it('factory and campaign deployed', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    it('check if the manager of the campaing is account0', async () => {
        const manager_address = await campaign.methods.manager().call();
        assert.equal(accounts[0], manager_address);
    });

    it('contribute as non-approver', async () => {
        await campaign.methods.contribute()
            .send({from:accounts[1], value:'11', gas:'1000000'});
        const backers = await campaign.methods.getContributors().call({from:accounts[0]});
        assert.equal(backers[0], accounts[1]);
        const n_approvers = await campaign.methods.approvers_count().call();
        assert.equal(n_approvers, 0);
        const contribution = await campaign.methods.getContributions(accounts[1]).call({from:accounts[0]});
        assert.equal(contribution, 11);
    });

    it('contribute as an approver', async () => {
        await campaign.methods.contribute()
            .send({from:accounts[2], value:'200', gas:'1000000'});
        const backers = await campaign.methods.getContributors().call({from:accounts[0]});
        assert.equal(backers[0], accounts[2]);
        const n_approvers = await campaign.methods.approvers_count().call();
        assert.equal(n_approvers,1);
        const is_approver = await campaign.methods.isApprover(accounts[2]).call({from:accounts[0]});
        assert.equal(is_approver, true);
    });

    it('requesting minimal contribution', async () => {
        try{
            await campaign.methods.contribute()
                .send({from:accounts[1],value:'1',gas:'1000000'});
            assert(false);
        }catch (err){
            assert(err);
        }
    });

    it('create, approve and finalize a request', async () => {
        try{
            await campaign.methods.createRequest('123','123',accounts[0])
                .send({from:accounts[1], gas:'1000000'});
            assert(false);
        }catch (err){
            assert(true);
        }
        await campaign.methods.createRequest('test request', '100', accounts[0])
            .send({from:accounts[0], gas:'1000000'});
        await campaign.methods.createRequest('test request2', '101', accounts[0])
            .send({from:accounts[0], gas:'1000000'});
        const request = await campaign.methods.requests(0).call();
        assert.equal(request.value, 100);

        //adding approvers and approving requests
        for(i=1; i<9; i++){
            await campaign.methods.contribute()
                .send({from:accounts[i], value:'1000', gas:'1000000'});
            if(i<7){
                await campaign.methods.approveRequest(0)
                    .send({from:accounts[i], gas:'1000000'});
            }
            if(i<4){
                await campaign.methods.approveRequest(1)
                    .send({from:accounts[i], gas:'1000000'});
            }
        }

        //trying to approve without being an approver
        await campaign.methods.contribute()
            .send({from:accounts[9], value:'1000', gas:'1000000'});
        try{
            await campaign.methods.approveRequest(0)
                .send({from:accounts[9], gas:'1000000'});
            assert(false);
        }catch (err){
            assert(err);
        }

        //finalizing request
        await campaign.methods.finalizeRequest(0)
            .send({from:accounts[0], gas:'1000000'});
        const request_ok = await campaign.methods.requests(0).call();
        assert.equal(request_ok.complete, true);


        await campaign.methods.finalizeRequest(1)
            .send({from:accounts[0], gas:'1000000'});
        const request_fail = await campaign.methods.requests(1).call();
        assert.equal(request_fail.complete, false);


        try{
            await campaign.methods.finalizeRequest(10)
                .send({from:accounts[0], gas:'1000000'});
            assert(false);
        }catch(err){
            assert(true);
        }
        try{
            await campaign.methods.finalizeRequest(0)
                .send({from:accounts[0], gas:'1000000'});
            assert(false);
        }catch(err){
            assert(true);
        }

    });

    it('allows a manager to make a payment request', async () => {
    	  await campaign.methods.createRequest('Buy batteries', '100', accounts[1])
            .send({from:accounts[0], gas:'1000000'});

        const request = await campaign.methods.requests(0).call();
        assert.equal('Buy batteries', request.description);
    });
});
