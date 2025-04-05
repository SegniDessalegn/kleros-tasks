# 🏛️ Inheritance Smart Contract

This Solidity smart contract provides a decentralized solution for automated ownership transfer based on inactivity. Designed for secure digital inheritance, it ensures that a designated heir can claim ownership of assets if the original owner becomes inactive for a specified period (default: 30 days).

---

## 🚀 Features

- 👑 **Ownership Management**  
  The deployer is set as the `owner`, and a trusted `heir` can be designated to inherit ownership.

- ⏱️ **Inactivity-Based Ownership Transfer**  
  If the owner remains inactive for 30 days, the heir can claim ownership.

- 💸 **Secure Fund Withdrawal**  
  Owners can withdraw ETH from the contract at any time, resetting the inactivity timer.

- 🔄 **Heir Update Capability**  
  The owner can change the heir at any time.

- 🔐 **Access Control & Event Logging**  
  Role-based access control and detailed event logging ensure transparency and auditability.

---

## 📜 Smart Contract

### Contract Name: `Inheritance`

```solidity
pragma solidity >=0.4.22 <0.9.0;