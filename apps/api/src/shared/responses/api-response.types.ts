export interface ApiError {
  code: string;
  field?: string;
  message: string;
}

export interface ApiResponse<TData = unknown> {
  body: TData | null;
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
