/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationAchievementTargetDto } from './NotificationAchievementTargetDto';
import type { NotificationActivityTargetDto } from './NotificationActivityTargetDto';
import type { NotificationActorDto } from './NotificationActorDto';
import type { NotificationContentTargetDto } from './NotificationContentTargetDto';
import type { NotificationImporterTargetDto } from './NotificationImporterTargetDto';
import type { NotificationImportPreviewDto } from './NotificationImportPreviewDto';
import type { NotificationProfileTargetDto } from './NotificationProfileTargetDto';
import type { NotificationTextPreviewDto } from './NotificationTextPreviewDto';
export type NotificationInboxItemDto = {
    id: number;
    type: string;
    actors: Array<NotificationActorDto>;
    preview: (NotificationTextPreviewDto | NotificationImportPreviewDto) | null;
    target: (NotificationContentTargetDto | NotificationActivityTargetDto | NotificationProfileTargetDto | NotificationImporterTargetDto | NotificationAchievementTargetDto) | null;
    eventCount: number;
    actorCount: number;
    lastEventAt: string;
    version: number;
    readVersion: number;
};

