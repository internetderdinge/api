import mongoose from 'mongoose';
import type { FilterQuery } from 'mongoose';

const { ObjectId } = mongoose.Types;

interface FilterOptions {
  objectIds: string[];
  search: string[];
}

const filterOptions = (query: { search?: string }, filter: FilterQuery<any>, options: FilterOptions): FilterQuery<any> => {
  let filterAlt = filter;

  if (query.search && mongoose.isValidObjectId(query.search)) {
    const idList = options.objectIds.map((e) => ({
      [e]: new ObjectId(query.search),
    }));

    filterAlt = {
      $and: [filter, { $or: idList }],
    };
  } else if (query.search) {
    const regexp = new RegExp(query.search, 'i');

    const searchList = options.search.map((e) => ({
      [e]: { $regex: regexp },
    }));

    filterAlt = {
      $and: [filter, { $or: searchList }],
    };
  }

  return filterAlt;
};

export { filterOptions };
