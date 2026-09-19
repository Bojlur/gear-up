import httpStatus from "http-status";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateCategory, IUpdateCategory } from "./category.interface";

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const getAllCategories = async () => {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
};

const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUniqueOrThrow({ where: { id } });
  return category;
};

const createCategory = async (payload: ICreateCategory) => {
  const slug = slugify(payload.name);

  const existing = await prisma.category.findFirst({
    where: { OR: [{ name: payload.name }, { slug }] },
  });

  if (existing) {
    throw new AppError(httpStatus.CONFLICT, "A category with this name already exists");
  }

  return prisma.category.create({
    data: { name: payload.name, slug, description: payload.description },
  });
};

const updateCategory = async (id: string, payload: IUpdateCategory) => {
  await prisma.category.findUniqueOrThrow({ where: { id } });

  const data: IUpdateCategory & { slug?: string } = { ...payload };

  if (payload.name) {
    const slug = slugify(payload.name);
    const existing = await prisma.category.findFirst({
      where: { AND: [{ id: { not: id } }, { OR: [{ name: payload.name }, { slug }] }] },
    });
    if (existing) {
      throw new AppError(httpStatus.CONFLICT, "A category with this name already exists");
    }
    data.slug = slug;
  }

  return prisma.category.update({ where: { id }, data });
};

const deleteCategory = async (id: string) => {
  await prisma.category.findUniqueOrThrow({ where: { id } });

  const gearItemCount = await prisma.gearItem.count({ where: { categoryId: id } });

  if (gearItemCount > 0) {
    throw new AppError(httpStatus.CONFLICT, "Cannot delete a category that still has gear items");
  }

  return prisma.category.delete({ where: { id } });
};

export const categoryService = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
