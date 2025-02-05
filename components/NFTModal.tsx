"use client";

// 上架NFT
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { MarketAddress, MyNFTAddress } from "@/scripts/config";
import { useAccount, useWriteContract } from "wagmi";

import NFTContract from "@/artifacts/contracts/myNFT.sol/MyNFT.json";
import NFTMarketConstract from "@/artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import { parseAbi } from "viem";
import { useState } from "react";

const ERC721_ABI = parseAbi([
  "function approve(address to, uint256 tokenId) external",
]);

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const NFTModal = ({ isOpen, onClose }: Props) => {
  const [nftAddress, setNftAddress] = useState<`0x${string}`>(MyNFTAddress);
  const [tokenId, setTokenId] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [tokenURI, setTokenURI] = useState<string>(
    "https://my-json-server.typicode.com/abcoathup/samplenft/tokens/1"
  );
  const { data: hash, writeContractAsync, isPending } = useWriteContract(); // 授权
  const {
    data: listNFTHash,
    writeContractAsync: writeContractAsyncList,
    isPending: isPendingList,
  } = useWriteContract(); // 上架

  const { address } = useAccount();

  console.log("NFTModal =", isOpen);

  const approve = async () => {
    try {
      return await writeContractAsync({
        address: nftAddress,
        functionName: "approve",
        args: [MarketAddress, tokenId as any],
        abi: ERC721_ABI,
      });
    } catch (error) {
      console.log("Error during approve：", error);
      throw error;
    }
  };

  console.log("hash=", hash);
  console.log("listNFTAddress=", listNFTHash);

  const listItem = async () => {
    try {
      return await writeContractAsyncList({
        address: MarketAddress,
        abi: NFTMarketConstract.abi,
        functionName: "listNFT",
        args: [nftAddress, tokenId, price] as any,
      });
    } catch (error) {
      console.log("error during listNFT", error);
      throw error;
    }
  };

  /**
   * 铸造NFT
   */
  const mintNFT = async () => {
    try {
      return await writeContractAsync({
        address: nftAddress,
        functionName: "mint",
        args: [address as `0x${string}`, tokenURI], //
        abi: NFTContract.abi,
      });
    } catch (error) {
      console.log("Error during mint: ", error);
      throw error;
    }
  };

  async function listNFT() {
    await mintNFT();
    await approve();
    await listItem();
    onClose();
  }

  return (
    <Modal size="lg" isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>上架 NFT</ModalHeader>
            <ModalBody>
              <div className="flex flex-row w-full">
                <div className=" w-40">NFT合约地址：</div>
                <input
                  className="border p-2 mb-2 w-full"
                  type="text"
                  placeholder="NFT Contract Address"
                  value={nftAddress}
                  onChange={(e) => setNftAddress(e.target.value as any)}
                />
              </div>
              <div className="flex flex-row w-full">
                <div className=" w-40">Token ID：</div>
                <input
                  className="border p-2 mb-4 w-full"
                  type="text"
                  placeholder="Token ID"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                />
              </div>
              <div className="flex flex-row w-full">
                <div className=" w-40">TokenURI：</div>
                <input
                  className="border p-2 mb-4 w-full"
                  type="text"
                  placeholder="tokenURI"
                  value={tokenURI}
                  onChange={(e) => setTokenURI(e.target.value)}
                />
              </div>
              <div className="flex flex-row w-full">
                <div className=" w-40">售卖价格：</div>
                <input
                  className="border p-2 mb-4 w-full"
                  type="text"
                  placeholder="Price (in ERC20 tokens)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose}>
                取消
              </Button>
              <Button
                className="bg-[##E76FD] shadow-lg shadow-indigo-500/20"
                isLoading={isPending}
                onClick={listNFT}
              >
                {isPending || isPendingList ? "上架中...." : "上架 NFT"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default NFTModal;
