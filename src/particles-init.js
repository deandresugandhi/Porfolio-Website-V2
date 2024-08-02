document.addEventListener('DOMContentLoaded', function () {
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 10,
                "density": {
                    "enable": true,
                    "value_area": 1000
                }
            },
            "color": {
                "value": "#e27d39"
            },
            "shape": {
                "type": "edge",
                "stroke": {
                    "width": 0,
                    "color": "#FFFFFF"
                },
                "polygon": {
                    "nb_sides": 5
                },
                "image": {
                    "src": "img/github.svg",
                    "width": 20,
                    "height": 20
                }
            },
            "opacity": {
                "value": .5,
                "random": false,
                "anim": {
                    "enable": false,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 10,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 40,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": false,
                "distance": 150,
                "color": "#ffffff",
                "opacity": 0.2,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 2,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "repulse"
                },
                "onclick": {
                    "enable": false,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 0,
                    "line_linked": {
                        "opacity": 0
                    }
                },
                "bubble": {
                    "distance": 0,
                    "size": 0,
                    "duration": 0,
                    "opacity": 0,
                    "speed": 0
                },
                "repulse": {
                    "distance": 0,
                    "duration": 0
                },
                "push": {
                    "particles_nb": 0
                },
                "remove": {
                    "particles_nb": 0
                }
            }
        },
        "retina_detect": true
    });
});