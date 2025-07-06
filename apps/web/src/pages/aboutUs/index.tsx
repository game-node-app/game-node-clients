import { Box } from "@mantine/core";
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

      <Box className={"flex"}>
        <div className={"w-1/2"}>
          <p>teste</p>
        </div>

        <div>
          <img src="/img/about_us/mobile.png" alt="mobile" />
        </div>
      </Box>
    </>
  );
};

export default aboutUsPage;
