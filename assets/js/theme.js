(function () {
    function getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function getCurrentTheme() {
        const saved = localStorage.getItem('theme');
        return (!saved || saved === 'auto') ? getSystemTheme() : saved;
    }

    function applyTheme(theme) {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }

    function toggleTheme() {
        const isDark = document.documentElement.classList.contains('dark');
        const newTheme = isDark ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    }

    function init() {
        applyTheme(getCurrentTheme());
        document.querySelectorAll('.theme-toggle').forEach(btn => {
            if (!btn.dataset.ready) {
                btn.addEventListener('click', toggleTheme);
                btn.dataset.ready = 'true';
            }
        });
    }

    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        const saved = localStorage.getItem('theme');
        if (!saved || saved === 'auto') {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
})();
