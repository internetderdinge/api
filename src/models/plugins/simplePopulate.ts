export function simplePopulate(populate: string): Record<string, any> {
  let docsPromise: Record<string, any> = {};
  populate.split(",").forEach((populateOption) => {
    docsPromise = populateOption
      .split(".")
      .reverse()
      .reduce<Record<string, any>>((acc, key) => {
        if (Object.keys(acc).length === 0) {
          return { path: key };
        }
        return { path: key, populate: acc };
      }, {});
  });
  return docsPromise;
}

export default simplePopulate;
