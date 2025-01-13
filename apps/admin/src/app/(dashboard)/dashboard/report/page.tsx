"use client";

import React from "react";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import ReportsTable from "@/components/report/ReportsTable";

const Page = () => {
    return (
        <PageContainer title={"Reports"}>
            <ReportsTable />
        </PageContainer>
    );
};

export default Page;
