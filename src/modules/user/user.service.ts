import { prisma } from "../../lib/prisma";
import { IUpdateProfile } from "./user.interface";

const updateMyProfile = async (userId: string, payload: IUpdateProfile) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: payload,
    omit: { password: true },
  });

  return updatedUser;
};

export const userService = {
  updateMyProfile,
};
