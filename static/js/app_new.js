// // Import our CSV data with d3's .csv import method.

d3.csv('https://raw.githubusercontent.com/jamie-miller-rva/Life-Expectancy_Comparison_using_D3/main/data/life_Exp.csv').then(function (data) {
    console.log(data);
  // Create a lookup table to sort and regroup the columns of data,
  // first by Year, then by region:
 const lookup = {};
  function getData(Year, region) {
    let byYear, trace;
    if (!(byYear = lookup[Year])) {
      byYear = lookup[Year] = {};
    }
   // If a container for this Year + region doesn't exist yet,
   // then create one:
    if (!(trace = byYear[region])) {
      trace = byYear[region] = {
        x: [],
        y: [],
        id: [],
        text: [],
        marker: {size: []}
      };
    }
    return trace;
  }

  // Go through each row, get the right trace, and append the data:
  for (var i = 0; i < data.length; i++) {
    var datum = data[i];
    var trace = getData(datum.Year, datum.region);
    trace.text.push(datum.region);
    trace.id.push(datum.region);
    trace.x.push(datum.Life_Exp);
    trace.y.push(datum.GDP);
    trace.marker.size.push(datum.Population);
  }

  // Get the group names:
  var Years = Object.keys(lookup);
  // In this case, every Year includes every region, so we
  // can just infer the regions from the *first* Year:
  var firstYear = lookup[Years[0]];
  var regions = Object.keys(firstYear);

  // Create the main traces, one for each region:
  var traces = [];
  for (i = 0; i < regions.length; i++) {
    var data = firstYear[regions[i]];
   // One small note. We're creating a single trace here, to which
   // the frames will pass data for the different Years. It's
   // subtle, but to avoid data reference problems, we'll slice 
   // the arrays to ensure we never write any new data into our
   // lookup table:
    traces.push({
      name: regions[i],
      x: data.x.slice(),
      y: data.y.slice(),
      id: data.id.slice(),
      text: data.text.slice(),
      mode: 'markers',
      marker: {
        size: data.marker.size.slice(),
        sizemode: 'area',
        sizeref: 200000
      }
    });
  }

  // Create a frame for each Year. Frames are effectively just
  // traces, except they don't need to contain the *full* trace
  // definition (for example, appearance). The frames just need
  // the parts the traces that change (here, the data).
  var frames = [];
  for (i = 0; i < Years.length; i++) {
    frames.push({
      name: Years[i],
      data: regions.map(function (region) {
        return getData(Years[i], region);
      })
    });
  }
  
  // Now create slider steps, one for each frame. The slider
  // executes a plotly.js API command (here, Plotly.animate).
  // In this example, we'll animate to one of the named frames
  // created in the above loop.
  var sliderSteps = [];
  for (i = 0; i < Years.length; i++) {
    sliderSteps.push({
      method: 'animate',
      label: Years[i],
      args: [[Years[i]], {
        mode: 'immediate',
        transition: {duration: 300},
        frame: {duration: 300, redraw: false},
      }]
    });
  }
  
  var layout = {
    xaxis: {
      title: 'Life Expectancy',
      range: [30, 85]
    },
    yaxis: {
      title: 'GDP per Capita'
    },
    hovermode: 'closest',
   // We'll use updatemenus (whose functionality includes menus as
   // well as buttons) to create a play button and a pause button.
   // The play button works by passing `null`, which indicates that
   // Plotly should animate all frames. The pause button works by
   // passing `[null]`, which indicates we'd like to interrupt any
   // currently running animations with a new list of frames. Here
   // The new list of frames is empty, so it halts the animation.
    updatemenus: [{
      x: 0,
      y: 0,
      yanchor: 'top',
      xanchor: 'left',
      showactive: false,
      direction: 'left',
      type: 'buttons',
      pad: {t: 87, r: 10},
      buttons: [{
        method: 'animate',
        args: [null, {
          mode: 'immediate',
          fromcurrent: true,
          transition: {duration: 300},
          frame: {duration: 500, redraw: false}
        }],
        label: 'Play'
      }, {
        method: 'animate',
        args: [[null], {
          mode: 'immediate',
          transition: {duration: 0},
          frame: {duration: 0, redraw: false}
        }],
        label: 'Pause'
      }]
    }],
   // Finally, add the slider and use `pad` to position it
   // nicely next to the buttons.
    sliders: [{
      pad: {l: 130, t: 55},
      currentvalue: {
        visible: true,
        prefix: 'Year:',
        xanchor: 'right',
        font: {size: 20, color: '#666'}
      },
      steps: sliderSteps
    }]
  };
  
  // Create the plot:
  Plotly.newPlot('life-expectancy_bubble', {
    data: traces,
    layout: layout,
   config: {showSendToCloud:true},
    frames: frames,
  });
});