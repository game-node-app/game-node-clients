import {
  InfiniteData,
  UseInfiniteQueryResult,
  UseQueryResult,
} from "@tanstack/react-query";
import { ApiError } from "@repo/wrapper/server";

export type ExtendedUseQueryResult<TData, TError = ApiError> = {
  queryKey: unknown[];
  invalidate: () => void;
} & UseQueryResult<TData, TError extends ApiError ? ApiError : unknown>;

export type ExtendedUseInfiniteQueryResult<TData, TError = ApiError> = {
  queryKey: unknown[];
  invalidate: () => void;
} & UseInfiniteQueryResult<
  InfiniteData<TData>,
  TError extends ApiError ? ApiError : unknown
>;
