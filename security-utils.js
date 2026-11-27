/* =========================================================
   Cámara de Construcción Falcón — Utilidades de Seguridad y UI
   ========================================================= */
(function (globalScope) {
  "use strict";

  // Caracteres de control ASCII, marcas bidireccionales (Trojan Source) e invisibles
  var RE_CONTROL_UNSAFE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200D\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;
  var RE_ESQUEMA_PELIGROSO = /(?:javascript|vbscript|data\s*:\s*text\/html)\s*:/i;
  var RE_EVENTO_HTML = /\bon[a-z]{2,15}\s*=/i;
  var RE_EMAIL_ESTRICTO = /^[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,24}$/;
  var RE_FECHA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
  var RE_TELEFONO_SEGURO = /^\+?[0-9][0-9\s().-]{6,17}$/;
  var RE_CEDULA = /^[VEJPvejp]?-?[0-9]{6,10}$/;

  var STORAGE_PREFIJO = "ccf_sec_rate_";
  var tiemposApertura = new WeakMap();

  /**
   * Elimina caracteres de control e invisibles y recorta espacios.
   * Si multiline es true conserva saltos de línea simples; si es false colapsa espacios.
   */
  function limpiarTexto(valor, multiline) {
    if (valor === null || valor === undefined) return "";
    var texto = String(valor)
      .replace(RE_CONTROL_UNSAFE, "")
      .replace(/\r\n?/g, "\n");
    if (multiline) {
      texto = texto.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");
    } else {
      texto = texto.replace(/\s+/g, " ");
    }
    return texto.trim();
  }

  /**
   * Detecta delimitadores HTML/XSS o esquemas ejecutables en entradas de texto.
   */
  function tieneContenidoPeligroso(valor) {
    if (!valor) return false;
    var texto = String(valor);
    return (
      texto.indexOf("<") !== -1 ||
      texto.indexOf(">") !== -1 ||
      RE_ESQUEMA_PELIGROSO.test(texto) ||
      RE_EVENTO_HTML.test(texto)
    );
  }

  /**
   * Detecta prefijos de inyección de fórmulas en hojas de cálculo (CSV/Excel Injection).
   */
  function esPrefijoFormula(valor, opciones) {
    if (!valor) return false;
    var texto = String(valor).trim();
    if (!texto) return false;
    var opts = opciones || {};

    if (opts.esTelefono) {
      return !RE_TELEFONO_SEGURO.test(texto);
    }
    if (opts.multiline) {
      return (
        /^[=@\t\r]/.test(texto) ||
        /^[+-]\s*[0-9(=@]/.test(texto) ||
        /^[+-][A-Za-z]/.test(texto) ||
        /^[+-]\s*(?:cmd|sum|import|hyperlink|webservice)\b/i.test(texto)
      );
    }
    return /^[=+\-@\t\r]/.test(texto);
  }

  /**
   * Valida formato estricto de correo electrónico sin caracteres peligrosos ni puntos consecutivos.
   */
  function esCorreoValido(valor) {
    var correo = limpiarTexto(valor, false).toLowerCase();
    if (correo.length < 5 || correo.length > 120) return false;
    if (correo.indexOf("..") !== -1) return false;
    if (tieneContenidoPeligroso(correo)) return false;
    return RE_EMAIL_ESTRICTO.test(correo);
  }

  /**
   * Valida y normaliza una cédula venezolana (ej. V-12345678).
   */
  function validarYNormalizarCedula(valor) {
    var limpia = limpiarTexto(valor, false).toUpperCase();
    if (!RE_CEDULA.test(limpia)) return { valida: false, valor: limpia };
    var soloDigitos = limpia.replace(/[^0-9]/g, "");
    if (/^0+$/.test(soloDigitos)) return { valida: false, valor: limpia };
    return { valida: true, valor: limpia };
  }

  /**
   * Parsea una fecha YYYY-MM-DD verificando que exista en el calendario real.
   */
  function parsearFechaISO(valor) {
    var limpia = limpiarTexto(valor, false);
    var m = RE_FECHA_ISO.exec(limpia);
    if (!m) return null;
    var anio = parseInt(m[1], 10);
    var mes = parseInt(m[2], 10);
    var dia = parseInt(m[3], 10);
    var fecha = new Date(anio, mes - 1, dia);
    if (
      fecha.getFullYear() !== anio ||
      fecha.getMonth() !== mes - 1 ||
      fecha.getDate() !== dia
    ) {
      return null;
    }
    return { fecha: fecha, anio: anio, mes: mes, dia: dia, iso: limpia };
  }

  /**
   * Valida una fecha de nacimiento dentro de un rango de edad realista.
   */
  function validarFechaNacimiento(valor, minEdad, maxEdad) {
    var parsed = parsearFechaISO(valor);
    if (!parsed) {
      return { valida: false, mensaje: "Ingrese una fecha de nacimiento válida." };
    }

    var hoy = new Date();
    var hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    if (parsed.fecha > hoySinHora) {
      return { valida: false, mensaje: "La fecha de nacimiento no puede ser futura." };
    }

    var edad = hoySinHora.getFullYear() - parsed.anio;
    var cumpleEsteAnio =
      hoySinHora.getMonth() > parsed.mes - 1 ||
      (hoySinHora.getMonth() === parsed.mes - 1 && hoySinHora.getDate() >= parsed.dia);
    if (!cumpleEsteAnio) edad -= 1;

    var min = typeof minEdad === "number" ? minEdad : 14;
    var max = typeof maxEdad === "number" ? maxEdad : 110;
    if (edad < min) {
      return { valida: false, mensaje: "Debe ser mayor de " + min + " años para registrarse." };
    }
    if (edad > max) {
      return { valida: false, mensaje: "Verifique el año de nacimiento ingresado." };
    }
    return { valida: true, iso: parsed.iso };
  }

  /**
   * Valida fecha de solicitud reciente (desde 2024 hasta mañana para tolerar zonas horarias).
   */
  function validarFechaSolicitud(valor) {
    var parsed = parsearFechaISO(valor);
    if (!parsed) {
      return { valida: false, mensaje: "Ingrese una fecha de solicitud válida." };
    }
    var minFecha = new Date(2024, 0, 1);
    var maxFecha = new Date();
    maxFecha.setDate(maxFecha.getDate() + 1);
    maxFecha.setHours(23, 59, 59, 999);
    if (parsed.fecha < minFecha || parsed.fecha > maxFecha) {
      return { valida: false, mensaje: "La fecha de solicitud debe corresponder a un período vigente." };
    }
    return { valida: true, iso: parsed.iso };
  }

  /**
   * Valida un año de 4 dígitos dentro de [minAnio, añoActual].
   */
  function validarAnio(valor, minAnio) {
    var limpia = limpiarTexto(valor, false);
    if (!/^[0-9]{4}$/.test(limpia)) return false;
    var n = parseInt(limpia, 10);
    var min = typeof minAnio === "number" ? minAnio : 1940;
    var max = new Date().getFullYear();
    return n >= min && n <= max;
  }

  /**
   * Valida un número entero positivo dentro de [min, max].
   */
  function validarEntero(valor, min, max) {
    var limpia = limpiarTexto(valor, false);
    if (!/^[0-9]+$/.test(limpia)) return null;
    var n = parseInt(limpia, 10);
    if (n < min || n > max) return null;
    return n;
  }

  /**
   * Valida que todos los elementos seleccionados pertenezcan a una lista blanca permitida.
   */
  function validarListaBlanca(valores, permitidos) {
    if (!Array.isArray(valores)) return false;
    var setPermitidos = new Set(permitidos);
    for (var i = 0; i < valores.length; i++) {
      if (!setPermitidos.has(valores[i])) return false;
    }
    return true;
  }

  /**
   * Valida un campo de texto genérico aplicando longitud, patrón, anti-XSS y anti-CSV-injection.
   */
  function validarTextoSeguro(valor, opts) {
    var o = opts || {};
    var limpia = limpiarTexto(valor, Boolean(o.multiline));

    if (o.requerido && limpia.length === 0) {
      return { valido: false, valor: limpia, mensaje: "Este campo es obligatorio." };
    }
    if (!o.requerido && limpia.length === 0) {
      return { valido: true, valor: limpia, mensaje: "" };
    }
    if (tieneContenidoPeligroso(limpia)) {
      return {
        valido: false,
        valor: limpia,
        mensaje: "No se permiten etiquetas HTML (< >) ni scripts."
      };
    }
    if (esPrefijoFormula(limpia, { esTelefono: o.esTelefono, multiline: o.multiline })) {
      return {
        valido: false,
        valor: limpia,
        mensaje: o.mensajeError || "El texto no puede iniciar con caracteres especiales (=, +, -, @)."
      };
    }
    if (o.min && limpia.length < o.min) {
      return { valido: false, valor: limpia, mensaje: "Mínimo " + o.min + " caracteres." };
    }
    if (o.max && limpia.length > o.max) {
      return { valido: false, valor: limpia, mensaje: "Máximo " + o.max + " caracteres." };
    }
    if (o.patron && !o.patron.test(limpia)) {
      return { valido: false, valor: limpia, mensaje: o.mensajeError || "Formato inválido." };
    }
    return { valido: true, valor: limpia, mensaje: "" };
  }

  /* =========================================================
     ANTI-BOT Y LIMITACIÓN DE TASA EN CLIENTE
     ========================================================= */
  function marcarInicioFormulario(form) {
    if (!form) return;
    tiemposApertura.set(form, Date.now());
  }

  function leerHistorialEnvios(clave) {
    var ahora = Date.now();
    var lista = [];
    try {
      var raw = globalScope.localStorage
        ? globalScope.localStorage.getItem(STORAGE_PREFIJO + clave)
        : null;
      if (!raw && globalScope.sessionStorage) {
        raw = globalScope.sessionStorage.getItem(STORAGE_PREFIJO + clave);
      }
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          lista = parsed.filter(function (ts) {
            return typeof ts === "number" && ts > 0 && ts <= ahora;
          });
        }
      }
    } catch (_) {
      lista = [];
    }
    return lista;
  }

  function guardarHistorialEnvios(clave, lista) {
    var serializado = JSON.stringify(lista);
    try {
      if (globalScope.localStorage) {
        globalScope.localStorage.setItem(STORAGE_PREFIJO + clave, serializado);
      }
    } catch (_) { /* ignore storage restrictions */ }
    try {
      if (globalScope.sessionStorage) {
        globalScope.sessionStorage.setItem(STORAGE_PREFIJO + clave, serializado);
      }
    } catch (_) { /* ignore storage restrictions */ }
  }

  function verificarAntiBot(form, opciones) {
    var opts = opciones || {};
    var hp = form ? form.querySelector("[data-honeypot]") : null;
    if (hp && String(hp.value || "").trim().length > 0) {
      return { ok: false, silencioso: true, razon: "honeypot" };
    }

    var inicio = form ? tiemposApertura.get(form) : null;
    var minMs = typeof opts.minMs === "number" ? opts.minMs : 2500;
    if (inicio && Date.now() - inicio < minMs) {
      return {
        ok: false,
        silencioso: false,
        mensaje: "Por favor, verifica tus datos con calma antes de enviar el formulario."
      };
    }

    if (opts.claveLimite) {
      var ahora = Date.now();
      var cooldownMs = typeof opts.cooldownMs === "number" ? opts.cooldownMs : 30000;
      var ventanaMs = typeof opts.ventanaMs === "number" ? opts.ventanaMs : 600000;
      var maxEnVentana = typeof opts.maxEnVentana === "number" ? opts.maxEnVentana : 5;
      var recientes = leerHistorialEnvios(opts.claveLimite).filter(function (ts) {
        return ahora - ts < ventanaMs;
      });
      if (recientes.length > 0 && ahora - recientes[recientes.length - 1] < cooldownMs) {
        return {
          ok: false,
          silencioso: false,
          mensaje: "Acabas de enviar un registro. Espera unos segundos antes de enviar otro."
        };
      }
      if (recientes.length >= maxEnVentana) {
        return {
          ok: false,
          silencioso: false,
          mensaje: "Has alcanzado el límite temporal de envíos. Inténtalo más tarde."
        };
      }
    }

    return { ok: true };
  }

  function registrarEnvioExitoso(claveLimite) {
    if (!claveLimite) return;
    var ahora = Date.now();
    var recientes = leerHistorialEnvios(claveLimite).filter(function (ts) {
      return ahora - ts < 600000;
    });
    recientes.push(ahora);
    guardarHistorialEnvios(claveLimite, recientes);
  }

  /* =========================================================
     INTERFAZ DE USUARIO SEGURA (SIN innerHTML)
     ========================================================= */
  function inicializarMenuMovil() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var abierto = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!abierto));
      toggle.setAttribute("aria-label", abierto ? "Abrir menú" : "Cerrar menú");
      nav.classList.toggle("is-open", !abierto);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });

    document.addEventListener("click", function (e) {
      if (
        nav.classList.contains("is-open") &&
        !nav.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    var mq = window.matchMedia("(min-width: 901px)");
    if (mq && typeof mq.addEventListener === "function") {
      mq.addEventListener("change", function (e) {
        if (e.matches) {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }
  }

  function inicializarHeaderScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var alDesplazar = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    alDesplazar();
    window.addEventListener("scroll", alDesplazar, { passive: true });
  }

  function inicializarReveal() {
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var elementos = document.querySelectorAll(".reveal");
    if (!elementos.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      elementos.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var observador = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("is-visible");
            observador.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    elementos.forEach(function (el) { observador.observe(el); });
  }

  function inicializarAnio() {
    var anio = document.querySelector("[data-anio]");
    if (anio) anio.textContent = String(new Date().getFullYear());
  }

  function obtenerContenedorError(campo) {
    var contenedor = campo.closest(".campo") || campo.parentElement;
    var errorEl = contenedor.querySelector(".error-msg");
    if (!errorEl) {
      errorEl = document.createElement("span");
      errorEl.className = "error-msg";
      errorEl.setAttribute("role", "alert");
      contenedor.appendChild(errorEl);
    }
    return errorEl;
  }

  function mostrarErrorCampo(campo, mensaje) {
    if (!campo) return;
    var cont = obtenerContenedorError(campo);
    cont.textContent = mensaje || "";
    if (mensaje) {
      campo.classList.add("input-invalido");
      campo.setAttribute("aria-invalid", "true");
    } else {
      campo.classList.remove("input-invalido");
      campo.removeAttribute("aria-invalid");
    }
  }

  function limpiarErroresFormulario(form) {
    if (!form) return;
    form.querySelectorAll(".error-msg").forEach(function (el) { el.textContent = ""; });
    form.querySelectorAll(".input-invalido").forEach(function (campo) {
      campo.classList.remove("input-invalido");
      campo.removeAttribute("aria-invalid");
    });
    form.querySelectorAll("[aria-invalid]").forEach(function (campo) {
      campo.removeAttribute("aria-invalid");
    });
    form.querySelectorAll("[data-error-grupo]").forEach(function (el) { el.textContent = ""; });
  }

  function prepararAvisoError(form) {
    var aviso = form.parentElement.querySelector(".aviso-error");
    if (!aviso) {
      aviso = document.createElement("div");
      aviso.className = "aviso-error";
      aviso.setAttribute("role", "alert");
      aviso.tabIndex = -1;
      form.parentElement.insertBefore(aviso, form);
    }
    return aviso;
  }

  function irAlInicioDelModal(form) {
    var caja = form.closest(".modal");
    var cuerpo = caja && caja.querySelector(".modal__cuerpo");
    if (cuerpo) cuerpo.scrollTop = 0;
  }

  function mostrarErrorEnvio(form, mensaje) {
    var aviso = prepararAvisoError(form);
    aviso.textContent = "";
    var titulo = document.createElement("strong");
    titulo.textContent = "No se pudo enviar";
    var texto = document.createElement("p");
    texto.textContent = mensaje;
    aviso.appendChild(titulo);
    aviso.appendChild(texto);
    aviso.classList.add("is-visible");
    aviso.focus();
    irAlInicioDelModal(form);
  }

  function ocultarErrorEnvio(form) {
    var aviso = form.parentElement.querySelector(".aviso-error");
    if (aviso) aviso.classList.remove("is-visible");
  }

  function mostrarExito(form) {
    ocultarErrorEnvio(form);
    limpiarErroresFormulario(form);
    // Limpia datos personales de memoria del DOM inmediatamente al completar el envío
    form.reset();
    var caja = form.closest(".modal");
    var aviso = caja && caja.querySelector(".aviso-exito");
    form.classList.add("is-hidden");
    if (aviso) {
      aviso.classList.add("is-visible");
      aviso.setAttribute("tabindex", "-1");
      if (!aviso.querySelector(".aviso-exito__cerrar")) {
        var cerrar = document.createElement("button");
        cerrar.type = "button";
        cerrar.className = "aviso-exito__cerrar btn btn--primario mt-1";
        cerrar.textContent = "Cerrar";
        cerrar.addEventListener("click", function () {
          var botonCerrar = caja.querySelector("[data-modal-cerrar]");
          if (botonCerrar) botonCerrar.click();
        });
        aviso.appendChild(cerrar);
      }
      aviso.focus();
    }
    irAlInicioDelModal(form);
  }

  function bloquearEnvio(form) {
    var btn = form.querySelector("[type='submit']");
    if (btn) {
      if (!btn.getAttribute("data-texto")) btn.setAttribute("data-texto", btn.textContent);
      btn.disabled = true;
      btn.setAttribute("aria-disabled", "true");
      btn.textContent = "Enviando…";
    }
    form.setAttribute("aria-busy", "true");
  }

  function liberarEnvio(form) {
    var btn = form.querySelector("[type='submit']");
    if (btn) {
      var texto = btn.getAttribute("data-texto");
      if (texto) btn.textContent = texto;
      btn.disabled = false;
      btn.removeAttribute("aria-disabled");
    }
    form.removeAttribute("aria-busy");
  }

  function inicializarModales(opciones) {
    var opts = opciones || {};
    var overlay = document.querySelector("[data-modal-overlay]");
    var modales = document.querySelectorAll(".modal");
    var modalAbierto = null;
    if (!overlay || !modales.length) return;

    var abrirModal = function (id) {
      var m = document.getElementById(id);
      if (!m) return;
      if (modalAbierto && modalAbierto !== m) {
        modalAbierto.classList.remove("is-open");
        modalAbierto.setAttribute("aria-hidden", "true");
      }
      modalAbierto = m;
      m.classList.add("is-open");
      m.setAttribute("aria-hidden", "false");
      overlay.classList.add("is-visible");
      document.body.classList.add("modal-abierto");
      var form = m.querySelector("[data-formulario]");
      if (form) {
        marcarInicioFormulario(form);
        if (typeof opts.onOpen === "function") opts.onOpen(form, m);
      }
      var btn = m.querySelector("[data-modal-cerrar]");
      if (btn) btn.focus();
    };

    var restaurarModal = function (modal) {
      var form = modal.querySelector("[data-formulario]");
      if (form) {
        form.reset();
        form.classList.remove("is-hidden");
        limpiarErroresFormulario(form);
        ocultarErrorEnvio(form);
        liberarEnvio(form);
        form.removeAttribute("data-enviando");
        if (typeof opts.onReset === "function") opts.onReset(form, modal);
      }
      var aviso = modal.querySelector(".aviso-exito");
      if (aviso) aviso.classList.remove("is-visible");
      var cuerpo = modal.querySelector(".modal__cuerpo");
      if (cuerpo) cuerpo.scrollTop = 0;
    };

    var cerrarModal = function () {
      if (!modalAbierto) return;
      if (modalAbierto.querySelector("[data-enviando='1']")) return;
      restaurarModal(modalAbierto);
      modalAbierto.classList.remove("is-open");
      modalAbierto.setAttribute("aria-hidden", "true");
      modalAbierto = null;
      overlay.classList.remove("is-visible");
      document.body.classList.remove("modal-abierto");
    };

    document.querySelectorAll("[data-modal-abrir]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        abrirModal(btn.getAttribute("data-modal-abrir"));
      });
    });

    document.querySelectorAll("[data-modal-cerrar]").forEach(function (btn) {
      btn.addEventListener("click", cerrarModal);
    });

    overlay.addEventListener("click", cerrarModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") cerrarModal();
    });

    // Higiene en equipos compartidos: limpiar formularios al abandonar la página
    window.addEventListener("pagehide", function () {
      document.querySelectorAll("[data-formulario]").forEach(function (form) {
        form.reset();
      });
    });
  }

  /**
   * Traduce errores de Supabase/RPC a mensajes seguros para el usuario sin filtrar esquema interno.
   */
  function mensajeErrorSeguro(err, fallback) {
    var msg = err && err.message ? String(err.message) : "";
    if (msg.indexOf("CCF_RATE_LIMIT") !== -1) {
      return "Se han detectado demasiados envíos recientes. Por favor espera unos minutos e inténtalo nuevamente.";
    }
    if (msg.indexOf("CCF_DUPLICATE") !== -1) {
      return "Ya recibimos una solicitud con estos datos recientemente.";
    }
    if (msg.indexOf("CCF_VALIDATION") !== -1) {
      return "Algunos datos ingresados no cumplen el formato requerido. Verifica el formulario e inténtalo de nuevo.";
    }
    if (msg.indexOf("CCF_TIMEOUT") !== -1) {
      return "La conexión tardó demasiado. Verifica tu internet e inténtalo de nuevo.";
    }
    return fallback || "No pudimos procesar tu registro. Revisa tu conexión e inténtalo de nuevo.";
  }

  var api = Object.freeze({
    limpiarTexto: limpiarTexto,
    tieneContenidoPeligroso: tieneContenidoPeligroso,
    esPrefijoFormula: esPrefijoFormula,
    esCorreoValido: esCorreoValido,
    validarYNormalizarCedula: validarYNormalizarCedula,
    parsearFechaISO: parsearFechaISO,
    validarFechaNacimiento: validarFechaNacimiento,
    validarFechaSolicitud: validarFechaSolicitud,
    validarAnio: validarAnio,
    validarEntero: validarEntero,
    validarListaBlanca: validarListaBlanca,
    validarTextoSeguro: validarTextoSeguro,
    marcarInicioFormulario: marcarInicioFormulario,
    verificarAntiBot: verificarAntiBot,
    registrarEnvioExitoso: registrarEnvioExitoso,
    inicializarMenuMovil: inicializarMenuMovil,
    inicializarHeaderScroll: inicializarHeaderScroll,
    inicializarReveal: inicializarReveal,
    inicializarAnio: inicializarAnio,
    inicializarModales: inicializarModales,
    mostrarErrorCampo: mostrarErrorCampo,
    limpiarErroresFormulario: limpiarErroresFormulario,
    mostrarErrorEnvio: mostrarErrorEnvio,
    ocultarErrorEnvio: ocultarErrorEnvio,
    mostrarExito: mostrarExito,
    bloquearEnvio: bloquearEnvio,
    liberarEnvio: liberarEnvio,
    mensajeErrorSeguro: mensajeErrorSeguro
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    Object.defineProperty(globalScope, "CCFSecurity", {
      value: api,
      writable: false,
      configurable: false,
      enumerable: false
    });
  }
})(typeof window !== "undefined" ? window : globalThis);
