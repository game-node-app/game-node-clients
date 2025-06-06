import { Report } from "@repo/wrapper/server";

export function reportCategoryToString(category: string) {
  switch (category) {
    case Report.category.SPAM:
      return "Spam";
    case Report.category.PERSONAL:
      return "Personal";
    case Report.category.NUDITY:
      return "Nudity";
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
    case Report.category.NUDITY:
      return "Explicit nudity or sexual content";
    default:
      return "";
  }
}

export function reportSourceTypeToString(source: string) {
  switch (source) {
    case Report.sourceType.PROFILE:
      return "Profile";
    case Report.sourceType.REVIEW:
      return "Review";
    case Report.sourceType.REVIEW_COMMENT:
      return "Review comment";

    default:
      return "Not available";
  }
}
