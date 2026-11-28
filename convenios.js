/* =========================================================
   Cámara de Construcción Falcón — Convenios (Supabase RPC Seguro)
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

  /* ---------- Carrusel de imágenes del convenio ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var carrusel = document.querySelector("[data-carrusel]");
  if (carrusel) {
    var slides = carrusel.querySelectorAll("[data-slide]");
    var puntos = carrusel.querySelectorAll("[data-punto]");
    var INTERVALO = 5000;
    var indice = 0;
    var temporizador = null;
    var detenido = reduceMotion;

    var mostrar = function (n) {
      if (!slides.length) return;
      indice = (n + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === indice);
      });
      puntos.forEach(function (punto, i) {
        punto.classList.toggle("is-active", i === indice);
        punto.setAttribute("aria-selected", i === indice ? "true" : "false");
      });
    };

    var detener = function () {
      if (temporizador) {
        clearInterval(temporizador);
        temporizador = null;
      }
      detenido = true;
    };

    var iniciar = function () {
      if (detenido || temporizador || slides.length < 2) return;
      temporizador = window.setInterval(function () {
        mostrar(indice + 1);
      }, INTERVALO);
    };

    puntos.forEach(function (punto) {
      punto.addEventListener("click", function () {
        var destino = parseInt(punto.getAttribute("data-punto"), 10);
        detener();
        mostrar(isNaN(destino) ? 0 : destino);
      });
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (temporizador) {
          clearInterval(temporizador);
          temporizador = null;
        }
      } else {
        iniciar();
      }
    });

    mostrar(0);
    iniciar();
  }

  /* =========================================================
     LISTAS BLANCAS Y REGLAS DE VALIDACIÓN — CENSO LUZ
     ========================================================= */
  var PERMITIDOS_SI_NO = ["si", "no"];
  var PERMITIDOS_MODALIDAD = ["Presencial", "Semipresencial / Virtual"];
  var PERMITIDOS_TURNO = ["Mañana", "Tarde", "Fines de semana"];
  var PERMITIDOS_AREAS = [
    "Lectura e Interpretación de Planos (Arquitectónicos y Estructurales)",
    "Albañilería, Friso y Acabados de Construcción",
    "Instalaciones Eléctricas Residenciales e Industriales",
    "Instalaciones Sanitarias y Plomería",
    "Carpintería de Obra y Encofrados",
    "Ferrallado y Armado de Acero de Refuerzo",
    "Topografía Básica y Replanteo en Obra",
    "Soldadura Aplicada a Estructuras Metálicas",
    "Cómputos Métricos y Análisis de Precios Unitarios (APU)",
    "Inspección y Residencia de Obras Civiles",
    "Seguridad, Higiene y Ambiente (SHA) en la Construcción",
    "Manejo de Software para Ingeniería y Arquitectura (AutoCAD / Civil 3D / Revit)",
    "Gerencia y Planificación de Proyectos de Construcción (MS Project)"
  ];

  var PATRON_NOMBRE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ][a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]{2,59}$/;
  var PATRON_TEXTO_SEGURO = /^[0-9A-Za-zÁÉÍÓÚáéíóúÑÑüÜ][0-9A-Za-zÁÉÍÓÚáéíóúÑÑüÜ.,:;()/'#\-\s]+$/;
  var PATRON_SERIAL = /^[0-9A-Za-z][0-9A-Za-z\-./\s]{2,39}$/;
  var PATRON_TELEFONO = /^\+?[0-9][0-9\s().-]{6,17}$/;

  var reglasValidacion = {
    nombres: {
      selector: "[name='cens-nombres']",
      tipo: "texto",
      requerido: true,
      min: 3,
      max: 60,
      patron: PATRON_NOMBRE,
      mensajeError: "Ingrese nombres válidos (solo letras, mínimo 3 caracteres)."
    },
    apellidos: {
      selector: "[name='cens-apellidos']",
      tipo: "texto",
      requerido: true,
      min: 3,
      max: 60,
      patron: PATRON_NOMBRE,
      mensajeError: "Ingrese apellidos válidos (solo letras, mínimo 3 caracteres)."
    },
    cedula: {
      selector: "[name='cens-cedula']",
      tipo: "cedula",
      requerido: true,
      mensajeError: "La cédula debe tener entre 6 y 10 números (puede incluir V o E)."
    },
    nacimiento: {
      selector: "[name='cens-nacimiento']",
      tipo: "fechaNacimiento",
      requerido: true
    },
    direccion: {
      selector: "[name='cens-direccion']",
      tipo: "texto",
      requerido: true,
      min: 10,
      max: 200,
      patron: PATRON_TEXTO_SEGURO,
      mensajeError: "Indique sector, calle/avenida, municipio y estado sin caracteres especiales no permitidos."
    },
    telefono: {
      selector: "[name='cens-telefono']",
      tipo: "telefono",
      requerido: true,
      min: 7,
      max: 18,
      patron: PATRON_TELEFONO,
      mensajeError: "Ingrese un número de teléfono válido."
    },
    correo: {
      selector: "[name='cens-correo']",
      tipo: "correo",
      requerido: true,
      mensajeError: "Ingrese un correo electrónico válido."
    },
    bachiller: {
      selector: "[name='cens-bachiller']",
      tipo: "select",
      requerido: true,
      permitidos: PERMITIDOS_SI_NO,
      mensajeError: "Indique si posee título de bachiller."
    },
    serial: {
      selector: "[name='cens-serial']",
      tipo: "texto",
      requerido: false,
      min: 3,
      max: 40,
      patron: PATRON_SERIAL,
      mensajeError: "Ingrese un serial válido (letras, números o guiones)."
    },
    anioEgreso: {
      selector: "[name='cens-anio-egreso']",
      tipo: "anio",
      requerido: false,
      minAnio: 1940,
      mensajeError: "Indique un año de egreso válido (entre 1940 y el año actual)."
    },
    universitarios: {
      selector: "[name='cens-universitarios']",
      tipo: "select",
      requerido: true,
      permitidos: PERMITIDOS_SI_NO,
      mensajeError: "Indique si cursa actualmente estudios universitarios."
    },
    carrera: {
      selector: "[name='cens-carrera']",
      tipo: "texto",
      requerido: false,
      min: 3,
      max: 80,
      patron: PATRON_TEXTO_SEGURO,
      mensajeError: "Ingrese una carrera válida sin caracteres especiales."
    },
    semestre: {
      selector: "[name='cens-semestre']",
      tipo: "entero",
      requerido: false,
      minVal: 1,
      maxVal: 20,
      mensajeError: "Indique un semestre válido entre 1 y 20."
    },
    institucion: {
      selector: "[name='cens-institucion']",
      tipo: "texto",
      requerido: false,
      min: 3,
      max: 80,
      patron: PATRON_TEXTO_SEGURO,
      mensajeError: "Ingrese una institución educativa válida."
    },
    otraDetalle: {
      selector: "[name='cens-otra-detalle']",
      tipo: "texto",
      requerido: false,
      min: 3,
      max: 120,
      patron: PATRON_TEXTO_SEGURO,
      mensajeError: "Especifique la especialidad sin etiquetas ni símbolos especiales."
    },
    modalidad: {
      selector: "[name='cens-modalidad']",
      tipo: "select",
      requerido: true,
      permitidos: PERMITIDOS_MODALIDAD,
      mensajeError: "Seleccione una modalidad válida."
    }
  };

  var dependenciasCenso = [
    { control: "cens-bachiller", campos: ["cens-serial", "cens-anio-egreso"] },
    { control: "cens-universitarios", campos: ["cens-carrera", "cens-semestre", "cens-institucion"] }
  ];

  function fechaRegistroHoy() {
    var d = new Date();
    var dia = ("0" + d.getDate()).slice(-2);
    var mes = ("0" + (d.getMonth() + 1)).slice(-2);
    return dia + "/" + mes + "/" + d.getFullYear();
  }

  function sincronizarDependencias(form) {
    dependenciasCenso.forEach(function (dep) {
      var control = form.querySelector("[name='" + dep.control + "']");
      var activo = Boolean(control && control.value === "si");
      dep.campos.forEach(function (nombre) {
        var campo = form.querySelector("[name='" + nombre + "']");
        if (!campo) return;
        if (activo) {
          campo.disabled = false;
          campo.setAttribute("required", "required");
        } else {
          if (campo.value) campo.value = "";
          campo.disabled = true;
          campo.removeAttribute("required");
          sec.mostrarErrorCampo(campo, "");
        }
      });
    });

    var otra = form.querySelector("#cens-otra-check");
    var detalle = form.querySelector("[name='cens-otra-detalle']");
    if (otra && detalle) {
      if (otra.checked) {
        detalle.disabled = false;
        detalle.setAttribute("required", "required");
      } else {
        detalle.value = "";
        detalle.disabled = true;
        detalle.removeAttribute("required");
        sec.mostrarErrorCampo(detalle, "");
      }
    }
  }

  function prepararCenso(form) {
    if (!form) return;
    var fecha = form.querySelector("[name='cens-fecha-registro']");
    if (fecha) fecha.value = fechaRegistroHoy();
    var nac = form.querySelector("[name='cens-nacimiento']");
    if (nac) {
      nac.setAttribute("min", "1910-01-01");
      nac.setAttribute("max", new Date().toISOString().slice(0, 10));
    }
    sincronizarDependencias(form);
  }

  function validarCampo(campo, regla) {
    var esCondicionalObligatorio = campo.hasAttribute("required");
    var obligatorio = regla.requerido || esCondicionalObligatorio;
    var valorCrudo = campo.value || "";

    if (regla.tipo === "fechaNacimiento") {
      var resFecha = sec.validarFechaNacimiento(valorCrudo, 14, 110);
      if (!resFecha.valida) {
        sec.mostrarErrorCampo(campo, resFecha.mensaje);
        return false;
      }
      sec.mostrarErrorCampo(campo, "");
      return true;
    }

    if (regla.tipo === "cedula") {
      var limpioCed = sec.limpiarTexto(valorCrudo, false);
      if (obligatorio && !limpioCed) {
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
      if (obligatorio && !limpioCorreo) {
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

    if (regla.tipo === "select") {
      var valSel = sec.limpiarTexto(valorCrudo, false);
      if (obligatorio && !valSel) {
        sec.mostrarErrorCampo(campo, regla.mensajeError || "Seleccione una opción.");
        return false;
      }
      if (valSel && !sec.validarListaBlanca([valSel], regla.permitidos || [])) {
        sec.mostrarErrorCampo(campo, "Selección no válida.");
        return false;
      }
      sec.mostrarErrorCampo(campo, "");
      return true;
    }

    if (regla.tipo === "anio") {
      var limpioAnio = sec.limpiarTexto(valorCrudo, false);
      if (obligatorio && !limpioAnio) {
        sec.mostrarErrorCampo(campo, "Este campo es obligatorio.");
        return false;
      }
      if (!obligatorio && !limpioAnio) {
        sec.mostrarErrorCampo(campo, "");
        return true;
      }
      if (!sec.validarAnio(limpioAnio, regla.minAnio)) {
        sec.mostrarErrorCampo(campo, regla.mensajeError);
        return false;
      }
      sec.mostrarErrorCampo(campo, "");
      return true;
    }

    if (regla.tipo === "entero") {
      var limpioInt = sec.limpiarTexto(valorCrudo, false);
      if (obligatorio && !limpioInt) {
        sec.mostrarErrorCampo(campo, "Este campo es obligatorio.");
        return false;
      }
      if (!obligatorio && !limpioInt) {
        sec.mostrarErrorCampo(campo, "");
        return true;
      }
      if (sec.validarEntero(limpioInt, regla.minVal, regla.maxVal) === null) {
        sec.mostrarErrorCampo(campo, regla.mensajeError);
        return false;
      }
      sec.mostrarErrorCampo(campo, "");
      return true;
    }

    var resTexto = sec.validarTextoSeguro(valorCrudo, {
      requerido: obligatorio,
      min: regla.min,
      max: regla.max,
      patron: regla.patron,
      esTelefono: regla.tipo === "telefono",
      mensajeError: regla.mensajeError
    });
    if (!resTexto.valido) {
      sec.mostrarErrorCampo(campo, resTexto.mensaje);
      return false;
    }
    sec.mostrarErrorCampo(campo, "");
    return true;
  }

  function validarGrupo(form, nombre, elementos) {
    var aviso = form.querySelector("[data-error-grupo='" + nombre + "']");
    var marcado = elementos.some(function (el) { return el.checked; });
    if (aviso) aviso.textContent = marcado ? "" : "Seleccione al menos una opción.";
    return marcado;
  }

  function valoresMarcados(form, nombre) {
    return Array.prototype.slice
      .call(form.querySelectorAll("[name='" + nombre + "']"))
      .filter(function (el) { return el.checked; })
      .map(function (el) { return el.value; });
  }

  function validarFormulario(form) {
    var todoValido = true;
    var camposInvalidos = [];

    Object.keys(reglasValidacion).forEach(function (clave) {
      var regla = reglasValidacion[clave];
      var campo = form.querySelector(regla.selector);
      if (!campo || campo.disabled) return;
      if (!validarCampo(campo, regla)) {
        todoValido = false;
        camposInvalidos.push(campo);
      }
    });

    var areasChecks = Array.prototype.slice.call(form.querySelectorAll("[name='cens-areas']"));
    var otra = form.querySelector("#cens-otra-check");
    var areasGrupo = areasChecks.slice();
    if (otra) areasGrupo.push(otra);

    if (!validarGrupo(form, "areas", areasGrupo)) {
      todoValido = false;
      if (areasGrupo.length) camposInvalidos.push(areasGrupo[0]);
    } else {
      var seleccionadas = valoresMarcados(form, "cens-areas");
      if (!sec.validarListaBlanca(seleccionadas, PERMITIDOS_AREAS)) {
        var avisoAreas = form.querySelector("[data-error-grupo='areas']");
        if (avisoAreas) avisoAreas.textContent = "Se detectó un área no permitida.";
        todoValido = false;
      }
    }

    var turnosChecks = Array.prototype.slice.call(form.querySelectorAll("[name='cens-turno']"));
    if (!validarGrupo(form, "turno", turnosChecks)) {
      todoValido = false;
      if (turnosChecks.length) camposInvalidos.push(turnosChecks[0]);
    } else {
      var turnosSel = valoresMarcados(form, "cens-turno");
      if (!sec.validarListaBlanca(turnosSel, PERMITIDOS_TURNO)) {
        var avisoTurno = form.querySelector("[data-error-grupo='turno']");
        if (avisoTurno) avisoTurno.textContent = "Se detectó un turno no permitido.";
        todoValido = false;
      }
    }

    if (camposInvalidos.length > 0) camposInvalidos[0].focus();
    return todoValido;
  }

  function construirPayload(form) {
    var getVal = function (sel) {
      var el = form.querySelector(sel);
      return el && !el.disabled ? sec.limpiarTexto(el.value, false) : "";
    };

    var areas = valoresMarcados(form, "cens-areas");
    var otra = form.querySelector("#cens-otra-check");
    if (otra && otra.checked) {
      var detalle = getVal("[name='cens-otra-detalle']");
      if (detalle) areas.push("Otra especialidad: " + detalle);
    }

    return {
      p_nombres: getVal("[name='cens-nombres']"),
      p_apellidos: getVal("[name='cens-apellidos']"),
      p_cedula: sec.validarYNormalizarCedula(getVal("[name='cens-cedula']")).valor,
      p_nacimiento: getVal("[name='cens-nacimiento']"),
      p_direccion: getVal("[name='cens-direccion']"),
      p_telefono: getVal("[name='cens-telefono']"),
      p_correo: getVal("[name='cens-correo']").toLowerCase(),
      p_bachiller: getVal("[name='cens-bachiller']"),
      p_serial_titulo: getVal("[name='cens-serial']") || null,
      p_anio_egreso: getVal("[name='cens-anio-egreso']") || null,
      p_universitarios: getVal("[name='cens-universitarios']"),
      p_carrera: getVal("[name='cens-carrera']") || null,
      p_semestre: getVal("[name='cens-semestre']") || null,
      p_institucion: getVal("[name='cens-institucion']") || null,
      p_areas: areas,
      p_turno: valoresMarcados(form, "cens-turno"),
      p_modalidad: getVal("[name='cens-modalidad']")
    };
  }

  sec.inicializarModales({
    onOpen: prepararCenso,
    onReset: prepararCenso
  });

  document.querySelectorAll("[data-formulario]").forEach(function (form) {
    Object.keys(reglasValidacion).forEach(function (clave) {
      var regla = reglasValidacion[clave];
      var campo = form.querySelector(regla.selector);
      if (!campo) return;

      campo.addEventListener("blur", function () {
        validarCampo(campo, regla);
      });
      campo.addEventListener("input", function () {
        if (campo.classList.contains("input-invalido")) {
          sec.mostrarErrorCampo(campo, "");
        }
      });
      campo.addEventListener("change", function () {
        validarCampo(campo, regla);
      });
    });

    form.querySelectorAll("[name='cens-bachiller'], [name='cens-universitarios'], #cens-otra-check").forEach(function (control) {
      control.addEventListener("change", function () {
        sincronizarDependencias(form);
      });
    });

    form.querySelectorAll("[name='cens-areas'], [name='cens-turno']").forEach(function (caja) {
      caja.addEventListener("change", function () {
        var grupo = caja.getAttribute("name");
        var aviso = form.querySelector("[data-error-grupo='" + (grupo === "cens-areas" ? "areas" : "turno") + "']");
        if (!aviso) return;
        var hayMarcada = Array.prototype.some.call(
          form.querySelectorAll("[name='" + grupo + "']"),
          function (el) { return el.checked; }
        );
        if (grupo === "cens-areas") {
          var otraEspecialidad = form.querySelector("#cens-otra-check");
          if (otraEspecialidad && otraEspecialidad.checked) hayMarcada = true;
        }
        if (hayMarcada) aviso.textContent = "";
      });
    });

    prepararCenso(form);

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (form.getAttribute("data-enviando") === "1") return;

      var checkBot = sec.verificarAntiBot(form, {
        claveLimite: "convenios_censo",
        minMs: 3000,
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

      if (!validarFormulario(form)) return;

      form.setAttribute("data-enviando", "1");
      sec.ocultarErrorEnvio(form);
      sec.bloquearEnvio(form);

      try {
        var payload = construirPayload(form);
        await backend.enviarRPC("registrar_censo_convenio", payload);
        sec.registrarEnvioExitoso("convenios_censo");
        sec.mostrarExito(form);
      } catch (err) {
        console.error("Error en envío del censo.");
        sec.mostrarErrorEnvio(
          form,
          sec.mensajeErrorSeguro(
            err,
            "No pudimos guardar tu registro. Revisa tu conexión e inténtalo de nuevo."
          )
        );
      } finally {
        form.removeAttribute("data-enviando");
        sec.liberarEnvio(form);
      }
    });
  });
})();
