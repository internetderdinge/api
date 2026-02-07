/* eslint-disable no-param-reassign */
import mongoose from 'mongoose';
import type { Schema, Document, Model, PipelineStage } from 'mongoose';
import type { PaginateOptions, QueryResult } from './types';

const paginate = (schema: Schema): void => {
  /**
   * Query for documents with pagination
   * @param {Object} [filter] - Mongo filter
   * @param {PaginateOptions} [options] - Query options
   * @returns {Promise<QueryResult>}
   */
  schema.statics.paginate = async function (
    filter: Record<string, any> = {},
    options: PaginateOptions = {},
    plugin?: any,
  ): Promise<QueryResult> {
    // Parse sorting options
    const sort = options.sortBy
      ? options.sortBy.split(',').reduce((acc: Record<string, number>, sortOption: string) => {
          const [key, order] = sortOption.split(':');
          acc[key] = order === 'desc' ? -1 : 1;
          return acc;
        }, {})
      : { createdAt: -1 };

    const limit =
      options.limit && parseInt(options.limit.toString(), 10) > 0 ? parseInt(options.limit.toString(), 10) : 10000;
    const page = options.page && parseInt(options.page.toString(), 10) > 0 ? parseInt(options.page.toString(), 10) : 1;
    const skip = (page - 1) * limit;

    // Build aggregation pipeline
    const pipeline: PipelineStage[] = [];

    let mainMatch: Record<string, any> = {};
    let virtualMatch: Record<string, any> = {};
    let hasVirtualFields = false;

    // Helper function to determine if a path is a virtual field
    const isVirtualField = (path: string): boolean => {
      const rootPath = path.split('.')[0];
      return !!schema.virtuals[rootPath];
    };

    // Separate filter into main collection fields and virtual fields
    if (filter) {
      const separateFilter = (filterObj: Record<string, any>) => {
        const main: Record<string, any> = {};
        const virtual: Record<string, any> = {};

        for (const key in filterObj) {
          if (filterObj.hasOwnProperty(key)) {
            if (key === '$or' || key === '$and') {
              const mainArray: Record<string, any>[] = [];
              const virtualArray: Record<string, any>[] = [];

              filterObj[key].forEach((item: Record<string, any>) => {
                const { main: itemMain, virtual: itemVirtual } = separateFilter(item);
                if (Object.keys(itemMain).length > 0) mainArray.push(itemMain);
                if (Object.keys(itemVirtual).length > 0) virtualArray.push(itemVirtual);
              });

              if (mainArray.length > 0) main[key] = mainArray;
              if (virtualArray.length > 0) virtual[key] = virtualArray;
            } else {
              if (isVirtualField(key)) {
                virtual[key] = filterObj[key];
                hasVirtualFields = true;
              } else {
                main[key] = filterObj[key];
              }
            }
          }
        }
        return { main, virtual };
      };

      const { main, virtual } = separateFilter(filter);
      mainMatch = main;
      virtualMatch = virtual;
    }

    // Add main collection $match stage
    if (Object.keys(mainMatch).length > 0) {
      pipeline.push({ $match: mainMatch });
    }

    // Handle virtual fields population
    if (options.populate) {
      options.populate.split(',').forEach((populateOption: string) => {
        const paths = populateOption.split('.');
        const localField = paths[0];
        const virtual = schema.virtuals[localField];
        if (!virtual) {
          throw new Error(`Cannot populate unknown field: ${localField}`);
        }
        const refModel = virtual.options.ref;
        const localFieldOption = virtual.options.localField;
        const foreignFieldOption = virtual.options.foreignField;
        const asField = localField;

        const lookupStage: PipelineStage.Lookup = {
          $lookup: {
            from: mongoose.model(refModel).collection.name,
            localField: localFieldOption,
            foreignField: foreignFieldOption,
            as: asField,
          },
        };

        pipeline.push(lookupStage);

        if (virtual.options.justOne) {
          pipeline.push({
            $unwind: {
              path: `$${asField}`,
              preserveNullAndEmptyArrays: true,
            },
          });
        }

        // Add $addFields stage to rename nested _id to id in populated documents
        pipeline.push({
          $addFields: {
            [`${asField}.id`]: `$${asField}._id`,
          },
        });
        pipeline.push({
          $project: {
            [`${asField}._id`]: 0,
          },
        });
      });
    }

    // Add virtual fields $match stage
    if (hasVirtualFields && Object.keys(virtualMatch).length > 0) {
      pipeline.push({ $match: virtualMatch });
    }

    // Handle fuzzy search (if applicable)
    if (this.fuzzySearch && options.fuzzySearch) {
      throw new Error('Fuzzy search is not supported with aggregation in this paginate function.');
    }

    // Add sorting, skipping, and limiting stages
    pipeline.push({ $sort: sort });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Rename root _id to id
    pipeline.push({
      $addFields: {
        id: '$_id',
      },
    });
    pipeline.push({
      $project: {
        _id: 0,
      },
    });

    // Use $facet to get both the results and the total count
    const facetPipeline: PipelineStage[] = [
      {
        $facet: {
          metadata: [
            {
              $count: 'totalResults',
            },
          ],
          data: pipeline,
        },
      },
      {
        $addFields: {
          totalResults: { $arrayElemAt: ['$metadata.totalResults', 0] },
        },
      },
    ];

    // Execute the aggregation pipeline
    const aggResult = await this.aggregate(facetPipeline).exec();

    // Extract results and total count
    let totalResults = 0;
    let results: any[] = [];

    if (aggResult && aggResult.length > 0) {
      totalResults = aggResult[0].totalResults || 0;
      results = aggResult[0].data || [];
    }

    const totalPages = Math.ceil(totalResults / limit) || 1;

    return {
      results,
      page,
      limit,
      totalPages,
      totalResults,
    };
  };
};

export default paginate;
