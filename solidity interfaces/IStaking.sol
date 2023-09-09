//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

interface IStaking {  

    struct User {
        uint entreeTokens;
        uint64 entreeTimestamp;
        uint64 unstakeTimestamp;
        bool eligibleForRewards;
    }


    /// @notice Stake function, creates new user, set tokenURI and metadata, and mint Nft to sender.
    /// @dev Requires the sent value to be greater than 0.
    /// @return The token id.
    function stake() external payable returns (uint);

    // Otherwise, store the unstake time, and set stakingStatus to false.
    // This removes elegibility for calculateWinningNftId
    /// @notice Start unstaking a token.
    /// @dev Requires the sender to be the owner of the token and the unstake timestamp to be initialized.
    /// @param tokenId The token id.
    function startUnstake(uint tokenId) external;

    /// @notice Unstake a token and transfer the staking amount to the token holder.
    /// @dev Requires the token to be valid for unstaking and approved for the contract.
    /// @param tokenId The token id.
    function unstake(uint tokenId) external;

    /// @notice Check the amount needed to start unstaking.
    /// @notice Used in WindfallFactory.sol, realistically only useful for owner
    /// @param timestamp Only tokens with unstakeTimestamp greater than timestamp will be counted.
    /// @return The total amount and the current timestamp.
    function recentUnstaking(uint timestamp) external view returns (uint, uint);

    /// @notice Function for users to claim their rewards.
    /// @param tokenId The tokenId the user want to claim rewards of.
    function claimRewards(uint tokenId) external;

    /// @notice Function to check the rewards for an input address.
    /// @param tokenId The token to check the rewards of.
    function checkRewards(uint tokenId) external view returns(uint);


    /// @dev Retrieves the metadata for a specific tokenId.
    /// @param tokenId The ID of the token.
    /// @return The metadata associated with the given tokenId.
    function getMetadata(uint tokenId) external view returns (string memory);
    /// @notice Get the balance of the contract.
    /// @return The balance of the contract.
    function getContractBalance() external view returns (uint);


  /// @notice Publish the winning address and distribute the winning amount.
    /// @param salt A random value input at function call to add randomness to the generated number.
    function publishWinner(uint salt) external payable;

    /// @notice Get the amount to be distributed as the daily winning amount.
    /// @return The amount to be distributed as the winning amount.
    function getWinningAmount() external view returns (uint);

    /// @notice Get the user data for a specific token ID.
    /// @dev Retrieves the user struct for the given token ID.
    /// @param _index The user index.
    /// @return The user struct containing staking amount, staking status, stake timestamp, and unstake timestamp.
    function getUserByNftId(uint _index) external view returns (User memory);

    // @notice Function that returns true if the next publishWinningAddress is the super rewards
    function isSuper() external view returns (bool);

}