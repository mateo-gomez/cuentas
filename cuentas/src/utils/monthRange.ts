export const monthRange = (year: number, month: number) => {
  const start = new Date(year, month, 1);
  const end = new Date(start);

  end.setMonth(end.getMonth() + 1);
  end.setMilliseconds(-1);

  return { start, end };
};
