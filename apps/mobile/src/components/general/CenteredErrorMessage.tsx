import { Center, CenterProps, Title } from "@mantine/core";

interface Props extends CenterProps {
    message: string;
}

const CenteredErrorMessage = ({ message, ...others }: Props) => {
    return (
        <Center className={"w-full h-full"} {...others}>
            <Title c={"red"} size={"h4"} className={"text-center"}>
                {message}
            </Title>
        </Center>
    );
};

export default CenteredErrorMessage;
