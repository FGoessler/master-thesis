pragma solidity ^0.4.8;

contract Mediator {
  address public serviceConsumer;
  address public serviceProvider;
  uint public costPerRequest;
  uint public serviceConsumerFunds;
  uint public serviceProviderFunds;
  uint public terminationTimeout;
  uint public tokenRedemptionTimeout;

  uint public activeTokenId;
  uint public soonExpiringTokenId;
  uint public soonExpiringTokenIdTimeout;

  mapping (uint => uint) public redeemedTokenIds; // id => amountPayed
  uint public terminationStartedAt; // 0 = not started
  bool public terminated;

  event Error(uint8 code);
  event Redeemed(uint sum);
  event Payout(uint sum);

  function Mediator(address _serviceProvider, uint _initialTokenId, uint _costPerRequest, uint _terminationTimeout, uint _tokenRedemptionTimeout) { // Constructor
    serviceConsumer = msg.sender;
    serviceProvider = _serviceProvider;
    activeTokenId = _initialTokenId;
    serviceConsumerFunds = 0;
    serviceProviderFunds = 0;
    terminationStartedAt = 0;
    costPerRequest = _costPerRequest;
    terminationTimeout = _terminationTimeout;
    tokenRedemptionTimeout = _tokenRedemptionTimeout;
    terminated = false;
  }

  function depositForServiceConsumer() payable public {
    if (terminated) { Error(1); return; }
    if (msg.sender != serviceConsumer) { Error(3); return; }

    serviceConsumerFunds = serviceConsumerFunds + msg.value;
  }

  function payoutForServiceProvider() public {
    if (terminated) { Error(1); return; }
    if (msg.sender != serviceProvider) { Error(2); return; }
    if (serviceProviderFunds == 0) { return; }

    uint amount = serviceProviderFunds;
    serviceProviderFunds = 0;
    if (amount > 0) {
      if(!serviceProvider.send(amount)) {
        throw;
      }
    }

    Payout(amount);
  }

  function redeemToken(uint numRequests, bytes32 hash, uint8 v, bytes32 r, bytes32 s) public {
    if (terminated) { Error(1); return; }
    if (msg.sender != serviceProvider) { Error(2); return; }
    if (now < soonExpiringTokenIdTimeout) { Error(30); return; }
    if (soonExpiringTokenId == 0) { Error(39); return; }
    
    bytes32 computedHash = sha256(serviceConsumer, soonExpiringTokenId, this, numRequests);
    if (computedHash != hash) { Error(4); return; }
    if(ecrecover(hash, v, r, s) != serviceConsumer) { Error(4); return; }

    uint amount = costPerRequest * numRequests;
    if (amount > serviceConsumerFunds) { Error(34); return; }

    redeemedTokenIds[soonExpiringTokenId] = amount;
    soonExpiringTokenId = 0;
    soonExpiringTokenIdTimeout = 0;
    serviceConsumerFunds = serviceConsumerFunds - amount;
    serviceProviderFunds = serviceProviderFunds + amount;

    Redeemed(amount);
  }

  function startTokenRedemption(uint newTokenID) public {
    if (terminated) { Error(1); return; }
    if (msg.sender != serviceProvider) { Error(2); return; }
    if (newTokenID == activeTokenId) { Error(31); return; }  // do not allow current token id as the new one
    if (redeemedTokenIds[newTokenID] > 0) { Error(33); return; }  // ID was already used once
    if (soonExpiringTokenId != 0) { Error(32); return; }  // another token redemption is already in progress

    soonExpiringTokenId = activeTokenId;
    soonExpiringTokenIdTimeout = now + tokenRedemptionTimeout;
    if (terminationStartedAt == 0) {
      activeTokenId = newTokenID;
    } else {
      activeTokenId = 0;
    }
  }

  function startCloseThroughServiceConsumer() public {
    if (terminated) { Error(1); return; }
    if (msg.sender != serviceConsumer) { Error(3); return; }
    terminationStartedAt = now;
  }

  function finalizeCloseThroughServiceConsumer() public {
    if (terminated) { Error(1); return; }
    if (msg.sender != serviceConsumer) { Error(3); return; }
    if (terminationStartedAt == 0) { Error(40); return; }
    if (terminationStartedAt + terminationTimeout > now) { Error(41); return; }

    uint amountP = serviceProviderFunds;
    serviceProviderFunds = 0;
    if (amountP > 0) {
      if(!serviceProvider.send(amountP)) {
        throw;
      }
    }
    uint amountC = serviceConsumerFunds;
    serviceConsumerFunds = 0;
    if (amountC > 0) {
      if(!serviceConsumer.send(amountC)) {
        throw;
      }
    }

    terminated = true;
  }

  function closeThroughServiceProvider() public {
    if (terminated) { Error(1); return; }
    if (msg.sender != serviceProvider) { Error(2); return; }

    uint amountP = serviceProviderFunds;
    serviceProviderFunds = 0;
    if (amountP > 0) {
      if(!serviceProvider.send(amountP)) {
        throw;
      }
    }
    uint amountC = serviceConsumerFunds;
    serviceConsumerFunds = 0;
    if (amountC > 0) {
      if(!serviceConsumer.send(amountC)) {
        throw;
      }
    }

    terminated = true;
  }

}
