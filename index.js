const http = require('http');
const fs = require('fs');
const Papa = require('papaparse');

const dates = getDates(new Date('05-05-2020'), new Date());

function freeze(time) {
    const stop = new Date().getTime() + time;
    while(new Date().getTime() < stop);       
}

for (let i = 0; i < dates.length; i++) {
    // console.log(dates[i])
    let year = dates[i].getFullYear()
    let month = dates[i].getMonth();
    let date = dates[i].getDate();
    if (month < 10) {
        month = '0' + month
    } else{
        month = month.toString();
    }
    if (date < 10) {
        date = '0' + date
    }
    else{
        date = date.toString();
    }
    if(year = 20){
        year = 2020
    } else
    if(year = 21){
        year = 2021
    }
    else{
        year = year.toString();
    }
    let fileName = year + month + date + '.txt';
    console.log("Processing", fileName)
    proccessData(fileName);
    freeze(1000);
}

function getDates(startDate, stopDate) {
    const dateArray = [];
    const currentDate = new Date(startDate);
    while (currentDate <= stopDate) {
        dateArray.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
}



function proccessData(fileName) {

    http.get('http://regsho.finra.org/CNMSshvol' + fileName, (response) => {
        // if(err) throw err;
        const file = fs.createWriteStream('data/' + fileName);
        response.pipe(file)
        console.log("piping to ", 'data/' + fileName)


    })

    setTimeout(() => {
        console.log("Gonna read file", fileName);
        fs.readFile('data/' + fileName, 'utf8', (err, data) => {
            if (err) { throw err; }

            let formattedData = Papa.parse(data, {
                download: false,
                delimiter: '|',
                header: true
            }).data;

            formattedData.length = formattedData.length - 2;

            for (let i = 0; i < formattedData.length; i++) {
                console.log("Dealing with", formattedData[i].Symbol);
                let csvData;
                const fileCheck = fs.existsSync('tickers/' + formattedData[i].Symbol + '.csv');
                if (fileCheck) {
                    csvData = Papa.unparse([formattedData[i]], { header: false });
                }
                else {
                    csvData = Papa.unparse([formattedData[i]], { header: true });
                }

                console.log(csvData);
                let safeSymbolName = formattedData[i].Symbol.replace('/', '-');
                fs.appendFile('tickers/' + safeSymbolName + '.csv', csvData, 'utf8', response => { });



            }
        });
    }, 900000);
}
