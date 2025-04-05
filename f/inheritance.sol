// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Inheritance {
    address public owner;
    address public heir;
    uint256 public lastActivity;
    uint256 public constant INACTIVITY_PERIOD = 30 days;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event HeirChanged(address indexed previousHeir, address indexed newHeir);
    event Withdrawal(address indexed recipient, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyHeir() {
        require(msg.sender == heir, "Only heir can call this function");
        _;
    }

    constructor(address _heir) payable {
        require(_heir != address(0), "Heir cannot be zero address");
        owner = msg.sender;
        heir = _heir;
        lastActivity = block.timestamp;
    }

    function withdraw(uint256 amount) external onlyOwner {
        lastActivity = block.timestamp;

        if (amount > 0) {
            require(address(this).balance >= amount, "Insufficient balance");
            payable(owner).transfer(amount);
            emit Withdrawal(owner, amount);
        }
    }

    function claimOwnership() external onlyHeir {
        require(block.timestamp > lastActivity + INACTIVITY_PERIOD, "Inactivity period not passed");
        
        emit OwnershipTransferred(owner, heir);
        owner = heir;
        lastActivity = block.timestamp;
    }

    function changeHeir(address newHeir) external onlyOwner {
        require(newHeir != address(0), "New heir cannot be zero address");
        emit HeirChanged(heir, newHeir);
        heir = newHeir;
    }

    receive() external payable {}
}