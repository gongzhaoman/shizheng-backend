import { Hono } from 'hono';
import { PrismaClient } from '../../generated/prisma';
import * as ExcelJS from 'exceljs';
import fs from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import redis from '../utils/redis';

const prisma = new PrismaClient();
const admin = new Hono();

// POST /api/admin/upload - 上传Excel并导入数据
admin.post('/upload', async (c) => {
  try {
    // 使用formData()解析multipart表单
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ success: false, message: '未找到上传的文件' }, 400);
    }

    // 检查文件类型
    if (
      ![
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ].includes(file.type)
    ) {
      return c.json(
        { success: false, message: '不支持的文件类型，仅支持.xls或.xlsx文件' },
        400,
      );
    }

    // 保存到临时文件
    const tempFilePath = join(tmpdir(), `upload-${Date.now()}.xlsx`);
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(tempFilePath, Buffer.from(buffer));

    const stats = {
      added: 0,
      updated: 0,
      total: 0,
    };

    try {
      // 处理Excel文件
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(tempFilePath);
      let worksheet = workbook.getWorksheet(1) || workbook.worksheets[0];

      if (!worksheet) {
        // 如果还是找不到，尝试读取所有工作表并选择第一个
        if (workbook.worksheets.length > 0) {
          worksheet = workbook.worksheets[0];
        } else {
          throw new Error('Excel文件中未找到工作表');
        }
      }

      // 处理数据，只读取第一列作为项目名称
      const promises: Promise<any>[] = [];
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === 1) return; // 跳过标题行

        // 读取第一列作为名称
        const name = row.getCell(1).value?.toString()?.trim();

        if (!name) return; // 跳过空名称

        // 创建新项目，使用数据库自增ID
        const promise = prisma.project
          .create({
            data: { name },
          })
          .then(() => {
            stats.added++;
            stats.total++;
          })
          .catch((e) => {
            console.error(`创建项目"${name}"失败:`, e);
          });

        promises.push(promise);
      });

      await Promise.all(promises);

      // 完成后删除临时文件
      fs.unlinkSync(tempFilePath);
      return c.json({ success: true, stats });
    } catch (error) {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw error;
    }
  } catch (error) {
    console.error('上传处理错误:', error);
    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '处理Excel文件时出错',
      },
      500,
    );
  }
});

// 清空所有项目记录
admin.delete('/projects/clear', async (c) => {
  try {
    // 删除所有项目记录
    const result = await prisma.project.deleteMany({});

    // 清除Redis中的projects相关缓存
    const keys = await redis.keys('projects:*');
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`清除了${keys.length}个缓存键`);
    }

    return c.json({
      success: true,
      message: `成功删除了${result.count}条项目记录，并清除了相关缓存`,
      count: result.count,
      cachedCleared: keys.length,
    });
  } catch (error) {
    console.error('清空项目记录失败:', error);
    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '清空项目记录时出错',
      },
      500,
    );
  }
});

export default admin;
