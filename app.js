const fs = require('fs');
require('dotenv').config();
const { sendMsg } = require('./helper/telegram');
const { dataAset, getInfo, cekCoins, transHistory } = require('./helper/function');
let kurs = process.env.KURS_NOTIF;
let interval = process.env.INTERVAL_SECOND;
let telegram_id = process.env.TELEGRAM_ID;
let send_notif = false;

//sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    let msg_aset = '';
    for(const [key, value] of Object.entries(info.return.balance)){
        if(value!=0){
            if(key=='idr') aset_idr = aset_idr + parseInt(value);
            if(key!='idr'){
                let koin = await cekCoins(key);
                koin = koin.ticker.sell * value;
                aset_idr = aset_idr + koin;
                msg_aset += `\n\nSALDO ${key} : ${value}\nNilai IDR: ${format(parseInt(koin))}`;

                let trans = await transHistory(key+'_idr');
                if(trans?.return?.orders.length > 0){
                    let old_order = trans.return.orders[0].order_idr;
                    msg_aset += `\nOrder : ${format(parseInt(old_order))}`;
                }
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

    let message = `ASET IDR: ${format(aset_idr)}`;
    if(msg_aset!='') message = message + msg_aset + `\n\nNOTIF KURS: ${kurs} DELAY: ${interval}`;
    console.log('aset idr', aset_idr);
    if(send_notif){
        sendMsg(telegram_id, message);
    }
    dataAset(aset_idr);
    main();
}

main();

