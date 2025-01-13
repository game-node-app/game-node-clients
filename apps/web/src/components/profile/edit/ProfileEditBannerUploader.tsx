import React, { useState } from "react";
import useUserId from "@/components/auth/hooks/useUserId";
import useUserProfile from "@/components/profile/hooks/useUserProfile";
import Cropper, { Area } from "react-easy-crop";
import { base64ToBlob, getCroppedImg } from "@/util/imageUtils";
import ImageDropzone from "@/components/general/ImageDropzone";
import { Button, Group, Slider, Stack, Stepper } from "@mantine/core";
import { DetailsBox } from "@/components/general/DetailsBox";
import { BaseModalChildrenProps } from "@/util/types/modal-props";
import ProfileUserInfoWithBanner from "@/components/profile/view/ProfileUserInfoWithBanner";
import { useMutation } from "@tanstack/react-query";
import { ProfileService, UpdateProfileImageDto } from "@/wrapper/server";
import type = UpdateProfileImageDto.type;
import { useDisclosure } from "@mantine/hooks";
import ProfileBanner from "@/components/profile/view/ProfileBanner";
import CenteredLoading from "@/components/general/CenteredLoading";

const ProfileEditBannerUploader = ({ onClose }: BaseModalChildrenProps) => {
    const userId = useUserId();
    const profileQuery = useUserProfile(userId);

    const [uploadedFileSrc, setUploadedFileSrc] = useState<string>();
    const [finalImageSrc, setFinalImageSrc] = useState<string>();
    /*
     * Cropper properties
     */
    const [crop, setCrop] = React.useState({ x: 0, y: 0 });
    const [zoom, setZoom] = React.useState(1);
    /*
     * Stepper
     */
    const [currentStep, setCurrentStep] = useState<number>(0);

    const [previewModalOpened, previewModalUtils] = useDisclosure();

    const onCropComplete = async (_: Area, croppedAreaPixels: Area) => {
        const croppedImage = await getCroppedImg(
            uploadedFileSrc!,
            croppedAreaPixels,
        );
        setFinalImageSrc(croppedImage ?? undefined);
    };

    const handleStepClick = (step: number) => {
        const isOutOfBonds = step < 0 || step > 2;
        if (isOutOfBonds) return;
        if (step === 0) {
            setUploadedFileSrc(undefined);
            setFinalImageSrc(undefined);
        } else if (step === 1) {
            setFinalImageSrc(undefined);
        }

        setCurrentStep(step);
    };

    const profileBannerMutation = useMutation({
        mutationFn: async () => {
            if (!finalImageSrc) {
                throw new Error("Invalid image source");
            }

            await ProfileService.profileControllerUpdateImageV1({
                file: await base64ToBlob(finalImageSrc),
                type: type.BANNER,
            });
        },
        onSuccess: () => {
            profileQuery.invalidate();
            if (onClose) onClose();
        },
    });

    const handleImageUpload = () => {
        if (finalImageSrc == undefined) {
            handleStepClick(0);
            return;
        }
        profileBannerMutation.mutate();
    };

    const renderBasedOnStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <ImageDropzone
                        maxFiles={1}
                        maxSize={3 * 1024 ** 2}
                        onDrop={(files) => {
                            const fileString = URL.createObjectURL(files[0]);
                            setUploadedFileSrc(fileString);
                            setCurrentStep(1);
                        }}
                    />
                );
            case 1:
                return (
                    <>
                        <Cropper
                            image={uploadedFileSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={21 / 9}
                            cropShape="rect"
                            showGrid={true}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                        <Slider
                            mt={350}
                            min={0.1}
                            step={0.1}
                            max={2}
                            value={zoom}
                            onChange={setZoom}
                        />
                        <Group justify={"center"} mb={10}>
                            <Button
                                variant={"default"}
                                onClick={() => handleStepClick(0)}
                            >
                                Go back
                            </Button>
                            <Button onClick={() => handleStepClick(2)}>
                                Confirm
                            </Button>
                        </Group>
                    </>
                );
            case 2:
                if (!finalImageSrc || !userId) {
                    return <CenteredLoading />;
                }
                return (
                    <>
                        <DetailsBox
                            title={"Preview"}
                            description={
                                "Actual banner size may vary based on device size and model."
                            }
                            withBorder
                        >
                            <ProfileBanner
                                userId={userId}
                                customSource={finalImageSrc}
                            />
                        </DetailsBox>
                        <Group justify={"center"} mb={10}>
                            <Button
                                variant={"default"}
                                onClick={() => handleStepClick(1)}
                            >
                                Go back
                            </Button>
                            <Button
                                onClick={() => handleImageUpload()}
                                loading={profileBannerMutation.isPending}
                            >
                                Confirm
                            </Button>
                        </Group>
                    </>
                );
        }
    };

    return (
        <Stack className={"w-full"}>
            <Stepper
                active={currentStep}
                onStepClick={handleStepClick}
                allowNextStepsSelect={false}
                size={"sm"}
            >
                <Stepper.Step />
                <Stepper.Step />
                <Stepper.Step />
            </Stepper>

            <Stack className={"w-full h-full relative"}>
                {renderBasedOnStep()}
            </Stack>
        </Stack>
    );
};

export default ProfileEditBannerUploader;
