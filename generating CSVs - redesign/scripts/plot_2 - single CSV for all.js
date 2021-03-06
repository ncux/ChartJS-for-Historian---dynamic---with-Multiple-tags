
const API = {
    access_token: "",
    tagsUrl: 'https://dev.sealu.net:4433/api/v1/forward?url=/historian-rest-api/v1/tagslist',
    dataUrl: "https://dev.sealu.net:4433/api/v1/forward?url=/historian-rest-api/v1/datapoints/calculated"
};


// user inputs
const form = document.querySelector('#form');
const tagSelector = document.querySelector('#tagSelector');
const tagSelector2 = document.querySelector('#tagSelector2');
const tagSelector3 = document.querySelector('#tagSelector3');
const tagSelector4 = document.querySelector('#tagSelector4');
const startDate = document.querySelector('#startDate');
const endDate = document.querySelector('#endDate');
const startTime = document.querySelector('#startTime');
const endTime = document.querySelector('#endTime');
const calcMode = document.querySelector('#calcMode');
const count = document.querySelector('#count');
const interval = document.querySelector('#interval');
const plotType = document.querySelector('#plotType');
const plotButton = document.querySelector('#plotButton');
const warning = document.querySelector('#warning');
const errorMessage = document.querySelector('#errorMessage');

// for the tables
const tableContainer = document.querySelector('#tableContainer');
const table = document.querySelector('#table');
const table2 = document.querySelector('#table2');
const table3 = document.querySelector('#table3');
const table4 = document.querySelector('#table4');
const tableCaption = document.querySelector('#tableCaption');
const tableCaption2 = document.querySelector('#tableCaption2');
const tableCaption3 = document.querySelector('#tableCaption3');
const tableCaption4 = document.querySelector('#tableCaption4');


const tagSelectorsArray = document.querySelectorAll('.tagSelectors');


// grabs the canvas
const ctx = document.querySelector('#chart').getContext('2d');

// holds the API tags
const tagsArray = [];

// these arrays hold the charts values to be plotted
const valuesArray = [];
const timeArray = [];

const valuesArray2 = [];
const timeArray2 = [];   // for tabulation

const valuesArray3 = [];
const timeArray3 = [];

const valuesArray4 = [];
const timeArray4 = [];


// array of tagSelector values
const tagSelectorsValues = [];

// array to hold all timestampsAndValues
const allTimeStampsAndValues = [];


let data = {
    labels: timeArray,
    datasets: [
        {
            label: tagSelector.value,
            fillColor: "#FF0000",
            highlightFill: "#FF0000",
            backgroundColor: "#FF0000",
            data: valuesArray
        },
        {
            label: tagSelector2.value,
            fillColor: "#008080",
            highlightFill: "#008080",
            backgroundColor: "#008080",
            data: valuesArray2
        },
        {
            label: tagSelector3.value,
            fillColor: "#FFFF00",
            highlightFill: "#FFFF00",
            backgroundColor: "#FFFF00",
            data: valuesArray3
        },
        {
            label: tagSelector4.value,
            fillColor: "#800080",
            highlightFill: "#800080",
            backgroundColor: "#800080",
            data: valuesArray4
        }
    ]
};


// chart options
const options = {
    scales: {
        yAxes: [{
            ticks: {
                beginAtZero:false
            }
        }]
    }
};


// gets tags
async function getTags() {

    const options = { headers: { 'Authorization': `Bearer ${ API.access_token }` } };
    let response = await fetch(API.tagsUrl, options);

    // let response = await fetch(`./data/tags - verbose.json`);

    let data = await response.json();
    let tags = data.Tags;
    // console.log(tags);
    tags.map(tag => {
        let allTags = tag.Tagname;
        tagsArray.push(allTags);
        populateTagsInput();
    });
}


// populates the tags dropdown menu
function populateTagsInput() {

    tagsArray.forEach(tag => {
        tagSelectorsArray.forEach(selector => {
            let tagOption = document.createElement('option');
            tagOption.textContent = tag;
            tagOption.setAttribute('value', tag);
            selector.append(tagOption);
        });
    });
}


plotButton.addEventListener('click', checkIfFormIsFullyFilled);


function checkIfFormIsFullyFilled(e) {
    e.preventDefault();
    console.log('button clicked');

    let formInputs = form.elements;
    let emptyFields = [...formInputs].some(input => input.value === '');  // boolean
    if (emptyFields) {
        warning.style.display = 'block';
        setTimeout(hideWarningMessage, 2000);
    } else {
        getValuesThenPlotChartsAndTabulateData();
    }
}


function hideWarningMessage() {
    warning.style.display = 'none';
}

async function getValuesThenPlotChartsAndTabulateData() {

    let queryUrl = generateQueryUrl();
    // console.log(queryUrl);

    const options = { headers: { 'Authorization': `Bearer ${ API.access_token }` } };
    let response = await fetch(queryUrl, options);

    let historianData = await response.json();

    // display error message in case of Historian Error code 7: "Service call to central buffer server fail."
    if (historianData['Data'] === undefined) {
        errorMessage.style.display = 'block';
    }

    // console.log(`All the API data: ${historianData['Data']}`);

    let timeStampsAndValues = historianData['Data'][0].Samples;
    let timeStampsAndValues2 = historianData['Data'][1].Samples || [];
    let timeStampsAndValues3 = historianData['Data'][2].Samples || [];
    let timeStampsAndValues4 = historianData['Data'][3].Samples || [];

    allTimeStampsAndValues.push(timeStampsAndValues, timeStampsAndValues2, timeStampsAndValues3, timeStampsAndValues4);
    console.log(allTimeStampsAndValues);

    // console.log(makeCSV(timeStampsAndValues));      // checking integrity thus far; disable if OK
    downloadTagCSV(tagSelector.value, makeCSV(timeStampsAndValues));   // forces download of the tags in CSV format
    downloadTagCSV(tagSelector2.value, makeCSV(timeStampsAndValues2));
    downloadTagCSV(tagSelector3.value, makeCSV(timeStampsAndValues3));
    downloadTagCSV(tagSelector4.value, makeCSV(timeStampsAndValues4));

    // fill the chart arrays
    timeStampsAndValues.forEach(value => {
        timeArray.push(simplifyTime(value.TimeStamp));
        valuesArray.push((parseInt(value.Value)).toFixed(0));   // removing decimal fraction
    });

    // tabulate the data
    tableCaption.textContent = `Tag ${tagSelector.value}`;
    timeStampsAndValues.forEach(dataItem => {
        let row = document.createElement('tr');
        row.innerHTML = `<td>${simplifyTime(dataItem.TimeStamp)}</td> <td>${(parseInt(dataItem.Value)).toFixed(0)}</td>`;
        table.append(row);
    });


    if (timeStampsAndValues2.length !== 0) {
        // fill the chart arrays
        timeStampsAndValues2.forEach(value => {
            timeArray2.push(simplifyTime(value.TimeStamp));   // for the table
            valuesArray2.push((parseInt(value.Value)).toFixed(0));
        });

        // tabulate the data
        tableCaption2.textContent = `Tag ${tagSelector2.value}`;
        timeStampsAndValues2.forEach(dataItem => {
            let row = document.createElement('tr');
            row.innerHTML = `<td>${(parseInt(dataItem.Value)).toFixed(0)}</td> `;
            table2.append(row);
        });
    }

    if (timeStampsAndValues3.length !== 0) {
        timeStampsAndValues3.forEach(value => {
            timeArray3.push(simplifyTime(value.TimeStamp));
            valuesArray3.push((parseInt(value.Value)).toFixed(0));
        });

        // tabulate the data
        tableCaption3.textContent = `Tag ${tagSelector3.value}`;
        timeStampsAndValues3.forEach(dataItem => {
            let row = document.createElement('tr');
            row.innerHTML = `<td>${(parseInt(dataItem.Value)).toFixed(0)}</td> `;
            table3.append(row);
        });
    }

    if (timeStampsAndValues4.length !== 0) {
        timeStampsAndValues4.forEach(value => {
            timeArray4.push(simplifyTime(value.TimeStamp));
            valuesArray4.push((parseInt(value.Value)).toFixed(0));
        });

        // tabulate the data
        tableCaption4.textContent = `Tag ${tagSelector4.value}`;
        timeStampsAndValues4.forEach(dataItem => {
            let row = document.createElement('tr');
            row.innerHTML = `<td>${(parseInt(dataItem.Value)).toFixed(0)}</td> `;
            table4.append(row);
        });
    }

    plotChart();
    tableContainer.style.display = 'block';
}


// grabs the form inputs and builds the API query URL
function generateQueryUrl() {
    // change interval value to milliseconds
    const milliseconds = Math.ceil((parseInt(interval.value))*1000);
    tagSelectorsValues.push(`${tagSelector.value}%3B`, `${tagSelector2.value}%3B`, `${tagSelector3.value}%3B`, `${tagSelector4.value}`);  // concatenates tagSelector values and separates them with semicolon
    return `${API.dataUrl}/${tagSelectorsValues.join('')}/${startDate.value}T${startTime.value}/${endDate.value}T${endTime.value}/${calcMode.value}/${count.value}/${milliseconds}`;
}



// trims off the seconds
function simplifyTime(timestamp) {
    return timestamp.slice(0, 16);
}


// returns CSV of object array (duh)
function makeCSV(objectArray) {
    let fields = Object.keys(objectArray[0]);

    let csv = objectArray.map(row => {
        return fields.map(fieldName => {
            return JSON.stringify(row[fieldName], replacer)
        }).join(',')
    });

    csv.unshift(fields.join(',')); // add header column
    return csv.join('\r\n');
}


// goes hand-in-hand with makeCSV function
function replacer(key, value) {
    return value === null ? '' : value;
}


// creates the download link for the CSV file
function downloadTagCSV(filename, csvFile) {
    let link = document.createElement('a');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURI(csvFile));  // href is set to a "data URI"
    link.setAttribute('download', filename + '.csv');
    link.textContent = 'Download';
    link.click();
}


function plotChart() {
    const chart = new Chart(ctx, {
        type: plotType.value,
        data: data,
        options: options
    });
}














