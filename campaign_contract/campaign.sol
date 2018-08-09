pragma solidity ^0.4.17;

contract Campaign {
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
    }
    address public manager;
    address[] private approvers;
    uint public min_contribution;
    uint public min_2b_approver;
    Request[] public requests;
    
    constructor(uint min_contrib, uint min_approver) public {
        manager = msg.sender;
        min_contribution = min_contrib;
        min_2b_approver = min_approver;
    }
    
    function contribute() public payable {
        require(msg.value > min_contribution);
        if(msg.value >= min_2b_approver && msg.sender != manager) {
            approvers.push(msg.sender);
        }
    }
    
    function getApprovers() public view returns(address[]){
        require(msg.sender == manager);
        return approvers;
    }
    
    function createRequest(string description, uint value, address recipient) public restricted {
        Request new_request = Request({
            description: description, 
            value: value, 
            recipient: recipient, 
            complete: false});
            
        requests.push(new_request);
    }
    
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
}
