import { Hono } from 'hono';
import { PrismaClient, Prisma } from '../../generated/prisma';
import redis from '../utils/redis';

const prisma = new PrismaClient();
const projects = new Hono();

// 缓存键生成函数
const getCacheKey = (page: number, pageSize: number, keyword: string) => {
  return `projects:${page}:${pageSize}:${keyword}`;
};

// GET /api/projects - 获取项目列表，支持分页和搜索
projects.get('/', async (c) => {
  const page = Number(c.req.query('page') || '1');
  const pageSize = Number(c.req.query('pageSize') || '20');
  const keyword = c.req.query('keyword') || '';

  // 尝试从缓存获取数据
  const cacheKey = getCacheKey(page, pageSize, keyword);
  const cachedData = await redis.get(cacheKey);

  if (cachedData) {
    return c.json(JSON.parse(cachedData));
  }

  // 准备查询条件
  const where = keyword
    ? {
        name: {
          contains: keyword,
          mode: Prisma.QueryMode.insensitive,
        },
      }
    : {};

  // 计算总数
  const totalCount = await prisma.project.count({ where });
  const totalPages = Math.ceil(totalCount / pageSize);

  // 获取当前页数据
  const data = await prisma.project.findMany({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { id: 'asc' },
  });

  // 转换数据，将真实ID替换为从1开始的序号
  const transformedData = data.map((project, index) => {
    // 计算当前项目在整个结果集中的序号
    const sequentialId = (page - 1) * pageSize + index + 1;

    // 创建一个新对象，保留原ID作为rawId，使用序号作为id
    return {
      id: sequentialId,
      name: project.name,
    };
  });

  const result = {
    data: transformedData,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages,
    },
  };

  // 将结果存入缓存，设置60秒过期
  await redis.set(cacheKey, JSON.stringify(result), 'EX', 60);

  return c.json(result);
});

export default projects;
