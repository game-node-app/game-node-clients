import { Box } from "@mantine/core";
import HeaderCustom from "@/components/header/HeaderCustom.tsx";

const aboutUsPage = () => {
  return (
    <>
      <HeaderCustom />
      <Box className="w-full h-dvh bg-[url(../../public/img/bg_landing.jpg)]">
        <Box className={"h-96 flex justify-center items-center"}>
          <h1 className={"text-5xl font-bold text-center"}>
            A new way to organize your <br /> entire game collection
          </h1>
        </Box>

        <Box className={"flex flex-wrap gap-7 px-20 pb-24"}>
          <img src="/img/about_us/box_01.png" alt="Coleções Personalizadas" />
          <img src="/img/about_us/box_02.png" alt="Coleções Personalizadas" />
          <img src="/img/about_us/box_03.png" alt="Coleções Personalizadas" />
          <img src="/img/about_us/box_04.png" alt="Coleções Personalizadas" />
        </Box>
      </Box>
    </>
  );
};

export default aboutUsPage;
