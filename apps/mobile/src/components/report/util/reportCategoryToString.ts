import { Report } from "@/wrapper/server";

export default function reportCategoryToString(category: string) {
    switch (category) {
        case Report.category.SPAM:
            return "Spam";
        case Report.category.PERSONAL:
            return "Personal";
        default:
            return "Not available";
    }
}

export function reportCategoryToDescription(category: string) {
    switch (category) {
        case Report.category.SPAM:
            return "Any kind of spam";
        case Report.category.PERSONAL:
            return "Personal attacks - including but not limited to racism, sexism, etc.";
        default:
            return "";
    }
}
