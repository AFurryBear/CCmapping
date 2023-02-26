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
*/

BrainBrowser.VolumeViewer.modules.rendering = function(viewer) {
  "use strict";

  /**
  * @doc function
  * @name viewer.rendering:draw
  *
  * @description
  * Draw current slices to the canvases.
  * ```js
  * viewer.draw();
  * ```
  */
  viewer.draw = function() {
    try{
      viewer.volumes.forEach(function(volume) {
        volume.display.forEach(function(panel) {
          panel.draw(
            volume.color_map.cursor_color,
            viewer.active_panel === panel
          );
        });
      });
    }catch(err){
      $("#volume-browser").show()
      return
    }
  };

  /**
  * @doc function
  * @name viewer.rendering:render
  *
  * @description
  * Start render loop around **viewer.draw()**.
  * ```js
  * viewer.render();
  * ```
  */
  viewer.render = function() {
    viewer.triggerEvent("rendering");

    (function render() {
      window.requestAnimationFrame(render);

      viewer.draw();
      // console.log(display)
      // console.log(display_1)
      // console.log(display_2)
      // console.log(count_1)
      // console.log(count_2)
      // console.log(count_3)
      if(display!=0){
        $("#surface-browser").show();
        $("#volume-browser").show();
        console.log("tong最终显示,count_3:"+count_3);
        display=0;
        display_1=0;
        display_2=0;
        count_1=0;
        count_2=0;
        count_3=0;
        $("#loading").hide();
        init_1=0;
        // debugger
      }
      // 只切换volume resolution时：
      // 故意让开始不同步
      else if (display_1==2&&count_1==0&&display_2==0){
        $("#volume-browser").show();
        console.log("tong单独显示");
        display=0;
        display_1=0;
        display_2=0;
        count_1=0;
        count_2=0;
        count_3=0;
        init_1=0;
        $("#loading").hide();
      }
    })();
  };

  /**
  * @doc function
  * @name viewer.rendering:redrawVolume
  * @param {number} vol_id The id of the volume to be redrawn.
  *
  * @description
  * Redraw a single volume at its current position.
  * ```js
  * viewer.redrawVolume(vol_id);
  * ```
  */
  viewer.redrawVolume = function(vol_id) {
    var volume = viewer.volumes[vol_id];
    try{
      volume.display.forEach(function(panel) {
        panel.updateSlice();
      });
    }catch(err){
      $("#volume-browser").show()
      return
    }
  };

  /**
  * @doc function
  * @name viewer.rendering:redrawVolumes
  *
  * @description
  * Redraw all volumes at their current position.
  * ```js
  * viewer.redrawVolumes();
  * ```
  */
  viewer.redrawVolumes = function() {
    try{
      viewer.volumes.forEach(function(volume, vol_id) {
        viewer.redrawVolume(vol_id);
      });
    }catch(err){
      $("#volume-browser").show()
      return
    }
  };

  /**
  * @doc function
  * @name viewer.rendering:resetDisplays
  *
  * @description
  * Reset all displays.
  * ```js
  * viewer.resetDisplays();
  * ```
  */
  viewer.resetDisplays = function() {
    try{
      viewer.volumes.forEach(function(volume) {
        volume.display.forEach(function(panel) {
          panel.reset();
        });
      });
    }catch(err){
      $("#volume-browser").show()
      return
    }
    
  };

  /**
  * @doc function
  * @name viewer.rendering:setPanelSize
  * @param {number} width Panel width.
  * @param {number} height Panel height.
  * @param {object} options The only currently supported
  *   option is **scale_image** which, if set to **true**
  *   will scale the displayed slice by the same proportion
  *   as the panel.
  *
  * @description
  * Update the size of panel canvases.
  * ```js
  * viewer.setPanelSize(512, 512, {
  *   scale_image: true
  * });
  * ```
  */
  viewer.setPanelSize = function(width, height, options) {
    try{
      viewer.volumes.forEach(function(volume) {
        volume.display.forEach(function(panel) {
          panel.setSize(width, height, options);
        });
      });
    }catch(err){
      $("#volume-browser").show()
      return
    }
  };
};