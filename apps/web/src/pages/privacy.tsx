import React from "react";
import {
    Box,
    Container,
    Flex,
    Image,
    Paper,
    Stack,
    Text,
    Title,
} from "@mantine/core";

const Privacy = () => {
    return (
        <Container fluid p={0}>
            <Flex justify={"center"}>
                <Paper
                    w={{
                        base: "100%",
                        lg: "80%",
                    }}
                    className={"p-4"}
                >
                    <Stack w={"100%"}>
                        <Title size={"h1"}>Privacy Policy</Title>
                        <Text>
                            Your privacy is important to us. It is GameNode's
                            policy to respect your privacy regarding any
                            information we may collect from you across our
                            website, GameNode, and other sites we own and
                            operate. We only ask for personal information when
                            we truly need it to provide a service to you. We
                            collect it by fair and lawful means, with your
                            knowledge and consent. We also let you know why
                            we’re collecting it and how it will be used. We only
                            retain collected information for as long as
                            necessary to provide you with your requested
                            service. What data we store, we’ll protect within
                            commercially acceptable means to prevent loss and
                            theft, as well as unauthorised access, disclosure,
                            copying, use or modification. We don’t share any
                            personally identifying information publicly or with
                            third-parties, except when required to by law. Our
                            website may link to external sites that are not
                            operated by us. Please be aware that we have no
                            control over the content and practices of these
                            sites, and cannot accept responsibility or liability
                            for their respective privacy policies. You are free
                            to refuse our request for your personal information,
                            with the understanding that we may be unable to
                            provide you with some of your desired services. Your
                            continued use of our website will be regarded as
                            acceptance of our practices around privacy and
                            personal information. If you have any questions
                            about how we handle user data and personal
                            information, feel free to contact us.
                        </Text>
                        <Title size={"h2"}>Contact</Title>
                        <Text>
                            You may reach out to us at any given moment using
                            our email:
                        </Text>
                        <a href={"mailto:support@gamenode.app"}>
                            support@gamenode.app
                        </a>
                        <Title>Cookie Policy for GameNode</Title>
                        <Text>
                            This is the Cookie Policy for GameNode, accessible
                            from URL https://gamenode.app.
                        </Text>
                        <Title size={"h4"}>What Are Cookies</Title>
                        <Text>
                            As is common practice with almost all professional
                            websites this site uses cookies, which are tiny
                            files that are downloaded to your computer, to
                            improve your experience. This page describes what
                            information they gather, how we use it and why we
                            sometimes need to store these cookies. We will also
                            share how you can prevent these cookies from being
                            stored however this may downgrade or break certain
                            elements of the sites functionality.
                        </Text>
                        <Title size={"h4"}>How We Use Cookies</Title>
                        <Text>
                            We use cookies for a variety of reasons detailed
                            below. Unfortunately in most cases there are no
                            industry standard options for disabling cookies
                            without completely disabling the functionality and
                            features they add to this site. It is recommended
                            that you leave on all cookies if you are not sure
                            whether you need them or not in case they are used
                            to provide a service that you use.
                        </Text>
                        <Title size={"h4"}>Disabling Cookies</Title>
                        <Text>
                            You can prevent the setting of cookies by adjusting
                            the settings on your browser (see your browser Help
                            for how to do this). Be aware that disabling cookies
                            will affect the functionality of this and many other
                            websites that you visit. Disabling cookies will
                            usually result in also disabling certain
                            functionality and features of this site. Therefore
                            it is recommended that you do not disable cookies.
                        </Text>
                        <Title size={"h4"}>Third-party Cookies</Title>
                        <Text>
                            In some special cases we also use cookies provided
                            by trusted third parties. The following section
                            details which third party cookies you might
                            encounter through this site.
                        </Text>
                        <Text>
                            Our website and content is served and protected by{" "}
                            <a href={"https://cloudflare.com"}>Cloudflare</a>.
                            As such, this third party provider may inject some
                            third party cookies to analyze your visits in our
                            site. To avoid this, either disable cookies in your
                            browser, or use some form of tracking protection.
                        </Text>
                        <Text>
                            You may read Cloudflare's privacy notice{" "}
                            <a
                                href={
                                    "https://www.cloudflare.com/privacypolicy/"
                                }
                            >
                                here
                            </a>
                            .
                        </Text>
                        <Title size={"h4"}>The cookies we set</Title>
                        <Text>
                            Our webanalytics tool of choice,{" "}
                            <a href={"https://matomo.org"}>Matomo</a>, may
                            inject some cookies to analyze your usage across our
                            website. These may contain data such as your IP
                            Address, estimated location of access (e.g.
                            country), repeated visits record, etc. To avoid
                            this, either disable cookies in your browser, or use
                            some form of tracking protection and/or adblocker.
                        </Text>
                        <Text>
                            <a href={"https://matomo.org"}>Matomo</a> is a
                            privacy-first, open source alternative to popular
                            alternatives tools, and allows us to keep{" "}
                            <strong>all</strong> collected data in our servers,
                            where they are never shared with any third party
                            services.
                        </Text>
                        <Text>
                            You may read Matomo's privacy notice{" "}
                            <a href={"https://matomo.org/privacy-policy/"}>
                                here
                            </a>
                            .
                        </Text>
                        <Box className={"w-32 h-auto"}>
                            <Image
                                src={
                                    "https://m-img.org/spai/w_197+q_lossless+ret_img+to_webp/matomo.org/wp-content/uploads/2018/10/matomo-privacy-badge-v2-1-1.png"
                                }
                                alt={
                                    "A image with Matomo's logo, with the text 'Your privacy protected - this website uses Matomo'."
                                }
                            />
                        </Box>
                        <Title>Consent</Title>
                        <Text>
                            Please keep in mind that by using our website and
                            services you hereby agree to our privacy policy and
                            terms of service.
                        </Text>
                        <Text>
                            If you with to stop using our services and to have
                            your data removed from our end (e.g. data we
                            actually have access and control of), please feel
                            free to contact us.
                        </Text>
                    </Stack>
                </Paper>
            </Flex>
        </Container>
    );
};

export default Privacy;
