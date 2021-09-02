// Use the D3 library to read in samples.json.
// See Day 2 Activity 03 for hints on how to load a json file using d3.json() method
// consult web for d3.json() method
// note the relative path is from the index.html file

const relativePath = "./data/samples.json";

// Note: Promise Pending
const dataPromise = d3.json(relativePath);
console.log("Data Promise: ", dataPromise);

// Create a function to populate the "Demographic Info"
function buildMetaData(sample) {
    // get samples.json file using d3.json() and .then
    d3.json(relativePath).then(function (data) {

        // create variable for metadata
        var metadata = data.metadata;
        console.log(metadata);

        // filter metadata to just the sample selected
        var sampleMetadataArray = metadata.filter((sampleObj => sampleObj.id == sample));
        // note the result is an array with just one object
        // using index[0] to extract metadataResult
        console.log(sampleMetadataArray);

        var metadataResult = sampleMetadataArray[0];
        console.log("###################");
        console.log("metadataResult:");
        console.log(metadataResult);

        // use d3.select to get reference to "Demographic Info" "panel"
        var demoInfo = d3.select("#sample-metadata");

        // ensure panel-body is clear using .html("") method
        demoInfo.html("");

        // append demoInfo with an h5 tag and text for each key value pair in the metadata
        // iterate through each key value pair using Object.entries()
        // and forEach()
        Object.entries(metadataResult).forEach(([key, value]) => {
            // .text() method and string literal to add key and value as text
            demoInfo.append("h5").text(`${key}: ${value}`);
        });

        //############## build gauge chart ########################
        //   https://plotly.com/javascript/indicator/
        // A single angular gauge chart

        var washFreq = metadataResult.wfreq;
        console.log(washFreq);

        var gaugeData = [{
            domain: { x: [0, 1], y: [0, 1] },
            value: washFreq,
            title: { text: "Belly Buttton Wash Frequency <br><span>Scrubs per Week</span>" },
            type: "indicator",
            mode: "number+gauge",
            gague: { axis: { range: [null, 9] } }
        }];

        var gaugeLayout = { width: 600, height: 400 };

        Plotly.newPlot("gauge", gaugeData, gaugeLayout);

    });
}

// create function to buildBarChart
function buildCharts(sample) {
    // get samples.json file using d3.json() and .then
    d3.json(relativePath).then(function (data) {

        // create variable for metadata
        var samples = data.samples;
        console.log("##################");
        console.log("samples");
        // console.log(samples);

        // filter samples to just the sample selected
        var sampleArray = samples.filter((sampleObj => sampleObj.id == sample));
        // note the result is an array with just one object
        var result = sampleArray[0];
        console.log(result);

        // get otu_ids, otu_labels, sample_values
        var otu_ids = result.otu_ids;
        console.log("out_ids:");
        console.log(otu_ids);

        var otu_labels = result.otu_labels;
        console.log("otu_labels");
        console.log(otu_labels);

        var sample_values = result.sample_values;
        console.log("sample_values");
        console.log(sample_values);

        //############## build bar chart ########################

        // use d3.select to get reference to bar chart location
        var barChart = d3.select("#bar");

        // ensure panel-body is clear using .html("") method
        barChart.html("");

        // create barData
        var yticks = otu_ids.slice(0, 10).map(otuID => `OTU ${otuID}`).reverse();

        var barChartData = [{
            y: yticks,
            x: sample_values.slice(0, 10).reverse(),
            text: otu_labels.slice(0, 10).reverse(),
            type: "bar",
            orientation: "h",
        }];

        var barChartLayout = {
            title: "Top 10 Bateria Cultures Found",
            margin: {
                t: 40,
                r: 0,
                b: 50,
                l: 150,
            }
        };

        Plotly.newPlot("bar", barChartData, barChartLayout);

        //############## build bubble chart ########################

        // use d3.select to get reference to bar chart location
        var bubbleChart = d3.select("#bubble");

        // ensure panel-body is clear using .html("") method
        bubbleChart.html("");

        // create bubble chart
        var bubbleData = [{
            x: otu_ids,
            y: sample_values,
            text: otu_labels,
            mode: "markers",
            marker: {
                size: sample_values,
                color: otu_ids,
                colorscale: "Earth",
            }
        }];

        var bubbleLayout = {
            title: "Bacteria Culters Per Sample",
            margin: {
                t: 30,
                r: 0,
                b: 30,
                l: 0,
            }
        };

        Plotly.newPlot("bubble", bubbleData, bubbleLayout);
    });
}



// initalize the dashboard by calling functions using the first sample (940)
function init() {

    // populate the pulldown menu with sample id options
    // get samples.json using d3.json() and .then
    d3.json(relativePath).then(function (data) {

        // create variable for metadata
        var sampleIDs = data.names;
        console.log(sampleIDs);
        
        // get reference to pulldown menu
        var pullDownMenu = d3.select("#selDataset");

        sampleIDs.forEach((sample) => {
            pullDownMenu
                .append("option")
                .text(sample)
                .property("value", sample);
        });

    // get first sample
    var firstSample = sampleIDs[0];



    buildMetaData(firstSample);
    buildCharts(firstSample);
    });
}

// create an optionChanged function -- per the function in index.html line 25
function optionChanged(nextSample) {
    // get new data and build charts and metadata
    buildCharts(nextSample);
    buildMetaData(nextSample);
}

// call the init() function
init();


