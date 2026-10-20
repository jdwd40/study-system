import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { RecoveryForm, RecoverySettings } from '../web/src/Recovery.js';

it('exposes recovery before authentication without relying on Command Tower', () => {
  const source = readFileSync(new URL('../web/src/pages/Login.tsx', import.meta.url), 'utf8');
  expect(source).toContain('<RecoveryForm');
  expect(source).toContain('Forgot password?');
});

it('renders authenticated rotation with password confirmation and explicit invalidation warning', () => {
  const html = renderToStaticMarkup(createElement(RecoverySettings));
  expect(html).toContain('Current password');
  expect(html).toContain('invalidate all previous recovery codes');
  expect(html).toContain('Generate new recovery codes');
  const source = readFileSync(new URL('../web/src/App.tsx', import.meta.url), 'utf8');
  expect(source.includes('path="/account" element={<RecoverySettings')).toBe(true);
});

it('keeps Account navigation available in desktop, collapsed sidebar and mobile shell', () => {
  for (const file of ['Sidebar', 'TopBar']) {
    const source = readFileSync(new URL(`../web/src/components/shell/${file}.tsx`, import.meta.url), 'utf8');
    expect(source).toContain('to="/account"');
    expect(source).toContain('aria-label="Account"');
  }
  const shell = readFileSync(new URL('../web/src/components/shell/AppShell.tsx', import.meta.url), 'utf8');
  expect(shell).toContain("title: 'Account'");
});

it('renders a recovery form with hidden code, bounded confirmed password and accessible feedback', () => {
  const html = renderToStaticMarkup(createElement(RecoveryForm));
  expect(html).toContain('Recovery code');
  expect(html).toContain('type="password"');
  expect(html).toContain('maxLength="32"');
  expect(html).toContain('minLength="12"');
  expect(html).toContain('Confirm new password');
  expect(html).toContain('Reset password');
});
