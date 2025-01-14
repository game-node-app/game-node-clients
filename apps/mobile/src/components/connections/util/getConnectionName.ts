import { UserConnectionDto } from "@/wrapper/server";

export const getConnectionName = (type: UserConnectionDto.type) => {
    switch (type) {
        case UserConnectionDto.type.STEAM:
            return "Steam";
        case UserConnectionDto.type.PSN:
            return "Playstation Network";
        default:
            return "Name not available";
    }
};
