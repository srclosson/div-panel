import ckeditor from '../examples/ckeditor.html';
import echartsGl from '../examples/echarts-gl.html';
import latestValues from '../examples/latest-values.html';
import leafletStrava from '../examples/leaflet-strava.html';
import threejs from '../examples/threejs-little-tokyo.html';
import { defaultContent } from './types';

export interface DivPanelExample {
  label: string;
  description: string;
  content: string;
}

// The files in examples/ are bundled into the plugin, so the picker works without internet access
// and always matches the installed version.
export const examples: DivPanelExample[] = [
  {
    label: 'Hello Div Panel',
    description: 'The starting template: the init and data callbacks, logging to the console.',
    content: defaultContent,
  },
  {
    label: 'Latest values',
    description: 'A table of the latest value of every series. Works with any query.',
    content: latestValues,
  },
  {
    label: 'ECharts GL world map',
    description: 'Loads ECharts and echarts-gl from a CDN and draws a world map.',
    content: echartsGl,
  },
  {
    label: 'three.js Little Tokyo',
    description: 'A three.js module script with an import map, rendering an animated 3D model.',
    content: threejs,
  },
  {
    label: 'CKEditor (edit mode)',
    description: 'Edit the panel in a WYSIWYG editor in edit mode; viewers see the saved HTML.',
    content: ckeditor,
  },
  {
    label: 'Leaflet + Strava',
    description: 'A Leaflet map with OpenStreetMap tiles. Draws your activities with the Strava data source.',
    content: leafletStrava,
  },
];
