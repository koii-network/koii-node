import MarkdownPreview from '@uiw/react-markdown-preview';
import DOMPurify from 'dompurify';
import React from 'react';

import { openBrowserWindow } from 'renderer/services';

type PropsType = {
  description?: string;
  taskId: string;
};

const customComponents = {
  a: ({ children, ...props }: any) => {
    // Check if the children contain an <svg> element
    const containsSvg = React.Children.toArray(children).some(
      (child: any) => child?.type === 'svg'
    );

    // If the anchor contains an <svg>, remove the anchor
    if (containsSvg) {
      return null;
    }

    // Reject risky 'javascript:' links
    // eslint-disable-next-line no-script-url
    if (props.href.startsWith('javascript:')) {
      return null;
    }

    return (
      <button
        className="text-finnieTeal-100 hover:underline"
        onClick={() => openBrowserWindow(props.href)}
      >
        {children}
      </button>
    );
  },
};

export function TaskDescription({ description, taskId }: PropsType) {
  const formattedDescription =
    description?.replace(/\\n/g, '\n').replace(/"taskId"/g, taskId) || '';
  const sanitizedDescription = DOMPurify.sanitize(formattedDescription || '', {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['svg'],
  });

  return (
    <div className="text-start">
      <div className="mb-4 text-sm font-light select-text">
        <MarkdownPreview
          source={sanitizedDescription}
          style={{ padding: 16, background: 'transparent', cursor: 'default' }}
          components={customComponents}
          wrapperElement={{
            'data-color-mode': 'dark',
          }}
        />
      </div>
    </div>
  );
}
