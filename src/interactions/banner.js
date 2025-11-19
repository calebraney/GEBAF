import { attr, checkBreakpoints } from '../utilities';

export const banner = function (gsapContext) {
  //animation ID
  const ANIMATION_ID = 'banner';
  //selectors
  const WRAP = '[data-ix-banner="wrap"]';
  const TRACK = '[data-ix-banner="track"]';
  //options
  const START = 'data-ix-banner-start';
  const END = 'data-ix-banner-end';

  //elements
  const wraps = [...document.querySelectorAll(WRAP)];
  wraps.forEach((wrap) => {
    //get elements
    const track = wrap.querySelector(TRACK);

    if (!wrap || !track) return;

    //check breakpoints and quit function if set on specific breakpoints
    let runOnBreakpoint = checkBreakpoints(wrap, ANIMATION_ID, gsapContext);
    if (runOnBreakpoint === false) return;

    let start = attr('center 80%', wrap.getAttribute(START));
    let end = attr('center 20%', wrap.getAttribute(END));

    // create main horizontal scroll timeline
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrap,
        start: start,
        end: end,
        scrub: 1,
        markers: false,
      },
    });
    tl.to(track, { xPercent: -100, ease: 'none', duration: 1 });
  });
};
