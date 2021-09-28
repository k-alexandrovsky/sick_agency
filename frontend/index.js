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
    },
};
const features = {
    pos: 0,
    params: {
        velocity: 1,
    },
};
const form_btn = {
    pos: 0,
    hovered: false,
};
const form_btn_lines = {
    pos: 0,
    velocity: 0.1,
    scale: 1,
    params: {
        delay: 3000,
        v_min: 0.1,
        v_max: 5,
        slowdown: 0.95,
        wheel_factor: 50,
    },
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

const sick_pane_props_v = {'--size': '9.8vw', '--limits': '4:20'};
const sick_pane_props_h = {'--size': '11.2vw', '--limits': '5:30'};
const feature_pane_props_v = {'--size': '6.1vw', '--limits': '3:15'};
const feature_pane_props_h = {'--size': '8vw', '--limits': '4:20'};

const layouts = [
    ['H',
        ['sick_pane', sick_pane_props_h],
        ['V',
            ['H',
                ['splash', {flex: '2 2 0'}],
                ['V',
                    ['gears', {flex: '1 1 0'}],
                    ['description', {flex: '2 2 0'}],
                    {'--limits': '0.25:1.5'},
                ],
                {'--limits': '1:2.5'},
            ],
            ['feature_pane', feature_pane_props_v],
        ],
    ],
    ['H',
        ['V',
            ['sick_pane', sick_pane_props_v],
            ['H',
                ['V',
                    ['description', {flex: '1 1 0'}],
                    ['gears', {flex: '1 1 0'}],
                    {'--limits': '0.5:1.5'},
                ],
                ['splash', {flex: '2 2 0'}],
                {'--limits': '0.33:1'},
            ]
        ],
        ['feature_pane', feature_pane_props_h],
    ],
    ['H',
        ['V',
            ['H',
                ['splash', {flex: '2 2 0'}],
                ['V',
                    ['description', {flex: '2 2 0'}],
                    ['gears', {flex: '3 3 0'}],
                    {'--limits': '0.33:1.5'},
                ],
                {'--limits': '1:2.5'},
            ],
            ['sick_pane', sick_pane_props_v],
        ],
        ['feature_pane', feature_pane_props_h],
    ],
    ['H',
        ['sick_pane', sick_pane_props_h],
        ['V',
            ['feature_pane', feature_pane_props_v],
            ['H',
                ['V',
                    ['gears', {flex: '2 2 0'}],
                    ['description', {flex: '3 3 0'}],
                    {'--limits': '0.33:2'},
                ],
                ['splash', {flex: '2 2 0'}],
                {'--limits': '0.33:1'},
            ],
        ],
    ],
];

const sick_pane_props_m = {'--size': '20vw', '--limits': '10:30'};
const feature_pane_props_m = {'--size': '17.5vw', '--limits': '10:25'};

const mobile_layouts = [
    ['V',
        ['H',
            ['sick_pane', sick_pane_props_m],
            ['V',
                ['feature_pane', feature_pane_props_m],
                ['V',
                    ['description', {flex: '1 1 0'}],
                    ['gears', {flex: '1 1 0'}, 'horizontal'],
                    {'--limits': '0.5:2'},
                ],
            ],
            {flex: '2 2 0'},
        ],
        ['splash', {flex: '1 1 0'}],
        {'--limits': '1:3'},
    ],
    ['V',
        ['splash', {flex: '1 1 0'}],
        ['H',
            ['V',
                ['V',
                    ['description', {flex: '1 1 0'}],
                    ['gears', {flex: '1 1 0'}, 'horizontal'],
                    {'--limits': '0.5:2'},
                ],
                ['feature_pane', feature_pane_props_m],
            ],
            ['sick_pane', sick_pane_props_m],
            {flex: '2 2 0'},
        ],
        {'--limits': '0.33:1'},
    ],
    ['V',
        ['sick_pane', sick_pane_props_m],
        ['V',
            ['splash', {flex: '1 1 0'}],
            ['H',
                ['V',
                    ['gears', {flex: '1 1 0'}, 'horizontal'],
                    ['description', {flex: '1 1 0'}],
                    {'--limits': '0.5:2'},
                ],
                ['feature_pane', feature_pane_props_m],
                {flex: '2 2 0'},
            ],
            {'--limits': '0.3:0.8'},
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

const get_next_random_layout = layouts=>{
    const last_shown = +(sessionStorage.last_layout||'-1');
    let idx;
    do {
        idx = Math.floor(Math.random()*layouts.length);
    } while (idx==last_shown);
    sessionStorage.last_layout = idx;
    return idx;
};

const setup_handle_drag = (type, handle)=>{
    const [coord, size_prop] = {H: ['X', 'Width'], V: ['Y', 'Height']}[type];
    handle.onmousedown = handle.ontouchstart = e=>{
        e.preventDefault();
        e.stopPropagation();
        const get_pos = _e=>_e.touches
            ? _e.touches[0]['page'+coord]
            : _e['client'+coord];
        const init_pos = get_pos(e);
        const layout = handle.parentElement;
        const [sized_child] = [...layout.children].filter(c=>c!=handle
            && c.style.getPropertyValue('--size'));
        let mouse_move;
        if (sized_child) {
            const init_size = parseFloat(sized_child.style
                .getPropertyValue('--size'));
            const limits = (sized_child.style.getPropertyValue('--limits')
                || '-Infinity:+Infinity').split(':').map(l=>+l);
            const dir = handle.nextElementSibling==sized_child ? -1 : 1;
            mouse_move = _e=>{
                const new_size = clamp(
                    limits[0],
                    (get_pos(_e) - init_pos) * dir
                        / document.documentElement.clientWidth * 100
                        + init_size,
                    limits[1]
                );
                sized_child.style.setProperty('--size', new_size+'vw');
            };
        } else {
            const [min_ratio, max_ratio] = (handle.parentElement.style
                .getPropertyValue('--limits') || '-Infinity:+Infinity')
                    .split(':').map(l=>+l);
            const [child1, child2] = [...layout.children].filter(c=>c!=handle);
            const set_flex = (n, v)=>n.style
                .setProperty('flex', `${v} ${v} 0`);
            const size1 = child1['offset'+size_prop];
            const size2 = child2['offset'+size_prop];
            mouse_move = _e=>{
                const delta = get_pos(_e) - init_pos;
                const new_ratio = clamp(min_ratio,
                    (size1 + delta) / (size2 - delta), max_ratio);
                set_flex(child1, new_ratio > 1 ? new_ratio : 1);
                set_flex(child2, new_ratio > 1 ? 1 : 1 / new_ratio);
            };
        }
        const mouse_up = ()=>{
            document.body.style.removeProperty('cursor');
            document.removeEventListener('mouseup', mouse_up);
            document.removeEventListener('touchend', mouse_up);
            document.removeEventListener('mousemove', mouse_move);
            document.removeEventListener('touchmove', mouse_move);
        };
        document.body.style.setProperty('cursor',
            getComputedStyle(handle).cursor);
        document.addEventListener('mousemove', mouse_move);
        document.addEventListener('touchmove', mouse_move);
        document.addEventListener('mouseup', mouse_up);
        document.addEventListener('touchend', mouse_up);
    };
    handle.ondragstart = ()=>false;
};

const init_layout = ()=>{
    const items = $$('[data-item]')
        .reduce((o, e)=>(o[e.getAttribute('data-item')] = e, o), {});
    const apply_props = (n, props = {})=>new Set([
        ...Object.keys(props),
        ...(n.getAttribute('style')||'').split(';')
            .filter(Boolean).map(p=>p.split(':')[0]),
    ]).forEach(p=>{
        if (props[p])
            n.style.setProperty(p, props[p]);
        else
            n.style.removeProperty(p);
    });
    const process_layout = (node, type, child1, child2, props)=>{
        props = {flex: '1 1 0', ...props};
        const process_child = child=>{
            if (/[VH]/.test(child[0])) {
                const layout = node.appendChild(document.createElement('div'));
                layout.classList.add('layout');
                process_layout(layout, ...child);
            } else {
                const [key, props, variant] = child;
                apply_props(items[key], props);
                const child_n = node.appendChild(items[key]);
                if (variant)
                    child_n.setAttribute('data-variant', variant);
                else
                    child_n.removeAttribute('data-variant');
            }
        };
        node.classList.toggle('vertical', type==='V');
        node.classList.toggle('horizontal', type==='H');
        apply_props(node, props);
        process_child(child1);
        const handle = node.appendChild(document.createElement('div'));
        handle.classList.add('handle');
        process_child(child2);
        setup_handle_drag(type, handle);
    };
    for (const k in items)
        items[k].remove();
    const main_layout = $('[data-layout="main"]');
    [...main_layout.children].forEach(c=>c.remove());
    const qs_layout = new URL(location.href).searchParams.get('layout');
    const _layouts = IS_MOBILE ? mobile_layouts : layouts;
    const selected_idx = qs_layout
        ? (+qs_layout) % _layouts.length
        : get_next_random_layout(_layouts);
    console.log(`layout #${selected_idx}`);
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
    const features_size_prop = features.el.parentElement.parentElement
        .classList.contains('horizontal') ? 'offsetHeight' : 'offsetWidth';
    const features_size = features.el.children[0][features_size_prop]/2;
    features.pos = 'override_pos' in features ? features.override_pos
        : (features.pos - features.params.velocity*v_glob + features_size)
            % features_size;
    features.el.style.setProperty('--translate', `${features.pos}px`);
    // FORM BTN LINES
    apply_accel(form_btn_lines, 360);
    if (form_btn.hovered)
    {
        form_btn.el.style.setProperty('--rotate',
            `${form_btn.pos + (form_btn.offset - form_btn_lines.pos)*2}deg`);
        form_btn_lines.el.style.setProperty('--rotate2',
            `${form_btn_lines.pos * 3 - form_btn.offset * 2}deg`);
        form_btn_lines.el.style.setProperty('--scale',
            form_btn_lines.scale = Math.min(1.05, form_btn_lines.scale*1.005));
    } else {
        form_btn_lines.el.style.setProperty('--rotate2',
            `${form_btn_lines.pos}deg`);
        form_btn_lines.el.style.setProperty('--scale',
            form_btn_lines.scale = Math.max(1, form_btn_lines.scale*0.995));
    }
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
    let dragged = false;
    el.addEventListener('click', e=>{
        if (dragged)
            e.preventDefault();
        dragged = false;
    });
    const logo_svg = el.querySelector('svg');
    const on_squish_end = ()=>{
        logo_svg.removeEventListener('animationiteration', on_squish_end);
        el.classList.remove('dragging');
    };
    el.onmousedown = el.ontouchstart = e=>{
        e.preventDefault();
        e.stopPropagation();
        const get_pos = _e=>_e.touches
            ? [_e.touches[0].pageX, _e.touches[0].pageY]
            : [_e.clientX, _e.clientY];
        const [init_x, init_y] = get_pos(e);
        const init_left = parseFloat(el.style.getPropertyValue('left'));
        const init_top = parseFloat(el.style.getPropertyValue('top'));
        const on_wheel = _e=>{
            _e.stopPropagation();
            const old_scale = (+el.style.getPropertyValue('--scale'))||1;
            const new_scale = clamp(0.75, old_scale + _e.wheelDelta / 1000, 4);
            el.style.setProperty('--scale', new_scale);
        };
        const mouse_move = _e=>{
            dragged = true;
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
            logo_svg.addEventListener('animationiteration', on_squish_end);
            document.removeEventListener('wheel', on_wheel, {capture: true});
            document.body.classList.remove('dragging');
            document.removeEventListener('mouseup', mouse_up);
            document.removeEventListener('touchend', mouse_up);
            document.removeEventListener('mousemove', mouse_move);
            document.removeEventListener('touchmove', mouse_move);
        };
        document.addEventListener('wheel', on_wheel,
            {passive: false, capture: true});
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
        const [cursor_coord, cursor_dir] = features.el.parentElement
            .parentElement.classList.contains('horizontal')
                ? ['Y', -1] : ['X', 1];
        const get_pos = _e=>_e.touches
            ? _e.touches[0]['page'+cursor_coord]
            : _e['client'+cursor_coord];
        const init_cursor_pos = get_pos(e), init_pos = f.pos;
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
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...Object.fromEntries(Object.keys(validators)
                        .map(f=>[f, field(f).value])),
                    interest: [...document.querySelectorAll(
                        '#contact_form .options input[type="checkbox"]')]
                        .filter(c=>c.checked).map(c=>c.getAttribute('name')),
                }),
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
    features.pos=features.el.children[0].offsetWidth/2;
    setup_features_drag(features);

    const logo = $('.logo');
    logo.style.setProperty('left', `${Math.random()*25+5}vw`);
    logo.style.setProperty('top', `${Math.random()*25+5}vh`);
    logo.style.setProperty('--rotate', `${Math.random()*150-75}deg`);
    setup_logo_drag(logo);

    form_btn.el = $('.form_btn');
    form_btn.el.style.setProperty('--rotate',
        `${form_btn.pos = Math.random()*60-30}deg`);
    form_btn.el.addEventListener('mouseenter', ()=>{
        form_btn.offset = form_btn_lines.pos;
        form_btn.hovered = true;
    });
    form_btn.el.addEventListener('mouseleave', ()=>{
        form_btn.pos = form_btn.pos + (form_btn.offset - form_btn_lines.pos)*2;
        form_btn_lines.pos = form_btn_lines.pos * 3 - form_btn.offset * 2;
        form_btn.hovered = false;
    });
    form_btn.el.addEventListener('click', ()=>{
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
