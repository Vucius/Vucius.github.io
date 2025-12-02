// 滚动文字动画效果
window.addEventListener('DOMContentLoaded', function() {
    function createScrollText(container, text) {
        const spans = Array.from(text).map(function(char) {
            const span = document.createElement("span");
            span.className = "inline-block transition-opacity duration-500 ease-out";
            span.style.opacity = "0.2";
            span.textContent = char;
            return span;
        });
        
        container.innerHTML = '';
        container.append(...spans);

        return function() {
            const rect = container.getBoundingClientRect();
            const top = rect.top;
            const vh = window.innerHeight;
            
            let progress = 0;
            if (top < vh && top > vh * 0.3) {
                progress = (vh - top) / (vh * 0.7);
            } else if (top <= vh * 0.3) {
                progress = 1;
            }
            
            const visibleChars = Math.round(progress * spans.length);
            spans.forEach(function(span, i) {
                span.style.opacity = i < visibleChars ? "0.9" : "0.2";
            });
        };
    }

    const scrollElements = document.querySelectorAll('.scroll-text');
    const updateFunctions = [];
    
    scrollElements.forEach(function(el) {
        if (el.dataset.text) {
            const updateFn = createScrollText(el, el.dataset.text);
            updateFunctions.push(updateFn);
        }
    });

    let ticking = false;
    function update() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function() {
            updateFunctions.forEach(function(fn) {
                fn();
            });
            ticking = false;
        });
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
});
