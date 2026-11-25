import { ApiError } from "@repo/wrapper/server";

interface BatchLoaderOptions<Id, Item, Params> {
  /** Reads several items in one request. Missing items may be left out. */
  fetchMany: (ids: Id[], params: Params) => Promise<Item[]>;
  /** Reads one item; also used when a batch request is rejected as invalid. */
  fetchOne: (id: Id, params: Params) => Promise<Item>;
  /**
   * Result for an id the batch did not return. Defaults to `fetchOne`, so a
   * missing or hidden item keeps the single read's error (404, 403...).
   * Endpoints that answer "nothing" instead of an error resolve it directly.
   */
  resolveMissing?: (id: Id, params: Params) => Item | Promise<Item>;
  getId: (item: Item) => Id;
  /** Largest number of ids sent in one batch request. */
  maxBatchSize?: number;
}

const FALLBACK_STATUSES = new Set([400, 404, 422]);

interface Waiter<Item> {
  resolve: (item: Item) => void;
  reject: (error: unknown) => void;
}

interface PendingGroup<Id, Item, Params> {
  params: Params;
  waiters: Map<Id, Waiter<Item>[]>;
}

/**
 * Coalesces single-item reads issued in the same tick (a list of cards each
 * calling `useGame`/`useReview`) into one batch request per identical
 * `params`, instead of one request per card.
 *
 * Results match the single read: a lone id still uses `fetchOne`, ids the
 * batch does not return go through `resolveMissing`, and a batch rejected as
 * invalid or not found (400, 404, 422) is read again id by id, so callers keep
 * the single read's exact errors.
 */
export function createBatchLoader<Id extends string | number, Item, Params>({
  fetchMany,
  fetchOne,
  resolveMissing = fetchOne,
  getId,
  maxBatchSize = 100,
}: BatchLoaderOptions<Id, Item, Params>) {
  const pending = new Map<string, PendingGroup<Id, Item, Params>>();
  let scheduled = false;

  const settle = (
    waiters: Waiter<Item>[],
    read: () => Item | Promise<Item>,
  ) => {
    new Promise<Item>((resolve) => resolve(read())).then(
      (value) => waiters.forEach((waiter) => waiter.resolve(value)),
      (error) => waiters.forEach((waiter) => waiter.reject(error)),
    );
  };

  const runBatch = async (params: Params, batch: [Id, Waiter<Item>[]][]) => {
    if (batch.length === 1) {
      const [[id, waiters]] = batch;
      settle(waiters, () => fetchOne(id, params));
      return;
    }
    let items: Item[];
    try {
      items = await fetchMany(
        batch.map(([id]) => id),
        params,
      );
    } catch (error) {
      // A single bad id fails the whole batch's validation (400/422), and a
      // batch endpoint may answer 404 for "none found": read each id alone so
      // only that one fails. Auth, rate-limit, network and 5xx errors would hit
      // every single read too, so they reject the batch instead of
      // multiplying requests.
      if (error instanceof ApiError && FALLBACK_STATUSES.has(error.status)) {
        for (const [id, waiters] of batch) {
          settle(waiters, () => fetchOne(id, params));
        }
      } else {
        batch.forEach(([, waiters]) =>
          waiters.forEach((waiter) => waiter.reject(error)),
        );
      }
      return;
    }
    const byId = new Map(items.map((item) => [getId(item), item]));
    for (const [id, waiters] of batch) {
      settle(waiters, () =>
        byId.has(id) ? byId.get(id)! : resolveMissing(id, params),
      );
    }
  };

  const flush = () => {
    scheduled = false;
    const groups = [...pending.values()];
    pending.clear();
    for (const { params, waiters } of groups) {
      const entries = [...waiters.entries()];
      for (let i = 0; i < entries.length; i += maxBatchSize) {
        void runBatch(params, entries.slice(i, i + maxBatchSize));
      }
    }
  };

  return (id: Id, params: Params): Promise<Item> =>
    new Promise<Item>((resolve, reject) => {
      const groupKey = JSON.stringify(params ?? null);
      let group = pending.get(groupKey);
      if (!group) {
        group = { params, waiters: new Map() };
        pending.set(groupKey, group);
      }
      const waiters = group.waiters.get(id) ?? [];
      waiters.push({ resolve, reject });
      group.waiters.set(id, waiters);
      if (!scheduled) {
        scheduled = true;
        // A macrotask, so every query a render commit starts joins the batch.
        setTimeout(flush, 0);
      }
    });
}
