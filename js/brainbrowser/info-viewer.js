$(function() {
    "use strict";
    var InfoViewer=BrainBrowser.InfoViewer={
        start:function(element1,element2,callback){
            console.log("midSagittalCC Viewer Working");
            var dist_element,meta_element;
            function fontSize(res){
                let docEl = document.documentElement,
                clientWidth = window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth;
                if (!clientWidth) return;
                let fontSize = 100 * (clientWidth / 1920);
                return res*fontSize;
                };
            if (typeof element1 === "string") {
                dist_element=document.getElementById(element1);
                meta_element=document.getElementById(element2);
            } else {
                dist_element=element1;
                meta_element=element2;
            }
            var dist = echarts.init(dist_element, null, {renderer: 'canvas'});
            var meta = echarts.init(meta_element, null, {renderer: 'canvas'});
            var dist_option = {
                textStyle: {
                    color: "#fff",
                    fontSize:10,
                },
                title: [
                    {
                        left: 'center',
                        textStyle: {
                            color: "#fff",
                            fontSize: 15
                        },
                    },
                ],
                tooltip: {
                    trigger: 'item',
                    axisPointer: {
                        type: 'shadow'
                    },
                    label:{
                        precision:2
                    }
                },
                grid: {
                    left: '10%',
                    right: '10%',
                    bottom: '15%'
                },
                xAxis: {
                    type: 'category',
                    //data: ['num—mean','num-std','dist—mean','dist-std'],
                    data: ['NumMean','DistMean','DistSTD'],
                    boundaryGap: true,
                    splitArea: {
                        show: true
                    },
                    axisLabel: {
                        formatter: '{value}'
                    },
                    splitLine: {
                        show: true
                    }
                },
                yAxis: [{
                    type: 'value',
                    name: 'fiber number',
                    splitArea: {
                        show: true
                    }
                },
                    {
                        type: "value",
                        name: 'distance/mm',
                    }],
                series: [
                    {
                        name: 'boxplot',
                        type: 'boxplot',
                        //data: data.boxData,
                        tooltip: {
                            formatter: function (param) {
                                return [
                                    'upper: ' + param.data[5].toPrecision(2),
                                    'Q3: ' + param.data[4].toPrecision(2),
                                    'median: ' + param.data[3].toPrecision(2),
                                    'Q1: ' + param.data[2].toPrecision(2),
                                    'lower: ' + param.data[1].toPrecision(2)
                                ].join('<br/>');
                            }
                        }
                    },
                    {
                        name: 'outlier',
                        type: 'scatter',
                        tooltip: {
                            formatter: function (param) {
                                return 'Value: ' + param.data[1].toPrecision(2)

                            }
                        }
                        //data: data.outliers
                    }
                ]
            };
            var meta_option = {
                textStyle: {
                    color: "#fff",
                    fontSize:10,
                },

                tooltip: {
                    trigger: 'axis',
                    axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                    },
                },
                legend: {
                    data: ['Left', 'Right']
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'value'
                    }
                ],
                yAxis: [
                    {
                        type: 'category',
                        axisTick: {
                            show: false
                        },
                        data: ['', '', '', '', '', '','','','','']
                    }
                ],
                series: [
                    {
                        name: 'Left',
                        type: 'bar',
                        label: {
                            show: true,
                            position: 'inside',

                        },
                        /*data: [200, 170, 240, 244, 200, 220, 210]*/
                    },
                    {
                        name: 'Right',
                        type: 'bar',
                        label: {
                            show: true,
                            position: 'inside'
                        },
                        /*data: [320, 302, 341, 374, 390, 450, 420]*/
                    },

                ]
            };
            meta.setOption(meta_option);
            dist.setOption(dist_option);
            var info_view={
                meta_chart:meta,
                dist_chart:dist,
                loadInfo:function(path){
                    console.log(path);
                    let result_data,distance_data,template;
                    if (window.loading_con==2){
                        let str = $("[name=voxelSizeSelect]:checked")[0].nextSibling.data;
                        template=str.split(" ")[1]
                    }else if(window.loading_con==1){
                        let str = $("[name=parcelSelect]:checked")[0].nextSibling.data;
                        template=str.split(" ",3)[1]
                    }
                    $.get(path.result).done(function (data) {
                        //result_data=data;
                        //$.get(path.distance).done(function (data) {
                            //distance_data=data;
                            let new_data = dataTool.prepareBoxplotData([data.data_number,data.data_mean,data.data_std]);
                            let option =info_view.dist_chart.getOption();
                            option.title[0].text =template+':'+path.roiName;
                            option.series[0].data =new_data.boxData;
                            option.series[1].data = new_data.outliers;
                            info_view.dist_chart.setOption(option);
                            $("#information-box").show();
                        //});
                    });
                },
                loadMetaInfo:function(roi,template){
                let label1, label2
                label1=roi.substr(0,3)
                label2=roi.substr(4,3)
                let settings = {
                    "url": "/parcelmeta?template="+template+"&roi1="+label1+"&roi2="+label2,
                    "type": "GET",
                    "timeout": 0,
                    "processData": false,
                    "mimeType": "multipart/form-data",
                    "contentType": false,
                    "data": new FormData()
                };
                $.ajax(settings).done(function (res) {
                    let response=eval('(' + res + ')');;
                    var behavior=response.behavior;

                    console.log(response.behavior);
                    let option = info_view.meta_chart.getOption();
                    option.tooltip.formatter=function(params){
                        return beclass[params.dataIndex]+':'+params.data
                    };
                    let template = $("[name=parcelSelect]:checked").val();
                    if(template==='BN_Atlas'){
                        option.series[0].data =response.zscore.slice(0,10);
                        option.series[1].data =response.zscore.slice(10);
                        option.series[0].label.formatter =function(params){
                            return behavior[params.dataIndex]
                        };
                        option.series[1].label.formatter =function(params){
                            return behavior[params.dataIndex]
                        };
                    }else{
                        option.series[1].data =response.zscore.slice(0,10);
                        option.series[0].data =response.zscore.slice(10);
                        option.series[1].label.formatter =function(params){
                            return behavior[params.dataIndex]
                        };
                        option.series[0].label.formatter =function(params){
                            return behavior[params.dataIndex]
                        };
                    }
                    info_view.meta_chart.setOption(option);
                    $("#metainfo-box").show();
                });
            }
            }
   
            callback(info_view);
            return info_view;
        }
    }
})