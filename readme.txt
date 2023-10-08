 

Canto quickstart guide: https://docs.canto.io/evm-development/quickstart-guide


CONTRACT ADDRESSES:
Testnet:
RPC: https://canto-testnet.plexnode.wtf

Staking Contract: 0x85a441989AA875EF02D673940417a4A4ED9942eC
Token Contract: 0x3210bB0082366a80c3C0722038410526f8BF0757


Note: The staking contract has a buffer period of 2 minutes for staking to be valid,
and a 24 minute period before you can unstake after starting to unstake. In the actual
contract these will be 2 days and 24 days respectively. 

Extra:

- The stake function has a return value for the tokenId that is generated, but I couldn't find a way to get the return value on the front end. It may be nice to be able to display that value to the user, since they need it to add their token to their metamask, since metamask, from what I could tell, does not support adding erc721 tokens to a user's account through the front end. 

- The staking and token contract interfaces are provided which expose, I believe, all the external/public functions from the contracts. 

- A couple notes about the project:
- There is a 2 day period before a staked user is eligible to win rewards. This will be reduced in the testnet deployment to 1 minute so it can be tested easier.
- Likewise, there is 7 day period before users can win the super rewards, which will also be reduced in the testnet deployment to 7 seconds.
- There is a 24 day period for a user to start unstaking their token to when they can actually unstake the token. The cosmos network requres a 21 day unstaking period which is fundimental to the network and cannot be changed. The extra three days is for admin to actuall process these requests. This will be reduced in the testnet deployment to 24 seconds, 
    but the unstake process on the front end should reflect the 24 day process. We can discuss this more.

- ABIs will be provided in another file
- The staking contract will be the main contract to call for most operations which include:
    - stake() - Called when user deposits funds using deposit button
    - startUnstake(uint NFTid) - Called when a user starts the unstaking process using Start Unstaking button
    - unstake(uint NFTid) - Called when a user has waited 24 days after starting to unstake using the Unstake button
    - checkRewards(uint NFTid) - Called to display user's rewards for their NFTs
    - claimRewards(uint NFTid) - Called when a user presses the Claim Rewards button
    - getMetadata(uint NFTid) - Called to get the metadata for a NFT 
    - getUserByNftId(uint NFTid) - Called to get user struct for a NFT
    - getFrontEndData() - Called to get relevant state variables from contract
        -- Returns a bytes array of encoded data
        -- Data can be decoded using ethers library, see below example code
        -- Variables returned include: bool superRewards, uint32 superMultiplier, uint256 dayAmount, uint256 weekAmount, uint256 totalStaked, uint256[7] memorywinningAmounts, uint256[7] winningTokens
        -- Example code from Windfall-Next/src/hooks/contract/useStakeData.ts 

        
    try {
      const frontData = await contract?.getFrontendData();
      const [isSuper, superMultiplier, dayAmount, weekAmount, totalStaked, winningAmounts, winningTokens] = ethers.utils.defaultAbiCoder.decode([ "bool", "uint32", "uint256", "uint256", "uint256", "uint256[7] memory", "uint256[7] memory" ], frontData);
    }


- The token contract is only needed to make read only function call to getTokensOfOwner(NFTid) after the user connects their wallet.
    - getTokensOfOwner(address owner) - Returns an array of the ids of the NFTs the user owns
    - approve(address to, uint256 tokenId) - Must be called just before call to unstake(uint NFTid), gives contract permission to burn NFT required by unstaking process


- If you need more information about the code for the back end feel free to ask, and if you need functions added to the back end, that can also be arranged. 
- We are planning on adding a lending feature in the future, where users can borrow against their nfts, but it isn't currently ready. 
- The RPC url for the mainnet and testnet are different, just keep that in mind. The contract addresses in the code will also point to a different contract, refer to the addresses provided. 
- 
- I am not too familiar with front end languages, and I am likely the one who will have to make small edits in the future, so I would appreciate approprate comments for the code. 



If you have any questions feel free to ask, I will try to be available as much as possible, but I do live in PST time so depending on the timezone difference, there may be better windows of time to get responses.




