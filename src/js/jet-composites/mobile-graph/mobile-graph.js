/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
define(
    ['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'ojs/ojpictochart', 'ojs/ojlegend', 'serviceworker'],
    function(oj, ko, $) {
        'use strict';

        function MobileComponentModel(context) {
            var self = this;
            self.composite = context.element;

            self.legendSections = ko.observableArray();

            self.difference = ko.observable("");
            self.finding = ko.observable("");

            function MobileChartView(data) {
                self.legendSections([])

                let totalDesktopDevices = data.filter(log => {
                    if (log.mobile === false) {
                        return log;
                    };
                });

                let totalMobileDevices = data.filter(log => {
                    if (log.mobile === true) {
                        return log;
                    };
                });


                let totalLogs = data.length;

                let totalDesktops = Number(totalLogs) - Number(totalMobileDevices.length);

                let totalMobile = Number(totalLogs) - Number(totalDesktops);

                self.legendSections([{
                    items: [
                        { text: `${totalDesktops} Desktops`, color: "#267db3", markerShape: "human" },
                        { text: `${totalMobile} Mobile`, color: "#68c182", markerShape: "human" }
                    ]
                }]);

                let stat = `${totalDesktops} out of ${totalLogs} jde users`;
                let find = "logged in on desktops.";

                self.difference(stat);
                self.finding(find);
            };


            self.data = ko.observableArray();

            // Get Data
            context.props.then(function(propertyMap) {
                //Store a reference to the properties for any later use
                self.properties = propertyMap;

                //Parse your component properties here 
                if (self.properties) {

                    setTimeout(() => {
                        new MobileChartView(self.properties.data);
                        self.data(self.properties.data);

                        setInterval(() => {
                            if (self.properties.data !== self.data()) {
                                self.data(self.properties.data);
                                new MobileChartView(self.properties.data);
                            }
                        }, 1000)
                    }, 1000);

                }
            });
        };
        return MobileComponentModel;
    });