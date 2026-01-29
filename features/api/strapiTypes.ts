export type StrapiEntity<TAttributes> = {
  id: number;
  documentId?: string;
  attributes: TAttributes;
};

export type StrapiCollectionResponse<T> = {
  data: T[];
  meta?: unknown;
};

export type StrapiSingleResponse<T> = {
  data: T;
  meta?: unknown;
};

export type ApiErrorPayload = {
  message: string;
  details?: unknown;
};
