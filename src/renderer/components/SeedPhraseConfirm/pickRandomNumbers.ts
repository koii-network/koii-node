export const pickRandomNumbers = (amount: number): number[] => {
  const nums = new Set<number>();
  while (nums.size !== amount) {
    nums.add(Math.floor(Math.random() * 100) % 12);
  }

  return [...nums];
};
