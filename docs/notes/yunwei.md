#服务器jar包自启

在 Linux 服务器上部署 `.jar` 并设置**开机自启**，常见有 3 种方式。推荐用 **systemd（最规范）**。

# ✅ 方法一：使用 systemd（推荐 ⭐）

### 1️⃣ 创建服务文件

```bash
sudo vim /etc/systemd/system/myapp.service
```

### 2️⃣ 写入内容（按需修改）

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

### 3️⃣ 重新加载配置

```bash
sudo systemctl daemon-reexec   myfast
sudo systemctl daemon-reload
```

------

### 4️⃣ 启动服务

```bash
sudo systemctl start myapp
```

------

### 5️⃣ 设置开机自启

```bash
sudo systemctl enable myapp
```

------

### 6️⃣ 查看状态

```bash
sudo systemctl status myapp
```

