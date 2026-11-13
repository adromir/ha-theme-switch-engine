/**
 * Standalone Theme Switch Engine Panel
 * Allows complete rule, theme, and Desktop/Mobile device management
 * without needing Vision Glass Dashboard or third-party tools.
 */

const TRANSLATIONS = {
  en: {
    loading: 'Loading Theme Engine...',
    title: 'Theme Switch Engine',
    subtitle: 'Hierarchical Rule Manager & Device Assignment (Desktop / Mobile)',
    evaluate_now: 'Evaluate Now',
    active_desktop_theme: 'Active Desktop Theme',
    active_mobile_theme: 'Active Mobile Theme',
    rule_prefix: 'Rule',
    prio_short: 'Prio',
    device_is_mobile: 'This device is Mobile',
    device_is_desktop: 'This device is Desktop',
    sun_and_variant: 'Sun & Variant',
    variant_light: 'Light Variant',
    variant_dark: 'Dark Variant',
    variant_static: 'Static Variant',
    status: 'Status',
    live_transition: 'Live Transition',
    enabled: 'Enabled',
    disabled: 'Disabled',
    duration: 'Duration',
    default_themes_title: 'Default Themes (Fallback)',
    desktop_light: 'Desktop Light Theme',
    desktop_dark: 'Desktop Dark Theme',
    mobile_light: 'Mobile Light Theme',
    mobile_dark: 'Mobile Dark Theme',
    rules_section_title: 'Hierarchical Rules (Highest Priority Wins)',
    add_rule: 'Add Rule',
    col_active: 'Active',
    col_prio: 'Prio',
    col_name: 'Rule Name',
    col_conditions: 'Conditions',
    col_desktop: 'Desktop Theme',
    col_mobile: 'Mobile Theme',
    col_actions: 'Actions',
    no_rules: 'No custom rules configured. Default fallbacks apply.',
    always_active: 'Always active',
    unnamed: 'Unnamed Rule',
    standard_theme: 'Default',
    same_as_desktop: 'Same as Desktop',
    preview_tooltip: '15s Preview',
    edit_tooltip: 'Edit',
    delete_tooltip: 'Delete',
    confirm_delete: 'Do you really want to delete this rule?',
    advanced_settings: 'Advanced Engine Settings',
    enable_transition: 'Enable smooth live transition effect',
    transition_duration: 'Transition duration:',
    show_sidebar: 'Show in Home Assistant sidebar',
    modal_create_title: 'Create New Theme Rule',
    modal_edit_title: 'Edit Theme Rule',
    rule_name_label: 'Rule Name',
    rule_name_placeholder: 'e.g. Summer Holiday, Cinema Mode, Rainy Weather',
    new_rule_default: 'New Rule',
    priority_label: 'Priority (Higher number overrides lower rules)',
    conditions_label: 'Conditions (All must match)',
    add_condition: 'Add Condition',
    remove_condition: 'Remove',
    cond_type_label: 'Condition Type',
    cond_weather: 'Weather State',
    cond_time: 'Time Range (supports midnight crossover)',
    cond_date_range: 'Date Range (annual or specific)',
    cond_weekday: 'Weekdays / Workday / Weekend',
    cond_season: 'Meteorological Season',
    cond_sun: 'Sun Position & Elevation',
    cond_entity_state: 'Any Entity State',
    weather_entity_label: 'Weather Entity',
    weather_global_default: 'Global Default Weather Entity',
    weather_states_label: 'Weather Conditions (select one or more)',
    weather_custom_label: 'Custom Weather State (optional)',
    time_after: 'From (After)',
    time_before: 'Until (Before)',
    date_start: 'Start Date (MM-DD or YYYY-MM-DD)',
    date_end: 'End Date (MM-DD or YYYY-MM-DD)',
    weekdays_label: 'Select Days or Presets',
    season_label: 'Season',
    season_spring: 'Spring',
    season_summer: 'Summer',
    season_autumn: 'Autumn',
    season_winter: 'Winter',
    sun_state_label: 'Sun Position',
    sun_above: 'Above Horizon (Light)',
    sun_below: 'Below Horizon (Dark)',
    sun_any: 'Any (use elevation range)',
    sun_min_elev: 'Min Elevation (°)',
    sun_max_elev: 'Max Elevation (°)',
    entity_label: 'Entity (search or select from list)',
    entity_placeholder: 'Select or type entity_id...',
    entity_state_label: 'Target State',
    weather_custom_state_option: '-- Enter custom weather state --',
    entity_custom_state_option: '-- Enter custom state --',
    entity_custom_state_label: 'Custom State Value',
    entity_current_hint: 'Current state',
    theme_desktop: 'Desktop Theme',
    theme_mobile: 'Mobile Theme (optional)',
    cancel: 'Cancel',
    save_rule: 'Save Rule',
    err_save_rules: 'Error saving rules: ',
    err_save_config: 'Error saving configuration: ',
    mode_auto: 'Automatic (Engine)',
    mode_force_light: 'Force Light',
    mode_force_dark: 'Force Dark',
    mode_paused: 'Paused',
    day_mon: 'Mon',
    day_tue: 'Tue',
    day_wed: 'Wed',
    day_thu: 'Thu',
    day_fri: 'Fri',
    day_sat: 'Sat',
    day_sun: 'Sun',
    day_workday: 'Workday',
    day_weekend: 'Weekend',
    w_sunny: 'Sunny',
    w_clear_night: 'Clear Night',
    w_cloudy: 'Cloudy',
    w_partlycloudy: 'Partly Cloudy',
    w_rainy: 'Rainy',
    w_pouring: 'Pouring',
    w_snowy: 'Snowy',
    w_snowy_rainy: 'Snowy / Rainy',
    w_lightning: 'Lightning',
    w_lightning_rainy: 'Thunderstorm',
    w_fog: 'Fog',
    w_hail: 'Hail',
    w_windy: 'Windy',
    w_windy_variant: 'Windy (Clouds)',
    w_exceptional: 'Exceptional',
    cond_prefix_date: 'Date',
    cond_prefix_to: 'to',
    cond_prefix_season: 'Season',
    cond_prefix_weather: 'Weather',
    cond_prefix_time: 'Time',
    cond_prefix_sun: 'Sun',
    cond_prefix_weekday: 'Days',
    cond_prefix_entity: 'Entity',
  },
  de: {
    loading: 'Lade Theme Engine...',
    title: 'Theme Switch Engine',
    subtitle: 'Hierarchischer Regel-Manager & Geräte-Zuweisung (Desktop / Mobil)',
    evaluate_now: 'Jetzt prüfen',
    active_desktop_theme: 'Aktives Desktop Theme',
    active_mobile_theme: 'Aktives Mobil Theme',
    rule_prefix: 'Regel',
    prio_short: 'Prio',
    device_is_mobile: 'Dieses Gerät ist Mobil',
    device_is_desktop: 'Dieses Gerät ist Desktop',
    sun_and_variant: 'Sonne & Modus-Variante',
    variant_light: 'Light-Variante',
    variant_dark: 'Dark-Variante',
    variant_static: 'Statisches Theme',
    status: 'Status',
    live_transition: 'Live-Übergang',
    enabled: 'Aktiviert',
    disabled: 'Deaktiviert',
    duration: 'Dauer',
    default_themes_title: 'Standard-Themes (Fallback)',
    desktop_light: 'Desktop Light-Theme',
    desktop_dark: 'Desktop Dark-Theme',
    mobile_light: 'Mobil Light-Theme',
    mobile_dark: 'Mobil Dark-Theme',
    rules_section_title: 'Hierarchische Regeln (Höchste Priorität gewinnt)',
    add_rule: 'Regel hinzufügen',
    col_active: 'Aktiv',
    col_prio: 'Prio',
    col_name: 'Regel-Name',
    col_conditions: 'Bedingungen',
    col_desktop: 'Desktop Theme',
    col_mobile: 'Mobil Theme',
    col_actions: 'Aktionen',
    no_rules: 'Keine benutzerdefinierten Regeln hinterlegt. Es greifen die Standard-Fallbacks.',
    always_active: 'Immer aktiv',
    unnamed: 'Unbenannte Regel',
    standard_theme: 'Standard',
    same_as_desktop: 'Wie Desktop',
    preview_tooltip: '15s Vorschau',
    edit_tooltip: 'Bearbeiten',
    delete_tooltip: 'Löschen',
    confirm_delete: 'Möchtest du diese Regel wirklich löschen?',
    advanced_settings: 'Erweiterte Engine-Einstellungen',
    enable_transition: 'Weichen Live-Übergangseffekt aktivieren',
    transition_duration: 'Übergangsdauer:',
    show_sidebar: 'In Home Assistant Seitenleiste anzeigen',
    modal_create_title: 'Neue Theme-Regel erstellen',
    modal_edit_title: 'Theme-Regel bearbeiten',
    rule_name_label: 'Regel-Name',
    rule_name_placeholder: 'z. B. Sommerurlaub, Kino-Modus, Regenwetter',
    new_rule_default: 'Neue Regel',
    priority_label: 'Priorität (Höhere Zahl überschreibt niedrigere Regeln)',
    conditions_label: 'Bedingungen (Alle müssen zutreffen)',
    add_condition: 'Bedingung hinzufügen',
    remove_condition: 'Entfernen',
    cond_type_label: 'Bedingungstyp',
    cond_weather: 'Wetterzustand',
    cond_time: 'Uhrzeit (mit Mitternachtsüberlauf)',
    cond_date_range: 'Datumsbereich (jährlich oder fest)',
    cond_weekday: 'Wochentage / Werktag / Wochenende',
    cond_season: 'Jahreszeit',
    cond_sun: 'Sonnenstand & Elevation',
    cond_entity_state: 'Beliebiger Entitätszustand',
    weather_entity_label: 'Wetter-Entität',
    weather_global_default: 'Globale Standard-Wetter-Entität',
    weather_states_label: 'Wetterzustände (einen oder mehrere wählen)',
    weather_custom_label: 'Eigener Wetterzustand (optional)',
    time_after: 'Von (Uhrzeit)',
    time_before: 'Bis (Uhrzeit)',
    date_start: 'Startdatum (MM-TT oder JJJJ-MM-TT)',
    date_end: 'Enddatum (MM-TT oder JJJJ-MM-TT)',
    weekdays_label: 'Wochentage oder Presets wählen',
    season_label: 'Jahreszeit',
    season_spring: 'Frühling',
    season_summer: 'Sommer',
    season_autumn: 'Herbst',
    season_winter: 'Winter',
    sun_state_label: 'Sonnenstand',
    sun_above: 'Über Horizont (Light)',
    sun_below: 'Unter Horizont (Dark)',
    sun_any: 'Beliebig (Elevationsbereich nutzen)',
    sun_min_elev: 'Min. Elevation (°)',
    sun_max_elev: 'Max. Elevation (°)',
    entity_label: 'Entität (suchen oder aus Liste wählen)',
    entity_placeholder: 'Entität auswählen oder tippen...',
    entity_state_label: 'Ziel-Zustand',
    weather_custom_state_option: '-- Eigenen Wetterzustand eingeben --',
    entity_custom_state_option: '-- Eigenen Zustand eingeben --',
    entity_custom_state_label: 'Eigener Zustandswert',
    entity_current_hint: 'Aktueller Zustand',
    theme_desktop: 'Desktop-Theme',
    theme_mobile: 'Mobil-Theme (optional)',
    cancel: 'Abbrechen',
    save_rule: 'Regel speichern',
    err_save_rules: 'Fehler beim Speichern der Regeln: ',
    err_save_config: 'Fehler beim Speichern der Konfiguration: ',
    mode_auto: 'Automatisch (Engine)',
    mode_force_light: 'Light erzwingen',
    mode_force_dark: 'Dark erzwingen',
    mode_paused: 'Pausiert',
    day_mon: 'Mo',
    day_tue: 'Di',
    day_wed: 'Mi',
    day_thu: 'Do',
    day_fri: 'Fr',
    day_sat: 'Sa',
    day_sun: 'So',
    day_workday: 'Werktag',
    day_weekend: 'Wochenende',
    w_sunny: 'Sonnig',
    w_clear_night: 'Klare Nacht',
    w_cloudy: 'Bewölkt',
    w_partlycloudy: 'Teilweise bewölkt',
    w_rainy: 'Regnerisch',
    w_pouring: 'Starkregen',
    w_snowy: 'Schnee',
    w_snowy_rainy: 'Schneeregen',
    w_lightning: 'Gewitter',
    w_lightning_rainy: 'Gewitter & Regen',
    w_fog: 'Nebel',
    w_hail: 'Hagel',
    w_windy: 'Windig',
    w_windy_variant: 'Windig & Bewölkt',
    w_exceptional: 'Ausnahmewetter',
    cond_prefix_date: 'Datum',
    cond_prefix_to: 'bis',
    cond_prefix_season: 'Saison',
    cond_prefix_weather: 'Wetter',
    cond_prefix_time: 'Zeit',
    cond_prefix_sun: 'Sonne',
    cond_prefix_weekday: 'Tage',
    cond_prefix_entity: 'Entität',
  },
  id: {
    loading: 'Memuat Theme Engine...',
    title: 'Theme Switch Engine',
    subtitle: 'Pengelola Aturan Hierarkis & Penetapan Perangkat (Desktop / Seluler)',
    evaluate_now: 'Periksa Sekarang',
    active_desktop_theme: 'Tema Desktop Aktif',
    active_mobile_theme: 'Tema Seluler Aktif',
    rule_prefix: 'Aturan',
    prio_short: 'Prio',
    device_is_mobile: 'Perangkat ini adalah Seluler',
    device_is_desktop: 'Perangkat ini adalah Desktop',
    sun_and_variant: 'Matahari & Varian',
    variant_light: 'Varian Light',
    variant_dark: 'Varian Dark',
    variant_static: 'Tema Statis',
    status: 'Status',
    live_transition: 'Transisi Langsung',
    enabled: 'Diaktifkan',
    disabled: 'Dinonaktifkan',
    duration: 'Durasi',
    default_themes_title: 'Tema Default (Cadangan)',
    desktop_light: 'Tema Light Desktop',
    desktop_dark: 'Tema Dark Desktop',
    mobile_light: 'Tema Light Seluler',
    mobile_dark: 'Tema Dark Seluler',
    rules_section_title: 'Aturan Hierarkis (Prioritas Tertinggi Menang)',
    add_rule: 'Tambah Aturan',
    col_active: 'Aktif',
    col_prio: 'Prio',
    col_name: 'Nama Aturan',
    col_conditions: 'Kondisi',
    col_desktop: 'Tema Desktop',
    col_mobile: 'Tema Seluler',
    col_actions: 'Aksi',
    no_rules: 'Belum ada aturan kustom. Tema cadangan default diterapkan.',
    always_active: 'Selalu aktif',
    unnamed: 'Aturan Tanpa Nama',
    standard_theme: 'Default',
    same_as_desktop: 'Sama dengan Desktop',
    preview_tooltip: 'Pratinjau 15dtk',
    edit_tooltip: 'Ubah',
    delete_tooltip: 'Hapus',
    confirm_delete: 'Apakah Anda yakin ingin menghapus aturan ini?',
    advanced_settings: 'Pengaturan Lanjutan Engine',
    enable_transition: 'Aktifkan efek transisi langsung yang halus',
    transition_duration: 'Durasi transisi:',
    show_sidebar: 'Tampilkan di bilah samping Home Assistant',
    modal_create_title: 'Buat Aturan Tema Baru',
    modal_edit_title: 'Ubah Aturan Tema',
    rule_name_label: 'Nama Aturan',
    rule_name_placeholder: 'mis. Liburan Musim Panas, Mode Bioskop, Cuaca Hujan',
    new_rule_default: 'Aturan Baru',
    priority_label: 'Prioritas (Angka lebih tinggi menimpa aturan di bawahnya)',
    conditions_label: 'Kondisi (Semua harus cocok)',
    add_condition: 'Tambah Kondisi',
    remove_condition: 'Hapus',
    cond_type_label: 'Jenis Kondisi',
    cond_weather: 'Kondisi Cuaca',
    cond_time: 'Rentang Waktu (mendukung lewat tengah malam)',
    cond_date_range: 'Rentang Tanggal (tahunan atau spesifik)',
    cond_weekday: 'Hari Kerja / Akhir Pekan',
    cond_season: 'Musim Meteorologis',
    cond_sun: 'Posisi & Elevasi Matahari',
    cond_entity_state: 'Status Entitas Apa Saja',
    weather_entity_label: 'Entitas Cuaca',
    weather_global_default: 'Entitas Cuaca Default Global',
    weather_states_label: 'Kondisi Cuaca (pilih satu atau lebih)',
    weather_custom_label: 'Status Cuaca Kustom (opsional)',
    time_after: 'Dari (Setelah)',
    time_before: 'Sampai (Sebelum)',
    date_start: 'Tanggal Mulai (BB-HH atau TTTT-BB-HH)',
    date_end: 'Tanggal Selesai (BB-HH atau TTTT-BB-HH)',
    weekdays_label: 'Pilih Hari atau Preset',
    season_label: 'Musim',
    season_spring: 'Musim Semi',
    season_summer: 'Musim Panas',
    season_autumn: 'Musim Gugur',
    season_winter: 'Musim Dingin',
    sun_state_label: 'Posisi Matahari',
    sun_above: 'Di Atas Cakrawala (Light)',
    sun_below: 'Di Bawah Cakrawala (Dark)',
    sun_any: 'Apa saja (gunakan rentang elevasi)',
    sun_min_elev: 'Elevasi Min (°)',
    sun_max_elev: 'Elevasi Maks (°)',
    entity_label: 'Entitas (cari atau pilih dari daftar)',
    entity_placeholder: 'Pilih atau ketik entity_id...',
    entity_state_label: 'Status Target',
    weather_custom_state_option: '-- Masukkan status cuaca kustom --',
    entity_custom_state_option: '-- Masukkan status kustom --',
    entity_custom_state_label: 'Nilai Status Kustom',
    entity_current_hint: 'Status saat ini',
    theme_desktop: 'Tema Desktop',
    theme_mobile: 'Tema Seluler (opsional)',
    cancel: 'Batal',
    save_rule: 'Simpan Aturan',
    err_save_rules: 'Gagal menyimpan aturan: ',
    err_save_config: 'Gagal menyimpan konfigurasi: ',
    mode_auto: 'Otomatis (Engine)',
    mode_force_light: 'Paksa Light',
    mode_force_dark: 'Paksa Dark',
    mode_paused: 'Dijeda',
    day_mon: 'Sen',
    day_tue: 'Sel',
    day_wed: 'Rab',
    day_thu: 'Kam',
    day_fri: 'Jum',
    day_sat: 'Sab',
    day_sun: 'Min',
    day_workday: 'Hari Kerja',
    day_weekend: 'Akhir Pekan',
    w_sunny: 'Cerah',
    w_clear_night: 'Malam Cerah',
    w_cloudy: 'Berawan',
    w_partlycloudy: 'Sebagian Berawan',
    w_rainy: 'Hujan',
    w_pouring: 'Hujan Deras',
    w_snowy: 'Bersalju',
    w_snowy_rainy: 'Hujan Salju',
    w_lightning: 'Petir',
    w_lightning_rainy: 'Badai Petir',
    w_fog: 'Kabut',
    w_hail: 'Hujan Es',
    w_windy: 'Berangin',
    w_windy_variant: 'Berangin & Berawan',
    w_exceptional: 'Ekstrem',
    cond_prefix_date: 'Tanggal',
    cond_prefix_to: 's/d',
    cond_prefix_season: 'Musim',
    cond_prefix_weather: 'Cuaca',
    cond_prefix_time: 'Waktu',
    cond_prefix_sun: 'Matahari',
    cond_prefix_weekday: 'Hari',
    cond_prefix_entity: 'Entitas',
  },
};

const STANDARD_WEATHER_STATES = [
  'sunny', 'clear-night', 'cloudy', 'partlycloudy', 'rainy',
  'pouring', 'snowy', 'snowy-rainy', 'lightning', 'lightning-rainy',
  'fog', 'hail', 'windy', 'windy-variant', 'exceptional',
];

const WEATHER_KEY_MAP = {
  'sunny': 'w_sunny',
  'clear-night': 'w_clear_night',
  'cloudy': 'w_cloudy',
  'partlycloudy': 'w_partlycloudy',
  'rainy': 'w_rainy',
  'pouring': 'w_pouring',
  'snowy': 'w_snowy',
  'snowy-rainy': 'w_snowy_rainy',
  'lightning': 'w_lightning',
  'lightning-rainy': 'w_lightning_rainy',
  'fog': 'w_fog',
  'hail': 'w_hail',
  'windy': 'w_windy',
  'windy-variant': 'w_windy_variant',
  'exceptional': 'w_exceptional',
};

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'workday', 'weekend'];

const DOMAIN_DEFAULT_STATES = {
  light: ['on', 'off'],
  switch: ['on', 'off'],
  fan: ['on', 'off'],
  input_boolean: ['on', 'off'],
  binary_sensor: ['on', 'off'],
  automation: ['on', 'off'],
  script: ['on', 'off'],
  lock: ['locked', 'unlocked', 'locking', 'unlocking', 'jammed'],
  cover: ['open', 'closed', 'opening', 'closing'],
  alarm_control_panel: ['disarmed', 'armed_home', 'armed_away', 'armed_night', 'armed_vacation', 'armed_custom_bypass', 'pending', 'triggered', 'arming'],
  media_player: ['playing', 'paused', 'idle', 'standby', 'off', 'on', 'buffering'],
  vacuum: ['cleaning', 'docked', 'paused', 'idle', 'returning', 'error'],
  climate: ['heat', 'cool', 'heat_cool', 'auto', 'dry', 'fan_only', 'off'],
  sun: ['above_horizon', 'below_horizon'],
  season: ['spring', 'summer', 'autumn', 'winter'],
  weather: STANDARD_WEATHER_STATES,
};

class ThemeSwitchEnginePanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._panel = null;
    this._data = null;
    this._loading = false;
    this._showRuleModal = false;
    this._editingRuleIndex = null;
    this._draftRule = null;
  }

  set hass(val) {
    this._hass = val;
    if (!this._data && !this._loading) {
      this._loadData();
    }
  }

  set panel(val) {
    this._panel = val;
  }

  _getLang() {
    const raw = this._hass?.locale?.language || this._hass?.language || navigator.language || 'en';
    const base = String(raw).toLowerCase().split(/[-_]/)[0];
    return TRANSLATIONS[base] ? base : 'en';
  }

  _t(key) {
    const lang = this._getLang();
    return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.en[key] || key;
  }

  _escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  _getModeDisplay(mode) {
    if (mode === 'Auto (Engine)') return this._t('mode_auto');
    if (mode === 'Force Light' || mode === 'Force Day') return this._t('mode_force_light');
    if (mode === 'Force Dark' || mode === 'Force Night') return this._t('mode_force_dark');
    if (mode === 'Paused') return this._t('mode_paused');
    return mode;
  }

  async _loadData() {
    if (!this._hass || !this._hass.callWS) return;
    this._loading = true;
    try {
      const res = await this._hass.callWS({ type: 'theme_switch_engine/rules/get' });
      this._data = res;
      this._render();
    } catch (err) {
      console.error('[ThemeEngine] Failed to load data:', err);
    } finally {
      this._loading = false;
    }
  }

  async _saveRules(newRules) {
    if (!this._hass || !this._hass.callWS) return;
    try {
      await this._hass.callWS({ type: 'theme_switch_engine/rules/save', rules: newRules });
      await this._loadData();
    } catch (err) {
      alert(this._t('err_save_rules') + err.message);
    }
  }

  async _saveConfig(newConfig) {
    if (!this._hass || !this._hass.callWS) return;
    try {
      await this._hass.callWS({ type: 'theme_switch_engine/config/save', config: newConfig });
      await this._loadData();
    } catch (err) {
      alert(this._t('err_save_config') + err.message);
    }
  }

  async _setMode(mode) {
    if (!this._hass) return;
    try {
      await this._hass.callService('theme_switch_engine', 'set_mode', { mode });
      await this._loadData();
    } catch (err) {
      console.error(err);
    }
  }

  async _evaluate() {
    if (!this._hass) return;
    try {
      await this._hass.callService('theme_switch_engine', 'evaluate', { force: true });
      await this._loadData();
    } catch (err) {
      console.error(err);
    }
  }

  async _preview(theme) {
    if (!this._hass) return;
    try {
      await this._hass.callService('theme_switch_engine', 'preview_theme', { theme, duration: 15 });
    } catch (err) {
      console.error(err);
    }
  }

  _isMobileClient() {
    const mq = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
    const ua = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
    return Boolean(mq || ua);
  }

  _getAllThemes() {
    const d = this._data || {};
    return Array.from(new Set([
      'default',
      ...(d.themes || []),
      ...Object.keys(this._hass?.themes?.themes || {}),
    ])).sort();
  }

  _getEntityCandidateStates(entityId) {
    const statesSet = new Set();
    const allStates = this._hass?.states || {};
    const stateObj = entityId ? allStates[entityId] : null;
    const domain = entityId && entityId.includes('.') ? entityId.split('.')[0] : '';

    if (stateObj) {
      if (stateObj.state && !['unknown', 'unavailable'].includes(stateObj.state)) {
        statesSet.add(String(stateObj.state));
      }
      const attrs = stateObj.attributes || {};
      if (Array.isArray(attrs.options)) {
        attrs.options.forEach(o => statesSet.add(String(o)));
      }
      if (Array.isArray(attrs.hvac_modes)) {
        attrs.hvac_modes.forEach(o => statesSet.add(String(o)));
      }
      if (Array.isArray(attrs.preset_modes)) {
        attrs.preset_modes.forEach(o => statesSet.add(String(o)));
      }
    }

    if (domain === 'person' || domain === 'device_tracker') {
      statesSet.add('home');
      statesSet.add('not_home');
      Object.entries(allStates).forEach(([eid, st]) => {
        if (eid.startsWith('zone.') && st?.attributes?.friendly_name) {
          statesSet.add(st.attributes.friendly_name);
        }
      });
    }

    if (DOMAIN_DEFAULT_STATES[domain]) {
      DOMAIN_DEFAULT_STATES[domain].forEach(s => statesSet.add(s));
    }

    // Collect distinct live states observed across other entities of the same domain
    if (domain) {
      Object.entries(allStates).forEach(([eid, st]) => {
        if (eid.startsWith(domain + '.') && st?.state && !['unknown', 'unavailable'].includes(st.state)) {
          if (domain !== 'sensor' && domain !== 'number' && domain !== 'input_number') {
            statesSet.add(String(st.state));
          }
        }
      });
    }

    return Array.from(statesSet);
  }

  _getWeatherStatesForEntity(entityId) {
    const statesSet = new Set(STANDARD_WEATHER_STATES);
    const allStates = this._hass?.states || {};
    const targetIds = entityId ? [entityId] : Object.keys(allStates).filter(id => id.startsWith('weather.'));
    targetIds.forEach(eid => {
      const st = allStates[eid];
      if (st && st.state && !['unknown', 'unavailable'].includes(st.state)) {
        statesSet.add(st.state);
      }
      const forecast = st?.attributes?.forecast;
      if (Array.isArray(forecast)) {
        forecast.forEach(f => {
          if (f?.condition) statesSet.add(f.condition);
        });
      }
    });
    return Array.from(statesSet);
  }

  _openRuleModal(ruleIndex = null) {
    const themes = this._getAllThemes();
    const defaultDesktop = this._data?.config?.default_theme_light || this._data?.config?.default_theme_day || themes[0] || 'default';

    if (ruleIndex !== null && this._data?.rules?.[ruleIndex]) {
      const src = this._data.rules[ruleIndex];
      const conds = (src.conditions && src.conditions.length > 0)
        ? src.conditions.map(c => ({ ...c }))
        : [{ type: 'weather', states: 'rainy' }];

      this._editingRuleIndex = ruleIndex;
      this._draftRule = {
        id: src.id,
        name: src.name || this._t('new_rule_default'),
        priority: src.priority ?? 50,
        enabled: src.enabled !== false,
        theme: src.theme || src.theme_light || src.theme_day || src.theme_dark || src.theme_night || defaultDesktop,
        theme_mobile: src.theme_mobile || src.theme_mobile_light || src.theme_mobile_day || src.theme_mobile_dark || src.theme_mobile_night || '',
        conditions: conds,
      };
    } else {
      this._editingRuleIndex = null;
      this._draftRule = {
        id: 'rule_' + Date.now(),
        name: this._t('new_rule_default'),
        priority: 50,
        enabled: true,
        theme: defaultDesktop,
        theme_mobile: '',
        conditions: [{ type: 'weather', states: 'rainy' }],
      };
    }

    this._showRuleModal = true;
    this._render();
  }

  _defaultConditionForType(type) {
    if (type === 'weather') return { type: 'weather', states: 'rainy' };
    if (type === 'time') return { type: 'time', after: '20:00', before: '06:00' };
    if (type === 'date_range') return { type: 'date_range', start_date: '12-24', end_date: '12-26' };
    if (type === 'weekday') return { type: 'weekday', days: ['sat', 'sun'] };
    if (type === 'season') return { type: 'season', season: 'winter' };
    if (type === 'sun') return { type: 'sun', state: 'below_horizon' };
    if (type === 'entity_state') {
      const firstEid = Object.keys(this._hass?.states || {})[0] || '';
      const candidates = this._getEntityCandidateStates(firstEid);
      return { type: 'entity_state', entity_id: firstEid, state: candidates[0] || 'on' };
    }
    return { type };
  }

  _formatConditionSummary(c) {
    if (c.type === 'date_range') {
      return `${this._t('cond_prefix_date')}: ${c.start_date || ''} ${this._t('cond_prefix_to')} ${c.end_date || ''}`;
    }
    if (c.type === 'season') {
      const sKey = 'season_' + (c.season || '');
      const label = TRANSLATIONS[this._getLang()]?.[sKey] ? this._t(sKey) : c.season;
      return `${this._t('cond_prefix_season')}: ${label}`;
    }
    if (c.type === 'weather') {
      const list = Array.isArray(c.states) ? c.states.join(', ') : (c.states || '');
      return `${this._t('cond_prefix_weather')}: ${list}`;
    }
    if (c.type === 'time') {
      return `${this._t('cond_prefix_time')}: ${c.after || '00:00'} - ${c.before || '24:00'}`;
    }
    if (c.type === 'sun') {
      return `${this._t('cond_prefix_sun')}: ${c.state || `elev ${c.min_elevation ?? ''}..${c.max_elevation ?? ''}`}`;
    }
    if (c.type === 'weekday') {
      const days = Array.isArray(c.days) ? c.days : String(c.days || '').split(',');
      return `${this._t('cond_prefix_weekday')}: ${days.map(d => this._t('day_' + d.trim())).join(', ')}`;
    }
    if (c.type === 'entity_state') {
      return `${this._t('cond_prefix_entity')}: ${c.entity_id || ''} = ${c.state ?? ''}`;
    }
    return c.type;
  }

  _renderConditionFields(cond, idx) {
    const allStates = this._hass?.states || {};
    const weatherEntities = Object.keys(allStates).filter(eid => eid.startsWith('weather.')).sort();

    if (cond.type === 'weather') {
      const rawStates = Array.isArray(cond.states)
        ? cond.states.map(s => String(s).trim().toLowerCase())
        : String(cond.states || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      const candidates = this._getWeatherStatesForEntity(cond.entity_id);
      const curState = rawStates[0] || '';
      const isCustom = curState && !candidates.includes(curState);
      const selectVal = isCustom ? '__custom__' : (candidates.includes(curState) ? curState : (candidates[0] || 'sunny'));
      const customVal = isCustom ? curState : '';

      return `
        <div class="sub-field-group">
          <label class="field-label">${this._t('weather_entity_label')}</label>
          <select class="cond-weather-entity" data-cidx="${idx}">
            <option value="" ${!cond.entity_id ? 'selected' : ''}>${this._t('weather_global_default')}</option>
            ${weatherEntities.map(eid => {
              const name = allStates[eid]?.attributes?.friendly_name || eid;
              return `<option value="${this._escapeHtml(eid)}" ${cond.entity_id === eid ? 'selected' : ''}>${this._escapeHtml(name)} (${this._escapeHtml(eid)})</option>`;
            }).join('')}
          </select>
        </div>
        <div class="sub-field-group">
          <label class="field-label">${this._t('weather_states_label')}</label>
          <select class="cond-weather-val" data-cidx="${idx}">
            ${candidates.map(st => {
              const tKey = WEATHER_KEY_MAP[st];
              const label = tKey ? `${this._t(tKey)} (${st})` : st;
              return `<option value="${this._escapeHtml(st)}" ${selectVal === st ? 'selected' : ''}>${this._escapeHtml(label)}</option>`;
            }).join('')}
            <option value="__custom__" ${selectVal === '__custom__' ? 'selected' : ''}>${this._t('weather_custom_state_option')}</option>
          </select>
        </div>
        <div class="sub-field-group cond-weather-custom-wrap" data-cidx="${idx}" style="display:${selectVal === '__custom__' ? 'block' : 'none'};">
          <label class="field-label">${this._t('weather_custom_label')}</label>
          <input type="text" class="cond-weather-custom-input" data-cidx="${idx}" value="${this._escapeHtml(customVal)}" placeholder="e.g. drizzle, sleet">
        </div>
      `;
    }

    if (cond.type === 'time') {
      return `
        <div class="grid-2">
          <div class="sub-field-group">
            <label class="field-label">${this._t('time_after')}</label>
            <input type="time" class="cond-time-after" data-cidx="${idx}" value="${this._escapeHtml(cond.after || '20:00')}">
          </div>
          <div class="sub-field-group">
            <label class="field-label">${this._t('time_before')}</label>
            <input type="time" class="cond-time-before" data-cidx="${idx}" value="${this._escapeHtml(cond.before || '06:00')}">
          </div>
        </div>
      `;
    }

    if (cond.type === 'date_range') {
      return `
        <div class="grid-2">
          <div class="sub-field-group">
            <label class="field-label">${this._t('date_start')}</label>
            <input type="text" class="cond-date-start" data-cidx="${idx}" value="${this._escapeHtml(cond.start_date || '12-24')}" placeholder="MM-DD">
          </div>
          <div class="sub-field-group">
            <label class="field-label">${this._t('date_end')}</label>
            <input type="text" class="cond-date-end" data-cidx="${idx}" value="${this._escapeHtml(cond.end_date || '12-26')}" placeholder="MM-DD">
          </div>
        </div>
      `;
    }

    if (cond.type === 'weekday') {
      const selectedDays = Array.isArray(cond.days)
        ? cond.days.map(d => String(d).trim().toLowerCase())
        : String(cond.days || '').split(',').map(d => d.trim().toLowerCase()).filter(Boolean);

      return `
        <div class="sub-field-group">
          <label class="field-label">${this._t('weekdays_label')}</label>
          <div class="pill-grid">
            ${WEEKDAY_KEYS.map(day => {
              const active = selectedDays.includes(day);
              return `<button type="button" class="cond-pill cond-day-pill ${active ? 'active' : ''}" data-cidx="${idx}" data-val="${day}">${this._t('day_' + day)}</button>`;
            }).join('')}
          </div>
        </div>
      `;
    }

    if (cond.type === 'season') {
      const curSeason = (cond.season || 'winter').toLowerCase();
      return `
        <div class="sub-field-group">
          <label class="field-label">${this._t('season_label')}</label>
          <select class="cond-season-val" data-cidx="${idx}">
            <option value="spring" ${curSeason === 'spring' ? 'selected' : ''}>${this._t('season_spring')}</option>
            <option value="summer" ${curSeason === 'summer' ? 'selected' : ''}>${this._t('season_summer')}</option>
            <option value="autumn" ${curSeason === 'autumn' ? 'selected' : ''}>${this._t('season_autumn')}</option>
            <option value="winter" ${curSeason === 'winter' ? 'selected' : ''}>${this._t('season_winter')}</option>
          </select>
        </div>
      `;
    }

    if (cond.type === 'sun') {
      const sunState = cond.state || '';
      return `
        <div class="sub-field-group">
          <label class="field-label">${this._t('sun_state_label')}</label>
          <select class="cond-sun-state" data-cidx="${idx}">
            <option value="above_horizon" ${sunState === 'above_horizon' ? 'selected' : ''}>${this._t('sun_above')}</option>
            <option value="below_horizon" ${sunState === 'below_horizon' ? 'selected' : ''}>${this._t('sun_below')}</option>
            <option value="" ${!sunState ? 'selected' : ''}>${this._t('sun_any')}</option>
          </select>
        </div>
        <div class="grid-2">
          <div class="sub-field-group">
            <label class="field-label">${this._t('sun_min_elev')}</label>
            <input type="number" step="0.5" class="cond-sun-min" data-cidx="${idx}" value="${cond.min_elevation ?? ''}" placeholder="-90 .. 90">
          </div>
          <div class="sub-field-group">
            <label class="field-label">${this._t('sun_max_elev')}</label>
            <input type="number" step="0.5" class="cond-sun-max" data-cidx="${idx}" value="${cond.max_elevation ?? ''}" placeholder="-90 .. 90">
          </div>
        </div>
      `;
    }

    if (cond.type === 'entity_state') {
      const entityId = cond.entity_id || '';
      const curState = cond.state !== undefined && cond.state !== null ? String(cond.state) : '';
      const entityIds = Object.keys(allStates).sort();
      const candidates = this._getEntityCandidateStates(entityId);
      const stObj = entityId ? allStates[entityId] : null;
      const isCustom = curState && !candidates.includes(curState);
      const selectVal = isCustom ? '__custom__' : (candidates.includes(curState) ? curState : '__custom__');

      return `
        <datalist id="tseEntitiesList_${idx}">
          ${entityIds.map(eid => {
            const fname = allStates[eid]?.attributes?.friendly_name || '';
            return `<option value="${this._escapeHtml(eid)}">${this._escapeHtml(fname ? `${fname} (${eid})` : eid)}</option>`;
          }).join('')}
        </datalist>
        <div class="sub-field-group">
          <label class="field-label">${this._t('entity_label')}</label>
          <input type="text" class="cond-entity-id" list="tseEntitiesList_${idx}" data-cidx="${idx}" value="${this._escapeHtml(entityId)}" placeholder="${this._t('entity_placeholder')}">
          ${stObj ? `<div class="hint-text">${this._escapeHtml(stObj.attributes?.friendly_name || entityId)} &bull; ${this._t('entity_current_hint')}: <strong>${this._escapeHtml(stObj.state)}</strong></div>` : ''}
        </div>
        <div class="sub-field-group">
          <label class="field-label">${this._t('entity_state_label')}</label>
          <select class="cond-entity-state-select" data-cidx="${idx}">
            ${candidates.map(st => {
              const isCurr = stObj && String(stObj.state) === st;
              const label = isCurr ? `${st} (${this._t('entity_current_hint')})` : st;
              return `<option value="${this._escapeHtml(st)}" ${selectVal === st ? 'selected' : ''}>${this._escapeHtml(label)}</option>`;
            }).join('')}
            <option value="__custom__" ${selectVal === '__custom__' ? 'selected' : ''}>${this._t('entity_custom_state_option')}</option>
          </select>
        </div>
        <div class="sub-field-group cond-entity-custom-wrap" data-cidx="${idx}" style="display:${selectVal === '__custom__' ? 'block' : 'none'};">
          <label class="field-label">${this._t('entity_custom_state_label')}</label>
          <input type="text" class="cond-entity-custom-input" data-cidx="${idx}" value="${this._escapeHtml(curState)}" placeholder="e.g. active, home, playing">
        </div>
      `;
    }

    return '';
  }

  _render() {
    if (!this._data) {
      this.shadowRoot.innerHTML = `<div style="padding:40px;text-align:center;color:var(--primary-text-color,#fff);">${this._t('loading')}</div>`;
      return;
    }

    const d = this._data;
    const cfg = d.config || {};
    const rules = d.rules || [];
    const themes = this._getAllThemes();
    const modes = d.modes || ['Auto (Engine)', 'Force Light', 'Force Dark', 'Paused'];
    const isMobile = this._isMobileClient();
    const variant = d.variant || d.day_night_variant || 'light';

    const defLight = cfg.default_theme_light || cfg.default_theme_day || themes[0] || 'default';
    const defDark = cfg.default_theme_dark || cfg.default_theme_night || themes[0] || 'default';
    const defMobLight = cfg.default_theme_mobile_light || cfg.default_theme_mobile_day || defLight;
    const defMobDark = cfg.default_theme_mobile_dark || cfg.default_theme_mobile_night || defDark;

    const variantLabel = (variant === 'light' || variant === 'day')
      ? this._t('variant_light')
      : ((variant === 'dark' || variant === 'night') ? this._t('variant_dark') : this._t('variant_static'));

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          box-sizing: border-box;
          min-height: 100vh;
          background: var(--lovelace-background, var(--primary-background-color, #0f172a));
          color: var(--primary-text-color, #f8fafc);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          padding: 24px 32px 60px 32px;
        }
        .container {
          max-width: 1100px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--divider-color, rgba(148,163,184,0.22));
        }
        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .header-title h1 {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.5px;
          color: var(--primary-text-color);
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .btn {
          background: var(--ha-card-background, var(--card-background-color, rgba(30, 41, 59, 0.7)));
          color: var(--primary-text-color);
          border: 1px solid var(--divider-color, rgba(148,163,184,0.35));
          padding: 8px 16px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s ease, transform 0.1s ease;
        }
        .btn:hover {
          background: var(--primary-color, #0284c7);
          color: #fff;
        }
        .btn-primary {
          background: var(--primary-color, #0284c7);
          color: #fff;
          border: none;
        }
        .btn-danger {
          color: #ef4444;
        }
        .btn-danger:hover {
          background: #ef4444;
          color: #fff;
        }
        .grid-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .card {
          background: var(--ha-card-background, var(--card-background-color, rgba(30, 41, 59, 0.6)));
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--divider-color, rgba(148,163,184,0.22));
          border-radius: 16px;
          padding: 18px;
          box-sizing: border-box;
        }
        .card-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--secondary-text-color, #64748b);
          font-weight: 600;
          margin-bottom: 6px;
        }
        .card-val {
          font-size: 18px;
          font-weight: 700;
          color: var(--primary-text-color);
        }
        .card-sub {
          font-size: 12px;
          color: var(--secondary-text-color, #64748b);
          margin-top: 4px;
        }
        .badge-prio {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 28px 0 14px 0;
        }
        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--primary-text-color);
        }
        .rules-table {
          width: 100%;
          border-collapse: collapse;
          background: var(--ha-card-background, var(--card-background-color, rgba(30, 41, 59, 0.6)));
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--divider-color, rgba(148,163,184,0.22));
        }
        .rules-table th {
          text-align: left;
          padding: 12px 16px;
          font-size: 12px;
          font-weight: 700;
          color: var(--primary-text-color);
          border-bottom: 1px solid var(--divider-color, rgba(148,163,184,0.22));
          background: var(--secondary-background-color, rgba(148,163,184,0.12));
        }
        .rules-table td {
          padding: 12px 16px;
          font-size: 13px;
          color: var(--primary-text-color);
          border-bottom: 1px solid var(--divider-color, rgba(148,163,184,0.12));
        }
        .rules-table tr:last-child td { border-bottom: none; }

        select, input[type="text"], input[type="number"], input[type="time"] {
          background: var(--secondary-background-color, rgba(148, 163, 184, 0.14));
          color: var(--primary-text-color);
          border: 1px solid var(--divider-color, rgba(148,163,184,0.35));
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 13px;
          box-sizing: border-box;
        }
        .switch-toggle {
          position: relative;
          display: inline-block;
          width: 38px;
          height: 22px;
        }
        .switch-toggle input { opacity: 0; width: 0; height: 0; }
        .slider {
          position: absolute; cursor: pointer; inset: 0;
          background-color: rgba(148,163,184,0.45);
          transition: .3s; border-radius: 22px;
        }
        .slider:before {
          position: absolute; content: ""; height: 16px; width: 16px;
          left: 3px; bottom: 3px; background-color: white;
          transition: .3s; border-radius: 50%;
        }
        input:checked + .slider { background-color: var(--primary-color, #0284c7); }
        input:checked + .slider:before { transform: translateX(16px); }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.65);
          backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
        }
        .modal-box {
          background: var(--card-background-color, var(--ha-card-background, #1e293b));
          color: var(--primary-text-color);
          border: 1px solid var(--divider-color, rgba(148,163,184,0.35));
          border-radius: 20px;
          width: 92%; max-width: 680px;
          padding: 24px; box-sizing: border-box;
          max-height: 90vh; overflow-y: auto;
          box-shadow: 0 24px 60px rgba(0,0,0,0.45);
        }
        .form-row {
          margin-bottom: 14px;
        }
        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 5px;
          color: var(--primary-text-color);
        }
        .form-row select, .form-row input,
        .sub-field-group select, .sub-field-group input {
          width: 100%; box-sizing: border-box;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .cond-block {
          background: var(--secondary-background-color, rgba(148,163,184,0.1));
          border: 1px solid var(--divider-color, rgba(148,163,184,0.28));
          border-radius: 12px;
          padding: 14px;
          margin-bottom: 12px;
        }
        .cond-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }
        .sub-field-group {
          margin-top: 10px;
        }
        .pill-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .cond-pill {
          background: var(--ha-card-background, var(--card-background-color, rgba(30, 41, 59, 0.5)));
          color: var(--primary-text-color);
          border: 1px solid var(--divider-color, rgba(148,163,184,0.35));
          border-radius: 8px;
          padding: 5px 10px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .cond-pill.active {
          background: var(--primary-color, #0284c7);
          color: #ffffff;
          border-color: var(--primary-color, #0284c7);
          font-weight: 600;
        }
        .hint-text {
          font-size: 11.5px;
          color: var(--secondary-text-color, #64748b);
          margin-top: 4px;
        }
      </style>

      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="header-title">
            <ha-icon icon="mdi:palette-swatch-outline" style="--mdc-icon-size:32px;color:var(--primary-color,#38bdf8);"></ha-icon>
            <div>
              <h1>${this._t('title')}</h1>
              <div style="font-size:12px;color:var(--secondary-text-color,#64748b);">
                ${this._t('subtitle')}
              </div>
            </div>
          </div>
          <div class="header-actions">
            <select id="selGlobalMode">
              ${modes.map(m => `<option value="${this._escapeHtml(m)}" ${m === d.mode ? 'selected' : ''}>${this._escapeHtml(this._getModeDisplay(m))}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Status Cards -->
        <div class="grid-cards">
          <div class="card">
            <div class="card-label">${this._t('active_desktop_theme')}</div>
            <div class="card-val">${this._escapeHtml(d.active_theme_desktop || d.active_theme || 'default')}</div>
            <div class="card-sub">${this._t('rule_prefix')}: ${this._escapeHtml(d.active_rule_name)} (${this._t('prio_short')} ${d.priority})</div>
          </div>
          <div class="card">
            <div class="card-label">${this._t('active_mobile_theme')}</div>
            <div class="card-val">${this._escapeHtml(d.active_theme_mobile || d.active_theme || 'default')}</div>
            <div class="card-sub">${isMobile ? this._t('device_is_mobile') : this._t('device_is_desktop')}</div>
          </div>
          <div class="card">
            <div class="card-label">${this._t('sun_and_variant')}</div>
            <div class="card-val">${this._escapeHtml(variantLabel)} (${d.sun?.elevation?.toFixed(1) || 0}°)</div>
            <div class="card-sub">${this._t('status')}: ${this._escapeHtml(d.sun?.state || 'unknown')}</div>
          </div>
          <div class="card">
            <div class="card-label">${this._t('live_transition')}</div>
            <div class="card-val">${cfg.transition_enabled !== false ? this._t('enabled') : this._t('disabled')}</div>
            <div class="card-sub">${this._t('duration')}: ${cfg.transition_duration || 800}ms</div>
          </div>
        </div>

        <!-- Standard Profile -->
        <div class="card" style="margin-bottom:24px;">
          <div style="font-weight:700;font-size:15px;margin-bottom:12px;">${this._t('default_themes_title')}</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:14px;">
            <div>
              <label class="field-label">${this._t('desktop_light')}</label>
              <select id="selDefLight" style="width:100%;">
                ${themes.map(t => `<option value="${this._escapeHtml(t)}" ${t === defLight ? 'selected' : ''}>${this._escapeHtml(t)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="field-label">${this._t('desktop_dark')}</label>
              <select id="selDefDark" style="width:100%;">
                ${themes.map(t => `<option value="${this._escapeHtml(t)}" ${t === defDark ? 'selected' : ''}>${this._escapeHtml(t)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="field-label">${this._t('mobile_light')}</label>
              <select id="selDefMobLight" style="width:100%;">
                ${themes.map(t => `<option value="${this._escapeHtml(t)}" ${t === defMobLight ? 'selected' : ''}>${this._escapeHtml(t)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="field-label">${this._t('mobile_dark')}</label>
              <select id="selDefMobDark" style="width:100%;">
                ${themes.map(t => `<option value="${this._escapeHtml(t)}" ${t === defMobDark ? 'selected' : ''}>${this._escapeHtml(t)}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- Rules Section -->
        <div class="section-header">
          <div class="section-title">${this._t('rules_section_title')}</div>
          <button class="btn btn-primary" id="btnAddRule">
            <ha-icon icon="mdi:plus" style="--mdc-icon-size:16px;"></ha-icon> ${this._t('add_rule')}
          </button>
        </div>

        <table class="rules-table">
          <thead>
            <tr>
              <th style="width:50px;">${this._t('col_active')}</th>
              <th style="width:70px;">${this._t('col_prio')}</th>
              <th>${this._t('col_name')}</th>
              <th>${this._t('col_conditions')}</th>
              <th>${this._t('col_desktop')}</th>
              <th>${this._t('col_mobile')}</th>
              <th style="width:130px;text-align:right;">${this._t('col_actions')}</th>
            </tr>
          </thead>
          <tbody>
            ${rules.length === 0 ? `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--secondary-text-color,#64748b);">${this._t('no_rules')}</td></tr>` : ''}
            ${rules.map((r, idx) => {
              const condStr = (r.conditions || []).map(c => this._formatConditionSummary(c)).join(', ') || this._t('always_active');
              const tLight = r.theme_light || r.theme_day;
              const tDark = r.theme_dark || r.theme_night;
              const tMobLight = r.theme_mobile_light || r.theme_mobile_day;
              const tMobDark = r.theme_mobile_dark || r.theme_mobile_night;
              const deskTheme = r.theme || (tLight || tDark ? `${tLight || '-'} / ${tDark || '-'}` : this._t('standard_theme'));
              const mobTheme = r.theme_mobile || (tMobLight || tMobDark ? `${tMobLight || '-'} / ${tMobDark || '-'}` : this._t('same_as_desktop'));

              return `
                <tr>
                  <td>
                    <label class="switch-toggle">
                      <input type="checkbox" class="rule-toggle" data-idx="${idx}" ${r.enabled !== false ? 'checked' : ''}>
                      <span class="slider"></span>
                    </label>
                  </td>
                  <td><span class="badge-prio">${r.priority || 0}</span></td>
                  <td><strong>${this._escapeHtml(r.name || this._t('unnamed'))}</strong></td>
                  <td style="color:var(--secondary-text-color,#64748b);">${this._escapeHtml(condStr)}</td>
                  <td>${this._escapeHtml(deskTheme)}</td>
                  <td>${this._escapeHtml(mobTheme)}</td>
                  <td style="text-align:right;white-space:nowrap;">
                    <button class="btn btn-preview-rule" data-theme="${this._escapeHtml(r.theme || tLight || tDark || '')}" title="${this._t('preview_tooltip')}" style="padding:4px 8px;">
                      <ha-icon icon="mdi:eye" style="--mdc-icon-size:14px;"></ha-icon>
                    </button>
                    <button class="btn btn-edit-rule" data-idx="${idx}" title="${this._t('edit_tooltip')}" style="padding:4px 8px;">
                      <ha-icon icon="mdi:pencil" style="--mdc-icon-size:14px;"></ha-icon>
                    </button>
                    <button class="btn btn-danger btn-del-rule" data-idx="${idx}" title="${this._t('delete_tooltip')}" style="padding:4px 8px;">
                      <ha-icon icon="mdi:delete" style="--mdc-icon-size:14px;"></ha-icon>
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Settings & Effects -->
        <div class="card" style="margin-top:30px;">
          <div style="font-weight:700;font-size:15px;margin-bottom:14px;">${this._t('advanced_settings')}</div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <label style="display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer;">
              <input type="checkbox" id="chkTransition" ${cfg.transition_enabled !== false ? 'checked' : ''}>
              <span><strong>${this._t('enable_transition')}</strong></span>
            </label>
            <div style="display:flex;align-items:center;gap:12px;font-size:13px;padding-left:26px;">
              <span>${this._t('transition_duration')}</span>
              <input type="number" id="numTransitionDuration" value="${cfg.transition_duration || 800}" min="100" max="3000" step="50" style="width:90px;"> ms
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Rule Modal -->
      ${this._showRuleModal && this._draftRule ? `
        <div class="modal-overlay" id="modalOverlay">
          <div class="modal-box">
            <h2 style="margin-top:0;font-size:18px;color:var(--primary-text-color);">
              ${this._editingRuleIndex !== null ? this._t('modal_edit_title') : this._t('modal_create_title')}
            </h2>

            <div class="grid-2" style="margin-bottom:14px;">
              <div>
                <label class="field-label">${this._t('rule_name_label')}</label>
                <input type="text" id="mRuleName" style="width:100%;" placeholder="${this._t('rule_name_placeholder')}" value="${this._escapeHtml(this._draftRule.name)}">
              </div>
              <div>
                <label class="field-label">${this._t('priority_label')}</label>
                <input type="number" id="mRulePrio" style="width:100%;" value="${this._draftRule.priority}" min="0" max="1000">
              </div>
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;margin:14px 0 8px 0;">
              <label class="field-label" style="margin:0;">${this._t('conditions_label')}</label>
              <button type="button" class="btn" id="btnAddCondition" style="padding:5px 10px;font-size:12px;">
                <ha-icon icon="mdi:plus" style="--mdc-icon-size:14px;"></ha-icon> ${this._t('add_condition')}
              </button>
            </div>

            ${this._draftRule.conditions.map((cond, cIdx) => `
              <div class="cond-block" data-cidx="${cIdx}">
                <div class="cond-header">
                  <select class="cond-type-select" data-cidx="${cIdx}" style="flex:1;">
                    <option value="weather" ${cond.type === 'weather' ? 'selected' : ''}>${this._t('cond_weather')}</option>
                    <option value="time" ${cond.type === 'time' ? 'selected' : ''}>${this._t('cond_time')}</option>
                    <option value="date_range" ${cond.type === 'date_range' ? 'selected' : ''}>${this._t('cond_date_range')}</option>
                    <option value="weekday" ${cond.type === 'weekday' ? 'selected' : ''}>${this._t('cond_weekday')}</option>
                    <option value="season" ${cond.type === 'season' ? 'selected' : ''}>${this._t('cond_season')}</option>
                    <option value="sun" ${cond.type === 'sun' ? 'selected' : ''}>${this._t('cond_sun')}</option>
                    <option value="entity_state" ${cond.type === 'entity_state' ? 'selected' : ''}>${this._t('cond_entity_state')}</option>
                  </select>
                  ${this._draftRule.conditions.length > 1 ? `
                    <button type="button" class="btn btn-danger btn-remove-cond" data-cidx="${cIdx}" style="padding:6px 10px;font-size:12px;">
                      <ha-icon icon="mdi:close" style="--mdc-icon-size:14px;"></ha-icon>
                    </button>
                  ` : ''}
                </div>
                ${this._renderConditionFields(cond, cIdx)}
              </div>
            `).join('')}

            <div class="grid-2" style="margin-top:16px;margin-bottom:18px;">
              <div>
                <label class="field-label">${this._t('theme_desktop')}</label>
                <select id="mThemeDesktop" style="width:100%;">
                  ${themes.map(t => `<option value="${this._escapeHtml(t)}" ${t === this._draftRule.theme ? 'selected' : ''}>${this._escapeHtml(t)}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="field-label">${this._t('theme_mobile')}</label>
                <select id="mThemeMobile" style="width:100%;">
                  <option value="" ${!this._draftRule.theme_mobile ? 'selected' : ''}>${this._t('same_as_desktop')}</option>
                  ${themes.map(t => `<option value="${this._escapeHtml(t)}" ${t === this._draftRule.theme_mobile ? 'selected' : ''}>${this._escapeHtml(t)}</option>`).join('')}
                </select>
              </div>
            </div>

            <div style="display:flex;justify-content:flex-end;gap:10px;">
              <button class="btn" id="btnCancelModal">${this._t('cancel')}</button>
              <button class="btn btn-primary" id="btnSaveRuleModal">${this._t('save_rule')}</button>
            </div>
          </div>
        </div>
      ` : ''}
    `;

    this._attachEvents();
  }

  _syncDraftMetaFromInputs() {
    if (!this._draftRule) return;
    const root = this.shadowRoot;
    const nameEl = root.getElementById('mRuleName');
    const prioEl = root.getElementById('mRulePrio');
    const tDeskEl = root.getElementById('mThemeDesktop');
    const tMobEl = root.getElementById('mThemeMobile');

    if (nameEl) this._draftRule.name = nameEl.value;
    if (prioEl) this._draftRule.priority = parseInt(prioEl.value, 10) || 0;
    if (tDeskEl) this._draftRule.theme = tDeskEl.value;
    if (tMobEl) this._draftRule.theme_mobile = tMobEl.value;
  }

  _attachEvents() {
    const root = this.shadowRoot;

    // Global Mode Select
    const selMode = root.getElementById('selGlobalMode');
    if (selMode) {
      selMode.onchange = () => this._setMode(selMode.value);
    }

    // Default themes change
    ['selDefLight', 'selDefDark', 'selDefMobLight', 'selDefMobDark'].forEach(id => {
      const el = root.getElementById(id);
      if (el) {
        el.onchange = () => {
          this._saveConfig({
            default_theme_light: root.getElementById('selDefLight')?.value,
            default_theme_dark: root.getElementById('selDefDark')?.value,
            default_theme_mobile_light: root.getElementById('selDefMobLight')?.value,
            default_theme_mobile_dark: root.getElementById('selDefMobDark')?.value,
          });
        };
      }
    });

    // Toggles for transition, sidebar
    const chkTrans = root.getElementById('chkTransition');
    if (chkTrans) {
      chkTrans.onchange = () => this._saveConfig({ transition_enabled: chkTrans.checked });
    }
    const numDur = root.getElementById('numTransitionDuration');
    if (numDur) {
      numDur.onchange = () => this._saveConfig({ transition_duration: parseInt(numDur.value, 10) || 800 });
    }

    // Rules enable/disable toggle
    root.querySelectorAll('.rule-toggle').forEach(chk => {
      chk.onchange = () => {
        const idx = parseInt(chk.getAttribute('data-idx'), 10);
        const rList = [...(this._data.rules || [])];
        if (rList[idx]) {
          rList[idx].enabled = chk.checked;
          this._saveRules(rList);
        }
      };
    });

    // Edit rule button
    root.querySelectorAll('.btn-edit-rule').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        this._openRuleModal(idx);
      };
    });

    // Delete rule button
    root.querySelectorAll('.btn-del-rule').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        if (confirm(this._t('confirm_delete'))) {
          const rList = [...(this._data.rules || [])];
          rList.splice(idx, 1);
          this._saveRules(rList);
        }
      };
    });

    // Preview rule button
    root.querySelectorAll('.btn-preview-rule').forEach(btn => {
      btn.onclick = () => {
        const t = btn.getAttribute('data-theme');
        if (t) this._preview(t);
      };
    });

    // Open add modal
    const btnAdd = root.getElementById('btnAddRule');
    if (btnAdd) {
      btnAdd.onclick = () => this._openRuleModal(null);
    }

    // Modal events
    if (this._showRuleModal && this._draftRule) {
      const closeModal = () => {
        this._showRuleModal = false;
        this._draftRule = null;
        this._editingRuleIndex = null;
        this._render();
      };

      root.getElementById('btnCancelModal')?.addEventListener('click', closeModal);
      root.getElementById('modalOverlay')?.addEventListener('click', (e) => {
        if (e.target.id === 'modalOverlay') closeModal();
      });

      root.getElementById('btnAddCondition')?.addEventListener('click', () => {
        this._syncDraftMetaFromInputs();
        this._draftRule.conditions.push(this._defaultConditionForType('weather'));
        this._render();
      });

      root.querySelectorAll('.btn-remove-cond').forEach(btn => {
        btn.onclick = () => {
          this._syncDraftMetaFromInputs();
          const cIdx = parseInt(btn.getAttribute('data-cidx'), 10);
          this._draftRule.conditions.splice(cIdx, 1);
          this._render();
        };
      });

      root.querySelectorAll('.cond-type-select').forEach(sel => {
        sel.onchange = () => {
          this._syncDraftMetaFromInputs();
          const cIdx = parseInt(sel.getAttribute('data-cidx'), 10);
          this._draftRule.conditions[cIdx] = this._defaultConditionForType(sel.value);
          this._render();
        };
      });

      // Weather controls
      root.querySelectorAll('.cond-weather-entity').forEach(sel => {
        sel.onchange = () => {
          this._syncDraftMetaFromInputs();
          const cIdx = parseInt(sel.getAttribute('data-cidx'), 10);
          if (sel.value) this._draftRule.conditions[cIdx].entity_id = sel.value;
          else delete this._draftRule.conditions[cIdx].entity_id;
          const candidates = this._getWeatherStatesForEntity(sel.value);
          if (candidates.length > 0 && !candidates.includes(this._draftRule.conditions[cIdx].states)) {
            this._draftRule.conditions[cIdx].states = candidates[0];
          }
          this._render();
        };
      });

      root.querySelectorAll('.cond-weather-val').forEach(sel => {
        sel.onchange = () => {
          const cIdx = parseInt(sel.getAttribute('data-cidx'), 10);
          const customWrap = root.querySelector(`.cond-weather-custom-wrap[data-cidx="${cIdx}"]`);
          if (sel.value === '__custom__') {
            if (customWrap) customWrap.style.display = 'block';
            const customInp = root.querySelector(`.cond-weather-custom-input[data-cidx="${cIdx}"]`);
            this._draftRule.conditions[cIdx].states = customInp ? customInp.value.trim().toLowerCase() : '';
          } else {
            if (customWrap) customWrap.style.display = 'none';
            this._draftRule.conditions[cIdx].states = sel.value;
          }
        };
      });

      root.querySelectorAll('.cond-weather-custom-input').forEach(inp => {
        inp.oninput = () => {
          const cIdx = parseInt(inp.getAttribute('data-cidx'), 10);
          this._draftRule.conditions[cIdx].states = inp.value.trim().toLowerCase();
        };
      });

      // Time controls
      root.querySelectorAll('.cond-time-after').forEach(inp => {
        inp.onchange = () => {
          const cIdx = parseInt(inp.getAttribute('data-cidx'), 10);
          this._draftRule.conditions[cIdx].after = inp.value;
        };
      });
      root.querySelectorAll('.cond-time-before').forEach(inp => {
        inp.onchange = () => {
          const cIdx = parseInt(inp.getAttribute('data-cidx'), 10);
          this._draftRule.conditions[cIdx].before = inp.value;
        };
      });

      // Date range controls
      root.querySelectorAll('.cond-date-start').forEach(inp => {
        inp.onchange = () => {
          const cIdx = parseInt(inp.getAttribute('data-cidx'), 10);
          this._draftRule.conditions[cIdx].start_date = inp.value.trim();
        };
      });
      root.querySelectorAll('.cond-date-end').forEach(inp => {
        inp.onchange = () => {
          const cIdx = parseInt(inp.getAttribute('data-cidx'), 10);
          this._draftRule.conditions[cIdx].end_date = inp.value.trim();
        };
      });

      // Weekday pills
      root.querySelectorAll('.cond-day-pill').forEach(btn => {
        btn.onclick = () => {
          const cIdx = parseInt(btn.getAttribute('data-cidx'), 10);
          const val = btn.getAttribute('data-val');
          const cond = this._draftRule.conditions[cIdx];
          const cur = Array.isArray(cond.days)
            ? [...cond.days]
            : String(cond.days || '').split(',').map(s => s.trim()).filter(Boolean);
          const pos = cur.indexOf(val);
          if (pos >= 0) cur.splice(pos, 1);
          else cur.push(val);
          cond.days = cur;
          btn.classList.toggle('active');
        };
      });

      // Season select
      root.querySelectorAll('.cond-season-val').forEach(sel => {
        sel.onchange = () => {
          const cIdx = parseInt(sel.getAttribute('data-cidx'), 10);
          this._draftRule.conditions[cIdx].season = sel.value;
        };
      });

      // Sun controls
      root.querySelectorAll('.cond-sun-state').forEach(sel => {
        sel.onchange = () => {
          const cIdx = parseInt(sel.getAttribute('data-cidx'), 10);
          if (sel.value) this._draftRule.conditions[cIdx].state = sel.value;
          else delete this._draftRule.conditions[cIdx].state;
        };
      });
      root.querySelectorAll('.cond-sun-min').forEach(inp => {
        inp.onchange = () => {
          const cIdx = parseInt(inp.getAttribute('data-cidx'), 10);
          if (inp.value !== '') this._draftRule.conditions[cIdx].min_elevation = parseFloat(inp.value);
          else delete this._draftRule.conditions[cIdx].min_elevation;
        };
      });
      root.querySelectorAll('.cond-sun-max').forEach(inp => {
        inp.onchange = () => {
          const cIdx = parseInt(inp.getAttribute('data-cidx'), 10);
          if (inp.value !== '') this._draftRule.conditions[cIdx].max_elevation = parseFloat(inp.value);
          else delete this._draftRule.conditions[cIdx].max_elevation;
        };
      });

      // Entity State dynamic picker
      root.querySelectorAll('.cond-entity-id').forEach(inp => {
        const updateEntity = () => {
          this._syncDraftMetaFromInputs();
          const cIdx = parseInt(inp.getAttribute('data-cidx'), 10);
          const eid = inp.value.trim();
          this._draftRule.conditions[cIdx].entity_id = eid;
          const candidates = this._getEntityCandidateStates(eid);
          if (candidates.length > 0 && !candidates.includes(this._draftRule.conditions[cIdx].state)) {
            this._draftRule.conditions[cIdx].state = candidates[0];
          }
          this._render();
        };
        inp.onchange = updateEntity;
      });

      root.querySelectorAll('.cond-entity-state-select').forEach(sel => {
        sel.onchange = () => {
          const cIdx = parseInt(sel.getAttribute('data-cidx'), 10);
          const customWrap = root.querySelector(`.cond-entity-custom-wrap[data-cidx="${cIdx}"]`);
          if (sel.value === '__custom__') {
            if (customWrap) customWrap.style.display = 'block';
            const customInp = root.querySelector(`.cond-entity-custom-input[data-cidx="${cIdx}"]`);
            this._draftRule.conditions[cIdx].state = customInp ? customInp.value.trim() : '';
          } else {
            if (customWrap) customWrap.style.display = 'none';
            this._draftRule.conditions[cIdx].state = sel.value;
          }
        };
      });

      root.querySelectorAll('.cond-entity-custom-input').forEach(inp => {
        inp.oninput = () => {
          const cIdx = parseInt(inp.getAttribute('data-cidx'), 10);
          this._draftRule.conditions[cIdx].state = inp.value.trim();
        };
      });

      // Save rule
      const saveRuleBtn = root.getElementById('btnSaveRuleModal');
      if (saveRuleBtn) {
        saveRuleBtn.onclick = () => {
          this._syncDraftMetaFromInputs();
          // Ensure weather custom inputs are flushed if user didn't blur before click
          root.querySelectorAll('.cond-weather-val').forEach(sel => {
            const cIdx = parseInt(sel.getAttribute('data-cidx'), 10);
            if (sel.value === '__custom__') {
              const customInp = root.querySelector(`.cond-weather-custom-input[data-cidx="${cIdx}"]`);
              if (customInp) this._draftRule.conditions[cIdx].states = customInp.value.trim().toLowerCase();
            } else {
              this._draftRule.conditions[cIdx].states = sel.value;
            }
          });

          const newRule = {
            id: this._draftRule.id || ('rule_' + Date.now()),
            name: (this._draftRule.name || '').trim() || this._t('new_rule_default'),
            priority: parseInt(this._draftRule.priority, 10) || 0,
            enabled: this._draftRule.enabled !== false,
            theme: this._draftRule.theme || 'default',
            theme_mobile: this._draftRule.theme_mobile || '',
            theme_light: this._draftRule.theme || 'default',
            theme_dark: this._draftRule.theme || 'default',
            conditions: this._draftRule.conditions,
          };
          if (this._draftRule.theme_mobile) {
            newRule.theme_mobile_light = this._draftRule.theme_mobile;
            newRule.theme_mobile_dark = this._draftRule.theme_mobile;
          }

          const rList = [...(this._data.rules || [])];
          if (this._editingRuleIndex !== null && rList[this._editingRuleIndex]) {
            rList[this._editingRuleIndex] = newRule;
          } else {
            rList.push(newRule);
          }

          this._showRuleModal = false;
          this._draftRule = null;
          this._editingRuleIndex = null;
          this._saveRules(rList);
        };
      }
    }
  }
}

if (!customElements.get('theme-switch-engine-panel')) {
  customElements.define('theme-switch-engine-panel', ThemeSwitchEnginePanel);
}
