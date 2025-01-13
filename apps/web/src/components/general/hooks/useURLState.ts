import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ParsedUrlQuery } from "querystring";

interface IURLObj {
    [p: string]: unknown;
}

type UseUrlStateReturn<T extends IURLObj | undefined> = [
    T,
    (values: T) => void,
];

export const parseParams = (query: ParsedUrlQuery) => {
    const result: any = {};
    // Loop through the URLSearchParams object and add each key/value
    for (const [key, value] of Object.entries(query)) {
        if (typeof value === "string") {
            const isPossibleArray = value.includes(",");
            if (isPossibleArray) {
                result[key] = value.split(",");
            } else {
                result[key] = value;
            }
        }
    }

    return result;
};

export function useURLState<T extends IURLObj | undefined>(
    defaultValue: T,
): UseUrlStateReturn<T> {
    const router = useRouter();
    const urlQuery = router.query;
    const [internalParams, setInternalParams] = useState<T>(defaultValue);
    const hasLoadedFirstParams = useRef(false);

    const setParams = useCallback(
        (values: T) => {
            const urlParams = new URLSearchParams();
            const valuesWithInternalParams: T = {
                ...internalParams,
                ...values,
            };
            for (const [k, v] of Object.entries(
                valuesWithInternalParams as IURLObj,
            )) {
                if (v == undefined) continue;
                urlParams.set(k, `${v}`);
            }
            setInternalParams(valuesWithInternalParams as T);

            router.replace({
                query: urlParams.toString(),
            });
        },
        [internalParams, router],
    );

    useEffect(() => {
        if (!router.isReady || hasLoadedFirstParams.current) {
            return;
        }
    }, [internalParams, router.isReady, setParams, urlQuery]);

    return [internalParams, setParams];
}
