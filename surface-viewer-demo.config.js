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
*
* Author: Tarek Sherif <tsherif@gmail.com> (http://tareksherif.ca/)
*/

(function() {
  "use strict";
  
  // REQUIRED
  BrainBrowser.config.set("worker_dir", "js/brainbrowser/workers/");

  // Custom configuration for the Surface Viewer demo app.
  BrainBrowser.config.set("model_types.freesurferasc.format_hint", 'You can use <a href="http://surfer.nmr.mgh.harvard.edu/fswiki/mris_convert" target="_blank">mris_convert</a> to convert your binary surface files into .asc format.');
  BrainBrowser.config.set("intensity_data_types.freesurferasc.format_hint", 'You can use <a href="http://surfer.nmr.mgh.harvard.edu/fswiki/mris_convert" target="_blank">mris_convert</a> to convert your binary surface files into .asc format.');

  BrainBrowser.config.set("color_maps_surf", [

    {
      name: "Plasma",
      url: "color-maps/plasma.txt",
      cursor_color: "#FF0000"
    },
    {
      name: "Viridis",
      url: "color-maps/viridis.txt",
      cursor_color: "#FF0000"
    },
    {
      name: "Cividis",
      url: "color-maps/cividis.txt",
      cursor_color: "#FF0000"
    },
    {
      name: "Spectral",
      url: "color-maps/spectral-brainview.txt",
      cursor_color: "#FFFFFF"
    },
    {
      name: "Thermal",
      url: "color-maps/thermal.txt",
      cursor_color: "#FFFFFF"
    },

  ]);
  BrainBrowser.config.set("color_maps_vol", [
      {
      name: "Cividis",
      url: "color-maps/cividis.txt",
      cursor_color: "#FFFFFF"
      },
      {
      name: "Plasma",
      url: "color-maps/plasma.txt",
      cursor_color: "#FF0000"
      },
      {
      name: "Viridis",
      url: "color-maps/viridis.txt",
      cursor_color: "#FF0000"
      },

    {
      name: "Spectral",
      url: "color-maps/spectral-brainview.txt",
      cursor_color: "#FFFFFF"
    },
    {
      name: "Thermal",
      url: "color-maps/thermal.txt",
      cursor_color: "#FFFFFF"
    },
    {
      name: "Gray",
      url: "color-maps/gray-scale.txt",
      cursor_color: "#FF0000"
    },
  ]);

  BrainBrowser.config.set("parcellation",
    {
      BN_Atlas:{min:-1,max:210},
      HCPMMP:{min:0,max:360},
      Parcel_L:{min:0,max:999},
      Parcel_R:{min:0,max:999}
    });
  BrainBrowser.config.set("loading_con",
  {
    "0":{surfweight:true,surfparcel:true,volweight:true},
    "1":{surfweight:true,surfparcel:true,volweight:false},
    "2":{surfweight:false,surfparcel:false,volweight:true},
    "3":{surfweight:true,surfparcel:false,volweight:true},
    "4":{surfweight:true,surfparcel:true,volweight:true}
  });  
})();


