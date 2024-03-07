const fs = require('fs');
const path = require('path');
require('dotenv').config();
const crypto = require('crypto');
const axios = require('axios');
const { DateTime } = require('luxon');
const domain = process.env.DOMAIN;
const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const ensureFolderExists = (folderPath) => {
    const absolutePath = path.resolve(folderPath);
    if (!fs.existsSync(absolutePath)) {
        fs.mkdirSync(absolutePath, { recursive: true });
        // console.log(`Folder created: ${absolutePath}`);
    } else {
        // console.log(`Folder already exists: ${absolutePath}`);
    }
}

const ensureFileExists = (filePath) => {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
        return false;
    }
    return true;
}

const cekCoins = async (param) =>{
    let url = `${domain}/api/ticker/${param}idr`;
    try{
        let response = await axios.get(url);
        return response.data;
    }catch(error){
        console.log(error);
    }
}

const getInfo = async () =>{
    const apiUrl = `${domain}/tapi`;
    // const postData = `method=${method}&timestamp=${timestamp}&recvWindow=${recvWindow}`;
    const postData = `method=getInfo&timestamp=${Date.now()}`;
    const signature = crypto.createHmac('sha512', process.env.INDODAX_API_SECRET).update(postData).digest('hex');
    
    const headers = {
        'Key': process.env.INDODAX_API_KEY,
        'Sign': signature,
    };
    
    let response = {};
    try {
        let back = await axios.post(apiUrl, postData, { headers });
        response = back.data;
        response.status = true;
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        response = error.response ? error.response.data : error.message;
        response.status = false;
    }
    return response;
}

const transHistory = async (coin) => {
    const apiUrl = `${domain}/tapi`;
    // const postData = `method=${method}&timestamp=${timestamp}&recvWindow=${recvWindow}`;
    const postData = `method=orderHistory&pair=${coin}&count=10&timestamp=${Date.now()}`; //max count 1000
    const signature = crypto.createHmac('sha512', process.env.INDODAX_API_SECRET).update(postData).digest('hex');
    
    const headers = {
        'Key': process.env.INDODAX_API_KEY,
        'Sign': signature,
    };
    
    let response = {};
    try {
        let back = await axios.post(apiUrl, postData, { headers });
        response = back.data;
        response.status = true;
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        response = error.response ? error.response.data : error.message;
        response.status = false;
    }
    return response;
}

const dataAset = (nominal) => {
    let tahun = DateTime.now().toFormat('yyyy');
    let bulan_ini = bulan[DateTime.now().month-1];
    let tgl_ini = DateTime.now().toFormat('dd');
    let folder = `./json/HISTORI_ASET/${tahun}`;
    ensureFolderExists(folder);

    let cek_file = ensureFileExists(`${folder}/${bulan_ini}.json`);
    if(cek_file){
        let old_json = JSON.parse(fs.readFileSync(`${folder}/${bulan_ini}.json`, 'utf8'));
        let new_json = [];
        let key_exist = false;
        for(const [key, value] of Object.entries(old_json)){
            if(Object.keys(value) == tgl_ini){
                console.log("masuk same object");
                if(nominal > Object.values(value)[0]){
                    new_json.push({[Object.keys(value)]: nominal});
                }else{
                    new_json.push({[Object.keys(value)]: Object.values(value)[0]});
                }
                key_exist = true;
            }else{
                console.log("masuk not same object");
                new_json.push({[Object.keys(value)]: Object.values(value)[0]});
            }
        }
        if(!key_exist){
            console.log("masuk neww object");
            new_json.push({[tgl_ini]: nominal});
        }
        fs.writeFileSync(`${folder}/${bulan_ini}.json`, JSON.stringify(new_json));
        return;
    }else{
        let json = [{
            [tgl_ini]: nominal
        }];
        fs.writeFileSync(`${folder}/${bulan_ini}.json`, JSON.stringify(json));
    }
}

module.exports = {
    ensureFolderExists,
    transHistory,
    getInfo,
    cekCoins,
    dataAset,
    ensureFileExists
}