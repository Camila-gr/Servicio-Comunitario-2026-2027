/* =========================================================
   Genera supabase-config.js a partir del .env
   Uso:  npm run config
   ========================================================= */
require("dotenv").config({ quiet: true });

const fs = require("fs");
const path = require("path");

const url = (process.env.SUPABASE_URL || "").trim();
const key = (process.env.SUPABASE_ANON_KEY || "").trim();

const faltantes = [];
if (!url) faltantes.push("SUPABASE_URL");
if (!key) faltantes.push("SUPABASE_ANON_KEY");

if (faltantes.length) {
  console.error("ERROR: faltan variables en .env -> " + faltantes.join(", "));
  console.error("Copia .env.example a .env y completa los valores.");
  process.exit(1);
}

if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
  console.warn(
    "AVISO: SUPABASE_URL no tiene el formato https://<ref>.supabase.co. Revisa el .env."
  );
}

const contenido = `/* =========================================================
   Configuración Centralizada de Supabase

   ARCHIVO GENERADO — no editar a mano.
   Cambia los valores en .env y ejecuta:  npm run config
   ========================================================= */
(function () {
    "use strict";

    const SUPABASE_URL = ${JSON.stringify(url)};
    const SUPABASE_ANON_KEY = ${JSON.stringify(key)};

    if (window.supabase) {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error('La librería oficial de Supabase SDK no se cargó correctamente.');
    }
})();
`;

const destino = path.join(__dirname, "supabase-config.js");
fs.writeFileSync(destino, contenido, "utf8");
console.log("OK: supabase-config.js generado desde .env");
