// @ts-nocheck
/* eslint-disable no-param-reassign */
import { Document, Model, Query, Types } from "mongoose";

export interface QueryResult<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface PaginateOptions {
  sortBy?: string;
  populate?: string;
  limit?: number;
  page?: number;
  fuzzySearch?: string;
  // Add more options as needed
}

type PluginFunction = (query: Query<any, any>) => Query<any, any>;

function paginate<T extends Document>(schema: any) {
  schema.statics.paginate = async function (
    filter: Record<string, any>,
    options: PaginateOptions = {},
    plugin?: PluginFunction,
  ): Promise<QueryResult<T>> {
    let sort = "";
    if (options.sortBy) {
      const sortingCriteria: string[] = [];
      options.sortBy.split(",").forEach((sortOption) => {
        const [key, order] = sortOption.split(":");
        sortingCriteria.push((order === "desc" ? "-" : "") + key);
      });
      sort = sortingCriteria.join(" ");
    } else {
      sort = "createdAt";
    }

    const limit =
      options.limit && parseInt(String(options.limit), 10) > 0
        ? parseInt(String(options.limit), 10)
        : 10000;
    const page =
      options.page && parseInt(String(options.page), 10) > 0
        ? parseInt(String(options.page), 10)
        : 1;
    const skip = (page - 1) * limit;

    let results: any[] = [];
    let totalResults = 0;
    let totalPages = 0;

    if (options.fuzzySearch && options.fuzzySearch.search) {
      // Fuzzy search branch

      const fuzzyFields = options.fuzzySearch.fields;
      const mustClauses = Object.entries(filter).map(([key, value]) => {
        if (typeof value === "string" && value.match(/^[a-fA-F0-9]{24}$/)) {
          return { equals: { path: key, value: new Types.ObjectId(value) } };
        }
        return { equals: { path: key, value } };
      });
      const pipeline = [
        {
          $search: {
            index: options.fuzzySearch.index,
            compound: {
              must: mustClauses,
              should: [
                {
                  text: {
                    query: options.fuzzySearch.search,
                    path: fuzzyFields,
                    fuzzy: {},
                  },
                },
              ],
              minimumShouldMatch: 1,
            },
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $facet: {
            results: [],
            totalCount: [{ $count: "count" }],
          },
        },
      ];
      const aggResult = await this.aggregate(pipeline).exec();
      results = (aggResult[0]?.results || []).map((doc: any) => new this(doc));
      totalResults = aggResult[0]?.totalCount[0]?.count || 0;
      totalPages = Math.ceil(totalResults / limit);
    } else {
      // Regular find branch
      const countPromise = this.countDocuments(filter).exec();

      let docsPromise: any = this.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);
      if (options.populate) {
        options.populate.split(",").forEach((populateOption) => {
          docsPromise = docsPromise.populate(
            populateOption
              .split(".")
              .reverse()
              .reduce((a, b) => ({ path: b, populate: a })),
          );
        });
      }
      if (plugin) docsPromise = plugin(docsPromise);
      docsPromise = docsPromise.exec();
      const values = await Promise.all([countPromise, docsPromise]);
      totalResults = values[0];
      results = values[1];
      totalPages = Math.ceil(totalResults / limit);
    }

    // Populate and plugin for both branches (if not already applied)
    if (options.fuzzySearch && options.fuzzySearch.search) {
      if (options.populate) {
        results = await this.populate(
          results,
          options.populate.split(",").map((populateOption) =>
            populateOption
              .split(".")
              .reverse()
              .reduce((a, b) => ({ path: b, populate: a })),
          ),
        );
      }
      if (plugin) {
        // plugin expects a Query, so wrap results in a Query if needed
        // Not possible for array, so skip plugin for fuzzySearch unless you have a custom handler
      }
    }

    const result: QueryResult<T> = {
      results,
      page,
      limit,
      totalPages,
      totalResults,
    };
    return Promise.resolve(result);
  };
}

export default paginate;
