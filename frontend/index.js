const sick_pane = {
    pos: 0,
    velocity: 1,
    params: {
        v_min: 0.3,
        v_max: 30,
        slowdown: 0.98,
        wheel_factor: 100,
        skew_ratio: 1,
    },
};
const gears = {
    pos: 0,
    velocity: 0.4,
    params: {
        v_min: 0.4,
        v_max: 2,
        slowdown: 0.98,
        wheel_factor: 270,
    }
};
const features = {
    pos: 0,
    params: {
        velocity: 1,
    }
};
const form_btn_lines = {
    pos: 0,
    velocity: 0.1,
    params: {
        delay: 1000,
        v_min: 0.1,
        v_max: 5,
        slowdown: 0.95,
        wheel_factor: 50,
    }
};
const form_success = {
    psize: ['offsetWidth', 'offsetHeight', 'offsetWidth', 'offsetHeight'],
    pos: [0, 0, 0, 0],
    params: {velocity: 1},
};

const colors = [
    ['#FF4E27', '#FFC700'],
    ['#44A77D', '#FFEF61'],
    ['#6888B7', '#FFBFBF'],
    ['#D85454', '#F3B1B1'],
    ['#EFFF34', '#46B86D'],
];
let v_glob = 1;
const all_params = {
    sick_pane,
    gears,
    features,
    form_success,
};

const layouts = [
    ['H',
        ['sick_pane'],
        ['V',
            ['H',
                ['splash', 2],
                ['V',
                    ['gears', 1],
                    ['description', 2],
                ],
            ],
            ['feature_pane'],
        ],
    ],
    ['H',
        ['V',
            ['sick_pane'],
            ['H',
                ['V',
                    ['description', 1],
                    ['gears', 1],
                ],
                ['splash', 2]
            ]
        ],
        ['feature_pane'],
    ],
    ['H',
        ['feature_pane'],
        ['H',
            ['V',
                ['H',
                    ['description', 2],
                    ['gears', 1, 'horizontal'],
                ],
                ['splash', 2],
            ],
            ['sick_pane'],
        ],
    ],
    ['H',
        ['V',
            ['H',
                ['splash', 2],
                ['V',
                    ['description', 2],
                    ['gears', 3],
                ],
            ],
            ['sick_pane'],
        ],
        ['feature_pane'],
    ],
    ['H',
        ['sick_pane'],
        ['V',
            ['feature_pane'],
            ['H',
                ['V',
                    ['gears', 2],
                    ['description', 3],
                ],
                ['splash', 2]
            ],
        ],
    ],
];
const mobile_layouts = [
    ['V',
        ['H',
            ['sick_pane'],
            ['V',
                ['feature_pane'],
                ['V',
                    ['description', 1],
                    ['gears', 1, 'horizontal'],
                ],
            ],
            2,
        ],
        ['splash', 1],
    ],
    ['V',
        ['splash', 1],
        ['H',
            ['V',
                ['V',
                    ['description', 1],
                    ['gears', 1, 'horizontal'],
                ],
                ['feature_pane'],
            ],
            ['sick_pane'],
            2,
        ],
    ],
    ['V',
        ['sick_pane'],
        ['V',
            ['splash', 1],
            ['H',
                ['V',
                    ['gears', 1, 'horizontal'],
                    ['description', 1],
                ],
                ['feature_pane'],
                2
            ],
        ],
    ],
];

const IS_MOBILE = window.matchMedia('(max-width: 767px)').matches;

const $ = sel=>document.querySelector(sel);
const $$ = sel=>[...document.querySelectorAll(sel)];
const hex_to_rgb = hex=>{
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [...result].slice(1).map(h=>parseInt(h, 16));
};
const clamp = (min, v, max)=>Math.max(min, Math.min(v, max));

const init_layout = ()=>{
    const items = $$('[data-item]')
        .reduce((o, e)=>(o[e.getAttribute('data-item')] = e, o), {});
    const apply_flex = (n, flex)=>{
        if (flex)
            n.style.setProperty('flex', `${flex} ${flex} 0`);
        else
            n.style.removeProperty('flex');
        return n;
    };
    const process_layout = (node, type, child1, child2, flex=1)=>{
        const process_child = child=>{
            if (/[VH]/.test(child[0])) {
                const layout = node.appendChild(document.createElement('div'));
                layout.classList.add('layout');
                process_layout(layout, ...child);
            } else {
                const [key, flex, variant] = child;
                const child_n = node.appendChild(apply_flex(items[key], flex));
                if (variant)
                    child_n.setAttribute('data-variant', variant);
                else
                    child_n.removeAttribute('data-variant');
            }
        };
        node.classList.toggle('vertical', type==='V');
        node.classList.toggle('horizontal', type==='H');
        apply_flex(node, flex);
        process_child(child1);
        const handle = node.appendChild(document.createElement('div'));
        handle.classList.add('handle');
        process_child(child2);
    };
    for (const k in items)
        items[k].remove();
    const main_layout = $('[data-layout="main"]');
    [...main_layout.children].forEach(c=>c.remove());
    const qs_layout = new URL(location.href).searchParams.get('layout');
    const _layouts = IS_MOBILE ? mobile_layouts : layouts;
    const selected_idx = qs_layout ? (+qs_layout) % _layouts.length
        : Math.floor(Math.random()*_layouts.length);
    process_layout(main_layout, ..._layouts[selected_idx]);
};

let tm_start = Date.now();
const apply_accel = (f, period)=>{
    if (f.params.delay && Date.now()-tm_start<f.params.delay)
        return;
    f.pos=(f.pos - f.velocity*v_glob + period) % period;
    const dir = Math.sign(f.velocity);
    f.velocity = dir * Math.max(f.params.v_min,
        Math.abs(f.velocity)*f.params.slowdown);
    return dir;
};

const animation_loop = ()=>{
    // THIS IS SICK
    const sick_period = sick_pane.el.children[0][sick_pane.el.parentElement
        .parentElement.classList.contains('horizontal')
            ? 'offsetHeight' : 'offsetWidth'];
    const sick_dir = apply_accel(sick_pane, sick_period*4);
    sick_pane.el.style.setProperty('--offset', `${sick_period*4}px`);
    sick_pane.el.style.setProperty('--translate', `${sick_pane.pos}px`);
    const skew = sick_dir*(Math.abs(sick_pane.velocity*v_glob)
        - sick_pane.params.v_min) * sick_pane.params.skew_ratio;
    sick_pane.el.style.setProperty('--skew', `${skew}deg`);
    // GEARS
    apply_accel(gears, 360);
    gears.el.style.setProperty('--rotate', `${gears.pos}deg`);
    // FEATURES
    const features_size_prop = features.el.parentElement.classList
        .contains('horizontal') ? 'offsetHeight' : 'offsetWidth';
    const features_size = features.el.children[0][features_size_prop]/2;
    features.pos = 'override_pos' in features ? features.override_pos
        : (features.pos - features.params.velocity*v_glob + features_size)
            % features_size;
    features.el.style.setProperty('--translate', `${features.pos}px`);
    // FORM BTN LINES
    apply_accel(form_btn_lines, 360);
    form_btn_lines.el.style.setProperty('--rotate2',
        `${form_btn_lines.pos}deg`);
    // FORM_SUCCESS
    if (document.body.classList.contains('show_form')) {
        for (let i=0; i<4; i++) {
            const el_w = form_success.el[i].children[0][form_success.psize[i]];
            form_success.pos[i] = (form_success.pos[i]
                - form_success.params.velocity + el_w) % el_w;
            form_success.el[i].style.setProperty('--translate',
                `${form_success.pos[i]}px`);
        }
    }
    // WE'RE DONE FOR THIS FRAME
    requestAnimationFrame(animation_loop);
};
const dbg_setup = ()=>{
    if (!localStorage.enable_dbg)
        return;

    const dbg = document.createElement('div');
    dbg.setAttribute('id', 'dbg');
    document.body.appendChild(dbg);
    dbg.innerHTML = `
        <div id="dbg-editors"></div>
        <div>
            <button id="dbg-move">MOVE</button>
            <label id="dbg-error">Failed to parse</label>
            <button id="dbg-save">SAVE</button>
        </div>`;
    $('#dbg').setAttribute('data-corner', localStorage.dbg_corner||1);
    $('#dbg-move').addEventListener('click', ()=>{
        const corner = +$('#dbg').getAttribute('data-corner') % 4 + 1;
        localStorage.dbg_corner = corner;
        $('#dbg').setAttribute('data-corner', corner);
    });
    const params = Object.keys(all_params).map(p=>{
        const l = document.createElement('label');
        l.innerHTML = p;
        $('#dbg-editors').appendChild(l);
        const ta = document.createElement('textarea');
        ta.style.setProperty('height',
            `${(Object.keys(all_params[p].params).length+2)*11}px`);
        ta.value = JSON.stringify(all_params[p].params, null, 2);
        $('#dbg-editors').appendChild(ta);
        return ()=>{
            const new_v = JSON.parse(ta.value);
            return ()=>{ Object.assign(all_params[p].params, new_v); };
        };
    });
    $('#dbg-save').addEventListener('click', ()=>{
        $('#dbg-error').className = '';
        try {
            const apply_arr = params.map(p=>p());
            apply_arr.forEach(a=>a());
        } catch(e) {
            $('#dbg-error').className = 'visible';
        }
    });
};

const setup_logo_drag = el=>{
    const logo_svg = el.querySelector('svg');
    let dragged = false;
    el.addEventListener('click', e=>{
        if (dragged)
            e.preventDefault();
        dragged = false;
    });
    el.onmousedown = el.ontouchstart = e=>{
        const get_pos = _e=>_e.touches
            ? [_e.touches[0].pageX, _e.touches[0].pageY]
            : [_e.clientX, _e.clientY];
        const [init_x, init_y] = get_pos(e);
        const init_left = parseFloat(el.style.getPropertyValue('left'));
        const init_top = parseFloat(el.style.getPropertyValue('top'));
        const mouse_move = _e=>{
            dragged = true;
            e.preventDefault();
            e.stopPropagation();
            el.classList.add('dragging');
            const [x, y] = get_pos(_e);
            const left = clamp(5, init_left + (x - init_x)
                / document.documentElement.clientWidth * 100, 90);
            el.style.setProperty('left', `${left}vw`);
            const top = clamp(5, init_top + (y - init_y)
                / document.documentElement.clientHeight * 100, 80);
            el.style.setProperty('top', `${top}vh`);

        };
        const mouse_up = ()=>{
            const on_squish_end = ()=>{
                logo_svg.removeEventListener('animationiteration',
                    on_squish_end);
                el.classList.remove('dragging');
            };
            logo_svg.addEventListener('animationiteration', on_squish_end);
            document.body.classList.remove('dragging');
            document.removeEventListener('mouseup', mouse_up);
            document.removeEventListener('touchend', mouse_up);
            document.removeEventListener('mousemove', mouse_move);
            document.removeEventListener('touchmove', mouse_move);
        };
        document.body.classList.add('dragging');
        document.addEventListener('mousemove', mouse_move);
        document.addEventListener('touchmove', mouse_move);
        document.addEventListener('mouseup', mouse_up);
        document.addEventListener('touchend', mouse_up);
    };
    el.ondragstart = ()=>false;
};

const setup_features_drag = f=>{
    const el = f.el;
    el.onmousedown = el.ontouchstart = e=>{
        e.preventDefault();
        e.stopPropagation();
        const get_pos = _e=>_e.touches
            ? _e.touches[0]['page'+cursor_coord]
            : _e['client'+cursor_coord];
        const init_cursor_pos = get_pos(e), init_pos = f.pos;
        const [cursor_coord, cursor_dir] = features.el.parentElement.classList
            .contains('horizontal') ? ['Y', -1] : ['X', 1];
        const mouse_move = _e=>{
            f.override_pos = init_pos
                + (get_pos(_e) - init_cursor_pos) * cursor_dir;
        };
        const mouse_up = ()=>{
            if (f.override_pos && f.override_pos!=init_pos)
            {
                f.params.velocity = Math.abs(f.params.velocity)
                    * Math.sign(init_pos - f.override_pos);
            }
            delete f.override_pos;
            document.body.classList.remove('dragging');
            document.removeEventListener('mouseup', mouse_up);
            document.removeEventListener('touchend', mouse_up);
            document.removeEventListener('mousemove', mouse_move);
            document.removeEventListener('touchmove', mouse_move);
        };
        document.body.classList.add('dragging');
        document.addEventListener('mousemove', mouse_move);
        document.addEventListener('touchmove', mouse_move);
        document.addEventListener('mouseup', mouse_up);
        document.addEventListener('touchend', mouse_up);
    };
    el.ondragstart = ()=>false;
};

const setup_form = ()=>{
    const email_re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    const required = 'This field is required', invalid_email = 'Invalid email';
    const validators = {
        name: v=>!v && required,
        email: v=>!v && required || !email_re.test(v) && invalid_email,
        comment: v=>!v && required,
    };
    const field = (f, inner='')=>$(`#contact_form [name="${f}"] ${inner}`);
    const validate = ()=>Object.entries(validators)
        .map(([f, v])=>[f, v(field(f).value)])
        .filter(([, error])=>error);
    let validate_timer;
    const check_submit = ()=>{
        clearTimeout(validate_timer);
        validate_timer = setTimeout(()=>$('.form_btn.form').classList
            .toggle('valid', !validate().length), 100);
    };
    Object.keys(validators).forEach(f=>
        field(f).addEventListener('input', check_submit));
    let anim_timer;
    $('#contact_form').addEventListener('submit', async e=>{
        clearTimeout(anim_timer);
        e.preventDefault();
        Object.keys(validators).forEach(f=>
            field(f).classList.remove('error'));
        const invalid = validate();
        invalid.forEach(([f, error])=>{
            field(f).classList.add('error');
            field(f).classList.add('animate');
            field(f, '+ .error_label > span').innerHTML = error;
        });
        setTimeout(()=>invalid.forEach(([f])=>
            field(f).classList.remove('animate')), 500);
        if (invalid.length)
            return;
        try {
            const res = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...Object.fromEntries(Object.keys(validators)
                        .map(f=>[f, field(f).value])),
                    interest: [...document.querySelectorAll(
                        '#contact_form .options input[type="checkbox"]')]
                        .filter(c=>c.checked).map(c=>c.getAttribute('name')),
                })
            });
            if (!res.ok)
                throw res;
            $('#contact_form').classList.add('submitted');
        } catch(e) {
            console.log(e);
            alert(
                `We're sorry, but something has gone very wrong.\n`+
                `Please try again`
            );
        }
    }, false);
};

const apply_wheel = (f, delta)=>{
    f.velocity = clamp(
        -f.params.v_max,
        f.velocity+delta/f.params.wheel_factor,
        f.params.v_max,
    );
};

const process_scroll = delta=>{
    apply_wheel(sick_pane, delta);
    apply_wheel(gears, delta);
    apply_wheel(form_btn_lines, delta);
};

const init_mobile = ()=>{
    document.addEventListener('touchstart', e=>{
        const get_pos = _e=>_e.touches[0].pageY;
        let cur_pos = get_pos(e);
        const touch_move = _e=>{
            const pos = get_pos(_e);
            if (Math.abs(cur_pos - pos) < 2)
                return;
            process_scroll((pos - cur_pos)*4);
            cur_pos = pos;
        };
        const touch_up = ()=>{
            document.removeEventListener('touchend', touch_up);
            document.removeEventListener('touchmove', touch_move);
        };
        document.addEventListener('touchmove', touch_move);
        document.addEventListener('touchend', touch_up);
    });
    $('.description').addEventListener('touchstart', e=>{
        e.stopPropagation();
    });
};

window.onload = ()=>{
    init_layout();

    if (IS_MOBILE)
        init_mobile();

    sick_pane.el = $('.sick_pane');

    gears.el = $('.gears');

    features.el = $('.feature_pane');
    features.pos=features.el.children[0].offsetWidth/4;
    setup_features_drag(features);

    const logo = $('.logo');
    logo.style.setProperty('left', `${Math.random()*25+5}vw`);
    logo.style.setProperty('top', `${Math.random()*25+5}vh`);
    logo.style.setProperty('--rotate', `${Math.random()*150-75}deg`);
    setup_logo_drag(logo);

    const form_btn = $('.form_btn');
    form_btn.style.setProperty('--rotate', `${Math.random()*60-30}deg`);
    form_btn.addEventListener('click', ()=>{
        document.body.classList.add('show_form');
        v_glob = 0.2;
    });
    $('#contact_form .close').addEventListener('click', e=>{
        e.preventDefault();
        document.body.classList.remove('show_form');
        v_glob = 1;
    });

    form_btn_lines.el = $('.form_btn svg');

    const [bg, fg] = colors[Math.floor(Math.random() * colors.length)];
    document.documentElement.style.setProperty('--background', bg);
    document.documentElement.style.setProperty('--background-rgb',
        `${hex_to_rgb(bg)}`);
    document.documentElement.style.setProperty('--foreground', fg);
    document.documentElement.style.setProperty('--foregroung-rgb',
        `${hex_to_rgb(fg)}`);

    form_success.el = new Array(4).fill()
        .map((_, i)=>$(`.content_submitted > div:nth-child(${i+1})`));

    setup_form();

    dbg_setup();

    setTimeout(()=>{ document.body.classList.add('before_enter'); }, 100);
    setTimeout(()=>{ document.body.classList.add('enter'); }, 200);

    requestAnimationFrame(animation_loop);
};

document.addEventListener('wheel', e=>process_scroll(e.wheelDelta));

document.documentElement.style.setProperty('--app-height',
    `${window.innerHeight}px`);
