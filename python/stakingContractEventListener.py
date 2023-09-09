# -*- coding: utf-8 -*-
"""
Created on Tue Jul 25 13:31:21 2023

@author: TomOg
"""
from google.cloud import storage
import os
import json
from web3 import Web3
import time

RPC_URL = "https://canto.gravitychain.io"
CONTRACT_ADDRESS = '0xEB0a4E999DC0AB2cFD1b39202B3BD6973c0989DC'
# TEST_ADDRESS = "0x05ab16F2F445717151104301170c8Cc169662f2B"

BUCKET_NAME = 'windfall-wintoken'
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "C:/Users/TomOg/.spyder-py3/Windfall/google-cloud-key.json"

ABI = [
       { "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "getMetadata", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" },
       {
		"anonymous": False,
		"inputs": [
			{
				"indexed": False,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": False,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": False,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "startedStaking",
		"type": "event"
	},
	{
		"anonymous": False,
		"inputs": [
			{
				"indexed": False,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": False,
				"internalType": "uint256",
				"name": "unstakingAmount",
				"type": "uint256"
			},
			{
				"indexed": False,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "startedUnstaking",
		"type": "event"
	}]

w3 = Web3(Web3.HTTPProvider(RPC_URL))

staking_contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)


storage_client = storage.Client()
bucket = storage_client.bucket(BUCKET_NAME)    


startedStaking_event = staking_contract.events.startedStaking()
startedUnstaking_event = staking_contract.events.startedUnstaking()



def handle_event(event):
    receipt = w3.eth.waitForTransactionReceipt(event['transactionHash'])
    token_id = event['args']['tokenId']
    metadata = staking_contract.functions.getMetadata(token_id).call()
    # Convert the metadata string to JSON
    metadata_json = json.loads(metadata)
    # Upload the JSON data to your Google Cloud Storage bucket
    blob = bucket.blob(f'windfall-metadata/{token_id}.json')
    blob.upload_from_string(
        data=json.dumps(metadata_json),
        content_type='application/json'
    )


def log_loop(event_filter, poll_interval):
    while True:
        for event in event_filter.get_new_entries():
            handle_event(event)
        time.sleep(poll_interval)

startedStaking_filter = startedStaking_event.createFilter(fromBlock='latest')
startedUnstaking_filter = startedUnstaking_event.createFilter(fromBlock='latest')

# Start the loop for each filter
log_loop(startedStaking_filter, 30)
log_loop(startedUnstaking_filter, 30)

