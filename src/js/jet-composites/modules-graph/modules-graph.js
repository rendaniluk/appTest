define(
    ['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'ojs/ojchart', 'serviceworker'],
    function(oj, ko, $) {
        'use strict';

        function ModulesComponentModel(context) {
            var self = this;
            self.composite = context.element;

            self.stackValue = ko.observable('off');

            self.orientationValue = ko.observable("vertical");

            self.isHorizontal = ko.observableArray([]);
            self.changeChartOrientation = ko.computed(function() {
                if (self.isHorizontal()[0] == 'Horizontal') {
                    self.orientationValue('horizontal');
                } else {
                    self.orientationValue('vertical');
                };
            }, this);

            /* chart data */
            var barSeries = [];

            let year = new Date().getFullYear();

            var barGroups = [year];

            self.barSeriesValue = ko.observableArray(barSeries);
            self.barGroupsValue = ko.observableArray(barGroups);

            function ProccessGraph(data) {
                let moduleNames = {};
                barSeries = [];

                data.forEach(log => {
                    if (log.module !== "00000") {
                        if (moduleNames[log.moduleDescription] === undefined) {
                            moduleNames[log.moduleDescription] = 1;
                        } else {
                            moduleNames[log.moduleDescription] += 1;
                        };
                    };
                });

                for (var i in moduleNames) {
                    let modName = i;
                    let modValue = moduleNames[i];

                    barSeries.push({ name: modName, items: [modValue] });
                };

                self.barSeriesValue(barSeries);
            }


            self.data = ko.observableArray();

            context.props.then(function(propertyMap) {
                //Store a reference to the properties for any later use
                self.properties = propertyMap;

                //Parse your component properties here 
                setTimeout(() => {
                    new ProccessGraph(self.properties.data);
                    self.data(self.properties.data);

                    setInterval(() => {
                        if (self.properties.data !== self.data()) {
                            self.data(self.properties.data);
                            new ProccessGraph(self.properties.data);
                        }
                    }, 1000)
                }, 1000)
            });
        };

        return ModulesComponentModel;
    });