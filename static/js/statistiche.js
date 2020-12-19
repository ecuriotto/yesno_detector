/*
 * JavaScript file for the application to demonstrate
 * using the API
 */

// Create the namespace instance
let ns = {};

// Create the model instance
ns.model = (function() {
    'use strict';

    let $event_pump = $('body');

    // Return the API
    return {
        'read': function() {
            let ajax_options = {
                type: 'GET',
                url: 'api/letture',
                accepts: 'application/json',
                dataType: 'json'
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_read_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        }
    };
}());

// Create the view instance
ns.view = (function() {
    'use strict';

    // return the API
    return {
        showChart: function(letture) {
            if (letture) {
                var libriPerAnnoData={};
                var autoriCount ={};
                var count=0;
                for (let i=0, l=letture.length; i < l; i++) {
                    var annoLettura = new Date(letture[i].dataLettura).getFullYear();
                    var autore = letture[i].autore.charAt(0).toUpperCase() + letture[i].autore.slice(1);
                    if(libriPerAnnoData[annoLettura])                 
                    libriPerAnnoData[annoLettura] = libriPerAnnoData[annoLettura] +1;
                    else
                    libriPerAnnoData[annoLettura] = 1;
                    if(autoriCount[autore]){
                        autoriCount[autore] = autoriCount[autore] + 1;
                    }
                    else{
                        autoriCount[autore] = 1
                    }     
                }
                //var autoriCountPlus1 = autoriCount.filter(function(obj){return obj.sexe == '0'})
                var autoriCountPlus1 = Object.keys(autoriCount).reduce((p, c) => {    
                    if (autoriCount[c]>1) p[c] = autoriCount[c];
                    return p;
                  }, {});
                let entries = Object.entries(autoriCountPlus1);
                let autoriFilteredOrdered = entries.sort((a, b) => a[1] - b[1]).map(el=>el[0]);
                let autoriFilteredOrderedCount = entries.sort((a, b) => a[1] - b[1]).map(el=>el[1]);
                      
                var libriPerAnno = document.getElementById('libriPerAnno');
                var autoriCount = document.getElementById('autoriCount');

                var canvasL = document.createElement('canvas');
                canvasL.setAttribute('id','myChart');
                canvasL.setAttribute('width','100px');
                canvasL.setAttribute('height','100px');
                canvasL.width=200;
                canvasL.height=200;
                libriPerAnno.appendChild(canvasL);
                var ctxL = canvasL.getContext('2d');
                var chart = new Chart(ctxL, {
                    // The type of chart we want to create
                    type: 'bar',
                
                    // The data for our dataset
                    data: {
                        labels: Object.keys(libriPerAnnoData),
                        datasets: [{
                            label: 'Libri per anno',
                            backgroundColor: 'rgb(25, 37, 255)',
                            borderColor: 'rgb(255, 99, 132)',
                            data: Object.values(libriPerAnnoData)
                        }]
                    },
                
                    // Configuration options go here
                    options: {

                    }
                });

                var canvasA = document.createElement('canvas');
                canvasA.setAttribute('id','myChart2');
                canvasA.setAttribute('width','100px');
                canvasA.setAttribute('height','100px');
                canvasA.width=100;
                canvasA.height=100;
                autoriCount.appendChild(canvasA);
                var ctxA = canvasA.getContext('2d');
                var chart2 = new Chart(ctxA, {
                    // The type of chart we want to create
                    type: 'horizontalBar',
                
                    // The data for our dataset
                    data: {
                        labels: autoriFilteredOrdered,
                        datasets: [{
                            label: 'Numero letture per Autore',
                            backgroundColor: 'rgb(128, 0, 128)',
                            borderColor: 'rgb(255, 99, 132)',
                            data: autoriFilteredOrderedCount
                        }]
                    },
                
                    // Configuration options go here
                    options: {
                        scales: {
                            xAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                    min : 0
                                }
                            }]
                        }
                    }
                });

            }     
        },
        error: function(error_msg) {
            $('.error')
                .text(error_msg)
                .css('visibility', 'visible');
            setTimeout(function() {
                $('.error').css('visibility', 'hidden');
            }, 3000)
        }
    };
}());

// Create the controller
ns.controller = (function(m, v) {
    'use strict';

    let model = m,
        view = v,
        $event_pump = $('body')

    // Get the data from the model after the controller is done initializing
    setTimeout(function() {
        model.read();
    }, 100)


    // Handle the model events
    $event_pump.on('model_read_success', function(e, data) {
        $("#header_container").load("./navBar");
        view.showChart(data);
    });

    $event_pump.on('model_error', function(e, xhr, textStatus, errorThrown) {
        let error_msg = textStatus + ': ' + errorThrown + ' - ' + xhr.responseJSON.detail;
        view.error(error_msg);
        console.log(error_msg);
    })
}(ns.model, ns.view));

console.log(ns);