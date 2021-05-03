import { PanelData, DataFrame } from '@grafana/data';
const Handlebars = require('handlebars');

export const register = (data: PanelData) => {
  Handlebars.registerHelper('last', () =>
    data.series[0].fields[1].values.get(data.series[0].fields[1].values.length - 1)
  );
};

export const compile = (html: string, series: DataFrame[]): string => {
  try {
    const template = Handlebars.compile(html);
    return template(series);
  } catch (ex) {
    return html;
  }
};
