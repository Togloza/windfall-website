

let providerReadOnly;

try {
    providerReadOnly = new ethers.providers.JsonRpcProvider("https://canto.slingshot.finance/");
} catch (error){
    try {
        providerReadOnly = new ethers.providers.JsonRpcProvider("https://canto.neobase.one/");
    } catch {
        providerReadOnly = new ethers.providers.JsonRpcProvider("https://canto.evm.chandrastation.com/");
    }
}

const contractAddressReadOnly = '0xEB0a4E999DC0AB2cFD1b39202B3BD6973c0989DC';
const contractABIReadOnly = [
    { "inputs": [], "name": "dayCounter", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getStakedAmounts", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getWinningAmounts", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "retrievePastData", "outputs": [ { "internalType": "address[7]", "name": "", "type": "address[7]" }, { "internalType": "uint256[7]", "name": "", "type": "uint256[7]" } ], "stateMutability": "view", "type": "function" },
    { "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "getMetadata", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }
    ];

const contractABIEvents = [    	
    {
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "startedStaking",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "unstakingAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "startedUnstaking",
		"type": "event"
	}
];

const contractReadOnly = new ethers.Contract(contractAddressReadOnly, contractABIReadOnly, providerReadOnly);
const contractEvents = new ethers.Contract(contractAddressReadOnly, contractABIEvents, providerReadOnly);

async function loadData() {
    let elementsTotalStaked = document.getElementsByClassName("TotalCantoStakedNumber");
    let elementsDailyWindfall = document.getElementsByClassName("DailyWindfallNumber");
    let elementsWeeklyWindfall = document.getElementsByClassName("WeeklyWindfallNumber");
    const pastData = await contractReadOnly.retrievePastData();
    const winningAmountData = await contractReadOnly.getWinningAmounts();
    const stakedAmounts = await contractReadOnly.getStakedAmounts();
    let dayCounter = await contractReadOnly.dayCounter();
    dayCounter = dayCounter.toNumber();
    
    
    elementsTotalStaked[0].firstChild.textContent =  parseFloat(ethers.utils.formatEther(stakedAmounts[1])).toPrecision(4);
    elementsDailyWindfall[0].firstChild.textContent =  parseFloat(ethers.utils.formatEther(winningAmountData[1])).toPrecision(4);
    elementsWeeklyWindfall[0].firstChild.textContent = parseFloat(ethers.utils.formatEther(winningAmountData[0])).toPrecision(4);
    elementsWeeklyWindfall[0].firstChild.style.color = 'yellow';

    let pastWeekDataElements = document.querySelectorAll(".pastWinnersData .pastWeekData");
    


    for (let i = 0; i < 7; i++) {
        let currentDate = new Date();
        let currentHour = currentDate.getHours(); 

        if (currentHour < 17){
            currentDate.setDate(currentDate.getDate() - i - 1);
        } else {
            currentDate.setDate(currentDate.getDate() - i);
        }
        
        let formattedDate = currentDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
        
        let currentElement = pastWeekDataElements[i];

        currentElement.querySelector(".daily span").textContent = ((dayCounter + i - 1) % 7 === 0) ? "WEEKLY" : "DAILY";
        currentElement.querySelector(".pastDate span").textContent = formattedDate;
        currentElement.querySelector(".winnerAccount span").textContent = pastData[0][i].substring(0, 4) + "..." + pastData[0][i].substring(20, 24);
        currentElement.querySelector(".Canto span:first-child").textContent = parseFloat(ethers.utils.formatEther(pastData[1][i])).toPrecision(3);

        if ((dayCounter + i - 1) % 7 === 0){
            currentElement.querySelector(".daily span").style.color = 'yellow';
            currentElement.querySelector(".pastDate span").style.color = 'yellow';
            currentElement.querySelector(".winnerAccount span").style.color = 'yellow';
            currentElement.querySelector(".Canto span").style.color = 'yellow';
        }
    }



    function updateTime() {
        // Code for Time Until Next Draw timer
        let timerElement = document.querySelector(".Timer span");
        let time = "23:59"; // Initial time 
        // Convert current time to PST/PDT time
        let now = new Date();
        let currentPST = new Date(now.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
        
        // Create Date object for next 5:00 PM PST/PDT
        let targetPST = new Date(now.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
        targetPST.setHours(17, 0, 0, 0);  // Set time to next 5:00 PM (17:00 Hours)
        
        // If current PST/PDT time is past 5:00 PM, set target date to next day
        if(currentPST.getTime() > targetPST.getTime()) {
            targetPST.setDate(targetPST.getDate() + 1);
        }
        
        // Calculate the difference in milliseconds
        let diff = targetPST - currentPST;
        
        // Convert difference in milliseconds to hours and minutes
        let hours = Math.floor(diff / (1000 * 60 * 60));
        let minutes = Math.floor((diff / (1000 * 60)) % 60);
        
        // Update timer element
        timerElement.textContent = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes);
        
        // If countdown reaches 5:00 PM, reset to 24 hours
        if (hours === 0 && minutes === 0) {
            timerElement.textContent = "24:00";
        }
        }
        
        // Start countdown as soon as page loads
        updateTime();
        // Then keep updating every minute
        setInterval(updateTime, 60000);
    
    }
loadData();

/*
   contractEvents.on('startedStaking', (to, tokenId, timestamp) => {
     uploadMetadata(tokenId);
     console.log('startedStaking event received:', to, tokenId, timestamp);
     // Handle the event
   });

   contractEvents.on('startedUnstaking', (tokenId, unstakingAmount, timestamp) => {
     uploadMetadata(tokenId);
     console.log('startedUnstaking event received:', tokenId, unstakingAmount, timestamp);
     // Handle the event
   });
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
  projectId: "windfall-staking"
});
const storagePackage = require('@google-cloud/storage');
const Storage = storagePackage.Storage;
const storage = new Storage({ keyFilename: 'path-to-your-key-file.json' });
const bucket = storage.bucket('windfall-wintoken');


async function uploadJsonToGCS(path, data) {
  const file = bucket.file(`windfall-metadata/${path}`);
  await file.save(JSON.stringify(data), {contentType: 'application/json'});
  console.log(`JSON data has been uploaded to gs://windfall-wintoken/windfall-metadata/${path}`);
}


async function uploadMetadata(tokenId) {
    const metadata = await contractReadOnly.getMetadata(tokenId);
    const fileName = `metadata_${tokenId}.json`;
    await uploadJsonToGCS(fileName, metadata);
}

*/