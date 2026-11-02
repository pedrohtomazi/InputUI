let activeConfig = null;

$(function () {
    window.addEventListener("message", function (event) {
        var _ = event.data;

        if (_.nuiType === "input") {
            if (_.inputAction === "open") {
                activeConfig = _;
                renderInputModal(_);
            } else if (_.inputAction === "close") {
                closeInputModal(false);
            }
        }
    });

    // Fecha dropdowns abertos ao clicar fora
    $(document).on("click", function (e) {
        if (!$(e.target).closest(".customDropdownWrap").length) {
            $(".customDropdownMenu, .timePickerMenu").fadeOut(120);
            $(".customSelectTrigger, .timeTrigger").removeClass("active");
        }
    });

    $(document).on("keydown", function (e) {
        if (!activeConfig) return;
        if (e.key === "Escape") {
            closeInputModal(true);
        } else if (e.key === "Enter" && !$("textarea").is(":focus")) {
            e.preventDefault();
            submitInputModal();
        }
    });
});

function renderInputModal(_) {
    const gameName = _.gameName || "fivem";
    const modalWidth = _.width || "md";
    const confirmText = (_.messages && _.messages.confirm) ? _.messages.confirm : "Confirmar";
    const cancelText = (_.messages && _.messages.cancel) ? _.messages.cancel : "Cancelar";

    let fieldsHtml = "";

    (_.inputs || []).forEach((field, index) => {
        const fieldId = field.id || `input_field_${index}`;
        const sizeClass = `size-${field.size || "100"}`;
        const reqStar = field.required ? `<span class="requiredStar">*</span>` : "";
        const descHtml = field.description ? `<div class="inputDescription">${field.description}</div>` : "";
        const labelHtml = field.label ? `<label class="inputLabel" for="${fieldId}"><span>${field.label}${reqStar}</span></label>` : "";

        let controlHtml = "";

        switch (field.type) {
            case "text":
            case "date":
                controlHtml = `
                    ${labelHtml}
                    ${descHtml}
                    <input 
                        type="${field.type}" 
                        id="${fieldId}" 
                        class="inputControl" 
                        placeholder="${field.placeholder || ""}" 
                        value="${field.default !== undefined ? field.default : ""}"
                        ${field.maxLength ? `maxlength="${field.maxLength}"` : ""}
                    />
                `;
                break;

            case "number":
                controlHtml = `
                    ${labelHtml}
                    ${descHtml}
                    <div class="numberWrapper">
                        <input 
                            type="number" 
                            id="${fieldId}" 
                            class="inputControl" 
                            placeholder="${field.placeholder || "0"}" 
                            value="${field.default !== undefined ? field.default : ""}"
                            ${field.min !== undefined ? `min="${field.min}"` : ""}
                            ${field.max !== undefined ? `max="${field.max}"` : ""}
                            ${field.step !== undefined ? `step="${field.step}"` : "step='1'"}
                        />
                        <div class="numStepBtns">
                            <button type="button" class="numBtn" data-target="${fieldId}" data-dir="-1">−</button>
                            <button type="button" class="numBtn" data-target="${fieldId}" data-dir="1">+</button>
                        </div>
                    </div>
                `;
                break;

            case "time":
                const defaultTime = field.default || "12:00";
                const [defH, defM] = defaultTime.split(":");
                let hoursHtml = "";
                let minsHtml = "";

                for (let h = 0; h < 24; h++) {
                    const hStr = String(h).padStart(2, "0");
                    const sel = hStr === defH ? "selected" : "";
                    hoursHtml += `<div class="timeCell hourCell ${sel}" data-val="${hStr}">${hStr}h</div>`;
                }
                for (let m = 0; m < 60; m += 5) { // Incrementos de 5 min (ou m++ para todos os minutos)
                    const mStr = String(m).padStart(2, "0");
                    const sel = mStr === defM ? "selected" : "";
                    minsHtml += `<div class="timeCell minCell ${sel}" data-val="${mStr}">${mStr}m</div>`;
                }

                controlHtml = `
                    ${labelHtml}
                    ${descHtml}
                    <div class="customDropdownWrap" data-time-id="${fieldId}">
                        <input type="hidden" id="${fieldId}" value="${defaultTime}" />
                        <div class="timeTrigger">
                            <span id="label_${fieldId}">${defaultTime}</span>
                            <svg class="triggerIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                        <div class="timePickerMenu">
                            <div class="timeColumn" data-col="h">${hoursHtml}</div>
                            <div class="timeColumn" data-col="m">${minsHtml}</div>
                        </div>
                    </div>
                `;
                break;

            case "password":
                controlHtml = `
                    ${labelHtml}
                    ${descHtml}
                    <div class="fieldWrapper">
                        <input 
                            type="password" 
                            id="${fieldId}" 
                            class="inputControl" 
                            placeholder="${field.placeholder || "••••••••"}" 
                            value="${field.default || ""}"
                            ${field.maxLength ? `maxlength="${field.maxLength}"` : ""}
                        />
                        <button type="button" class="togglePasswordBtn" data-target="${fieldId}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                    </div>
                `;
                break;

            case "textarea":
                const maxLen = field.maxLength || 500;
                const initVal = field.default || "";
                controlHtml = `
                    ${labelHtml}
                    ${descHtml}
                    <textarea 
                        id="${fieldId}" 
                        class="textareaControl" 
                        placeholder="${field.placeholder || ""}" 
                        maxlength="${maxLen}"
                        rows="${field.rows || 3}"
                    >${initVal}</textarea>
                    <div class="charCounter"><span id="count_${fieldId}">${initVal.length}</span> / ${maxLen}</div>
                `;
                break;

            case "select":
                const opts = field.options || [];
                let selectedOpt = opts.find(o => String(o.value) === String(field.default)) || opts[0] || { label: "Selecione...", value: "" };
                let optionsListHtml = "";

                opts.forEach(opt => {
                    const isSel = String(opt.value) === String(selectedOpt.value) ? "selected" : "";
                    optionsListHtml += `<div class="dropdownOption ${isSel}" data-value="${opt.value}">${opt.label}</div>`;
                });

                controlHtml = `
                    ${labelHtml}
                    ${descHtml}
                    <div class="customDropdownWrap" data-select-id="${fieldId}">
                        <input type="hidden" id="${fieldId}" value="${selectedOpt.value}" />
                        <div class="customSelectTrigger">
                            <span id="label_${fieldId}">${selectedOpt.label}</span>
                            <svg class="triggerIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                        <div class="customDropdownMenu">
                            ${optionsListHtml}
                        </div>
                    </div>
                `;
                break;

            case "range":
                const minVal = field.min !== undefined ? field.min : 0;
                const maxVal = field.max !== undefined ? field.max : 100;
                const stepVal = field.step !== undefined ? field.step : 1;
                const curVal = field.default !== undefined ? field.default : minVal;
                const unit = field.unit || "";
                controlHtml = `
                    ${labelHtml}
                    ${descHtml}
                    <div class="rangeWrapper">
                        <input 
                            type="range" 
                            id="${fieldId}" 
                            class="rangeControl" 
                            min="${minVal}" 
                            max="${maxVal}" 
                            step="${stepVal}" 
                            value="${curVal}"
                            data-unit="${unit}"
                        />
                        <span class="rangeValueBadge" id="val_${fieldId}">${curVal}${unit}</span>
                    </div>
                `;
                break;

            case "color":
            case "rgb":
                const defaultHex = formatHex(field.default || "#1FA5DE");
                const rgbObj = hexToRgb(defaultHex);
                controlHtml = `
                    ${labelHtml}
                    ${descHtml}
                    <div class="colorWrapper" id="wrap_${fieldId}">
                        <div class="colorSwatchBox">
                            <input type="color" id="${fieldId}" class="colorPickerNative" value="${defaultHex}" />
                        </div>
                        <input type="text" id="hex_${fieldId}" class="colorHexInput" value="${defaultHex}" maxlength="7" />
                        <div class="rgbInputsContainer">
                            <div class="rgbSingleBox">
                                <span class="r-label">R</span>
                                <input type="number" id="r_${fieldId}" class="rgbNumberInput" min="0" max="255" value="${rgbObj.r}" data-parent="${fieldId}" />
                            </div>
                            <div class="rgbSingleBox">
                                <span class="g-label">G</span>
                                <input type="number" id="g_${fieldId}" class="rgbNumberInput" min="0" max="255" value="${rgbObj.g}" data-parent="${fieldId}" />
                            </div>
                            <div class="rgbSingleBox">
                                <span class="b-label">B</span>
                                <input type="number" id="b_${fieldId}" class="rgbNumberInput" min="0" max="255" value="${rgbObj.b}" data-parent="${fieldId}" />
                            </div>
                        </div>
                    </div>
                `;
                break;

            case "checkbox":
                let checksHtml = "";
                (field.options || []).forEach((opt) => {
                    const checked = (Array.isArray(field.default) && field.default.includes(opt.value)) || opt.checked ? "checked" : "";
                    checksHtml += `
                        <label class="optionLabel">
                            <input type="checkbox" class="hiddenInput" name="${fieldId}" value="${opt.value}" ${checked} />
                            <span class="customCheck">
                                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </span>
                            <span>${opt.label}</span>
                        </label>
                    `;
                });
                controlHtml = `
                    ${labelHtml}
                    ${descHtml}
                    <div class="optionsList">${checksHtml}</div>
                `;
                break;

            case "radio":
                let radiosHtml = "";
                (field.options || []).forEach((opt, idx) => {
                    const checked = (field.default !== undefined && String(field.default) === String(opt.value)) || (idx === 0 && field.default === undefined) ? "checked" : "";
                    radiosHtml += `
                        <label class="optionLabel">
                            <input type="radio" class="hiddenInput" name="${fieldId}" value="${opt.value}" ${checked} />
                            <span class="customRadio"></span>
                            <span>${opt.label}</span>
                        </label>
                    `;
                });
                controlHtml = `
                    ${labelHtml}
                    ${descHtml}
                    <div class="optionsList">${radiosHtml}</div>
                `;
                break;

            case "switch":
                const isChecked = field.default === true ? "checked" : "";
                controlHtml = `
                    ${labelHtml}
                    <label class="switchRow" for="${fieldId}">
                        <span style="color: rgba(255,255,255,0.8); font-size: 0.68vw;">${field.placeholder || field.description || "Ativar opção"}</span>
                        <input type="checkbox" id="${fieldId}" class="hiddenInput" ${isChecked} />
                        <div class="switchTrack"><div class="switchThumb"></div></div>
                    </label>
                `;
                break;
        }

        fieldsHtml += `
            <div class="inputGroup ${sizeClass}" data-field-id="${fieldId}" data-type="${field.type}" data-required="${field.required ? 'true' : 'false'}">
                ${controlHtml}
            </div>
        `;
    });

    $("#nuiInput").html(`
        <div id="${gameName}">
            <div class="inputModal modal-${modalWidth}">
                <div class="modalHeader">
                    <div class="modalTitle">${_.title || "Formulário de Entrada"}</div>
                    ${_.subtitle ? `<div class="modalSubtitle">${_.subtitle}</div>` : ""}
                </div>

                <div class="modalBody">
                    ${fieldsHtml}
                </div>

                <div class="modalFooter">
                    <button type="button" class="btnModal btnCancel" id="btnInputCancel">${cancelText}</button>
                    <button type="button" class="btnModal btnConfirm" id="btnInputConfirm">${confirmText}</button>
                </div>
            </div>
        </div>
    `);

    $("#nuiInput").css("display", "block");
    bindInputEvents();
}

function bindInputEvents() {
    // Botões - e + do Input Number
    $(".numBtn").on("click", function () {
        const targetId = $(this).data("target");
        const dir = Number($(this).data("dir"));
        const input = $(`#${targetId}`);

        const step = Number(input.attr("step")) || 1;
        const min = input.attr("min") !== undefined ? Number(input.attr("min")) : -Infinity;
        const max = input.attr("max") !== undefined ? Number(input.attr("max")) : Infinity;
        let current = Number(input.val()) || 0;

        let next = current + (dir * step);
        next = Math.max(min, Math.min(max, next));
        input.val(next).trigger("input");
    });

    // Abrir/Fechar Select Customizado
    $(".customSelectTrigger").on("click", function () {
        const wrap = $(this).closest(".customDropdownWrap");
        const menu = wrap.find(".customDropdownMenu");
        const isOpen = menu.is(":visible");

        $(".customDropdownMenu, .timePickerMenu").fadeOut(120);
        $(".customSelectTrigger, .timeTrigger").removeClass("active");

        if (!isOpen) {
            $(this).addClass("active");
            menu.fadeIn(140);
        }
    });

    // Selecionar Opção do Select Customizado
    $(".dropdownOption").on("click", function () {
        const wrap = $(this).closest(".customDropdownWrap");
        const fieldId = wrap.data("select-id");
        const val = $(this).data("value");
        const label = $(this).text();

        wrap.find(".dropdownOption").removeClass("selected");
        $(this).addClass("selected");

        $(`#${fieldId}`).val(val);
        $(`#label_${fieldId}`).text(label);
        wrap.closest(".inputGroup").removeClass("has-error");

        wrap.find(".customDropdownMenu").fadeOut(120);
        wrap.find(".customSelectTrigger").removeClass("active");
    });

    // Abrir/Fechar Time Picker Customizado
    $(".timeTrigger").on("click", function () {
        const wrap = $(this).closest(".customDropdownWrap");
        const menu = wrap.find(".timePickerMenu");
        const isOpen = menu.is(":visible");

        $(".customDropdownMenu, .timePickerMenu").fadeOut(120);
        $(".customSelectTrigger, .timeTrigger").removeClass("active");

        if (!isOpen) {
            $(this).addClass("active");
            menu.css("display", "grid").hide().fadeIn(140);
        }
    });

    // Selecionar Hora ou Minuto no Time Picker Customizado
    $(".timeCell").on("click", function () {
        const col = $(this).closest(".timeColumn");
        const wrap = $(this).closest(".customDropdownWrap");
        const fieldId = wrap.data("time-id");

        col.find(".timeCell").removeClass("selected");
        $(this).addClass("selected");

        const h = wrap.find(".hourCell.selected").data("val") || "12";
        const m = wrap.find(".minCell.selected").data("val") || "00";
        const formatted = `${h}:${m}`;

        $(`#${fieldId}`).val(formatted);
        $(`#label_${fieldId}`).text(formatted);
    });

    // Mostrar / Ocultar Senha
    $(".togglePasswordBtn").on("click", function () {
        const targetId = $(this).data("target");
        const input = $(`#${targetId}`);
        const isPass = input.attr("type") === "password";
        input.attr("type", isPass ? "text" : "password");
    });

    // Contador de caracteres do Textarea
    $(".textareaControl").on("input", function () {
        const id = $(this).attr("id");
        $(`#count_${id}`).text($(this).val().length);
    });

    // Atualização do Range Slider
    $(".rangeControl").on("input", function () {
        const id = $(this).attr("id");
        const unit = $(this).data("unit") || "";
        $(`#val_${id}`).text(`${$(this).val()}${unit}`);
    });

    // Sincronização Color Picker -> HEX & RGB
    $(".colorPickerNative").on("input", function () {
        const id = $(this).attr("id");
        const hex = $(this).val().toUpperCase();
        const rgb = hexToRgb(hex);

        $(`#hex_${id}`).val(hex);
        $(`#r_${id}`).val(rgb.r);
        $(`#g_${id}`).val(rgb.g);
        $(`#b_${id}`).val(rgb.b);
    });

    // Sincronização HEX -> Color Picker & RGB
    $(".colorHexInput").on("input", function () {
        const id = $(this).attr("id").replace("hex_", "");
        let val = $(this).val();
        if (!val.startsWith("#")) val = "#" + val;

        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
            const rgb = hexToRgb(val);
            $(`#${id}`).val(val);
            $(`#r_${id}`).val(rgb.r);
            $(`#g_${id}`).val(rgb.g);
            $(`#b_${id}`).val(rgb.b);
        }
    });

    // Sincronização Inputs R, G, B -> Color Picker & HEX
    $(".rgbNumberInput").on("input", function () {
        const parentId = $(this).data("parent");
        let r = clampRgb($(`#r_${parentId}`).val());
        let g = clampRgb($(`#g_${parentId}`).val());
        let b = clampRgb($(`#b_${parentId}`).val());

        const hex = rgbToHex(r, g, b);
        $(`#${parentId}`).val(hex);
        $(`#hex_${parentId}`).val(hex);
    });

    // Remover erro ao digitar
    $(".inputControl, .textareaControl").on("input change", function () {
        $(this).closest(".inputGroup").removeClass("has-error");
    });

    // Botões de Ação
    $("#btnInputCancel").on("click", function () {
        closeInputModal(true);
    });

    $("#btnInputConfirm").on("click", function () {
        submitInputModal();
    });
}

function submitInputModal() {
    if (!activeConfig) return;

    let hasError = false;
    let results = {};

    (activeConfig.inputs || []).forEach((field, index) => {
        const fieldId = field.id || `input_field_${index}`;
        const groupEl = $(`.inputGroup[data-field-id="${fieldId}"]`);
        let value = null;

        switch (field.type) {
            case "text":
            case "password":
            case "textarea":
            case "date":
            case "time":
            case "select":
                value = $(`#${fieldId}`).val();
                if (field.required && (!value || String(value).trim() === "")) {
                    hasError = true;
                    groupEl.addClass("has-error");
                }
                break;

            case "number":
            case "range":
                const rawNum = $(`#${fieldId}`).val();
                if (field.required && (rawNum === "" || isNaN(Number(rawNum)))) {
                    hasError = true;
                    groupEl.addClass("has-error");
                }
                value = rawNum !== "" ? Number(rawNum) : null;
                break;

            case "color":
            case "rgb":
                const hexVal = $(`#${fieldId}`).val().toUpperCase();
                const r = clampRgb($(`#r_${fieldId}`).val());
                const g = clampRgb($(`#g_${fieldId}`).val());
                const b = clampRgb($(`#b_${fieldId}`).val());
                value = {
                    hex: hexVal,
                    rgb: { r, g, b },
                    rgbString: `${r}, ${g}, ${b}`
                };
                break;

            case "checkbox":
                let selectedChecks = [];
                $(`input[name="${fieldId}"]:checked`).each(function () {
                    selectedChecks.push($(this).val());
                });
                if (field.required && selectedChecks.length === 0) {
                    hasError = true;
                    groupEl.addClass("has-error");
                }
                value = selectedChecks;
                break;

            case "radio":
                value = $(`input[name="${fieldId}"]:checked`).val() || null;
                if (field.required && !value) {
                    hasError = true;
                    groupEl.addClass("has-error");
                }
                break;

            case "switch":
                value = $(`#${fieldId}`).is(":checked");
                break;
        }

        results[fieldId] = value;
    });

    if (hasError) return;

    console.log("Valores capturados pelos inputs:", results);

    if (window.invokeNative) {
        const resourceName = activeConfig.resourceName || (window.GetParentResourceName ? GetParentResourceName() : "striata_input");
        const callbackEndpoint = activeConfig.callback || "inputResult";

        $.post(`https://${resourceName}/${callbackEndpoint}`, JSON.stringify({
            action: "confirm",
            values: results
        }));
    }

    closeInputModal(false);
}

function closeInputModal(sendCancelCallback) {
    if (sendCancelCallback && activeConfig && window.invokeNative) {
        const resourceName = activeConfig.resourceName || (window.GetParentResourceName ? GetParentResourceName() : "striata_input");
        const callbackEndpoint = activeConfig.callback || "inputResult";

        $.post(`https://${resourceName}/${callbackEndpoint}`, JSON.stringify({
            action: "cancel",
            values: null
        }));
    }

    activeConfig = null;
    $("#nuiInput").html("");
    $("#nuiInput").css("display", "none");
}

function clampRgb(val) {
    let n = parseInt(val, 10);
    if (isNaN(n)) return 0;
    return Math.max(0, Math.min(255, n));
}

function formatHex(hex) {
    if (!hex || typeof hex !== "string") return "#1FA5DE";
    return hex.startsWith("#") ? hex : `#${hex}`;
}

function hexToRgb(hex) {
    const cleanHex = hex.replace("#", "");
    const bigint = parseInt(cleanHex, 16);
    if (isNaN(bigint)) return { r: 31, g: 165, b: 222 };
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("").toUpperCase();
}

// ============================================================================
// MODO DE TESTE PARA NAVEGADOR (LIVE SERVER)
// ============================================================================
$(function () {
    if (!window.invokeNative) {
        $("body").css({
            "background-image": "url('https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1920&auto=format&fit=crop')",
            "background-size": "cover",
            "background-position": "center",
            "margin": "0",
            "overflow": "hidden"
        });

        window.postMessage({
            nuiType: "input",
            inputAction: "open",
            gameName: "fivem",
            width: "lg",
            title: "Painel de Configuração",
            subtitle: "Visualização em tempo real pelo Live Server",
            messages: {
                confirm: "Confirmar",
                cancel: "Cancelar"
            },
            inputs: [
                { id: "nome", type: "text", label: "Nome da Organização", placeholder: "Ex: Mecânica Sul", size: "50", required: true },
                { id: "senha", type: "password", label: "PIN do Cofre", default: "1234", size: "50", required: true },
                
                { id: "vagas", type: "number", label: "Limite de Membros", default: 25, min: 1, max: 100, size: "25", required: true },
                { id: "categoria", type: "select", label: "Tipo de Setor", size: "50", default: "ilegal", options: [
                    { label: "Legal / Empresa", value: "legal" },
                    { label: "Organização Ilegal", value: "ilegal" },
                    { label: "Governamental / Polícia", value: "gov" }
                ]},
                { id: "horario", type: "time", label: "Horário de Pico", default: "20:00", size: "25" },

                { id: "cor_neon", type: "rgb", label: "Cor do Blip e Uniforme (RGB)", default: "#1FA5DE", size: "50" },
                { id: "imposto", type: "range", label: "Taxa da Lavagem", min: 0, max: 100, default: 30, unit: "%", size: "50" },

                { id: "permissoes", type: "checkbox", label: "Permissões do Cargo", size: "50", default: ["bau", "garagem"], options: [
                    { label: "Acessar Baú", value: "bau" },
                    { label: "Retirar Veículos", value: "garagem" },
                    { label: "Recrutar", value: "recrutar" }
                ]},
                { id: "pagamento", type: "radio", label: "Método de Cobrança", size: "50", default: "banco", options: [
                    { label: "Dinheiro Sujo", value: "sujo" },
                    { label: "Transferência Bancária", value: "banco" }
                ]},

                { id: "ativo", type: "switch", label: "Status do Painel", placeholder: "Habilitar funcionamento imediato do ponto", default: true, size: "100" },

                { id: "regras", type: "textarea", label: "Observações Internas", placeholder: "Digite os detalhes...", maxLength: 250, size: "100" }
            ]
        }, "*");
    }
});