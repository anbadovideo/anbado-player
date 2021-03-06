/**
 * Created with JetBrains WebStorm.
 * User: mijong
 * Date: 13. 8. 22.
 * Time: 오후 3:01
 * To change this template use File | Settings | File Templates.
 */

//var anbado = window.anbado || {};

//var anbadoDummy=(function($){


var anbadoTimeLine=function(getId)
{
    this.videoId="#"+getId;
    /**
     * 타임라인 그래프의 종류를 나타낸다.
     *
     *  1: Stacked Area Chart
     *  2: Line Chart
     *  3: Pie Chart
     *  4: Half Pie Chart
     *
     * @type {number}
     */
    this.graphShape = 1;

    /**
     * Good 버튼을 누른 타임라인 데이터
     *
     * @type {Array}
     */
    this.goodData = [];

    /**
     * Bad 버튼을 누른 타임라인 데이터
     *
     * @type {Array}
     */
    this.badData = [];

    this.dummData=[];

    this.currentTime=0;
    this.durationTime=0;
}

    anbadoTimeLine.prototype.getCurrentTime= function(inputTime)
    {
        this.currentTime=inputTime;

    }



    /**
     * 타임라인 그래프를 초기화 한다.
     *
     * @param time 동영상의 길이
     */
    anbadoTimeLine.prototype.initialize = function(time) {
        var hei=$(this.videoId).css("height");
        var wid=$(this.videoId).css("width");


//        $("#youtube").append(" <div id ='chartWrapper'></div>");
        $(this.videoId).append("<div class='areadiv'><svg id='stackedarea'></svg></div>");
        $("#stackedarea").css("top",hei);
        $("#stackedarea").css("width",wid);
        $(this.videoId).append("<div class='linediv' ><svg id='linechart'></svg></div>");
        $("#linechart").css("top",hei);
        $("#linechart").css("width",wid);
        $(this.videoId).append("<div class='piediv' id='pichart'><svg id='pie' class='mypiechart'></svg></div>");
        $("#pichart").css("top",hei);
        $("#pichart").css("left",(parseInt(wid)/3)+"px");
        $(this.videoId).append("<div class='halfdiv' id='halfchart'><svg id='halfpi' class='mypiechart'></svg></div>");
        $("#halfchart").css("top",hei);
        $("#halfchart").css("left",(parseInt(wid)/3)+"px");
        $(this.videoId).append("  <div class='bardiv' ><svg id='barchart'> </svg></div>");
        $("#barchart").css("top",hei);
        $("#barchart").css("width",wid);

        this.makeTimelineDataArray(time);
        this.drawStackedAreaChart();
        this.durationTime=time;
    };

    /**
     * 주어진 시간 길이에 맞게 타임라인에 필요한 배열을 생성한다.
     *
     * @param time 동영상의 길이
     */
    anbadoTimeLine.prototype.makeTimelineDataArray = function(time) {


        this.goodData = [];
        this.badData = [];
        this.dummData=[];

        time = parseInt(time) + 1; // TODO: time 값에 1을 더하는 이유에 대해서 확인하기
        console.log("array time: " + time);

        for (var i = 0; i < time; i++) {
            // TODO: 0.5 값이 적당한지 확인 필요
            // goodData[i][0] = 시간
            // goodData[i][1] = 데이터 (갯수)
            this.goodData[i] = [i, 0];
            this.badData[i] = [i, 0];
            this.dummData[i]=[i,0.1];

        }
    };

    /**
     * 주어지는 timeline canvas위에 툴팁을 그린다.
     *
     * @param svgObject 툴팁을 그릴 timeline canvas
     */
    anbadoTimeLine.prototype.tooltip = function(svgObject) {

        var con;
        var $svgObject = $(svgObject);

        var top=parseInt($svgObject.css("height"));
        // TODO: CLIENTVAR를 사용하지 않도록 popcornobj에 대한 대책 필요
        var offset = parseInt($svgObject.css("left"));

        var time=this.durationTime;

        time=parseInt(time);
        time=((parseInt($svgObject.css("width")))/time);
        con=parseInt(this.currentTime);
        //con=parseInt(con/60)+":"+(con%60);
        con="good"+(this.goodData[con][1]);

        nv.tooltip.cleanup();
        nv.tooltip.show([offset+this.currentTime*time, top], con, '', null, 0);
    };

    /**
     * 그래프 모양을 변경한다.
     *
     * @param newGraphShape 새로 변경할 그래프 모양
     */
    anbadoTimeLine.prototype.setGraphShape = function(newGraphShape) {
        this.graphShape = newGraphShape;
    };

    /**
     * Stacked Area Chart를 그린다.
     */
    anbadoTimeLine.prototype.drawStackedAreaChart = function() {
        var videoData = [
            {
                "key": "good",
                "values": this.goodData,
                color: "red"
            },
            {
                "key": "bad",
                "values": this.badData,
                color: "green"
            },
            {
                "key": "dummy",
                "values": this.dummData,
                color: "white"
            }

        ];



        var colors = d3.scale.category20();
        var keyColor = function (d, i) {
            return colors(d.key)
        };

        var chart;
        nv.addGraph(function () {
            chart = nv.models.stackedAreaChart()
                .x(function (d) {
                    return d[0];
                })
                .y(function (d) {
                    return d[1];
                })
                .color(keyColor)
            //.clipEdge(false);

// chart.stacked.scatter.clipVoronoi(false);        // x축 날짜로 나타남
//
//  chart.xAxis
//      .tickFormat(function(d) { return d3.time.format('%x')(new Date(d)) });

            chart.yAxis
                .tickFormat(d3.format(',.2f'));

            d3.select('#stackedarea')
                .datum(videoData)
                .transition().duration(500).call(chart);

            nv.utils.windowResize(chart.update);

            chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });

            return chart;
        });
    };

    /**
     * Line Chart를 그린다.
     */
    anbadoTimeLine.prototype.drawLineChart = function() {
        // Wrapping in nv.addGraph allows for '0 timeout render', stores rendered charts in nv.graphs, and may do more in the future... it's NOT required
        var chart;
        var lineGoodData = [], lineBadData = [],linedummy=[];
        for (var i = 0; i < this.goodData.length; i++) {
            lineGoodData.push({x: this.goodData[i][0], y: this.goodData[i][1]}); //the nulls are to show how defined works
            lineBadData.push({x: this.badData[i][0], y: this.badData[i][1]});
            linedummy.push({x: this.dummData[i][0], y: this.dummData[i][1]})
        }


        var test =[
            {
                values: linedummy,
                key: "dummy",
                color: "white"
            }

            ,{
                values: lineGoodData,
                key: "good",
                color: "red"
            },
            {
                values: lineBadData,
                key: "bad",
                color: "green"
            }



        ];


        nv.addGraph(function() {
            chart = nv.models.lineChart();

            chart
                .x(function(d,i) { return i })


            chart.xAxis // chart sub-models (ie. xAxis, yAxis, etc) when accessed directly, return themselves, not the parent chart, so need to chain separately
                .tickFormat(d3.format(',.1f'));

            chart.yAxis
                .axisLabel('Voltage (v)')
                .tickFormat(d3.format(',.2f'));

            chart.showXAxis(true);

            d3.select('#linechart')
                //.datum([]) //for testing noData
                .datum(test)
                .transition().duration(500)
                .call(chart);

            //TODO: Figure out a good way to do this automatically
            nv.utils.windowResize(chart.update);
            //nv.utils.windowResize(function() { d3.select('#chart1 svg').call(chart) });

            chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });

            return chart;
        });
    };

    /**
     * pie chart 를 그린다.
     */
    anbadoTimeLine.prototype.drawPieChart = function() {
        var goodpi = 0, badpi = 0;

        for (var k = 0; k < this.goodData.length; k++) {
            goodpi = goodpi + (this.goodData[k][1]);
            badpi = badpi + (this.badData[k][1]);
        }

        var testdata = [
            {
                key: "good",
                y: goodpi
            },
            {
                key: "bad",
                y: badpi
            }
        ];

        nv.addGraph(function () {
            var width = 200,
                height = 200;

            var chart = nv.models.pieChart()
                .x(function (d) {
                    return d.key
                })
                .y(function (d) {
                    return d.y
                })
                //.showLabels(false)
                .values(function (d) {
                    return d
                })
                .color(d3.scale.category10().range())
                .width(width)
                .height(height);

            d3.select("#pie")
                .datum([testdata])
                .transition().duration(1200)
                .attr('width', width)
                .attr('height', height)
                .call(chart);

            chart.dispatch.on('stateChange', function (e) {
                nv.log('New State:', JSON.stringify(e));
            });

            return chart;
        });
    };

    /**
     * Half Pie Chart를 그린다.
     */
    anbadoTimeLine.prototype.drawHalfPieChart = function() {
        var goodpi = 0, badpi = 0;

        for (var k = 0; k < this.goodData.length; k++) {
            goodpi = goodpi + (this.goodData[k][1]);
            badpi = badpi + (this.badData[k][1]);
        }

        var testdata = [
            {
                key: "good",
                y: goodpi
            },
            {
                key: "bad",
                y: badpi
            }
        ];

        nv.addGraph(function () {

            var width = 200,
                height = 200;

            var chart = nv.models.pieChart()
                .x(function (d) {
                    return d.key
                })
                //.y(function(d) { return d.value })
                .values(function (d) {
                    return d
                })
                //.labelThreshold(.08)
                //.showLabels(false)
                .color(d3.scale.category10().range())
                .width(width)
                .height(height)
                .donut(true);

            chart.pie
                .startAngle(function (d) {
                    return d.startAngle / 2 - Math.PI / 2
                })
                .endAngle(function (d) {
                    return d.endAngle / 2 - Math.PI / 2
                });

            //chart.pie.donutLabelsOutside(true).donut(true);

            d3.select("#halfpi")
                //.datum(historicalBarChart)
                .datum([testdata])
                .transition().duration(1200)
                .attr('width', width)
                .attr('height', height)
                .call(chart);

            return chart;
        });
    };

    /**
     * bar chart 를 그린다.
     */
    anbadoTimeLine.prototype.drawBarChart = function() {
        var testdata = [
            {
                "key": "Quantity",
                "bar": true,
                "values": this.goodData,
                color:"red"
            }
        ].map(function (series) {
                series.values = series.values.map(function (d) {
                    return {x: d[0], y: d[1] }
                });
                return series;
            });


        var chart;

        nv.addGraph(function () {

            chart = nv.models.linePlusBarChart()
                .margin({top: 30, right: 60, bottom: 50, left: 70})
                .x(function (d, i) {
                    return i
                })
                .color(d3.scale.category10().range());

//            chart.xAxis.tickFormat(function (d) {
//                var dx = testdata[0].values[d] && testdata[0].values[d].x || 0;
//                return dx ? d3.time.format('%x')(new Date(dx)) : '';
//            })
//                .showMaxMin(false);

            chart.y1Axis
                .tickFormat(d3.format(',f'));

            chart.y2Axis
                .tickFormat(function (d) {
                    return '$' + d3.format(',.2f')(d)
                });

//            chart.bars.forceY([0]).padData(false);
//            chart.lines.forceY([0]);

            d3.select('#barchart')
                .datum(testdata)
                .transition().duration(500).call(chart);

            nv.utils.windowResize(chart.update);

            chart.dispatch.on('stateChange', function (e) {
                nv.log('New State:', JSON.stringify(e));
            });

            return chart;
        });
    };


    /**
     * 지정된 그래프 타입에 따라 적절한 그래프를 선택하여 그린다.
     */
    anbadoTimeLine.prototype.drawVisualization = function(state) {

        var inttime=this.currentTime;
        inttime=parseInt(inttime);


        if(state==='g')
        {this.goodData[inttime][1] = (this.goodData[inttime][1]+1);}
        else if(state==='b')
        {this.badData[inttime][1] = (this.badData[inttime][1]+1);}



        switch(this.graphShape) {
            case 1:
                $('.areadiv').show();
                $('.linediv').hide();
                $('.piediv').hide();
                $('.halfdiv').hide();
                $('.bardiv').hide();
                this.drawStackedAreaChart();
                break;
            case 2:
                $('.areadiv').hide();
                $('.linediv').show();
                $('.piediv').hide();
                $('.halfdiv').hide();
                $('.bardiv').hide();
                this.drawLineChart();
                break;
            case 3:
                $('.areadiv').hide();
                $('.linediv').hide();
                $('.piediv').show();
                $('.halfdiv').hide();
                $('.bardiv').hide();
                this.drawPieChart();
                break;
            case 4:
                $('.areadiv').hide();
                $('.linediv').hide();
                $('.piediv').hide();
                $('.halfdiv').show();
                $('.bardiv').hide();
                this.drawHalfPieChart();
                break;
            case 5:
                $('.areadiv').hide();
                $('.linediv').hide();
                $('.piediv').hide();
                $('.halfdiv').hide();
                $('.bardiv').show();
                this.drawBarChart();
                break;
        }
    };

//    return {
//        timeline: {
//            initialize: initialize,
//            drawVisualization: drawVisualization,
//            tooltip: tooltip,
//            setGraphShape: setGraphShape,
//            getCurrentTime:getCurrentTime
//        }
//    }
//});
//
//
//
//jQuery.extend(true, anbado,anbadoDummy(jQuery));


//var timeset=2;
//function happybutton()
//{
//
//    if (timeset === 2) {
//        console.log("gray");
//        $("#happy1").css({"background": 'gray'});
//        anbado.timeline.drawVisualization('g');
//        timeset = 1;
//
//        if (timeset === 1) {
//            setTimeout(function () {
//                console.log("red");
//                $("#happy1").css({"background": 'crimson'});
//               timeset = 2;
//            }, 5000);
//            timeset = 0;
//        }
//    }
//
//}
//
//function sadbutton()
//{
//
//    if (timeset === 2) {
//        anbado.timeline.drawVisualization('b');
//        timeset = 1;
//        if (timeset === 1) {
//            setTimeout(function () {
//                timeset = 2;
//            }, 5000);
//            timeset = 0;
//        }
//    }
//
//}

//function graphselect()
//{
////    var gra=document.selectform;
//    var graphTemp = $("#graphSelector").val();
//
//    if (graphTemp === "1")//area graph
//    {
//        anbado.timeline.setGraphShape(1);
//        anbado.timeline.drawVisualization();
//
//    }
//    else if (graphTemp === "2") //line graph
//    {
//        anbado.timeline.setGraphShape(2);
//        anbado.timeline.drawVisualization();
//        console.log("top:"+($('#linechart').top));
//    }
//    else if (graphTemp === "3") {
//
//        anbado.timeline.setGraphShape(3);
//        anbado.timeline.drawVisualization();
//    }
//    else if (graphTemp === "4") {
//
//        anbado.timeline.setGraphShape(4);
//        anbado.timeline.drawVisualization();
//    }
//    else if (graphTemp === "5") {
//
//        anbado.timeline.setGraphShape(5);
//        anbado.timeline.drawVisualization();
//        console.log("top:"+($('#barchart').top));
//    }
//
//}
