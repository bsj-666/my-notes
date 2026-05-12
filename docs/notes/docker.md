---
title: Docker
date: 2026-05-11
tags:
  - Docker
summary: 记录 Docker Desktop操作
---

# Docker

## Docker Desktop

![](./images/image-20260507165015026.png)

### 找不到 Docker 映像存储文件夹

![image-20260511160944792](images/image-20260511160944792.png)





## docker使用

### docker使用教程

https://www.runoob.com/docker/

### WSL2中使用docker修改nginx配置

首先将nginx容器的文件（html,conf,log等）挂载到本地的目录下，**/mnt/d/Docker/data/nginx/html**   （这个目录是wsl）

```bash
docker cp nginx:/usr/share/nginx/html /mnt/d/Docker/data/nginx/html

docker cp nginx:/var/log/nginx /mnt/d/Docker/data/nginx/logs

docker cp nginx:/etc/nginx /mnt/d/Docker/data/nginx/conf
```

删除之前的nginx容器 

```bash
docker rm nginx
```

重新新建nginx容器

```bash
docker run -d \
  --name nginx \
  -p 8080:80 \
  -v /mnt/d/Docker/data/nginx/conf:/etc/nginx:ro \
  -v /mnt/d/Docker/data/nginx/html:/usr/share/nginx/html \
  -v /mnt/d/Docker/data/nginx/logs:/var/log/nginx \
  nginx:latest
  
  -v  ....:ro   只读挂载  即使你在容器内执行了破坏性命令，也不会影响到挂载中的源文件。
  -v            读写挂载（网页和日志）
  
```

- 容器内的 `/etc/nginx` 会映射到 Windows 的 `D:\Docker\data\nginx\conf`
- 你在 Windows 中编辑配置文件，容器内**立即生效**（但需要重载 Nginx）

```bash
docker exec nginx nginx -s reload     重载Nginx
```

实时同步的工作流程

```
Windows 编辑文件
       ↓
D:\Docker\data\nginx\conf\nginx.conf
       ↓ (通过 -v 挂载)
容器内 /etc/nginx/nginx.conf
       ↓ (执行 nginx -s reload)
Nginx 容器使用新配置
```



## 容器、镜像迁移问题

![](./images/image-20260507165015026.png)
