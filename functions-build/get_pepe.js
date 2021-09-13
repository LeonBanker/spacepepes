const ethers = require('ethers');
const faunadb = require('faunadb');
const fs = require("fs");
const { abi } = require('./SpacePepe.json')
var CryptoJS = require("crypto-js");

const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET
});

function returnError(message, statusCode = 400) {
  return {
    statusCode,
    body: JSON.stringify({ error: message })
  }
}

function returnSuccess(data, statusCode = 200) {
  return {
    statusCode,
    body: JSON.stringify(data)
  }
}
var metadata = {
     "name": "SpacePepesFTM",
     "description": "100 SpacePepe's from an unknown F-type main sequence star have received an arrival beacon through Lieutenant Pepe that extraterrestrial contact with Earth has been established. They want to use the energy of the earthlings living there and establish a permanent settlement. Though they look terrifying, these SpacePepes are smart creatures that love the fine arts like the Opera.",
     "image": 'https://spacepepes.com/pepes/bsc/',
     "external_url": 'https://spacepepes.com/pepes/bsc/'
};
exports.handler = async function(event) {
    var data = JSON.stringify({nftId:8})
    if(event.body)
        data = JSON.parse(event.body)
    const { nftId } = JSON.parse(data)

    if(!nftId) 
        return returnError('Invalid ID');

    provider = await ethers.getDefaultProvider('https://data-seed-prebsc-1-s1.binance.org:8545/')
    const nftContract = new ethers.Contract(process.env.NFT_CONTRACT_ADDRESS, abi, provider);
    var currentNft = await nftContract.totalSupply();
    currentNft = parseInt(currentNft.toString())
    
    if(currentNft-1 < nftId)
        return returnError('Not Minted');
    try {
        const ref = await client.query(q.Paginate(q.Match(q.Index('get_by_nftid'), nftId)))
        if(ref.data.length == 0) {
            return returnSuccess([]);
        }
        res = await client.query(ref.data.map(n => q.Get(n)))
        metadata['name'] += ' #' + nftId
        metadata['image'] += res[0].data.image
        metadata['external_url'] += nftId
        return returnSuccess(metadata)
    }
    catch(error) {
        console.log(error)
        return returnError('DB Error')
    }
}