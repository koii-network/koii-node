export async function isValidWalletAddress(address: string) {
  try {
    const value = await window.main.isValidWalletAddress({ address });
    return value;
  } catch (error) {
    return false;
  }
}
