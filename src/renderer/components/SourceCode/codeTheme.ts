import { CSSProperties } from 'react';

const css: Record<string, CSSProperties> = {
  'code[class*="language-"]': {
    color: '#9BE7C4',
    textShadow: '0 1px rgba(0, 0, 0, 0.3)',
    fontFamily: "'Roboto', 'Open Sans', 'ui-sans-serif', 'system-ui'",
    direction: 'ltr',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    lineHeight: '16px',
    MozTabSize: '4',
    OTabSize: '4',
    tabSize: '4',
    WebkitHyphens: 'none',
    MozHyphens: 'none',
    msHyphens: 'none',
    hyphens: 'none',
  },
  'pre[class*="language-"]': {
    color: '#9BE7C4',
    textShadow: '0 1px rgba(0, 0, 0, 0.3)',
    fontFamily: "'Roboto', 'Open Sans', 'ui-sans-serif', 'system-ui'",
    direction: 'ltr',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    lineHeight: '1.5',
    MozTabSize: '4',
    OTabSize: '4',
    tabSize: '4',
    WebkitHyphens: 'none',
    MozHyphens: 'none',
    msHyphens: 'none',
    hyphens: 'none',
    padding: '1em',
    margin: '.5em 0',
    overflow: 'auto',
    borderRadius: '0.3em',
    background: 'transparent',
  },
  ':not(pre) > code[class*="language-"]': {
    background: 'transparent',
    padding: '.1em',
    borderRadius: '.3em',
  },
  comment: {
    color: '#9BE7C4',
  },
  prolog: {
    color: '#9BE7C4',
  },
  doctype: {
    color: '#9BE7C4',
  },
  cdata: {
    color: '#9BE7C4',
  },
  punctuation: {
    color: '#9BE7C4',
  },
  '.namespace': {
    opacity: '.7',
  },
  property: {
    color: '#9BE7C4',
  },
  keyword: {
    color: '#9BE7C4',
  },
  tag: {
    color: '#9BE7C4',
  },
  'class-name': {
    color: '#9BE7C4',
    textDecoration: 'underline',
  },
  boolean: {
    color: '#9BE7C4',
  },
  constant: {
    color: '#9BE7C4',
  },
  symbol: {
    color: '#9BE7C4',
  },
  deleted: {
    color: '#9BE7C4',
  },
  number: {
    color: '#9BE7C4',
  },
  selector: {
    color: '#9BE7C4',
  },
  'attr-name': {
    color: '#9BE7C4',
  },
  string: {
    color: '#9BE7C4',
  },
  char: {
    color: '#9BE7C4',
  },
  builtin: {
    color: '#9BE7C4',
  },
  inserted: {
    color: '#9BE7C4',
  },
  variable: {
    color: '#9BE7C4',
  },
  operator: {
    color: '#9BE7C4',
  },
  entity: {
    color: '#9BE7C4',
    cursor: 'help',
  },
  url: {
    color: '#9BE7C4',
  },
  '.language-css .token.string': {
    color: '#9BE7C4',
  },
  '.style .token.string': {
    color: '#9BE7C4',
  },
  atrule: {
    color: '#9BE7C4',
  },
  'attr-value': {
    color: '#9BE7C4',
  },
  function: {
    color: '#9BE7C4',
  },
  regex: {
    color: '#9BE7C4',
  },
  important: {
    color: '#9BE7C4',
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
};

export default css;
