import {
    UseInfiniteQueryResult,
    UseQueryResult,
    InfiniteData,
} from "@tanstack/react-query";
import { ApiError } from "@/wrapper/server";

export type ExtendedUseQueryResult<TData, TError = ApiError> = {
    queryKey: any[];
    invalidate: () => void;
} & UseQueryResult<TData, TError extends ApiError ? ApiError : unknown>;

export type ExtendedUseInfiniteQueryResult<TData, TError = ApiError> = {
    queryKey: any[];
    invalidate: () => void;
} & UseInfiniteQueryResult<
    InfiniteData<TData>,
    TError extends ApiError ? ApiError : unknown
>;
