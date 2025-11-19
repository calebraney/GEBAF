import { attr, checkBreakpoints } from '../utilities';

export const marquee = function (gsapContext) {
  //animation ID
  const ANIMATION_ID = 'marquee';
  const WRAP = '[data-ix-marquee="wrap"]';
  const LIST = '[data-ix-marquee="list"]'; // put on the CMS LIST WRAP element (NOT THE LIST)
  const VERTICAL = 'data-ix-marquee-vertical'; // needs to be set to true if vertical
  const REVERSE = 'data-ix-marquee-reverse'; // needs to be set to true if reversed
  const DURATION = 'data-ix-marquee-duration'; //set a custom duration in seconds
  const DYNAMIC_DURATION = 'data-ix-marquee-duration-dynamic'; // set to true to make the duration dynamic per amount of items
  const DURATION_PER_ITEM = 'data-ix-marquee-duration-per-item'; // the duration per the amount of items
  const HOVER_EFFECT = 'data-ix-marquee-hover'; //option for hover effect
  const ACCELERATE_ON_HOVER = 'accelerate';
  const DECELERATE_ON_HOVER = 'decelerate';
  const PAUSE_ON_HOVER = 'pause';
  //defaults
  const DEFAULT_DURATION = 30;
  const DEFAULT_DYNAMIC_DURATION = 5;

  //for each wrap
  const wraps = document.querySelectorAll(WRAP);
  if (wraps.length === 0) return;
  wraps.forEach((wrap) => {
    //check to run on breakpoint
    let runOnBreakpoint = checkBreakpoints(wrap, ANIMATION_ID, gsapContext);
    if (runOnBreakpoint === false) return;

    const lists = [...wrap.querySelectorAll(LIST)];
    let vertical = attr(false, wrap.getAttribute(VERTICAL));
    let reverse = attr(false, wrap.getAttribute(REVERSE));
    let duration = attr(DEFAULT_DURATION, wrap.getAttribute(DURATION));
    let durationDynamic = attr(false, wrap.getAttribute(DYNAMIC_DURATION));
    let durationPerItem = attr(DEFAULT_DYNAMIC_DURATION, wrap.getAttribute(DURATION_PER_ITEM));
    // get the amount of items in the wrap
    let itemCount = lists[0].childElementCount;
    if (itemCount === 1) {
      //if there is only one item get the list element inside it and count the amount of elements in that
      itemCount = lists[0].firstElementChild.childElementCount;
    }
    //if duration is set to be dynamic make the duration based on the amount of items and the duration per item
    if (durationDynamic) {
      duration = itemCount * durationPerItem;
    }

    let hoverEffect = attr('none', wrap.getAttribute(HOVER_EFFECT));

    let direction = 1;
    if (reverse) {
      direction = -1;
    }
    let tl = gsap.timeline({
      repeat: -1,
      defaults: {
        ease: 'none',
      },
    });
    tl.fromTo(
      lists,
      {
        xPercent: 0,
        yPercent: 0,
      },
      {
        // if vertical is true move yPercent, otherwise move x percent
        xPercent: vertical ? 0 : -100 * direction,
        yPercent: vertical ? -100 * direction : 0,
        duration: duration,
      }
    );
    if (hoverEffect === ACCELERATE_ON_HOVER) {
      wrap.addEventListener('mouseenter', (event) => {
        tl.timeScale(2);
      });
      wrap.addEventListener('mouseleave', (event) => {
        tl.timeScale(1);
      });
    }
    if (hoverEffect === DECELERATE_ON_HOVER) {
      wrap.addEventListener('mouseenter', (event) => {
        tl.timeScale(0.5);
      });
      wrap.addEventListener('mouseleave', (event) => {
        tl.timeScale(1);
      });
    }
    if (hoverEffect === PAUSE_ON_HOVER) {
      wrap.addEventListener('mouseenter', (event) => {
        tl.pause();
      });
      wrap.addEventListener('mouseleave', (event) => {
        tl.play();
      });
    }
  });
};
