/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
define(
    ['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'ojs/ojgauge'],
    function(oj, ko, $) {
        'use strict';

        function TotalLogsComponentModel(context) {
            var self = this;
            self.composite = context.element;

            self.logs = ko.observable(0);
            self.customers = ko.observable(0);
            self.data = ko.observableArray([]);
            self.thresholdValues = [{ max: 33 }, { max: 67 }, {}];

            function initialiseGauge(data) {
                let totalLogs = Number(data.length);
                self.logs(totalLogs);

                let appCustomers = {};

                data.forEach((log) => {
                    if (appCustomers[log.appCustomer] == undefined) {
                        appCustomers[log.appCustomer] = 1;
                    };
                });

                var totalCustomers = 0;
                for (var customer in appCustomers) {
                    if (appCustomers.hasOwnProperty(customer)) {
                        ++totalCustomers;
                    };
                };

                self.customers(totalCustomers);
            };

            context.props.then(function(propertyMap) {
                //Store a reference to the properties for any later use
                self.properties = propertyMap;
                setTimeout(() => {
                    initialiseGauge(self.properties.data);

                    self.data(self.properties.data);

                    setInterval(() => {
                        if (self.properties.data !== self.data()) {
                            initialiseGauge(self.properties.data);

                            self.data(self.properties.data);
                        }
                    }, 1000)
                }, 1000)
            });
        };

        return TotalLogsComponentModel;
    });