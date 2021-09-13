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

//53 special move to 1
exports.handler = async function(event) {
    var base_dir = './public/pepes/bsc/';
    var seed_dir = base_dir + 'SpacepepesBSC/'
    var id = 2;
    fs.readdir(seed_dir, async (err, items) => {
        for (const dirent of items) {
            var ext = dirent.split('.').pop();
            if(ext == 'png')
            {   var file_name = sanitize(CryptoJS.AES.encrypt(dirent, process.env.AES_KEY).toString().slice(-25))
                fs.copyFile(seed_dir + dirent, base_dir + file_name, (err) => {
                  if(err) throw err;
                })
                try {
                  await client.query(
                    q.Create(q.Collection('pepes_bsc'), {
                      data: {
                        nftId: id,
                        image: file_name
                      }
                    })
                  )
                } catch (error) {
                  console.log(error)
                }
                console.log(file_name + " has  been created")
                id += 1;
            }
          }
    });
    return returnSuccess('Done');
}


