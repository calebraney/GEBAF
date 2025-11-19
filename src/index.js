import { attr } from './utilities';
import { scrollIn } from './interactions/scroll-in';
import { marquee } from './interactions/marquee';
import { sliderComponent } from './interactions/slider';
import { tabs } from './interactions/tabs';
import { accordion } from './interactions/accordion';

document.addEventListener('DOMContentLoaded', function () {
  // Comment out for production
  console.log('Local Script');
  // register gsap plugins if available
  if (gsap.ScrollTrigger !== undefined) {
    gsap.registerPlugin(ScrollTrigger);
  }
  if (gsap.Flip !== undefined) {
    gsap.registerPlugin(Flip);
  }

  //////////////////////////////
  //Global Variables

  //////////////////////////////
  //Control Functions on page load
  const gsapInit = function () {
    let mm = gsap.matchMedia();
    mm.add(
      {
        //This is the conditions object
        isMobile: '(max-width: 767px)',
        isTablet: '(min-width: 768px)  and (max-width: 991px)',
        isDesktop: '(min-width: 992px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (gsapContext) => {
        let { isMobile, isTablet, isDesktop, reduceMotion } = gsapContext.conditions;
        //functional interactions
        accordion(gsapContext);
        marquee(gsapContext);
        sliderComponent();
        tabs();
        //conditional interactions
        if (!reduceMotion) {
          scrollIn(gsapContext);
        }
      }
    );
  };
  gsapInit();

  //reset gsap on click of reset triggers
  const scrollReset = function () {
    //selector
    const RESET_EL = '[data-ix-reset]';
    //time option
    const RESET_TIME = 'data-ix-reset-time';
    const resetScrollTriggers = document.querySelectorAll(RESET_EL);
    resetScrollTriggers.forEach(function (item) {
      item.addEventListener('click', function (e) {
        //reset scrolltrigger
        ScrollTrigger.refresh();
        //if item has reset timer reset scrolltriggers after timer as well.
        if (item.hasAttribute(RESET_TIME)) {
          let time = attr(1000, item.getAttribute(RESET_TIME));
          //get potential timer reset
          setTimeout(() => {
            ScrollTrigger.refresh();
          }, time);
        }
      });
    });
  };
  scrollReset();

  const updaterFooterYear = function () {
    // set the fs-hacks selector
    const YEAR_SELECTOR = '[data-footer-year]';
    // get the the span element
    const yearSpan = document.querySelector(YEAR_SELECTOR);
    if (!yearSpan) return;
    // get the current year
    const currentYear = new Date().getFullYear();
    // set the year span element's text to the current year
    yearSpan.innerText = currentYear.toString();
  };
  updaterFooterYear();
});
