import { examples } from './examples';
import { buildSrcDoc } from './sandbox/srcdoc';
import { defaultContent } from './types';

describe('examples', () => {
  it('starts with the default template', () => {
    expect(examples[0].content).toBe(defaultContent);
  });

  it.each(examples.map((e) => [e.label, e]))('%s is a document the panel can load', (_label, example) => {
    expect(example.content).toMatch(/<html[\s>]/i);
    expect(example.description).not.toBe('');
    const doc = new DOMParser().parseFromString(
      buildSrcDoc(example.content, [], { isDark: true, textColor: '#ccc', fontFamily: 'Inter', fontSize: '14px' }),
      'text/html'
    );
    expect(doc.body.querySelectorAll('script').length).toBeGreaterThan(0);
  });

  it('has unique labels', () => {
    expect(new Set(examples.map((e) => e.label)).size).toBe(examples.length);
  });
});
