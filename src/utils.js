//import { web3resolver } from './web3resolver.js'
import { ethers } from 'ethers';
import { 
    web3Loaded,
    address,
    contract,
    provider,
    network,
    nfts,
    alreadyMinted,
    etherLoading,
    balances,
    totalSupply,
    maxSupply
    } from './store.js';
import { abi } from './abis/SpacePepe.json';
import { get } from 'svelte/store'

const NFT_CONTRACT_ADDRESS = '0x94fC59bf3940c254A7Dd34ee96496D389CaAED00'
export async function initProvider(app, reconnect = false) {
    var signer, addr, p;
    try {
        p = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.send("eth_requestAccounts", []);

        signer = p.getSigner();
        addr = await signer.getAddress();
    }
    catch (error) {
        console.log(error)
        throw new Error('Provider not connected.');
    }

    var nid = await p.getNetwork()
    var nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, abi, signer);
    var minted = await nftContract.minted(addr)
    var total = await nftContract.currentTokenId();
    var supply = await nftContract.MAX_SUPPLY();

    totalSupply.set(total)
    address.set(addr)
    contract.set(nftContract);
    network.set(nid.chainId);
    provider.set(p);
    alreadyMinted.set(minted);
    maxSupply.set(supply);

    var baseURI = await nftContract.baseTokenURI();
    var resp = await fetch('/.netlify/functions/get_gallery', {
        method: 'POST',
        body: JSON.stringify({})
    })

    resp = await (await (resp).json())
    
    nfts.set(resp);
    console.log(resp);
    app = app;
    total = parseInt(total.toString())
    var iterate = [...Array(total).keys()]
    var bals = [];
    console.log(iterate)
    var each = iterate.forEach( async i => {
        var owner
        try {
            owner = await nftContract.ownerOf(i+1)
        }
        catch(err) {
            console.log(err)
        }
        console.log('owned', i)
        if(owner == addr) {
            
            if(resp[i]['nftId'] != i+1)
            { if(i==0)
                return
              bals.push(resp[i-1])
            }
            else
                bals.push(resp[i])
            balances.set(bals);
        }
    })
    
    subscribeToTransferEvent(window.ethereum, nftContract)
    // Subscribe to accounts change
    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged", onChainChanged);
    window.ethereum.on("connect", onConnect);
    window.ethereum.on("disconnect", onDisconnect);

    web3Loaded.set(1);
}

export async function mintPepe() {
    const p = get(provider);
    const nftContract = get(contract)
    const signer = p.getSigner();
    try {
        const resp = await nftContract.mint({ value: ethers.utils.parseEther('2') });
        etherLoading.set(true);

        await resp.wait().then(
            receipt => {
                console.log(receipt);
            },
            error => {
                throw new Error('Mint Failed: ' + error);
            })
    } catch (e) {
        etherLoading.set(false);
        return false;
    }
    etherLoading.set(false);
    alreadyMinted.set(true);
    supply = await contract.totalSupply();
    totalSupply.set(supply);
}

function setProviderWithLocal(q) {
    if (isWeb3 == 1) {
        provider = new ethers.providers.JsonRpcProvider();
    } else {
        provider = new ethers.providers.Web3Provider(q)
    }
}
function onAccountsChanged() {
    address.set(undefined)
    nfts.set(undefined)
    console.log("onAccountsChanged");
}

function onChainChanged() {
    address.set(undefined)
    nfts.set(undefined)    
    console.log("Chain Changed");
}

function onConnect() {
    console.log("onConnect");
}

function onDisconnect() {
    address.set(undefined)
    nfts.set(undefined)    
    console.log("onDisconnect");
}

export async function subscribeToTransferEvent(provider,contract) {
    const filter = {
      topics: [ethers.utils.id('Transfer(address,address,uint256)')]
    };
    provider.on(filter, async () => {
        var total = await contract.totalSupply();
        totalSupply.set(total)
    });
  }
