/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
define(
    ['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'promise', 'ojs/ojtable', 'ojs/ojinputtext', 'ojs/ojbutton', 'ojs/ojarraydataprovider', 'serviceworker'],
    function(oj, ko, $) {
        'use strict';

        function AccountGraphicsComponentModel(context) {
            var self = this;
            self.composite = context.element;
            let days = { days: 10 };
            self.highlightChars = [];
            self.filter = ko.observable();
            self.logArray = ko.observableArray([]);
            self.dataprovider = new ko.observable(new oj.ArrayDataProvider(self.logArray, { idAttribute: 'accountId' }));

            /// ACCOUNTS TABLE
            const AccountFunctions = () => {
                const initialiseTable = async(logData) => {
                    // Get Data
                    let modifiedLogs = modifyData(logData);

                    self.logArray(modifiedLogs);
                };

                const modifyData = (logData) => {
                    let Accounts = [];

                    logData.forEach(log => {
                        Accounts.push({ accountId: log._id, account: log.account, user: log.user, server: log.server, aisVersion: log.aisVersion, action: log.action });
                    });

                    return Accounts;
                };

                // const getData = async(days) => {
                //     let Logs = new Service('POST', 'http://localhost:3001/readactivity', days, 'application/json');

                //     let logs = Logs.onLoadLogData();

                //     return logs.done((data) => {
                //         return data;
                //     });

                //     return logs.fail(function(jqXHR, textStatus) {
                //         return [];
                //         alert("Request failed: " + textStatus);
                //     });
                // };
                const filter = function() {
                    self.highlightChars = [];
                    var filter = document.getElementById('filter').rawValue;
                    if (filter.length == 0) {
                        self.clearClick();
                        return;
                    }
                    var filterArray = [];
                    var i, id;
                    for (i = self.logArray().length - 1; i >= 0; i--) {
                        id = self.logArray()[i].accountId;
                        Object.keys(self.logArray()[i]).forEach(function(field) {
                            if (self.logArray()[i][field].toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
                                self.highlightChars[id] = self.highlightChars[id] || {};
                                self.highlightChars[id][field] = getHighlightCharIndexes(filter, self.logArray()[i][field]);
                                if (filterArray.indexOf(self.logArray()[i]) < 0) {
                                    filterArray.push(self.logArray()[i]);
                                }
                            }
                        });
                    }
                    filterArray.reverse();
                    self.dataprovider(new oj.ArrayDataProvider(filterArray, { idAttribute: 'accountId' }));

                    function getHighlightCharIndexes(highlightChars, text) {
                        var highlightCharStartIndex = text.toString().toLowerCase().indexOf(highlightChars.toString().toLowerCase());
                        return { startIndex: highlightCharStartIndex, length: highlightChars.length };
                    };
                };

                const clearSearch = function(data, event) {
                    try {
                        self.filter('');
                        self.dataprovider(new oj.ArrayDataProvider(self.logArray, { idAttribute: 'accountId' }));
                        self.highlightChars = [];
                        document.getElementById('filter').value = "";
                        return true;
                    } catch (error) {
                        // console.log(error);
                    }
                };

                const clearDefaultSearch = function(data, event) {
                    try {
                        self.filter('');
                        self.highlightChars = [];
                        document.getElementById('filter').value = "";
                        return true;
                    } catch (error) {
                        // console.log(error);
                    }
                };

                const cellRenderer = function(context) {
                    var id = context.row.accountId;
                    var startIndex = null;
                    var length = null;
                    var field = null;
                    if (context.columnIndex === 0) {
                        field = 'account';
                    } else if (context.columnIndex === 1) {
                        field = 'user';
                    } else if (context.columnIndex === 2) {
                        field = 'server';
                    } else if (context.columnIndex === 3) {
                        field = 'aisVersion';
                    } else if (context.columnIndex === 4) {
                        field = 'action';
                    }
                    var data = context.row[field].toString();
                    if (self.highlightChars[id] != null &&
                        self.highlightChars[id][field] != null) {
                        startIndex = self.highlightChars[id][field].startIndex;
                        length = self.highlightChars[id][field].length;
                    }
                    if (startIndex != null &&
                        length != null) {
                        var highlightedSegment = data.substr(startIndex, length);
                        data = data.substr(0, startIndex) + '<b>' + highlightedSegment + '</b>' + data.substr(startIndex + length, data.length - 1);
                    }
                    $(context.cellContext.parentElement).append(data);
                };

                const parseTableData = function() {
                    return [{
                            headerText: 'Account',
                            renderer: self.highlightingCellRenderer
                        },
                        {
                            headerText: 'User',
                            renderer: self.highlightingCellRenderer
                        },
                        {
                            headerText: 'Server',
                            renderer: self.highlightingCellRenderer
                        },
                        {
                            headerText: 'AIS Version',
                            renderer: self.highlightingCellRenderer
                        },
                        {
                            headerText: 'Action',
                            renderer: self.highlightingCellRenderer
                        }
                    ];
                }
                return {
                    initialiseTable,
                    filter,
                    clearSearch,
                    clearDefaultSearch,
                    cellRenderer,
                    parseTableData
                };
            };



            self.handleValueChanged = AccountFunctions().filter;

            self.clearClick = AccountFunctions().clearSearch;

            self.highlightingCellRenderer = AccountFunctions().cellRenderer;

            self.columnArray = AccountFunctions().parseTableData();

            /// ACTION CHART
            self.threeDValue = ko.observable('off');
            self.threeDToggle = ko.observableArray([]);
            self.optionText = ko.observable("Switch On 3D View");
            self.changedChartView = ko.computed(function() {
                let value = self.threeDToggle()[0];
                self.threeDValue(value);
                if (value) {
                    $("#option").text("");
                    $("#option").append('<span class="oj-button-text">Switch Off 3D View</span>');
                } else {
                    $("#option").text("");
                    $("#option").append('<span class="oj-button-text">Switch On 3D View</span>');
                };
            }, this);

            self.dataLabelPositionValue = ko.observable('outsideSlice');
            self.pieSeriesValue = ko.observableArray([]);

            const ActionChart = () => {
                const initialiseChart = (logData) => {
                    let filterData = modifyData(logData);
                };

                const modifyData = (logData) => {
                    let actions = {};
                    let pieSeries = [];

                    logData.forEach(log => {
                        if (actions[log.action] === undefined) {
                            actions[log.action] = 1;
                        } else {
                            actions[log.action] += 1;
                        };
                    });

                    for (var action in actions) {
                        let actionName = action;
                        let actionValue = actions[action];

                        let actionObj = { name: actionName, items: [actionValue], pieSliceExplode: 0 };
                        pieSeries.push(actionObj);
                    };

                    self.pieSeriesValue(pieSeries);
                };
                return {
                    initialiseChart
                }
            }

            let actionChart = ActionChart();

            self.explodeButtonClick = function(event) {
                let series = self.pieSeriesValue();
                for (var s = 0; s < series.length; s++) {
                    if (Math.random() < 0.5) {
                        series[s].pieSliceExplode = 2 - series[s].pieSliceExplode;
                    };
                };

                self.pieSeriesValue(series);
            };

            self.hiddenCategories = ko.observableArray([]);

            self.data = ko.observableArray();

            context.props.then(function(propertyMap) {
                //Store a reference to the properties for any later use
                self.properties = propertyMap;

                setTimeout(() => {
                    AccountFunctions().initialiseTable(self.properties.data);
                    actionChart.initialiseChart(self.properties.data);
                    self.data(self.properties.data);

                    setInterval(() => {
                        if (self.properties.data !== self.data()) {

                            AccountFunctions().initialiseTable(self.properties.data);
                            actionChart.initialiseChart(self.properties.data);
                            self.data(self.properties.data);
                            AccountFunctions().clearDefaultSearch();
                        }
                    }, 1000)
                }, 1000)
            });
        };
        return AccountGraphicsComponentModel;
    });