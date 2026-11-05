import { serialize } from 'v8';
import { FieldType, toDataFrame } from '@grafana/data';
import { buildSrcDoc, toPlainSeries } from './srcdoc';

const theme = { isDark: true, textColor: '#ccc', fontFamily: 'Inter', fontSize: '14px' };

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

const series = [
  toDataFrame({
    name: 'A',
    fields: [
      { name: 'time', type: FieldType.time, values: [1, 2, 3] },
      { name: 'value', type: FieldType.number, values: [10, 20, 30] },
    ],
  }),
];

describe('buildSrcDoc', () => {
  it('puts the bridge script first in head, before any user script', () => {
    const doc = parse(
      buildSrcDoc('<html><head><script src="https://cdn.example/lib.js"></script></head><body></body></html>', [], theme)
    );
    const scripts = doc.head.querySelectorAll('script');
    expect(scripts[0].textContent).toContain("addEventListener('message'");
    expect(scripts[1].getAttribute('src')).toBe('https://cdn.example/lib.js');
  });

  it('applies the theme to the body', () => {
    const doc = parse(buildSrcDoc('<div>hi</div>', [], theme));
    expect(doc.head.querySelector('style')?.textContent).toContain('color: #ccc');
  });

  it.each([
    ['oninit', 'function onDivPanelInit(elem)'],
    ['onData', 'function onDivPanelDataUpdate(data, elem)'],
    ['onentereditmode', 'function onDivPanelEnterEditMode(elem, content)'],
    ['onexiteditmode', 'function onDivPanelExitEditMode(elem)'],
  ])('expands run="%s" into the hook', (run, signature) => {
    const doc = parse(buildSrcDoc(`<body><script run="${run}">doThing();</script></body>`, [], theme));
    const script = doc.body.querySelector('script')!;
    expect(script.textContent).toContain(signature);
    expect(script.textContent).toContain('doThing();');
    expect(script.hasAttribute('run')).toBe(false);
  });

  it('leaves module scripts alone', () => {
    const doc = parse(buildSrcDoc('<body><script type="module" run="ondata">import x from "y";</script></body>', [], theme));
    expect(doc.body.querySelector('script')!.textContent).toBe('import x from "y";');
  });

  it('compiles Handlebars in markup but not in scripts', () => {
    const doc = parse(
      buildSrcDoc('<body><p>{{last}}</p><script>const t = "{{not a template}}";</script><p>{{0.name}}</p></body>', series, theme)
    );
    const paragraphs = doc.body.querySelectorAll('p');
    expect(paragraphs[0].textContent).toBe('30');
    expect(paragraphs[1].textContent).toBe('A');
    expect(doc.body.querySelector('script')!.textContent).toBe('const t = "{{not a template}}";');
  });

  it('keeps scripts in their original order relative to markup', () => {
    const doc = parse(buildSrcDoc('<body><div id="a"></div><script>1</script><div id="b"></div><script>2</script></body>', [], theme));
    expect(Array.from(doc.body.children).map((e) => e.id || e.textContent)).toEqual(['a', '1', 'b', '2']);
  });

  it('renders {{last}} as empty when there is no data', () => {
    const doc = parse(buildSrcDoc('<body><p>{{last}}</p></body>', [], theme));
    expect(doc.body.querySelector('p')!.textContent).toBe('');
  });
});

describe('toPlainSeries', () => {
  it('produces something structured clone can copy', () => {
    const frame = series[0];
    frame.fields[1].display = () => ({ text: 'x', numeric: 1 });
    const plain = toPlainSeries(series);
    // jsdom has no structuredClone; v8.serialize uses the same algorithm and throws on functions.
    expect(() => serialize(series)).toThrow();
    expect(() => serialize(plain)).not.toThrow();
    expect(plain[0].fields[1].values).toEqual([10, 20, 30]);
    expect(plain[0].fields[1]).not.toHaveProperty('display');
  });
});
