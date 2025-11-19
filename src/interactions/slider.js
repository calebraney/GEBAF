import { attr } from '../utilities';

export const sliderComponent = function () {
  //animation ID
  const ANIMATION_ID = 'slider';
  // hero animation attribute
  const ATTRIBUTE = 'data-ix-slider';
  const SLIDER = "[data-ix-slider='component']";
  const NEXT = "[data-ix-slider='next']";
  const PREVIOUS = "[data-ix-slider='previous']";
  const PAGINATION = '.slider_bullet_list';
  const PAGINATION_BUTTON = 'slider_bullet_item';
  const SCROLLBAR = '.slider_scrollbar';
  const SCROLLBAR_HANDLE = 'slider_scrollbar_handle';
  //options
  const FOLLOW_FINGER = 'data-ix-slider-follow-finger';
  const MOUSEWHEEL = 'data-ix-slider-mousewheel';
  const FREE_MODE = 'data-ix-slider-free-mode';
  const SLIDE_TO_CLICKED = 'data-ix-slider-slide-to-clicked';
  const LOOP = 'data-ix-slider-loop';
  const SPEED = 'data-ix-slider-speed';
  const ACTIVE_CLASS = 'is-active';

  const sliders = document.querySelectorAll(`${SLIDER}:not(${SLIDER} ${SLIDER})`);
  sliders.forEach((component) => {
    if (component.dataset.scriptInitialized) return;
    component.dataset.scriptInitialized = 'true';

    const swiperElement = component.querySelector('.slider_element');
    const swiperWrapper = component.querySelector('.slider_list');
    if (!swiperElement || !swiperWrapper) return;

    //if a CMS list is in the slot modify the html to work with a list
    function removeCMSList(slot) {
      const dynList = Array.from(slot.children).find((child) =>
        child.classList.contains('w-dyn-list')
      );
      if (!dynList) return;
      const nestedItems = dynList?.firstElementChild?.children;
      if (!nestedItems) return;
      const staticWrapper = [...slot.children];
      [...nestedItems].forEach(
        (el) => el.firstElementChild && slot.appendChild(el.firstElementChild)
      );
      staticWrapper.forEach((el) => el.remove());
    }
    removeCMSList(swiperWrapper);

    [...swiperWrapper.children].forEach((el) => el.classList.add('swiper-slide'));
    const followFinger = attr(true, swiperElement.getAttribute(FOLLOW_FINGER));
    const freeMode = attr(true, swiperElement.getAttribute(FREE_MODE));
    const mousewheel = attr(true, swiperElement.getAttribute(MOUSEWHEEL));
    const slideToClickedSlide = attr(false, swiperElement.getAttribute(SLIDE_TO_CLICKED));
    const loopMode = attr(false, swiperElement.getAttribute(LOOP));
    const speed = attr(600, swiperElement.getAttribute(SPEED));

    //create slider instance
    new Swiper(swiperElement, {
      slidesPerView: 'auto',
      followFinger: followFinger,
      freeMode: freeMode,
      slideToClickedSlide: slideToClickedSlide,
      centeredSlides: false,
      autoHeight: false,
      loop: loopMode,
      //   loopAdditionalSlides: 0,
      speed: speed,
      mousewheel: {
        enabled: mousewheel,
        forceToAxis: true,
      },
      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },
      navigation: {
        nextEl: component.querySelector(NEXT),
        prevEl: component.querySelector(PREVIOUS),
      },
      pagination: {
        el: component.querySelector(`${PAGINATION}`),
        bulletActiveClass: ACTIVE_CLASS,
        bulletClass: `${PAGINATION_BUTTON}`,
        bulletElement: 'button',
        clickable: true,
      },
      scrollbar: {
        el: component.querySelector(SCROLLBAR),
        draggable: true,
        dragClass: SCROLLBAR_HANDLE,
        snapOnRelease: true,
      },
      slideActiveClass: ACTIVE_CLASS,
      slideDuplicateActiveClass: ACTIVE_CLASS,
    });
  });
};
