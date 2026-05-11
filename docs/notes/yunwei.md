---
title: 运维
date: 2026-05-04
tags:
  - 运维
  - Linux
  - 服务部署
summary: 收录 Linux 服务自启、时间漂移修复等常见运维操作记录。
---

# 运维

## 一、服务器jar包自启

在 Linux 服务器上部署 `.jar` 并设置**开机自启**，常见有 3 种方式。推荐用 **systemd（最规范）**。

### ✅ 方法一：使用 systemd（推荐 ⭐）

#### 1️⃣ 创建服务文件

```bash
sudo vim /etc/systemd/system/myapp.service
```

#### 2️⃣ 写入内容（按需修改）

```ini
[Unit]
Description=My Java App
After=network.target

[Service]
User=root
WorkingDirectory=/home/youruser/app
ExecStart=/usr/bin/java -jar /home/youruser/app/your-app.jar
SuccessExitStatus=143
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

------

#### 3️⃣ 重新加载配置

```bash
sudo systemctl daemon-reexec   myfast
sudo systemctl daemon-reload
```

------

#### 4️⃣ 启动服务

```bash
sudo systemctl start myapp
```

------

#### 5️⃣ 设置开机自启

```bash
sudo systemctl enable myapp
```

------

#### 6️⃣ 查看状态

```bash
sudo systemctl status myapp
```



## 二、服务器时间漂移问题

### 1. 先把时区改对（改成UTC，或者保持Asia/Shanghai但时间要对应）

既然现实中是 **3月19日 19:41（北京时间）**，对应的UTC时间是 **3月19日 11:41**。

你有两种改法：

#### **方案A：保持Asia/Shanghai时区，手动设置北京时间（推荐，符合使用习惯）**

```bash
# 时区已经是对的（Asia/Shanghai），我们只需要把时间改成正确的北京时间
sudo date -s "2026-03-19 19:41:00"

# 写入硬件时钟
sudo hwclock --systohc

# 验证
date  # 应该显示 五 2026-03-19 19:41:xx CST
```

#### **方案B：改成UTC时区（服务器标准做法，但你要习惯看UTC时间）**

```bash
# 先把时区改成UTC
sudo timedatectl set-timezone UTC

# 然后设置UTC时间（现实中19:41北京时间 = 11:41 UTC）
sudo date -s "2026-03-19 11:41:00"

# 写入硬件时钟
sudo hwclock --systohc

# 验证
date  # 应该显示 四 2026-03-19 11:41:xx UTC
timedatectl  # 会显示 Time zone: UTC
```

### 2. 验证最终结果

执行完上述命令后，用以下命令确认：

```bash
# 查看当前系统时间
date

# 查看硬件时间（应该和系统UTC时间一致或差8小时取决于设置）
sudo hwclock --show

# 查看完整状态
timedatectl
```
