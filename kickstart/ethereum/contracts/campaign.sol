pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] deployed_campaigns;
    
    constructor() public {
    }
    
    function createCampaign(uint min_contrib, uint min_approver) public {
        deployed_campaigns.push(new Campaign(min_contrib, min_approver, msg.sender));
    }
    
    function getDeployedCampaigns() public view returns(address[]){
        return deployed_campaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        mapping(address=>bool) has_voted;
        uint approves_count;
    }
    address public manager;
    mapping(address=>bool) private approvers;
    uint public approvers_count;
    address[] private bankers_list;
    mapping(address=>uint) private contribution;
    uint public min_contribution;
    uint public min_2b_approver;
    Request[] public requests;
    
    constructor(uint min_contrib, uint min_approver, address creator) public {
        manager = creator;
        min_contribution = min_contrib;
        min_2b_approver = min_approver;
        approvers_count = 0;
    }
    
    function contribute() public payable {
        require(msg.value > min_contribution);
        if(msg.value >= min_2b_approver && msg.sender != manager) {
            approvers[msg.sender] = true;
            approvers_count++;
        }
        bankers_list.push(msg.sender);
        contribution[msg.sender] = msg.value;
    }
    
    function getContributors() public view restricted returns(address[]){
        return bankers_list;
    }

    function isApprover(address requester) public view restricted returns(bool){
	return approvers[requester];
    }
    
    function getContributions(address contributor) public view restricted returns(uint) {
        return contribution[contributor];
    }

    function createRequest(string description, uint value, address recipient) public restricted {
        Request memory new_request = Request({
            description: description, 
            value: value, 
            recipient: recipient, 
            complete: false,
            approves_count: 0
        });
            
        requests.push(new_request);
    }
    
    function approveRequest(uint request_index) public {
        require(approvers[msg.sender]);
        require(request_index < requests.length);
        Request storage target_request = requests[request_index];
        
        require(!target_request.complete);
        require(!target_request.has_voted[msg.sender]);
        
        target_request.approves_count++;
        target_request.has_voted[msg.sender] = true;
    }
    
    function finalizeRequest(uint request_index) public restricted {
        require(request_index < requests.length);
        Request storage target_request = requests[request_index];
        require(!target_request.complete);
        
        if(target_request.approves_count > approvers_count/2){
            target_request.recipient.transfer(target_request.value);
            target_request.complete = true;
        }
    }
    
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
}

