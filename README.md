المتطلبات:         Windows 10+ و Node.js LTS (22 أو أحدث)
تشغيل للتجربة:      npm install   ثم   npm start
بناء ملف exe:       npm run dist     (الناتج في فولدر dist/ ملف Qest x.x.x.exe)
مكان البيانات:      Documents\QestData\data.json
نسخ احتياطية:       Documents\QestData\backups\  (يومي تلقائي، آخر 30 يوم)
نقل بيانات قديمة:   من النسخة القديمة "نسخة احتياطية" ثم هنا "استعادة".


# How to build in Linux

docker run --rm -ti \
  --env ELECTRON_CACHE="/root/.cache/electron" \
  --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
  -v "$PWD":/project -w /project \
  -v ~/.cache/electron:/root/.cache/electron \
  -v ~/.cache/electron-builder:/root/.cache/electron-builder \
  electronuserland/builder:wine \
  /bin/bash -c "npm install && npm run dist"