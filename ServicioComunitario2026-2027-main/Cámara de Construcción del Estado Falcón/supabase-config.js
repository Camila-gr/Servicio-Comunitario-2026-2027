/* =========================================================
   Configuración Centralizada de Supabase
   ========================================================= */
(function () {
    "use strict";

    const SUPABASE_URL = 'https://xzqtzqmrhbqfeyekrfyh.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_EfhImG2Ta_aPebdczr2YKQ_N_ksJO5z';

    if (window.supabase) {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error('La librería oficial de Supabase SDK no se cargó correctamente.');
    }
})();
