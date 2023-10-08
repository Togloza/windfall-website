import { ethers } from "ethers";
import { EthereumAddress } from "@/types/web3";
import { CHAIN_CONFIG, ChainId } from "@/config";
import { useWallet } from "../walletConnect";
import { abi } from "./abi";
import useSWR from "swr";
import { utils } from "ethers";

export default function useStakeData() {
  const { account, chainId, signer } = useWallet();
  const stakeProvider = chainId ? CHAIN_CONFIG[chainId as ChainId]?.address?.stakeProvider : undefined;
  const { data: contractData } = useSWR(
    stakeProvider ? ["stakeContract", stakeProvider] : null,
    (key: string, stakeProvider: EthereumAddress) => getContract(stakeProvider!)
  );

  const getContract = async (address: EthereumAddress) => {
    let contract;
    try {
      contract = new ethers.Contract(address, abi, signer);
    } catch (error) {
      console.log(error, "error");
    }

    console.log("1234123");
    try {
      const drawCounter = await contract?.drawCounter();
      const pastData = await contract?.getPastDataArrays();
      const winningAmount = await contract?.getWinningAmount(true);
      const isSuper = await contract?.isSuper(); 
      console.log(drawCounter, pastData, winningAmount, "drawCounter, pastData, winningAmount");
      const recentWindfall = getRecentWindfallData({ drawCounter, pastData });
      const tokenTableData = getTokenTableData({ winningAmount, isSuper });
      return { contract, drawCounter, pastData, winningAmount, isSuper, recentWindfall, tokenTableData };
    } catch (e) {
      console.log(e, "eee");
      return {};
    }
  };

  const getRecentWindfallData = ({ drawCounter, pastData }: any) => {
    const recentWindfall = [];
    for (let i = 0; i < 7; i++) {
      let currentDate = new Date();
      let currentHour = currentDate.getHours();

      if (currentHour < 17) {
        currentDate.setDate(currentDate.getDate() - i - 1);
      } else {
        currentDate.setDate(currentDate.getDate() - i);
      }

      let formattedDate = currentDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      let item = {
        title: (drawCounter + i - 1) % 7 === 0 ? "WEEKLY" : "DAILY",
        date: formattedDate,
        nft: "C-" + pastData[1]?.[i].toString(),
        amount: pastData[0]?.[i] ? parseFloat(utils?.formatEther(pastData[0]?.[i])).toPrecision(3) + " CANTO": 0,
      };
      recentWindfall.push(item);
    }
    console.log(recentWindfall, "recentWindfall");
    return recentWindfall;
  };

  const getTokenTableData = ({ winningAmount, isSuper }: any) => {
    const networkList = ["CANTO", "Ethereum", "Matic"];
    const list = networkList.map((item) => {
      return item === "CANTO"
        ? {
            token: item,
            deposit: winningAmount[1] ? parseFloat(utils.formatEther(winningAmount[1])).toPrecision(4) : 0,
            daily: isSuper ? (parseFloat(utils.formatEther(winningAmount[0])) * 0.125).toPrecision(4) : parseFloat(utils.formatEther(winningAmount[0])).toPrecision(4),
            super: isSuper ? parseFloat(utils.formatEther(winningAmount[0])).toPrecision(4) : (parseFloat(utils.formatEther(winningAmount[0])) * 8).toPrecision(4),
          }
        : {
            token: item,
            deposit: 0,
            daily: 0,
            super: 0,
          };
    });

    return list;
  };

  return {
    // price: contractData?.drawCounter || null,
    // pastData: contractData?.pastData || null,
    // winningAmount: contractData?.winningAmount || null,
    recentWindfall: contractData?.recentWindfall || [],
    tokenTableData: contractData?.tokenTableData || [],
  };
}
