import { Box, Button, Paper, Text } from "@mantine/core";
import { useEffect, useState } from "react";

const Home = () => {
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

  return (
    <>
      <header
        className={`w-full h-[80px] flex items-center justify-between fixed px-4 lg:px-20 z-50 ${scrolled ? "backdrop-blur" : "bg-transparent"}`}
      >
        <Box className="flex flex-row gap-16 items-center">
          <img
            src="/img/main-logo.png"
            alt="Game Node Logo"
            className="max-h-full pointer-events-none"
          />
          <a href="#" className="w-full hidden lg:block">
            <span>About us</span>
          </a>
          <a href="#" className="hidden lg:block">
            <span>Download</span>
          </a>
          <a href="#" className="hidden lg:block">
            <span>Collaborate</span>
          </a>
        </Box>

        <Box>
          <Button variant="filled" className="w-[100px] h-[40px] rounded-3xl">
            Login
          </Button>
        </Box>
      </header>

      <Box className="w-full h-[85lvh] lg:h-lvh flex flex-col items-center justify-between bg-[url(../../public/img/bg_landing.jpg)] bg-cover bg-no-repeat pt-[180px]">
        <Box>
          <h1 className="text-center font-bold text-3xl lg:text-6xl lg:leading-[4.6rem]">
            Organize all your games <br /> in one place
          </h1>
          <h3 className="text-center text-xl lg:leading-[120px] mt-6 lg:mt-0 font-light lg:font-bold">
            GameNode is the ideal platform to manage your game collection
            virtually.
          </h3>
        </Box>

        <img
          src="/img/banner_web_landing.png"
          alt="Profile"
          width="1040"
          height="468"
          className="overflow-hidden object-cover"
        />
      </Box>

      <Box className="bg-gradient-to-b from-[#212121]to-[#090909]w-full h-full flex justify-center mt-24">
        <Box className="lg:h-[340px] flex items-center gap-4 flex-col lg:flex-row">
          <Box className="flex flex-col items-center gap-5">
            <Box className="w-[150px] h-[150px] relative">
              <video
                src="/img/vergil.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover rounded-[5px]"
              />
              <Text className="absolute inset-0 flex items-center justify-center text-[30px]">
                1
              </Text>
            </Box>
            <Text>Add games to your library space</Text>
          </Box>
          <img
            src="/img/line_space.png"
            alt="space"
            className="h-[1px] mb-5 hidden lg:block"
          />
          <Box className="flex flex-col items-center gap-5 px-4 z-10">
            <Box className="w-[150px] h-[150px] relative">
              <video
                src="/img/videoplayback.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover rounded-[5px]"
              />
              <Text className="absolute inset-0 flex items-center justify-center text-[30px]">
                2
              </Text>
            </Box>
            <Text className="font-bold text-[16px]">Make Reviews</Text>
          </Box>

          <img
            src="/img/line_space.png"
            alt="space"
            className="h-[1px] mb-5 hidden lg:block"
          />
          <Box className="flex flex-col items-center gap-5">
            <Box className="w-[150px] h-[150px] relative">
              <video
                src="/img/valo.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover rounded-[5px]"
              />
              <Text className="absolute inset-0 flex items-center justify-center text-[30px]">
                3
              </Text>
            </Box>
            <Text>Share with the world</Text>
          </Box>
        </Box>
      </Box>

      <Box className="lg:h-[500px] lg:mt-0 flex flex-col justify-between">
        <h2 className="text-center text-xl lg:text-2xl font-light lg:font-bold px-4 lg:px-40 my-20">
          Update your to-do list, evaluate the titles you already have tried and
          add the most anticipated releases to your lista de desejos. Conecte-se
          com seus amigos, siga suas atividades and follow each one's latest
          gaming sessions.
        </h2>

        <Box className="flex flex-col items-center lg:mb-24 lg:mt-24">
          <h3 className="text-center font-medium text-[20px]">
            Import games from your platforms to your GameNode account
          </h3>

          <img
            src="/img/plataforms.png"
            alt="Plataforms"
            width="519"
            height="85"
            className="py-6 px-4"
          />

          <h3 className="text-center font-medium text-[16px]">Soon</h3>

          <img
            src="/img/plataforms_soon.png"
            alt="soon..."
            width="160"
            height="39"
            className="pt-4"
          />
        </Box>

        <footer className="mt-20">
          <Paper className="bg-[#191919] h-20">
            <Box className="h-full flex justify-center lg:justify-between items-center lg:px-20">
              <img
                src="/img/main-logo.png"
                alt="Game Node Logo"
                width="99"
                height="40"
                className="hidden lg:block"
              />

              <Box className="flex flex-row gap-[28px] items-center">
                <a href="#" target="_blank">
                  <img src="/img/patreon_footer.png" alt="patreon" />
                </a>
                <a href="#" target="_blank">
                  <img src="/img/github_footer.png" alt="github" />
                </a>
                <a href="https://discord.gg/kcAT562B5A" target="_blank">
                  <img src="/img/discord_footer.png" alt="discord" />
                </a>
                <a href="#" target="_blank">
                  <img src="/img/twitter_footer.png" alt="twitter" />
                </a>
              </Box>
            </Box>
          </Paper>
        </footer>
      </Box>
    </>
  );
};

export default Home;
