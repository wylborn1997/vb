#!/usr/bin/env bash
set -euo pipefail

IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
if [ -z "$IP" ]; then
  echo "无法获取局域网 IP，请手动创建 frontend/.env"
  exit 1
fi

cat > .env <<EOF
# 真机调试 API 地址（由 npm run env:lan 自动生成）
VITE_API_BASE_URL=http://${IP}:3000
EOF

echo "已写入 frontend/.env → http://${IP}:3000"
echo "请执行: npm run build:mp-weixin"
