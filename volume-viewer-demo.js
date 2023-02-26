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
// BrainBrowser Volume Viewer.
$(function () {
  "use strict";
  var loading_div = $("#loading");
  $(".button").button();
  $("#results_colormap_vol_con").click();
  window.cmap_url={
    surf:BrainBrowser.config.get("color_maps_surf")[0].url,
    vol:BrainBrowser.config.get("color_maps_vol")[0].url,
  }
  $("#volume-controls").tabs();
  var html = document.querySelector('html');
  html.style.fontSize = document.documentElement.clientWidth / 100 + 'px';
  /////////////////////////////////////
  // Start running the Volume Viewer
  /////////////////////////////////////
  window.viewer = BrainBrowser.VolumeViewer.start("volume-browser", function (viewer) {
    

    ///////////////////////////
    // Set up global UI hooks.
    ///////////////////////////

    $("#volume-type").change(function () {
      $("#sync-volumes-wrapper").hide();
      $("#volume-file").hide();

      if ($(this).val() === "functional_minc") {
        viewer.clearVolumes();
        viewer.loadVolume({
          type: "minc",
          header_url: "models/functional.mnc.header",
          raw_data_url: "models/functional.mnc.raw",
          template: {
            element_id: "volume-ui-template",
            viewer_insert_class: "volume-viewer-display"
          }
        }, function () {
          $(".slice-display").css("display", "inline");
          $(".volume-controls").css("width", "auto");
        });
      } else if ($(this).val() === "structural_minc") {
        $("#sync-volumes-wrapper").show();
        viewer.clearVolumes();
        viewer.loadVolumes({
          volumes: [{
              type: "minc",
              header_url: "models/structural1.mnc.header",
              raw_data_url: "models/structural1.mnc.raw",
              template: {
                element_id: "volume-ui-template",
                viewer_insert_class: "volume-viewer-display"
              }
            },
            {
              type: 'minc',
              header_url: "models/structural2.mnc.header",
              raw_data_url: "models/structural2.mnc.raw",
              template: {
                element_id: "volume-ui-template",
                viewer_insert_class: "volume-viewer-display"
              }
            }
          ],
          overlay: {
            template: {
              element_id: "overlay-ui-template",
              viewer_insert_class: "overlay-viewer-display"
            }
          }
        });
      } else if ($(this).val() === "NIfTI-1") {
        $("#sync-volumes-wrapper").show();
        viewer.clearVolumes();
        viewer.loadVolumes({
          volumes: [{
              type: "nifti1",
              nii_url: "models/functional.nii",
              template: {
                element_id: "volume-ui-template",
                viewer_insert_class: "volume-viewer-display"
              }
            },
            {
              type: 'nifti1',
              nii_url: "models/structural.nii",
              template: {
                element_id: "volume-ui-template",
                viewer_insert_class: "volume-viewer-display"
              }
            }
          ],
          overlay: {
            template: {
              element_id: "overlay-ui-template",
              viewer_insert_class: "overlay-viewer-display"
            }
          }
        });
      }
    });

    $("#download-nifti1").click(function(){
      window.viewer.download_Req('models/MNICC07mm_XXmask_final_final_131.nii')
    })

    // Change viewer panel canvas size.
    $("#panel-size").change(function () {
      var size = parseInt($(this).val(), 10);

      if (size < 0) {
        viewer.setAutoResize(true, 'volume-controls');
        $('#brainbrowser-wrapper').css("width", "90%");
        $('#volume-viewer').css("width", "100%");
        $('#brainbrowser').css("width", "100%");
        viewer.doAutoResize();
      } else {
        viewer.setAutoResize(false);
        $('#brainbrowser-wrapper').css("width", "60em");
        $('#volume-viewer').css("width", "");
        $('#brainbrowser').css("width", "");
        $('.volume-controls').css("width", "");
        viewer.setPanelSize(size, size, {
          scale_image: true
        });
      }
    });

    // Should cursors in all panels be synchronized?
    $("#sync-volumes").change(function () {
      var synced = $(this).is(":checked");
      if (synced) {
        viewer.resetDisplays();
        viewer.redrawVolumes();
      }

      viewer.synced = synced;
    });

    // This will create an image of all the display panels
    // currently being shown in the viewer.
    $("#screenshot").click(function () {
      var width = 0;
      var height = 0;
      var active_panel = viewer.active_panel;

      // Create a canvas on which we'll draw the images.
      var canvas = document.createElement("canvas");
      var context = canvas.getContext("2d");
      var img = new Image();

       viewer.volumes[2].display.forEach(function (panel) {
          width = Math.max(width, panel.canvas.width);
          height = Math.max(height, panel.canvas.height);
        });
      

      canvas.width = width * viewer.volumes.length*0.35;
      canvas.height = height*0.8;
      context.fillStyle = "#9b9b9b";
      context.fillRect(0, 0, canvas.width, canvas.height);

      // The active canvas is highlighted by the viewer,
      // so we set it to null and redraw the highlighting
      // isn't shown in the image.
      if (active_panel) {
        active_panel.updated = true;
        viewer.active_panel = null;
        viewer.draw();
      }

    
        viewer.volumes[2].display.forEach(function (panel, axis_name, y) {
          context.drawImage(panel.canvas, 0 * width, 0 * height);
        });
      

      // Restore the active canvas.
      if (active_panel) {
        active_panel.updated = true;
        viewer.active_panel = active_panel;
        viewer.draw();
      }

      // Show the created image in a dialog box.
      img.onload = function () {
        $("<div></div>").append(img).dialog({
          title: "Slices",
          height: img.height*1.2,
          width: img.width*1.05,
          position: [ $(window).width() / 9,$(window).height() / 3 ]
        });
      };

      img.src = canvas.toDataURL();
    });
    $("[name=voxelSizeSelect]").change(function () {
      window.loading_con = 0;
      window.surfviewer.stamp_condition();
      if (Number($("[name=voxelSizeSelect]:checked").val()) > 3) {
        $("#color-map-select-vol").val("color-maps/spectral-brainview.txt");
        window.cmap_url.vol="color-maps/spectral-brainview.txt";
;
        window.viewer.uploadData('models/' + $("[name=voxelSizeSelect]:checked").val() + '.nii', true);

      }
      else{
        window.viewer.uploadData('models/MNICC07mm_XXmask_final_final_131.nii', true);

      }
    });

    $("[name=volume-file-type]").change(function(){
      let dir=$("[name=volume-file-type]:checked").val();
      console.log(dir)
      if(dir=="Group_result2/"){
        window.loading_con=0;
        window.surfviewer.stamp_condition();
        document.getElementById("surface-controls").getElementsByTagName('a')[0].click();
        window.viewer.uploadData('models/MNICC07mm_XXmask_final_final_131.nii', true);
        surfviewer.getDataURL(surfviewer.model_data.get(), surfviewer, function (url, viewer, colormap, template) {
          viewer.loadfromURL(url, viewer, colormap, template)

        });
      }else{
        window.loading_con=3;
        window.viewer.datadir = 'save-file/' + dir + '/json/data.nii';
        viewer.uploadData('save-file/' + dir + '/json/data.nii', false);
        window.surfviewer.loadColorMapFromURL($('#color-map-select').val());
        window.surfviewer.resultPanel(window.surfviewer);
        
        window.surfviewer.stamp_condition();
        document.getElementById("volume-controls").getElementsByTagName('a')[0].click();
        document.getElementById("surface-controls").getElementsByTagName('a')[1].click();
        let info = window.surfviewer.model_data.get();
        window.surfviewer.getDataURL(info, window.surfviewer, function (url, viewer, colormap, template) {
          viewer.loadfromURL(url, viewer, colormap, template)
        });
      }


    });
    
    // Load a new model from a MINC file that the user has
    // selected.
    $("#volume-file-minc-submit").click(function () {
      viewer.clearVolumes();
      viewer.loadVolume({
        type: "minc",
        header_file: document.getElementById("header-file"),
        raw_data_file: document.getElementById("raw-data-file"),
        template: {
          element_id: "volume-ui-template",
          viewer_insert_class: "volume-viewer-display"
        }
      }, function () {
        $(".slice-display").css("display", "inline");
        $(".volume-controls").css("width", "auto");
      });
    });


    $("#fake-file-upload").click(function () {
      $("#nifti1-file").click();
    })

    $("#nifti1-file").change(function () {
      console.log('nifti1-file clicked')
      // Load a new model from a NIfTI-1 file that the user has
      // selected.
      // $("#volume-file-nifti1-submit").click(function () {
        console.log('volume uploaded');
        viewer.clearVolumes();
        $("#loading").show();
        window.viewer.uploadMask(function (res) {
          if (res.err) {
            alert(res.err);
          } else if (res.stderr) {
            alert(res.stderr);
          }
          if (res.std) {
            alert(res.std);
          }
          if (!res.stderr && !res.err) {
            window.viewer.changeMask(res, function () {
              window.viewer.datadir = 'save-file/' + $("[name=volume-file-type]:checked").val() + '/json/data.nii';
              viewer.uploadData('save-file/' + res.path + '/json/data.nii', false);
              window.surfviewer.loadColorMapFromURL($('#color-map-select').val());
              window.surfviewer.resultPanel(window.surfviewer);
              window.loading_con=3;
              window.surfviewer.stamp_condition();
              document.getElementById("volume-controls").getElementsByTagName('a')[0].click();
              document.getElementById("surface-controls").getElementsByTagName('a')[1].click();
              let info = window.surfviewer.model_data.get();
              window.surfviewer.getDataURL(info, window.surfviewer, function (url, viewer, colormap, template) {
                viewer.loadfromURL(url, viewer, colormap, template)
              });

            });
          }
        });
      // });
    })




    // Load a new model from a MGH file that the user has
    // selected.


    $("#volume-file-mgh-submit").click(function () {
      viewer.clearVolumes();
      viewer.loadVolume({
        type: "mgh",
        file: document.getElementById("mgh-file"),
        template: {
          element_id: "volume-ui-template",
          viewer_insert_class: "volume-viewer-display"
        }
      }, function () {
        $(".slice-display").css("display", "inline");
        $(".volume-controls").css("width", "auto");
      });
    });

    $(document).keypress(function (e) {
      if (e.keyCode === 114) {
        // Reset displays if user presses 'r' key.
        viewer.resetDisplays();
        viewer.redrawVolumes();
      }
    });

    /**
     * @doc function
     * @name viewer.setAutoResize
     * @param {boolean} flag Whether we should auto-resize the views.
     * @param {string} class_name The name of the class associated with volume
     * controls.
     *
     * @description
     * Enable or disable auto-resizing mode.
     * ```js
     * viewer.setAutoResize(true, 'volume-controls');
     * ```
     */
    viewer.setAutoResize = function (flag, class_name) {
      viewer.auto_resize = flag;
      viewer.volume_control_class = class_name;
    };

    /**
     * @doc function
     * @name viewer.doAutoResize
     * @description
     * This function implements auto-resizing of the volume panels
     * when the window itself is resized. It should therefore be invoked
     * as part of a window resize notification.
     */
    viewer.doAutoResize = function () {
      if (!viewer.auto_resize) {
        return;
      }

      function getIntProperty(class_name, prop_name) {
        return parseInt($(class_name).css(prop_name).replace('px', ''), 10);
      }
      /* Assumes at least three views or three volumes across.
       */
      var n = Math.max(viewer.volumes.length, 3);
      var ml = getIntProperty('.slice-display', 'margin-left');
      var mr = getIntProperty('.slice-display', 'margin-right');

      var size = $('#' + viewer.dom_element.id).width() / n - (ml + mr);

      viewer.setDefaultPanelSize(size, size);
      viewer.setPanelSize(size, size, {
        scale_image: true
      });

      if (viewer.volume_control_class) {
        var pd = getIntProperty("." + viewer.volume_control_class, 'padding');
        $("." + viewer.volume_control_class).width(size - pd * 2);
      }
    };

    window.addEventListener('resize', viewer.doAutoResize, false);

    //////////////////////////////////
    // Per volume UI hooks go in here.
    //////////////////////////////////
    viewer.addEventListener("volumeuiloaded", function (event) {
      var container = event.container;
      var volume = event.volume;
      var vol_id = event.volume_id;

      container = $(container);

      container.find(".button").button();

      // The world coordinate input fields.
      container.find(".world-coords").change(function () {
        var div = $(this);

        var x = parseFloat(div.find("#world-x-" + vol_id).val());
        var y = parseFloat(div.find("#world-y-" + vol_id).val());
        var z = parseFloat(div.find("#world-z-" + vol_id).val());

        // Make sure the values are numeric.
        if (!BrainBrowser.utils.isNumeric(x)) {
          x = 0;
        }
        if (!BrainBrowser.utils.isNumeric(y)) {
          y = 0;
        }
        if (!BrainBrowser.utils.isNumeric(z)) {
          z = 0;
        }

        // Set coordinates and redraw.
        if (viewer.synced) {
          viewer.volumes.forEach(function (volume) {
            volume.setWorldCoords(x, y, z);
          });
        } else {
          viewer.volumes[vol_id].setWorldCoords(x, y, z);
        }

        viewer.redrawVolumes();
      });

      // The world coordinate input fields.
      container.find(".voxel-coords").change(function () {
        var div = $(this);

        var i = parseInt(div.find("#voxel-i-" + vol_id).val(), 10);
        var j = parseInt(div.find("#voxel-j-" + vol_id).val(), 10);
        var k = parseInt(div.find("#voxel-k-" + vol_id).val(), 10);

        // Make sure the values are numeric.
        if (!BrainBrowser.utils.isNumeric(i)) {
          i = 0;
        }
        if (!BrainBrowser.utils.isNumeric(j)) {
          j = 0;
        }
        if (!BrainBrowser.utils.isNumeric(k)) {
          k = 0;
        }

        // Set coordinates and redraw.
        viewer.volumes[vol_id].setVoxelCoords(i, j, k);
        if (viewer.synced) {
          var synced_volume = viewer.volumes[vol_id];
          var wc = synced_volume.getWorldCoords();
          viewer.volumes.forEach(function (volume) {
            if (synced_volume !== volume) {
              volume.setWorldCoords(wc.x, wc.y, wc.z);
            }
          });
        }

        viewer.redrawVolumes();
      });


      // Load a color map select by the user.
      container.find(".color-map-file").change(function () {
        console.log(viewer)
        viewer.loadVolumeColorMapFromFile(vol_id, this, "#FF0000", function () {
          viewer.redrawVolumes();
        });
      });

      // Change the range of intensities that will be displayed.
      container.find(".threshold-div").each(function () {
        var div = $(this);

        // Input fields to input min and max thresholds directly.
        var min_input = div.find("#min-threshold-" + vol_id);
        var max_input = div.find("#max-threshold-" + vol_id);

        // Slider to modify min and max thresholds.
        var slider = div.find(".slider");

        var volume = viewer.volumes[vol_id];

        // Update the input fields.
        min_input.val(volume.getVoxelMin());
        max_input.val(volume.getVoxelMax());

        slider.slider({
          range: true,
          min: volume.getVoxelMin(),
          max: volume.getVoxelMax(),
          values: [volume.getVoxelMin(), volume.getVoxelMax()],
          step: 1,
          slide: function (event, ui) {
            var values = ui.values;

            // Update the input fields.
            min_input.val(values[0]);
            max_input.val(values[1]);

            // Update the volume and redraw.
            volume.intensity_min = values[0];
            volume.intensity_max = values[1];
            viewer.redrawVolumes();
          },
          stop: function () {
            $(this).find("a").blur();
          }
        });


        container.find(".time-div").each(function () {
          var div = $(this);

          if (volume.header.time) {
            div.show();
          } else {
            return;
          }

          var slider = div.find(".slider");
          var time_input = div.find("#time-val-" + vol_id);

          var min = 0;
          var max = volume.header.time.space_length - 1;

          slider.slider({
            min: min,
            max: max,
            value: 0,
            step: 1,
            slide: function (event, ui) {
              var value = +ui.value;
              time_input.val(value);
              volume.current_time = value;
              viewer.redrawVolumes();
            },
            stop: function () {
              $(this).find("a").blur();
            }
          });

        });

        // Create an image of all slices in a certain
        // orientation.
        container.find(".slice-series-div").each(function () {
          var div = $(this);

          var space_names = {
            xspace: "Sagittal",
            yspace: "Coronal",
            zspace: "Transverse"
          };

          div.find(".slice-series-button").click(function () {
            var axis_name = $(this).data("axis");
            var axis = volume.header[axis_name];
            var space_length = axis.space_length;
            var time = volume.current_time;
            var per_column = 10;
            var zoom = 0.5;
            var i, x, y;

            // Canvas on which to draw the images.
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");

            // Get first slice to set dimensions of the canvas.

            var image_data = volume.getSliceImage(volume.slice(axis_name, 0, time), zoom);
            console.log({
              "image_data": image_data
            })
            var img = new Image();
            canvas.width = per_column * image_data.width;
            canvas.height = Math.ceil(space_length / per_column) * image_data.height;
            context.fillStyle = "#888888";
            context.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the slice on the canvas.
            context.putImageData(image_data, 0, 0);

            // Draw the rest of the slices on the canvas.
            for (i = 1; i < space_length; i++) {
              image_data = volume.getSliceImage(volume.slice(axis_name, i, time), zoom);
              x = i % per_column * image_data.width;
              y = Math.floor(i / per_column) * image_data.height;
              context.putImageData(image_data, x, y);
            }

            // Retrieve image from canvas and display it
            // in a dialog box.
            img.onload = function () {
              $("<div></div>").append(img).dialog({
                title: space_names[axis_name] + " Slices",
                height: 600,
                width: img.width
              });
            };

            img.src = canvas.toDataURL();
          });
        });

        // Blend controls for a multivolume overlay.
        container.find(".blend-div").each(function () {
          var div = $(this);
          var slider = div.find(".slider");
          var blend_input = div.find("#blend-val");

          // Slider to select blend value.
          slider.slider({
            min: 0,
            max: 1,
            step: 0.01,
            value: 0.5,
            slide: function (event, ui) {
              var value = parseFloat(ui.value);
              volume.blend_ratios[0] = 1 - value;
              volume.blend_ratios[1] = value;
              blend_input.val(value);
              viewer.redrawVolumes();
            },
            stop: function () {
              $(this).find("a").blur();
            }
          });

          // Input field to select blend values explicitly.
          blend_input.change(function () {
            var value = parseFloat(this.value);

            // Check that input is numeric and in range.
            if (!BrainBrowser.utils.isNumeric(value)) {
              value = 0;
            }
            value = Math.max(0, Math.min(value, 1));
            this.value = value;

            // Update slider and redraw volumes.
            slider.slider("value", value);
            volume.blend_ratios[0] = 1 - value;
            volume.blend_ratios[1] = value;
            viewer.redrawVolumes();
          });
        });

        // Contrast controls
        container.find(".contrast-div").each(function () {
          var div = $(this);
          var slider = div.find(".slider");
          var contrast_input = div.find("#contrast-val");

          // Slider to select contrast value.
          slider.slider({
            min: 0,
            max: 2,
            step: 0.05,
            value: 1,
            slide: function (ui) {
              var value = parseFloat(ui.value);
              volume.display.setContrast(value);
              volume.display.refreshPanels();

              contrast_input.val(value);
            },
            stop: function () {
              $(this).find("a").blur();
            }
          });

          // Input field to select contrast values explicitly.
          contrast_input.change(function () {
            var value = parseFloat(this.value);

            // Check that input is numeric and in range.
            if (!BrainBrowser.utils.isNumeric(value)) {
              value = 0;
            }
            value = Math.max(0, Math.min(value, 2));
            this.value = value;

            // Update slider and redraw volumes.
            slider.slider("value", value);
            volume.display.setContrast(value);
            volume.display.refreshPanels();
            viewer.redrawVolumes();
          });
        });

        // Contrast controls
        container.find(".brightness-div").each(function () {
          var div = $(this);
          var slider = div.find(".slider");
          var brightness_input = div.find("#brightness-val");

          // Slider to select brightness value.
          slider.slider({
            min: -1,
            max: 1,
            step: 0.05,
            value: 0,
            slide: function (event, ui) {
              var value = parseFloat(ui.value);
              volume.display.setBrightness(value);
              volume.display.refreshPanels();

              brightness_input.val(value);
            },
            stop: function () {
              $(this).find("a").blur();
            }
          });

          // Input field to select brightness values explicitly.
          brightness_input.change(function () {
            var value = parseFloat(this.value);

            // Check that input is numeric and in range.
            if (!BrainBrowser.utils.isNumeric(value)) {
              value = 0;
            }
            value = Math.max(-1, Math.min(value, 1));
            this.value = value;

            // Update slider and redraw volumes.
            slider.slider("value", value);
            volume.display.setBrightness(value);
            volume.display.refreshPanels();
            viewer.redrawVolumes();
          });
        });
      });

      /* This function simply takes an input hex background color
       * and returns either "black" or "white" as the appropriate
       * foreground color for text rendered over the background colour.
       * Idea from https://24ways.org/2010/calculating-color-contrast/
       * Equation is from http://www.w3.org/TR/AERT#color-contrast
       */
      function getContrastYIQ(hexcolor) {
        var r = parseInt(hexcolor.substr(0, 2), 16);
        var g = parseInt(hexcolor.substr(2, 2), 16);
        var b = parseInt(hexcolor.substr(4, 2), 16);
        var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? 'black' : 'white';
      }

      /////////////////////////////////////////////////////
      // UI updates to be performed after each slice update.
      //////////////////////////////////////////////////////
      viewer.addEventListener("cursorupdate", function (event) {
        var panel = event.target;
        var volume = event.volume;
        var vol_id = panel.volume_id;
        var world_coords, voxel_coords;

        if (BrainBrowser.utils.isFunction(volume.getWorldCoords)) {
          world_coords = volume.getWorldCoords();
          $("#world-x-" + vol_id).val(world_coords.x.toPrecision(6));
          $("#world-y-" + vol_id).val(world_coords.y.toPrecision(6));
          $("#world-z-" + vol_id).val(world_coords.z.toPrecision(6));
        }

        if (BrainBrowser.utils.isFunction(volume.getVoxelCoords)) {
          voxel_coords = volume.getVoxelCoords();
          $("#voxel-i-" + vol_id).val(parseInt(voxel_coords.i, 10));
          $("#voxel-j-" + vol_id).val(parseInt(voxel_coords.j, 10));
          $("#voxel-k-" + vol_id).val(parseInt(voxel_coords.k, 10));
        }
        if (volume.header && volume.header.time) {
          $("#time-slider-" + vol_id).slider("option", "value", volume.current_time);
          $("#time-val-" + vol_id).val(volume.current_time);
        }
      });


      viewer.addEventListener("colormapPanel", function () {
        var model_data = viewer.volumes[1];
        var container = $("#data-range-vol");
        var headers = '<div id="data-range-multiple-vol">';
        var controls = "";
        var i;
        var data_set = viewer.volumes[1].data;
        var dataName_split = viewer.datadir.split('/');
        let cmap=window.cmap_url.vol;
        container.html("");
        headers += '<h3>' + dataName_split[dataName_split.length - 1];
        headers += '</h3>';
        controls += '<div id="data-file-vol' + i + '" class="box range-controls">';
        controls += '<span>';
        controls += '<input class="range-box" id="data-range-min-vol" type="text" name="range_min" size="0.7rem" style="width:2rem">';
        controls += '<div id="range-slider' + i + '" data-blend-index="' + i + '" class="slider"  style="margin:0 20px 0 20px"></div>';
        controls += '<input class="range-box" id="data-range-max-vol" type="text" name="range_max" size="0.7rem" style="width:2rem">';
        controls += '<div id="color-map-box-vol" style="display:inline;margin-left:1rem;width:2rem"></div>';
        controls += '</span>';
        controls += '</div>';
        container.html(headers + controls + "</div>");
        $("#data-range-box-vol").show();
        $("#color-map-box-vol").show();

        BrainBrowser.config.get("color_maps_vol").forEach(function (color_map) {
          color_map_select_volume.append('<option value="' + color_map.url + '">' + color_map.name + '</option>');
        });


        container.find(".range-controls").each(function (index) {
          var controls = $(this);
          var intensity_data = data_set;
          var data_min = viewer.volumes[1].intensity_min;
          var data_max = viewer.volumes[1].intensity_max;
          var range_min = data_min;
          var range_max = data_max;
          var min_input = controls.find("#data-range-min-vol");
          var max_input = controls.find("#data-range-max-vol");
          var slider = controls.find(".slider");
          console.log(range_min)
          slider.slider({
            range: true,
            min: data_min,
            max: data_max,
            values: [range_min, range_max],
            step: (range_max - range_min) / 100.0,
            slide: function (event,ui) {
              let values = ui.values;
              // Update the input fields.
              min_input.val(values[0].toPrecision(2));
              max_input.val(values[1].toPrecision(2));

              // Update the volume and redraw.
              viewer.volumes[1].intensity_min = values[0];
              viewer.volumes[1].intensity_max = values[1];

              let canvas = viewer.volumes[1].color_map.createElement(values[0], values[1])
              canvas.id = "spectrum-canvas-vol";

              $(spectrum_div).html(canvas);

              viewer.redrawVolumes();
            }
          });

          slider.slider("values", 0, parseFloat(range_min));
          slider.slider("values", 1, parseFloat(range_max));
          min_input.val(range_min.toPrecision(3));
          max_input.val(range_max.toPrecision(3));
          var spectrum_div = document.getElementById("color-bar-vol");
          var min, max;
          var canvas;

          if (model_data && intensity_data) {
            min = viewer.volumes[1].intensity_min;
            max = viewer.volumes[1].intensity_max;
          } else {
            min = 0;
            max = 1;
          }


          $("#color-map-box-vol").append(color_map_select_volume);
          color_map_select_volume.val(window.cmap_url.vol);


          canvas = viewer.volumes[1].color_map.createElement(min, max);
          canvas.id = "spectrum-canvas-vol";
          let spectrum = document.getElementById("color-bar-vol");
          if (!spectrum) {
            $("<div id=\"color-bar-vol\"></div>").html(canvas).appendTo("#data-range-box-vol");
          } else {
            $(spectrum).html(canvas);
          }


        $("#data-range-min").change(inputRangeChange);
        $("#data-range-max").change(inputRangeChange);

          function inputRangeChange() {

            var min = parseFloat(min_input.val());
            var max = parseFloat(max_input.val());

            slider.slider("values", 0, min);
            slider.slider("values", 1, max);
            viewer.volumes[1].intensity_min = min;
            viewer.volumes[1].intensity_max = max;

            let spectrum_div = document.getElementById("color-bar-vol")

            let canvas = viewer.volumes[1].color_map.createElement(min, max)
            canvas.id = "spectrum-canvas-vol";

            $(spectrum_div).html(canvas);
            viewer.redrawVolumes();

          }

          $("#data-range-min-vol").change(inputRangeChange);
          $("#data-range-max-vol").change(inputRangeChange);

          // $("#fix_range").click(function () {
          //   viewer.setAttribute("fix_color_range", $(this).is(":checked"));
          // });

          // $("#fixed").change(function () {
          //   var min = parseFloat(min_input.val());
          //   var max = parseFloat(max_input.val());
          //   if (viewer.volumes[1].color_map) {
          //     viewer.volumes[1].color_map.fixed = $(this).is(":checked");
          //   }

          //   viewer.volumes[1].intensity_min = min;
          //   viewer.volumes[1].intensity_max = max;
          //   viewer.redrawVolumes();

          // });
        });
        viewer.redrawVolumes();
      }); 
      viewer.addEventListener("changeColorMap",function(){
        var model_data = viewer.volumes[1];
        var intensity_data = viewer.volumes[1].data;
        var min,max;
        if (model_data && intensity_data) {
          min = viewer.volumes[1].intensity_min;
          max = viewer.volumes[1].intensity_max;
        } else {
          min = 0;
          max = 1;
        }
        let canvas = viewer.volumes[1].color_map.createElement(min, max);
        canvas.id = "spectrum-canvas-vol";
        let spectrum = document.getElementById("color-bar-vol");
        if (!spectrum) {
          $("<div id=\"color-bar-vol\"></div>").html(canvas).appendTo("#data-range-box-vol");
        } else {
          $(spectrum).html(canvas);
        }
        viewer.redrawVolumes();
      });

      var color_map_select_volume = $('<select id="color-map-select-vol"></select>').change(function () {
        var selection = $(this).find(":selected");
        window.cmap_url.vol=selection.val();
        viewer.loadVolumeColorMapFromURL(1, selection.val(), selection.data("cursor-color"), function () {
          viewer.triggerEvent("changeColorMap");
        });
      });

    });


    loading_div.show();

    //////////////////////////////
    // Load the default color map.
    //////////////////////////////
    /*    viewer.loadDefaultColorMapFromURL(1, color_map_config.url, color_map_config.cursor_color, function() {
              viewer.redrawVolumes();
            });*/
    viewer.loadDefaultColorMapFromURL("color-maps/gray-scale.txt", "FF0000");


    ////////////////////////////////////////
    // Set the size of slice display panels.
    ////////////////////////////////////////

    var div_height = document.getElementById("volume-container").clientHeight;
    var div_width = document.getElementById("volume-container").clientWidth;
    var margin_left = (div_width - div_height * 0.55) / 2;
    viewer.setDefaultPanelSize(div_height * 0.55, div_height * 0.55);
    $('#volume-browser').css("left", margin_left);
    /*$('.slider').css("width", "80%");*/
    window.addEventListener("resize", () => {
      console.log("resize")
      let div_height_new = document.getElementById("volume-container").clientHeight;
      let div_width_new = document.getElementById("volume-container").clientWidth;
      let margin_left_new = (div_width_new - div_height_new * 0.55) / 2;
      $('#brainbrowser-wrapper').css("width", "60em");
      $('#volume-browser').css("left", margin_left_new);
      $('#brainbrowser').css("width", "");
      $('.volume-controls').css("width", "");
      /*$('.slider').css("width", "60%");*/
      $('.spectrum-canvas-vol').css("width", "60%");
      $('.spectrum-canvas').css("width", "60%");
      viewer.setPanelSize(div_height_new * 0.55, div_height_new * 0.55, {
        scale_image: true
      });
    })



    ///////////////////
    // Start rendering.
    ///////////////////
    viewer.render();

    /////////////////////
    // Load the volumes.
    /////////////////////
    viewer.loadVolumes({
      volumes: [{
          type: "nifti1",
          nii_url: "models/MNI152_T1_0.7mm_mask_131.nii",
          views: ["xspace"],
          template: {
            element_id: "volume-ui-template",
            viewer_insert_class: "volume-viewer-display"
          },
        },
        {
          type: 'nifti1',
          nii_url: "models/MNICC07mm_XXmask_final_final_131.nii",
          views: ["xspace"],
          template: {
            element_id: "volume-ui-template",
            viewer_insert_class: "volume-viewer-display"
          },
        }
      ],
      overlay: {
        views: ["xspace"],
        template: {
          element_id: "overlay-ui-template",
          viewer_insert_class: "overlay-viewer-display",

        },
        header: {
          space_length: [0, 311, 260],
          step: [-0.699999988079071, 0.699999988079071, 0.699999988079071],
          start: [-1.699998378753662, -126, -72],
          offset: [1, 1, 1]
        }

      },
      complete: function () {

        $("#brainbrowser-wrapper").slideDown({
          duration: 600
        });
        var color_map_config;
        if(typeof($("#color-map-select-vol").find(":selected").val()) == "undefined"){
          color_map_config = BrainBrowser.config.get("color_maps_vol")[0].url;
        }else{
          color_map_config = $("#color-map-select-vol").find(":selected").val();
          console.log(color_map_config)
        }

        viewer.loadVolumeColorMapFromURL(1, color_map_config, "#FFFFFF", function () {
          //viewer.redrawVolumes();
          viewer.triggerEvent("colormapPanel");
        });
        let stamp = document.getElementsByName("weightVol");
        stamp[0].disabled = true;
        stamp[1].disabled = true;

      }
    });

  });
  document.addEventListener("keypress",function(e){console.log(e)})
});