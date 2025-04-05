import { Center, Container, Stack, Text, Title } from "@mantine/core";
import { IconError404 } from "@tabler/icons-react";

export default function Page() {
    return (
        <Container fluid w={"100vw"} h={"100vh"}>
            <Stack justify={"center"} align={"center"} w={"100%"} h={"100%"}>
                <Title size={"h5"}>Ops!</Title>
                <Title
                    className="shadow-2xl"
                    fw={"bolder"}
                    size={"h1"}
                    c={"red"}
                >
                    Error 404
                </Title>
                <Title size={"h5"}>
                    The page you are looking for doesn't exist.
                </Title>

                <svg
                    width="85"
                    height="74"
                    viewBox="0 0 85 74"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M36.0351 6.61639L4.01328 59.731C3.35306 60.867 3.00373 62.1549 3.00003 63.4667C2.99633 64.7785 3.3384 66.0684 3.99221 67.2081C4.64601 68.3477 5.58876 69.2974 6.72666 69.9627C7.86456 70.6279 9.15794 70.9856 10.4781 71H74.5219C75.8421 70.9856 77.1354 70.6279 78.2733 69.9627C79.4112 69.2974 80.354 68.3477 81.0078 67.2081C81.6616 66.0684 82.0037 64.7785 82 63.4667C81.9963 62.1549 81.6469 60.867 80.9867 59.731L48.9649 6.61639C48.2909 5.51243 47.3419 4.59969 46.2095 3.96623C45.0771 3.33278 43.7995 3 42.5 3C41.2005 3 39.9229 3.33278 38.7905 3.96623C37.6581 4.59969 36.7091 5.51243 36.0351 6.61639V6.61639Z"
                        stroke="#F44E4E"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <rect x="39" y="14" width="8" height="33" fill="#F44E4E" />
                    <circle cx="42.5" cy="57.5" r="4.5" fill="#F44E4E" />
                </svg>
            </Stack>
        </Container>
    );
}
