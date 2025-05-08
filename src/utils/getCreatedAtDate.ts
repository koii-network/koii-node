export const getCreatedAtDate = (createdAt?: number) => {
  if (createdAt) {
    const date = new Date(createdAt);

    const day = date.getDate().toString().padStart(2, '0');
    const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
      date
    );
    const year = date.getFullYear();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
  }

  return 'N/A';
};
