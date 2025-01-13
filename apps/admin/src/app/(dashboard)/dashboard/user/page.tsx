import React from "react";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import UsersManagementTable from "@/components/profile/UsersManagementTable";

const Page = () => {
    return (
        <PageContainer title={"Users"}>
            <UsersManagementTable />
        </PageContainer>
    );
};

export default Page;
