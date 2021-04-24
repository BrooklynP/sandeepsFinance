const http = require('http');
const fs = require('fs');
const Papa = require('papaparse');
const path = require('path');

const file = fs.createWriteStream("data.txt");

http.get('http://regsho.finra.org/CNMSshvol20210423.txt', (response) => {
    // if(err) throw err;

    response.pipe(file)


})

setTimeout(() => {
    fs.readFile('data.txt', 'utf8', (err, data) => {
        if (err) { throw err; }
        
        let formattedData = Papa.parse(data, {
            download: false,
            delimiter: '|',
            header: true
        }).data;

        formattedData.length = formattedData.length - 2;

        for(let i=0; i < formattedData.length; i++){
            console.log("Dealing with", formattedData[i].Symbol);
            let csvData;
            const fileCheck = fs.existsSync('tickers/' + formattedData[i].Symbol + '.csv');
            if(fileCheck){
                csvData = Papa.unparse([formattedData[i]], {header: false});
            }
            else{
                csvData = Papa.unparse([formattedData[i]], {header: true});
            }

            fs.appendFile('tickers/' + formattedData[i].Symbol + '.csv', csvData, response=>{});



        }
    }); 
}, 2000);

