import React from "react";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import ReportItemDetails from "@/components/report/details/ReportItemDetails";

interface Props {
    params: {
        id: string;
    };
}

const Page = ({ params: { id } }: Props) => {
    const idAsNumber = parseInt(id);

    return (
        <PageContainer
            title={`Report ${id}`}
            items={[
                { label: "Reports", href: "/dashboard/report" },
                { label: `Report ${id}`, href: `/dashboard/report/${id}` },
            ]}
        >
            <ReportItemDetails reportId={idAsNumber}></ReportItemDetails>
        </PageContainer>
    );
};

export default Page;
