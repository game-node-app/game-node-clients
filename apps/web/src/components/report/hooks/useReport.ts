import { useQuery } from "@tanstack/react-query";
import { ReportService } from "@repo/wrapper/server";

export function useReport(reportId: number) {
  return useQuery({
    queryKey: ["report", reportId],
    queryFn: async () => {
      return ReportService.reportControllerFindOneByIdV1(reportId);
    },
  });
}
