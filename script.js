(function () {
  'use strict';

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
      link.addEventListener('click', function () {
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
})();
