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

# 生成Prisma客户端
RUN npx prisma generate

# 复制源代码
COPY src ./src/

# 构建项目 - 确保这步成功执行
RUN npm run build && ls -la dist/

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "run", "start"]