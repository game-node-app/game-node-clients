/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AcceptGuildContractDto } from '../models/AcceptGuildContractDto';
import type { AcceptGuildContractResponseDto } from '../models/AcceptGuildContractResponseDto';
import type { AdvanceGuildChainDto } from '../models/AdvanceGuildChainDto';
import type { ClaimGuildBountyResponseDto } from '../models/ClaimGuildBountyResponseDto';
import type { ClaimGuildContractResponseDto } from '../models/ClaimGuildContractResponseDto';
import type { ClaimGuildPassportMilestoneResponseDto } from '../models/ClaimGuildPassportMilestoneResponseDto';
import type { ExtendGuildContractResponseDto } from '../models/ExtendGuildContractResponseDto';
import type { GuildAccessResponseDto } from '../models/GuildAccessResponseDto';
import type { GuildBoardResponseDto } from '../models/GuildBoardResponseDto';
import type { GuildBoardSeenResponseDto } from '../models/GuildBoardSeenResponseDto';
import type { GuildBountiesResponseDto } from '../models/GuildBountiesResponseDto';
import type { GuildChainActionResponseDto } from '../models/GuildChainActionResponseDto';
import type { GuildChainsResponseDto } from '../models/GuildChainsResponseDto';
import type { GuildContractDto } from '../models/GuildContractDto';
import type { GuildContractsListResponseDto } from '../models/GuildContractsListResponseDto';
import type { GuildCosmeticsResponseDto } from '../models/GuildCosmeticsResponseDto';
import type { GuildEmporiumPurchaseResponseDto } from '../models/GuildEmporiumPurchaseResponseDto';
import type { GuildEmporiumResponseDto } from '../models/GuildEmporiumResponseDto';
import type { GuildExtraSlotPermitStatusDto } from '../models/GuildExtraSlotPermitStatusDto';
import type { GuildOverviewResponseDto } from '../models/GuildOverviewResponseDto';
import type { GuildPassportResponseDto } from '../models/GuildPassportResponseDto';
import type { GuildRewardsResponseDto } from '../models/GuildRewardsResponseDto';
import type { PurchaseGuildEmporiumItemDto } from '../models/PurchaseGuildEmporiumItemDto';
import type { RerollGuildBoardEntryResponseDto } from '../models/RerollGuildBoardEntryResponseDto';
import type { StartGuildChainDto } from '../models/StartGuildChainDto';
import type { UpdateGuildCosmeticsDto } from '../models/UpdateGuildCosmeticsDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GuildService {
    /**
     * @returns GuildAccessResponseDto
     * @throws ApiError
     */
    public static guildControllerGetAccessV1(): CancelablePromise<GuildAccessResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/guild/access',
        });
    }
    /**
     * @returns GuildOverviewResponseDto
     * @throws ApiError
     */
    public static guildControllerGetOverviewV1(): CancelablePromise<GuildOverviewResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/guild',
        });
    }
    /**
     * @param quick Return only quick quests (rank D/E, short weekly quests or quick platform tasks), easiest first.
     * @returns GuildBoardResponseDto
     * @throws ApiError
     */
    public static guildControllerGetBoardV1(
        quick?: boolean,
    ): CancelablePromise<GuildBoardResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/guild/board',
            query: {
                'quick': quick,
            },
        });
    }
    /**
     * @returns GuildBoardSeenResponseDto
     * @throws ApiError
     */
    public static guildControllerMarkBoardSeenV1(): CancelablePromise<GuildBoardSeenResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/guild/board/seen',
        });
    }
    /**
     * @param status
     * @param tab accepted = active + ready_to_claim (ready first); completed = completed only
     * @param offset
     * @param limit
     * @returns GuildContractsListResponseDto
     * @throws ApiError
     */
    public static guildControllerListContractsV1(
        status?: 'active' | 'ready_to_claim' | 'completed' | 'abandoned' | 'expired',
        tab?: 'accepted' | 'completed',
        offset?: number,
        limit: number = 20,
    ): CancelablePromise<GuildContractsListResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/guild/contracts',
            query: {
                'status': status,
                'tab': tab,
                'offset': offset,
                'limit': limit,
            },
        });
    }
    /**
     * @param requestBody
     * @returns AcceptGuildContractResponseDto
     * @throws ApiError
     */
    public static guildControllerAcceptContractV1(
        requestBody: AcceptGuildContractDto,
    ): CancelablePromise<AcceptGuildContractResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/guild/contracts',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns ClaimGuildContractResponseDto
     * @throws ApiError
     */
    public static guildControllerClaimContractV1(
        id: string,
    ): CancelablePromise<ClaimGuildContractResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/guild/contracts/{id}/claim',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns GuildContractDto
     * @throws ApiError
     */
    public static guildControllerAbandonContractV1(
        id: string,
    ): CancelablePromise<GuildContractDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/guild/contracts/{id}/abandon',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns GuildRewardsResponseDto
     * @throws ApiError
     */
    public static guildControllerGetRewardsV1(): CancelablePromise<GuildRewardsResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/guild/rewards',
        });
    }
    /**
     * @param requestBody
     * @returns GuildCosmeticsResponseDto
     * @throws ApiError
     */
    public static guildControllerUpdateCosmeticsV1(
        requestBody: UpdateGuildCosmeticsDto,
    ): CancelablePromise<GuildCosmeticsResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/v1/guild/cosmetics',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param entryId
     * @returns RerollGuildBoardEntryResponseDto
     * @throws ApiError
     */
    public static guildControllerRerollBoardEntryV1(
        entryId: string,
    ): CancelablePromise<RerollGuildBoardEntryResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/guild/board/{entryId}/reroll',
            path: {
                'entryId': entryId,
            },
        });
    }
    /**
     * @param id
     * @returns ExtendGuildContractResponseDto
     * @throws ApiError
     */
    public static guildControllerExtendContractV1(
        id: string,
    ): CancelablePromise<ExtendGuildContractResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/guild/contracts/{id}/extend',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns GuildEmporiumResponseDto
     * @throws ApiError
     */
    public static guildControllerGetEmporiumV1(): CancelablePromise<GuildEmporiumResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/guild/emporium',
        });
    }
    /**
     * @param requestBody
     * @returns GuildEmporiumPurchaseResponseDto
     * @throws ApiError
     */
    public static guildControllerPurchaseEmporiumItemV1(
        requestBody: PurchaseGuildEmporiumItemDto,
    ): CancelablePromise<GuildEmporiumPurchaseResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/guild/emporium/purchase',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns GuildExtraSlotPermitStatusDto
     * @throws ApiError
     */
    public static guildControllerActivateExtraSlotPermitV1(): CancelablePromise<GuildExtraSlotPermitStatusDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/guild/consumables/extra_slot_permit/activate',
        });
    }
    /**
     * @returns GuildPassportResponseDto
     * @throws ApiError
     */
    public static guildControllerGetPassportV1(): CancelablePromise<GuildPassportResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/guild/passport',
        });
    }
    /**
     * @param milestone
     * @returns ClaimGuildPassportMilestoneResponseDto
     * @throws ApiError
     */
    public static guildControllerClaimPassportMilestoneV1(
        milestone: string,
    ): CancelablePromise<ClaimGuildPassportMilestoneResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/guild/passport/claim/{milestone}',
            path: {
                'milestone': milestone,
            },
        });
    }
    /**
     * @returns GuildChainsResponseDto
     * @throws ApiError
     */
    public static guildControllerListChainsV1(): CancelablePromise<GuildChainsResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/guild/chains',
        });
    }
    /**
     * @param chainKey
     * @param requestBody
     * @returns GuildChainActionResponseDto
     * @throws ApiError
     */
    public static guildControllerStartChainV1(
        chainKey: string,
        requestBody: StartGuildChainDto,
    ): CancelablePromise<GuildChainActionResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/guild/chains/{chainKey}/start',
            path: {
                'chainKey': chainKey,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param chainKey
     * @param requestBody
     * @returns GuildChainActionResponseDto
     * @throws ApiError
     */
    public static guildControllerAdvanceChainV1(
        chainKey: string,
        requestBody: AdvanceGuildChainDto,
    ): CancelablePromise<GuildChainActionResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/guild/chains/{chainKey}/advance',
            path: {
                'chainKey': chainKey,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param locale Preferred bounty translation; defaults to the base copy
     * @returns GuildBountiesResponseDto
     * @throws ApiError
     */
    public static guildControllerListBountiesV1(
        locale?: 'en' | 'pt-BR',
    ): CancelablePromise<GuildBountiesResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/guild/bounties',
            query: {
                'locale': locale,
            },
        });
    }
    /**
     * @param id
     * @returns ClaimGuildBountyResponseDto
     * @throws ApiError
     */
    public static guildControllerClaimBountyV1(
        id: string,
    ): CancelablePromise<ClaimGuildBountyResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/guild/bounties/{id}/claim',
            path: {
                'id': id,
            },
        });
    }
}
