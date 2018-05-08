define(
    ['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'ojs/ojbutton', 'ojs/ojselectcombobox', 'ojs/ojvalidation-number', 'ojs/ojgauge'],
    function(oj, ko, $) {
        'use strict';

        function LogDatesComponentModel(context) {
            var self = this;
            self.composite = context.element;

            self.data = ko.observableArray();

            self.months = [{ "value": "January", "logs": 0 },
                { "value": "February", "logs": 0, "default": true },
                { "value": "March", "logs": 0 },
                { "value": "April", "logs": 0 },
                { "value": "May", "logs": 0 },
                { "value": "June", "logs": 0 },
                { "value": "July", "logs": 0 },
                { "value": "August", "logs": 0 },
                { "value": "September", "logs": 0 },
                { "value": "October", "logs": 0 },
                { "value": "November", "logs": 0 },
                { "value": "December", "logs": 0 }
            ];
            self.numberoflogs = ko.observable();

            self.selectedVal = ko.observable();

            function defaultSetting() {
                let currentDate = new Date().getMonth();

                let currentMonth = self.months[currentDate].value;
                let currentLog = self.months[currentDate].logs;

                self.selectedVal(currentMonth);
                self.numberoflogs(currentLog);
            };

            self.selectedMonth = (event) => {
                event.preventDefault();
                let selectedmonth = event.detail.value;

                let currentlog = self.months.filter(month => {
                    if (month.value === selectedmonth) {
                        return month.logs;
                    };
                });

                if (currentlog[0]) {
                    self.numberoflogs(currentlog[0].logs);
                } else {
                    self.numberoflogs(0);
                };
            };

            function initialiseDateCount(initialRun = false) {
                self.months.forEach(month => {
                    month.logs = 0;
                });

                self.data().forEach(log => {
                    let month = new Date(log.datetime).getMonth();
                    let currentMonth = self.months[month].value;

                    if (self.months[month].value === currentMonth) {
                        self.months[month].logs += 1;
                    };
                });

                if (initialRun) {
                    defaultSetting();
                } else {
                    updateGauge(self.selectedVal());
                };
            };

            function updateGauge(cmonth) {
                let currentlog = self.months.filter(month => {
                    if (month.value === cmonth) {
                        return month.logs;
                    };
                });

                if (currentlog[0]) {
                    self.numberoflogs(currentlog[0].logs);
                } else {
                    self.numberoflogs(0);
                };
            };


            self.resetClick = function(event) {
                defaultSetting();
                return true;
            };

            context.props.then(function(propertyMap) {
                //Store a reference to the properties for any later use
                self.properties = propertyMap;

                //Parse your component properties here 
                setTimeout(() => {
                    self.data(self.properties.data);
                    initialiseDateCount(true);
                    setInterval(() => {
                        if (self.properties.data !== self.data()) {
                            self.data(self.properties.data);
                            initialiseDateCount();

                        }
                    }, 1000)
                }, 1000)
            });
        };

        return LogDatesComponentModel;
    });