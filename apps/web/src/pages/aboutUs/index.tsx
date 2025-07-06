import { Box, Paper } from "@mantine/core";
import HeaderCustom from "@/components/header/HeaderCustom.tsx";

const aboutUsPage = () => {
  return (
    <>
      <HeaderCustom />
      <Box className="w-full flex flex-col items-center bg-[url(../../public/img/bg_landing.jpg)] bg-cover bg-no-repeat">
        <Box className={"h-96 flex justify-center items-center"}>
          <h1 className={"text-5xl font-bold text-center"}>
            A new way to organize your <br /> entire game collection
          </h1>
        </Box>

        <Box className="flex flex-wrap justify-center gap-7 px-4 sm:px-20 pb-24">
          <div className="relative">
            <img
              src="/img/about_us/box_01.png"
              alt="Coleções Personalizadas"
              className="block pointer-events-none"
            />
            <p className="absolute left-10 bottom-0 pb-10 font-bold text-4xl">
              Custom <br />
              Collections
            </p>
          </div>

          <div className="relative">
            <img
              src="/img/about_us/box_02.png"
              alt="Coleções Personalizadas"
              className={"object-cover"}
            />
            <p className="absolute left-10 bottom-0 pb-10 font-bold text-4xl">
              Review
            </p>
          </div>

          <div className="relative">
            <img
              src="/img/about_us/box_03.png"
              alt="Coleções Personalizadas"
              className={"object-cover"}
            />
            <p className="absolute left-10 bottom-0 pb-10 font-bold text-4xl">
              Achievements
            </p>
          </div>

          <div className="relative">
            <img
              src="/img/about_us/box_04.png"
              alt="Coleções Personalizadas"
              className={"object-cover"}
            />
            <p className="absolute left-10 bottom-0 pb-10 font-bold text-4xl">
              Activities
            </p>
          </div>
        </Box>
      </Box>

      <Box className={"bg-[#171717] flex gap-32 px-60 pt-20 pb-20 p-0"}>
        <div>
          <img
            className={"pointer-events-none"}
            src="/img/about_us/platforms.svg"
            alt="platforms"
          />
        </div>

        <div>
          <h2 className={"font-bold text-5xl pb-4"}>Sync with platforms</h2>
          <p className={"text-[1.25rem] pb-2 font-regular"}>
            Import games from your platforms to your <br />
            GameNode account
          </p>
          <p className={"text-[1.25rem] font-regular"}>
            Sync your library, your playtime <br />
            directly on our website.
          </p>

          <div className={"pt-10 "}>
            <p className={"pb-4"}>Soon</p>
            <img
              className={"pointer-events-none"}
              src="/img/about_us/soon.svg"
              alt="soon"
            />
          </div>
        </div>
      </Box>

      <Box className={"flex items-center px-9"}>
        <div className={"w-1/2"}>
          <h2 className={"font-bold text-4xl pb-6"}>
            Also available for mobile
          </h2>
          <p className={"font-light text-2xl"}>
            Access our app and enjoy all the features <br />
            in the palm of your hand — <br />
            wherever and whenever you want.
          </p>

          <div className="flex gap-4 pt-5">
            <a href="#">
              <button>
                <p
                  className={
                    "bg-white p-2 rounded-[8px] flex gap-2 text-[#191919] px-4 border-2 border-white"
                  }
                >
                  <img
                    className={"w-5"}
                    src="/img/about_us/playstore.svg"
                    alt="PlayStore"
                  />{" "}
                  Google Play
                </p>
              </button>
            </a>

            <a href="#" className={"pointer-events-none opacity-30"}>
              <button disabled={true}>
                <p
                  className={
                    "bg-[#171717] p-2 rounded-[8px] flex gap-2 border-2 border-white"
                  }
                >
                  <img
                    className={"w-5"}
                    src="/img/about_us/apple.svg"
                    alt="apple"
                  />{" "}
                  Soon on App Store
                </p>
              </button>
            </a>
          </div>
        </div>

        <div className={"pt-40"}>
          <img src="/img/about_us/mobile.png" alt="mobile" />
        </div>
      </Box>

      <Box
        className={"flex justify-center items-center px-9 py-32 bg-[#101010]"}
        style={{ background: "url(/img/about_us/coffee.gif)" }}
      >
        <div className={"w-1/2 text-center"}>
          <h2 className={"font-bold text-6xl pb-6"}>
            GameNode is maintained{" "}
            <span className={"text-[#f15025]"}>exclusively</span> <br />
            with community support
          </h2>
          <p className={"font-light text-2xl mb-4"}>
            Collaborate with us to keep our platform <br />
            100% Free and constantly evolving.
          </p>

          <button className={"bg-[#ff424d] px-6 py-2 rounded-2xl"}>
            <a href="https://patreon.com/GameNodeApp" target="_blank">
              <p className={"tracking-wider text-2xl font-bold"}>
                Buy me a Coffee
              </p>
            </a>
          </button>
        </div>
      </Box>

      <footer>
        <Paper className="bg-[#191919] h-20">
          <Box className="h-full flex justify-between items-center lg:px-20">
            <img
              src="/img/main-logo.png"
              alt="Game Node Logo"
              width="99"
              height="40"
              className="hidden lg:block"
            />

            <a
              href="https://patreon.com/GameNodeApp"
              target="_blank"
              className="lg:hidden pl-4"
            >
              <img src="/img/patreon_footer.png" alt="patreon" />
            </a>

            <Box className="flex flex-row gap-[28px] items-center pr-4 lg:pr-0">
              <a
                href="https://patreon.com/GameNodeApp"
                target="_blank"
                className="hidden lg:block"
              ></a>
              <a href="https://github.com/game-node-app" target="_blank">
                <img src="/img/github_footer.png" alt="github" />
              </a>
              <a href="https://discord.gg/kcAT562B5A" target="_blank">
                <img src="/img/discord_footer.png" alt="discord" />
              </a>
              <a href="https://x.com/gamenodeapp" target="_blank">
                <img src="/img/x_footer.png" alt="X" />
              </a>
            </Box>
          </Box>
        </Paper>
      </footer>
    </>
  );
};

export default aboutUsPage;
