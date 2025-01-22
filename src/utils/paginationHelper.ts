import { Request, Response } from 'express';
import { FilterQuery, Model, SortOrder } from 'mongoose';
import { z } from 'zod';

interface BaseDocument {
  name: string;
  subject: string;
}

export interface SortCriteria {
  [key: string]: SortOrder;
}

export interface PaginationResult<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    filters: {
      subject?: string;
      searchTerm?: string;
    };
    sorting: {
      sortBy: string;
      sortOrder: string;
    };
  };
}

export const QuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(10),
  searchTerm: z.string().optional(),
  subject: z.string().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const getPaginatedItems = <T extends BaseDocument>(model: Model<T>,selectedFields:string) => {
  return async (req: Request, res: Response): Promise<Response> => {
    const validatedQuery = QuerySchema.parse(req.query);
    const { page, limit, searchTerm, subject, sortBy, sortOrder } = validatedQuery;

    const skipDocuments = (page - 1) * limit;
    const filterCriteria: FilterQuery<T> = {};

    if (searchTerm) {
      filterCriteria['name'] = { $regex: searchTerm, $options: 'i' };
    }

    if (subject && subject !== 'all') {
      filterCriteria['subject'] = subject;
    }

    const sortCriteria: SortCriteria = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const items = await model
      .find(filterCriteria)
      .select(selectedFields)
      .sort(sortCriteria)
      .skip(skipDocuments)
      .limit(limit);

    const totalItems = await model.countDocuments(filterCriteria);
    const totalPages = Math.ceil(totalItems / limit);

    const response: PaginationResult<T> = {
      success: true,
      data: {
        items,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        filters: {
          subject,
          searchTerm,
        },
        sorting: {
          sortBy,
          sortOrder,
        },
      },
    };

    return res.json(response);
  };
};
