function get(id) {
    return parseFloat(document.getElementById(id).value);
}

function calc_I(bf, tf, tw, hw) {
    const h_total = hw + 2 * tf;
    const d = (h_total / 2) - (tf / 2);
    const I_flange = 2 * ((bf * tf ** 3) / 12 + (bf * tf) * d ** 2);
    const I_web = (tw * hw ** 3) / 12;
    return I_flange + I_web;
}

document.getElementById("has_middle_column").addEventListener("change", function () {
    const show = this.value === "yes";
    document.getElementById("middleColumnInputs").style.display = show ? "block" : "none";
});

document.getElementById("frameForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const fy = get("fy"), E = 210000, FS = get("FS"), K = get("K");
    const H = get("H"), H_total = get("H_total"), span = get("span"), spacing = get("spacing");
    const load_area = get("load_area") * 0.00981; // تحويل من كجم/م2 إلى كيلو نيوتن/م2
    const w = load_area * spacing;
    const rise = H_total - H;
    const Lr = Math.sqrt((span / 2) ** 2 + rise ** 2) * 1000;

    const rafter1 = calc_I(get("bf_r1"), get("tf_r1"), get("tw_r1"), get("hw_r1"));
    const rafter2 = calc_I(get("bf_r2"), get("tf_r2"), get("tw_r2"), get("hw_r2"));
    const I_r_avg = (rafter1 + rafter2) / 2;

    const col1 = calc_I(get("bf_c1"), get("tf_c1"), get("tw_c1"), get("hw_c1"));
    const col2 = calc_I(get("bf_c2"), get("tf_c2"), get("tw_c2"), get("hw_c2"));
    let I_c_total = col1 + col2;

    if (document.getElementById("has_middle_column").value === "yes") {
        const I_middle = calc_I(get("bf_cm"), get("tf_cm"), get("tw_cm"), get("hw_cm"));
        I_c_total += I_middle;
    }

    const y_r = (get("hw_r1") + 2 * get("tf_r1")) / 2;
    const M = (w * (Lr / 1000) ** 2) / 8;
    const sigma_r = (M * 1e6 * y_r) / I_r_avg;
    const sigma_allow = fy / FS;

    const delta = (5 * w * (Lr ** 4)) / (384 * E * 1e3 * I_r_avg);
    const delta_allow = Lr / 250;

    const P = w * (Lr / 1000) / 2 * 1e3;
    const L_col = H * 1000;
    const P_cr = (Math.PI ** 2 * E * 1e3 * I_c_total) / ((K * L_col) ** 2);
    const P_allow = P_cr / FS;

    const is_safe = sigma_r <= sigma_allow && delta <= delta_allow && P <= P_allow;

    document.getElementById("results").innerHTML = `
        <h2>النتائج:</h2>
        <p>طول الرافتـر (مم): ${Lr.toFixed(2)}</p>
        <p>العزم (kNm): ${M.toFixed(2)}</p>
        <p>الإجهاد (MPa): ${sigma_r.toFixed(2)} / المسموح: ${sigma_allow.toFixed(2)}</p>
        <p>الانحراف (مم): ${delta.toFixed(2)} / المسموح: ${delta_allow.toFixed(2)}</p>
        <p>قوة الضغط (N): ${P.toFixed(2)} / المسموح: ${P_allow.toFixed(2)}</p>
        <p><strong style="color:${is_safe ? 'green' : 'red'}">${is_safe ? "الإطار آمن" : "الإطار غير آمن"}</strong></p>
    `;
});
