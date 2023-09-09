let isConnected = false;
let stakingContract;
let tokenContract;
let daysSinceStaked;

const stakingContractAddress = '0xEB0a4E999DC0AB2cFD1b39202B3BD6973c0989DC';
const stakingContractABI = [
  { "inputs": [], "name": "stake", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "payable", "type": "function" },
  { "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "startUnstake", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "unstake", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "checkRewards", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "claimRewards", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "getMetadata", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "dayCounter", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getStakedAmounts", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getWinningAmounts", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "retrievePastData", "outputs": [ { "internalType": "address[7]", "name": "", "type": "address[7]" }, { "internalType": "uint256[7]", "name": "", "type": "uint256[7]" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [ { "internalType": "uint256", "name": "_tokenId", "type": "uint256" } ], "name": "getUnstakeTimestampByNFTId", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }
    ];

const tokenContractAddress = '0x5A057E35f8Bb1e896853a8dB40ac002153ac9a4A';
const tokenContractABI = [
  {"inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "approve", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [], "name": "getNextTokenId", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "owner", "type": "address"}], "name": "getTokensOfOwner","outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}], "stateMutability": "view", "type": "function"}
];


// Changes connect button text to the user's metamask connected account
function connectButtonTextToUserAccount(account) {
    const ethereumButtonIn = document.querySelector('.ConnectButtonIn');
    ethereumButtonIn.style.fontSize = '16px';
    ethereumButtonIn.innerHTML = account.substring(2,6) + '...' + account.substring(36,42);
}


function handleChainChanged(chainId) {
  // We recommend reloading the page, unless you must do otherwise.
  window.location.reload();
}
window.ethereum.on('chainChanged', handleChainChanged);


async function getAccount() {
  const cantoNetworkId = '0x1e14';
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: cantoNetworkId }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: cantoNetworkId,
                chainName: 'Canto',
                rpcUrls: ['https://canto.slingshot.finance/' , 'https://canto.neobase.one/', 'https://canto.evm.chandrastation.com/', 'https://jsonrpc.canto.nodestake.top'  ] /* ... */,
                nativeCurrency: {
                  name: 'CANTO',
                  symbol: 'CANTO',
                  decimals: 18
              },
              },
            ],
          });
        } catch (addError) {
          // handle "add" error
          console.log("Add Error", addError);
        }
      }
      // handle other "switch" errors
      console.log("Switch Error", switchError);
    }
    // Get provider and signer for contract initialization 
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const signer = provider.getSigner();
  
    // Initialize contracts
    stakingContract = new ethers.Contract(stakingContractAddress, stakingContractABI, signer);
    tokenContract = new ethers.Contract(tokenContractAddress, tokenContractABI, signer);
  
    // Handle data that needs account information.
    connectButtonTextToUserAccount(accounts[0]);
    handleUserNFTs(accounts[0], tokenContract, stakingContract);
    

    // Global boolean that says if the user has connected their metamask account.
    isConnected = true;
    replaceButtonWithInput();
  }


function replaceButtonWithInput() {
  if (isConnected){
    
    const buttonWrapper = document.querySelector('.DepositCantoWrapper');
    buttonWrapper.remove();


    const flexBox = document.createElement('div');
    flexBox.className = 'flexBox';
    // Create text input
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter amount';
  
    // Create 'Deposit' button
    const depositButton = document.createElement('button');
    depositButton.className = 'stakeButton'
    depositButton.textContent = 'Deposit';

    // Attach the onclick event to the button
    depositButton.onclick = function() {
      depositButton.textContent = 'Loading...';
      handleStake(input.value)
        .then(receipt => {
          console.log(receipt);
        })
        .catch(error => {
          console.error(error);
        });
      depositButton.textContent = 'Deposit';
    };
  
    // Replace button with text input and 'Deposit' button
    const mainDisplay = document.querySelector('.mainInterface');
    mainDisplay.appendChild(flexBox);
    flexBox.appendChild(input);
    flexBox.appendChild(depositButton);
  
    // Focus on the input field
    input.focus();
  } else {
    getAccount();
  }
}


function insertOwnedNFTElementHeader() {

    const userNFTHeader = document.createElement('div');
    userNFTHeader.className = 'userNFTHeader'

    const userNFTPosition = document.createElement('div');
    userNFTPosition.className = 'userNFTPosition';
    userNFTPosition.innerHTML = `<span>Position</span>`;
    userNFTHeader.appendChild(userNFTPosition);

    const userNFTStakingAmount = document.createElement('div');
    userNFTStakingAmount.className = 'userNFTStakingAmount';
    userNFTStakingAmount.innerHTML = `<span>Staking</span>`;
    userNFTHeader.appendChild(userNFTStakingAmount);

    const userNFTClaim= document.createElement('div');
    userNFTClaim.className = 'userNFTUnstake';
    userNFTClaim.innerHTML = `<span>Unstake</span>`;
    userNFTClaim.position = 'relative';
    userNFTClaim.left = '250px';
    userNFTHeader.appendChild(userNFTClaim);

    const userNFTUnstake = document.createElement('div');
    userNFTUnstake.className = 'userNFTTimeRemaining';
    userNFTUnstake.innerHTML = `<span>Time Remaining</span>`;
    userNFTHeader.appendChild(userNFTUnstake);


    const userNFTsDiv = document.querySelector('.userNFTs');
    // Append the main div to the body
    userNFTsDiv.appendChild(userNFTHeader);


}

function insertOwnedNFTElement(index, NFTIDValue, stakingAmountValue, timeRemainingValue, isActive) {
  // Calculate the top position

  const topPosition = 100 + index * 116;

  // Create the main div
  const userNFTInformation = document.createElement('div');
  userNFTInformation.className = 'UserNFTInformation';
  userNFTInformation.style.top = `${topPosition}px`;

  // Create the img
  const img = document.createElement('img');
  img.className = 'TwitterPfp3Transparent2';
  img.src = isActive ? '/assets/img/ValidPinwheel.png' : '/assets/img/InvalidPinwheel.png';
  userNFTInformation.appendChild(img);

  // Create the textData div
  const textData = document.createElement('div');
  textData.className = 'textData';
  userNFTInformation.appendChild(textData);

  // Create the NFTNumber div
  const NFTNumber = document.createElement('div');
  NFTNumber.className = 'NFTNumber';
  textData.appendChild(NFTNumber);

  // Create the statusLive div
  const statusLive = document.createElement('div');
  statusLive.className = 'statusLive';
  NFTNumber.appendChild(statusLive);

  // Create the liveIcon div
  const liveIcon = document.createElement('div');
  liveIcon.className = 'liveIcon';
  statusLive.appendChild(liveIcon);

  // Create the Live div
  const Live = document.createElement('div');
  Live.className = 'Live';
  Live.innerHTML = `<span>${isActive ? 'LIVE' : 'INACTIVE'}</span>`;
  statusLive.appendChild(Live);

  // Create the NFTID div
  const NFTID = document.createElement('div');
  NFTID.className = 'NFTID';
  NFTID.style.position = 'relative';
  NFTID.style.top = '-8px';
  NFTID.innerHTML = `<span>NFT #${NFTIDValue}</span>`;

  NFTNumber.appendChild(NFTID);

  // Create the stakingAmount div
  const stakingAmount = document.createElement('div');
  stakingAmount.className = 'stakingAmount';
  stakingAmount.innerHTML = `<span>${stakingAmountValue} </span><span>CANTO</span>`;
  textData.appendChild(stakingAmount);

  // Create the ClaimReward element
  const startUnstaking = document.createElement(isActive ? 'button' : 'div');
  startUnstaking.className = 'BeginUnstaking-' + NFTIDValue;
  startUnstaking.classList.add('BeginUnstaking');
  startUnstaking.innerHTML = `<span>${isActive ? 'Start Unstaking' : '-'}</span>`;
  if (isActive){
    startUnstaking.style.position = 'relative';
    startUnstaking.style.left = '-20px';
    // Attach the onclick event to the button
    startUnstaking.onclick = function() {
      handleBeginUnstake(NFTIDValue)
        .then(receipt => {
          console.log(receipt);
        })
        .catch(error => {
          console.error(error);
        });
    };
  }
    else {
    startUnstaking.style.position = 'relative';
    startUnstaking.style.left = '50px';
    }
  textData.appendChild(startUnstaking);

  // Create the BeginUnstaking button or timeRemaining div based on the condition
  let timeSinceUnstaked =  (Date.now()/1000) - timeRemainingValue; 
  let daysSinceStaked = Math.floor(timeSinceUnstaked/86400);
  let canUnstake = (daysSinceStaked >= 24) ? true : false;
  
  const unstakeElement = document.createElement(canUnstake ? 'button' : 'div');
  unstakeElement.className = 'unstakeElement-' + NFTIDValue;
  unstakeElement.classList.add('unstakeElement');
  
  if (canUnstake && !isActive){
    unstakeElement.innerHTML = `<span>Unstake</span>`;
    unstakeElement.style.color = "#EF476F";
    unstakeElement.style.position = 'relative';
    unstakeElement.style.left = '30px';
    unstakeElement.onclick = function() {
      handleUnstake(NFTIDValue)
        .then(receipt => {
          console.log(receipt);
        })
        .catch(error => {
          console.error(error);
        });
    }
  } else {
    unstakeElement.innerHTML = `<span>${isActive ? '-' : (24 - daysSinceStaked) + ' Days Remaining'}</span>`;
    unstakeElement.style.position = 'relative';
    if (isActive){
        unstakeElement.style.left = '65px';
    } else {
        unstakeElement.style.left = '-20px';
    }
    
    unstakeElement.style.color = "#FF3E3E";
  }
  
  textData.appendChild(unstakeElement);

  const userNFTsDiv = document.querySelector('.userNFTs');
    
  // Append the main div to the body
  userNFTsDiv.appendChild(userNFTInformation);
}


function insertClaimRewardsElement(numberOfNFTs) {


  const claimRewards = document.createElement('div');
  claimRewards.className = 'claimRewards';

  // Create flex container
  const flexContainer = document.createElement('div');
  flexContainer.className = 'flexContainer';
  claimRewards.appendChild(flexContainer);

  
  // Create text element
  const textElement = document.createElement('div');
  textElement.className = 'claimRewardsButtonInner';
  textElement.innerHTML = `<span>Earned Rewards: 0</span><span> CANTO</span>`;
  flexContainer.appendChild(textElement);  
  
  
  const claimRewardsButton = document.createElement('button');
  claimRewardsButton.className = 'claimRewardsButton';
  claimRewardsButton.innerHTML = 'Claim Rewards';

    // Attach the onclick event to the button
    claimRewardsButton.onclick = function() {
      handleClaimRewards()
        .then(receipt => {
          console.log(receipt);
        })
        .catch(error => {
          console.error(error);
        });
    };

  flexContainer.appendChild(claimRewardsButton);

  const topPosition = 870 + numberOfNFTs * 116;
  const claimRewardsWrapper = document.querySelector('.claimRewardsWrapper');
  claimRewardsWrapper.style.top = `${topPosition}px`;
  claimRewardsWrapper.appendChild(claimRewards);

}

function resizeSiteLength(numberOfNFTs) {
  if (numberOfNFTs > 0){
  const main = document.querySelector('.Main');
  main.style.height = (1800 + 200 + numberOfNFTs * 116) + 'px';

  const recentWindfalls = document.querySelector('.recentWindfalls');
  recentWindfalls.style.top = (800 + 200 + numberOfNFTs * 116) + 'px';

  const Footer = document.querySelector('.Footer');
  Footer.style.top = (1550 + 200 + numberOfNFTs * 116) + 'px';

  }
  
}


async function handleUserNFTs(account, tokenContract, stakingContract) {
  try {
      const tokensOfOwner = await tokenContract.getTokensOfOwner(account);
      console.log('tokensOfOwner', tokensOfOwner);
      if (tokensOfOwner.length > 0){
        resizeSiteLength(tokensOfOwner.length);
        insertOwnedNFTElementHeader();
        


        for (i = 0; i < tokensOfOwner.length; i++){
            let tokenMetadata = await stakingContract.getMetadata(tokensOfOwner[i]);
            let jsonTokenMetadata = JSON.parse(tokenMetadata);

            // Extract variables
            let stakingAmount = jsonTokenMetadata.attributes.find(attribute => attribute.trait_type === 'stakingAmount').value;
            let unstakeTimestamp = jsonTokenMetadata.attributes.find(attribute => attribute.trait_type === 'unstakeTimestamp').value;
            let stakingStatus = jsonTokenMetadata.attributes.find(attribute => attribute.trait_type === 'stakingStatus').value;
            let stakingStatusBool = (stakingStatus === 'true') ? true : false;
            

            insertOwnedNFTElement(i, tokensOfOwner[i].toNumber(), parseFloat(ethers.utils.formatEther(stakingAmount)).toPrecision(4), unstakeTimestamp, stakingStatusBool);
        }
      }
      
    let earnedRewardsAmount = await stakingContract.checkRewards();
    if (earnedRewardsAmount > 0) {
        handleRewards(stakingContract, earnedRewardsAmount);
        insertClaimRewardsElement(tokensOfOwner.length);
    }
      
    } catch (error) {
      console.error("An error occurred: ", error);
    }
    
}

  
async function handleRewards(stakingContract, earnedRewardsAmount) {
  try {
      const rewardsText = document.querySelector('.claimRewardsButtonInner');
      let rewardAmount = parseFloat(ethers.utils.formatEther(earnedRewardsAmount)).toPrecision(4);
        rewardsText.innerHTML = `<span>Earned Rewards: ${rewardAmount}</span><span> CANTO</span>`;
    } catch (error) {
      console.error("An error occurred: ", error);
    }
}


async function handleStake(amount) {
  const amountInWei = ethers.utils.parseEther(amount);
  const textData = document.querySelector('.stakeButton');
  textData.innerHTML = 'Loading...';
  try{
  
    const transactionResponse = await stakingContract.stake({value: amountInWei});
    
    // Show pop-up
    console.log(transactionResponse);
    showModal('Tx hash: ' + transactionResponse.hash);

    textData.innerHTML = 'Deposit';
  } catch (error) {
    console.error("An error occurred: ", error);
    textData.innerHTML = 'Error';
  }

}


async function handleTest() {
    const transactionResponse = await tokenContract.getNextTokenId();
    console.log(transactionResponse);
    showModal('Tx hex: ' + transactionResponse._hex);
}



async function handleUnstake(NFTID) {
  const textData = document.querySelector('.unstakeElement-' + NFTID);
  textData.innerHTML = 'Loading...';
  try {
    await tokenContract.approve(stakingContractAddress, NFTID);
  } catch (error) {
    console.error("An error occurred: ", error);
    textData.innerHTML = 'Error';
    return;
  }
    try{    
    const transactionResponse = await stakingContract.unstake(NFTID);
    showModal('Tx hash: ' + transactionResponse.hash);
  } catch (error) {
    console.error("An error occurred: ", error);
    textData.innerHTML = 'Error';
    return
  }
  textData.innerHTML = 'Completed';

}


async function handleClaimRewards(){
  const textData = document.querySelector('.claimRewardsButton');
  textData.innerHTML = 'Loading...'
  try {
    const transactionResponse = await stakingContract.claimRewards();

    // Show pop-up
    showModal('Tx hash: ' + transactionResponse.hash);

    textData.innerHTML = 'Rewards Claimed';
  } catch (error) {
    console.error("An error occurred: ", error);
    textData.innerHTML = 'Error';
  }

  
}

async function handleBeginUnstake(tokenId){
  const textData = document.querySelector(`.BeginUnstaking-${tokenId}`);
  textData.innerHTML = "Loading...";
  try {
    const transactionResponse = await stakingContract.startUnstake(tokenId);
    showModal('Tx hash: ' + transactionResponse.hash);
    textData.innerHTML = "Completed";
  } catch (error) {
    console.log(error);
    textData.innerHTML = 'Error';
  }
  

}




function showModal(data) {
  const modal = document.querySelector('.modal');
      // get the modal-body within the modal
  const modalBody = modal.querySelector('.modal-body');
  // set the text of the modal body to whatever data is passed to the function
  modalBody.innerHTML = data;

  // Bootstrap 5 said goodbye to jQuery, and introduced a new way to manage modals:
  // Bootstrap 5 uses a Modal class that you have to create an instance of:
  var myModal = new bootstrap.Modal(modal)

  // Then call the show method:
  myModal.show();
}



// Give connect button functionality. 
const ethereumButton = document.querySelector('.ConnectButton');
ethereumButton.addEventListener('click', () => {
  getAccount();
});

const depositButton = document.querySelector('.DepositCantoWrapper');
depositButton.addEventListener('click', () => {
  replaceButtonWithInput();
  
});