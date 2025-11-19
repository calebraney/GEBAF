import { attr } from '../utilities';
export const tabs = function () {
  //animation ID
  const ANIMATION_ID = 'tabs';
  //elements
  const WRAP = '[data-ix-tabs="wrap"]';
  const NEXT_BTN = '[data-ix-tabs="next"]';
  const PREV_BTN = '[data-ix-tabs="previous"]';
  const PLAY_BTN = '[data-ix-tabs="toggle"]';

  //options
  const ACTIVE_CLASS = 'is-active';
  const LOOP_CONTROLS = 'data-ix-tabs-loop-controls';
  const SLIDE_TABS = 'data-ix-tabs-slide-tabs';
  const AUTOPLAY = 'data-ix-tabs-autoplay-duration';
  const DURATION = 'data-ix-tabs-duration';
  const PAUSE_ON_HOVER = 'data-ix-tabs-pause-on-hover';
  const EASE = 'data-ix-tabs-ease';

  //select all the wrap elements
  const tabWraps = [...document.querySelectorAll(WRAP)];
  if (tabWraps.length === 0) return;
  //for each tabs elements
  tabWraps.forEach((tabWrap, componentIndex) => {
    console.log(tabWrap);
    //get options
    let loopControls = attr(true, tabWrap.getAttribute(LOOP_CONTROLS));
    let slideTabs = attr(false, tabWrap.getAttribute(SLIDE_TABS));
    let autoplay = attr(0, tabWrap.getAttribute(AUTOPLAY));
    let duration = attr(0.2, tabWrap.getAttribute(DURATION));
    let pauseOnHover = attr(false, tabWrap.getAttribute(PAUSE_ON_HOVER));
    let ease = attr('power1.out', tabWrap.getAttribute(EASE));

    //get elements
    let previousButton = tabWrap.querySelector(`${PREV_BTN} button`),
      nextButton = tabWrap.querySelector(`${NEXT_BTN} button`),
      toggleWrap = tabWrap.querySelector(PLAY_BTN),
      toggleButton = tabWrap.querySelector(`${PLAY_BTN} button`),
      buttonList = tabWrap.querySelector('.tab_button_list'),
      panelList = tabWrap.querySelector('.tab_content_list'),
      animating = false,
      canPlay = true,
      autoplayTl;

    function flattenDisplayContents(slot) {
      if (!slot) return;
      let child = slot.firstElementChild;
      while (child && child.classList.contains('u-display-contents')) {
        while (child.firstChild) {
          slot.insertBefore(child.firstChild, child);
        }
        slot.removeChild(child);
        child = slot.firstElementChild;
      }
    }
    flattenDisplayContents(buttonList);
    flattenDisplayContents(panelList);

    function removeCMSList(slot) {
      const dynList = Array.from(slot.children).find((child) =>
        child.classList.contains('w-dyn-list')
      );
      if (!dynList) return;
      const nestedItems = dynList?.querySelector('.w-dyn-items')?.children;
      if (!nestedItems) return;
      const staticWrapper = [...slot.children];
      [...nestedItems].forEach((el) => {
        const c = [...el.children].find((c) => !c.classList.contains('w-condition-invisible'));
        c && slot.appendChild(c);
      });
      staticWrapper.forEach((el) => el.remove());
    }
    removeCMSList(buttonList);
    removeCMSList(panelList);

    let buttonItems = Array.from(buttonList.children);
    let panelItems = Array.from(panelList.children);

    if (!buttonList || !panelList || !buttonItems.length || !panelItems.length) {
      console.warn('Missing elements in:', tabWrap);
      return;
    }

    panelItems.forEach((panel, i) => {
      panel.style.display = 'none';
      panel.setAttribute('role', 'tabpanel');
    });
    buttonItems.forEach((button, i) => {
      button.setAttribute('role', 'tab');
    });

    panelList.removeAttribute('role');
    buttonList.setAttribute('role', 'tablist');
    buttonItems.forEach((btn) => btn.setAttribute('role', 'tab'));
    panelItems.forEach((panel) => panel.setAttribute('role', 'tabpanel'));

    let activeIndex = 0;
    const makeActive = (index, focus = false, animate = true, pause = true) => {
      if (animating) return;
      buttonItems.forEach((btn, i) => {
        btn.classList.toggle('is-active', i === index);
        btn.setAttribute('aria-selected', i === index ? 'true' : 'false');
        btn.setAttribute('tabindex', i === index ? '0' : '-1');
      });
      panelItems.forEach((panel, i) => panel.classList.toggle('is-active', i === index));
      if (nextButton) nextButton.disabled = index === buttonItems.length - 1 && !loopControls;
      if (previousButton) previousButton.disabled = index === 0 && !loopControls;
      if (focus) buttonItems[index].focus();
      const previousPanel = panelItems[activeIndex];
      const currentPanel = panelItems[index];
      let direction = 1;
      if (activeIndex > index) direction = -1;

      if (typeof gsap !== 'undefined' && animate && activeIndex !== index) {
        if (autoplayTl && !canPlay && typeof autoplayTl.restart === 'function') {
          autoplayTl.restart();
        }
        animating = true;
        let tl = gsap.timeline({
          onComplete: () => {
            animating = false;
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
          },
          defaults: { duration: duration, ease: 'power1.out' },
        });
        if (slideTabs) {
          tl.set(currentPanel, { display: 'block', position: 'relative' });
          if (previousPanel)
            tl.set(previousPanel, { position: 'absolute', top: 0, left: 0, width: '100%' });
          if (previousPanel)
            tl.fromTo(previousPanel, { xPercent: 0 }, { xPercent: -120 * direction });
          tl.fromTo(currentPanel, { xPercent: 120 * direction }, { xPercent: 0 }, '<');
          if (previousPanel) tl.set(previousPanel, { display: 'none' });
        } else {
          if (previousPanel) tl.to(previousPanel, { opacity: 0 });
          if (previousPanel) tl.set(previousPanel, { display: 'none' });
          tl.set(currentPanel, { display: 'block' });
          tl.fromTo(currentPanel, { opacity: 0 }, { opacity: 1 });
        }
      } else {
        if (previousPanel) previousPanel.style.display = 'none';
        if (currentPanel) currentPanel.style.display = 'block';
      }
      buttonList.scrollTo({ left: buttonItems[index].offsetLeft, behavior: 'smooth' });
      activeIndex = index;
    };

    makeActive(0, false, false);

    const updateIndex = (delta, focus = false, pause = true) =>
      makeActive(
        (activeIndex + delta + buttonItems.length) % buttonItems.length,
        focus,
        true,
        pause
      );
    nextButton?.addEventListener('click', () => updateIndex(1));
    previousButton?.addEventListener('click', () => updateIndex(-1));

    buttonItems.forEach((btn, index) => {
      let tabId = tabWrap.getAttribute('data-tab-component-id');
      tabId = tabId ? tabId.toLowerCase().replaceAll(' ', '-') : componentIndex + 1;
      let itemId = btn.getAttribute('data-tab-item-id');
      itemId = itemId ? itemId.toLowerCase().replaceAll(' ', '-') : index + 1;

      btn.setAttribute('id', 'tab-button-' + tabId + '-' + itemId);
      btn.setAttribute('aria-controls', 'tab-panel-' + tabId + '-' + itemId);
      panelItems[index]?.setAttribute('id', 'tab-panel-' + tabId + '-' + itemId);
      panelItems[index]?.setAttribute('aria-labelledby', btn.id);

      if (new URLSearchParams(location.search).get('tab-id') === tabId + '-' + itemId)
        makeActive(index),
          (autoplay = 0),
          tabWrap.scrollIntoView({ behavior: 'smooth', block: 'start' }),
          history.replaceState(
            {},
            '',
            ((u) => (u.searchParams.delete('tab-id'), u))(new URL(location.href))
          );
      btn.addEventListener('click', () => makeActive(index));
      btn.addEventListener('keydown', (e) => {
        if (['ArrowRight', 'ArrowDown'].includes(e.key)) updateIndex(1, true);
        else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) updateIndex(-1, true);
      });
    });

    if (autoplay !== 0 && typeof gsap !== 'undefined') {
      autoplayTl = gsap.timeline({ repeat: -1 }).fromTo(
        tabWrap,
        { '--progress': 0 },
        {
          onComplete: () => updateIndex(1, false, false),
          '--progress': 1,
          ease: 'none',
          duration: autoplay,
        }
      );
      let isHovered = false,
        hasFocusInside = false,
        prefersReducedMotion = false,
        inView = true;
      function updateAuto() {
        if (prefersReducedMotion || !inView || canPlay || isHovered || hasFocusInside)
          autoplayTl.pause();
        else autoplayTl.play();
      }
      function setButton() {
        canPlay = !canPlay;
        toggleButton?.setAttribute('aria-pressed', !canPlay ? 'true' : 'false');
        toggleWrap?.classList.toggle('is-pressed', !canPlay);
        if (!canPlay) isHovered = hasFocusInside = prefersReducedMotion = false;
        updateAuto();
      }
      setButton();
      toggleButton?.addEventListener('click', function () {
        setButton();
      });
      function handleMotionChange(e) {
        prefersReducedMotion = e.matches;
        updateAuto();
        canPlay = !e.matches;
        setButton();
      }
      handleMotionChange(window.matchMedia('(prefers-reduced-motion: reduce)'));
      window
        .matchMedia('(prefers-reduced-motion: reduce)')
        .addEventListener('change', handleMotionChange);
      if (pauseOnHover)
        tabWrap.addEventListener('mouseenter', () => {
          isHovered = true;
          updateAuto();
        });
      if (pauseOnHover)
        tabWrap.addEventListener('mouseleave', () => {
          hasFocusInside = false;
          isHovered = false;
          updateAuto();
        });
      tabWrap.addEventListener('focusin', () => {
        hasFocusInside = true;
        updateAuto();
      });
      tabWrap.addEventListener('focusout', (e) => {
        if (!e.relatedTarget || !tabWrap.contains(e.relatedTarget)) {
          hasFocusInside = false;
          updateAuto();
        }
      });
      new IntersectionObserver(
        (e) => {
          inView = e[0].isIntersecting;
          updateAuto();
        },
        { threshold: 0 }
      ).observe(tabWrap);
    }
  });
};
