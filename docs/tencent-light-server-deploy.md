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
- 上传存储：优先使用腾讯云 COS 私有桶，本地 `uploads/` 作为回退
- COS 存储桶：`gongchenggunli-001-1424037473`
- COS 地域：`ap-shanghai`
- COS 访问域名：`gongchenggunli-001-1424037473.cos.ap-shanghai.myqcloud.com`

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
TENCENT_COS_REGION=ap-shanghai
TENCENT_COS_BUCKET=gongchenggunli-001-1424037473
TENCENT_COS_PUBLIC_BASE_URL=https://gongchenggunli-001-1424037473.cos.ap-shanghai.myqcloud.com
TENCENT_COS_ACCESS_MODE=private
TENCENT_COS_SECRET_ID=请在服务器内填写子用户SecretId
TENCENT_COS_SECRET_KEY=请在服务器内填写子用户SecretKey
TENCENT_ASR_REGION=ap-shanghai
TENCENT_ASR_SECRET_ID=请在服务器内填写语音识别子用户SecretId
TENCENT_ASR_SECRET_KEY=请在服务器内填写语音识别子用户SecretKey
TENCENT_ASR_ENGINE_MODEL_TYPE=16k_zh
EOF
```

创建上传目录：

```bash
mkdir -p /www/gongchenggunli/uploads
```

如果启用腾讯云 COS 私有桶，`uploads` 目录仍建议保留作为回退目录。`TENCENT_COS_SECRET_ID` 和 `TENCENT_COS_SECRET_KEY` 只在服务器 `.env.production` 中填写，不要写入 Git 仓库，也不要发给他人。

如果启用腾讯云 ASR 语音识别，建议给 CAM 子用户增加一句话识别相关权限，并只在服务器 `.env.production` 中填写 `TENCENT_ASR_SECRET_ID` 和 `TENCENT_ASR_SECRET_KEY`。手机端上传 `m4a`、`mp3`、`wav` 音频更适合腾讯云识别；浏览器直接录制的 `webm` 会保留语音文件并提示格式暂不支持。

创建或修改 `.env.production` 后，可运行配置核对脚本。脚本只检查密钥是否填写，不会输出密钥内容：

```bash
npm run verify:production-config
```

本地也可以用示例文件检查变量结构：

```bash
ENV_FILE=.env.example npm run verify:production-config
```

用 `.env.example` 检查时，`NEXTAUTH_SECRET` 仍是示例占位值，出现该错误是正常的；生产服务器检查 `.env.production` 时必须修复。其他情况下，如果输出存在“错误”，应先修正后再构建和启动；如果只有“提醒”，表示系统可运行，但对应能力可能处于回退或待正式域名启用状态。

## 四点一、腾讯云 COS 私有桶设置

当前项目支持 COS 私有桶：

- 上传文件直接写入 COS。
- 系统保存站内访问地址，例如 `/api/storage/cos/文件名`。
- 用户打开资料时，由服务器生成 10 分钟有效的临时签名链接并跳转到 COS。
- COS 存储桶无需设置为公有读。

建议存储桶权限：

- 访问权限：私有读写。
- CAM 子用户权限：仅授予当前桶的上传、读取、查询对象权限。
- 不要使用主账号密钥。
- 不要把密钥提交到 GitHub。

本项目会在以下变量齐全时自动切换到 COS：

```env
TENCENT_COS_REGION=ap-shanghai
TENCENT_COS_BUCKET=gongchenggunli-001-1424037473
TENCENT_COS_PUBLIC_BASE_URL=https://gongchenggunli-001-1424037473.cos.ap-shanghai.myqcloud.com
TENCENT_COS_ACCESS_MODE=private
TENCENT_COS_SECRET_ID=服务器中填写
TENCENT_COS_SECRET_KEY=服务器中填写
```

`TENCENT_COS_ACCESS_MODE=private` 表示使用私有桶签名访问。若改成 `public`，系统会保存 COS 公开直链。

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
npm run verify:deployment-health
```

公网验证：

```bash
curl -I http://124.221.103.75/api/health
PUBLIC_URL=http://124.221.103.75 npm run verify:deployment-health
```

浏览器访问：

```text
http://124.221.103.75/login?callbackUrl=%2Fdashboard
```

如果备案后启用正式域名，可检查域名解析是否指向服务器公网 IP：

```bash
PUBLIC_URL=https://www.guo123guo.cn EXPECTED_HOST=124.221.103.75 npm run verify:deployment-health
```

## 九、后续更新流程

以后本地推送新代码到 GitHub 后，服务器上执行：

```bash
cd /www/gongchenggunli
git pull
npm install
npm run build
pm2 restart gongchenggunli
npm run verify:production-config
PUBLIC_URL=http://124.221.103.75 npm run verify:deployment-health
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
- 当前上传文件可写入腾讯云 COS 私有桶，若 COS 变量缺失则自动回退本地 `uploads/`。
- 当前默认数据后端为 `json`，正式多人长期使用建议升级 PostgreSQL。
