const slugify = require('slugify');
const prisma = require('../utils/prismaClient');
const { success, failure } = require('../utils/apiResponse');
const { validateCategory } = require('../validators/productValidators');

async function listCategories(req, res, next) {
  try {
    const { includeInactive } = req.query;
    const where = includeInactive === 'true' ? {} : { isActive: true };
    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    return success(res, 'Categories fetched successfully', { categories });
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const { valid, errors } = validateCategory(req.body);
    if (!valid) return failure(res, 'Please fix the errors in the form', 422, errors);

    const { name, description } = req.body;
    const slug = slugify(name, { lower: true, strict: true });

    const existing = await prisma.category.findFirst({ where: { OR: [{ name }, { slug }] } });
    if (existing) return failure(res, 'A category with this name already exists', 409);

    const category = await prisma.category.create({ data: { name: name.trim(), slug, description } });
    return success(res, 'Category created successfully', { category }, 201);
  } catch (err) {
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return failure(res, 'Category not found', 404);

    let data = { description, isActive };
    if (name && name.trim() !== category.name) {
      const slug = slugify(name, { lower: true, strict: true });
      const conflict = await prisma.category.findFirst({
        where: { OR: [{ name }, { slug }], NOT: { id } },
      });
      if (conflict) return failure(res, 'A category with this name already exists', 409);
      data = { ...data, name: name.trim(), slug };
    }

    const updated = await prisma.category.update({ where: { id }, data });
    return success(res, 'Category updated successfully', { category: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) return failure(res, 'Category not found', 404);

    if (category._count.products > 0) {
      return failure(
        res,
        `Cannot delete this category — ${category._count.products} product(s) are assigned to it. Reassign or remove them first.`,
        409
      );
    }

    await prisma.category.delete({ where: { id } });
    return success(res, 'Category deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
