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

/**
 * @doc overview
 * @name index
 *
 * @description
 * The BrainBrowser Surface Viewer is a tool for displaying and manipulating 3D datasets in real
 * time. Basic usage consists of calling the **start()** method of the **SurfaceViewer** module,
 * which takes a callback function as its second argument, and then using the **viewer** object passed
 * to that callback function to control how models are displayed:
 *  ```js
 *    BrainBrowser.SurfaceViewer.start("brainbrowser", function(viewer) {
 *
 *      //Add an event listener.
 *      viewer.addEventListener("displaymodel", function() {
 *        console.log("We have a model!");
 *      });
 *
 *      // Start rendering the scene.
 *      viewer.render();
 *
 *      // Load a model into the scene.
 *      viewer.loadModelFromURL("/models/brain_surface.obj");
 *
 *      // Hook viewer behaviour into UI.
 *      $("#wireframe").change(function(e) {
 *        viewer.setWireframe($(this).is(":checked"));
 *      });
 *
 *    });
 *  ```
 */

/**
 * @doc overview
 * @name Configuration
 *
 * @description
 * The Surface Viewer can be configured using the **set** and **get**
 * methods of the **BrainBrowser.config** object. The only configuration
 * parameter that must be manually set is **worker\_dir** which indicates
 * the path to the directory where the Web Worker scripts are stored:
 *
 * ```js
 * BrainBrowser.config.set("worker_dir", "js/brainbrowser/workers");
 * ```
 * Configuration parameters used internally by the Surface Viewer also
 * include **model\_types** and **intensity\_data\_types** which are used to
 * associate a Web Worker with each supported file type. Any other parameters
 * can be used without issue to create custom configuration for a given
 * app.
 *
 * Configuration parameters can be retrieved using the **get** method:
 *
 * ```js
 * var worker_dir = BrainBrowser.config.get("worker_dir");
 * ```
 *
 * If the requested parameter does not exist, **null** will be returned.
 *
 * Configuration parameters can be namespaced, using a "." to separate namespaces,
 * so for example:
 *
 * ```js
 * BrainBrowser.set("color_maps.spectral.name", "Spectral");
 * ```
 *
 * will set the **name** property in the **spectral** namespace of the
 * **color_maps** namespace. Namespaces are implemented as objects, so
 * if a namespace is requested with **get**, the namespace object will be
 * returned. Using the previous **set**, the following **get**:
 *
 * ```js
 * BrainBrowser.get("color_maps.spectral");
 * ```
 *
 * would return the object:
 *
 * ```js
 *  { name: "Spectral" }
 * ```
 *
 */

/**
 * @doc overview
 * @name Object Model
 *
 * @description
 * Data parsers producing models to be read by BrainBrowser must
 * output their data according to the following object model:
 * ```js
 * {
 *   type: ("line" | "polygon"),
 *   name: "...",
 *   vertices: [...],
 *   normals: [...],
 *   colors: [...],
 *   shapes: [
 *     {
 *       name: "...",
 *       color: [...],
 *       indices: [...]
 *     },
 *     {
 *       name: "...",
 *       color: [...],
 *       indices: [...]
 *     }
 *   ]
 * }
 * ```
 *
 * Assuming a model with **n** vertices:
 *
 * * **type** (optional) is a string indicating whether the model consists
 *   of line or triangle data. Default: "polygon".
 * * **name** (optional) is a string identifier for the model. Default:
 *   the name of the file that the data was parsed from.
 * * **vertices** is a flat array of vertex **x**, **y**, **z** coordinates.
 *   Size: **n** X 3.
 * * **normals** (optional) is a flat array of vertex normal vector **x**,
 *   **y**, **z** components. Size: **n** X 3. If a **normals** array is not
 *   provided, the Surface Viewer will attempt to appoximate the normals based
 *   on the vertex data.
 * * **colors** (optional) is a flat array of **r**, **g**, **b**, **a** color
 *   values. Size: **n** X 4 or 4. If a 4-element array is given, that color
 *   will be used for the entire model. If no color data is provided vertex
 *   colors will all be set to gray.
 * * **shapes** is an array containing objects describing the different
 *   shapes the model represents. Each object will contain an **indices**
 *   property which contains an array of indices pointing into the
 *   **vertices**, **colors** and **normals** arrays, indicating how to
 *   assemble them into triangles or line pieces. For **polygon** models,
 *   each triplet of indices should describe a triangle. For **line** models,
 *   each pair of indices should describe a line segment. Optionally, each
 *   shape can also be given a **color** property, which indicates the color
 *   of the shape (overriding model and vertex colors at the top level). The
 *   color should be given as a 4-element array indicating **r**, **g**, **b**,
 *   **a** color values. An optional **name** property can also be given to
 *   identify the shape. If no **name** is provided, the **name** property
 *   defaults to a value based on the name of the file that contained the model
 *   and the shape's index number.
 */
(function () {
  "use strict";

  var SurfaceViewer = BrainBrowser.SurfaceViewer = {

    /**
     * @doc function
     * @name SurfaceViewer.static methods:start
     * @param {string} element ID of a DOM element, or the DOM element itself,
     * into which the viewer will be inserted.
     * @param {function} callback Callback function to which the viewer object
     * will be passed after creation.
     * @description
     * The start() function is the main point of entry to the Surface Viewer.
     * It creates a viewer object that is then passed to the callback function
     * supplied by the user.
     *
     * ```js
     *   BrainBrowser.SurfaceViewer.start("brainbrowser", function(viewer) {
     *
     *     //Add an event listener.
     *     viewer.addEventListener("displaymodel", function() {
     *       console.log("We have a model!");
     *     });
     *
     *     // Start rendering the scene.
     *     viewer.render();
     *
     *     // Load a model into the scene.
     *     viewer.loadModelFromURL("/models/brain_surface.obj");
     *
     *     // Hook viewer behaviour into UI.
     *     $("#wireframe").change(function(e) {
     *       viewer.setWireframe($(this).is(":checked"));
     *     });
     *
     *   });
     * ```
     */
    start: function (element, callback) {

      console.log("BrainBrowser Surface Viewer v" + BrainBrowser.version);

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
      var dom_element;

      if (typeof element === "string") {
        dom_element = document.getElementById(element);
      } else {
        dom_element = element;
      }
      /** @type {*} */
      var viewer = {
        dom_element: dom_element,
        model: null, // Scene graph root. Created in rendering module.
        model_data: null, // Descriptions of all models. Created in loading module.
        mouse: BrainBrowser.utils.captureMouse(dom_element),
        touches: BrainBrowser.utils.captureTouch(dom_element),
        updated: true,
        uploadDir: [],
        zoom: 1,
        autorotate: {
          x: false,
          y: false,
          z: false
        },
        parcelSelect: [],

        /**
         * @doc function
         * @name viewer.attributes:getAttribute
         * @param {string} name Name of the attribute to retrieve.
         *
         * @description
         * Retrieve the value of an attribute.
         *
         * The viewer object can maintain an arbitrary set of key-value
         * to aid in the functioning of various parts of the system.
         * ```js
         * viewer.getAttribute("fix_color_range");
         * ```
         *
         * Currently, the following attributes are used by the Surface Viewer:
         *
         * * **fix\_color\_range** Maintain the current intensity range, even if new data is
         *   loaded.
         */
        getAttribute: function (name) {
          return attributes[name];
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
        setAttribute: function (name, value) {
          attributes[name] = value;
        },

        /**
         * @doc function
         * @name viewer.viewer:getVertex
         * @param {number} index Index of the vertex.
         * @returns {THREE.Vertex3} The vertex.
         *
         * @description
         * Get the vertex at the given index
         * ```js
         * viewer.getVertex(2356);
         * ```
         *
         * If more than one model file has been loaded, refer to the appropriate
         * model using the **model_name** option:
         * ```js
         * viewer.getVertex(2356, { model_name: "brain.obj" });
         * ```
         */


        /**
         * @doc function
         * @name window.SurfaceViewer:resultPanel
         * @param {*} surfviewer
         * @description 
         * change Surface Result Panel according to loaded results,
         * SHOULD BE REFRESH IN EVERY SINGLE LOADING
         */
        resultPanel: function (surfviewer) {
          $("[name=homoSelect]").change(function () {
            let info = surfviewer.model_data.get();
            surfviewer.getDataURL(info, surfviewer, function (url, viewer, colormap, template) {
              surfviewer.loadfromURL(url, viewer, colormap, template)
            });
          })
          $("[name=template]").change(function () {
            if ($("[name=template]:checked").val() != 'vertice') {
              let parcel = $("[name=template]:checked").val();
              $("input[name$='parcelSelect']").attr("checked", "false");
              $("input[name$='parcelSelect'][value$=" + parcel + "]").attr("checked", "true");
              let stamp = document.getElementsByName("homoSelect");
              stamp[0].disabled = false;
              stamp[1].disabled = false;
              let info = surfviewer.model_data.get();
              surfviewer.getDataURL(info, surfviewer, function (url, viewer, colormap, template) {
                surfviewer.loadfromURL(url, viewer, colormap, template)
              });
            } else {
              let info = surfviewer.model_data.get();
              let stamp = document.getElementsByName("homoSelect");
              stamp[0].disabled = true;
              stamp[1].disabled = true;
              surfviewer.getDataURL(info, surfviewer, function (url, viewer, colormap, template) {
                surfviewer.loadfromURL(url, viewer, colormap, template)
              });
            }
          });
          $("[name=weightSelect]").change(function () {
            let info = surfviewer.model_data.get();
            surfviewer.getDataURL(info, surfviewer, function (url, viewer, colormap, template) {
              surfviewer.loadfromURL(url, viewer, colormap, template)
            });
          });
        },

        stamp_condition: function () {
          /**
           * @doc function
           * @name window.SurfaceViewer:stamp_condition
           * @description 
           * change Surface Result Panel according to loaded results,
           * SHOULD BE REFRESH IN EVERY SINGLE LOADING
           */
          function get_condition() {
            var homo_bool;
            if (window.loading_con>2){
              document.getElementsByName("weightVol")[0].checked=false;
              document.getElementsByName("weightVol")[1].checked=true;
              document.getElementsByName("weightSelect")[0].checked=false;
              document.getElementsByName("weightSelect")[1].checked=true;
            }
            display_1=0;
            let con0 = ($("[name=template]:checked").val() != "vertice");
            let con2 = (window.loading_con === 2 || window.loading_con === 3);
            if (con0 && con2) {
              homo_bool = false;
              console.log({
                con0: con0,
                con2: con2
              })
            } else {
              homo_bool = true;
              console.log({
                con0: con0,
                con2: con2
              })
            }
            return homo_bool;
          }
          var loading_con = BrainBrowser.config.get("loading_con")[window.loading_con];
          document.getElementsByName("weightVol").forEach(function (element) {
            element.disabled = loading_con.volweight
          });
          document.getElementsByName("template").forEach(function (element) {
            element.disabled = loading_con.surfparcel
          });
          document.getElementsByName("weightSelect").forEach(function (element) {
            element.disabled = loading_con.surfweight
          });
          document.getElementsByName("homoSelect").forEach(function (element) {
            element.disabled = get_condition()
          });
        },

        getGiftiURL: function () {
          /**
           * @doc function
           * @name window.SurfaceViewer:getGiftiURL
           * @returns current gifti_file DIR
           * @description
           * USED IN DOWNLOADING
           *
           */
          var DataName = window.surfviewer.model_data.get().intensity_data[0].name;
          var nameArr = DataName.split('.');
          let url;

          function resultDir(DataName) {
            let suburl;
            let template = $("[name=template]:checked").val();
            let size = $("[name=voxelSizeSelect]:checked").val();
            if (template != 'vertice') {
              let homoSelect = $("[name=homoSelect]:checked").val();
              
              suburl = 'part2_result_' + template + '_' + homoSelect + '_'+size +'/' + DataName;
            } else {
              suburl = 'part2_result_' + template + '_'+size+'/' + DataName;
            }
            return suburl;
          };

          if (window.loading_con < 2) {
            url = "models/" + nameArr[1] + '/' + DataName;
          } else if (window.loading_con > 2) {
            let upload = $("[name=volume-file-type]:checked").val();
            url = "models/" + upload + '/' + resultDir(DataName);
          } else if (window.loading_con == 2) {
            url = "models/Group_result2/" + resultDir(DataName);
          }
          console.log(url);
          return url;
        },
        loadthreshold:function(type,name,max,callback){

          let settings = {
            "url": "/threshold?type="+type+"&name="+name,
            "type": "GET",
            "timeout": 0,
            "processData": false,
            "mimeType": "multipart/form-data",
            "contentType": false,
            "data": new FormData()
          };
          $.ajax(settings).done(function (res) {
            let response=eval('(' + res + ')');
            callback(max,response.value);
          });

        },

        loadfromURL: function (url1, viewer, colormap, label0) {
          // tong>点击surface box按键
          count_1=0;
          count_2=0;
          count_3=0;
          // surface显示状态
          display=0;
          display_1=0;
          // display_2=1;
          // volume显示状态
          // display_1=1;
          // debugger
          $("#surface-browser").hide();
          /** 
           * @doc function
           * @param {url1} String
           * @param {viewer} window.SurfaceViewer
           * @param {colormap} Boolean
           * @param {label0} String 'HCPMMP','BN_Atlas','Parcels_L','Parcels_R'
           * @description 
           * 
           */

          let blend, min, max, new_min;
          let label = ((label0 === "vertice")||(label0==="mask")) ? $("[name=parcelSelect]:checked").val() : label0;
          let url2 = "models/" + label + "/S1200." + label + "_border.32K.tex.gii";
          if ($("#blend_box:checked").val() == "on") {
            blend = 0.2
          } else {
            blend = 0
          };
          let cmap = window.cmap_url.surf=== undefined ? BrainBrowser.config.get("color_maps_surf")[0].url : window.cmap_url.surf;
          console.log(cmap)
          viewer.loadIntensityDataFromURL(url1, {

            format: "gifti",
            complete: function () {
              //TODO: 删除vertice resolution的border加载
              viewer.loadIntensityDataFromURL(url2, {
                format: "gifti",
                blend: true,
                complete: function () {
                  if (window.loading_con < 2 || window.loading_con == 4 && label0 != 'vertice') {
                    min = BrainBrowser.config.get('parcellation')[label].min;
                    max = BrainBrowser.config.get('parcellation')[label].max;
                    $("#data-range-min").attr("value", String(min));
                    $("#data-range-max").attr("value", String(max));
                    viewer.setIntensityRange(min, max);
                  } else {
                    viewer.loadColorMapFromURL(cmap);
                    min = viewer.model_data.get().intensity_data[0].range_min;
                    max = viewer.model_data.get().intensity_data[0].range_max;
                    var name_split = surfviewer.model_data.get().intensity_data[0].name.split('_');
                    var method = name_split[2];
                    var type;
                    console.log('url1:'+url1);
                    if (window.loading_con==2){
                      var name = url1.split('/')[3]+'/'+name_split[0]+'_'+name_split[1];
                      if (method == 'percen'){
                        type='fn_cc2surf';
                      }else{
                        type='ma_cc2surf';
                      }

                      viewer.loadthreshold(type,name,max,function(max,new_min){
                        console.log(new_min);
                        $("#data-range-min").attr("value", String(new_min));
                        $($("#data-range").find(".range-controls")[0]).find(".slider").slider("values", 0, new_min);
                        surfviewer.setIntensityRange(new_min, max);
                        $("#surface-browser").show();
                        $("#volume-browser").show();
                      })
                    }else{
                      $("#surface-browser").show();
                      $("#volume-browser").show();
                    }

                    //$($("#data-range").find(".range-controls")[0]).find(".slider").slider("values", 0, new_min);
                    //viewer.setIntensityRange(new_min, max);

                  }
                  viewer.blend(1 - blend, blend);

                  $("#loading").hide();
                }

              });
            }
          });
        },



        getDataURL: function (model_data, viewer, callback) {
          /** 
           * @doc function
           * @name window.SurfaceViewer:getDataURL
           * @param {model_data} window.surfviewer.model_data.get()
           * @param {viewer} window.SurfaceViewer
           * @param {callback} function (url,viewer,colormap,template){
              viewer.loadfromURL(url,viewer,colormap,template);
           *  }
           */
          let fileName, upload, returnUrl, colormap, template, mainpath;
          let weightSelect = $("[name=weightSelect]:checked").val() === undefined ? 'percen' : $("[name=weightSelect]:checked").val();
          template = $("[name=template]:checked").val() === undefined ? $("[name=parcelSelect]:checked").val() : $("[name=template]:checked").val();
          if (window.loading_con > 2) {
            mainpath = "save-file/"
          } else {
            mainpath = "models/"
          }
          document.getElementById("blend_box").checked = true;
          if (window.loading_con == 3 || window.loading_con == 2) {
            //Load surface results
            if (window.loading_con == 3) {
              //Load DIY surface results
              fileName = 'uploadF';
              upload = $("[name=volume-file-type]:checked").val() + '/gifti1';
              weightSelect='percen';
              sizeSelect=1;

            } else if (window.loading_con == 2) {
              //Load Default surface results
              var sizeSelect = $("[name=voxelSizeSelect]:checked").val() === undefined ? '1' : $("[name=voxelSizeSelect]:checked").val();
              if (typeof (model_data) == 'string') {
                fileName = model_data;
              } else {
                fileName = model_data.intensity_data[0].name.substr(0, 7);
              }
              upload = "Group_result2/";
            }
            if (template != "vertice") {
              window.surfviewer.blend(0.8, 0.2);
              let homoSelect = $("[name=homoSelect]:checked").val() === undefined ? "homo" : $("[name=homoSelect]:checked").val();
              returnUrl = mainpath + upload + "/part2_result_" + template + "_" + homoSelect + sizeSelect + "/" + fileName + "_" + weightSelect + "_000.tex.gii";
            } else {
              document.getElementById("blend_box").checked = false;
              window.surfviewer.blend(1, 0);
              returnUrl = mainpath + upload + "/part2_result_" + template + '_' + sizeSelect + "/" + fileName + "_" + weightSelect + "_000.tex.gii";
            }
            colormap = true;
          } else if (window.loading_con == 4) {

            window.surfviewer.blend(0.8, 0.2);
            upload = $("[name=surface-file-type]:checked").val();
            fileName = $("[name=surfmask]:checked").val();
            returnUrl = mainpath + upload + "/gifti1/" + fileName + '.tex.gii';
            template = fileName.split('.')[1];
            colormap = false;
          } else if (window.loading_con == 1) {
            //Homo-Parcel Pairs
            fileName = model_data.intensity_data[0].name;
            let nameArr = fileName.split('.');
            window.surfviewer.blend(0.8, 0.2);
            template = nameArr[1];
            returnUrl = mainpath + template + '/' + fileName;
            colormap = false;
          } else if (window.loading_con == 0) {
            //Parcellations
            template = $("[name=parcelSelect]:checked").val();
            window.surfviewer.blend(0.8, 0.2);
            returnUrl = mainpath + "/" + template + "/S1200." + template + ".32K.label.gii";
            colormap = false;
          }
          callback(returnUrl, viewer, colormap, template)
        },

        uploadID: function (callback) {
          /**
           * @doc function 
           * @param {callback} function function(response) {
                window.loading_con=4;
                let upload = response.path;
                console.log(upload)
                let fileName=$("[name=parcelSelect]:checked").val();
                window.surfviewer.parcelSelect=[];
                window.surfviewer.stamp_condition();
                window.viewer.uploadData('save-file/' + upload+'/json/uploadF_'+fileName + '.nii',true);
                window.surfviewer.loadfromURL('save-file/'+upload+'/gifti1/uploadF_'+fileName +'.tex.gii',window.surfviewer,false,fileName.split('_')[1])
           }
           */
          let tab = $("#parcelSelection");
          let dataArr = '';
          let parcellation = $("[name=parcelSelect]:checked").val();
          if ($($("#parcelSelection")[0].rows[1].cells[0]).find("input").val()==""){
            return;
          }else{
            for (var i = 1; i < tab[0].rows.length; i++) {
              dataArr += $(tab[0].rows[i].cells[0]).find("input").val() + ',';
            }
            var settings = {
              "url": "/multiSurface",
              "type": "POST",
              "headers": {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              "data": {
                "parcellation": parcellation,
                "parcelID": dataArr
              },
              "success": function (data) {
                console.log("over..");
                console.log(data);
                for(i=1;i<4;i++){
                  $("#ParcelSelect_Table")[0].rows[i].children[0].children[0].value=""
                  $("#ParcelSelect_Table")[0].rows[i].children[1].children[0].value=""
                  window.multiParcel=0
                }
                callback(data);
              },
              "beforeSend": function () {
                $("#loading").show();
              },
            };
  
            $.ajax(settings).done(function (response) {
              console.log(response);
            });

          }


        },
        uploadMask: function (callback) {
          /** 
           * @doc function
           * @name window.SurfaceViewer:uploadMask
           * @param {callback}
           * @description
           * !used to upload mask to upload.js
          */
          let form = new FormData(document.getElementById("surface-file"));
          let surface_option = $("#SurfacetypeSelect").val();
          if (surface_option === 'Blank') {
            alert('Err: Plz choose your mask type!!')
          } else {
            form.append("opt", surface_option);
            var settings = {
              "url": "/uploadSurface",
              "type": "post",
              "processData": false,
              "mimeType": "multipart/form-data",
              "contentType": false,
              "data": form,
              "success": function (data) {
                console.log("over..");
                console.log(data);
                callback(JSON.parse(data));

              },
              "beforeSend": function () {
                $("#resultSelect").show();
                $("#loading").show();
              },
              "complete": function () {}
            };

            $.ajax(settings).done();
          }
        },
        /** 
         * @doc function
         * @param {pathobj} object
         * @returns {header} Domobj
         * @description 
         * !add uploaded mask
         * */
        addMask: function (pathobj) {
          let headers = $("#result");
          let select = "";
          console.log(pathobj.flag)
          select += '<h3>Mask Type</h3>';
          select += '<label for="surfmask">';
          select += '<input type="radio" name="surfmask" value=' + pathobj.flag[0] + ' checked="true">' + pathobj.flag[0].substr(8, 10);
          select += '<input type="radio" name="surfmask" value=' + pathobj.flag[1] + '>' + pathobj.flag[1].substr(8, 10);
          for (var i = 2; i < pathobj.flag.length-2; i+=2) {
            select += '<br /><input type="radio" name="surfmask" value=' + pathobj.flag[i] + '>' + pathobj.flag[i].substr(8, 10);
            select += '<input type="radio" name="surfmask" value=' + pathobj.flag[i+1] + '>' + pathobj.flag[i+1].substr(8, 10);
          }
          select += '<br /><input type="radio" name="surfmask" value="uploadF.mask"> original mask(only for viewing)'
          select += '</label>';
          headers.html(select);
          return headers
        },
        /** 
         * @doc function
         * @param {pathobj} object
         * @returns {header} Domobj
         * @description 
         * !add functions for the uploaded mask
         * */
        uploadPanel: function (pathobj, callback) {

          let element = {};
          element.id = 'mask' + (window.surfviewer.uploadDir.length + 1);
          element.path = pathobj.path;
          element.div = window.surfviewer.addMask(pathobj);
          window.surfviewer.uploadDir.push(element);
          $("#smask" + (window.surfviewer.uploadDir.length)).attr("value", pathobj.path);
          $("#smask" + (window.surfviewer.uploadDir.length)).attr("disabled", false);
          $("#smask" + (window.surfviewer.uploadDir.length)).attr('checked', 'true');
          $("#smask" + window.surfviewer.uploadDir.length + "_name").html(pathobj.name);
          $("#parcellations").hide();
          if (window.surfviewer.uploadDir.length > 2) {
            $('#surface_upload').hide();
          }
          $("#result").show()
          //add function: change mask_template
          $("[name=surfmask]").change(function () {
            let info = window.surfviewer.model_data.get();
            let upload = $("[name=surface-file-type]:checked").val();
            let fileName = $("[name=surfmask]:checked").val();
            if (fileName != "uploadF.mask") {
              window.viewer.uploadData('save-file/' + upload + '/json/' + fileName + '.nii', true);
            } else {
              document.getElementById("blend_box").checked = false;
            }
            window.surfviewer.getDataURL(info, window.surfviewer, function (url, viewer, colormap, template) {
              viewer.loadfromURL(url, viewer, colormap, template);
            });
          });

          //add function: change mask
          $("[name=surface-file-type]").change(function () {
            if ($("[name=surface-file-type]:checked").val() != "Group_result2/") {
              window.loading_con = 4;
              viewer.setAttribute("fix_color_range", false);
              $("#result").html("");
              window.surfviewer.uploadDir[Number($("[name=surface-file-type]:checked")[0].id[5]) - 1].div.appendTo("#result")
              $("#result").show();
              $("[name=surfmask]").change(function () {
                let info = window.surfviewer.model_data.get();
                window.surfviewer.getDataURL(info, window.surfviewer, function (url, viewer, colormap, template) {
                  surfviewer.loadfromURL(url, viewer, colormap, template)
                });
              });
            } else {
              window.loading_con = 0;
              // $("#parcellations").show();
              $("#result").html("");
            }
            let info = window.surfviewer.model_data.get();
            window.surfviewer.getDataURL(info, window.surfviewer, function (url, viewer, colormap, template) {
              viewer.loadfromURL(url, viewer, colormap, template)
            });

          });
          callback();
        },
        /**
         * @doc function
         * @name window.SurfaceViewer:addParcelLabel
         * @param {res} 
         * @param {surfviewer} 
         * @return {*} 
         * @description
         * !add selected parcels pair
         */
        addParcelLabel: function (res, surfviewer) {

          let returnName, label, template;
          returnName = res.returnName;
          label = res.label;
          template = res.template;
          if (label && !surfviewer.parcelSelect.includes(returnName)) {
            surfviewer.parcelSelect.push(returnName);
            // if ($("#multi-surface-submit").val()) {
            //   let obj = document.getElementById("multi-surface-submit");
            //   let parentObj = obj.parentNode; //获取div的父对象
            //   parentObj.removeChild(obj); //通过div的父对象把它删除
            // }
            if ($("#ParcelSelect_Table")[0].rows[1].children[0].children[0].value === "") {
              window.multiParcel = window.multiParcel + 1;
              surfviewer.loadfromURL("models/" + template + "/S1200." + template + "." + returnName + ".32K.label.gii", surfviewer, false, template);
            } else if ($("#ParcelSelect_Table")[0].rows[3].children[0].children[0].value === "") {
              window.multiParcel = window.multiParcel + 1;
              surfviewer.loadIntensityDataFromURL("models/" + template + "/S1200." + template + "." + returnName + ".32K.label.gii", {
                format: "gifti",
                min: BrainBrowser.config.get('parcellation')[template].min,
                max: BrainBrowser.config.get('parcellation')[template].max,
                blend: true,
                complete: function () {
                  $("#loading").hide();
                  init_1=0;
                }
              });
            } else if (window.multiParcel > 3) {
              window.alert("Parcels Number Limit!");
            }
            if (window.multiParcel < 4) {
              $("#ParcelSelect_Table")[0].rows[window.multiParcel].children[0].children[0].value = returnName;
              $("#ParcelSelect_Table")[0].rows[window.multiParcel].children[1].children[0].value = label;
            }

          } else {
            return;
          }
        },

        /**
         * @doc function
         * @param {atlas_labels} Object
         * @param {viewer} window.SurfaceViewer
         * 
         * @returns {Object}
         * @description 
         * !return clicked vertex ID, intensity data & label name etc
         */
      
        getPickLabel: function (atlas_labels, viewer) {
          var pick_info = viewer.pick();
          var model_data = viewer.model_data.get();
          if (!model_data) {
            return;
          } else {
            var value;
            var template = $("[name=parcelSelect]:checked").val();
            var label_value = atlas_labels[template + "_value"][pick_info.index];
            var intensity_data = model_data.intensity_data[0];
            if (window.loading_con==2||window.loading_con==3){
              value = intensity_data.values[pick_info.index];
            }else{
              value = label_value;
            }
            var returnName = atlas_labels[template + "_label"][label_value].homo;
            var label = atlas_labels[template + "_label"][label_value].label;
            return {
              index: pick_info.index,
              value: value,
              intensity_data: intensity_data,
              returnName: returnName,
              label: label,
              template: template
            }
          }
        },
        blankparcel: function(){
          var header, select;
          header = $("<tr style=\"height:0.45rem\"></tr>");
          select = '<td width="5rem"><input type="text" name="parcelid" style="width:5rem;font-size:0.45rem" value="" disabled="true"/></td>';
          select += '<td width="5rem"><input type="text" name="parcelname" style="width:5rem;font-size:0.45rem" value="" disabled="true"/></td>';
          select += '<td width="1rem"><div style="display:inline;width:1rem"><img src="./static/img/cancel--v1.png" onclick="window.surfviewer.delParcelLabel(this,window.surfviewer)" heigh="15px" width="15px"></div></td>';
          header.html(select);
          header.appendTo("#parcelSelection");
        },
        delParcelLabel: function (domObj, viewer) {
        /**
         *
         *
         * @param {*} domObj
         * @param {*} viewer
         * @description 
         * !remove selected row and add a blank row
         */
          $(domObj).parents("tr").remove();
          let template, returnName;
          template = surfviewer.model_data.get().intensity_data[1].name.split('.')[1].slice(0, -7);
          returnName = $($($($(domObj).parents("tr")[0]).children("td")[0]).children("input")).val();
          let index = viewer.parcelSelect.indexOf(returnName);
          Array.prototype.baoremove = function (dx, viewer) {
            if (isNaN(dx) || dx > this.length) {
              return false;
            }
            this.splice(dx, 1);
            window.multiParcel = window.multiParcel - 1;
            window.surfviewer.blankparcel();
          }
          if (returnName != "") {
            viewer.loadIntensityDataFromURL("models/del/" + template + "/S1200." + returnName + ".32K.label.gii", {
              format: "gifti",
              blend: true,
              complete: function () {
                $("#loading").hide();
                init_1=0;
              }
            });
          }
          viewer.parcelSelect.baoremove(index, viewer);
        },
      }

      //////////////////////////////
      // Load modules.
      //////////////////////////////

      /**
       * @doc object
       * @name viewer.events:displaymodel
       *
       * @description
       * Triggered when a new model is displayed on the viewer. The following information
       * will be passed in the event object:
       *
       * * **event.model**: the visualized model as a THREE.Object3D object.
       * * **event.model\_data**: the data that the model represents.
       * * **event.new\_shapes**: an array of newly added shapes as THREE.Object3D objects.
       *
       * ```js
       *    viewer.addEventListener("displaymodel", function(event) {
       *      //...
       *    });
       * ```
       */
      /**
       * @doc object
       * @name viewer.events:loadintensitydata
       *
       * @description
       * Triggered when a new intensity is loaded. The following information
       * will be passed in the event object:
       *
       * * **event.model\_data**: the model data with which the intensity data is associated.
       * * **event.intensity\_data**: the loaded intensity data.
       *
       * ```js
       *    viewer.addEventListener("loadintensitydata", function(event) {
       *      //...
       *    });
       * ```
       */
      /**
       * @doc object
       * @name viewer.events:loadcolormap
       *
       * @description
       * Triggered when a new color map has finished loading. The following information
       * will be passed in the event object:
       *
       * * **event.color\_map**: the loaded color map.
       *
       * ```js
       *    viewer.addEventListener("loadcolormap", function(event) {
       *      //...
       *    });
       * ```
       */
      /**
       * @doc object
       * @name viewer.events:clearscreen
       *
       * @description
       * Triggered when the screen is cleared. No special information is
       * passed in the event object.
       *
       * ```js
       *    viewer.addEventListener("clearscreen", function(event) {
       *      //...
       *    });
       * ```
       */
      /**
       * @doc object
       * @name viewer.events:updateintensitydata
       *
       * @description
       * Triggered when the intensity is updated. The following information
       * will be passed in the event object:
       *
       * * **event.model\_data**: the model data on which the intensity data was updated.
       * * **event.intensity\_data**: the intensity data that was updated.
       * * **event.index**: the index at which the intensity value was updated.
       * * **event.value**: the new intensity value.
       *
       * ```js
       *    viewer.addEventListener("updateintensitydata", function(event) {
       *      //...
       *    });
       * ```
       */
      /**
       * @doc object
       * @name viewer.events:changeintensityrange
       *
       * @description
       * Triggered when the intensity range changes. The following information
       * will be passed in the event object:
       *
       * * **event.model\_data**: the model data on which the intensity data was updated.
       * * **event.intensity\_data**: the intensity data that was updated.
       * * **event.min**: the new minimum intensity value.
       * * **event.max**: the new maximum intensity value.
       *
       * ```js
       *    viewer.addEventListener("changeintensityrange", function(event) {
       *      //...
       *    });
       * ```
       */
      /**
       * @doc object
       * @name viewer.events:updatecolors
       *
       * @description
       * Triggered when model's colors are udpated. The following information
       * will be passed in the event object:
       *
       * * **event.model\_data**: the model data on representing the model that was updated.
       * * **event.intensity\_data**: the intensity data used to update the colors.
       * * **event.colors**: newly created array of colors.
       * * **event.blend**: was the the color array created by blending multiple intensity sets?
       *
       * ```js
       *    viewer.addEventListener("updatecolors", function(event) {
       *      //...
       *    });
       * ```
       */
      /**
       * @doc object
       * @name viewer.events:blendcolors
       *
       * @description
       * Triggered when multiple sets of intensity data have been loaded and blended.
       * The following information will be passed in the event object:
       *
       * * **event.model\_data**: the model data on representing the model that was updated.
       * * **event.intensity\_data**: the intensity data used to update the colors.
       * * **event.colors**: newly created array of colors.
       *
       * ```js
       *    viewer.addEventListener("blendcolors", function(event) {
       *      //...
       *    });
       * ```
       *
       */
      /**
       * @doc object
       * @name viewer.events:draw
       *
       * @description
       * Triggered when the scene is redrawn. The following information
       * will be passed in the event object:
       *
       * * **event.renderer**: the three.js renderer being used to draw the scene.
       * * **event.scene**: the THREE.Scene object representing the scene.
       * * **event.camera**: the THREE.PerspectiveCamera object being used to draw the scene.
       *
       * ```js
       *    viewer.addEventListener("draw", function(event) {
       *      //...
       *    });
       * ```
       */
      /**
       * @name viewer.events:zoom
       *
       * @description
       * Triggered when the user changes the zoom level of the viewer (scroll or touch events).
       * The following information will be passed in the event object:
       *
       * * **event.zoom**: the new zoom level.
       *
       * ```js
       *    viewer.addEventListener("zoom", function(event) {
       *      //...
       *    });
       * ```
       *
       */
      Object.keys(SurfaceViewer.modules).forEach(function (m) {
        SurfaceViewer.modules[m](viewer);
      });

      BrainBrowser.events.addEventModel(viewer);

      // Trigger a redraw on any event.
      BrainBrowser.events.addEventListener("*", function (event_name) {
        if (event_name !== "draw") {
          viewer.updated = true;
        }
      });

      //////////////////////////////////////////////////////
      // Prepare workers and pass SurfaceViewer instance
      // to calling application.
      //////////////////////////////////////////////////////

      setupWorkers(function () {
        callback(viewer);
      });

      return viewer;
    },
    /**
     * @doc function
     * @name window.SurfaceViewer:ccui
     * @param {surfviewer} window.SurfaceViewer
     * @param {ccviewer} window.viewer
     * @param {infoviewer} window.infoviewer
     * @param {callback} function
     */
    ccui: function (surfviewer, ccviewer, infoviewer, callback) {
      
      surfviewer.uploadIntensityData = function (event, res) {
        let returnName, label, template;
        returnName = res.returnName;
        label = res.label;
        template = res.template;
        if (returnName) {
          infoviewer.loadInfo({
            result: 'infoData/info_result1/' + template + '/' + returnName + '.json',
            //distance: 'infoData/info_result1/' + template + '_distance/' + returnName + '.json',
            roiName: label
          });
          infoviewer.loadMetaInfo(returnName, template, label);
          viewer.resultPanel(function () {
            if (!event.shiftKey) {
              window.loading_con = 1;
              console.log("models/" + template + "/S1200." + template + "." + returnName + ".32K.label.gii");
              window.surfviewer.loadfromURL("models/" + template + "/S1200." + template + "." + returnName + ".32K.label.gii", surfviewer, false, template)
            }
            let weightSelect = $("[name=weightVol]:checked").val() === undefined ? 'percen' : $("[name=weightVol]:checked").val();
            ccviewer.uploadData("models/Group_result1/Group_result1/" + template + "_result/" + returnName + '_' + weightSelect + "_000.nii", true);
          })
        };
      };
      callback(surfviewer, ccviewer, infoviewer)
    },
  }

  // Standard modules.
  SurfaceViewer.modules = {};

  // URLS for Web Workers.
  // May be network or Blob URLs
  SurfaceViewer.worker_urls = {};

  // Configuration for built-in parsers.
  BrainBrowser.config.set("model_types.json.worker", "json.worker.js");
  BrainBrowser.config.set("model_types.mniobj.worker", "mniobj.worker.js");
  BrainBrowser.config.set("model_types.wavefrontobj.worker", "wavefrontobj.worker.js");
  BrainBrowser.config.set("model_types.freesurferbin.worker", "freesurferbin.worker.js");
  BrainBrowser.config.set("model_types.freesurferbin.binary", true);
  BrainBrowser.config.set("model_types.freesurferasc.worker", "freesurferasc.worker.js");
  BrainBrowser.config.set("model_types.gifti.worker", "gifti.worker.js");

  BrainBrowser.config.set("intensity_data_types.text.worker", "text.intensity.worker.js");
  BrainBrowser.config.set("intensity_data_types.freesurferbin.worker", "freesurferbin.intensity.worker.js");
  BrainBrowser.config.set("intensity_data_types.freesurferbin.binary", true);
  BrainBrowser.config.set("intensity_data_types.freesurferasc.worker", "freesurferasc.intensity.worker.js");
  BrainBrowser.config.set("intensity_data_types.gifti.worker", "gifti.worker.js");

  // Build worker URLs and attempt to inline
  // them using Blob URLs if possible.
  function setupWorkers(callback) {

    var worker_dir = BrainBrowser.config.get("worker_dir");
    var error_message;

    if (worker_dir === null) {
      error_message = "error in SurfaceViewer configuration.\n" +
        "BrainBrowser configuration parameter 'worker_dir' not defined.\n" +
        "Use 'BrainBrowser.config.set(\"worker_dir\", ...)' to set it.";

      BrainBrowser.events.triggerEvent("error", {
        message: error_message
      });
      throw new Error(error_message);
    }

    var workers = {
      deindex: "deindex.worker.js",
      wireframe: "wireframe.worker.js"
    };

    var workers_loaded = 0;
    var worker_names;
    var model_types = BrainBrowser.config.get("model_types");
    var intensity_data_types = BrainBrowser.config.get("intensity_data_types");

    if (model_types !== null) {
      Object.keys(model_types).forEach(function (type) {
        workers[type + "_model"] = model_types[type].worker;
      });
    }

    if (intensity_data_types !== null) {
      Object.keys(intensity_data_types).forEach(function (type) {
        workers[type + "_intensity"] = intensity_data_types[type].worker;
      });
    }

    worker_names = Object.keys(workers);

    if (worker_names.length === 0) {
      callback();
      return;
    }

    if (window.URL && window.URL.createObjectURL) {
      worker_names.forEach(function (name) {
        var url = worker_dir + "/" + workers[name];

        var request = new XMLHttpRequest();
        var status;

        request.open("GET", url);
        request.onreadystatechange = function () {
          if (request.readyState === 4) {
            status = request.status;
            // Based on jQuery's "success" codes.
            if (status >= 200 && status < 300 || status === 304) {
              SurfaceViewer.worker_urls[name] = BrainBrowser.utils.createDataURL(request.response, "application/javascript");
            } else {
              SurfaceViewer.worker_urls[name] = url;
            }

            if (++workers_loaded === worker_names.length) {
              callback();
            }
          }
        };
        request.send();
      });

    } else {
      worker_names.forEach(function (name) {
        SurfaceViewer.worker_urls[name] = worker_dir + "/" + workers[name];
      });
      callback();
    }

  }

})();