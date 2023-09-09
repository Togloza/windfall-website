# -*- coding: utf-8 -*-
"""
Created on Thu Jul 27 13:30:14 2023

@author: TomOg
"""


import json
import os
from web3 import Web3
import time

RPC_URL = "https://canto.gravitychain.io"
FACTORY_ADDRESS = "0xa07c1774E7cD7fe7Ba7964f75807B5EeDE5BB7A5"
STAKING_ADDRESS = '0xEB0a4E999DC0AB2cFD1b39202B3BD6973c0989DC'
# TEST_ADDRESS = "0x05ab16F2F445717151104301170c8Cc169662f2B"


ABI_FACTORY = [				
    {
		"inputs": [],
		"name": "getStakingContractBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
    {
		"inputs": [],
		"name": "publishWinner",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "recentUnstakingSinceLastCall",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
    {
		"inputs": [
			{
				"internalType": "uint256",
				"name": "timeInSeconds",
				"type": "uint256"
			}
		],
		"name": "recentUnstakingSinceTimeInSeconds",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
    {
		"inputs": [],
		"name": "recentUnstakingTimestamp",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
    
    ]


w3 = Web3(Web3.HTTPProvider(RPC_URL))


factory_contract = w3.eth.contract(address=FACTORY_ADDRESS, abi=ABI_FACTORY)

latestBlockInfo = w3.eth.get_block('latest')
blockNumber = latestBlockInfo['number']
blockTimestamp = latestBlockInfo['timestamp']

stakingContractBalance = factory_contract.functions.getStakingContractBalance().call()
recentUnstakingTimestamp = factory_contract.functions.recentUnstakingTimestamp().call()


def publishWinner():
    with open(r"C:\Users\TomOg\.spyder-py3\Windfall\keys.txt", 'r') as file:
        my_private_key = file.read().strip()
    
    transaction = {
    'from': my_private_key,
    'to': FACTORY_ADDRESS,
    'value': 0,  # This should be the value you are sending, if any, in Wei
    'gas': 2000000,  # This is the gas limit, you can adjust this value
    'gasPrice': w3.eth.gasPrice,  # This will fetch the current gas price
    'nonce': w3.eth.getTransactionCount(my_private_key),
    'data': factory_contract.functions.publishWinner().buildTransaction({})['data']
    }
    
    signed_txn = w3.eth.account.signTransaction(transaction, my_private_key)
    txn_hash = w3.eth.sendRawTransaction(signed_txn.rawTransaction)
    txn_receipt = w3.eth.wait_for_transaction_receipt(txn_hash)
