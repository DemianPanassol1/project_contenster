export interface ApiError {
  code: string;
  field?: string;
  message: string;
}

export interface ApiResponse<TBody = unknown> {
  body: TBody | null;
  datetime: string;
  errors: {
    count: number;
    items: ApiError[];
  };
  lang: string;
  requestId: string;
  requestTime: string;
  status: string;
  statusCode: number;
}
