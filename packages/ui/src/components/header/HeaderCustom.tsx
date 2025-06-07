import { Box, Button } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { useUserId } from "#@/components";
import { useEffect, useState } from "react";

const HeaderCustom = () => {
  const router = useRouter();
  const userId = useUserId();
  const [scrolled, setScrolled] = useState(false);

  const checkScrollPosition = () => {
    setScrolled(() => window.scrollY > 10);
  };

  useEffect(() => {
    window.addEventListener("scroll", checkScrollPosition);
    return () => {
      window.removeEventListener("scroll", checkScrollPosition);
    };
  }, []);

  useEffect(() => {
    if (userId) {
      router.push("/search");
    }
  }, [router, userId]);

  return (
    <div>
      <header
        className={`w-full h-[80px] flex items-center justify-between fixed px-4 lg:px-20 z-50 ${scrolled ? "backdrop-blur" : "bg-transparent"}`}
      >
        <Box className="flex flex-row gap-16 items-center">
          <img
            src="/img/main-logo.png"
            alt="Game Node Logo"
            className="max-h-full pointer-events-none"
          />
          <a href="/about" className="w-full hidden lg:block">
            <span>About us</span>
          </a>
          <a
            href="https://github.com/game-node-app"
            className="hidden lg:block"
          >
            <span>Collaborate</span>
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=app.gamenode"
            className="hidden lg:block"
          >
            <span>Android App</span>
          </a>
        </Box>

        {userId == undefined && (
          <Link href={"/search"}>
            <Button variant="filled" className="w-[100px] h-[40px] rounded-3xl">
              Join in
            </Button>
          </Link>
        )}
      </header>
    </div>
  );
};

export default HeaderCustom;
