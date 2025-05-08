export const fetchWithTimeout = (
  url: string,
  timeout = 30000
): Promise<Response> => {
  const controller = new AbortController();

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      controller?.abort();
      reject(new Error('Request timed out'));
    }, timeout);

    fetch(url, { signal: controller.signal })
      .then((response) => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          reject(new Error('Request was aborted'));
        } else {
          reject(error);
        }
      });
  });
};
