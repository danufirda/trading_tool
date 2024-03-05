const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();
const domain = 'https://indodax.com';
const { sendMsg } = require('./helper/telegram');
let kurs = process.env.KURS_NOTIF;
let interval = process.env.INTERVAL_SECOND;
let telegram_id = process.env.TELEGRAM_ID;
let send_notif = false;

//sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

async function getInfo(){
    const apiUrl = `${domain}/tapi`;
    const method = 'getInfo';
    // const postData = `method=${method}&timestamp=${timestamp}&recvWindow=${recvWindow}`;
    const postData = `method=${method}&timestamp=${Date.now()}`;
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

function format(val){
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

async function main(){
    send_notif = false;
    kurs = process.env.KURS_NOTIF;
    interval = process.env.INTERVAL_SECOND;
    await sleep(interval*1000);

    let info = await getInfo();
    let aset_idr = 0;
    for(const [key, value] of Object.entries(info.return.balance)){
        if(value!=0){
            if(key=='idr') aset_idr = aset_idr + parseInt(value);

            if(key!='idr'){
                let koin = await cekCoins(key);
                koin = koin.ticker.sell * value;
                aset_idr = aset_idr + koin;
            }
        }
    }
    aset_idr = parseInt(aset_idr);
    if(aset_idr){
        let aset_json = JSON.parse(fs.readFileSync('./json/aset.json', 'utf8'));
        if(aset_idr > aset_json.nominal){
            let selisih = aset_idr - aset_json.nominal;
            if(selisih >= kurs){
                fs.writeFileSync('./json/aset.json', JSON.stringify({nominal: aset_idr}));
                send_notif = true;
            }
        }else{
            let selisih = aset_json.nominal - aset_idr;
            if(selisih >= kurs){
                fs.writeFileSync('./json/aset.json', JSON.stringify({nominal: aset_idr}));
                send_notif = true;
            }
        }
    }

    let message = `Aset INDODAX IDR: ${format(aset_idr)}`;
    console.log('aset idr', aset_idr);
    if(send_notif){
        sendMsg(telegram_id, message);
    }
    main();
}

main();

