import type { ImporterWatchNotification } from '../models/ImporterWatchNotification';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class ImporterWatchService {
    /**
     * @param id
     * @returns ImporterWatchNotification
     * @throws ApiError
     */
    static importerWatchControllerFindNotificationV1(id: number): CancelablePromise<ImporterWatchNotification>;
}
//# sourceMappingURL=ImporterWatchService.d.ts.map