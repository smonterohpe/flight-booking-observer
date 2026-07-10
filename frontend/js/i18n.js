// Gestor de i18n. Los diccionarios (I18N_ES, I18N_PT, I18N_EN) se cargan
// antes que este fichero desde js/i18n/*.js
const I18n = (() => {
  const DICTIONARIES = { es: window.I18N_ES, pt: window.I18N_PT, en: window.I18N_EN };
  const STORAGE_KEY = "obs_console_lang";

  let currentLang = localStorage.getItem(STORAGE_KEY) || "es";
  if (!DICTIONARIES[currentLang]) currentLang = "es";

  function t(key) {
    return (DICTIONARIES[currentLang] && DICTIONARIES[currentLang][key]) || key;
  }

  function applyToDom(root = document) {
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
  }

  function setLang(lang) {
    if (!DICTIONARIES[lang]) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.setAttribute("lang", lang);
    applyToDom();
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("lang-btn--active", btn.dataset.lang === lang);
    });
    document.dispatchEvent(new CustomEvent("i18n:changed", { detail: { lang } }));
  }

  function getLang() {
    return currentLang;
  }

  function init() {
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.lang));
    });
    setLang(currentLang);
  }

  return { t, applyToDom, setLang, getLang, init };
})();

document.addEventListener("DOMContentLoaded", I18n.init);
