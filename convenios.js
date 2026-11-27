/* =========================================================
Cámara de Construcción Falcón — Interacciones del sitio
========================================================= */
(function () {
"use strict";
/* ---------- Menú móvil ---------- */
var toggle = document.querySelector(".nav-toggle");
var nav = document.querySelector(".main-nav");
if (toggle  && nav) {
toggle.addEventListener("click", function () {
var abierto = toggle.getAttribute("aria-expanded") === "true";
toggle.setAttribute("aria-expanded", String(!abierto));
toggle.setAttribute("aria-label", abierto ? "Abrir menú" : "Cerrar menú");
nav.classList.toggle("is-open", !abierto);
});
// Cerrar al pulsar Escape
 document.addEventListener("keydown", function (e) {
   if (e.key === "Escape" && nav.classList.contains("is-open")) {
     nav.classList.remove("is-open");
     toggle.setAttribute("aria-expanded", "false");
     toggle.focus();
   }
 });
 // Cerrar al pulsar fuera del menú
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
 // Cerrar al cambiar a escritorio
 var mq = window.matchMedia("(min-width: 901px)");
 mq.addEventListener("change", function (e) {
   if (e.matches) {
     nav.classList.remove("is-open");
     toggle.setAttribute("aria-expanded", "false");
   }
 });
}
/* ---------- Sombra del encabezado al desplazar ---------- */
var header = document.querySelector(".site-header");
if (header) {
var alDesplazar = function () {
header.classList.toggle("is-scrolled", window.scrollY > 8);
};
alDesplazar();
window.addEventListener("scroll", alDesplazar, { passive: true });
}
/* ---------- Animaciones de entrada (respetan movimiento reducido) ---------- */
var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var elementos = document.querySelectorAll(".reveal");
if (elementos.length) {
if (reduceMotion || !("IntersectionObserver" in window)) {
elementos.forEach(function (el) { el.classList.add("is-visible"); });
} else {
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
}
/* ---------- Año del pie de página ---------- */
var anio = document.querySelector("[data-anio]");
if (anio) anio.textContent = new Date().getFullYear();
/* ---------- Carrusel de imágenes del convenio ---------- */
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

// El usuario elige una imagen: se muestra y el carrusel se detiene
puntos.forEach(function (punto) {
punto.addEventListener("click", function () {
var destino = parseInt(punto.getAttribute("data-punto"), 10);
detener();
mostrar(isNaN(destino) ? 0 : destino);
});
});

// Pausar el avance cuando la pestaña no está visible
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
VENTANAS FLOTANTES DE FORMULARIOS
========================================================= */
var overlay = document.querySelector("[data-modal-overlay]");
var modales = document.querySelectorAll(".modal");
var modalAbierto = null;
if (overlay  && modales.length) {
var abrirModal = function (id) {
var m = document.getElementById(id);
if (!m) return;
if (modalAbierto  && modalAbierto !== m) {
modalAbierto.classList.remove("is-open");
modalAbierto.setAttribute("aria-hidden", "true");
}
modalAbierto = m;
m.classList.add("is-open");
m.setAttribute("aria-hidden", "false");
overlay.classList.add("is-visible");
document.body.classList.add("modal-abierto");
 prepararCenso(m.querySelector("[data-formulario]"));
 var btn = m.querySelector("[data-modal-cerrar]");
 if (btn) btn.focus();
};
// Modal listo para una nueva inscripción: formulario vacío y aviso oculto
 var restaurarModal = function (modal) {
   var form = modal.querySelector("[data-formulario]");
   if (form) {
     form.reset();
     form.style.display = "";
     form.querySelectorAll(".error-msg").forEach(function (el) { el.textContent = ""; });
     form.querySelectorAll(".input-invalido").forEach(function (campo) {
       campo.classList.remove("input-invalido");
       campo.removeAttribute("aria-invalid");
     });
     form.querySelectorAll("[data-error-grupo]").forEach(function (el) { el.textContent = ""; });
     ocultarErrorEnvio(form);
     liberarEnvio(form);
     form.removeAttribute("data-enviando");
     prepararCenso(form);
   }
   var aviso = modal.querySelector(".aviso-exito");
   if (aviso) aviso.classList.remove("is-visible");
   var cuerpo = modal.querySelector(".modal__cuerpo");
   if (cuerpo) cuerpo.scrollTop = 0;
 };
 var cerrarModal = function () {
   if (!modalAbierto) return;
   // No cerrar la ventana mientras se están guardando los datos
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

 /* =========================================================
 VALIDACIÓN DE CAMPOS Y CARACTERES REQUERIDOS
 ========================================================= */
 // Reglas de validación por campo (selector, longitud, patrón, mensaje)
 var reglasValidacion = {
   nombres: {
     selector: "[name='cens-nombres']",
     requerido: true,
     min: 3,
     max: 60,
     patron: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
     mensajeError: "Ingrese nombres válidos (solo letras, mínimo 3 caracteres)."
   },
   apellidos: {
     selector: "[name='cens-apellidos']",
     requerido: true,
     min: 3,
     max: 60,
     patron: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
     mensajeError: "Ingrese apellidos válidos (solo letras, mínimo 3 caracteres)."
   },
   cedula: {
     selector: "[name='cens-cedula']",
     requerido: true,
     min: 6,
     max: 12,
     patron: /^[VEJPvejp]?-?[0-9]{6,10}$/,
     mensajeError: "La cédula debe tener entre 6 y 10 números (puede incluir la letra V o E)."
   },
   nacimiento: {
     selector: "[name='cens-nacimiento']",
     requerido: true,
     min: 10,
     max: 10,
     mensajeError: "Ingrese una fecha de nacimiento válida."
   },
   direccion: {
     selector: "[name='cens-direccion']",
     requerido: true,
     min: 10,
     max: 200,
     mensajeError: "Indique sector / urbanización, calle / avenida, municipio y estado."
   },
   telefono: {
     selector: "[name='cens-telefono']",
     requerido: true,
     min: 7,
     max: 18,
     patron: /^[+0-9\s().-]{7,18}$/,
     mensajeError: "Ingrese un número de teléfono válido."
   },
   correo: {
     selector: "[name='cens-correo']",
     requerido: true,
     min: 5,
     max: 120,
     patron: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
     mensajeError: "Ingrese un correo electrónico válido."
   },
   bachiller: {
     selector: "[name='cens-bachiller']",
     requerido: true,
     mensajeError: "Indique si posee título de bachiller."
   },
   serial: {
     selector: "[name='cens-serial']",
     requerido: false,
     min: 3,
     max: 40
   },
   anioEgreso: {
     selector: "[name='cens-anio-egreso']",
     requerido: false,
     min: 4,
     max: 4,
     patron: /^(19|20)[0-9]{2}$/,
     mensajeError: "Indique un año de egreso válido de 4 dígitos (ej. 2019)."
   },
   universitarios: {
     selector: "[name='cens-universitarios']",
     requerido: true,
     mensajeError: "Indique si cursa actualmente estudios universitarios."
   },
   carrera: {
     selector: "[name='cens-carrera']",
     requerido: false,
     min: 3,
     max: 80
   },
   semestre: {
     selector: "[name='cens-semestre']",
     requerido: false,
     min: 1,
     max: 2,
     patron: /^[0-9]{1,2}$/,
     mensajeError: "Indique el semestre en números (ej. 5)."
   },
   institucion: {
     selector: "[name='cens-institucion']",
     requerido: false,
     min: 3,
     max: 80
   },
   otraDetalle: {
     selector: "[name='cens-otra-detalle']",
     requerido: false,
     min: 3,
     max: 120
   },
   modalidad: {
     selector: "[name='cens-modalidad']",
     requerido: true,
     mensajeError: "Seleccione una modalidad."
   }
 };

 // Campos que solo se piden según la respuesta del participante
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

 // Convierte DD/MM/YYYY al formato ISO (YYYY-MM-DD) de la columna date
 function fechaISO(valor) {
   var partes = String(valor || "").split("/");
   if (partes.length === 3) {
     return partes[2] + "-" + partes[1] + "-" + partes[0];
   }
   return new Date().toISOString().slice(0, 10);
 }

 // Habilita o bloquea los campos que dependen de otra respuesta
 function sincronizarDependencias(form) {
   dependenciasCenso.forEach(function (dep) {
     var control = form.querySelector("[name='" + dep.control + "']");
     var activo = !!control && control.value === "si";
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
         mostrarError(campo, "");
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
       mostrarError(detalle, "");
     }
   }
 }

 function prepararCenso(form) {
   if (!form) return;
   var fecha = form.querySelector("[name='cens-fecha-registro']");
   if (fecha) fecha.value = fechaRegistroHoy();
   sincronizarDependencias(form);
 }

 function validarGrupo(form, nombre, elementos) {
   var aviso = form.querySelector("[data-error-grupo='" + nombre + "']");
   var marcado = elementos.some(function (el) { return el.checked; });
   if (aviso) aviso.textContent = marcado ? "" : "Seleccione al menos una opción.";
   return marcado;
 }

 // Obtiene o crea el contenedor de error junto al campo
 function obtenerContenedorError(campo) {
   var contenedor = campo.parentElement.querySelector(".error-msg");
   if (!contenedor) {
     contenedor = document.createElement("span");
     contenedor.className = "error-msg";
     contenedor.setAttribute("role", "alert");
     contenedor.style.color = "#c0392b";
     contenedor.style.fontSize = "0.85rem";
     contenedor.style.marginTop = "4px";
     contenedor.style.display = "block";
     campo.parentElement.appendChild(contenedor);
   }
   return contenedor;
 }

 // Muestra u oculta el error de un campo
 function mostrarError(campo, mensaje) {
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

 // Valida un campo según sus reglas; retorna true si es válido
 function validarCampo(campo, regla) {
   var valor = (campo.value || "").trim();

   // Campo vacío
   if (regla.requerido && valor.length === 0) {
     mostrarError(campo, "Este campo es obligatorio.");
     return false;
   }
   if (!regla.requerido && valor.length === 0) {
     mostrarError(campo, "");
     return true;
   }

   // Longitud mínima
   if (regla.min && valor.length < regla.min) {
     mostrarError(campo, "Mínimo " + regla.min + " caracteres.");
     return false;
   }
   // Longitud máxima
   if (regla.max && valor.length > regla.max) {
     mostrarError(campo, "Máximo " + regla.max + " caracteres.");
     return false;
   }
   // Patrón (regex)
   if (regla.patron && !regla.patron.test(valor)) {
     mostrarError(campo, regla.mensajeError);
     return false;
   }

   // Validación especial para fecha: no puede ser futura
   if (regla === reglasValidacion.nacimiento) {
     var fechaIngresada = new Date(valor);
     var hoy = new Date();
     if (isNaN(fechaIngresada.getTime()) || fechaIngresada > hoy) {
       mostrarError(campo, "La fecha no puede ser futura.");
       return false;
     }
   }

   mostrarError(campo, "");
   return true;
 }

 // Valida todo el formulario; retorna true si todos los campos son válidos
 function validarFormulario(form) {
   var todoValido = true;
   var camposInvalidos = [];

   Object.keys(reglasValidacion).forEach(function (clave) {
     var regla = reglasValidacion[clave];
     var campo = form.querySelector(regla.selector);
     if (!campo || campo.disabled) return;
     var esValido = validarCampo(campo, regla);
     if (!esValido) {
       todoValido = false;
       camposInvalidos.push(campo);
     }
   });

   // Al menos un área de formación (o "Otra especialidad") y un turno
   var areas = Array.prototype.slice.call(form.querySelectorAll("[name='cens-areas']"));
   var otra = form.querySelector("#cens-otra-check");
   if (otra) areas.push(otra);
   if (!validarGrupo(form, "areas", areas)) {
     todoValido = false;
     if (areas.length) camposInvalidos.push(areas[0]);
   }

   var turnos = Array.prototype.slice.call(form.querySelectorAll("[name='cens-turno']"));
   if (!validarGrupo(form, "turno", turnos)) {
     todoValido = false;
     if (turnos.length) camposInvalidos.push(turnos[0]);
   }

   // Enfocar el primer campo inválido para mejor UX
   if (camposInvalidos.length > 0) {
     camposInvalidos[0].focus();
   }

   return todoValido;
 }

 // Valores marcados de un grupo de casillas
 function valoresMarcados(form, nombre) {
   return Array.prototype.slice.call(form.querySelectorAll("[name='" + nombre + "']"))
     .filter(function (el) { return el.checked; })
     .map(function (el) { return el.value; });
 }

 // Recopila los valores del formulario en un objeto
 function recopilarDatos(form) {
   var datos = { categoria: "Censo de formación" };
   Object.keys(reglasValidacion).forEach(function (clave) {
     var regla = reglasValidacion[clave];
     var campo = form.querySelector(regla.selector);
     if (campo) {
       datos[clave] = campo.value.trim();
     }
   });

   datos.areas = valoresMarcados(form, "cens-areas");
   var otra = form.querySelector("#cens-otra-check");
   if (otra && otra.checked) {
     var detalle = form.querySelector("[name='cens-otra-detalle']");
     datos.areas.push("Otra especialidad: " + (detalle ? detalle.value.trim() : ""));
   }
   datos.turno = valoresMarcados(form, "cens-turno");

   var fecha = form.querySelector("[name='cens-fecha-registro']");
   datos.fechaRegistro = fecha ? fecha.value : fechaRegistroHoy();
   return datos;
 }

 // Validación en tiempo real (al salir del campo)
 document.querySelectorAll("[data-formulario]").forEach(function (form) {
   Object.keys(reglasValidacion).forEach(function (clave) {
     var regla = reglasValidacion[clave];
     var campo = form.querySelector(regla.selector);
     if (!campo) return;

     campo.addEventListener("blur", function () {
       validarCampo(campo, regla);
     });
     campo.addEventListener("input", function () {
       // Limpiar error mientras escribe
       if (campo.classList.contains("input-invalido")) {
         mostrarError(campo, "");
       }
     });
     campo.addEventListener("change", function () {
       validarCampo(campo, regla);
     });
   });

   // Mostrar u ocultar los campos condicionales según la respuesta
   form.querySelectorAll("[name='cens-bachiller'], [name='cens-universitarios'], #cens-otra-check").forEach(function (control) {
     control.addEventListener("change", function () {
       sincronizarDependencias(form);
     });
   });

   // Ocultar el aviso del grupo en cuanto se marca alguna opción
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
 });

 /* =========================================================
 AVISOS Y ESTADO DE ENVÍO (experiencia de usuario)
 ========================================================= */
 // Crea el aviso de error justo antes del formulario, si no existe
 function prepararAvisoError(form) {
   var aviso = form.parentElement.querySelector(".aviso-error");
   if (!aviso) {
     aviso = document.createElement("div");
     aviso.className = "aviso-error";
     aviso.setAttribute("role", "alert");
     aviso.tabIndex = -1;
     aviso.style.display = "none";
     aviso.style.background = "#fdecea";
     aviso.style.border = "1px solid #f5c6c2";
     aviso.style.color = "#7f1d1d";
     aviso.style.borderRadius = "0.7rem";
     aviso.style.padding = "1.1rem 1.2rem";
     aviso.style.marginBottom = "1.1rem";
     form.parentElement.insertBefore(aviso, form);
   }
   return aviso;
 }

 function mostrarErrorEnvio(form, mensaje) {
   var aviso = prepararAvisoError(form);
   aviso.textContent = "";
   var titulo = document.createElement("strong");
   titulo.textContent = "No se pudo enviar";
   titulo.style.display = "block";
   titulo.style.fontSize = "1rem";
   titulo.style.marginBottom = "0.2rem";
   var texto = document.createElement("p");
   texto.textContent = mensaje;
   texto.style.margin = "0";
   texto.style.fontSize = "0.9rem";
   aviso.appendChild(titulo);
   aviso.appendChild(texto);
   aviso.style.display = "block";
   aviso.focus();
   irAlInicioDelModal(form);
 }

 function ocultarErrorEnvio(form) {
   var aviso = form.parentElement.querySelector(".aviso-error");
   if (aviso) aviso.style.display = "none";
 }

 function irAlInicioDelModal(form) {
   var caja = form.closest(".modal");
   var cuerpo = caja && caja.querySelector(".modal__cuerpo");
   if (cuerpo) cuerpo.scrollTop = 0;
 }

 // Muestra el mensaje de éxito, oculta el formulario y enfoca el aviso
 function mostrarExito(form) {
   ocultarErrorEnvio(form);
   var caja = form.closest(".modal");
   var aviso = caja && caja.querySelector(".aviso-exito");
   form.style.display = "none";
   if (aviso) {
     aviso.classList.add("is-visible");
     aviso.setAttribute("tabindex", "-1");
     // Botón para cerrar la ventana desde el propio mensaje de éxito
     if (!aviso.querySelector(".aviso-exito__cerrar")) {
       var cerrar = document.createElement("button");
       cerrar.type = "button";
       cerrar.className = "aviso-exito__cerrar btn btn--primario";
       cerrar.style.marginTop = "0.9rem";
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

 // Bloquea el botón durante el envío para evitar registros duplicados
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

 /* =========================================================
 ENVÍO DEL FORMULARIO CON VALIDACIÓN + SUPABASE
 ========================================================= */
 document.querySelectorAll("[data-formulario]").forEach(function (form) {
   form.addEventListener("submit", async function (e) {
     e.preventDefault();

     // Evita envíos duplicados mientras se guarda el registro
     if (form.getAttribute("data-enviando") === "1") return;

     // 1) Validación nativa HTML5 (required, type=email, etc.)
     if (!form.checkValidity()) {
       form.reportValidity();
       return;
     }

     // 2) Validación personalizada de campos y caracteres
     if (!validarFormulario(form)) {
       return; // NO procesa si falta o hay error en algún campo
     }

     // 3) Recopilar datos
     var datos = recopilarDatos(form);

     // 4) Enviar datos a Supabase (tabla convenios_censo)
     form.setAttribute("data-enviando", "1");
     ocultarErrorEnvio(form);
     bloquearEnvio(form);
     try {
       if (!window.supabaseClient) throw new Error("Supabase no está inicializado.");

       var datosSupabase = {
         fecha_registro: fechaISO(datos.fechaRegistro),
         nombres: datos.nombres,
         apellidos: datos.apellidos,
         cedula: datos.cedula,
         nacimiento: datos.nacimiento,
         direccion: datos.direccion,
         telefono: datos.telefono,
         correo: datos.correo,
         bachiller: datos.bachiller,
         serial_titulo: datos.serial || null,
         anio_egreso: datos.anioEgreso || null,
         universitarios: datos.universitarios,
         carrera: datos.carrera || null,
         semestre: datos.semestre || null,
         institucion: datos.institucion || null,
         areas: datos.areas,
         turno: datos.turno,
         modalidad: datos.modalidad
       };

       var resultado = await window.supabaseClient
         .from("convenios_censo")
         .insert([datosSupabase]);

       if (resultado.error) throw resultado.error;

       // 5) Confirmar éxito en pantalla
       mostrarExito(form);
       console.log("Registro guardado en Supabase (convenios_censo):", datos);
     } catch (err) {
       console.error("Error técnico en Supabase:", err.message);
       mostrarErrorEnvio(form, "No pudimos guardar tu registro. Revisa tu conexión e inténtalo de nuevo.");
     } finally {
       form.removeAttribute("data-enviando");
       liberarEnvio(form);
     }
   });
 });

}
})();
