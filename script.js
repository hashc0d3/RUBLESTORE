(function () {
  'use strict';

  // Эффект печати в заголовке героя — только когда блок в зоне видимости; при повторном входе анимация запускается снова
  (function runHeroTypewriter() {
    const heroSection = document.querySelector('.hero');
    const line1 = document.querySelector('.hero__title-line1');
    const line2 = document.querySelector('.hero__title-line2');
    const line3 = document.querySelector('.hero__title-line3');
    if (!heroSection || !line1 || !line2 || !line3) return;

    const text1 = line1.getAttribute('data-typewriter') || '';
    const text2 = line2.getAttribute('data-typewriter') || '';
    const text3 = line3.getAttribute('data-typewriter') || '';
    const charDelay = 80;
    const linePause = 400;
    const pauseBeforeRepeat = 2500;

    var isHeroInView = false;
    var heroRunId = 0;

    const cursor = document.createElement('span');
    cursor.className = 'hero__cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.textContent = '|';

    function clearHeroLines() {
      line1.textContent = '';
      line2.textContent = '';
      line3.textContent = '';
      if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
    }

    function typeInto(element, text, delay, onDone) {
      var i = 0;
      function step() {
        if (i < text.length) {
          element.textContent += text[i];
          i += 1;
          setTimeout(step, delay);
        } else if (onDone) {
          onDone();
        }
      }
      step();
    }

    function placeCursorAfter(element) {
      if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
      const next = element.nextSibling;
      if (next) element.parentNode.insertBefore(cursor, next);
      else element.parentNode.appendChild(cursor);
    }

    function runCycle(runId) {
      if (runId !== heroRunId) return;
      placeCursorAfter(line1);
      typeInto(line1, text1, charDelay, function () {
        if (runId !== heroRunId) return;
        setTimeout(function () {
          if (runId !== heroRunId) return;
          placeCursorAfter(line2);
          typeInto(line2, text2, charDelay, function () {
            if (runId !== heroRunId) return;
            setTimeout(function () {
              if (runId !== heroRunId) return;
              placeCursorAfter(line3);
              typeInto(line3, text3, charDelay, function () {
                if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
                if (runId !== heroRunId) return;
                setTimeout(function () {
                  if (runId !== heroRunId) return;
                  line1.textContent = '';
                  line2.textContent = '';
                  line3.textContent = '';
                  if (isHeroInView) runCycle(heroRunId);
                }, pauseBeforeRepeat);
              });
            }, linePause);
          });
        }, linePause);
      });
    }

    var heroObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        isHeroInView = entry.isIntersecting;
        if (entry.isIntersecting) {
          heroRunId += 1;
          clearHeroLines();
          runCycle(heroRunId);
        }
      });
    }, { rootMargin: '0px', threshold: 0.15 });
    heroObserver.observe(heroSection);
  })();

  // Эффект печати в блоке «Как это работает» — только когда блок в зоне видимости; при уходе со блока текст очищается, при повторном входе анимация запускается снова
  (function runHowTypewriter() {
    const section = document.querySelector('.how');
    if (!section) return;
    const targets = section.querySelectorAll('[data-how-typewriter]');
    if (!targets.length) return;

    const charDelay = 35;
    const pauseBetween = 250;
    const pauseBeforeRepeat = 2200;
    var howRunId = 0;

    const cursor = document.createElement('span');
    cursor.className = 'how__cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.textContent = '|';

    function placeCursorAfter(el) {
      if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
      if (el.nextSibling) el.parentNode.insertBefore(cursor, el.nextSibling);
      else el.parentNode.appendChild(cursor);
    }

    function typeInto(el, text, delay, onDone) {
      var i = 0;
      function step() {
        if (i < text.length) {
          el.textContent += text[i];
          i += 1;
          setTimeout(step, delay);
        } else if (onDone) {
          onDone();
        }
      }
      step();
    }

    function clearAll() {
      targets.forEach(function (el) { el.textContent = ''; });
    }

    function runSequence(index, runId) {
      if (runId !== howRunId) return;
      if (index >= targets.length) {
        if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
        setTimeout(function () {
          if (runId !== howRunId) return;
          clearAll();
          setTimeout(function () {
            if (runId !== howRunId) return;
            runSequence(0, howRunId);
          }, pauseBetween);
        }, pauseBeforeRepeat);
        return;
      }
      var el = targets[index];
      var text = el.getAttribute('data-how-typewriter') || '';
      placeCursorAfter(el);
      typeInto(el, text, charDelay, function () {
        if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
        if (runId !== howRunId) return;
        setTimeout(function () { runSequence(index + 1, runId); }, pauseBetween);
      });
    }

    var howObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          howRunId += 1;
          clearAll();
          if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
          runSequence(0, howRunId);
        } else {
          howRunId += 1;
          clearAll();
          if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
        }
      });
    }, { rootMargin: '0px', threshold: 0.2 });
    howObserver.observe(section);
  })();

  // Мобильное меню
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      nav.classList.toggle('nav--open');
      burger.classList.toggle('burger--open');
      document.body.classList.toggle('no-scroll', nav.classList.contains('nav--open'));
    });

    nav.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        if (href && href.indexOf('#') === 0) {
          var id = href.slice(1);
          var target = document.getElementById(id);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
        nav.classList.remove('nav--open');
        burger.classList.remove('burger--open');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  // Форма CTA — показ сообщения вместо реальной отправки
  const form = document.querySelector('.cta__form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = form.querySelector('.cta__input');
      const btn = form.querySelector('button[type="submit"]');
      if (input && btn) {
        const originalText = btn.textContent;
        btn.textContent = 'Отправлено!';
        btn.disabled = true;
        setTimeout(function () {
          btn.textContent = originalText;
          btn.disabled = false;
          input.value = '';
        }, 2000);
      }
    });
  }

  // Треугольник (отдельный блок): уменьшается при скролле до ровной линии при переходе на следующий блок
  (function initSectionAngles() {
    const sections = document.querySelectorAll('.hero, .features, .how, .cta, .prices, .map');
    if (!sections.length) return;

    function updateAngles() {
      const vh = window.innerHeight;
      const scrollY = window.scrollY || window.pageYOffset;

      sections.forEach(function (section) {
        const rect = section.getBoundingClientRect();
        const sectionBottom = rect.bottom + scrollY;
        const scrollEnd = sectionBottom;
        const scrollStart = scrollEnd - vh;

        let progress = 0;
        if (scrollY <= scrollStart) {
          progress = 0;
        } else if (scrollY >= scrollEnd) {
          progress = 1;
        } else {
          progress = (scrollY - scrollStart) / (scrollEnd - scrollStart);
        }

        const scale = 1 - progress;
        const block = section.nextElementSibling;
        if (block && block.classList.contains('section-angle-block')) {
          block.style.setProperty('--angle-scale', String(scale));
        }
      });
    }

    window.addEventListener('scroll', function () {
      requestAnimationFrame(updateAngles);
    }, { passive: true });
    window.addEventListener('resize', updateAngles);
    updateAngles();
  })();
})();
