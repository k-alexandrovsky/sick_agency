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
const colors = [
    ['#FF5935', '#FFB800'],
    ['#46B385', '#FFEF61'],
    ['#6888B7', '#FFBFBF'],
    ['#D65858', '#DCA2A2'],
    ['#EFFF34', '#46B86D'],
];
let v_glob = 1;
const all_params = {
    sick_pane,
    gears,
    features,
};

const $ = sel=>document.querySelector(sel);

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
    const sick_w = sick_pane.el.children[0].offsetHeight*3;
    const sick_dir = apply_accel(sick_pane, sick_w);
    sick_pane.el.style.setProperty('--translate', `${sick_pane.pos}px`);
    const skew = sick_dir*(Math.abs(sick_pane.velocity*v_glob)
        - sick_pane.params.v_min) * sick_pane.params.skew_ratio;
    sick_pane.el.style.setProperty('--skew', `${skew}deg`);
    // GEARS
    apply_accel(gears, 360);
    gears.el.style.setProperty('--rotate', `${gears.pos}deg`);
    // FEATURES
    const features_w = features.el.children[0].offsetWidth/2;
    features.pos = 'override_pos' in features ? features.override_pos
        : (features.pos - features.params.velocity*v_glob + features_w)
            % features_w;
    features.el.style.setProperty('--translate', `${features.pos}px`);
    // FORM BTN LINES
    apply_accel(form_btn_lines, 360);
    form_btn_lines.el.style.setProperty('--rotate2',
        `${form_btn_lines.pos}deg`);
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
            return ()=>{ all_params[p].params = new_v; };
        };
    });
    $('#dbg-save').addEventListener('click', ()=>{
        $('#dbg-error').className = '';
        try {
            const apply_arr = params.map(p=>p());
            apply_arr.forEach(a=>a());
        } catch(e){
            $('#dbg-error').className = 'visible';
        }
    });
};

const setup_features_drag = f=>{
    const el = f.el;
    let init_x, init_pos;
    el.onmousedown = e=>{
        e.preventDefault();
        init_x = e.clientX;
        init_pos = f.pos;
        const mouse_move = _e=>{
            f.override_pos = init_pos + _e.clientX - init_x;
        };
        const mouse_up = ()=>{
            f.params.velocity = Math.abs(f.params.velocity)
                * Math.sign(init_pos - f.override_pos);
            delete f.override_pos;
            document.body.classList.remove('dragging');
            document.removeEventListener('mouseup', mouse_up);
            document.removeEventListener('mousemove', mouse_move);
        };
        document.body.classList.add('dragging');
        document.addEventListener('mousemove', mouse_move);
        document.addEventListener('mouseup', mouse_up);
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
    $('#contact_form').addEventListener('submit', e=>{
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
        alert('submitting');
    }, false);
};

window.onload = ()=>{
    sick_pane.el = $('.sick_pane');

    gears.el = $('.gears');

    features.el = $('.feature_pane');
    features.pos=features.el.children[0].offsetWidth/4;
    setup_features_drag(features);

    const logo = $('.logo');
    logo.style.setProperty('--left', `${Math.random()*25+5}vw`);
    logo.style.setProperty('--top', `${Math.random()*25+5}vh`);
    logo.style.setProperty('--rotate', `${Math.random()*30-15}deg`);

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
    document.documentElement.style.setProperty('--foreground', fg);

    setup_form();

    dbg_setup();

    setTimeout(()=>{ document.body.classList.add('before_enter'); }, 100);
    setTimeout(()=>{ document.body.classList.add('enter'); }, 200);

    requestAnimationFrame(animation_loop);
};

const apply_wheel = (f, delta)=>{
    f.velocity = Math.max(-f.params.v_max,
        Math.min(f.velocity+delta/f.params.wheel_factor, f.params.v_max));
};

document.addEventListener('wheel', e=>{
    apply_wheel(sick_pane, e.wheelDelta);
    apply_wheel(gears, e.wheelDelta);
    apply_wheel(form_btn_lines, e.wheelDelta);
});
