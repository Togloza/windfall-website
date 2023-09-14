# -*- coding: utf-8 -*-
"""
Created on Thu Jul 27 13:30:14 2023

@author: TomOg
"""


import json
import os
from web3 import Web3
import time
import random

# RPC_URL = "https://canto.gravitychain.io"
RPC_URL = "https://canto-testnet.plexnode.wtf"

STAKING_ADDRESS = '0x66c1222813C1BB089277f4496e4314a5E9709610'


# Open the JSON file
with open('stakingABI.json') as json_file:
    STAKING_ABI = json.load(json_file)


w3 = Web3(Web3.HTTPProvider(RPC_URL))


staking_contract = w3.eth.contract(address=STAKING_ADDRESS, abi=STAKING_ABI)

latestBlockInfo = w3.eth.get_block('latest')
blockNumber = latestBlockInfo['number']
blockTimestamp = latestBlockInfo['timestamp']

stakingContractBalance = staking_contract.functions.getContractBalance().call()
recentUnstakingTimestamp = staking_contract.functions.recentUnstakingTimestamp().call()

RANDOM_NUMBER = random.randint(100000,100000000)
pickWinner = staking_contract.functions.pickWinner(RANDOM_NUMBER).call()

def publishWinner():
    with open(r"C:\Users\TomOg\.spyder-py3\Windfall\keys.txt", 'r') as file:
        my_private_key = file.read().strip()
    
    transaction = {
    'from': my_private_key,
    'to': STAKING_ADDRESS,
    'value': 0,  # This should be the value you are sending, if any, in Wei
    'gas': 2000000,  # This is the gas limit, you can adjust this value
    'gasPrice': w3.eth.gasPrice,  # This will fetch the current gas price
    'nonce': w3.eth.getTransactionCount(my_private_key),
    'data': staking_contract.functions.publishWinner().buildTransaction({})['data']
    } 
    
    signed_txn = w3.eth.account.signTransaction(transaction, my_private_key)
    txn_hash = w3.eth.sendRawTransaction(signed_txn.rawTransaction)
    txn_receipt = w3.eth.wait_for_transaction_receipt(txn_hash)
