/*Genera una preview del mail de verificacion con un link de ejemplo (sin necesidad de enviar un mail real)*/
import { readFileSync, writeFileSync } from 'node:fs'

const src = readFileSync('./src/utils/email-templates/verification-email.template.js', 'utf8')

//Extraemos el html de la plantilla entre "html: `" y el cierre "`"
const start = src.indexOf("html: `") + "html: `".length
const end = src.indexOf("`\n        }", start)
const mail_html = src.slice(start, end)

//Reemplazamos el link por uno de ejemplo
const preview_url = 'http://localhost:5173/verify-email?verification_token=TOKEN_EJEMPLO_123'
const html_with_url = mail_html.replace(/http:\/\/localhost:5173\/verify-email\?verification_token=[^']+/g, preview_url)

const preview = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Preview: mail de verificacion</title></head>
<body style="margin:0">
<div style="background:#fff3cd;color:#856404;padding:10px;text-align:center;font-family:Arial;font-size:13px">
    PREVIEW: el mail se muestra con un link de ejemplo
</div>
${html_with_url}
</body>
</html>
`

writeFileSync('mail-preview.html', preview)
console.log('Preview generada en backend/mail-preview.html')
