    /*
     * BrainBrowser: Web-based Neurological Visualization Tools
     * (https://brainbrowser.cbrain.mcgill.ca)
     *
     * Copyright (C) 2011
     * The Royal Institution for the Advancement of Learning
     * McGill University
     *
     * This program is free software: you can redistribute it and/or modify
     * it under the terms of the GNU Affero General Public License as
     * published by the Free Software Foundation, either version 3 of the
     * License, or (at your option) any later version.
     *
     * This program is distributed in the hope that it will be useful,
     * but WITHOUT ANY WARRANTY; without even the implied warranty of
     * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     * GNU Affero General Public License for more details.
     *
     * You should have received a copy of the GNU Affero General Public License
     * along with this program.  If not, see <http://www.gnu.org/licenses/>.
     */

    /*
     * Author: Tarek Sherif <tsherif@gmail.com> (http://tareksherif.ca/)
     * Author: Nicolas Kassis
     */

    // This script is meant to be a demonstration of how to
    // use most of the functionality available in the
    // BrainBrowser Surface Viewer.
    $(function () {
        "use strict";
        var THREE = BrainBrowser.SurfaceViewer.THREE;
        var atlas_labels = {
            HCPMMP_value: {},
            BN_Atlas_value: {},
            Parcel_L_value: {},
            Parcel_R_value: {},
            atlas_labels: {},
            HCPMMP_label: {},
            BN_Atlas_label: {},
            Parcel_L_label: {},
            Parcel_R_label: {},
        };
        //condition memo
        /*
          0. HCPMMP/BN_Atlas parcellations=>Whole CC
          1. HCPMMP/BN_Atlas parcels=>CC result
          2. Standard result=>CC voxel
          3. CC INPUT ROI result=>UPLOAD CC mask
          4. Surface INPUT ROI Mask=>UPLOAD CC result
         */
        window.loading_con = 0;
        window.multiParcel = 0;
        window.track_Info = {
            con:0,
            height :780
        };
        
        $('#surface-controls').tabs();



        // $("#download-button").click(function () {
        //     let urlinfo = window.surfviewer.getGiftiURL();
        //     download_Req(urlinfo, 'test.label.gii');
        // })


        // $("#download-button2").click(function () {
        //     let info = window.viewer.datadir;
        //     console.log(info)
        //     let urlinfo = info.slice(0, -4) + 'nii';
        //     download_Req(urlinfo, 'test.nii');
        // })

        $("#clear-button").click(function () {
            /*$("#shapes").hide();$("#shapes").hide();*/
            $("#parcellations").show();
            let parcel;
            if ($("[name=template]")) {
                parcel = $("[name=template]:checked").val();
            } else {
                parcel = $("[name=parcelSelect]:checked").val();
            }
            if (parcel === "BN_Atlas") {
                $("[name=parcelSelect]")[1].checked = true;
                $("[name=parcelSelect]")[0].checked = false;
            } else if (parcel === "vertice" || parcel === "HCPMMP") {
                $("[name=parcelSelect]")[0].checked = true;
                $("[name=parcelSelect]")[1].checked = false;
            }
            let info = window.surfviewer.model_data.get();
            window.surfviewer.setAttribute("fix_color_range", false);
            surfviewer.getDataURL(info, surfviewer, function (url, viewer, colormap, template) {
                viewer.loadfromURL(url, viewer, colormap, template)
            });
            $("#shapes").html("");

        });

        $("#fake-gifti-upload").click(function () {
            $("#gifti1-file").click();
        })
        $("#gifti1-file").change(function () {
            $("#surface-file-gifti1-submit").click();
        })






        // Request variables used to cancel the current request
        // if another request is started.
        var current_request = 0;
        var current_request_name = "";

        // Hide or display loading icon.
        var loading_div = $("#loading");

        function showLoading() {
            loading_div.show();
        }

        function hideLoading() {
            loading_div.hide();
        }

        document.addEventListener('DOMContentLoaded', function () {
            $("#loading-fullpage").hide();
        });

        // Make sure WebGL is available.
        if (!BrainBrowser.WEBGL_ENABLED) {
            $("#brainbrowser").html(BrainBrowser.utils.webGLErrorMessage());
            return;
        }

        $.get("models/mmp_labels.txt", function (data) {
            var lines = data.split("\n");
            var regex = /'(.+)'\s+(\d+)\s+(.+)/;

            lines.forEach(function (line) {
                var match = line.match(regex);
                if (match) {
                    atlas_labels.HCPMMP_label[match[2]] = {
                        label: match[1],
                        homo: match[3]
                    };
                }
            });
        });

        $.get("models/bna_labels.txt", function (data) {
            var lines = data.split("\n");
            var regex = /'(.+)'\s+(\d+)\s+(.+)/;;

            lines.forEach(function (line) {
                var match = line.match(regex);
                if (match) {
                    atlas_labels.BN_Atlas_label[match[2]] = {
                        label: match[1],
                        homo: match[3]
                    };
                }
            });
        });

        $.get("models/parcelL_labels.txt", function (data) {
            var lines = data.split("\n");
            var regex = /(.+)\s+(\d+)\s+(.+)/;

            lines.forEach(function (line) {
                var match = line.match(regex);
                if (match) {
                    atlas_labels.Parcel_L_label[match[2]] = {
                        label: match[1],
                        homo: match[3]
                    };
                }
            });
        });

        $.get("models/parcelR_labels.txt", function (data) {
            var lines = data.split("\n");
            var regex = /(.+)\s+(\d+)\s+(.+)/;

            lines.forEach(function (line) {
                var match = line.match(regex);
                if (match) {
                    atlas_labels.Parcel_R_label[match[2]] = {
                        label: match[1],
                        homo: match[3]
                    };
                }
            });
        });

        $.get("models/vertice_labels.txt", function (data) {
            var lines = data.split("\n");
            var regex = /(.+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/;
            lines.forEach(function (line) {
                var match = line.match(regex);
                if (match) {
                    atlas_labels.HCPMMP_value[match[1]] = match[2];
                    atlas_labels.BN_Atlas_value[match[1]] = match[3];
                    atlas_labels.Parcel_L_value[match[1]] = match[4];
                    atlas_labels.Parcel_R_value[match[1]] = match[5];
                }
            });
        });



        $("#trackInfo-button").click(function () {
            var height;
            if (window.loading_con>2){
                return;

            }else if(window.loading_con==1){
                height=700;
            }else{
                height=360;
            }
            var div=$("#control-content");
            var meta=document.getElementById("metainfo-box");
            if (window.track_Info.con==0) {
                console.log()
                window.track_Info.con=1;
                $("<div></div>").append(div).dialog({
                    title: "TrackInfo",
                    height:  height,
                    width:  360,
                    position: [ $(window).width()-1.15*360,50 ]
                })
            } else {
                window.track_Info.con=0
            }
        })
        $("#results_colormap_con").click();

        /////////////////////////////////////
        // Start running the Surface Viewer
        /////////////////////////////////////
        window.surfviewer = BrainBrowser.SurfaceViewer.start("surface-browser", function (surfviewer) {
            console.log("Surface rendering begin")
            $("#vertex-data-wrapper").show();
            var picked_object = null;
            // Add the three.js 3D anaglyph effect to the viewer.
            surfviewer.addEffect("AnaglyphEffect");




            ///////////////////////////////////
            // Event Listeners
            ///////////////////////////////////

            // If something goes wrong while loading, we don't
            // want the loading icon to stay on the screen.
            BrainBrowser.events.addEventListener("error", hideLoading);


            // When the screen is cleared, remove all UI related
            // to the displayed models.
            surfviewer.addEventListener("clearscreen", function () {
                // $("#shapes").html("");
                $("#data-range-box").hide();
                $("#color-map-box").hide();
                // $("#vertex-data-wrapper").hide();
                $("#pick-value-wrapper").hide();
                $("#pick-label-wrapper").hide();
                $("#pick-x").html("");
                $("#pick-y").html("");
                $("#pick-z").html("");
                $("#pick-index").html("");
                $("#pick-value").val("");
                $("#pick-color").css("background-color", "transparent");
                $("#pick-label").html("");
                $("#intensity-data-export").hide();
                $("#annotation-media").html("");
                $("#annotation-display").hide();
                $("#annotation-wrapper").hide();
                surfviewer.annotations.reset();
                picked_object = null;
            });

            // When the intensity range changes, adjust the displayed spectrum.
            surfviewer.addEventListener("changeintensityrange", function (event) {
                var intensity_data = event.intensity_data;
                var canvas = surfviewer.color_map.createElement(intensity_data.range_min, intensity_data.range_max);
                canvas.id = "spectrum-canvas";
                $("#color-bar").html(canvas);
            });


            // When new intensity data is loaded, create all UI related to
            // controlling the relationship between the instensity data and
            // the color mapping (range, flip colors, clamp colors, fix range).
            surfviewer.addEventListener("loadintensitydata", function (event) {
                var model_data = event.model_data;
                var container = $("#data-range");
                var headers = '<div id="data-range-multiple">';
                var controls = "";
                var i;
                var data_set = model_data.intensity_data;
                var cmap = window.cmap_url.surf;
                container.html("");

                headers += '<h3>' + data_set[0].name;
                headers += '</h3>';
                controls += '<div id="data-file' + i + '" class="box range-controls">';
                controls += '<span>'
                controls += '<input class="range-box" id="data-range-min" type="text" name="range_min" size="0.7rem" style="width:2rem">';
                controls += '<div id="range-slider' + i + '" data-blend-index="' + i + '" class="slider" style="width:7rem;margin:0 20px 0 20px"></div>';
                controls += '<input class="range-box" id="data-range-max" type="text" name="range_max" size="0.7rem" style="width:2rem">';
                controls += '<div id="color-map-box" style="display:inline;width:3rem;margin-left:1rem"></div>';
                controls += '</span>'
                controls += '</div>';

                container.html(headers + controls + '</div>');
                $("#data-range-box").show();
                $("#color-map-box").show();
                var color_map_select_surface = $('<select id="color-map-select"></select>').change(function () {
                    surfviewer.loadColorMapFromURL($(this).val());
                    window.cmap_url.surf=$(this).val();
                });

                BrainBrowser.config.get("color_maps_surf").forEach(function (color_map) {
                    color_map_select_surface.append('<option value="' + color_map.url + '">' + color_map.name + '</option>');
                });
                $("#color-map-box").append(color_map_select_surface);
                if (typeof(cmap)!="undefined"){
                    $('#color-map-select').val(cmap)
                }

                container.find(".range-controls").each(function (index) {
                    var controls = $(this);
                    var intensity_data = data_set[index];
                    var data_min = intensity_data.min;
                    var data_max = intensity_data.max;
                    var range_min = intensity_data.range_min;
                    var range_max = intensity_data.range_max;
                    var min_input = controls.find("#data-range-min");
                    var max_input = controls.find("#data-range-max");
                    var slider = controls.find(".slider");

                    slider.slider({
                        range: true,
                        min: data_min,
                        max: data_max,
                        values: [range_min, range_max],
                        step: (range_max - range_min) / 100.0,
                        slide: function (event, ui) {
                            var min = ui.values[0];
                            var max = ui.values[1];
                            min_input.val(min.toPrecision(3));
                            max_input.val(max.toPrecision(3));
                            intensity_data.range_min = min;
                            intensity_data.range_max = max;

                            surfviewer.setIntensityRange(intensity_data, min, max);
                        }
                    });

                    slider.slider("values", 0, parseFloat(range_min));
                    slider.slider("values", 1, parseFloat(range_max));
                    min_input.val(range_min.toPrecision(3));
                    max_input.val(range_max.toPrecision(3));

                    function inputRangeChange() {

                        var min = parseFloat(min_input.val());
                        var max = parseFloat(max_input.val());

                        slider.slider("values", 0, min);
                        slider.slider("values", 1, max);
                        surfviewer.setIntensityRange(intensity_data, min, max);
                    }

                    $("#data-range-min").change(inputRangeChange);
                    $("#data-range-max").change(inputRangeChange);

                    $("#fix_range").click(function () {
                        surfviewer.setAttribute("fix_color_range", $(this).is(":checked"));
                    });

                    $("#fixed").change(function () {
                        var min = parseFloat(min_input.val());
                        var max = parseFloat(max_input.val());
                        if (surfviewer.color_map) {
                            surfviewer.color_map.fixed = $(this).is(":checked");
                        }

                        surfviewer.setIntensityRange(intensity_data, min, max);
                    });



                });

            }); // end loadintensitydata listener

            surfviewer.addEventListener("updatecolors", function (event) {
                var model_data = event.model_data;
                var intensity_data = model_data.intensity_data[0];
                var spectrum_div = document.getElementById("color-bar");
                var min, max;
                var canvas;

                if (model_data && intensity_data) {
                    min = intensity_data.range_min;
                    max = intensity_data.range_max;
                } else {
                    min = 0;
                    max = 100;
                }

                canvas = surfviewer.color_map.createElement(min, max);
                canvas.id = "spectrum-canvas";
                if (!spectrum_div) {
                    $("<div id=\"color-bar\"></div>").html(canvas).appendTo("#data-range-box");
                } else {
                    $(spectrum_div).html(canvas);
                }

            });

            surfviewer.addEventListener("updateintensitydata", function (event) {
                var intensity_data = event.intensity_data;
                var link = $("#intensity-data-export-link");
                var values = Array.prototype.slice.call(intensity_data.values);

                link.attr("href", BrainBrowser.utils.createDataURL(values.join("\n")));
                $("#intensity-data-export-link").attr("download", "intensity-values.txt");
                $("#intensity-data-export").show();
            });

            ////////////////////////////////////
            //  START RENDERING
            ////////////////////////////////////
            surfviewer.render();

            // Load a color map (required for displaying intensity data).
            surfviewer.loadColorMapFromURL(BrainBrowser.config.get("color_maps_surf")[0].url);



            ///////////////////////////////////
            // UI
            ///////////////////////////////////

            //Choose to hide the border
            $("#blend_box").change(function () {
                if ($(this).is(":checked")) {
                    surfviewer.blend(0.8, 0.2)
                } else {
                    surfviewer.blend(1, 0)
                }
            })

            // Set the background color.
            $("#clear_color").change(function (e) {
                surfviewer.setClearColor(parseInt($(e.target).val(), 16));
            });

            // Reset to the default views.
            $("#resetview").click(function () {
                // Setting the views to its current views type will
                // automatically reset its position and opacity.
                surfviewer.setView($("[name=hem_view]:checked").val());

                // Reset all opacity sliders in the UI to 100%
                $(".opacity-slider").each(function (idx, opacity_slider) {
                    $(opacity_slider).slider("value", 100);
                });
            });

            // Set the visibility of the currently loaded model.
            $(".visibility").change(function () {
                var input = $(this);
                var hemisphere = input.data("hemisphere");
                var shape = surfviewer.model.getObjectByName(hemisphere);
                if (!shape) return;
                shape.visible = input.is(":checked");
                surfviewer.updated = true;
            });

            // Set the views type (medial, lateral,
            // inferior, anterior, posterior).
            $("[name=hem_view]").change(function () {
                window.surfviewer.setView($("[name=hem_view]:checked").val());
            });


            // Toggle wireframe.
            $("#meshmode").change(function () {
                window.surfviewer.setWireframe($(this).is(":checked"));
            });

            // Toggle 3D anaglyph effect.
            $("#threedee").change(function () {
                window.surfviewer.setEffect($(this).is(":checked") ? "AnaglyphEffect" : "None");
            });

            // Grab a screenshot of the canvas.
            $("#screenshot").click(function () {
                var dom_element = surfviewer.dom_element;
                var canvas = document.createElement("canvas");
                var spectrum_canvas = document.getElementById("spectrum-canvas");

                var context = canvas.getContext("2d");
                var viewer_image = new Image();

                canvas.width = dom_element.clientWidth;
                canvas.height = dom_element.clientHeight;

                // Display the final image in a dialog box.
                function displayImage() {
                    var result_image = new Image();

                    result_image.onload = function () {
                        $("<div></div>").append(result_image).dialog({
                            title: "Screenshot",
                            height: result_image.height ,
                            width: result_image.width ,
                            position: [ 4*$(window).width() / 9,$(window).height() / 4 ]
                        });
                    }; 

                    result_image.src = canvas.toDataURL();
                }

                // Grab the spectrum canvas to display with the
                // image.
                function getSpectrumImage() {
                    var spectrum_image = new Image();
                    spectrum_image.onload = function () {
                        context.drawImage(spectrum_image, 0, 0);
                        displayImage();
                    };
                    spectrum_image.src = spectrum_canvas.toDataURL();
                }


                // Draw an image of the viewer area, add the spectrum
                // image it its available, and display everything
                // in a dialog box.
                viewer_image.onload = function () {
                    context.drawImage(viewer_image, 0, 0,canvas.width,canvas.height);
                    if ($(spectrum_canvas).is(":visible")) {
                        getSpectrumImage();
                    } else {
                        displayImage();
                    }
                };

                viewer_image.src = surfviewer.canvasDataURL();
            });

            // Control autorotation.
            $("#autorotate-controls").children().change(function () {
                surfviewer.autorotate.x = $("#autorotateX").is(":checked");
                surfviewer.autorotate.y = $("#autorotateY").is(":checked");
                surfviewer.autorotate.z = $("#autorotateZ").is(":checked");
            });

            // Control grid
            $("#grid-controls").children().change(function () {
                var grid_name = this.id;
                var grid = surfviewer.model.getObjectByName(grid_name);
                var rotation;
                var color_grid;
                var is_checked = $(this).is(":checked");

                // If the grid already exists
                if (grid !== undefined) {
                    grid.visible = is_checked;
                    surfviewer.updated = true;
                    return;
                }

                // Create and display the grid.
                rotation = new THREE.Euler();
                if (grid_name === "gridX") {
                    rotation.set(0, 0, Math.PI / 2, "XYZ");
                    color_grid = 0x00ff00;
                }
                if (grid_name === "gridY") {
                    rotation.set(0, Math.PI / 2, 0, "XYZ");
                    color_grid = 0x0000ff;
                }
                if (grid_name === "gridZ") {
                    rotation.set(Math.PI / 2, 0, 0, "XYZ");
                    color_grid = 0xff0000;
                }

                surfviewer.drawGrid(100, 10, {
                    euler_rotation: rotation,
                    name: grid_name,
                    color_grid: color_grid
                });

            });

            // Control Axes
            $("#axes-controls").change(function () {
                var axes_name = this.id;
                var is_checked = $(this).is(":checked");
                var axes = surfviewer.model.getObjectByName(axes_name);

                // If the axes already exists
                if (axes !== undefined) {
                    axes.visible = is_checked;
                    surfviewer.updated = true;
                    return;
                }

                surfviewer.drawAxes(150, {
                    name: axes_name,
                    complete: true
                });


            });



            // Remove currently loaded models.
            $("#clearshapes").click(function () {
                surfviewer.clearScreen();
                current_request = 0;
                current_request_name = "";
                loading_div.hide();
            });

            $("#centric_rotation").change(function () {
                var is_checked = $(this).is(":checked");
                if (!is_checked && $("#pick-x").html() === "" && $("#pick-y").html() === "" && $("#pick-z").html() === "") {
                    return;
                }
                setCenterRotation();
            });

            function setCenterRotation() {
                var offset = surfviewer.model.userData.model_center_offset || new THREE.Vector3(0, 0, 0);
                var center = new THREE.Vector3(parseFloat($("#pick-x").html()) + -offset.x, parseFloat($("#pick-y").html()) + -offset.y, parseFloat($("#pick-z").html()) + -offset.z);
                surfviewer.changeCenterRotation(center);
            }

            $("#surface-browser").mousedown(function (event) {
                if (surfviewer.model.children.length === 0) return;
                let res;
                res = window.surfviewer.getPickLabel(atlas_labels, window.surfviewer);
                if (res) {
                    console.log(res);
                    $("#pick-index").html(res.index);

                    $("#pick-value").html(' ' + res.value.toString().slice(0, 4));
                    $("#pick-label").html(res.label);
                    $("#pick-color").css("background-color", "#" + surfviewer.color_map.colorFromValue(res.value, {
                        hex: true,
                        min: res.intensity_data.range_min,
                        max: res.intensity_data.range_max
                    }));
                    if (event.button == 2) {
                        function divRender(event) {
                            let div = document.getElementById('pick-info');
                            div.style.left = event.offsetX + 'px';
                            div.style.top = event.offsetY + 'px';
                        }
                        divRender(event);
                        document.getElementById("pick-info").style.visibility = "visible";
                    } else {
                        $("#pick-index").html("");
                        $("#pick-value").html("");
                        document.getElementById("pick-info").style.visibility = "hidden";
                    }
                }
            });

            // Load demo models.
            $("#examples").click(function (e) {
                current_request++;
                let info = surfviewer.model_data.get();

                var name = $(e.target).attr("data-example-name");
                if (!name || current_request_name === name) return;
                $("#" + current_request_name).css("color", "white");
                current_request_name = name;
                $("#" + current_request_name).css("color", "orange");

                //Create a closure to compare current request number to number
                // at the time request was sent.
                function defaultCancelOptions(request_number) {
                    return function () {
                        return request_number !== current_request;
                    };
                }

                loading_div.show();
                $("#loading").show();
                surfviewer.clearScreen();

                var examples = {
                    pial: function () {
                        surfviewer.annotations.setMarkerRadius(1);
                        surfviewer.loadModelFromURL("models/S1200.pial_MSMAll.32k_fs_LR.surf.gii", {
                            format: "gifti",
                            complete: function () {
                                window.surfviewer.setView($("[name=hem_view]:checked").val());
                                $("#loading").hide();
                                init_1=0;
                                surfviewer.getDataURL(info, surfviewer, function (url, viewer, colormap, template) {
                                    viewer.loadfromURL(url, viewer, colormap, template)
                                });
                            },
                            cancel: defaultCancelOptions(current_request),
                            parse: {
                                split: true
                            }
                        });

                    },
                    inflated: function () {
                        surfviewer.annotations.setMarkerRadius(1);
                        surfviewer.loadModelFromURL("models/S1200.inflated_MSMAll.32k_fs_LR.surf.gii", {
                            format: "gifti",
                            complete: function () {
                                window.surfviewer.setView($("[name=hem_view]:checked").val());
                                console.log("model loaded")
                                $("#loading").hide();
                                init_1=0;
                                surfviewer.getDataURL(info, surfviewer, function (url, viewer, colormap, template) {
                                    viewer.loadfromURL(url, viewer, colormap, template)
                                });

                            },
                            cancel: defaultCancelOptions(current_request),
                            parse: {
                                split: true
                            }
                        });

                    },
                    very_inflated: function () {
                        window.surfviewer.annotations.setMarkerRadius(1);
                        window.surfviewer.loadModelFromURL("models/S1200.very_inflated_MSMAll.32k_fs_LR.surf.gii", {
                            format: "gifti",
                            complete: function () {
                                window.surfviewer.setView($("[name=hem_view]:checked").val());
                                $("#loading").hide();
                                init_1=0;
                                surfviewer.getDataURL(info, surfviewer, function (url, viewer, colormap, template) {
                                    viewer.loadfromURL(url, viewer, colormap, template)
                                });

                            },
                            cancel: defaultCancelOptions(current_request),
                            parse: {
                                split: true
                            }
                        });
                    },
                };

                function use_example(examples, name) {
                    if (examples.hasOwnProperty(name)) {
                        examples[name]();
                    }
                }
                use_example(examples, name)



                return false;
            });

            // Change parcel Selection
            $("[name=parcelSelect]").change(function () {
                let info = surfviewer.model_data.get();
                surfviewer.setAttribute("fix_color_range", false);
                window.loading_con = 0;
                for (var i = 1; i <= 3; ++i) {
                    console.log(i)
                    $("#parcelSelection")[0].children[1].remove();
                    surfviewer.blankparcel();

                }

                surfviewer.getDataURL(info, surfviewer, function (url, viewer, colormap, template) {
                    viewer.loadfromURL(url, viewer, colormap, template)
                });
            });

            $(window).resize(function () {
                surfviewer.updateViewport();
            });

            // Load first model.clear_color
            $("a.example[data-example-name=inflated]").click();
            console.log("Surface rendering done")


        });
        window.infoviewer = BrainBrowser.InfoViewer.start("information-box", "metainfo-box", function (info) {

        });

        BrainBrowser.SurfaceViewer.ccui(window.surfviewer, window.viewer, window.infoviewer, function () {
                $("#SurfacetypeSelect").change(function(){
                    console.log('clicked')
                    window.viewer.download_Req('models/'+$("#SurfacetypeSelect").val()+'.tex.gii')
                });
                $("#surface-browser").click(function (event) {
                    if ((event.ctrlKey||event.metaKey) && !event.shiftKey) {
                        surfviewer.setView($("[name=hem_view]:checked").val());

                        // Reset all opacity sliders in the UI to 100%
                        $(".opacity-slider").each(function (idx, opacity_slider) {
                            $(opacity_slider).slider("value", 100);
                        });
                        return;
                    } else if ((event.ctrlKey||event.metaKey) && event.shiftKey) {
                        let res;
                        console.log(window.surfviewer.pick());
                        res = window.surfviewer.getPickLabel(atlas_labels, window.surfviewer);
                        console.log('res' + res)
                        if (res) {
                            document.getElementById("blend_box").checked = true;
                            window.surfviewer.blend(0.8, 0.2);
                            window.surfviewer.addParcelLabel(res, window.surfviewer)
                        }
                    } else {
                        return;
                    }
                })
                $("#surface-browser").dblclick(function (event) {
                    if (surfviewer.model.children.length === 0) return;
                    let res = window.surfviewer.getPickLabel(atlas_labels, window.surfviewer);
                    if (res) {
                        let len=document.getElementsByClassName('ui-dialog-titlebar-close').length;
                        if ($(".ui-dialog").is(":visible")){
                            document.getElementsByClassName('ui-dialog-titlebar-close')[len-1].click();
                            window.track_Info.con=0;
                        }
                        $("#loading").show();
                        $("#metainfo-box").show()
                        window.loading_con = 1;
                        document.getElementById("surface-controls").getElementsByTagName('a')[0].click();
                        document.getElementById("volume-controls").getElementsByTagName('a')[1].click();
                        $("input[name$='voxelSizeSelect']").attr("checked", "false");
                        $("input[name$='voxelSizeSelect'][value$=1]").attr("checked", "true");
                        document.getElementById("blend_box").checked = true;
                        window.surfviewer.blend(0.8, 0.2);
                        window.surfviewer.stamp_condition();
                        window.surfviewer.uploadIntensityData(event, res);
                    }
                });
                $("#submit-multiparcel").click(function () {
                    $("#loading-text").html("Uploading");
                    window.surfviewer.uploadID(function (response) {
                        window.loading_con = 4;
                        let upload = response.path;
                        let fileName = $("[name=parcelSelect]:checked").val();
                        window.surfviewer.parcelSelect = [];
                        window.surfviewer.stamp_condition();
                        window.viewer.uploadData('save-file/' + upload + '/json/uploadF.' + fileName + '.nii', true);
                        //window.surfviewer.loadfromURL('save-file/' + upload + '/gifti1/uploadF_' + fileName + '.tex.gii', window.surfviewer, false, fileName.split('_')[1])
                    });
                });
                $("#surface-file-gifti1-submit").click(function () {
                    $("#loading-text").html("Uploading");
                    window.surfviewer.uploadMask(function (res) {
                        console.log(res)
                        if (res.err) {
                            alert(res.err);
                        } else if (res.stderr) {
                            alert(res.stderr);
                        }
                        if (res.std) {
                            alert("upload successfully!");
                            console.log(res.flag);
                        }
                        if (res.flag.length > 0) {
                            window.loading_con = 4;
                            window.surfviewer.loadColorMapFromURL(BrainBrowser.config.get("color_maps_surf")[0].url);
                            window.viewer.uploadData('save-file/' + res.path + '/json/' + res.flag[0] + '.nii', true);
                            window.surfviewer.uploadPanel(res, function () {
                                let info = window.surfviewer.model_data.get();
                                window.surfviewer.getDataURL(info, window.surfviewer, function (url, surfviewer, colormap, template) {
                                    window.surfviewer.loadfromURL(url, surfviewer, colormap, template)
                                });
                                $("#loading-fullpage").hide();
                            });
                        } else {
                            $("#loading-fullpage").hide();
                        }
                    });
                });

            }

        )

    });