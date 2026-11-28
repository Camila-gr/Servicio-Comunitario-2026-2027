/* =========================================================
   Cámara de Construcción Falcón — Programas (Supabase RPC Seguro)
   ========================================================= */
(function () {
  "use strict";

  var sec = window.CCFSecurity;
  var backend = window.CCFBackend;
  if (!sec || !backend) return;

  sec.inicializarMenuMovil();
  sec.inicializarHeaderScroll();
  sec.inicializarAnio();

  /* =========================================================
     LISTAS BLANCAS DE OPCIONES PERMITIDAS
     ========================================================= */
  var PARROQUIAS = ["Carirubana", "Norte", "Punta Cardón", "Santa Ana"];
  var EDADES = ["18 – 29 años", "30 – 49 años", "50 – 64 años", "65 años o más"];
  var OCUPACIONES = [
    "Empleado(a) público / privado",
    "Comerciante / Emprendedor(a)",
    "Trabajo independiente / Oficio libre",
    "Estudiante",
    "Ama de casa / Labores del hogar",
    "Jubilado(a) / Pensionado(a)",
    "Desempleado(a)"
  ];
  var INGRESOS = [
    "Sueldo / Salario fijo (sector público o privado)",
    "Trabajo independiente / Oficios",
    "Emprendimiento / Comercio propio o ventas",
    "Remesas desde el exterior",
    "Jubilaciones, pensiones o ayudas públicas",
    "Rentas o alquileres",
    "Otro"
  ];
  var APORTANTES = ["1 persona", "2 personas", "3 personas", "4 personas o más"];
  var HABITANTES = ["1 a 2 personas", "3 a 4 personas", "5 a 6 personas", "7 personas o más"];
  var CALIDAD_VIDA = ["1 (Muy mala)", "2 (Mala)", "3 (Regular)", "4 (Buena)", "5 (Excelente)"];
  var SERVICIOS = ["", "Deficiente", "Regular", "Aceptable", "Bueno", "No sabe / No responde"];
  var PERFIL_ALCALDE = [
    "Experto en gestión pública, planificación y administración eficiente de recursos",
    "Con trayectoria en las bases, conocedor directo de los sectores populares",
    "Con visión de desarrollo económico, atracción de inversión y generación de empleo",
    "Con experiencia legislativa, de negociación e intermediación de alto nivel",
    "Enfocado en la formación, la institucionalidad, la cultura y los valores"
  ];
  var CUALIDADES_LIDER = [
    "Honestidad y transparencia en el uso del presupuesto municipal",
    "Capacidad de resolver problemas con rapidez y eficacia",
    "Cercanía y presencia constante en las calles y parroquias",
    "Visión de futuro y modernización para Punto Fijo y sus parroquias",
    "Capacidad de diálogo y articulación con todos los sectores sociales"
  ];
  var ESTILO_GESTION = [
    "Un perfil técnico centrado en resultados, eficiencia y obras de infraestructura",
    "Un perfil territorial permanente en los sectores, resolviendo mano a mano con la gente",
    "Un perfil mixto que equilibre la planificación gerencial con la presencia comunitaria"
  ];
  var PRIORIDADES = [
    "Solución al problema del agua y mejora de los ciclos de suministro",
    "Reparación de calles, bacheo y asfaltado",
    "Seguridad ciudadana y vigilancia policial",
    "Reactivación económica, apoyo al comercio y zonas industriales/comerciales",
    "Recuperación de canchas, espacios deportivos y culturales",
    "Salud municipal y fortalecimiento de ambulatorios",
    "Limpieza, saneamiento y gestión ambiental / basura"
  ];
  var ECONOMIA = [
    "Atención y protección social (adultos mayores, juventud, mujeres, sectores vulnerables)",
    "Créditos, insumos y capacitación para emprendedores y microempresarios",
    "Simplificación de trámites e incentivos fiscales a comerciantes",
    "Alianzas con el sector privado e industrias para la creación de empleo",
    "Impulso al turismo, gastronomía y comercio local",
    "Mercados comunitarios y ferias de abastecimiento a precios accesibles"
  ];
  var JUVENTUD = [
    "Recuperación y alumbrado de instalaciones deportivas",
    "Capacitación técnica, oficios productivos y tecnología",
    "Programas culturales, artísticos y musicales",
    "Torneos deportivos interparroquiales continuos",
    "Espacios comunitarios con conectividad a internet / bibliotecas digitales"
  ];
  var PARTICIPACION = [
    "Asambleas comunitarias y presupuestos participativos",
    "Consultas digitales / Encuestas por redes sociales",
    "Atención directa mediante consejos comunales / voceros de zona",
    "Aplicación móvil o WhatsApp institucional para reportes directos"
  ];
  var EJES_APOYO = [
    "EJE 1 · Diagnóstico técnico e infraestructura comunitaria",
    "EJE 2 · Responsabilidad social empresarial (RSE) y capacitación",
    "EJE 3 · Infraestructura deportiva y juegos comunitarios"
  ];
  var SI_NO_ES = ["Sí", "No"];

  var PATRON_NOMBRE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ][a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]{2,79}$/;
  var PATRON_TEXTO_SEGURO = /^[0-9A-Za-zÁÉÍÓÚáéíóúÑÑüÜ][0-9A-Za-zÁÉÍÓÚáéíóúÑÑüÜ.,:;()/'#\-\s]+$/;
  var PATRON_TELEFONO = /^\+?[0-9][0-9\s().-]{6,17}$/;

  function obtenerCheckboxes(form, nombre) {
    return Array.prototype.slice
      .call(form.querySelectorAll("input[name='" + nombre + "']:checked"))
      .map(function (cb) { return cb.value; });
  }

  function obtenerRadio(form, nombre) {
    var seleccionado = form.querySelector("input[name='" + nombre + "']:checked");
    return seleccionado ? seleccionado.value : "";
  }

  function mostrarErrorGrupo(form, claveGrupo, mensaje) {
    var aviso = form.querySelector("[data-error-grupo='" + claveGrupo + "']");
    if (aviso) aviso.textContent = mensaje || "";
  }

  function limpiarErrorGrupoAlCambiar(form, inputName, claveGrupo, maxPermitido) {
    var checkboxes = form.querySelectorAll("input[name='" + inputName + "']");
    checkboxes.forEach(function (cb) {
      cb.addEventListener("change", function () {
        var marcados = obtenerCheckboxes(form, inputName);
        if (maxPermitido && marcados.length > maxPermitido) {
          cb.checked = false;
          mostrarErrorGrupo(
            form,
            claveGrupo,
            "Solo puedes seleccionar un máximo de " + maxPermitido + " opciones."
          );
          return;
        }
        mostrarErrorGrupo(form, claveGrupo, "");
      });
    });
  }

  /* =========================================================
     DEPENDENCIAS DINÁMICAS EN POSTULACIÓN
     ========================================================= */
  function sincronizarPostulacion(form) {
    if (!form) return;

    var fechaEl = form.querySelector("#post-fecha");
    if (fechaEl) {
      var hoy = new Date();
      var maxDate = new Date(hoy);
      maxDate.setDate(maxDate.getDate() + 1);
      fechaEl.setAttribute("min", "2024-01-01");
      fechaEl.setAttribute("max", maxDate.toISOString().slice(0, 10));
    }

    var volVal = obtenerRadio(form, "post-voluntarios");
    var volCant = form.querySelector("#post-voluntarios-cantidad");
    if (volCant) {
      if (volVal === "No") {
        volCant.value = "";
        volCant.disabled = true;
        volCant.removeAttribute("required");
        sec.mostrarErrorCampo(volCant, "");
      } else {
        volCant.disabled = false;
        volCant.setAttribute("required", "required");
      }
    }

    var espVal = obtenerRadio(form, "post-espacio");
    var espCual = form.querySelector("#post-espacio-cual");
    if (espCual) {
      if (espVal === "No") {
        espCual.value = "";
        espCual.disabled = true;
        espCual.removeAttribute("required");
        sec.mostrarErrorCampo(espCual, "");
      } else {
        espCual.disabled = false;
        espCual.setAttribute("required", "required");
      }
    }
  }

  sec.inicializarModales({
    onOpen: function (form) {
      if (form.closest("#modal-postulacion")) sincronizarPostulacion(form);
    },
    onReset: function (form) {
      if (form.closest("#modal-postulacion")) sincronizarPostulacion(form);
    }
  });

  /* =========================================================
     VALIDACIÓN: FORMULARIO 1 — DIAGNÓSTICO
     ========================================================= */
  function validarDiagnostico(form) {
    var valido = true;
    var primerError = null;
    var marcar = function (el) {
      valido = false;
      if (!primerError && el) primerError = el;
    };

    var validarRadioObligatorio = function (name, grupo, permitidos, msg) {
      var val = obtenerRadio(form, name);
      if (!val) {
        mostrarErrorGrupo(form, grupo, msg || "Seleccione una opción.");
        marcar(form.querySelector("input[name='" + name + "']"));
        return;
      }
      if (!sec.validarListaBlanca([val], permitidos)) {
        mostrarErrorGrupo(form, grupo, "Opción no válida.");
        marcar(form.querySelector("input[name='" + name + "']"));
        return;
      }
      mostrarErrorGrupo(form, grupo, "");
    };

    var validarCheckboxes = function (name, grupo, permitidos, min, max, msgMin) {
      var vals = obtenerCheckboxes(form, name);
      if (!sec.validarListaBlanca(vals, permitidos)) {
        mostrarErrorGrupo(form, grupo, "Selección no válida.");
        marcar(form.querySelector("input[name='" + name + "']"));
        return;
      }
      if (min && vals.length < min) {
        mostrarErrorGrupo(form, grupo, msgMin || "Seleccione al menos " + min + " opción.");
        marcar(form.querySelector("input[name='" + name + "']"));
        return;
      }
      if (max && vals.length > max) {
        mostrarErrorGrupo(form, grupo, "Seleccione un máximo de " + max + " opciones.");
        marcar(form.querySelector("input[name='" + name + "']"));
        return;
      }
      mostrarErrorGrupo(form, grupo, "");
    };

    validarRadioObligatorio("diag-parroquia", "diag-parroquia", PARROQUIAS, "Seleccione una parroquia.");

    var sectorEl = form.querySelector("#diag-sector");
    var resSector = sec.validarTextoSeguro(sectorEl ? sectorEl.value : "", {
      requerido: true,
      min: 3,
      max: 120,
      patron: PATRON_TEXTO_SEGURO,
      mensajeError: "Ingrese un sector o urbanización válido (3 a 120 caracteres)."
    });
    if (!resSector.valido) {
      sec.mostrarErrorCampo(sectorEl, resSector.mensaje);
      marcar(sectorEl);
    } else {
      sec.mostrarErrorCampo(sectorEl, "");
    }

    validarRadioObligatorio("diag-edad", "diag-edad", EDADES, "Seleccione su rango de edad.");
    validarRadioObligatorio("diag-ocupacion", "diag-ocupacion", OCUPACIONES, "Seleccione su ocupación principal.");
    validarCheckboxes("diag-ingresos", "diag-ingresos", INGRESOS, 0, 7);
    validarRadioObligatorio("diag-aportantes", "diag-aportantes", APORTANTES, "Seleccione cuántas personas aportan.");
    validarRadioObligatorio("diag-habitantes", "diag-habitantes", HABITANTES, "Seleccione cuántas personas viven en su hogar.");
    validarRadioObligatorio("diag-calidad", "diag-calidad", CALIDAD_VIDA, "Evalúe la calidad de vida del 1 al 5.");

    for (var i = 1; i <= 7; i++) {
      var servEl = form.querySelector("#serv-" + i);
      var servVal = servEl ? sec.limpiarTexto(servEl.value, false) : "";
      if (servVal && !sec.validarListaBlanca([servVal], SERVICIOS)) {
        sec.mostrarErrorCampo(servEl, "Valor de evaluación no válido.");
        marcar(servEl);
      } else if (servEl) {
        sec.mostrarErrorCampo(servEl, "");
      }
    }

    validarRadioObligatorio("diag-perfil", "diag-perfil", PERFIL_ALCALDE, "Seleccione un perfil principal.");
    validarCheckboxes("diag-cualidades", "diag-cualidades", CUALIDADES_LIDER, 1, 2, "Seleccione entre 1 y 2 cualidades.");
    validarRadioObligatorio("diag-estilo", "diag-estilo", ESTILO_GESTION, "Seleccione un estilo de gestión.");
    validarCheckboxes("diag-prioridades", "diag-prioridades", PRIORIDADES, 1, 3, "Seleccione entre 1 y 3 áreas prioritarias.");

    var probEl = form.querySelector("#diag-problema");
    var resProb = sec.validarTextoSeguro(probEl ? probEl.value : "", {
      requerido: true,
      multiline: true,
      min: 10,
      max: 1000,
      mensajeError: "Describa el problema sin caracteres especiales no permitidos."
    });
    if (!resProb.valido) {
      sec.mostrarErrorCampo(probEl, resProb.mensaje);
      marcar(probEl);
    } else {
      sec.mostrarErrorCampo(probEl, "");
    }

    validarCheckboxes("diag-economia", "diag-economia", ECONOMIA, 0, 6);
    validarCheckboxes("diag-juventud", "diag-juventud", JUVENTUD, 0, 5);
    validarCheckboxes("diag-participacion", "diag-participacion", PARTICIPACION, 0, 4);

    var propEl = form.querySelector("#diag-propuesta");
    var resProp = sec.validarTextoSeguro(propEl ? propEl.value : "", {
      requerido: true,
      multiline: true,
      min: 10,
      max: 1000,
      mensajeError: "Describa la propuesta sin caracteres especiales no permitidos."
    });
    if (!resProp.valido) {
      sec.mostrarErrorCampo(propEl, resProp.mensaje);
      marcar(propEl);
    } else {
      sec.mostrarErrorCampo(propEl, "");
    }

    if (primerError) primerError.focus();
    return valido;
  }

  /* =========================================================
     VALIDACIÓN: FORMULARIO 2 — POSTULACIÓN SECTORIAL
     ========================================================= */
  function validarPostulacion(form) {
    var valido = true;
    var primerError = null;
    var marcar = function (el) {
      valido = false;
      if (!primerError && el) primerError = el;
    };

    var parroquiaEl = form.querySelector("#post-parroquia");
    var parroquiaVal = parroquiaEl ? sec.limpiarTexto(parroquiaEl.value, false) : "";
    if (!parroquiaVal) {
      sec.mostrarErrorCampo(parroquiaEl, "Seleccione una parroquia.");
      marcar(parroquiaEl);
    } else if (!sec.validarListaBlanca([parroquiaVal], PARROQUIAS)) {
      sec.mostrarErrorCampo(parroquiaEl, "Parroquia no válida.");
      marcar(parroquiaEl);
    } else {
      sec.mostrarErrorCampo(parroquiaEl, "");
    }

    var fechaEl = form.querySelector("#post-fecha");
    var resFecha = sec.validarFechaSolicitud(fechaEl ? fechaEl.value : "");
    if (!resFecha.valida) {
      sec.mostrarErrorCampo(fechaEl, resFecha.mensaje);
      marcar(fechaEl);
    } else {
      sec.mostrarErrorCampo(fechaEl, "");
    }

    var validarCampoTexto = function (id, opts) {
      var el = form.querySelector("#" + id);
      var res = sec.validarTextoSeguro(el ? el.value : "", opts);
      if (!res.valido) {
        sec.mostrarErrorCampo(el, res.mensaje);
        marcar(el);
        return "";
      }
      sec.mostrarErrorCampo(el, "");
      return res.valor;
    };

    validarCampoTexto("post-sector", {
      requerido: true,
      min: 3,
      max: 120,
      patron: PATRON_TEXTO_SEGURO,
      mensajeError: "Ingrese un nombre de sector válido."
    });

    validarCampoTexto("post-direccion", {
      requerido: true,
      min: 10,
      max: 250,
      patron: PATRON_TEXTO_SEGURO,
      mensajeError: "Ingrese una dirección válida sin etiquetas ni símbolos especiales."
    });

    var famEl = form.querySelector("#post-familias");
    if (sec.validarEntero(famEl ? famEl.value : "", 1, 100000) === null) {
      sec.mostrarErrorCampo(famEl, "Ingrese un número entero válido de familias (1 a 100000).");
      marcar(famEl);
    } else {
      sec.mostrarErrorCampo(famEl, "");
    }

    validarCampoTexto("post-enlace-nombre", {
      requerido: true,
      min: 3,
      max: 80,
      patron: PATRON_NOMBRE,
      mensajeError: "Ingrese nombre y apellido válidos (solo letras)."
    });

    var cedEnlaceEl = form.querySelector("#post-enlace-cedula");
    var cedEnlace = sec.validarYNormalizarCedula(cedEnlaceEl ? cedEnlaceEl.value : "");
    if (!cedEnlace.valida) {
      sec.mostrarErrorCampo(cedEnlaceEl, "Cédula inválida. Formato: V-12345678.");
      marcar(cedEnlaceEl);
    } else {
      sec.mostrarErrorCampo(cedEnlaceEl, "");
    }

    validarCampoTexto("post-enlace-telefono", {
      requerido: true,
      min: 7,
      max: 18,
      patron: PATRON_TELEFONO,
      esTelefono: true,
      mensajeError: "Ingrese un teléfono válido (ej. 0412-1234567)."
    });

    validarCampoTexto("post-enlace-cargo", {
      requerido: true,
      min: 3,
      max: 100,
      patron: PATRON_TEXTO_SEGURO,
      mensajeError: "Indique el cargo o rol comunitario."
    });

    validarCampoTexto("post-suplente-nombre", {
      requerido: true,
      min: 3,
      max: 80,
      patron: PATRON_NOMBRE,
      mensajeError: "Ingrese nombre y apellido válidos (solo letras)."
    });

    var cedSuplenteEl = form.querySelector("#post-suplente-cedula");
    var cedSuplente = sec.validarYNormalizarCedula(cedSuplenteEl ? cedSuplenteEl.value : "");
    if (!cedSuplente.valida) {
      sec.mostrarErrorCampo(cedSuplenteEl, "Cédula inválida. Formato: V-12345678.");
      marcar(cedSuplenteEl);
    } else if (cedEnlace.valida && cedEnlace.valor === cedSuplente.valor) {
      sec.mostrarErrorCampo(cedSuplenteEl, "El enlace suplente debe ser una persona distinta al enlace principal.");
      marcar(cedSuplenteEl);
    } else {
      sec.mostrarErrorCampo(cedSuplenteEl, "");
    }

    validarCampoTexto("post-suplente-telefono", {
      requerido: true,
      min: 7,
      max: 18,
      patron: PATRON_TELEFONO,
      esTelefono: true,
      mensajeError: "Ingrese un teléfono válido (ej. 0412-1234567)."
    });

    var ejesSel = obtenerCheckboxes(form, "post-ejes");
    if (!ejesSel.length) {
      mostrarErrorGrupo(form, "post-ejes", "Seleccione al menos un eje de apoyo.");
      marcar(form.querySelector("input[name='post-ejes']"));
    } else if (!sec.validarListaBlanca(ejesSel, EJES_APOYO)) {
      mostrarErrorGrupo(form, "post-ejes", "Selección de eje no válida.");
      marcar(form.querySelector("input[name='post-ejes']"));
    } else {
      mostrarErrorGrupo(form, "post-ejes", "");
    }

    validarCampoTexto("post-descripcion", {
      requerido: true,
      multiline: true,
      min: 15,
      max: 1500,
      mensajeError: "Describa la problemática o propuesta (15 a 1500 caracteres)."
    });

    var volVal = obtenerRadio(form, "post-voluntarios");
    if (!volVal || !sec.validarListaBlanca([volVal], SI_NO_ES)) {
      mostrarErrorGrupo(form, "post-voluntarios", "Indique si cuenta con voluntarios.");
      marcar(form.querySelector("input[name='post-voluntarios']"));
    } else {
      mostrarErrorGrupo(form, "post-voluntarios", "");
    }

    var volCantEl = form.querySelector("#post-voluntarios-cantidad");
    if (volVal === "Sí" && volCantEl && !volCantEl.disabled) {
      if (sec.validarEntero(volCantEl.value, 1, 10000) === null) {
        sec.mostrarErrorCampo(volCantEl, "Indique una cantidad válida de voluntarios (1 a 10000).");
        marcar(volCantEl);
      } else {
        sec.mostrarErrorCampo(volCantEl, "");
      }
    }

    var espVal = obtenerRadio(form, "post-espacio");
    if (!espVal || !sec.validarListaBlanca([espVal], SI_NO_ES)) {
      mostrarErrorGrupo(form, "post-espacio", "Indique si existe espacio físico disponible.");
      marcar(form.querySelector("input[name='post-espacio']"));
    } else {
      mostrarErrorGrupo(form, "post-espacio", "");
    }

    var espCualEl = form.querySelector("#post-espacio-cual");
    if (espVal === "Sí" && espCualEl && !espCualEl.disabled) {
      validarCampoTexto("post-espacio-cual", {
        requerido: true,
        min: 3,
        max: 150,
        patron: PATRON_TEXTO_SEGURO,
        mensajeError: "Indique el espacio físico disponible sin símbolos especiales."
      });
    }

    if (primerError) primerError.focus();
    return valido;
  }

  /* =========================================================
     INICIALIZACIÓN DE ENVÍOS Y LISTENERS EN TIEMPO REAL
     ========================================================= */
  var formDiagnostico = document.querySelector("#modal-diagnostico form");
  if (formDiagnostico) {
    limpiarErrorGrupoAlCambiar(formDiagnostico, "diag-cualidades", "diag-cualidades", 2);
    limpiarErrorGrupoAlCambiar(formDiagnostico, "diag-prioridades", "diag-prioridades", 3);

    ["diag-parroquia", "diag-edad", "diag-ocupacion", "diag-aportantes", "diag-habitantes", "diag-calidad", "diag-perfil", "diag-estilo"].forEach(function (name) {
      formDiagnostico.querySelectorAll("input[name='" + name + "']").forEach(function (radio) {
        radio.addEventListener("change", function () {
          mostrarErrorGrupo(formDiagnostico, name, "");
        });
      });
    });

    ["#diag-sector", "#diag-problema", "#diag-propuesta"].forEach(function (sel) {
      var el = formDiagnostico.querySelector(sel);
      if (el) {
        el.addEventListener("input", function () {
          if (el.classList.contains("input-invalido")) sec.mostrarErrorCampo(el, "");
        });
      }
    });

    formDiagnostico.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (formDiagnostico.getAttribute("data-enviando") === "1") return;

      var checkBot = sec.verificarAntiBot(formDiagnostico, {
        claveLimite: "programas_diagnostico",
        minMs: 3000,
        cooldownMs: 30000,
        maxEnVentana: 5
      });
      if (!checkBot.ok) {
        if (checkBot.silencioso) {
          sec.mostrarExito(formDiagnostico);
        } else {
          sec.mostrarErrorEnvio(formDiagnostico, checkBot.mensaje);
        }
        return;
      }

      if (!validarDiagnostico(formDiagnostico)) return;

      formDiagnostico.setAttribute("data-enviando", "1");
      sec.ocultarErrorEnvio(formDiagnostico);
      sec.bloquearEnvio(formDiagnostico);

      try {
        var payload = {
          p_parroquia: obtenerRadio(formDiagnostico, "diag-parroquia"),
          p_sector: sec.limpiarTexto(document.getElementById("diag-sector").value, false),
          p_edad: obtenerRadio(formDiagnostico, "diag-edad"),
          p_ocupacion: obtenerRadio(formDiagnostico, "diag-ocupacion"),
          p_ingresos: obtenerCheckboxes(formDiagnostico, "diag-ingresos"),
          p_aportantes: obtenerRadio(formDiagnostico, "diag-aportantes"),
          p_habitantes: obtenerRadio(formDiagnostico, "diag-habitantes"),
          p_calidad_vida: obtenerRadio(formDiagnostico, "diag-calidad"),
          p_serv_agua: sec.limpiarTexto(document.getElementById("serv-1").value, false),
          p_serv_aseo: sec.limpiarTexto(document.getElementById("serv-2").value, false),
          p_serv_electricidad: sec.limpiarTexto(document.getElementById("serv-3").value, false),
          p_serv_vialidad: sec.limpiarTexto(document.getElementById("serv-4").value, false),
          p_serv_transporte: sec.limpiarTexto(document.getElementById("serv-5").value, false),
          p_serv_seguridad: sec.limpiarTexto(document.getElementById("serv-6").value, false),
          p_serv_deporte: sec.limpiarTexto(document.getElementById("serv-7").value, false),
          p_perfil_alcalde: obtenerRadio(formDiagnostico, "diag-perfil"),
          p_cualidades_lider: obtenerCheckboxes(formDiagnostico, "diag-cualidades"),
          p_estilo_gestion: obtenerRadio(formDiagnostico, "diag-estilo"),
          p_prioridades: obtenerCheckboxes(formDiagnostico, "diag-prioridades"),
          p_problema_grave: sec.limpiarTexto(document.getElementById("diag-problema").value, true),
          p_economia_iniciativa: obtenerCheckboxes(formDiagnostico, "diag-economia"),
          p_juventud_proyectos: obtenerCheckboxes(formDiagnostico, "diag-juventud"),
          p_via_participacion: obtenerCheckboxes(formDiagnostico, "diag-participacion"),
          p_propuesta_obra: sec.limpiarTexto(document.getElementById("diag-propuesta").value, true)
        };

        await backend.enviarRPC("registrar_diagnostico_programa", payload);
        sec.registrarEnvioExitoso("programas_diagnostico");
        sec.mostrarExito(formDiagnostico);
      } catch (err) {
        console.error("Error al guardar diagnóstico.");
        sec.mostrarErrorEnvio(
          formDiagnostico,
          sec.mensajeErrorSeguro(
            err,
            "No pudimos enviar el cuestionario. Revisa tu conexión e inténtalo de nuevo."
          )
        );
      } finally {
        formDiagnostico.removeAttribute("data-enviando");
        sec.liberarEnvio(formDiagnostico);
      }
    });
  }

  var formPostulacion = document.querySelector("#modal-postulacion form");
  if (formPostulacion) {
    sincronizarPostulacion(formPostulacion);

    formPostulacion.querySelectorAll("input[name='post-voluntarios'], input[name='post-espacio']").forEach(function (el) {
      el.addEventListener("change", function () {
        sincronizarPostulacion(formPostulacion);
        mostrarErrorGrupo(formPostulacion, el.getAttribute("name"), "");
      });
    });

    limpiarErrorGrupoAlCambiar(formPostulacion, "post-ejes", "post-ejes");

    formPostulacion.querySelectorAll("input, select, textarea").forEach(function (el) {
      el.addEventListener("input", function () {
        if (el.classList.contains("input-invalido")) sec.mostrarErrorCampo(el, "");
      });
    });

    formPostulacion.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (formPostulacion.getAttribute("data-enviando") === "1") return;

      var checkBot = sec.verificarAntiBot(formPostulacion, {
        claveLimite: "programas_postulacion",
        minMs: 3000,
        cooldownMs: 30000,
        maxEnVentana: 5
      });
      if (!checkBot.ok) {
        if (checkBot.silencioso) {
          sec.mostrarExito(formPostulacion);
        } else {
          sec.mostrarErrorEnvio(formPostulacion, checkBot.mensaje);
        }
        return;
      }

      if (!validarPostulacion(formPostulacion)) return;

      formPostulacion.setAttribute("data-enviando", "1");
      sec.ocultarErrorEnvio(formPostulacion);
      sec.bloquearEnvio(formPostulacion);

      try {
        var voluntariosVal = obtenerRadio(formPostulacion, "post-voluntarios");
        var espacioVal = obtenerRadio(formPostulacion, "post-espacio");
        var payload = {
          p_parroquia: sec.limpiarTexto(document.getElementById("post-parroquia").value, false),
          p_fecha_solicitud: sec.limpiarTexto(document.getElementById("post-fecha").value, false),
          p_sector: sec.limpiarTexto(document.getElementById("post-sector").value, false),
          p_direccion: sec.limpiarTexto(document.getElementById("post-direccion").value, false),
          p_cantidad_familias: String(sec.validarEntero(document.getElementById("post-familias").value, 1, 100000)),
          p_enlace_nombre: sec.limpiarTexto(document.getElementById("post-enlace-nombre").value, false),
          p_enlace_cedula: sec.validarYNormalizarCedula(document.getElementById("post-enlace-cedula").value).valor,
          p_enlace_telefono: sec.limpiarTexto(document.getElementById("post-enlace-telefono").value, false),
          p_enlace_cargo: sec.limpiarTexto(document.getElementById("post-enlace-cargo").value, false),
          p_suplente_nombre: sec.limpiarTexto(document.getElementById("post-suplente-nombre").value, false),
          p_suplente_cedula: sec.validarYNormalizarCedula(document.getElementById("post-suplente-cedula").value).valor,
          p_suplente_telefono: sec.limpiarTexto(document.getElementById("post-suplente-telefono").value, false),
          p_ejes_apoyo: obtenerCheckboxes(formPostulacion, "post-ejes"),
          p_descripcion_solicitud: sec.limpiarTexto(document.getElementById("post-descripcion").value, true),
          p_voluntarios: voluntariosVal,
          p_voluntarios_cantidad: voluntariosVal === "Sí"
            ? String(sec.validarEntero(document.getElementById("post-voluntarios-cantidad").value, 1, 10000))
            : "0",
          p_espacio_fisico: espacioVal,
          p_espacio_cual: espacioVal === "Sí"
            ? sec.limpiarTexto(document.getElementById("post-espacio-cual").value, false)
            : "No aplica"
        };

        await backend.enviarRPC("registrar_postulacion_programa", payload);
        sec.registrarEnvioExitoso("programas_postulacion");
        sec.mostrarExito(formPostulacion);
      } catch (err) {
        console.error("Error al guardar postulación.");
        sec.mostrarErrorEnvio(
          formPostulacion,
          sec.mensajeErrorSeguro(
            err,
            "No pudimos registrar la postulación. Revisa tu conexión e inténtalo de nuevo."
          )
        );
      } finally {
        formPostulacion.removeAttribute("data-enviando");
        sec.liberarEnvio(formPostulacion);
      }
    });
  }
})();
