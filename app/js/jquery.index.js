( function(){

    $(function () {
        new Weather();

        $('select').selectize({
            maxItems: 5
        });

    });

    var Weather = function() {

        var _request = new XMLHttpRequest(),
            _key = 'ba510a655d11785dba8eae5e9434ec15',
            _path = 'http://api.openweathermap.org/data/2.5/forecast',
            _select = $('#city'),
            _fromTime = $('#from-time'),
            _toTime = $('#to-time'),
            _chartData = [],
            _sendCounter = 0,
            _chartOptions = {
                title: 'Chart',
                curveType: 'function',
                legend: { position: 'bottom' }
            },
            _chartTemp = document.getElementById('chart-temp'),
            _chartPressure = document.getElementById('chart-pressure'),
            _chartHumidity = document.getElementById('chart-humidity'),
            _chartWind = document.getElementById('chart-wind');

        var _addEvents = function() {

                _select.on({
                    'change': function() {
                        var curVal = $(this).val();
                        if (curVal) {
                            _checkData(curVal);
                        } else {
                            _createChart();
                        }
                    }
                });

                _fromTime.on({
                    'change': function() {
                        var curVal = _select.val();
                        if (curVal) {
                            _checkData(curVal);
                        } else {
                            _createChart();
                        }
                    }
                });

                _toTime.on({
                    'change': function() {
                        var curVal = _select.val();
                        if (curVal) {
                            _checkData(curVal);
                        } else {
                            _createChart();
                        }
                    }
                });

            },
            _ajaxRequest = function() {

                _request.abort();
                _request = $.ajax({
                    url: _path,
                    data: {
                        q: _select.val()[_sendCounter],
                        appid: _key,
                        units: 'metric',
                        cnt: 8
                    },
                    dataType: 'html',
                    timeout: 20000,
                    type: "get",
                    success: function (data) {
                        sessionStorage.setItem(_select.val()[_sendCounter], data);
                        _chartData.push(JSON.parse(data));
                        _sendCounter++;

                        if (_sendCounter < _select.val().length) {
                            _ajaxRequest();
                        } else {
                            _drawChart();
                        }
                    },
                    error: function ( XMLHttpRequest ) {
                        if( XMLHttpRequest.statusText != "abort" ) {
                            alert( 'Error!' );
                        }
                    }
                });

            },
            _checkData = function (value) {
                var canDraw = true;
                _chartData = [];
                _sendCounter = 0;

                value.forEach(function (item) {

                    if (sessionStorage.getItem(item)) {
                        _sendCounter++;
                        _chartData.push(JSON.parse(sessionStorage.getItem(item)));
                    } else {
                        canDraw = false;
                        _ajaxRequest();
                    }
                });

                if (canDraw) _drawChart();
            },
            _showChart = function (dataArr, title, elem) {
                if (dataArr.length > 1) {
                    var data = google.visualization.arrayToDataTable(dataArr);

                    var options = {
                        title: title,
                        curveType: 'function',
                        legend: { position: 'bottom' }
                    };

                    var chart = new google.visualization.LineChart(elem);

                    chart.draw(data, options);
                } else {
                    _createChart();
                }
            },
            _createChart = function () {
                google.charts.load('current', {'packages':['corechart']});
                google.charts.setOnLoadCallback(function () {
                    var data = google.visualization.arrayToDataTable([['hours', ''], ['00:00', 0]]);

                    var chartTemp = new google.visualization.LineChart(_chartTemp);
                    _chartOptions.title = 'Temp';
                    chartTemp.draw(data, _chartOptions);

                    var chartPressure = new google.visualization.LineChart(_chartPressure);
                    _chartOptions.title = 'Pressure';
                    chartPressure.draw(data, _chartOptions);

                    var chartHumidity = new google.visualization.LineChart(_chartHumidity);
                    _chartOptions.title = 'Humidity';
                    chartHumidity.draw(data, _chartOptions);

                    var chartWind = new google.visualization.LineChart(_chartWind);
                    _chartOptions.title = 'Wind';
                    chartWind.draw(data, _chartOptions);
                });
            },
            _drawChart = function () {
                var from = new Date(),
                    to = new Date();

                from.setHours(_fromTime.val().slice(0, -3), 0, 0, 0);
                to.setHours(_toTime.val().slice(0, -3), 0, 0, 0);

                if (_fromTime.val().slice(0, -3) == '00' || _toTime.val().slice(0, -3) == '00') {
                    from.setHours(from.getHours() - 1);
                    to.setHours(to.getHours() + 1);
                }

                _drawTemp(from, to);
                _drawPressure(from, to);
                _drawHumidity(from, to);
                _drawWind(from, to);
            },
            _drawTemp = function (fromTime, toTime) {
                var dataArr = [['hours']];

                    _chartData.forEach(function (elem, index) {
                    dataArr[0].push(elem.city.name);

                    var pos = 1;

                    elem.list.forEach(function (item) {

                        var itemTimestamp = item.dt*1000,
                            date = new Date(itemTimestamp),
                            hours = date.getHours();

                        if (itemTimestamp >= fromTime.getTime() && itemTimestamp <= toTime.getTime()) {
                            if (index) {
                                dataArr[pos].push(item.main.temp);
                                pos++;
                            } else {
                                dataArr.push([hours + ':00', item.main.temp]);
                            }
                        }
                    });
                });

                _showChart(dataArr, 'Temp', _chartTemp);

            },
            _drawPressure = function (fromTime, toTime) {
                var dataArr = [['hours']];

                _chartData.forEach(function (elem, index) {
                    dataArr[0].push(elem.city.name);

                    var pos = 1;

                    elem.list.forEach(function (item) {

                        var itemTimestamp = item.dt*1000,
                            date = new Date(itemTimestamp),
                            hours = date.getHours();

                        if (itemTimestamp >= fromTime.getTime() && itemTimestamp <= toTime.getTime()) {
                            if (index) {
                                dataArr[pos].push(item.main.pressure);
                                pos++;
                            } else {
                                dataArr.push([hours + ':00', item.main.pressure]);
                            }
                        }
                    });
                });

                _showChart(dataArr, 'Pressure', _chartPressure);
            },
            _drawHumidity = function (fromTime, toTime) {
                var dataArr = [['hours']];

                _chartData.forEach(function (elem, index) {
                    dataArr[0].push(elem.city.name);

                    var pos = 1;

                    elem.list.forEach(function (item) {

                        var itemTimestamp = item.dt*1000,
                            date = new Date(itemTimestamp),
                            hours = date.getHours();

                        if (itemTimestamp >= fromTime.getTime() && itemTimestamp <= toTime.getTime()) {
                            if (index) {
                                dataArr[pos].push(item.main.humidity);
                                pos++;
                            } else {
                                dataArr.push([hours + ':00', item.main.humidity]);
                            }
                        }
                    });
                });

                _showChart(dataArr, 'Humidity', _chartHumidity);
            },
            _drawWind = function (fromTime, toTime) {
                var dataArr = [['hours']];

                _chartData.forEach(function (elem, index) {
                    dataArr[0].push(elem.city.name);

                    var pos = 1;

                    elem.list.forEach(function (item) {

                        var itemTimestamp = item.dt*1000,
                            date = new Date(itemTimestamp),
                            hours = date.getHours();

                        if (itemTimestamp >= fromTime.getTime() && itemTimestamp <= toTime.getTime()) {
                            if (index) {
                                dataArr[pos].push(item.wind.speed);
                                pos++;
                            } else {
                                dataArr.push([hours + ':00', item.wind.speed]);
                            }
                        }
                    });
                });

                _showChart(dataArr, 'Wind', _chartWind);
            },
            _init = function () {
                _createChart();
                _addEvents();
            };

        _init();

    };
} )();
