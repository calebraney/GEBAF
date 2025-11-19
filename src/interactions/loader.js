import { attr, startScroll, stopScroll } from '../utilities';


export const loader = function (lenis) {
  // Animation ID
  const ANIMATION_ID = 'loader';
  // Elements
  const WRAP = '[data-ix-loader="wrap"]';
  const COLUMN = '[data-ix-loader="column"]';
  //Options
  // if '[data-ix-loader="false"]' then prevent the transition
  const EXCLUDE = 'data-ix-loader';
  //Get Elements
  const transitionWrap = document.querySelector(WRAP);
  const transitionColumns = document.querySelectorAll(COLUMN);
  if (!transitionWrap || transitionColumns.length === 0) return;

  // Page load animation
  const tlLoad = gsap.timeline();
  tlLoad.to(COLUMN, { yPercent: -100, stagger: 0.2 });
  tlLoad.set(WRAP, { display: 'none' });
    // On Back Button Tap
    window.onpageshow = function (event) {
      if (event.persisted) {
        window.location.reload();
      }
    };


};
