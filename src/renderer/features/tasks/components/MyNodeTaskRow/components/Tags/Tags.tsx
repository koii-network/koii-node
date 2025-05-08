import React from 'react';

import { LoadingSpinner } from 'renderer/components';
import { Popover } from 'renderer/components/ui/Popover/Popover';
import { useWindowSize } from 'renderer/features/common/hooks/useWindowSize';
import { Theme } from 'renderer/types/common';

interface Props {
  isLoadingTags: boolean;
  tags: string[];
  isPrivate: boolean;
}

interface Tag {
  name: string;
  description: string;
}

const TAGS: Record<string, Tag> = {
  AI: {
    name: 'AI',
    description:
      'Explore artificial intelligence and machine learning capabilities.',
  },
  SOCIAL_POSTING: {
    name: 'Social Posting',
    description: 'Easily post content across various social media platforms.',
  },
  DATA_GATHERING: {
    name: 'Data Gathering',
    description:
      'Collect and aggregate data from multiple sources effortlessly.',
  },
  HOSTING: {
    name: 'Hosting',
    description:
      'Provide reliable web hosting services for applications and websites.',
  },
  STORAGE: {
    name: 'Storage',
    description:
      'Offer secure data storage solutions for users and applications.',
  },
  BANDWIDTH: {
    name: 'Bandwidth',
    description:
      'Utilize network bandwidth for efficient data transfer and processing.',
  },
  DATABASE: {
    name: 'Database',
    description:
      'Manage and interact with databases for seamless data retrieval.',
  },
  WITNESS: {
    name: 'Witness',
    description:
      'Verify transactions to ensure their integrity on the network.',
  },
  DEFI: {
    name: 'DeFi',
    description: 'Engage with decentralized finance applications and services.',
  },
  WEB_CRAWLING: {
    name: 'Web Crawling',
    description:
      'Automate data extraction from websites for insightful analysis.',
  },
  ORCA_TASK: {
    name: 'ORCA',
    description:
      'Use ORCA to earn extra rewards with AI tasks, right from your computer! Orca tasks run in a sandbox that keeps them separate from your computer, making them more secure.',
  },
};

export function Tags({ isLoadingTags, tags, isPrivate }: Props) {
  const formattedTags = tags.map((tag) => {
    if (TAGS[tag]) {
      return TAGS[tag];
    }

    const matchedTag = Object.values(TAGS).find(
      (t) => t.name.toLowerCase() === tag.toLowerCase()
    );

    return matchedTag || { name: tag, description: '' };
  });

  // Sort tags to put ORCA_TASK first
  formattedTags.sort((a, b) => {
    if (a.name === 'Orca') return -1;
    if (b.name === 'Orca') return 1;
    return 0;
  });

  const { width } = useWindowSize();

  const maxChars =
    width && width > 2000
      ? 55
      : width && width > 1600
      ? 30
      : width && width > 1500
      ? 25
      : width && width > 1400
      ? 23
      : 18;

  const paddingPerTag = 3;
  let totalChars = 0;
  const visibleTags = [];

  for (const { name, description } of formattedTags) {
    const tagLength = name.length + paddingPerTag;
    if (totalChars + tagLength <= maxChars) {
      visibleTags.push({ name, description });
      totalChars += tagLength;
    } else {
      break;
    }
  }

  const hiddenTagCount =
    formattedTags.length > visibleTags.length
      ? formattedTags.length - visibleTags.length
      : 0;

  return (
    <div className="min-w-[85px] flex flex-col gap-2 my-auto cursor-default">
      <div className="flex mx-auto gap-1">
        {isLoadingTags ? (
          <div className="mx-auto">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {visibleTags.map(({ name, description }) => (
              <Popover
                key={name}
                tooltipContent={description}
                theme={Theme.Dark}
                isHidden={!description}
              >
                <div
                  className="text-xs rounded bg-purple-5 text-white py-1 px-1.5 mx-auto"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {name}
                </div>
              </Popover>
            ))}
            {hiddenTagCount > 0 && (
              <Popover
                theme={Theme.Dark}
                isHidden={hiddenTagCount === 0}
                tooltipContent={
                  <div className="flex gap-1">
                    {formattedTags.map(({ name }) => (
                      <div
                        key={name}
                        className="text-xs rounded text-white py-1 px-1.5 cursor-pointer"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                }
              >
                <div className="text-xs rounded bg-purple-5 text-white py-1 px-1.5">
                  +{hiddenTagCount}
                </div>
              </Popover>
            )}
          </>
        )}
      </div>
      <Popover
        theme={Theme.Dark}
        tooltipContent={
          isPrivate
            ? 'This task has not been verified by the Koii team. Run with caution.'
            : 'The Koii team has verified this task and it is safe to run.'
        }
      >
        <div
          className={`text-xs rounded py-1 px-1.5 w-fit mx-auto ${
            isPrivate ? 'text-finnieRed' : ' text-finnieEmerald-light'
          }`}
        >
          {isPrivate ? 'Not Verified' : 'Verified'}
        </div>
      </Popover>
    </div>
  );
}
