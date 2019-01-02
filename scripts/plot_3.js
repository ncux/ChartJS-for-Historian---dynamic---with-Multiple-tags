
let API = {
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
const plotButton2 = document.querySelector('#plotButton2');
const plotButton3 = document.querySelector('#plotButton3');
const plotButton4 = document.querySelector('#plotButton4');
const warning = document.querySelector('#warning');

let tagSelectorsArray = document.querySelectorAll('.tagSelectors');

const table = document.querySelector('#table');
const tableCaption = document.querySelector('#tableCaption');

// grabs the canvas
const ctx = document.querySelector('#chart').getContext('2d');

// holds the API tags
let tagsArray = [];


// these two arrays hold the chart values to be plotted
let valuesArray = [];
let timeArray = [];

let valuesArray2 = [];
let timeArray2 = [];

let valuesArray3 = [];
let timeArray3 = [];

let valuesArray4 = [];
let timeArray4 = [];

// array of tagSelector values
let tagSelectorsValues = [];


// chart parameters
let data = {
    labels: timeArray,
    datasets: [
        {
            label: tagSelector.value,
            fillColor: "#560620",
            strokeColor: "rgba(220,220,220,0.8)",
            highlightFill: "#560620",
            highlightStroke: "rgba(220,220,220,1)",
            data: valuesArray
        },
        {
            label: tagSelector2.value,
            fillColor: "#fff",
            strokeColor: "rgba(220,220,220,0.8)",
            highlightFill: "#fff",
            highlightStroke: "rgba(220,220,220,1)",
            data: valuesArray2
        },
        {
            label: tagSelector3.value,
            fillColor: "#000",
            strokeColor: "rgba(220,220,220,0.8)",
            highlightFill: "#000",
            highlightStroke: "rgba(220,220,220,1)",
            data: valuesArray3
        },
        {
            label: tagSelector4.value,
            fillColor: "#0000FF",
            strokeColor: "rgba(220,220,220,0.8)",
            highlightFill: "#0000FF",
            highlightStroke: "rgba(220,220,220,1)",
            data: valuesArray4
        }
    ]
};


// chart options
let options = {
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

    // const options = { headers: { 'Authorization': `Bearer ${ API.access_token }` } };
    // let response = await fetch(API.tagsUrl, options);

    let response = await fetch(`./data/tags - verbose.json`);

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
plotButton2.addEventListener('click', checkIfFormIsFullyFilled_2);
plotButton2.addEventListener('click', checkIfFormIsFullyFilled_3);
plotButton2.addEventListener('click', checkIfFormIsFullyFilled_4);


function checkIfFormIsFullyFilled(e) {
    e.preventDefault();
    console.log('button clicked');

    let formInputs = form.elements;
    let emptyFields = [...formInputs].some(input => input.value === '');  // boolean
    if (emptyFields) {
        warning.style.display = 'block';
    } else {
        getValuesThenPlotChartAndTabulateData();
    }
}


function checkIfFormIsFullyFilled_2(e) {
    e.preventDefault();
    console.log('button clicked');

    let formInputs = form.elements;
    let emptyFields = [...formInputs].some(input => input.value === '');  // boolean
    if (emptyFields) {
        warning.style.display = 'block';
    } else {
        getValuesThenPlotChartAndTabulateData_2();
    }
}


function checkIfFormIsFullyFilled_3(e) {
    e.preventDefault();
    console.log('button clicked');

    let formInputs = form.elements;
    let emptyFields = [...formInputs].some(input => input.value === '');  // boolean
    if (emptyFields) {
        warning.style.display = 'block';
        setTimeout(hideWarningMessage, 2000);
    } else {
        getValuesThenPlotChartAndTabulateData_3();
    }
}


function hideWarningMessage() {
    warning.style.display = 'none';
}


function checkIfFormIsFullyFilled_4(e) {
    e.preventDefault();
    console.log('button clicked');

    let formInputs = form.elements;
    let emptyFields = [...formInputs].some(input => input.value === '');  // boolean
    if (emptyFields) {
        warning.style.display = 'block';
    } else {
        getValuesThenPlotChartAndTabulateData_4();
    }
}


async function getValuesThenPlotChartAndTabulateData() {

    let queryUrl = generateQueryUrl();
    console.log(queryUrl);

    const options = { headers: { 'Authorization': `Bearer ${ API.access_token }` } };
    let response = await fetch(queryUrl, options);

    let historianData = await response.json();
    let timeStampsAndValues = historianData['Data'][0].Samples;
    let timeStampsAndValues2 = historianData['Data'][1].Samples || [];
    let timeStampsAndValues3 = historianData['Data'][2].Samples || [];
    let timeStampsAndValues4 = historianData['Data'][3].Samples || [];

    console.log(timeStampsAndValues);

    // fill the chart arrays & plot the chart
    timeStampsAndValues.forEach(value => {
        timeArray.push(simplifyTime(value.TimeStamp));
        valuesArray.push((parseInt(value.Value)).toFixed(0));   // removing decimal fraction
        plotChart();
    });

    // tabulate the data
    tableCaption.textContent = `Data from tag ${tagSelector.value}`;
    timeStampsAndValues.forEach(dataItem => {
        let row = document.createElement('tr');
        row.innerHTML = `<td>${simplifyTime(dataItem.TimeStamp)}</td> <td>${(parseInt(dataItem.Value)).toFixed(0)}</td> <td>${dataItem.Quality}</td>`;
        table.append(row);
    });

}


async function getValuesThenPlotChartAndTabulateData_2() {

    let queryUrl = generateQueryUrl_2();
    console.log(queryUrl);

    const options = { headers: { 'Authorization': `Bearer ${ API.access_token }` } };
    let response = await fetch(queryUrl, options);

    let historianData = await response.json();
    let timeStampsAndValues = historianData['Data'][0].Samples;
    console.log(timeStampsAndValues);

    // fill the chart arrays & plot the chart
    timeStampsAndValues.forEach(value => {
        timeArray.push(simplifyTime(value.TimeStamp));
        valuesArray.push((parseInt(value.Value)).toFixed(0));   // removing decimal fraction
        plotChart();
    });

    // tabulate the data
    tableCaption.textContent = `Data from tag ${tagSelector.value}`;
    timeStampsAndValues.forEach(dataItem => {
        let row = document.createElement('tr');
        row.innerHTML = `<td>${simplifyTime(dataItem.TimeStamp)}</td> <td>${(parseInt(dataItem.Value)).toFixed(0)}</td> <td>${dataItem.Quality}</td>`;
        table.append(row);
    });

}



// grabs the form inputs and builds the API query URL
function generateQueryUrl() {
    // change interval value to milliseconds
    const milliseconds = Math.ceil((parseInt(interval.value))*1000);
    tagSelectorsValues.push(`${tagSelector.value}%3B`, `${tagSelector2.value}%3B`, `${tagSelector3.value}%3B`, `${tagSelector4.value}`);
    console.log(`${tagSelectorsValues.join('')}`);
    return `${API.dataUrl}/${tagSelectorsValues.join('')}/${startDate.value}T${startTime.value}/${endDate.value}T${endTime.value}/${calcMode.value}/${count.value}/${milliseconds}`;
}



// trims off the seconds
function simplifyTime(timestamp) {
    return timestamp.slice(0, 16);
}


function plotChart() {
    const chart = new Chart(ctx, {
        type: plotType.value,
        data: data,
        options: options
    });
}










