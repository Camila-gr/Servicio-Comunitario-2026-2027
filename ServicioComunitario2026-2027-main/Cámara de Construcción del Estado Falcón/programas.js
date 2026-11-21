/* =========================================================
   Cámara de Construcción Falcón — Interacciones y Supabase (Programas)
   ========================================================= */
(function () {
    "use strict";

    // =====================================================================
    // Menú móvil
    // =====================================================================
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
            if (nav.classList.contains("is-open") && !nav.contains(e.target) && !toggle.contains(e.target)) {
                nav.classList.remove("is-open");
                toggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    // Sombra del encabezado
    var header = document.querySelector(".site-header");
    if (header) {
        var alDesplazar = function () {
            header.classList.toggle("is-scrolled", window.scrollY > 8);
        };
        alDesplazar();
        window.addEventListener("scroll", alDesplazar, { passive: true });
    }

    // Año del pie de página
    var anio = document.querySelector("[data-anio]");
    if (anio) anio.textContent = new Date().getFullYear();

    // =====================================================================
    // VENTANAS FLOTANTES DE FORMULARIOS (MODALES)
    // =====================================================================
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

    // =====================================================================
    // 2. ENVÍO DE FORMULARIOS A SUPABASE Y VALIDACIÓN
    // =====================================================================
    document.addEventListener('DOMContentLoaded', () => {

        // --- FORMULARIO 1: DIAGNÓSTICO (#modal-diagnostico) ---
        const formDiagnostico = document.querySelector('#modal-diagnostico form');
        if (formDiagnostico) {
            formDiagnostico.addEventListener('submit', async (e) => {
                e.preventDefault();

                const obtenerCheckboxes = (nombre) => {
                    const seleccionados = formDiagnostico.querySelectorAll(`input[name="${nombre}"]:checked`);
                    return Array.from(seleccionados).map(cb => cb.value);
                };

                const obtenerRadio = (nombre) => {
                    const seleccionado = formDiagnostico.querySelector(`input[name="${nombre}"]:checked`);
                    return seleccionado ? seleccionado.value : '';
                };

                // Mapeo exacto con las columnas de programas_diagnosticos
                const datosDiagnostico = {
                    parroquia: obtenerRadio('diag-parroquia'),
                    sector: document.getElementById('diag-sector')?.value || '',
                    edad: obtenerRadio('diag-edad'),
                    ocupacion: obtenerRadio('diag-ocupacion'),
                    ingresos: obtenerCheckboxes('diag-ingresos'),
                    aportantes: obtenerRadio('diag-aportantes'),
                    habitantes: obtenerRadio('diag-habitantes'),
                    calidad_vida: obtenerRadio('diag-calidad'),
                    serv_agua: document.getElementById('serv-1')?.value || '',
                    serv_aseo: document.getElementById('serv-2')?.value || '',
                    serv_electricidad: document.getElementById('serv-3')?.value || '',
                    serv_vialidad: document.getElementById('serv-4')?.value || '',
                    serv_transporte: document.getElementById('serv-5')?.value || '',
                    serv_seguridad: document.getElementById('serv-6')?.value || '',
                    serv_deporte: document.getElementById('serv-7')?.value || '',
                    perfil_alcalde: obtenerRadio('diag-perfil'),
                    cualidades_lider: obtenerCheckboxes('diag-cualidades'),
                    estilo_gestion: obtenerRadio('diag-estilo'),
                    prioridades: obtenerCheckboxes('diag-prioridades'),
                    problema_grave: document.getElementById('diag-problema')?.value || '',
                    economia_iniciativa: obtenerCheckboxes('diag-economia'),
                    juventud_proyectos: obtenerCheckboxes('diag-juventud'),
                    via_participacion: obtenerCheckboxes('diag-participacion'),
                    propuesta_obra: document.getElementById('diag-propuesta')?.value || ''
                };

                try {
                    if (!window.supabaseClient) throw new Error("Supabase no está inicializado.");

                    const { error } = await window.supabaseClient
                        .from('programas_diagnosticos')
                        .insert([datosDiagnostico]);

                    if (error) throw error;

                    const caja = formDiagnostico.closest(".modal");
                    const aviso = caja && caja.querySelector(".aviso-exito");
                    formDiagnostico.style.display = "none";
                    if (aviso) aviso.classList.add("is-visible");

                } catch (err) {
                    console.error('Error al guardar diagnóstico:', err.message);
                    alert('Hubo un error al enviar el cuestionario: ' + err.message);
                }
            });
        }

        // --- FORMULARIO 2: POSTULACIÓN SECTORIAL (#modal-postulacion) ---
        const formPostulacion = document.querySelector('#modal-postulacion form');
        if (formPostulacion) {
            formPostulacion.addEventListener('submit', async (e) => {
                e.preventDefault();

                const obtenerCheckboxes = (nombre) => {
                    const seleccionados = formPostulacion.querySelectorAll(`input[name="${nombre}"]:checked`);
                    return Array.from(seleccionados).map(cb => cb.value);
                };

                const obtenerRadio = (nombre) => {
                    const seleccionado = formPostulacion.querySelector(`input[name="${nombre}"]:checked`);
                    return seleccionado ? seleccionado.value : '';
                };

                // Mapeo exacto con las columnas de programas_postulaciones
                const datosPostulacion = {
                    parroquia: document.getElementById('post-parroquia')?.value || '',
                    fecha_solicitud: document.getElementById('post-fecha')?.value || '',
                    sector: document.getElementById('post-sector')?.value || '',
                    direccion: document.getElementById('post-direccion')?.value || '',
                    cantidad_familias: document.getElementById('post-familias')?.value || '',
                    enlace_nombre: document.getElementById('post-enlace-nombre')?.value || '',
                    enlace_cedula: document.getElementById('post-enlace-cedula')?.value || '',
                    enlace_telefono: document.getElementById('post-enlace-telefono')?.value || '',
                    enlace_cargo: document.getElementById('post-enlace-cargo')?.value || '',
                    suplente_nombre: document.getElementById('post-suplente-nombre')?.value || '',
                    suplente_cedula: document.getElementById('post-suplente-cedula')?.value || '',
                    suplente_telefono: document.getElementById('post-suplente-telefono')?.value || '',
                    ejes_apoyo: obtenerCheckboxes('post-ejes'),
                    descripcion_solicitud: document.getElementById('post-descripcion')?.value || '',
                    voluntarios: obtenerRadio('post-voluntarios'),
                    voluntarios_cantidad: document.getElementById('post-voluntarios-cantidad')?.value || '',
                    espacio_fisico: obtenerRadio('post-espacio'),
                    espacio_cual: document.getElementById('post-espacio-cual')?.value || ''
                };

                try {
                    if (!window.supabaseClient) throw new Error("Supabase no está inicializado.");

                    const { error } = await window.supabaseClient
                        .from('programas_postulaciones')
                        .insert([datosPostulacion]);

                    if (error) throw error;

                    const caja = formPostulacion.closest(".modal");
                    const aviso = caja && caja.querySelector(".aviso-exito");
                    formPostulacion.style.display = "none";
                    if (aviso) aviso.classList.add("is-visible");

                } catch (err) {
                    console.error('Error al guardar postulación:', err.message);
                    alert('Hubo un error al registrar la postulación: ' + err.message);
                }
            });
        }

    });

})();
