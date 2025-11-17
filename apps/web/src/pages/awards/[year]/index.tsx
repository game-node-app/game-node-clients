import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import dayjs from "dayjs";

const AwardsEventPage = () => {
  const router = useRouter();

  const targetYear = useMemo(() => {
    // Shows last year event if the current month is before March (non-inclusive)
    if (dayjs().month() + 1 < 3) {
      return dayjs().subtract(1, "year").year();
    }

    return dayjs().year();
  }, []);

  useEffect(() => {
    router.push(`/awards/${targetYear}/vote`);
  }, [router, targetYear]);

  return <div></div>;
};

export default AwardsEventPage;
