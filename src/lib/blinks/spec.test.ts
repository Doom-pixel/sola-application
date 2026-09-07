import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  findRequestedAction,
  getLinkedActions,
  isBlinkMetadata,
  sanitizeHttpUrl,
} from './spec.ts';

describe('getLinkedActions', () => {
  it('falls back to the root label and original URL', () => {
    const actions = getLinkedActions(
      { title: 'Donate', label: 'Donate SOL' },
      'https://actions.alice.com/donate'
    );
    assert.equal(actions.length, 1);
    assert.equal(actions[0].label, 'Donate SOL');
    assert.equal(actions[0].href, 'https://actions.alice.com/donate');
    assert.equal(actions[0].type, 'transaction');
  });
});

describe('findRequestedAction', () => {
  const actions = [
    { label: 'Vote Yes', href: '/yes', type: 'transaction' as const },
    { label: 'Vote No', href: '/no', type: 'transaction' as const },
  ];

  it('matches labels case-insensitively', () => {
    assert.equal(findRequestedAction(actions, 'vote no')?.href, '/no');
  });

  it('falls back to the first action', () => {
    assert.equal(findRequestedAction(actions)?.label, 'Vote Yes');
  });

  it('does not throw when an action is missing a label', () => {
    const unlabeled = [
      { href: '/yes', type: 'transaction' as const, label: undefined },
      { label: 'Vote No', href: '/no', type: 'transaction' as const },
    ] as Parameters<typeof findRequestedAction>[0];

    assert.equal(findRequestedAction(unlabeled, 'vote no')?.href, '/no');
    assert.equal(findRequestedAction(unlabeled, 'missing')?.href, '/yes');
  });
});

describe('sanitizeHttpUrl', () => {
  it('allows http(s) and rejects javascript URLs', () => {
    assert.ok(sanitizeHttpUrl('https://cdn.example/icon.png'));
    assert.equal(sanitizeHttpUrl('javascript:alert(1)'), null);
    assert.equal(sanitizeHttpUrl('data:text/html,hi'), null);
  });
});

describe('isBlinkMetadata', () => {
  it('accepts Action GET payloads and rejects html-like objects', () => {
    assert.equal(
      isBlinkMetadata({
        title: 'Double or Nothing!',
        links: { actions: [{ label: 'Flip', href: '/flip' }] },
      }),
      true
    );
    assert.equal(isBlinkMetadata({ foo: 'bar' }), false);
  });
});
