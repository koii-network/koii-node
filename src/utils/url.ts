export const formatUrl = (url: string) => {
  const formattedUrl = url.includes('http') ? url : `https://${url}`;
  return formattedUrl;
};

export const isValidUrl = (url: string) => {
  try {
    new URL(url);
  } catch (_) {
    return false;
  }
  return true;
};
