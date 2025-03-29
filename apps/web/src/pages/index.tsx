import { Box, Button, Text } from "@mantine/core";
import Image from "next/image";
import bannerImage from "../../public/img/banner_web_landing.png";

const Home = () => {
  return (
    <>
      <header className="w-full flex justify-between fixed px-20 pt-8">
        <Box className="flex flex-row gap-16 items-center">
          <img
            src="/img/main-logo.png"
            alt="Game Node Logo"
            className="w-full h-full object-contain"
          />
          <a href="#">
            <span>Sobre</span>
          </a>
          <a href="#">
            <span>Download</span>
          </a>
          <a href="#">
            <span>Colabore</span>
          </a>
        </Box>

        <Box>
          <Button variant="filled" className="w-[100px] h-[40px] rounded-3xl">
            Login
          </Button>
        </Box>
      </header>

      <Box className="w-full h-lvh flex flex-col items-center justify-between bg-[url(../../public/img/bg_landing.jpg)] bg-cover bg-no-repeat pt-[180px]">
        <Box>
          <h1 className="text-center font-bold text-[64px] leading-[75px]">
            Organize todos os seus jogos <br /> em um só lugar
          </h1>
          <h3 className="text-center font-bold text-[20px] leading-[120px]">
            GameNode é a plataforma ideal para gerenciar sua coleção de jogos de
            forma virtual.
          </h3>
        </Box>

        <img
          src="/img/banner_web_landing.png"
          alt="Profile"
          width="1040"
          height="468"
        />
      </Box>

      <Box className="bg-gradient-to-b from-[#212121]to-[#090909]w-full h-screen flex justify-center pt-[105px]">
        <Box className="h-[340px] flex items-center">
          <Box className="flex flex-col items-center gap-5">
            <Text
              className="bg-[#F15025] w-[100px] h-[90px] flex justify-center items-center rounded-[5px]
            font-bold text-[32px]"
            >
              1
            </Text>
            <Text>Adicione jogos a sua biblioteca</Text>
          </Box>
          <img src="/img/line_space.png" alt="space" className="h-[1px] mb-5" />
          <Box className="flex flex-col items-center gap-5 px-4">
            <Text
              className="bg-[#F15025] w-[100px] h-[90px] flex justify-center items-center rounded-[5px]
            font-bold text-[32px]"
            >
              2
            </Text>
            <Text className="font-bold text-[16px]">Faça Reviews</Text>
          </Box>
          <img src="/img/line_space.png" alt="space" className="h-[1px] mb-5" />
          <Box className="flex flex-col items-center gap-5">
            <Text
              className="bg-[#F15025] w-[100px] h-[90px]
            flex justify-center items-center rounded-[5px]
            font-bold text-[32px]"
            >
              3
            </Text>
            <Text>Compartilhe com o mundo</Text>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Home;
