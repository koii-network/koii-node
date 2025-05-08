import { useQuery } from 'react-query';

import GenericThumbnail from 'assets/svgs/generic-task-thumbnail.png';
import {
  QueryKeys,
  getTaskThumbnail,
  saveTaskThumbnail,
} from 'renderer/services';

interface Params {
  thumbnailUrl?: string;
}

export const useTaskThumbnail = ({ thumbnailUrl }: Params) => {
  const isValidImageFile = (url: string) =>
    /\.(jpg|jpeg|png|gif|bmp|svg)$/i.test(url);

  const fetchTaskThumbnail = async () => {
    if (thumbnailUrl && isValidImageFile(thumbnailUrl)) {
      const cachedThumbnail = await getTaskThumbnail(thumbnailUrl);
      if (cachedThumbnail) {
        return cachedThumbnail;
      } else {
        const image = new Image();
        image.src = thumbnailUrl;
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
        });
        try {
          await saveTaskThumbnail(thumbnailUrl);
        } catch (error) {
          console.error('Error fetching and saving image:', error);
        }
        return thumbnailUrl;
      }
    }
    return GenericThumbnail;
  };

  const {
    data: taskThumbnail,
    isLoading,
    error,
  } = useQuery([QueryKeys.TaskThumbnail, thumbnailUrl], fetchTaskThumbnail, {
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  return { taskThumbnail: taskThumbnail || GenericThumbnail, isLoading, error };
};
