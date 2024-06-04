const monthes = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
];

const addLeadingZero = (time: number) => {
  return time < 10 ? `0${time}` : time;
};

export const getFormatedDate = (date: Date) => {
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${day} ${monthes[monthIndex]} ${addLeadingZero(hours)}:${addLeadingZero(minutes)}`;
};
