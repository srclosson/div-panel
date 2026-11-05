import Handlebars from 'handlebars';
import { DataFrame } from '@grafana/data';

/**
 * Compiles the panel markup with the current series as context. Helpers live on a fresh Handlebars
 * environment per call so that panels on the same dashboard can't see each other's data.
 */
export const compile = (html: string, series: DataFrame[]): string => {
  const env = Handlebars.create();
  env.registerHelper('last', () => {
    const values = series[0]?.fields[1]?.values;
    return values?.length ? values[values.length - 1] : '';
  });

  try {
    return env.compile(html)(series);
  } catch (ex) {
    return html;
  }
};
