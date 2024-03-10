export interface GroupedData<T> {
  id: string;
  data: T[];
}
export type AccGroupData<T> = {
  [x: string]: GroupedData<T>;
};

export const groupDataBy = <T>(
  data: T[],
  keyExtractor: (item: T) => string,
) => {
  const grouped = data.reduce(
    (acc: AccGroupData<T>, item: T): AccGroupData<T> => {
      const groupKey = keyExtractor(item);

      const dataGroup: T[] = groupKey in acc ? acc[groupKey].data : [];

      dataGroup.push(item);
      acc[groupKey] = {
        id: groupKey,
        data: dataGroup,
      };

      return acc;
    },
    {},
  );

  return Object.values(grouped);
};
