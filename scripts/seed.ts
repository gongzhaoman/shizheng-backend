import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

// 复制您的虚拟数据生成函数和数据
interface Project {
  id: number;
  name: string;
}

// 这里复制您的generateMockProjects函数...
const generateMockProjects = (): Project[] => {
  const projectTypes = [
    '道路改建工程',
    '人行天桥新建工程',
    '公路升级工程',
    '桥梁维修工程',
    '隧道建设工程',
    '排水设施改造工程',
    '公交站台建设工程',
    '交通信号灯安装工程',
    '城市绿化工程',
    '管网改造工程',
  ];

  const locations = [
    '综合大道西延长线',
    '钟祥市安陆府路',
    '东湖高新区光谷大道',
    '武汉市江汉路',
    '荆州市沙市区',
    '十堰市茅箭区',
    '宜昌市夷陵区',
    '襄阳市樊城区',
    '黄石市下陆区',
    '鄂州市鄂城区',
    '孝感市孝南区',
    '黄冈市黄州区',
    '咸宁市咸安区',
    '随州市曾都区',
    '恩施市',
    '仙桃市',
    '潜江市',
    '天门市',
    '神农架林区',
  ];

  const projects: Project[] = [];

  // 常规项目数据
  for (let i = 1; i <= 10000; i++) {
    const locationIndex = Math.floor(Math.random() * locations.length);
    const typeIndex = Math.floor(Math.random() * projectTypes.length);

    projects.push({
      id: i,
      name: `${locations[locationIndex]}${projectTypes[typeIndex]}`,
    });
  }

  // 添加特殊测试数据
  for (let i = 1; i <= 15; i++) {
    projects.push({
      id: 10000 + i,
      name: `测试1页 样例项目${i}号`,
    });
  }

  for (let i = 1; i <= 30; i++) {
    projects.push({
      id: 11000 + i,
      name: `测试2页 样例项目${i}号`,
    });
  }

  for (let i = 1; i <= 50; i++) {
    projects.push({
      id: 12000 + i,
      name: `测试3页 样例项目${i}号`,
    });
  }

  for (let i = 1; i <= 70; i++) {
    projects.push({
      id: 13000 + i,
      name: `测试4页 样例项目${i}号`,
    });
  }

  for (let i = 1; i <= 90; i++) {
    projects.push({
      id: 14000 + i,
      name: `测试5页 样例项目${i}号`,
    });
  }

  for (let i = 1; i <= 110; i++) {
    projects.push({
      id: 15000 + i,
      name: `测试6页 样例项目${i}号`,
    });
  }

  for (let i = 1; i <= 130; i++) {
    projects.push({
      id: 16000 + i,
      name: `测试7页 样例项目${i}号`,
    });
  }

  return projects;
};

async function main() {
  console.log('开始导入数据...');

  const projects = generateMockProjects();

  // 清空现有数据
  await prisma.project.deleteMany({});

  // 批量插入数据
  const chunkSize = 1000;
  for (let i = 0; i < projects.length; i += chunkSize) {
    const chunk = projects.slice(i, i + chunkSize);
    await prisma.project.createMany({
      data: chunk,
    });
    console.log(`已导入 ${i + chunk.length} / ${projects.length} 条记录`);
  }

  console.log('数据导入完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
