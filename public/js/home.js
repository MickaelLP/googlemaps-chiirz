
const splide = new Splide( '#carousel', {
    type   : 'loop',
    drag   : 'free',
    focus  : 'center',
    arrows : false,
    pagination : false,
    autoStart: boolean = true,
    perPage: 3,
    autoScroll: {
    speed: 0.5,
    },
} );

splide.mount(window.splide.Extensions );



  