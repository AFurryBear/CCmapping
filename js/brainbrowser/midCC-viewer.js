$(function() {
    "use strict";
    //var SurfaceViewer = BrainBrowser.SurfaceViewer
    var midCCViewer = BrainBrowser.midCCViewer={
        start: function (element_volume,callback) {
            console.log("midSagittalCC Viewer Working");

            /**
             * @doc object
             * @name viewer
             * @property {DOMElement} dom_element The DOM element where the viewer
             * will be inserted.
             * @property {THREE.Object3D} model The currently loaded surface model.
             * @property {object} model_data Parameters about the current model that
             * were actually parsed from the source file.
             * @property {object} mouse Object tracking the mouse **x** and **y** coordinates
             * of the mouse on the viewer canvas.
             * @property {object} touches Object tracking the **x** and **y** coordinates
             * of all touches currently active on the canvas.
             * @property {boolean} updated Whether the canvas should redrawn on the next
             * render loop.
             * @property {float} zoom The zoom level (default: 1.0).
             * @property {object} autorotate Automatic rotations around the **x**, **y**
             * and **z** axes can be set.
             * @property {object} annotations Current annotations.
             *
             * @description
             * The viewer object encapsulates all functionality of the Surface Viewer.
             * Handlers can be attached to the **viewer** object to listen
             * for certain events occuring over the viewer's lifetime. Currently, the
             * following viewer events can be listened for:
             *
             * * **displaymodel** A new model has been displayed on the viewer.
             * * **loadintensitydata** New intensity data has been loaded.
             * * **updateintensitydata** The intensity data has been updated.
             * * **changeintensityrange** The intensity data range has been modified.
             * * **updatecolors** The model's colors have been updated.
             * * **loadcolormap** A new color map has been loaded.
             * * **blendcolormaps** Two color maps have been loaded and blended.
             * * **clearscreen** The viewer has been cleared of objects.
             * * **draw** The scene has been redrawn.
             *
             * To listen for an event, simply use the **viewer.addEventListener()** method with
             * with the event name and a callback funtion:
             *
             * ```js
             *    viewer.addEventListener("displaymodel", function() {
             *      console.log("Model displayed!");
             *    });
             * ```
             */
            var attributes = {};
            // Element where the viewer canvas will be loaded.
            var vol_element;
            if (typeof element_volume === "string") {
                vol_element = document.getElementById(element_volume);

            } else {
                vol_element = element_volume;
            }
            var midCC = echarts.init(vol_element, null, {renderer: 'canvas'});

            var option_vol = {
                grid:{
                    height:'90%',
                    bottom:50,
                    width:'95%',
                    left:20
                },
                tooltip: {
                    trigger: 'item',
                    formatter: function (params) {
                        if (params.seriesName==='CC') {
                            return ' j: ' + params.data[0] + ' k:' + params.data[1] + ' value: ' + params.data[2].toExponential(3)
                        }
                    }

                },
                toolbox: {
                    show: true,
                    feature: {
                        saveAsImage: {
                            name: 'CC_image'
                        }
                    }
                },
                legend: {
                    top: '10%',
                    show:false
                },
                dataZoom:[
                    {
                        type: 'inside',
                        xAxisIndex: [0]
                    },
                    {
                        type: 'inside',
                        yAxisIndex: [0]
                    }
                ],
                xAxis: {
                    type: 'category',
                    data: [],
                    show:false,
                    axisLabel:{
                        show:false
                    },
                    splitLine:{                 //坐标轴在 grid 区域中的分隔线。
                        show:false,              //是否显示分隔线。默认数值轴显示，类目轴不显示。
                        interval:0,        //坐标轴分隔线的显示间隔，在类目轴中有效。默认会采用标签不重叠的策略间隔显示标签。可以设置成 0 强制显示所有标签。如果设置为 1，表示『隔一个标签显示一个标签』，可以用数值表示间隔的数据，也可以通过回调函数控制。回调函数格式如下：
                        lineStyle:{
                            color:['#17202A'],
                            width:0.3,
                            opacity:0.8,
                        }
                    },
                    zlevel:2,

                },
                yAxis: {
                    type: 'category',
                    data: [],
                    show:false,
                    axisLabel:{
                        show:false
                    },
                    splitLine:{                 //坐标轴在 grid 区域中的分隔线。
                        show:true,              //是否显示分隔线。默认数值轴显示，类目轴不显示。
                        interval:0,        //坐标轴分隔线的显示间隔，在类目轴中有效。默认会采用标签不重叠的策略间隔显示标签。可以设置成 0 强制显示所有标签。如果设置为 1，表示『隔一个标签显示一个标签』，可以用数值表示间隔的数据，也可以通过回调函数控制。回调函数格式如下：
                        lineStyle:{
                            color:['#17202A'],
                            width:0.3,
                            opacity:0.8,
                        }
                    },
                    zlevel:2,
                },
                visualMap: [{
                    seriesIndex: 1,
                    min: 0,
                    max: 1,
                    range:[0,1],
                    calculable: true,
                    orient:"horizontal",
                    realtime: true,
                    itemHeight:140,
                    left:50,
                    precision:3,
                    inRange: {
                        color: ['#440357','#482374','#344989','#3E5F8D','#2A768E','#228A8D','#1E9B89','#2BB17D','#49C16D','#B5DD2B','#F7E620']

                    },
                    outOfRange:{color:['#ffffff']},
                },
                    {
                        seriesIndex: 0,
                        min: 0,
                        max: 255,
                        orient:"horizontal",
                        realtime: false,
                        show:false,
                        inRange: {
                            color: ['#17202A', '#424949', '#616A6B', '#707B7C', '#B2BABB', '#D5DBDB', '#F2F3F4', '#FFFFFF']
                        }
                    },
                ],
                series: [{
                    name: 'MNI',
                    type: 'heatmap',
                    data: [],
                    progressive : 30000,
                    progressiveThreshold : 50000,
                },
                    {
                        name: 'CC',
                        type: 'heatmap',
                        data: [],
                        emphasis: {
                            itemStyle: {
                                borderColor: '#333',
                                borderWidth: 0.3
                            }
                        },

                    }]
            };
            midCC.setOption(option_vol);
            midCC.on('click', function (params) {
                if (params.seriesName==='CC') {
                    return PrefixInteger(params.data[0], 3) + "_" + PrefixInteger(params.data[1], 3)
                }
            })
            var CCviewer= {
                dom: vol_element,
                obj: midCC,
                uploadDir:[],
                datadir:'models/Group_result1/data.json',
                colorMap4V:{
                    viridis:['#440357','#482374','#344989','#3E5F8D','#2A768E','#228A8D','#1E9B89','#2BB17D','#49C16D','#B5DD2B','#F7E620'],
                    inferno:['#000005','#290b54','#570f6D','#892269','#AC2F5C','#C43C4E','#D74B3E','#EC6726','#F8870d','#FBA40a','#F5D644'],
                    coolwarm:['#00004F','#0000A2','#0000EC','#4646FF','#D6D6FF','#FFF0F0','#FF9090','#FF0c0c','#FA0000','#C10000','#830000'],
                    hsv:['#FF0b00','#FFCE00','#9CFF00','#07FF00','#00FFB6','#00EAFF','#000fFF','#A200FF','#FF00E6','#FF0068','#FF0024']
                },
                changeColormap: function () {
                    let colorMapSelect = $('#colorMapSelect').val();
                    window.midCCviewer.obj.setOption({
                        visualMap: [{
                            seriesIndex: 1,
                            min: 0,
                            calculable: true,
                            orient: "horizontal",
                            realtime: false,

                            inRange: {
                                color: window.midCCviewer.colorMap4V[colorMapSelect]
                            }
                        },
                            {
                                seriesIndex: 0,
                                min: 0,
                                max: 255,
                                calculable: true,
                                orient: "horizontal",
                                realtime: false,
                                show: false,
                                inRange: {
                                    color: ['#17202A', '#424949', '#616A6B', '#707B7C', '#B2BABB', '#D5DBDB', '#F2F3F4', '#FFFFFF']
                                }
                            },
                        ]
                    })
                },
                inputRangeChange:function() {
                    let myChart=window.midCCviewer.obj;
                    let min_inputv = $("#maxmin_input").find("#volume-min");
                    let max_inputv = $("#maxmin_input").find("#volume-max");
                    let min = parseFloat(min_inputv.val());
                    let max = parseFloat(max_inputv.val());
                    console.log('inputRangeChange worked')

                    if (document.getElementById("volume-fixed").checked) {
                        let option = myChart.getOption();
                        option.visualMap = {
                            seriesIndex: 1,
                            range: [min, max],
                        }
                        myChart.setOption(option);
                    }else{
                        let option = myChart.getOption();
                        option.visualMap = {
                            seriesIndex: 1,
                            min:min,
                            max:max,
                            range: [min, max],
                        }
                        myChart.setOption(option);
                        myChart.on('datarangeselected', function (selected) {
                            console.log("datarangeselected worked");
                            let option = myChart.getOption();
                            option.visualMap = {
                                seriesIndex: 1,
                                min: selected.selected[0],
                                max: selected.selected[1],

                                range: [selected.selected[0], selected.selected[1]],
                            }
                            min_inputv.val(selected.selected[0].toPrecision(3));
                            max_inputv.val(selected.selected[1].toPrecision(3));
                            myChart.setOption(option);
                        })
                    }
                },
                initColorMap:function(CCviewer){
                    var myChart = CCviewer.obj;
                    myChart.on('finished', function () {
                        if (!$("#maxmin_input")[0]) {
                            let header = $("<div id=\"maxmin_input\" style=\"position:absolute;top:90%;width: 100%;height:20%;left: 0%;\"></div>");
                            let input = "<p style='display:inline;position:absolute;left:0px;padding-top:0px;height:50%;font-size:14px;padding-right: 100%;'>Min:";
                            input += "<input type=\"text\" id=\"volume-min\" value=\"\" style=\"display:inline;border:1px;position:absolute;left: 10%;width:15%;height:50%;\">";
                            input += '<span style="display:inline;position:absolute;right: 0px;padding-top:0px;height: 50%;font-size:14px;width: 25%;left: 66%;">';
                            input += "Max:<input type=\"text\" id=\"volume-max\" value=\"\" style=\"display:inline;border: 1px;position:absolute;right: -5%;width: 60%;height: 100%;\"></span></p>";
                            header.html(input);
                            header.appendTo(CCviewer.dom);
                            let option = myChart.getOption();
                            let minmax = option.visualMap[0].range;
                            let min_inputv = $("#maxmin_input").find("#volume-min");
                            let max_inputv = $("#maxmin_input").find("#volume-max");
                            min_inputv.val(minmax[0].toPrecision(3));
                            max_inputv.val(minmax[1].toPrecision(3));
                            $("#volume-min").change(function(){CCviewer.inputRangeChange()});
                            $("#volume-max").change(function(){CCviewer.inputRangeChange()});
                        } else {
                            return;
                        }
                    })
                },
                initFunction: function (CCviewer,datadir,callback) {
                    var myChart = CCviewer.obj;
                    $.get(datadir).done(function (data) {
                        myChart.setOption({
                            visualMap:{
                                seriesIndex: 1,
                                min: 0,
                                max: 1,
                                range:[0,1],
                            },
                            xAxis: {
                                data: data.x_data
                            },
                            yAxis: {
                                data: data.y_data
                            },
                            series: [
                                {
                                    data: data.data_MNI
                                },
                                {
                                    data: data.data_CC
                                }]
                        });
                    });
                    callback(CCviewer);
                },
/*                clickEvent: function (CCviewer,callback) {
                    var myChart = CCviewer.obj;
                    myChart.on('click', function (params) {
                        if (params.seriesName === 'CC') {
                            document.getElementById("blend_box").checked=false;
                            window.surfviewer.blend(1,0);
                            let index = PrefixInteger(params.data[0], 3) + "_" + PrefixInteger(params.data[1], 3);
                            window.loading_con = 2;
                            window.surfviewer.parcelSelect = []
                            $("#multi-parcels").hide();
                            $("#parcelSelection").html("<tr><td>PARCEL ID</td><td>PARCEL NAME</td></tr>");
                            let infopath = {
                                result: 'infoData/info_result2/surface_result/' + index + '.json',
                                distance: 'infoData/info_result2/surface_distance/' + index + '.json',
                                roiName: 'y:' + index.substr(0, 3) + ';z:' + index.substr(4, 3)
                            };
                            $("#volResult").hide();
                            $("#metainfo-box").hide();
                            $('#standard').attr('checked', 'true');
                            $("#weight").show();
                            let voxelSizeSelect = $('#voxelSizeSelect').val();
                            let CCPath = 'models/Group_result1/' + voxelSizeSelect + '/data_' + index + '.json';
                            callback(index, CCPath, infopath);
                        }
                    });
                },*/
                uploadData: function(datadir,type){
                    console.log("uploading");
                    console.log(datadir);
                    window.midCCviewer.datadir=datadir;
                    var myChart=window.midCCviewer.obj;
                    $.get(datadir).done(function (data) {
                        viewer.loadVolumes({
                          volumes: [
                            {
                              type: "nifti1",
                              nii_url: "models/MNI152_T1_0.7mm_mask_131.nii",
                              views:["xspace"],
                              template: {
                                element_id: "volume-ui-template",
                                viewer_insert_class: "volume-viewer-display"
                              },
                            },
                            {
                              type: 'nifti1',
                              nii_url: datadir,
                              views:["xspace"],
                              template: {
                                element_id: "volume-ui-template",
                                viewer_insert_class: "volume-viewer-display"
                              },
                            }
                          ],
                          overlay: {
                            views:["xspace"],
                            template: {
                              element_id: "overlay-ui-template",
                              viewer_insert_class: "overlay-viewer-display",

                            },
                            header:{
                              space_length:[0,311,260],
                              //step:[-0.699999988079071,0.699999988079071,0.699999988079071],
                              step:[-0.699999988079071,0.699999988079071,0.699999988079071],
                              start:[-1.699998378753662,-126,-72],
                              offset: [1,10,10]
                            }

                          },
                          complete: function() {
                            loading_div.hide();
                            $("#brainbrowser-wrapper").slideDown({duration: 600});
                          }
                        });
/*                        let option = myChart.getOption();
                        option.series[1].data = data.data_CC;
                        if (type) {
                            option.toolbox[0].feature.saveAsImage.name='result'
                            if (data.data_max===0){
                                option.visualMap = {
                                    seriesIndex: 1,
                                    min: 0,
                                    max: 1,
                                    range:[0,1],
                                }
                            }else{
                                option.visualMap = {
                                    seriesIndex: 1,
                                    min: 0,
                                    max: data.data_max,
                                    range: [0, data.data_max],
                                }
                                let min_inputv = $("#maxmin_input").find("#volume-min");
                                let max_inputv = $("#maxmin_input").find("#volume-max");
                                min_inputv.val(0);
                                max_inputv.val(data.data_max.toFixed(3));
                            }
                        }else{
                            option.visualMap = {
                                seriesIndex: 1,
                                min: 0,
                                max: 1,
                                range:[0,1],
                            }
                        }
                        myChart.setOption(option);*/
                    });
                },
                uploadMask:function(callback){
                    var form = new FormData(document.getElementById("volume-file"));
                    $.ajax({
                        url:"/upload",
                        type:"post",
                        data:form,
                        processData:false,
                        contentType:false,
                        success:function(data){
                            console.log("over..");
                            callback(data);
                        },
                        beforeSend: function(){
                            $("#resultSelect").show();
                            let div = $("#resultSelect");
                            div.html("");
                            $("#loading-fullpage").show();
                        },
                        error:function(e){
                            alert("ERROR IN UPLOADING! ");
                        },
                        complete: function(){
                        }
                    });
                },
                changeMask:function(pathobj,callback){
                    window.loading_con=3;
                    let element = {};
                    element.id='mask'+(window.midCCviewer.uploadDir.length+1);
                    element.path =pathobj.path+'/';
                    window.midCCviewer.uploadDir.push(element);
                    if (window.midCCviewer.uploadDir.length>2){
                        $('#volume-file').hide();}
                    $("#mask"+(window.midCCviewer.uploadDir.length)).attr("value",pathobj.path+'/');
                    $("#mask"+(window.midCCviewer.uploadDir.length)).attr("disabled",false);
                    $("#mask"+(window.midCCviewer.uploadDir.length)).attr('checked', 'true');
                    $("#mask"+window.midCCviewer.uploadDir.length+"_name").html(pathobj.name);
                    callback();
                },
                genResultPath: function(callback){
                    console.log("reloading");
                    var info = window.surfviewer.model_data.get();
                    var fileName = info.intensity_data[0].name;
                    var index = fileName.substr(6,7);
                    var Num_1 = Number(index.substr(0,3));
                    var Num_2 = Number(index.substr(4,3));
                    if (Num_1-Num_2===180){
                        var template = "HCPMMP_result/";
                    }else{
                        var template="BN_Atlas_result/";
                    }
                    let weightSelect = $("[name=weightVol]:checked").val();
                    window.midCCviewer.datadir="models/Group_result1/Group_result1/"+template+index+'_'+weightSelect+"_000.json";
                    console.log("models/Group_result1/Group_result1/"+template+index+'_'+weightSelect+"_000.json");
                    callback("models/Group_result1/Group_result1/"+template+index+'_'+weightSelect+"_000.json");
                },
                resultPanel: function(callback){
                    let container = $("#volResult");
                    if ($("#volresultType").length<1) {
                        let headers = '<div id="volresultType" class="box full_box"><h3>Result Type</h3>';
                        let select = "";
                        container.html("");
                        select += '<div id="weightVol"><label for="weightVol"> Weighted Methods: ';
                        select += '<input type="radio" name="weightVol" value="mask">Mask';
                        select += '<input type="radio" name="weightVol" value="percen" checked="true">Percent';
                        select += '</label></div><br />';
                        container.html(headers + select + "</div><br/>");
                    }
                    $("#volResult").show();
                    $("[name=weightVol]").change(function(){
                        console.log("reloading")
                        window.midCCviewer.genResultPath(function(path){
                            window.midCCviewer.uploadData(path,true);
                        });
                    });
                    callback();
                },
                /**
                 * @doc function
                 * @name viewer.attributes:setAttribute
                 * @param {string} name Name of the attribute to retrieve.
                 * @param {any} value Value to set the attribute to.
                 *
                 * @description
                 * Set the value of an attribute.
                 *
                 * The viewer object can maintain an arbitrary set of key-value
                 * pairs to aid in the functioning of various parts of the system.
                 * ```js
                 * viewer.setAttribute("fix_color_range", false);
                 * ```
                 *
                 * Currently, the following attributes are used by the Surface Viewer:
                 *
                 * * **fix\_color\_range** Maintain the current intensity range, even if new data is
                 *   loaded.
                 */

            }
            callback(CCviewer);
            return CCviewer
        }

    }

})