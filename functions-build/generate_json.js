const ethers = require('ethers');
const faunadb = require('faunadb');
const fs = require("fs");
var CryptoJS = require("crypto-js");


const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET
});

//thanks esmiralha
//https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript

function sanitize(str) {
  return str.replace(/\//g, 's').replace(/\+/g, 'p');
}
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
    var base_dir = './public/pepes/bsc/';
    var seed_dir = base_dir + 'SpacepepesBSC/'
    var id = 0;
    var pepes;
    try {
        const ref = await client.query(q.Paginate(q.Match(q.Index('bsc_pepes')), {size:100} ) )
        if(ref.data.length == 0) {
            return returnError('No pepes');
        }
        res = await client.query(ref.data.map(n => q.Get(n)))
        pepes = res.map(n => n.data);
    }
    catch(error) {
        console.log(error)
        return returnError('DB Error')
    }

    pepes.forEach((v, i) => { 
        var meta = {};
        Object.assign(meta, metadata);
        v['nftId'] += 1;
        meta['name'] += ' #' + v['nftId']
        console.log(meta['name'])
        meta['image'] += v['image']
        meta['external_url'] += v['nftId']
        meta = JSON.stringify(meta);
        
        fs.writeFile('./public/json/pepes/bsc/' + v['nftId'], meta, 'utf8', () => {})

    })
    return returnSuccess([])
}


