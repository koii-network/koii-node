import { useKplTokenMetadata } from './useKPLTokenMetadata';

type ParamsType = {
  tokenType: string;
};

export function useKplToken({ tokenType }: ParamsType) {
  const { data: kplToken, isLoading } = useKplTokenMetadata(tokenType, {
    enabled: !!tokenType,
  });
  return {
    kplToken,
    isLoading,
  };
}
