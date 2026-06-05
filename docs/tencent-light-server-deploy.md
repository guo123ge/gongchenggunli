# 腾讯云轻量服务器部署手册

本文档适用于当前项目部署到腾讯云轻量应用服务器。

## 当前服务器信息

- 服务器公网 IP：`124.221.103.75`
- 操作系统：OpenCloudOS 9
- 登录用户：`root`
- 地域：华东地区（上海）`ap-shanghai-5`
- 配置：2 核 CPU / 2GB 内存 / 50GB SSD
- DNS：腾讯云 DNSPod
- 域名解析：
  - `www.guo123guo.cn -> 124.221.103.75`
  - `guo123guo.cn -> 124.221.103.75`
- 端口：`22 / 80 / 443` 已放通
- 上传存储：先使用服务器本地 `uploads/`

## 备案状态说明

当前域名尚未完成备案。服务器位于中国大陆，正式通过域名对外提供网站服务前，应先完成 ICP 备案。

备案未通过前，建议仅使用公网 IP 做内部部署验证：

```text
http://124.221.103.75/login?callbackUrl=%2Fdashboard
```

备案通过后，再启用正式域名：

```text
https://www.guo123guo.cn/login?callbackUrl=%2Fdashboard
```

## 一、登录服务器

在本机终端执行：

```bash
ssh root@124.221.103.75
```

按提示输入服务器密码。

## 二、安装基础环境

```bash
dnf update -y
dnf install -y git nginx tar gzip
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs
npm install -g pm2
systemctl enable --now nginx
```

检查版本：

```bash
node -v
npm -v
pm2 -v
nginx -v
```

## 三、拉取项目代码

```bash
mkdir -p /www
cd /www
git clone https://github.com/guo123ge/gongchenggunli.git
cd /www/gongchenggunli
```

如果服务器上已经存在项目目录，使用更新方式：

```bash
cd /www/gongchenggunli
git pull
```

## 四、创建生产环境变量

先生成随机密钥：

```bash
openssl rand -base64 32
```

创建 `.env.production`：

```bash
cat > .env.production <<'EOF'
NEXTAUTH_SECRET=请替换为上一步生成的随机密钥
NEXTAUTH_URL=http://124.221.103.75
PUBLIC_PRIMARY_DOMAIN=http://124.221.103.75
PUBLIC_SECONDARY_DOMAIN=
UPLOAD_DIR=/www/gongchenggunli/uploads
OPENAI_API_KEY=
DATA_BACKEND=json
EOF
```

创建上传目录：

```bash
mkdir -p /www/gongchenggunli/uploads
```

## 五、安装依赖并构建

```bash
npm install
npm run build
```

如果服务器 2GB 内存构建较慢，可以先加临时交换分区：

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

## 六、使用 PM2 常驻运行

```bash
pm2 start npm --name gongchenggunli -- start
pm2 save
pm2 startup
```

`pm2 startup` 会输出一条需要再次执行的命令，请复制那条命令并执行一次，用于开机自启。

查看运行状态：

```bash
pm2 status
pm2 logs gongchenggunli
```

## 七、配置 Nginx 反向代理

```bash
cat > /etc/nginx/conf.d/gongchenggunli.conf <<'EOF'
server {
    listen 80;
    server_name 124.221.103.75 www.guo123guo.cn guo123guo.cn;

    client_max_body_size 100m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF
```

检查并重载：

```bash
nginx -t
systemctl reload nginx
```

## 八、验证部署

服务器本机验证：

```bash
curl -I http://127.0.0.1:3000/api/health
```

公网验证：

```bash
curl -I http://124.221.103.75/api/health
```

浏览器访问：

```text
http://124.221.103.75/login?callbackUrl=%2Fdashboard
```

## 九、后续更新流程

以后本地推送新代码到 GitHub 后，服务器上执行：

```bash
cd /www/gongchenggunli
git pull
npm install
npm run build
pm2 restart gongchenggunli
```

## 十、备案通过后的域名与 HTTPS

备案通过后，更新 `.env.production`：

```bash
NEXTAUTH_URL=https://www.guo123guo.cn
PUBLIC_PRIMARY_DOMAIN=https://www.guo123guo.cn
```

然后配置 HTTPS 证书。证书可使用腾讯云 SSL 证书，也可使用自动证书工具。配置 HTTPS 后，建议将 `guo123guo.cn` 自动跳转到 `www.guo123guo.cn`。

## 十一、当前未完成事项

- 备案未通过前，不建议正式开放域名访问。
- 当前上传文件保存在服务器本地 `uploads/`，后续资料量变大后可切换腾讯云 COS。
- 当前默认数据后端为 `json`，正式多人长期使用建议升级 PostgreSQL。
