/* =========================================================
   Genera supabase-config.js seguro a partir de .env o
   Variables de Entorno de Vercel.
   Uso:  npm run config  /  npm run build
   ========================================================= */
try {
  require("dotenv").config({ quiet: true });
} catch (_) {
  // En entornos CI/Vercel donde ya existen variables de entorno, dotenv es opcional
}

const fs = require("fs");
const path = require("path");

const url = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
const key = (process.env.SUPABASE_ANON_KEY || "").trim();

const faltantes = [];
if (!url) faltantes.push("SUPABASE_URL");
if (!key) faltantes.push("SUPABASE_ANON_KEY");

if (faltantes.length) {
  console.error("ERROR: faltan variables -> " + faltantes.join(", "));
  console.error("En local: copia .env.example a .env y completa los valores.");
  console.error("En Vercel: agregalas en Project Settings -> Environment Variables.");
  process.exit(1);
}

if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
  console.warn(
    "AVISO: SUPABASE_URL no tiene el formato https://<ref>.supabase.co. Revisa la configuracion."
  );
}

const contenido = `/* =========================================================
   Configuración Centralizada y Segura de Supabase

   ARCHIVO GENERADO — no editar a mano.
   Cambia las variables en .env (local) o Vercel y ejecuta: npm run build
   ========================================================= */
(function (globalScope) {
  "use strict";

  var SUPABASE_URL = ${JSON.stringify(url)};
  var SUPABASE_ANON_KEY = ${JSON.stringify(key)};
  var TIMEOUT_MS = 15000;

  var RPCS_PERMITIDOS = Object.freeze({
    registrar_agremiado: true,
    registrar_censo_convenio: true,
    registrar_diagnostico_programa: true,
    registrar_postulacion_programa: true
  });

  var client = null;

  if (globalScope.supabase && typeof globalScope.supabase.createClient === "function") {
    client = globalScope.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  } else {
    console.error("No se pudo inicializar el cliente de Supabase.");
  }

  async function enviarRPC(nombreRpc, payload) {
    if (!client) {
      throw new Error("El servicio no está disponible en este momento.");
    }
    if (!Object.prototype.hasOwnProperty.call(RPCS_PERMITIDOS, nombreRpc)) {
      throw new Error("Operación no autorizada.");
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("Carga de datos inválida.");
    }

    var temporizador = null;
    var timeoutPromise = new Promise(function (_, reject) {
      temporizador = setTimeout(function () {
        reject(new Error("CCF_TIMEOUT"));
      }, TIMEOUT_MS);
    });

    try {
      var rpcPromise = client.rpc(nombreRpc, payload);
      var resultado = await Promise.race([rpcPromise, timeoutPromise]);
      if (resultado && resultado.error) {
        throw resultado.error;
      }
      return resultado ? resultado.data : null;
    } finally {
      if (temporizador) clearTimeout(temporizador);
    }
  }

  Object.defineProperty(globalScope, "CCFBackend", {
    value: Object.freeze({
      enviarRPC: enviarRPC,
      estaListo: function () { return Boolean(client); }
    }),
    writable: false,
    configurable: false,
    enumerable: false
  });
})(window);
`;

const destino = path.join(__dirname, "supabase-config.js");
fs.writeFileSync(destino, contenido, "utf8");
console.log("OK: supabase-config.js seguro generado correctamente.");
