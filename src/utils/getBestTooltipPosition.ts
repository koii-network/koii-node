export const getBestTooltipPosition = (
  targetElement: Element | null,
  container: Element | null
) => {
  const elementRect = targetElement?.getBoundingClientRect();
  const elementTop = elementRect?.top || 0;
  const elementBottom = elementRect?.bottom || 0;
  const containerRect = container?.getBoundingClientRect();
  const containerTop = containerRect?.top || 0;
  const containerHeight = container?.clientHeight || 0;
  const tooltipHeight = 290;

  const availableTopSpace = elementTop - containerTop;
  const availableBottomSpace = containerHeight - (containerTop + elementBottom);

  if (availableBottomSpace > tooltipHeight) {
    return 'bottom';
  } else if (availableTopSpace > tooltipHeight) {
    return 'top';
  }

  return 'bottom';
};
