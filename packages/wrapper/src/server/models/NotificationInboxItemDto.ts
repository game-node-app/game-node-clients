/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationAchievementTargetDto } from './NotificationAchievementTargetDto';
import type { NotificationActivityTargetDto } from './NotificationActivityTargetDto';
import type { NotificationActorDto } from './NotificationActorDto';
import type { NotificationAwardsTargetDto } from './NotificationAwardsTargetDto';
import type { NotificationConnectionTargetDto } from './NotificationConnectionTargetDto';
import type { NotificationContentTargetDto } from './NotificationContentTargetDto';
import type { NotificationGoalTargetDto } from './NotificationGoalTargetDto';
import type { NotificationGuildTargetDto } from './NotificationGuildTargetDto';
import type { NotificationImporterTargetDto } from './NotificationImporterTargetDto';
import type { NotificationImportPreviewDto } from './NotificationImportPreviewDto';
import type { NotificationProfileTargetDto } from './NotificationProfileTargetDto';
import type { NotificationRecapTargetDto } from './NotificationRecapTargetDto';
import type { NotificationTextPreviewDto } from './NotificationTextPreviewDto';
export type NotificationInboxItemDto = {
    id: number;
    type: string;
    actors: Array<NotificationActorDto>;
    preview: (NotificationTextPreviewDto | NotificationImportPreviewDto) | null;
    target: (NotificationContentTargetDto | NotificationActivityTargetDto | NotificationProfileTargetDto | NotificationImporterTargetDto | NotificationAchievementTargetDto | NotificationConnectionTargetDto | NotificationAwardsTargetDto | NotificationRecapTargetDto | NotificationGoalTargetDto | NotificationGuildTargetDto) | null;
    eventCount: number;
    actorCount: number;
    lastEventAt: string;
    version: number;
    readVersion: number;
};

