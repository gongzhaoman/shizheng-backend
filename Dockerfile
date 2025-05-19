FROM node:18-alpine

WORKDIR /app

# 复制package.json和lock文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制配置文件
COPY tsconfig.json ./
COPY .env* ./
COPY prisma ./prisma/
COPY scripts ./scripts/

# 生成Prisma客户端
RUN npx prisma generate

# 复制源代码
COPY src ./src/

# 构建项目
RUN npm run build

# 创建启动脚本 - 使用单引号确保换行符正确
RUN printf '#!/bin/sh\necho "Running migrations..."\nnpx prisma migrate deploy\necho "Starting app..."\nnpm run start\n' > /app/start.sh && chmod +x /app/start.sh

# 暴露端口
EXPOSE 3000

# 使用启动脚本
CMD ["/bin/sh", "/app/start.sh"]