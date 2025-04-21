import { getSessionController } from "@/app/lib/actions/auth/auth.controller";
import { retrieveSettingByModuleController } from "@/app/lib/actions/setting/setting.controller";
import { addProjectName } from "@/redux/features/setting/settingSlice";

interface IResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: any;
}

export const sendResponse = (
  success: boolean,
  statusCode: number,
  message: string,
  data: any = null,
): IResponse => {
  return {
    success,
    statusCode,
    message,
    data,
  };
};

export const auth = async (...role: any[]): Promise<any> => {
  const user = await getSessionController();

  if (!user) {
    return sendResponse(false, 401, "Unauthenticated user", null);
  }

  if (!role.includes(user.role)) {
    return sendResponse(false, 403, "You can't access this feature", null);
  }

  return sendResponse(true, 200, "Authorized", user);
};

export function formatDate(dateString: string): string {
  // Parse the date string
  const date = new Date(dateString);

  // Extracting day, month, and year from the date object
  const day: number = date.getDate();
  const month: number = date.getMonth() + 1; // Adding 1 because months are zero-based
  const year: number = date.getFullYear();

  // Padding day and month with leading zeros if necessary
  const paddedDay: string = day < 10 ? "0" + day : day.toString();
  const paddedMonth: string = month < 10 ? "0" + month : month.toString();

  // Constructing the formatted date string
  const formattedDate: string = `${paddedDay}-${paddedMonth}-${year}`;

  return formattedDate;
}


export const handleSetProjectName = async (dispatch: any) => {
  const { data } = await retrieveSettingByModuleController("Global");

  const settings = data[0];

  if (settings?.setting_fields) {
    settings.setting_fields =
      typeof settings?.setting_fields === "string"
        ? JSON.parse(settings?.setting_fields)
        : settings?.setting_fields;
  }

  const projectName = settings?.setting_fields?.find(
    (setting: any) => setting?.name === "project_name",
  );

  if (projectName?.value) {
    dispatch(addProjectName(projectName?.value));
  }
};

export function capitalizeFirstLetter(input: string): string {
  if (input?.length === 0) {
    return input;
  }
  return input?.charAt(0)?.toUpperCase() + input?.slice(1);
}

export const handleSelectAll = (
  e: React.ChangeEvent<HTMLInputElement>,
  list: any[],
  setIsAllSelected: any,
  setSelectedIds: any,
  idType: string,
) => {
  setIsAllSelected(e.target.checked);
  if (e.target.checked) {
    const allIds = list.map((page) => page[idType]);
    setSelectedIds(allIds);
  } else {
    setSelectedIds([]);
  }
};

export const handleSelectOne = (
  e: React.ChangeEvent<HTMLInputElement>,
  id: number,
  setSelectedIds: any,
) => {
  if (e.target.checked) {
    setSelectedIds((prevSelectedIds: any) => [...prevSelectedIds, id]);
  } else {
    setSelectedIds((prevSelectedIds: any) =>
      prevSelectedIds.filter((selectedId: any) => selectedId !== id),
    );
  }
};

export function shortenString(str: string, length: number): string {
  if (str?.length > length) {
    return str?.slice(0, length) + "...";
  }
  return str;
}

export async function getFieldValue(name: string): Promise<string | null> {
  const { data: settings } =
    await retrieveSettingByModuleController("email_templates");

  const templates = settings ? settings[0] : [];

  const fields =
    typeof templates?.setting_fields === "string"
      ? JSON.parse(templates?.setting_fields)
      : templates?.setting_fields;

  const field = fields?.find((field: any) => field?.name === name);

  return field ? field?.value : null;
}

export function generateRandomPassword(length: number = 6): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }

  return password;
}

/**
 * Helper to authenticate a user and ensure sufficient roles.
 */
export const authenticateAndAuthorize = async (...roles: string[]) => {
  const authRes = await auth(...roles);
  if (authRes.statusCode >= 400) {
    return sendResponse(false, authRes.statusCode, authRes.message);
  }
};


export function shortenWithLastWord(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input;

  const words = input.trim().split(/\s+/);
  let result = '';

  for (let i = 0; i < words.length; i++) {
    const temp = result.length > 0 ? result + ' ' + words[i] : words[i];
    // Reserve 3 chars for '...'
    if (temp.length + 3 > maxLength) break;
    result = temp;
  }

  return result + '...';
}

