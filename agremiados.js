/* =========================================================
   Cámara de Construcción Falcón — Agremiados (Supabase RPC Seguro)
   ========================================================= */
(function () {
  "use strict";

  var sec = window.CCFSecurity;
  var backend = window.CCFBackend;
  if (!sec || !backend) return;

  sec.inicializarMenuMovil();
  sec.inicializarHeaderScroll();
  sec.inicializarReveal();
  sec.inicializarAnio();

  var PATRONES = {
    nombre: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ][a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]{2,79}$/,
    rifEmpresa: /^[JVEjve]-?[0-9]{8,9}-?[0-9]?$/,
    rifNegocio: /^[Jj]-?[0-9]{8,9}-?[0-9]?$/,
    rifPersonal: /^[VEve]-?[0-9]{8,9}-?[0-9]?$/,
    registro: /^[0-9A-Za-zÁÉÍÓÚáéíóúÑÑüÜ][0-9A-Za-zÁÉÍÓÚáéíóúÑÑüÜ\-/.\s]{4,39}$/,
    textoAcademico: /^[0-9A-Za-zÁÉÍÓÚáéíóúÑÑüÜ][0-9A-Za-zÁÉÍÓÚáéíóúÑÑüÜ.,'()/\-\s]{2,149}$/
  };

  var reglasFormulario = {
    empresa: [
      { name: "emp-nombre", tipo: "texto", min: 3, max: 80, patron: PATRONES.nombre, mensajeError: "Ingrese nombre y apellido válidos (solo letras, mínimo 3 caracteres)." },
      { name: "emp-cedula", tipo: "cedula", mensajeError: "Cédula inválida. Formato: V-12345678." },
      { name: "emp-nacimiento", tipo: "fechaNacimiento", minEdad: 18, maxEdad: 110 },
      { name: "emp-correo", tipo: "correo", mensajeError: "Ingrese un correo electrónico válido." },
      { name: "emp-rif", tipo: "rif", patron: PATRONES.rifEmpresa, mensajeError: "RIF inválido. Formato: J-12345678-9." },
      { name: "emp-registro", tipo: "texto", min: 5, max: 40, patron: PATRONES.registro, mensajeError: "Ingrese un registro mercantil válido (mínimo 5 caracteres)." }
    ],
    profesional: [
      { name: "pro-nombre", tipo: "texto", min: 3, max: 80, patron: PATRONES.nombre, mensajeError: "Ingrese nombre y apellido válidos (solo letras, mínimo 3 caracteres)." },
      { name: "pro-cedula", tipo: "cedula", mensajeError: "Cédula inválida. Formato: V-12345678." },
      { name: "pro-nacimiento", tipo: "fechaNacimiento", minEdad: 18, maxEdad: 110 },
      { name: "pro-correo", tipo: "correo", mensajeError: "Ingrese un correo electrónico válido." },
      { name: "pro-rif", tipo: "rif", patron: PATRONES.rifPersonal, mensajeError: "RIF personal inválido. Formato: V-12345678-9." },
      { name: "pro-profesion", tipo: "texto", min: 3, max: 100, patron: PATRONES.textoAcademico, mensajeError: "Ingrese una profesión válida (mínimo 3 caracteres)." },
      { name: "pro-institucion", tipo: "texto", min: 3, max: 150, patron: PATRONES.textoAcademico, mensajeError: "Ingrese el nombre de la institución universitaria." },
      { name: "pro-anio-graduacion", tipo: "anio", minAnio: 1940, mensajeError: "Año de graduación inválido (entre 1940 y el año actual)." }
    ],
    proveedor: [
      { name: "prov-nombre", tipo: "texto", min: 3, max: 80, patron: PATRONES.nombre, mensajeError: "Ingrese nombre y apellido válidos (solo letras, mínimo 3 caracteres)." },
      { name: "prov-cedula", tipo: "cedula", mensajeError: "Cédula inválida. Formato: V-12345678." },
      { name: "prov-nacimiento", tipo: "fechaNacimiento", minEdad: 18, maxEdad: 110 },
      { name: "prov-correo", tipo: "correo", mensajeError: "Ingrese un correo electrónico válido." },
      { name: "prov-rif", tipo: "rif", patron: PATRONES.rifNegocio, mensajeError: "RIF inválido. Formato: J-12345678-9." },
      { name: "prov-registro", tipo: "texto", min: 5, max: 40, patron: PATRONES.registro, mensajeError: "Ingrese un registro mercantil válido (mínimo 5 caracteres)." }
    ]
  };

  function determinarTipoFormulario(form) {
    if (form.querySelector("[name^='emp-']")) return "empresa";
    if (form.querySelector("[name^='pro-']")) return "profesional";
    if (form.querySelector("[name^='prov-']")) return "proveedor";
    return null;
  }

  function validarCampo(campo, regla) {
    var valorCrudo = campo.value || "";

    if (regla.tipo === "fechaNacimiento") {
      var resFecha = sec.validarFechaNacimiento(valorCrudo, regla.minEdad, regla.maxEdad);
      if (!resFecha.valida) {
        sec.mostrarErrorCampo(campo, resFecha.mensaje);
        return false;
      }
      sec.mostrarErrorCampo(campo, "");
      return true;
    }

    if (regla.tipo === "cedula") {
      var limpioCed = sec.limpiarTexto(valorCrudo, false);
      if (!limpioCed) {
        sec.mostrarErrorCampo(campo, "Este campo es obligatorio.");
        return false;
      }
      var resCed = sec.validarYNormalizarCedula(limpioCed);
      if (!resCed.valida) {
        sec.mostrarErrorCampo(campo, regla.mensajeError);
        return false;
      }
      sec.mostrarErrorCampo(campo, "");
      return true;
    }

    if (regla.tipo === "correo") {
      var limpioCorreo = sec.limpiarTexto(valorCrudo, false).toLowerCase();
      if (!limpioCorreo) {
        sec.mostrarErrorCampo(campo, "Este campo es obligatorio.");
        return false;
      }
      if (!sec.esCorreoValido(limpioCorreo)) {
        sec.mostrarErrorCampo(campo, regla.mensajeError);
        return false;
      }
      sec.mostrarErrorCampo(campo, "");
      return true;
    }

    if (regla.tipo === "rif") {
      var limpioRif = sec.limpiarTexto(valorCrudo, false).toUpperCase();
      if (!limpioRif) {
        sec.mostrarErrorCampo(campo, "Este campo es obligatorio.");
        return false;
      }
      var digitosRif = limpioRif.replace(/[^0-9]/g, "");
      if (!regla.patron.test(limpioRif) || /^0+$/.test(digitosRif)) {
        sec.mostrarErrorCampo(campo, regla.mensajeError);
        return false;
      }
      sec.mostrarErrorCampo(campo, "");
      return true;
    }

    if (regla.tipo === "anio") {
      var limpioAnio = sec.limpiarTexto(valorCrudo, false);
      if (!limpioAnio) {
        sec.mostrarErrorCampo(campo, "Este campo es obligatorio.");
        return false;
      }
      if (!sec.validarAnio(limpioAnio, regla.minAnio)) {
        sec.mostrarErrorCampo(campo, regla.mensajeError);
        return false;
      }
      sec.mostrarErrorCampo(campo, "");
      return true;
    }

    var resTexto = sec.validarTextoSeguro(valorCrudo, {
      requerido: true,
      min: regla.min,
      max: regla.max,
      patron: regla.patron,
      mensajeError: regla.mensajeError
    });
    if (!resTexto.valido) {
      sec.mostrarErrorCampo(campo, resTexto.mensaje);
      return false;
    }
    sec.mostrarErrorCampo(campo, "");
    return true;
  }

  function validarFormulario(form, tipo) {
    var todoValido = true;
    var primerInvalido = null;

    (reglasFormulario[tipo] || []).forEach(function (regla) {
      var campo = form.querySelector("[name='" + regla.name + "']");
      if (!campo) return;
      if (!validarCampo(campo, regla)) {
        todoValido = false;
        if (!primerInvalido) primerInvalido = campo;
      }
    });

    // Validación cruzada: año de graduación coherente con fecha de nacimiento
    if (tipo === "profesional" && todoValido) {
      var nacCampo = form.querySelector("[name='pro-nacimiento']");
      var anioCampo = form.querySelector("[name='pro-anio-graduacion']");
      var parsedNac = nacCampo ? sec.parsearFechaISO(nacCampo.value) : null;
      var anioGrad = anioCampo ? parseInt(sec.limpiarTexto(anioCampo.value, false), 10) : 0;
      if (parsedNac && anioGrad && anioGrad < parsedNac.anio + 16) {
        sec.mostrarErrorCampo(
          anioCampo,
          "El año de graduación no es coherente con la fecha de nacimiento."
        );
        todoValido = false;
        primerInvalido = anioCampo;
      }
    }

    if (primerInvalido) primerInvalido.focus();
    return todoValido;
  }

  function limitarFechasPicker(form) {
    var hoyIso = new Date().toISOString().slice(0, 10);
    form.querySelectorAll("input[type='date']").forEach(function (input) {
      input.setAttribute("min", "1910-01-01");
      input.setAttribute("max", hoyIso);
    });
  }

  sec.inicializarModales({
    onOpen: function (form) {
      limitarFechasPicker(form);
    },
    onReset: function (form) {
      limitarFechasPicker(form);
    }
  });

  function construirPayload(tipo) {
    if (tipo === "empresa") {
      return {
        p_categoria: "Empresa",
        p_nombre: sec.limpiarTexto(document.getElementById("emp-nombre").value, false),
        p_cedula: sec.validarYNormalizarCedula(document.getElementById("emp-cedula").value).valor,
        p_nacimiento: sec.limpiarTexto(document.getElementById("emp-nacimiento").value, false),
        p_correo: sec.limpiarTexto(document.getElementById("emp-correo").value, false).toLowerCase(),
        p_rif: sec.limpiarTexto(document.getElementById("emp-rif").value, false).toUpperCase(),
        p_registro_o_titulo: sec.limpiarTexto(document.getElementById("emp-registro").value, false),
        p_extra_info: null
      };
    }

    if (tipo === "profesional") {
      var profesion = sec.limpiarTexto(document.getElementById("pro-profesion").value, false);
      var institucion = sec.limpiarTexto(document.getElementById("pro-institucion").value, false);
      var anio = sec.limpiarTexto(document.getElementById("pro-anio-graduacion").value, false);
      return {
        p_categoria: "Profesional",
        p_nombre: sec.limpiarTexto(document.getElementById("pro-nombre").value, false),
        p_cedula: sec.validarYNormalizarCedula(document.getElementById("pro-cedula").value).valor,
        p_nacimiento: sec.limpiarTexto(document.getElementById("pro-nacimiento").value, false),
        p_correo: sec.limpiarTexto(document.getElementById("pro-correo").value, false).toLowerCase(),
        p_rif: sec.limpiarTexto(document.getElementById("pro-rif").value, false).toUpperCase(),
        p_registro_o_titulo: profesion + " - " + institucion,
        p_extra_info: anio
      };
    }

    return {
      p_categoria: "Proveedor",
      p_nombre: sec.limpiarTexto(document.getElementById("prov-nombre").value, false),
      p_cedula: sec.validarYNormalizarCedula(document.getElementById("prov-cedula").value).valor,
      p_nacimiento: sec.limpiarTexto(document.getElementById("prov-nacimiento").value, false),
      p_correo: sec.limpiarTexto(document.getElementById("prov-correo").value, false).toLowerCase(),
      p_rif: sec.limpiarTexto(document.getElementById("prov-rif").value, false).toUpperCase(),
      p_registro_o_titulo: sec.limpiarTexto(document.getElementById("prov-registro").value, false),
      p_extra_info: null
    };
  }

  document.querySelectorAll("[data-formulario]").forEach(function (form) {
    var tipo = determinarTipoFormulario(form);
    if (!tipo) return;
    limitarFechasPicker(form);

    (reglasFormulario[tipo] || []).forEach(function (regla) {
      var campo = form.querySelector("[name='" + regla.name + "']");
      if (!campo) return;

      campo.addEventListener("blur", function () {
        validarCampo(campo, regla);
      });
      campo.addEventListener("input", function () {
        if (campo.classList.contains("input-invalido")) {
          sec.mostrarErrorCampo(campo, "");
        }
      });
    });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (form.getAttribute("data-enviando") === "1") return;

      var checkBot = sec.verificarAntiBot(form, {
        claveLimite: "agremiados_" + tipo,
        minMs: 2500,
        cooldownMs: 30000,
        maxEnVentana: 5
      });
      if (!checkBot.ok) {
        if (checkBot.silencioso) {
          sec.mostrarExito(form);
        } else {
          sec.mostrarErrorEnvio(form, checkBot.mensaje);
        }
        return;
      }

      if (!validarFormulario(form, tipo)) return;

      form.setAttribute("data-enviando", "1");
      sec.ocultarErrorEnvio(form);
      sec.bloquearEnvio(form);

      try {
        var payload = construirPayload(tipo);
        await backend.enviarRPC("registrar_agremiado", payload);
        sec.registrarEnvioExitoso("agremiados_" + tipo);
        sec.mostrarExito(form);
      } catch (err) {
        console.error("Error en envío de agremiados.");
        sec.mostrarErrorEnvio(
          form,
          sec.mensajeErrorSeguro(
            err,
            "No pudimos registrar tus datos. Revisa tu conexión e inténtalo de nuevo."
          )
        );
      } finally {
        form.removeAttribute("data-enviando");
        sec.liberarEnvio(form);
      }
    });
  });
})();
