/* =========================================================
   Cámara de Construcción Falcón — Agremiados (Supabase + LocalStorage)
   ========================================================= */
(function () {
    "use strict";

    // =====================================================================
    // FUNCIÓN AUXILIAR DE ENVÍO DIRECTO A SUPABASE (SEGURO Y LIMPIO)
    // =====================================================================
    async function enviarDatosASupabase(nombreTabla, datosObjeto, formularioHTML) {
        try {
            if (!window.supabaseClient) throw new Error("Supabase no está inicializado.");

            // Limpiamos el objeto para enviar estrictamente las columnas de la tabla de Supabase
            const datosLimpios = {
                categoria: datosObjeto.categoria,
                nombre: datosObjeto.nombre,
                cedula: datosObjeto.cedula,
                nacimiento: datosObjeto.nacimiento,
                correo: datosObjeto.correo,
                rif: datosObjeto.rif,
                registro_o_titulo: datosObjeto.registro_o_titulo,
                extra_info: datosObjeto.extra_info
            };

            const { error } = await window.supabaseClient
                .from(nombreTabla)
                .insert([datosLimpios]);

            if (error) throw error;

            // Éxito: mostrar mensaje amigable al usuario y ocultar el formulario
            var caja = formularioHTML.closest(".modal");
            var aviso = caja && caja.querySelector(".aviso-exito");
            formularioHTML.style.display = "none";
            if (aviso) aviso.classList.add("is-visible");
            var cuerpo = caja && caja.querySelector(".modal__cuerpo");
            if (cuerpo) cuerpo.scrollTop = 0;

        } catch (err) {
            // El detalle técnico se queda solo en la consola del desarrollador
            console.error('Error técnico en Supabase:', err.message);
            // Mensaje genérico y seguro para el usuario
            alert('Hubo un error al registrar los datos. Por favor, inténtalo de nuevo más tarde.');
        }
    }

    // =====================================================================
    // 2. FORMULARIO 1: EMPRESA CONSTRUCTORA (#modal-empresa)
    // =====================================================================
    const formEmpresa = document.querySelector('#modal-empresa form');
    if (formEmpresa) {
        formEmpresa.addEventListener('submit', async (e) => {
            e.preventDefault();

            var tipo = "empresa";
            if (!validarFormulario(formEmpresa, tipo)) return;
            if (!formEmpresa.checkValidity()) {
                formEmpresa.reportValidity();
                return;
            }

            const datos = {
                categoria: 'Empresa',
                nombre: document.getElementById('emp-nombre').value,
                cedula: document.getElementById('emp-cedula').value,
                nacimiento: document.getElementById('emp-nacimiento').value,
                correo: document.getElementById('emp-correo').value,
                rif: document.getElementById('emp-rif').value,
                registro_o_titulo: document.getElementById('emp-registro').value,
                extra_info: null
            };

            guardarEnMemoriaLocal(tipo, datos);
            await enviarDatosASupabase('agremiado_form_general', datos, formEmpresa);
        });
    }

    // =====================================================================
    // 3. FORMULARIO 2: PROFESIONAL INDEPENDIENTE (#modal-profesional)
    // =====================================================================
    const formProfesional = document.querySelector('#modal-profesional form');
    if (formProfesional) {
        formProfesional.addEventListener('submit', async (e) => {
            e.preventDefault();

            var tipo = "profesional";
            if (!validarFormulario(formProfesional, tipo)) return;
            if (!formProfesional.checkValidity()) {
                formProfesional.reportValidity();
                return;
            }

            const profesion = document.getElementById('pro-profesion').value;
            const institucion = document.getElementById('pro-institucion').value;
            const anio = document.getElementById('pro-anio-graduacion').value;

            const datos = {
                categoria: 'Profesional',
                nombre: document.getElementById('pro-nombre').value,
                cedula: document.getElementById('pro-cedula').value,
                nacimiento: document.getElementById('pro-nacimiento').value,
                correo: document.getElementById('pro-correo').value,
                rif: document.getElementById('pro-rif').value,
                registro_o_titulo: `${profesion} - ${institucion}`,
                extra_info: anio
            };

            guardarEnMemoriaLocal(tipo, datos);
            await enviarDatosASupabase('agremiado_form_tecnico', datos, formProfesional);
        });
    }

    // =====================================================================
    // 4. FORMULARIO 3: PROVEEDOR (#modal-proveedor)
    // =====================================================================
    const formProveedor = document.querySelector('#modal-proveedor form');
    if (formProveedor) {
        formProveedor.addEventListener('submit', async (e) => {
            e.preventDefault();

            var tipo = "proveedor";
            if (!validarFormulario(formProveedor, tipo)) return;
            if (!formProveedor.checkValidity()) {
                formProveedor.reportValidity();
                return;
            }

            const datos = {
                categoria: 'Proveedor',
                nombre: document.getElementById('prov-nombre').value,
                cedula: document.getElementById('prov-cedula').value,
                nacimiento: document.getElementById('prov-nacimiento').value,
                correo: document.getElementById('prov-correo').value,
                rif: document.getElementById('prov-rif').value,
                registro_o_titulo: document.getElementById('prov-registro').value,
                extra_info: null
            };

            guardarEnMemoriaLocal(tipo, datos);
            await enviarDatosASupabase('agremiado_form_servicio', datos, formProveedor);
        });
    }

    /* =========================================================
    Cámara de Construcción Falcón — Interacciones del sitio
    ========================================================= */
    /* ---------- Menú móvil ---------- */
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (toggle && nav) {
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

    /* =========================================================
    VENTANAS FLOTANTES DE FORMULARIOS
    ========================================================= */
    var overlay = document.querySelector("[data-modal-overlay]");
    var modales = document.querySelectorAll(".modal");
    var modalAbierto = null;
    if (overlay && modales.length) {
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
            var btn = m.querySelector("[data-modal-cerrar]");
            if (btn) btn.focus();
        };

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
                form.querySelectorAll("[aria-invalid]").forEach(function (campo) {
                    campo.removeAttribute("aria-invalid");
                });
            }
            var aviso = modal.querySelector(".aviso-exito");
            if (aviso) aviso.classList.remove("is-visible");
            var cuerpo = modal.querySelector(".modal__cuerpo");
            if (cuerpo) cuerpo.scrollTop = 0;
        };

        var cerrarModal = function () {
            if (!modalAbierto) return;
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
    }

    /* =========================================================
    VALIDACIÓN DE CAMPOS Y CARACTERES REQUERIDOS - AGREMIADOS
    ========================================================= */
    var CLAVES_STORAGE = {
        empresa: "agremiados_empresa_constructora",
        profesional: "agremiados_profesional_independiente",
        proveedor: "agremiados_proveedor"
    };

    var PATRONES = {
        nombre: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]+$/,
        cedula: /^[VEJPvejp]?-?[0-9]{6,10}$/,
        correo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        rifEmpresa: /^[JVEjve]-?[0-9]{8,9}-?[0-9]?$/,
        rifNegocio: /^[Jj]-?[0-9]{8,9}-?[0-9]?$/,
        rifPersonal: /^[VEve]-?[0-9]{8,9}-?[0-9]?$/,
        registro: /^[0-9A-Za-zÁÉÍÓÚáéíóúÑÑüÜ][0-9A-Za-zÁÉÍÓÚáéíóúÑÑüÜ\-\/.\s]{3,39}$/,
        texto: /^[0-9A-Za-zÁÉÍÓÚáéíóúÑÑüÜ.,'()\/\-\s]+$/,
        anio: /^(19|20)[0-9]{2}$/
    };

    var reglasFormulario = {
        empresa: [
            { name: "emp-nombre", min: 3, max: 80, patron: PATRONES.nombre, mensajeError: "Ingrese nombre y apellido válidos (solo letras, mínimo 3 caracteres)." },
            { name: "emp-cedula", min: 6, max: 12, patron: PATRONES.cedula, mensajeError: "Cédula inválida. Formato: V-12345678." },
            { name: "emp-nacimiento", tipo: "fecha" },
            { name: "emp-correo", min: 5, max: 120, patron: PATRONES.correo, mensajeError: "Ingrese un correo electrónico válido." },
            { name: "emp-rif", min: 5, max: 15, patron: PATRONES.rifEmpresa, mensajeError: "RIF inválido. Formato: J-12345678-9." },
            { name: "emp-registro", min: 5, max: 40, patron: PATRONES.registro, mensajeError: "Ingrese un registro mercantil válido (mínimo 5 caracteres)." }
        ],
        profesional: [
            { name: "pro-nombre", min: 3, max: 80, patron: PATRONES.nombre, mensajeError: "Ingrese nombre y apellido válidos (solo letras, mínimo 3 caracteres)." },
            { name: "pro-cedula", min: 6, max: 12, patron: PATRONES.cedula, mensajeError: "Cédula inválida. Formato: V-12345678." },
            { name: "pro-nacimiento", tipo: "fecha" },
            { name: "pro-correo", min: 5, max: 120, patron: PATRONES.correo, mensajeError: "Ingrese un correo electrónico válido." },
            { name: "pro-rif", min: 5, max: 15, patron: PATRONES.rifPersonal, mensajeError: "RIF inválido. Formato: V-12345678-9." },
            { name: "pro-profesion", min: 3, max: 100, patron: PATRONES.texto, mensajeError: "Ingrese su profesión (mínimo 3 caracteres)." },
            { name: "pro-institucion", min: 3, max: 150, patron: PATRONES.texto, mensajeError: "Ingrese el nombre de la institución universitaria." },
            { name: "pro-anio-graduacion", min: 4, max: 4, patron: PATRONES.anio, mensajeError: "Año de graduación inválido (formato: YYYY)." }
        ],
        proveedor: [
            { name: "prov-nombre", min: 3, max: 80, patron: PATRONES.nombre, mensajeError: "Ingrese nombre y apellido válidos (solo letras, mínimo 3 caracteres)." },
            { name: "prov-cedula", min: 6, max: 12, patron: PATRONES.cedula, mensajeError: "Cédula inválida. Formato: V-12345678." },
            { name: "prov-nacimiento", tipo: "fecha" },
            { name: "prov-correo", min: 5, max: 120, patron: PATRONES.correo, mensajeError: "Ingrese un correo electrónico válido." },
            { name: "prov-rif", min: 5, max: 15, patron: PATRONES.rifNegocio, mensajeError: "RIF inválido. Formato: J-12345678-9." },
            { name: "prov-registro", min: 5, max: 40, patron: PATRONES.registro, mensajeError: "Ingrese un registro mercantil válido (mínimo 5 caracteres)." }
        ]
    };

    function obtenerContenedorError(campo) {
        var contenedor = campo.closest(".campo") || campo.parentElement;
        var errorEl = contenedor.querySelector(".error-msg");
        if (!errorEl) {
            errorEl = document.createElement("span");
            errorEl.className = "error-msg";
            errorEl.setAttribute("role", "alert");
            errorEl.style.color = "#c0392b";
            errorEl.style.fontSize = "0.85rem";
            errorEl.style.marginTop = "4px";
            errorEl.style.display = "block";
            contenedor.appendChild(errorEl);
        }
        return errorEl;
    }

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

    function validarCampo(campo, regla) {
        var valor = (regla.tipo === "fecha" ? campo.value : (campo.value || "").trim()) || "";

        if (valor.length === 0) {
            mostrarError(campo, "Este campo es obligatorio.");
            return false;
        }

        if (regla.tipo === "fecha") {
            var partes = valor.split("-");
            var fechaIngresada = new Date(valor + "T00:00:00");
            var hoy = new Date();
            hoy.setHours(23, 59, 59, 999);
            if (partes.length !== 3 || isNaN(fechaIngresada.getTime())) {
                mostrarError(campo, "Ingrese una fecha de nacimiento válida.");
                return false;
            }
            if (fechaIngresada > hoy) {
                mostrarError(campo, "La fecha no puede ser futura.");
                return false;
            }
            mostrarError(campo, "");
            return true;
        }

        if (regla.min && valor.length < regla.min) {
            mostrarError(campo, "Mínimo " + regla.min + " caracteres.");
            return false;
        }
        if (regla.max && valor.length > regla.max) {
            mostrarError(campo, "Máximo " + regla.max + " caracteres.");
            return false;
        }
        if (regla.patron && !regla.patron.test(valor)) {
            mostrarError(campo, regla.mensajeError || "Formato inválido.");
            return false;
        }

        mostrarError(campo, "");
        return true;
    }

    function determinarTipoFormulario(form) {
        if (form.querySelector("[name^='emp-']")) return "empresa";
        if (form.querySelector("[name^='pro-']")) return "profesional";
        if (form.querySelector("[name^='prov-']")) return "proveedor";
        return null;
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

        if (primerInvalido) primerInvalido.focus();

        return todoValido;
    }

    function guardarEnMemoriaLocal(tipo, datos) {
        var clave = CLAVES_STORAGE[tipo];
        if (!clave) return false;

        var registros = [];
        try {
            var almacenado = localStorage.getItem(clave);
            if (almacenado) {
                registros = JSON.parse(almacenado);
            }
        } catch (err) {
            console.warn("No se pudo leer localStorage:", err);
        }

        datos.id = Date.now();
        datos.fechaRegistro = new Date().toISOString();
        datos.estado = "pendiente";
        datos.tipo = tipo;
        registros.push(datos);

        try {
            localStorage.setItem(clave, JSON.stringify(registros));
            return true;
        } catch (err) {
            console.error("No se pudo guardar en localStorage:", err);
            return false;
        }
    }

    document.querySelectorAll("[data-formulario]").forEach(function (form) {
        var tipo = determinarTipoFormulario(form);
        if (!tipo) return;

        (reglasFormulario[tipo] || []).forEach(function (regla) {
            var campo = form.querySelector("[name='" + regla.name + "']");
            if (!campo) return;

            campo.addEventListener("blur", function () {
                validarCampo(campo, regla);
            });
            campo.addEventListener("input", function () {
                if (campo.classList.contains("input-invalido")) {
                    mostrarError(campo, "");
                }
            });
        });
    });

    /* =========================================================
    FUNCIONES AUXILIARES PARA RECUPERAR DATOS
    ========================================================= */
    window.AgremiadosStorage = {
        obtenerRegistros: function (tipo) {
            var clave = tipo ? CLAVES_STORAGE[tipo] : null;
            if (!clave) return [];
            try {
                var data = localStorage.getItem(clave);
                return data ? JSON.parse(data) : [];
            } catch (err) {
                return [];
            }
        },
        obtenerTodos: function () {
            var todos = [];
            Object.keys(CLAVES_STORAGE).forEach(function (tipo) {
                todos = todos.concat(this.obtenerRegistros(tipo));
            }.bind(this));
            return todos;
        },
        obtenerPendientes: function (tipo) {
            var registros = tipo ? this.obtenerRegistros(tipo) : this.obtenerTodos();
            return registros.filter(function (r) {
                return r.estado === "pendiente";
            });
        },
        marcarComoEnviado: function (tipo, id) {
            var clave = CLAVES_STORAGE[tipo];
            if (!clave) return;
            var registros = this.obtenerRegistros(tipo);
            registros.forEach(function (r) {
                if (r.id === id) r.estado = "enviado";
            });
            localStorage.setItem(clave, JSON.stringify(registros));
        },
        limpiar: function (tipo) {
            if (tipo) {
                localStorage.removeItem(CLAVES_STORAGE[tipo]);
            } else {
                Object.keys(CLAVES_STORAGE).forEach(function (t) {
                    localStorage.removeItem(CLAVES_STORAGE[t]);
                });
            }
        }
    };

})();
