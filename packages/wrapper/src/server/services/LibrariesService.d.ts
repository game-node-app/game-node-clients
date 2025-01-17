import type { Library } from '../models/Library';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class LibrariesService {
    /**
     * @returns Library
     * @throws ApiError
     */
    static librariesControllerFindOwnV1(): CancelablePromise<Library>;
    /**
     * @param id
     * @returns Library
     * @throws ApiError
     */
    static librariesControllerFindOneByIdWithPermissionsV1(id: string): CancelablePromise<Library>;
}
//# sourceMappingURL=LibrariesService.d.ts.map