import React from "react";
import {
    Container,
    Flex,
    Paper,
    Stack,
    Title,
    Text,
    List,
} from "@mantine/core";

const Tos = () => {
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
                        <Title>Terms of service</Title>
                        <Title size={"h4"}>1. Terms</Title>
                        <Text>
                            By accessing the website at GameNode you are
                            agreeing to be bound by these terms of service, all
                            applicable laws and regulations, and agree that you
                            are responsible for compliance with any applicable
                            local laws. If you do not agree with any of these
                            terms, you are prohibited from using or accessing
                            this site. The materials contained in this website
                            are protected by applicable copyright and trademark
                            law.
                        </Text>
                        <Title size={"h4"}>2. Use License</Title>
                        <List
                            type="ordered"
                            listStyleType={"number"}
                            withPadding
                        >
                            <List.Item>
                                Permission is granted to temporarily download
                                one copy of the materials (information or
                                software) on GameNode's website for personal,
                                non-commercial transitory viewing only. This is
                                the grant of a licence, not a transfer of title,
                                and under this licence you may not:
                            </List.Item>
                            <List.Item>modify or copy the materials;</List.Item>
                            <List.Item>
                                use the materials for any commercial purpose, or
                                for any public display (commercial or
                                non-commercial);
                            </List.Item>
                            <List.Item>
                                attempt to decompile or reverse engineer any
                                software contained on GameNode website;
                            </List.Item>
                            <List.Item>
                                remove any copyright or other proprietary
                                notations from the materials; or
                            </List.Item>
                            <List.Item>
                                transfer the materials to another person or
                                'mirror' the materials on any other server.
                            </List.Item>
                            <List.Item>
                                This licence shall automatically terminate if
                                you violate any of these restrictions and may be
                                terminated by GameNode at any time. Upon
                                terminating your viewing of these materials or
                                upon the termination of this licence, you must
                                destroy any downloaded materials in your
                                possession whether in electronic or printed
                                format.
                            </List.Item>
                        </List>
                        <Title size={"h4"}>3. Disclaimer</Title>
                        <List
                            type="ordered"
                            listStyleType={"number"}
                            withPadding
                        >
                            <List.Item>
                                The materials on GameNode's website are provided
                                on an 'as is' basis. GameNode makes no
                                warranties, expressed or implied, and hereby
                                disclaims and negates all other warranties
                                including, without limitation, implied
                                warranties or conditions of merchantability,
                                fitness for a particular purpose, or
                                non-infringement of intellectual property or
                                other violation of rights.
                            </List.Item>
                            <List.Item>
                                Further, GameNode does not warrant or make any
                                representations concerning the accuracy, likely
                                results, or reliability of the use of the
                                materials on its website or otherwise relating
                                to such materials or on any sites linked to this
                                site.
                            </List.Item>
                        </List>
                        <Title size={"h4"}>4. Limitations</Title>
                        <Text>
                            In no event shall GameNode or its suppliers be
                            liable for any damages (including, without
                            limitation, damages for loss of data or profit, or
                            due to business interruption) arising out of the use
                            or inability to use the materials on GameNode's
                            website, even if GameNode or a GameNode authorised
                            representative has been notified orally or in
                            writing of the possibility of such damage. Because
                            some jurisdictions do not allow limitations on
                            implied warranties, or limitations of liability for
                            consequential or incidental damages, these
                            limitations may not apply to you.
                        </Text>
                        <Title size={"h4"}>5. Accuracy of materials</Title>
                        <Text>
                            The materials appearing on GameNode's website could
                            include technical, typographical, or photographic
                            errors. GameNode does not warrant that any of the
                            materials on its website are accurate, complete or
                            current. GameNode may make changes to the materials
                            contained on its website at any time without notice.
                            However GameNode does not make any commitment to
                            update the materials.
                        </Text>
                        <Title size={"h4"}>6. Links</Title>
                        <Text>
                            GameNode has not reviewed all of the sites linked to
                            its website and is not responsible for the contents
                            of any such linked site. The inclusion of any link
                            does not imply endorsement by GameNode of the site.
                            Use of any such linked website is at the user's own
                            risk.
                        </Text>
                        <Title size={"h4"}>7. Modifications</Title>
                        <Text>
                            GameNode may revise these terms of service for its
                            website at any time without notice. By using this
                            website you are agreeing to be bound by the then
                            current version of these terms of service.
                        </Text>
                        <Title size={"h4"}>8. Governing Law</Title>
                        <Text>
                            These terms and conditions are governed by and
                            construed in accordance with the laws of Brasil and
                            you irrevocably submit to the exclusive jurisdiction
                            of the courts in that State, Country or location.
                        </Text>
                    </Stack>
                </Paper>
            </Flex>
        </Container>
    );
};

export default Tos;
