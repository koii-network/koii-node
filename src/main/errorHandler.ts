export default (fn: any, errorTag: string) =>
  (...args: any[]) => {
    try {
      return fn(...args);
    } catch (err: any) {
      throw new Error(`${errorTag}: ${err.message}`);
    }
  };
