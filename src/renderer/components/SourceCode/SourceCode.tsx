import React, { memo } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';

import codeTheme from './codeTheme';

type PropsType = {
  sourceCode: string;
};
function SourceCode({ sourceCode }: PropsType) {
  return (
    <SyntaxHighlighter
      showLineNumbers
      language="javascript"
      style={codeTheme}
      customStyle={{ fontSize: '12px' }}
      lineNumberStyle={{ fontSize: '12px', color: '#D6D6D6' }}
    >
      {sourceCode}
    </SyntaxHighlighter>
  );
}

export default memo(SourceCode);
