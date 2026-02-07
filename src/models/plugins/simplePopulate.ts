function simplePopulate(populate: string): Record<string, any> {
  let docsPromise: Record<string, any> = {};
  populate.split(',').forEach((populateOption) => {
    docsPromise = populateOption
      .split('.')
      .reverse()
      .reduce((a, b) => ({ path: b, populate: a }));
  });
  return docsPromise;
}

export default simplePopulate;
